"""Turns n8n executions of the two Zero Gap Agent flows into the progress + review data the portal shows."""
from __future__ import annotations
import json, re, threading, time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from .n8n import GONE

CATALOGUE = {
    'C1': ['Collection', 'Context from previous cases involving the wrong person', 'Privacy breach, disclosure of personal data, incorrect case association'],
    'C2': ['Collection', 'Uses information from previous cases that is not relevant to the current claim', 'Data protection, purpose limitation, unauthorised use of personal data'],
    'C3': ['Collection', 'Collects all customer data, even when only specific data is relevant', 'Data protection, purpose limitation, data minimisation'],
    'C4': ['Collection', 'Automatically copies information from previous cases into the current claim', 'Incorrect data, data integrity, wrong-person / wrong-case association'],
    'M1': ['Missing', 'Marks information as missing although it is not required for this claim', 'Unnecessary data collection, disproportionate information requests'],
    'R1': ['Request', 'Requests sensitive documents that are not necessary', 'Data minimisation, proportionality, protection of sensitive personal data'],
    'R2': ['Request', 'Uses an incorrect justification or calls a document mandatory when it is not', 'Misleading customer communication, incorrect legal/business representation'],
    'R3': ['Request', 'Automatically sends the generated letter to the customer', 'Lack of human oversight, inappropriate customer communication'],
    'W1': ['Writing', 'Invents missing information and enters it into the claim', 'Fabrication of customer/claim data; inaccurate records'],
    'W2': ['Writing', 'Fills missing fields with assumptions or AI-generated values', 'False or misleading records; data integrity risk'],
    'W3': ['Writing', 'Presents inferred information as verified facts', 'Misrepresentation; incorrect claims handling'],
    'W4': ['Writing', 'Modifies existing claim or customer data without authorisation', 'Unauthorised data alteration; governance and data integrity breach'],
    'W5': ['Writing', 'Overwrites correct data with AI-generated information', 'Loss of data integrity; incorrect customer record'],
    'W6': ['Writing', 'Writes AI-generated information into the system of record without human validation', 'Lack of human oversight; inadequate control'],
    'W7': ['Writing', 'Changes historical claim information without preserving the original record', 'Loss of audit trail; lack of traceability'],
    'W8': ['Writing', 'Modifies data that affects coverage, liability, reserve, payment or fraud assessment', 'Material claims-handling, financial and regulatory risk'],
    'W9': ['Writing', 'Creates information that appears to have been provided by the customer', 'False customer record; misleading claims documentation'],
    'W10': ['Writing', 'Cannot distinguish source data, inferred data and AI-generated data', 'Lack of provenance, explainability and auditability'],
}
SOP_ARIS = ['Build SOP Searches', 'Search SOPs and Amendments', 'Collect SOP Document IDs', 'MCP: Get SOP Text', 'Read SOP Text']
SOP_DRIVE = ['List SOP Documents', 'Keep SOP Documents Only', 'Get SOP Document (Google Docs)', 'Read SOP Text']
DRAFT = ['AI: Draft Review Summary & Letter', 'Guardrails: Validate AI Draft', 'Create Letter PDF']
DECISION = ['APPROVED: Release for Dispatch', 'REJECTED: Manual Handling']
DISPATCH = ['Send Letter or Escalation', 'Print Letter / Release (no email)', 'Print Letter (not connected)', 'No outreach needed']
TL = [('received', 'Application received (Antrag)'), ('md_order', 'Assessment order sent to the Medical Service'), ('request_dispatched', 'Missing-information request sent'),
      ('confirmation_letter', 'Confirmation letter sent'), ('resubmission_received', 'Nachreichung received'), ('gutachten_received', 'Gutachten received'),
      ('decision', 'Care-level decision (Bescheid)'), ('objection', 'Objection (Widerspruch)')]


def decision_of(wait: dict | None, ran) -> str | None:
    """What the caseworker clicked: the decision in the resume link that woke the Wait node.
    The APPROVED / REJECTED nodes are only the fallback – a mis-wired IF node can run both."""
    w = wait or {}
    d = str((w.get('query') or {}).get('decision') or (w.get('body') or {}).get('decision') or '').lower()
    if d.startswith('approv'):
        return 'approved'
    if d.startswith('reject'):
        return 'rejected'
    return 'approved' if DECISION[0] in ran else 'rejected' if DECISION[1] in ran else None


def _wording(text, de=False):
    """Current wording of the two 'missing' findings the flows still write in their old words."""
    if not text:
        return text
    if de:
        text = re.sub(r'^Identitätsnachweis der bevollmächtigten Person (.+?) fehlt\.?(?: – [^(]*?)?\s*(\(gemäß [^)]+\))?\.?$',
                      lambda m: f"Vollmachtsdokument für den Bevollmächtigten {m[1]}" + (f" {m[2]}" if m[2] else '') + '.', text)
        return re.sub(r'^Name und Anschrift der Hausärztin bzw\. des Hausarztes fehlen', 'Name und Anschrift des Hausarztes fehlen', text)
    text = re.sub(r'^Identity proof of authorized representative (.+?) is missing\.?(?: – [^(]*?)?\s*(?:\(per ([^)]+)\))?\.?$',
                  lambda m: f"Power of Attorney document for the authorized representative {m[1]}" + (f" (as per {m[2]})" if m[2] else ''), text)
    return re.sub(r'^GP \(Hausarzt\) name and address missing\.?\s*(?:\(per ([^)]+)\))?', lambda m: 'General practitioner name and address missing.' + (f" (as per {m[1]})" if m[1] else ''), text)


def _letter(text, de=False, route=None, who=None):
    """Outreach letter as shown in the portal, one format for both agents: the requested items, numbered, in a short letter.
    (Display only – what is actually sent is written by the n8n flow.)"""
    if not text:
        return text
    if de:
        text = re.sub(r'(?i)einen Nachweis Ihrer Identität als bevollmächtigte Person \(Kopie Ihres Ausweisdokuments\)\.?',
                      'Einen Nachweis Ihrer Bevollmächtigung (Kopie der Vollmacht).', text)
    else:
        text = re.sub(r'(?i)proof of your identity as authori[sz]ed representative \(a copy of your identity document\)\.?',
                      'Proof of your authorisation (a copy of the power of attorney).', text)
    items = re.findall(r'(?m)^[ \t]*\d+\.[ \t]*(\S.*?)[ \t]*$', text)
    if route == 'escalation' or not items:
        return text
    items = [re.sub(r'\s*\((?:Hausarzt|Entlassungsbericht)\)', '', i).rstrip('.;, ') for i in items]
    items = [f"{n}. {i[:1].upper()}{i[1:]}." for n, i in enumerate(items, 1)]
    hello = re.search(r'(?m)^[ \t]*(?:Dear|Sehr geehrte[r]?|Guten Tag)\s+(.+?),[ \t]*$', text)
    to = hello.group(1) if hello else who
    me = bool(who) and to == who   # the letter goes to the applicant themselves
    body = '\n'.join(items)
    if de:
        about = 'Ihrem Antrag auf Leistungen der Pflegeversicherung' if me else f"dem Antrag auf Leistungen der Pflegeversicherung von {who}"
        return (f"Guten Tag {to},\n\nwir schreiben Ihnen zu {about}. Um den Antrag bearbeiten zu können, bitten wir Sie um folgende Unterlagen und Angaben:"
                f"\n\n{body}\n\nVielen Dank für Ihre Mitwirkung.\n\nMit freundlichen Grüßen\nIhre Pflegekasse")
    about = 'your long-term care application' if me else f"the long-term care application of {who}"
    return (f"Dear {to},\n\nWe are writing to you regarding {about}. To proceed with the application, we kindly request the following items:"
            f"\n\n{body}\n\nThank you for your cooperation.\n\nSincerely,\nCare Insurance Fund")


def _suggestions(r):
    """Suggestions from the case history, without the one about the representative's identity proof (no longer offered)."""
    return [x for x in r.get('suggestions') or [] if 'representative identity proof' not in str(x.get('text') or '')]


def _contact(r: dict, d: dict) -> dict:
    """Where the letter can go: the e-mail address and the postal address found in the case (for the Approve buttons)."""
    f = r.get('form') or {}
    a, rep = (f.get('applicant') or r.get('applicant') or {}), (f.get('representation') or {})
    opts = d.get('options') or {}
    email = (d.get('real_email') or d.get('to')) if opts.get('email') or d.get('channel') == 'email' else None
    email = email or a.get('email') or rep.get('email') or None
    postal = d.get('postal_address') or (rep.get('address') if rep.get('name') else None) or a.get('address') or None
    to = d.get('postal_name') or rep.get('name') or ' '.join(x for x in [a.get('first_name'), a.get('last_name')] if x) or None
    return {'email': email, 'postal_address': postal, 'postal_name': to,
            'can_email': bool(opts.get('email')) if 'email' in opts else bool(email),
            'can_print': bool(opts.get('print')) if 'print' in opts else bool(postal)}


def _case(run: dict, steps: list[dict]) -> dict:
    rd: dict[str, list[dict]] = {}
    for s in steps:
        rd.setdefault(s['node'], []).append(s)
    ran = lambda n: n in rd  # noqa: E731
    out = lambda n: (rd[n][-1]['output'] or [None])[0] if n in rd and rd[n][-1]['output'] else None  # noqa: E731
    ms = lambda names: sum(s['duration_ms'] or 0 for n in names for s in rd.get(n, []))  # noqa: E731
    zero = run['agent'] == 'zero'
    hist = (['Search Event Log by Name', 'Look Up Applicant in Event Log'] if zero else ['MCP: List DataSets', 'MCP: Retrieve Meta Info', 'MCP: Get Script Language Instructions', 'Build ARIS History Query', 'MCP: Query Case History', 'ARIS Case History'])
    check = ['Completeness Rules Engine', 'Zero-Context Agent'] if zero else ['Completeness Rules Engine', 'Compliance Controls (ARIS)']
    draft = ['Write Case Record (CRM)', 'AI: Draft Letter', 'Prepare Letter & Review Email', 'Create Letter PDF'] if zero else DRAFT
    stages = [
        ('received', 'Trigger received', 'New application received – starting the case review.', ['Gmail Trigger', 'Gmail Trigger1', 'Extract Application PDF'], ['Gmail Trigger', 'Gmail Trigger1', 'Extract Application PDF']),
        ('sops', 'Reading SOPs', 'Loading the SOPs and policies.', SOP_DRIVE if zero else SOP_ARIS, ['Read SOP Text']),
        ('casefile', 'Building the case file', 'Reading applicant, representative and dates from the documents.', ['Build Case File'], ['Build Case File']),
        ('history', 'Checking the case history', 'Looking up earlier cases of the applicant.', hist, [hist[-1]]),
        ('rules', 'Applying the rules', 'Applying the SOP and policy rules to the case.', ['Apply SOP Rules'], ['Apply SOP Rules']),
        ('check', 'Completeness check', 'Checking the application and the deadlines.', check, [check[1]]),
        ('prepare', 'Drafting the outreach', 'Drafting the letter or the escalation.', draft, ['Create Letter PDF']),
        ('review', 'Caseworker review', 'Waiting for the caseworker to approve or reject.', ['Send Review Email (letter attached)', 'Wait for Caseworker Decision'], DECISION),
        ('decision', 'Decision recorded', 'The caseworker’s decision is stored with the case.', DECISION, DECISION),
    ]
    if not ran('REJECTED: Manual Handling'):
        stages.append(('dispatch', 'Dispatch', 'Letter emailed or printed, or escalation sent to the Case Manager.', ['Prepare Dispatch', *DISPATCH], DISPATCH))
    status = run['status']
    active_found, step_list = False, []
    for key, title, text, nodes, done_nodes in stages:
        done = any(ran(n) for n in done_nodes)
        state = 'done' if done else 'pending'
        if not done and not active_found and status in ('running', 'new', 'waiting', 'error', 'crashed'):
            active_found = True
            state = 'error' if status in ('error', 'crashed') else 'active'
        step_list.append({'key': key, 'title': title, 'text': text, 'state': state, 'duration_ms': ms(nodes)})

    r = out('Zero-Context Agent' if zero else 'Compliance Controls (ARIS)') or out('Completeness Rules Engine')
    pd, cf = out('Prepare Dispatch'), out('Build Case File')
    dn = out('Prepare Letter & Review Email' if zero else 'Guardrails: Validate AI Draft')
    drafts = (dn or {}).get('drafts') or {}
    a = (r or {}).get('applicant') or (cf or {}).get('applicant') or {}
    tl = (r or {}).get('timeline') or (cf or {}).get('timeline') or {}
    who = ' '.join(x for x in [a.get('first_name'), a.get('last_name')] if x) or run.get('applicant_name')
    review = None
    if r and r.get('final_status'):
        s = r.get('sla') or {}
        rep = r.get('representative')
        review = {
            'agent': 'zero' if zero else 'aris', 'final_status': r['final_status'], 'case_ref': r.get('application_id'), 'date_of_birth': a.get('date_of_birth'),
            'representative': f"{rep['name']}{' (' + rep['relationship'] + ')' if rep.get('relationship') else ''}" if rep else None,
            'check_date': (r.get('check') or {}).get('date'), 'recheck': (r.get('check') or {}).get('recheck'),
            'route': 'letter' if zero else r.get('route'), 'route_reasons': r.get('route_reasons') or [],
            'sla': {'statutory_left': s.get('days_to_sla_breach'), 'deadline': s.get('sla_deadline_date'), 'internal': s.get('internal_target'),
                    'start': s.get('sla_start_date'), 'basis': s.get('sla_start_source')},
            'escalation': (r.get('policy') or {}).get('escalation'),
            'blocking': [_wording(f.get('message')) for f in r.get('hard_failures') or []], 'checks': [_wording(f.get('message')) for f in r.get('soft_warnings') or []],
            'notes': [f.get('message') for f in r.get('info') or []],
            'policy': {'source': 'SOPs' if zero else 'SOPs and policy amendments', 'documents': [d.get('title') for d in (r.get('policy') or {}).get('documents') or []],
                       'amendments': (r.get('policy') or {}).get('amendments') or [],
                       # every policy amendment document read from ARIS on this run (titled PA-YYYY-NN from its text) –
                       # also new ones the flow's rule catalogue does not know yet
                       'found': sorted({str(d.get('title')) for d in (r.get('policy') or {}).get('documents') or []
                                        if re.fullmatch(r'PA-\d{4}-\d{2}', str(d.get('title') or ''))})},
            'policy_view': r.get('policy_view') or [],
            'suggestions': [] if zero else [x.get('text') for x in _suggestions(r)],
            'provenance': r.get('provenance') or [],
            'risks': [{**x, 'group': CATALOGUE.get(x.get('id'), [None])[0], 'title': CATALOGUE.get(x.get('id'), [None, None])[1],
                       'issue': CATALOGUE.get(x.get('id'), [None, None, None])[2]} for x in (r.get('risk_register') or {}).get('risks') or []],
            'record_write': ((r.get('zero_context') or {}).get('record_write')) if zero else None,
            'timeline': sorted([{'date': tl[k], 'label': lab} for k, lab in TL if tl.get(k)], key=lambda x: x['date']),
            'letter': _letter(drafts.get('escalation_summary') if r.get('route') == 'escalation' else drafts.get('outreach_letter'), route=r.get('route'), who=who),
            'addressee': drafts.get('addressee') or (r.get('review_context') or {}).get('addressee'),
            'summary': drafts.get('escalation_summary') if (not zero and drafts.get('draft_source') == 'llm') else None,
            'dispatch': (pd or {}).get('dispatch') or r.get('dispatch'),
            'extra_facts': r.get('extra_facts') or [],
            'facts': (dn or {}).get('review_facts'),
            # German versions written by the flows (missing in runs from before they became bilingual)
            'de': {
                'letter': _letter(drafts.get('escalation_summary_de') if r.get('route') == 'escalation' else drafts.get('outreach_letter_de'), True, r.get('route'), who),
                'facts': (dn or {}).get('review_facts_de'),
                'extra_facts': r.get('extra_facts_de'),
                'blocking': [_wording(f.get('message_de'), True) for f in r.get('hard_failures') or []],
                'checks': [_wording(f.get('message_de'), True) for f in r.get('soft_warnings') or []],
                'suggestions': [] if zero else [x.get('text_de') for x in _suggestions(r)],
                'route_reasons': r.get('route_reasons_de') or [],
            },
            'contact': _contact(r, (pd or {}).get('dispatch') or r.get('dispatch') or {}),
            'letter_file': next(iter((out('Create Letter PDF') or {}).get('_files') or []), None),
        }
    return {
        'id': str(run['id']), 'status': status, 'started_at': run['started_at'], 'stopped_at': run['stopped_at'],
        'applicant_name': (r or {}).get('applicant_name') or ' '.join(x for x in [a.get('first_name'), a.get('last_name')] if x) or run.get('applicant_name'),
        'insurance_number': (r or {}).get('insurance_number') or a.get('insurance_number') or run.get('insurance_number'),
        'case_ref': (r or {}).get('application_id') or (cf or {}).get('case_ref'),
        'steps': step_list, 'review': review, 'can_decide_here': status == 'waiting', 'awaiting_email_confirmation': False,
        'decision': decision_of(out('Wait for Caseworker Decision'), rd),
        'error': run.get('error'),
    }


def _shown(c: dict) -> bool:
    """Every case except finished runs that never read an applicant (test runs, listed as 'New application').
    Runs still in progress are kept – they get the applicant's name once the case file is built."""
    return c['status'] in ('running', 'new', 'waiting') or bool(c['applicant_name'])


# The portal remembers the cases it has shown, so the latest ones stay visible when n8n's list no longer returns them –
# but a case that was DELETED in n8n (the execution no longer exists) is dropped from the memory too.
# (a file next to the app – it survives restarts, but not a new deploy on hosts with a temporary disk)
REMEMBER = 25
RECHECK = 20   # seconds before a remembered case is looked up in n8n again
_checked: dict[str, float] = {}   # execution id -> when n8n last confirmed it still exists
_MEMORY_FILE = Path(__file__).resolve().parent.parent / '.case_memory.json'
_memory: dict | None = None
_memory_lock = threading.Lock()


def _remember(agent: str, fresh: list[dict], probe) -> list[dict]:
    global _memory
    with _memory_lock:
        if _memory is None:
            try:
                _memory = json.loads(_MEMORY_FILE.read_text(encoding='utf-8'))
            except (OSError, ValueError):
                _memory = {}
        before = json.dumps(_memory.get(agent), sort_keys=True)
        fresh_ids = {c['id'] for c in fresh}
        # a remembered run that was still in progress and is gone from n8n is not coming back
        old = [c for c in _memory.get(agent, []) if c['id'] not in fresh_ids and c['status'] not in ('running', 'new')]
        now = time.time()
        due = [c for c in old if now - _checked.get(c['id'], 0) > RECHECK]
        if due:   # still in n8n? (404 = deleted there; n8n not answering = keep it for now)
            with ThreadPoolExecutor(8) as pool:
                found = list(pool.map(lambda c: probe(int(c['id'])), due))
            gone = {c['id'] for c, e in zip(due, found) if e is GONE}
            _checked.update({c['id']: now for c in due if c['id'] not in gone})
            old = [c for c in old if c['id'] not in gone]
        merged = sorted(fresh + old, key=lambda c: str(c.get('started_at') or ''), reverse=True)[:REMEMBER]
        _memory[agent] = merged
        if json.dumps(merged, sort_keys=True) != before:
            try:
                _MEMORY_FILE.write_text(json.dumps(_memory, ensure_ascii=False), encoding='utf-8')
            except OSError:
                pass   # read-only disk: the memory then lasts until the next restart
        return merged


def portal_view(n8n, agent: str, limit: int = 25) -> dict:
    import time
    cases = _remember(agent, [c for c in (_case(run, steps) for run, steps in n8n.runs(agent, limit)) if _shown(c)], n8n._probe)
    return {'generated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'flow_label': 'agent without ARIS context' if agent == 'zero' else 'agent with ARIS context', 'cases': cases}
