"""Reads the executions of the two agent flows through the n8n API and resumes waiting executions (Approve / Reject)."""
from __future__ import annotations
import datetime as dt, json

import httpx


class N8nBackend:
    def __init__(self, settings):
        self.s = settings
        if not (settings.n8n_url and settings.n8n_api_key):
            raise RuntimeError('BACKEND=n8n needs N8N_URL and N8N_API_KEY in .env')
        self.workflows = {'aris': settings.n8n_workflow_aris, 'zero': settings.n8n_workflow_zero}

    def _get(self, path: str, params: dict) -> dict:
        r = httpx.get(f'{self.s.n8n_url}/api/v1{path}', params=params, timeout=60,
                      headers={'X-N8N-API-KEY': self.s.n8n_api_key, 'accept': 'application/json'})
        if r.status_code >= 400:
            raise RuntimeError(f'n8n API {r.status_code}: {r.text[:200]}')
        return r.json()

    def executions(self, agent: str, limit: int = 20) -> list[dict]:
        wf = self.workflows.get(agent)
        if not wf:
            raise RuntimeError(f'N8N_WORKFLOW_{agent.upper()} is not set in .env')
        out, cursor = [], None
        while len(out) < limit:
            params = {'workflowId': wf, 'includeData': 'true', 'limit': min(100, limit - len(out))}
            if cursor:
                params['cursor'] = cursor
            j = self._get('/executions', params)
            out += j.get('data') or []
            cursor = j.get('nextCursor')
            if not cursor:
                break
        return out

    @staticmethod
    def to_run_and_steps(agent: str, e: dict) -> tuple[dict, list[dict]]:
        """One n8n execution -> the (run, steps) shape the portal view and the exports use."""
        data = e.get('data') or {}
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except ValueError:
                data = {}
        res = data.get('resultData') or {}
        steps = []
        for node, runs in (res.get('runData') or {}).items():
            for r in runs or []:
                main = (r.get('data') or {}).get('main') or []
                branch = next((b for b in main if isinstance(b, list) and b), [])
                steps.append({'node': node, 'started_ms': r.get('startTime') or 0, 'duration_ms': r.get('executionTime') or 0,
                              'output': [it.get('json') or {} for it in branch] or None,
                              'error': (r.get('error') or {}).get('message') if r.get('error') else None})
        steps.sort(key=lambda s: s['started_ms'])
        err = (res.get('error') or {}).get('message') if res.get('error') else None
        run = {'id': str(e.get('id')), 'agent': agent, 'status': e.get('status') or ('success' if e.get('finished') else 'running'),
               'started_at': e.get('startedAt'), 'stopped_at': e.get('stoppedAt'), 'error': err,
               'applicant_name': None, 'insurance_number': None, 'application_id': None, 'decision': None, 'channel': None}
        return run, steps

    def runs(self, agent: str, limit: int = 20) -> list[tuple[dict, list[dict]]]:
        return [self.to_run_and_steps(agent, e) for e in self.executions(agent, limit)]

    def resume(self, exec_id: str, decision: str, channel: str | None) -> None:
        """Same as clicking the button in the review e-mail: calls the Wait node's resume URL."""
        params = {'decision': decision, **({'channel': channel} if channel else {})}
        r = httpx.get(f'{self.s.n8n_url}/webhook-waiting/{exec_id}', params=params, timeout=60)
        if r.status_code >= 400:
            raise RuntimeError(f'n8n did not accept the decision ({r.status_code}). Use the buttons in the review e-mail instead.')
