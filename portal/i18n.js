/* Portal texts in German and English. German is the default; the DE | EN switch remembers the choice per browser.
   Static text: data-i18n="key" (text) and data-i18n-title="key" (tooltip). Dynamic text: I18N.t('key', {vars}). */
(() => {
  const STORE = 'zg-lang';
  let lang = 'de';
  const asked = new URLSearchParams(location.search).get('lang');   // ?lang=en / ?lang=de, e.g. in a shared link
  try {
    if (asked === 'en' || asked === 'de') localStorage.setItem(STORE, asked);
    lang = (asked || localStorage.getItem(STORE)) === 'en' ? 'en' : 'de';
  } catch (e) { lang = asked === 'en' ? 'en' : 'de'; }   // storage blocked

  const T = {
    // ---- shared
    'brand.title':        ['Care Application Intake', 'Pflegeantrags-Eingang'],
    'live.connecting':    ['Connecting…', 'Verbinde…'],
    'live.updated':       ['Live · updated {t}', 'Live · aktualisiert {t}'],
    'live.busy':          ['Server busy – retrying… ({e})', 'Server ausgelastet – neuer Versuch… ({e})'],
    'chip.approved':      ['Approved', 'Freigegeben'],
    'chip.rejected':      ['Rejected', 'Abgelehnt'],
    'chip.waiting':       ['Awaiting review', 'Wartet auf Prüfung'],
    'chip.error':         ['Error', 'Fehler'],
    'chip.canceled':      ['Cancelled', 'Abgebrochen'],
    'chip.completed':     ['Completed', 'Abgeschlossen'],
    'chip.done':          ['Done', 'Erledigt'],
    'chip.processing':    ['Processing', 'In Bearbeitung'],
    'agent.aris':         ['Agent with ARIS context', 'Agent mit ARIS-Kontext'],
    'agent.zero':         ['Agent with zero context', 'Agent ohne Kontext'],
    'flow.aris':          ['agent with ARIS context', 'Agent mit ARIS-Kontext'],
    'flow.zero':          ['agent without ARIS context', 'Agent ohne ARIS-Kontext'],
    'nav.aris':           ['With ARIS context', 'Mit ARIS-Kontext'],
    'nav.zero':           ['Zero context', 'Ohne Kontext'],
    'nav.home':           ['Home', 'Startseite'],
    'upload.new':         ['New application', 'Neuer Antrag'],
    'upload.title':       ['Start both agents on an application-form PDF', 'Beide Agenten mit einem Antragsformular-PDF starten'],
    'upload.sending':     ['Uploading {f} …', '{f} wird hochgeladen …'],
    'upload.failed':      ['Upload failed: {e}', 'Hochladen fehlgeschlagen: {e}'],
    'route.escalation':   ['Escalation', 'Eskalation'],
    'route.letter':       ['Letter', 'Schreiben'],
    'route.none':         ['Release for assessment', 'Freigabe zur Begutachtung'],

    // ---- home page
    'home.kTotal':        ['Applications checked', 'Geprüfte Anträge'],
    'home.kWait':         ['Waiting for your review', 'Warten auf Ihre Prüfung'],
    'home.kEsc':          ['Escalated to Case Manager', 'An Fallmanager eskaliert'],
    'home.kWrong':        ['Wrong-person matches (no context)', 'Falsche Person zugeordnet (ohne Kontext)'],
    'home.governed':      ['Governed', 'Mit Governance'],
    'home.ungoverned':    ['Ungoverned', 'Ohne Governance'],
    'home.checked':       ['Checked', 'Geprüft'],
    'home.inReview':      ['In review', 'In Prüfung'],
    'home.escalations':   ['Escalations', 'Eskalationen'],
    'home.risks':         ['Risks hit', 'Risiken eingetreten'],
    'home.wrongPerson':   ['Wrong person', 'Falsche Person'],
    'home.open':          ['Open portal', 'Portal öffnen'],
    'home.note':          ['{a} approved · {r} rejected', '{a} freigegeben · {r} abgelehnt'],
    'home.how':           ['How it works', 'So funktioniert es'],
    'home.howSub':        ['Nothing reaches the applicant without a caseworker', 'Nichts erreicht die antragstellende Person ohne Sachbearbeitung'],
    'home.s1':            ['Application arrives', 'Antrag geht ein'],
    'home.s1t':           ['The form comes in by e-mail and both agents start at once.', 'Das Formular kommt per E-Mail, und beide Agenten starten sofort.'],
    'home.s2':            ['Documents & rules', 'Dokumente & Regeln'],
    'home.s2t':           ['Case documents, SOPs and policies are read – from ARIS, or from a shared drive.', 'Falldokumente, SOPs und Richtlinien werden gelesen – aus ARIS oder aus einem freigegebenen Laufwerk.'],
    'home.s3':            ['Check & decide', 'Prüfen & entscheiden'],
    'home.s3t':           ['Missing items, legal deadlines and the next step: letter, escalation or release.', 'Fehlende Unterlagen, gesetzliche Fristen und der nächste Schritt: Schreiben, Eskalation oder Freigabe.'],
    'home.s4':            ['You approve', 'Sie geben frei'],
    'home.s4t':           ['Review the draft, then send it by e-mail or print it for the post.', 'Prüfen Sie den Entwurf und versenden Sie ihn per E-Mail oder drucken Sie ihn für den Postversand.'],
    'home.latest':        ['Latest applications', 'Neueste Anträge'],
    'home.colApplicant':  ['Applicant', 'Antragsteller/in'],
    'home.colAgent':      ['Agent', 'Agent'],
    'home.colNext':       ['Next step', 'Nächster Schritt'],
    'home.colStatus':     ['Status', 'Status'],
    'home.loading':       ['Loading…', 'Wird geladen…'],
    'home.none':          ['No applications yet.', 'Noch keine Anträge.'],
    'home.newApp':        ['New application', 'Neuer Antrag'],
    'home.tagAris':       ['ARIS context', 'ARIS-Kontext'],
    'home.tagZero':       ['Zero context', 'Ohne Kontext'],
    'home.tools':         ['Tools', 'Werkzeuge'],
    'home.uplSub':        ['Upload a form PDF – both agents start', 'Formular-PDF hochladen – beide Agenten starten'],
    'home.evlog':         ['Event log (CSV)', 'Ereignisprotokoll (CSV)'],
    'home.evlogSub':      ['Every step of every run of the agent with ARIS context – for ARIS Process Mining', 'Jeder Schritt jedes Durchlaufs des Agenten mit ARIS-Kontext – für ARIS Process Mining'],
    'home.cases':         ['Case results (CSV)', 'Fallergebnisse (CSV)'],
    'home.casesSub':      ['One row per run with the KPI fields', 'Eine Zeile pro Durchlauf mit den KPI-Feldern'],
    'home.backendN8n':    ['Agents run in n8n ({u}).', 'Die Agenten laufen in n8n ({u}).'],
    'home.backendApp':    ['Agents run in this app.', 'Die Agenten laufen in dieser App.'],
    'home.footer':        ['Zero Gap Agent · care application intake', 'Zero Gap Agent · Eingang von Pflegeanträgen'],
    'home.live':          ['Live · {t}', 'Live · {t}'],
    'home.updated':       ['Updated {t}', 'Aktualisiert {t}'],
    'home.offline':       ['Offline – retrying', 'Offline – neuer Versuch'],
    'home.started':       ['Both agents started', 'Beide Agenten gestartet'],

    // ---- portal page
    'p.workspace':        ['Caseworker workspace', 'Arbeitsplatz Sachbearbeitung'],
    'p.applications':     ['Applications', 'Anträge'],
    'p.noApps':           ['No applications yet.', 'Noch keine Anträge.'],
    'p.waitTitle':        ['Waiting for new applications', 'Warten auf neue Anträge'],
    'p.waitText':         ['As soon as an application arrives by email, its processing appears here live.', 'Sobald ein Antrag per E-Mail eingeht, erscheint seine Bearbeitung hier live.'],
    'p.newApp':           ['New application', 'Neuer Antrag'],
    'p.unreadable':       ['Could not read the form', 'Formular nicht lesbar'],
    'p.reading':          ['Reading case file…', 'Fallakte wird gelesen…'],
    'p.readingThe':       ['Reading the case file…', 'Fallakte wird gelesen…'],
    'p.reviewStarted':    ['Review started {t}', 'Prüfung gestartet {t}'],
    'p.processing':       ['Processing', 'Verarbeitung'],
    'p.review':           ['Review', 'Prüfung'],
    'p.inProgress':       ['Processing in progress', 'Bearbeitung läuft'],
    'p.starting':         ['Starting…', 'Startet…'],
    'p.stepError':        ['Processing stopped at this step – please check the workflow.', 'Die Bearbeitung wurde bei diesem Schritt angehalten – bitte den Workflow prüfen.'],
    'p.preparing':        ['Preparing the review', 'Prüfung wird vorbereitet'],
    'p.preparingText':    ['The findings and draft letter appear here as soon as the checks are complete.', 'Die Ergebnisse und der Schreibentwurf erscheinen hier, sobald die Prüfungen abgeschlossen sind.'],
    'p.newReceived':      ['New application received – processing started.', 'Neuer Antrag eingegangen – Bearbeitung gestartet.'],
    'p.started':          ['Started: {a}', 'Gestartet: {a}'],
    // tiles
    't.result':           ['Result', 'Ergebnis'],
    't.ready':            ['Ready for assessment', 'Bereit zur Begutachtung'],
    't.missing':          ['Missing information', 'Fehlende Angaben'],
    't.items1':           ['{n} item outstanding', '{n} Punkt offen'],
    't.itemsN':           ['{n} items outstanding', '{n} Punkte offen'],
    't.nothing':          ['Nothing outstanding', 'Nichts offen'],
    't.statutory':        ['Statutory deadline', 'Gesetzliche Frist'],
    't.overdue':          ['working days overdue', 'Arbeitstage überfällig'],
    't.left':             ['working days left', 'Arbeitstage übrig'],
    't.due':              ['due {d}', 'fällig am {d}'],
    't.internal':         ['Internal target', 'Internes Ziel'],
    't.ofLeft':           ['of {n} working days left', 'von {n} Arbeitstagen übrig'],
    't.atRisk':           ['At risk', 'Gefährdet'],
    't.perPA04':          ['per PA-2026-04', 'gemäß PA-2026-04'],
    't.next':             ['Next step', 'Nächster Schritt'],
    't.escalate':         ['Escalate to Case Manager', 'Eskalation an Fallmanager'],
    't.letter':           ['Outreach letter', 'Anschreiben'],
    't.release':          ['Release for assessment', 'Freigabe zur Begutachtung'],
    't.phone':            ['phone outreach · per PA-2026-03', 'telefonische Kontaktaufnahme · gemäß PA-2026-03'],
    't.to':               ['to {n}', 'an {n}'],
    't.applicant':        ['applicant', 'Antragsteller/in'],
    't.noOutreach':       ['no outreach needed', 'keine Kontaktaufnahme nötig'],
    // review details
    'r.details':          ['Application details', 'Antragsdaten'],
    'r.applicant':        ['Applicant', 'Antragsteller/in'],
    'r.born':             ['born {d}', 'geb. {d}'],
    'r.memberCase':       ['Member number · case', 'Versichertennummer · Fall'],
    'r.representative':   ['Representative', 'Vertreter/in'],
    'r.whyEscalate':      ['Why escalate', 'Grund der Eskalation'],
    'r.outstanding':      ['Outstanding items', 'Offene Punkte'],
    'r.missingTag':       ['Missing', 'Fehlt'],
    'r.toCheck':          ['Points to check', 'Zu prüfen'],
    'r.checkTag':         ['Check', 'Prüfen'],
    'r.suggested':        ['Suggested from the case history', 'Vorschläge aus der Fallhistorie'],
    'r.suggestionTag':    ['Suggestion', 'Vorschlag'],
    'r.escNote':          ['Escalation note to the Case Manager', 'Eskalationsnotiz an den Fallmanager'],
    'r.draftTo':          ['Draft letter to {n}', 'Entwurf des Schreibens an {n}'],
    // decision
    'd.recorded':         ['Decision recorded:', 'Entscheidung erfasst:'],
    'd.sentCM':           [' – escalation sent to the Case Manager', ' – Eskalation an den Fallmanager gesendet'],
    'd.sentMail':         [' – letter emailed to the applicant', ' – Schreiben per E-Mail an die antragstellende Person gesendet'],
    'd.sentPrint':        [' – letter ready to print', ' – Schreiben druckbereit'],
    'd.print':            ['🖨 Print letter', '🖨 Schreiben drucken'],
    'd.noSend':           ['Nothing is sent without your approval.', 'Ohne Ihre Freigabe wird nichts versendet.'],
    'd.confirmRelease':   ['Confirm – release for assessment', 'Bestätigen – zur Begutachtung freigeben'],
    'd.approveEsc':       ['Approve escalation', 'Eskalation freigeben'],
    'd.approveMail':      ['✉ Approve & send e-mail', '✉ Freigeben & per E-Mail senden'],
    'd.approvePrint':     ['🖨 Approve & print letter', '🖨 Freigeben & Schreiben drucken'],
    'd.approve':          ['Approve', 'Freigeben'],
    'd.reject':           ['Reject', 'Ablehnen'],
    'd.recording':        ['Recording…', 'Wird erfasst…'],
    'd.confirmReject':    ['Reject this draft and return the case for manual handling?', 'Diesen Entwurf ablehnen und den Fall zur manuellen Bearbeitung zurückgeben?'],
    'd.toastRejected':    ['Rejected – case returned for manual handling.', 'Abgelehnt – Fall zur manuellen Bearbeitung zurückgegeben.'],
    'd.toastPrint':       ['Approved – letter ready to print.', 'Freigegeben – Schreiben druckbereit.'],
    'd.toastCM':          ['Approved – escalation sent to the Case Manager.', 'Freigegeben – Eskalation an den Fallmanager gesendet.'],
    'd.toastMail':        ['Approved – letter emailed to the applicant.', 'Freigegeben – Schreiben per E-Mail versendet.'],
    'd.failed':           ['Could not record the decision: {e}', 'Entscheidung konnte nicht erfasst werden: {e}'],
    // processing steps (keys from view.py)
    'step.received':      ['Trigger received', 'Auslöser empfangen'],
    'step.received.d':    ['New application received – starting the case review.', 'Neuer Antrag eingegangen – die Fallprüfung beginnt.'],
    'step.docs':          ['Reading documents', 'Dokumente lesen'],
    'step.docs.d':        ['Loading the case documents.', 'Die Falldokumente werden geladen.'],
    'step.sops':          ['Reading SOPs', 'SOPs lesen'],
    'step.sops.d':        ['Loading the SOPs and policies.', 'SOPs und Richtlinien werden geladen.'],
    'step.casefile':      ['Building the case file', 'Fallakte erstellen'],
    'step.casefile.d':    ['Reading applicant, representative and dates from the documents.', 'Antragsteller/in, Vertretung und Daten werden aus den Dokumenten gelesen.'],
    'step.history':       ['Checking the case history', 'Fallhistorie prüfen'],
    'step.history.d':     ['Looking up earlier cases of the applicant.', 'Frühere Fälle der antragstellenden Person werden gesucht.'],
    'step.rules':         ['Applying the rules', 'Regeln anwenden'],
    'step.rules.d':       ['Applying the SOP and policy rules to the case.', 'Die SOP- und Richtlinienregeln werden auf den Fall angewendet.'],
    'step.check':         ['Completeness check', 'Vollständigkeitsprüfung'],
    'step.check.d':       ['Checking the application and the deadlines.', 'Antrag und Fristen werden geprüft.'],
    'step.prepare':       ['Drafting the outreach', 'Kontaktaufnahme entwerfen'],
    'step.prepare.d':     ['Drafting the letter or the escalation.', 'Das Schreiben oder die Eskalation wird entworfen.'],
    'step.review':        ['Caseworker review', 'Prüfung durch Sachbearbeitung'],
    'step.review.d':      ['Waiting for the caseworker to approve or reject.', 'Wartet auf Freigabe oder Ablehnung durch die Sachbearbeitung.'],
    'step.decision':      ['Decision recorded', 'Entscheidung erfasst'],
    'step.decision.d':    ['The caseworker’s decision is stored with the case.', 'Die Entscheidung der Sachbearbeitung wird beim Fall gespeichert.'],
    'step.dispatch':      ['Dispatch', 'Versand'],
    'step.dispatch.d':    ['Letter emailed or printed, or escalation sent to the Case Manager.', 'Schreiben per E-Mail versendet oder gedruckt, oder Eskalation an den Fallmanager gesendet.'],
  };

  const t = (key, vars) => {
    const row = T[key];
    let s = row ? row[lang === 'de' ? 1 : 0] : key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
    return s;
  };
  const has = key => key in T;
  const MONTHS = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    de: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'],
  };
  const locale = lang === 'de' ? 'de-DE' : [];
  // "2026-10-20" -> "20. Okt. 2026" / "20 Oct 2026"
  const date = iso => {
    const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return iso || '–';
    return lang === 'de' ? `${+m[3]}. ${MONTHS.de[+m[2] - 1]} ${m[1]}` : `${+m[3]} ${MONTHS.en[+m[2] - 1]} ${m[1]}`;
  };

  function apply(root = document) {
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
    root.querySelectorAll('.lang-sw button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
  }
  function setLang(l) {
    try { localStorage.setItem(STORE, l); } catch (e) { /* not remembered */ }
    const u = new URL(location.href);
    u.searchParams.set('lang', l);   // also works when storage is blocked
    location.replace(u);
  }

  const css = document.createElement('style');
  css.textContent = `.lang-sw{display:inline-flex;padding:3px;gap:2px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);flex:none}
    .lang-sw button{font:inherit;font-size:11.5px;font-weight:600;letter-spacing:.4px;border:0;border-radius:999px;padding:4px 9px;background:transparent;color:rgba(255,255,255,.8);cursor:pointer}
    .lang-sw button:hover{color:#fff}
    .lang-sw button.on{background:#fff;color:#1b2430}`;
  document.head.appendChild(css);

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-sw').forEach(sw => {
      sw.innerHTML = '<button type="button" data-lang="de" title="Deutsch">DE</button><button type="button" data-lang="en" title="English">EN</button>';
      sw.querySelectorAll('button').forEach(b => b.onclick = () => { if (b.dataset.lang !== lang) setLang(b.dataset.lang); });
    });
    apply();
  });
  document.documentElement.lang = lang;

  window.I18N = { lang, t, has, date, locale, apply, setLang };
})();
