"""Caseworker portal: home page, one portal per agent, Approve / Reject, printable letter, CSV exports.
All data comes from the n8n API – nothing is stored here."""
from __future__ import annotations
import csv, datetime as dt, html, io, time, traceback
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse, Response

from . import de
from .n8n import N8nBackend
from .settings import settings
from .view import decision_of, portal_view

HERE = Path(__file__).parent
N8N = N8nBackend(settings)
app = FastAPI(title='Zero Gap Agent – Portal')


def _now() -> str:
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())


def _all_runs(limit: int, agents=('aris', 'zero')):
    out = []
    for agent in agents:
        try:
            out += N8N.runs(agent, limit)
        except Exception:  # noqa: BLE001
            traceback.print_exc()
    return sorted(out, key=lambda x: str(x[0].get('started_at') or ''), reverse=True)


def _outputs(steps):
    return {s['node']: s['output'] for s in steps if s.get('output') is not None}


# ------------------------------------------------------------------ pages
@app.get('/', response_class=HTMLResponse)
def home():
    return HTMLResponse((HERE / 'home.html').read_text(encoding='utf-8'))


@app.get('/i18n.js')
def i18n_js():
    return Response((HERE / 'i18n.js').read_text(encoding='utf-8'), media_type='application/javascript', headers={'Cache-Control': 'no-cache'})


@app.get('/portal/{agent}', response_class=HTMLResponse)
def portal(agent: str):
    if agent not in ('aris', 'zero'):
        raise HTTPException(404)
    return HTMLResponse((HERE / 'portal.html').read_text(encoding='utf-8'))


@app.get('/print/{agent}/{run_id}', response_class=HTMLResponse)
def print_letter(agent: str, run_id: str):
    case = next((c for c in portal_view(N8N, agent, 50)['cases'] if c['id'] == run_id), None)
    r = (case or {}).get('review') or {}
    if not r.get('letter'):
        raise HTTPException(404, 'No letter for this case.')
    return HTMLResponse(f"""<!doctype html><html><head><meta charset="utf-8"><title>Letter {html.escape(run_id)}</title>
<style>body{{font-family:Georgia,'Times New Roman',serif;max-width:680px;margin:48px auto;font-size:14px;line-height:1.6;white-space:pre-wrap}}</style></head>
<body onload="window.print()">{html.escape(r['letter'])}</body></html>""")


# ------------------------------------------------------------------ API used by the pages
@app.get('/api/config')
def api_config():
    return {'backend': 'n8n', 'upload': False}


@app.get('/api/portal/{agent}')
def api_portal(agent: str):
    try:
        view = portal_view(N8N, agent)
    except Exception as e:  # noqa: BLE001
        view = {'generated_at': _now(), 'cases': [], 'error': str(e)}
    return JSONResponse(view, headers={'Cache-Control': 'no-store'})


@app.post('/api/runs/{run_id}/decision')
def api_decide(run_id: str, decision: str, channel: str | None = None, lang: str = 'de'):
    lang = 'en' if lang == 'en' else 'de'   # the German letter is sent; English is a reference copy
    try:
        N8N.resume(run_id, 'approve' if decision == 'approve' else 'reject', channel, lang)
    except RuntimeError as e:
        raise HTTPException(409, str(e))
    return {'decision': decision, 'channel': channel, 'lang': lang}


@app.get('/api/summary')
def api_summary():
    agents, recent = {}, []
    for agent in ('aris', 'zero'):
        try:
            cases, err = portal_view(N8N, agent, 50)['cases'], None
        except Exception as e:  # noqa: BLE001
            cases, err = [], str(e)
        st = {'total': len(cases), 'running': 0, 'waiting': 0, 'approved': 0, 'rejected': 0, 'error': 0,
              'escalation': 0, 'letter': 0, 'ready': 0, 'wrong_person': 0, 'risks': 0, 'amendments': 0, 'error_text': err}
        for c in cases:
            r = c.get('review') or {}
            if c.get('decision') in ('approved', 'rejected'):
                st[c['decision']] += 1
            elif c['status'] == 'waiting':
                st['waiting'] += 1
            elif c['status'] in ('error', 'crashed'):
                st['error'] += 1
            elif c['status'] in ('running', 'new'):
                st['running'] += 1
            key = {'escalation': 'escalation', 'none': 'ready', 'letter': 'letter'}.get(r.get('route'))
            if key:
                st[key] += 1
            risks = r.get('risks') or []
            st['risks'] += sum(1 for x in risks if x.get('occurred'))
            st['wrong_person'] += sum(1 for x in risks if x.get('id') == 'C1' and x.get('occurred'))
            st['amendments'] = max(st['amendments'], len(((r.get('policy') or {}).get('amendments')) or []))
            recent.append({'agent': agent, 'id': c['id'], 'name': c.get('applicant_name') or 'New application', 'ref': c.get('insurance_number') or '',
                           'status': c['status'], 'decision': c.get('decision'), 'started_at': c.get('started_at'),
                           'final_status': r.get('final_status'), 'route': r.get('route')})
        agents[agent] = st
    recent.sort(key=lambda x: str(x['started_at'] or ''), reverse=True)
    return JSONResponse({'generated_at': _now(), 'backend': 'n8n', 'n8n_url': settings.n8n_url, 'upload': False,
                         'agents': agents, 'recent': recent[:10]}, headers={'Cache-Control': 'no-store'})


# ------------------------------------------------------------------ exports for ARIS Process Mining
@app.get('/api/export/event-log.csv')
def export_event_log():
    buf = io.StringIO(); w = csv.writer(buf)
    w.writerow(['Fall_ID', 'Agent', 'Versicherten_ID', 'Antragsteller', 'Aktivitaet', 'Startzeitpunkt', 'Endzeitpunkt', 'Dauer_ms', 'Status'])
    for r, steps in reversed(_all_runs(100, ('aris',))):   # the agent with ARIS context only
        a = (_outputs(steps).get('Build Case File') or [{}])[0].get('applicant') or {}
        who = ' '.join(x for x in [a.get('first_name'), a.get('last_name')] if x)
        for s in steps:
            t0 = dt.datetime.fromtimestamp((s['started_ms'] or 0) / 1000, dt.timezone.utc)
            t1 = t0 + dt.timedelta(milliseconds=s['duration_ms'] or 0)
            w.writerow([f"{r['agent'].upper()}-{r['id']}", de.AGENT[r['agent']], a.get('insurance_number') or '', who, de.NODE.get(s['node'], s['node']),
                        t0.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3], t1.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3], s['duration_ms'], 'Fehler' if s.get('error') else 'ok'])
    return Response(buf.getvalue(), media_type='text/csv', headers={'Content-Disposition': 'attachment; filename="zero_gap_ereignisprotokoll_aris.csv"'})


@app.get('/api/export/cases.csv')
def export_cases():
    buf = io.StringIO(); w = csv.writer(buf)
    w.writerow(['Agentenlauf_ID', 'Agent', 'Versicherten_ID', 'Antragsteller', 'Status', 'Gestartet', 'Beendet', 'Endstatus', 'Naechster_Schritt',
                'Ergebnis_Personenabgleich', 'Zugeordnete_Versicherten_ID', 'Gefundene_Namensvettern', 'Anzahl_angeforderte_Punkte', 'Unnoetig_angeforderte_Punkte',
                'Von_anderer_Person_kopierte_Werte', 'Erfundene_Werte', 'Ueberschriebene_Felder', 'Angezeigte_Resttage', 'Angewandte_Richtlinienaenderungen',
                'Eingetretene_Risiken', 'Entscheidung_Sachbearbeitung'])
    for r, steps in reversed(_all_runs(100)):
        outs = _outputs(steps)
        o = (outs.get('Zero-Context Agent' if r['agent'] == 'zero' else 'Compliance Controls (ARIS)') or [{}])[0]
        a = o.get('applicant') or {}
        nl, zc = o.get('name_lookup') or {}, o.get('zero_context') or {}
        risks = (o.get('risk_register') or {}).get('risks') or []
        rw = zc.get('record_write') or {}
        nxt = de.NEXT_STEP.get(o.get('route'), '')
        match = '' if not o else 'Correct person' if r['agent'] == 'aris' else 'No match' if not nl.get('chosen_id') else 'Wrong person' if nl.get('id_differs') else 'Correct person'
        decision = decision_of((outs.get('Wait for Caseworker Decision') or [None])[0], outs) or ''
        final = o.get('final_status') or ''
        w.writerow([f"{r['agent'].upper()}-{r['id']}", de.AGENT[r['agent']], a.get('insurance_number') or '', ' '.join(x for x in [a.get('first_name'), a.get('last_name')] if x),
                    de.STATUS.get(r['status'], r['status']), r['started_at'] or '', r['stopped_at'] or '', de.FINAL_STATUS.get(final, final), nxt, de.MATCH.get(match, match),
                    nl.get('chosen_id') or (a.get('insurance_number') if r['agent'] == 'aris' else '') or '', max(0, (nl.get('matches_count') or 0) - 1) if nl else 0,
                    len(o.get('hard_failures') or []), len(zc.get('unnecessary') or []), len(zc.get('copied') or []), len(zc.get('invented') or []),
                    sum(1 for c in rw.get('changes') or [] if c.get('from') != '(empty)'), (o.get('sla') or {}).get('days_to_sla_breach', ''),
                    ', '.join(x.get('id', '') for x in ((o.get('policy') or {}).get('amendments') or [])), sum(1 for x in risks if x.get('occurred')), de.DECISION.get(decision, decision)])
    return Response(buf.getvalue(), media_type='text/csv', headers={'Content-Disposition': 'attachment; filename="zero_gap_fallergebnisse.csv"'})