"""Reads the executions of the two agent flows through the n8n API and resumes waiting executions (Approve / Reject)."""
from __future__ import annotations
import datetime as dt, json, threading, time

import httpx

# The only nodes whose output the portal and the exports read (first item only); the rest keep just name and timing.
KEEP_OUTPUT = {'Build Case File', 'Completeness Rules Engine', 'Zero-Context Agent', 'Compliance Controls (ARIS)',
               'Prepare Letter & Review Email', 'Guardrails: Validate AI Draft', 'Create Letter PDF', 'Prepare Dispatch',
               'Wait for Caseworker Decision', 'APPROVED: Release for Dispatch', 'REJECTED: Manual Handling'}
MAX_KEPT = 300   # trimmed executions kept in memory


class N8nBackend:
    def __init__(self, settings):
        self.s = settings   # missing settings are reported on the page instead of stopping the app
        self._cache: dict[str, tuple[float, int, list, list]] = {}   # agent -> (fetched_at, limit, latest runs, older waiting runs)
        self._kept: dict[str, tuple[str, tuple]] = {}          # execution id -> (status, trimmed run); data only changes while running
        self._lock = threading.Lock()                          # one n8n request at a time, however many browsers poll
        self.ttl = 10                                          # seconds an answer from n8n is reused
        self.workflows = {'aris': settings.n8n_workflow_aris, 'zero': settings.n8n_workflow_zero}

    def _check(self) -> None:
        if not (self.s.n8n_url and self.s.n8n_api_key):
            raise RuntimeError('N8N_URL and N8N_API_KEY are not set (.env locally, or Environment on Render)')

    def _get(self, path: str, params: dict) -> dict:
        self._check()
        r = httpx.get(f'{self.s.n8n_url}/api/v1{path}', params=params, timeout=60,
                      headers={'X-N8N-API-KEY': self.s.n8n_api_key, 'accept': 'application/json'})
        if r.status_code >= 400:
            raise RuntimeError(f'n8n API {r.status_code}: {r.text[:200]}')
        return r.json()

    def runs(self, agent: str, limit: int = 20) -> list[tuple[dict, list[dict]]]:
        with self._lock:
            hit = self._cache.get(agent)
            if not (hit and time.time() - hit[0] < self.ttl and hit[1] >= limit):
                hit = (time.time(), limit, *self._fetch(agent, limit))
                self._cache[agent] = hit
            latest = hit[2][:limit]
            ids = {r['id'] for r, _ in latest}
            return latest + [x for x in hit[3] if x[0]['id'] not in ids]   # waiting runs are always shown, however old

    def _fetch(self, agent: str, limit: int) -> tuple[list, list]:
        """The latest executions plus every execution still waiting for the caseworker.
        Listed without data, then each one's data is downloaded once (one at a time) and only what the portal reads is kept.
        A full execution can be tens of MB (e.g. a whole event log in one node), too much for a 512 MB instance."""
        wf = self.workflows.get(agent)
        if not wf:
            raise RuntimeError(f'N8N_WORKFLOW_{agent.upper()} is not set in .env')
        latest = self._list({'workflowId': wf}, limit)
        ids = {str(e.get('id')) for e in latest}
        waiting = [e for e in self._list({'workflowId': wf, 'status': 'waiting'}, 100) if str(e.get('id')) not in ids]
        out = [self._trimmed(agent, e) for e in latest], [self._trimmed(agent, e) for e in waiting]
        while len(self._kept) > MAX_KEPT:
            self._kept.pop(next(iter(self._kept)))
        return out

    def _list(self, params: dict, limit: int) -> list[dict]:
        listed, cursor = [], None
        while len(listed) < limit:
            j = self._get('/executions', {**params, 'limit': min(100, limit - len(listed)), **({'cursor': cursor} if cursor else {})})
            listed += j.get('data') or []
            cursor = j.get('nextCursor')
            if not cursor:
                break
        return listed

    def _trimmed(self, agent: str, e: dict) -> tuple[dict, list[dict]]:
        eid, status = str(e.get('id')), e.get('status') or ('success' if e.get('finished') else 'running')
        hit = self._kept.get(eid)
        if not hit or hit[0] != status or status in ('running', 'new'):
            full = self._get(f'/executions/{eid}', {'includeData': 'true'})
            hit = (status, self.to_run_and_steps(agent, full))
            del full
        self._kept.pop(eid, None)
        self._kept[eid] = hit   # most recently used last
        return hit[1]

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
                              'output': [branch[0].get('json') or {}] if branch and node in KEEP_OUTPUT else None,
                              'error': (r.get('error') or {}).get('message') if r.get('error') else None})
        steps.sort(key=lambda s: s['started_ms'])
        err = (res.get('error') or {}).get('message') if res.get('error') else None
        run = {'id': str(e.get('id')), 'agent': agent, 'status': e.get('status') or ('success' if e.get('finished') else 'running'),
               'started_at': e.get('startedAt'), 'stopped_at': e.get('stoppedAt'), 'error': err,
               'applicant_name': None, 'insurance_number': None, 'application_id': None, 'decision': None, 'channel': None}
        return run, steps

    def resume(self, exec_id: str, decision: str, channel: str | None) -> None:
        """Same as clicking the button in the review e-mail: calls the Wait node's resume URL."""
        self._check()
        self._cache.clear()   # show the decision on the next refresh
        params = {'decision': decision, **({'channel': channel} if channel else {})}
        r = httpx.get(f'{self.s.n8n_url}/webhook-waiting/{exec_id}', params=params, timeout=60)
        if r.status_code >= 400:
            raise RuntimeError(f'n8n did not accept the decision ({r.status_code}). Use the buttons in the review e-mail instead.')