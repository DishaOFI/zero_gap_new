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
    't.due':              ['due {d}', 'fällig am {d}'],
    't.internal':         ['Internal target', 'Internes Ziel'],
    't.ofLeft':           ['of {n} working days left', 'von {n} Arbeitstagen übrig'],
    't.atRisk':           ['At risk', 'Gefährdet'],
    't.per':              ['per {p}', 'gemäß {p}'],
    't.next':             ['Next step', 'Nächster Schritt'],
    't.escalate':         ['Escalate to Case Manager', 'Eskalation an Fallmanager'],
    't.letter':           ['Outreach letter', 'Anschreiben'],
    't.release':          ['Release for assessment', 'Freigabe zur Begutachtung'],
    't.phone':            ['phone outreach', 'telefonische Kontaktaufnahme'],
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
    'r.amendments':       ['Policy amendments in ARIS', 'Richtlinienänderungen in ARIS'],
    'r.notApplied':       ['(not applied automatically – check manually)', '(nicht automatisch angewendet – bitte manuell prüfen)'],
    'r.unknownAmendment': ['Policy amendment {p} is published in ARIS, but the agent does not apply it yet – please check it manually.',
                           'Die Richtlinienänderung {p} ist in ARIS veröffentlicht, wird vom Agenten aber noch nicht angewendet – bitte manuell prüfen.'],
    'r.outstanding':      ['Outstanding items', 'Offene Punkte'],
    'r.missingTag':       ['Missing', 'Fehlt'],
    'r.toCheck':          ['Points to check', 'Zu prüfen'],
    'r.checkTag':         ['Check', 'Prüfen'],
    'r.suggested':        ['Suggested from the case history', 'Vorschläge aus der Fallhistorie'],
    'r.suggestionTag':    ['Suggestion', 'Vorschlag'],
    'r.escNote':          ['Escalation note to the Case Manager', 'Eskalationsnotiz an den Fallmanager'],
    'r.draftTo':          ['Draft letter to {n}', 'Entwurf des Schreibens an {n}'],
    'r.sentDe':           ['', 'Diese deutsche Fassung wird nach Ihrer Freigabe versendet. Eine englische Referenzfassung sehen Sie unter EN.'],
    'r.refCopy':          ['English reference copy only – after your approval the German version is sent (switch to DE to read it).', ''],
    'r.refSuffix':        [' – English reference copy', ''],
    'r.onlyEn':           ['', 'Vorgang aus der Zeit vor der Umstellung: Das Schreiben liegt nur auf Englisch vor und wird so versendet.'],
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

  // ---- texts written by the n8n flows (fixed sentence templates in their code) – translated for display only.
  // Anything that matches no rule is shown unchanged. Letters are not translated: they are what is sent.
  const MON_EN = { january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11 };
  const MON_DE_LONG = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const dates = s => s.replace(/\b(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)\.? (\d{4})\b/g,
    (m, d, mon, y) => { const i = MON_EN[mon.toLowerCase()]; return `${d}. ${mon.length > 4 ? MON_DE_LONG[i] : MONTHS.de[i]} ${y}`; });
  const SECTION = { 'Applicant Data': 'Antragsdaten', 'Type of Benefit': 'Leistungsart', 'Execution': 'Unterschrift', 'Medical Contacts': 'Ärztliche Kontakte',
    'Legal Representation': 'Gesetzliche Vertretung' };
  const REL = { son: 'Sohn', daughter: 'Tochter', spouse: 'Ehepartner/in', wife: 'Ehefrau', husband: 'Ehemann', partner: 'Partner/in', mother: 'Mutter',
    father: 'Vater', brother: 'Bruder', sister: 'Schwester', child: 'Kind', guardian: 'Betreuer/in', friend: 'Freund/in', neighbour: 'Nachbar/in',
    neighbor: 'Nachbar/in', carer: 'Pflegeperson', 'legal guardian': 'gesetzliche/r Betreuer/in', 'authorized person': 'bevollmächtigte Person' };
  const FIELD = {
    'Applicant': 'Antragsteller/in', 'Address': 'Anschrift', 'Member number': 'Versichertennummer', 'Case reference': 'Aktenzeichen',
    'Representative': 'Vertreter/in', 'Benefit applied for': 'Beantragte Leistung', 'GP (Hausarzt)': 'Hausarzt/Hausärztin', 'Care level': 'Pflegegrad',
    'Statutory decision deadline': 'Gesetzliche Entscheidungsfrist', 'Internal service target': 'Internes Serviceziel', 'Next step': 'Nächster Schritt',
    'Policy amendments applied': 'Angewandte Richtlinienänderungen', 'Caregiver': 'Pflegeperson', 'E-mail': 'E-Mail', 'Monthly benefit': 'Monatliche Leistung',
    'Escalation': 'Eskalation', 'Telephone': 'Telefon', 'Date of birth': 'Geburtsdatum',
  };
  const WHOLE = {
    'Not specified': 'Nicht angegeben', 'Not provided': 'Nicht angegeben', 'Not yet assessed': 'Noch nicht begutachtet', 'New application': 'Neuer Antrag',
    'the applicant': 'die antragstellende Person', 'applicant': 'Antragsteller/in', 'family member (assumed)': 'Familienangehörige/r (angenommen)',
    'family doctor at the applicant’s address (assumed)': 'Hausarzt am Wohnort der antragstellenden Person (angenommen)',
    'Bank details and last three bank statements – mandatory.': 'Bankverbindung und die letzten drei Kontoauszüge – verpflichtend.',
    'Care provider contract – mandatory.': 'Vertrag mit dem Pflegedienst – verpflichtend.',
    'Copy of the applicant’s identity card – mandatory.': 'Kopie des Personalausweises der antragstellenden Person – verpflichtend.',
    'Hospital discharge report (Entlassungsbericht) – mandatory.': 'Krankenhaus-Entlassungsbericht – verpflichtend.',
    'Medical reports and diagnosis from all treating doctors – mandatory.': 'Arztberichte und Diagnosen aller behandelnden Ärztinnen und Ärzte – verpflichtend.',
    'Current address is missing.': 'Die aktuelle Anschrift fehlt.',
    'Date of birth is missing.': 'Das Geburtsdatum fehlt.',
    'Full name of the applicant is missing.': 'Der vollständige Name der antragstellenden Person fehlt.',
    'Insurance / member number is missing.': 'Die Versichertennummer fehlt.',
    'GP (Hausarzt) name and address missing.': 'Name und Anschrift des Hausarztes fehlen.',
    'No benefit type selected. The MD assessment can still be commissioned, but a benefit type is required before a decision can be issued.':
      'Keine Leistungsart gewählt. Der Medizinische Dienst kann bereits beauftragt werden, vor der Entscheidung muss aber eine Leistungsart vorliegen.',
    'No type of benefit selected – required before the decision can be issued (the Medical Service can still be commissioned).':
      'Keine Leistungsart gewählt – vor der Entscheidung erforderlich (der Medizinische Dienst kann bereits beauftragt werden).',
    'Signature missing – unsigned forms cannot initiate processing.': 'Unterschrift fehlt – nicht unterschriebene Formulare können die Bearbeitung nicht auslösen.',
    'ARIS unavailable – verify case link and SLA start manually.': 'ARIS nicht erreichbar – Fallverknüpfung und Fristbeginn bitte manuell prüfen.',
    'GP (Hausarzt) name and address missing – needed to request the medical history before the assessment.':
      'Name und Anschrift des Hausarztes fehlen – nötig, um vor der Begutachtung die Krankengeschichte anzufordern.',
    'GP name/address missing – needed to request medical history before assessment.':
      'Name und Anschrift des Hausarztes fehlen – nötig, um vor der Begutachtung die Krankengeschichte anzufordern.',
    'Guardianship certificate declared as enclosed but not received as a file.': 'Betreuungsausweis als beigefügt angegeben, aber nicht als Datei erhalten.',
    'No ARIS case found – treated as new, unlinked application; SLA start = email receipt (verify first contact).':
      'Kein ARIS-Fall gefunden – als neuer, nicht verknüpfter Antrag behandelt; Fristbeginn = E-Mail-Eingang (Erstkontakt prüfen).',
    'No specialists listed (optional but preferred).': 'Keine Fachärzte angegeben (optional, aber erwünscht).',
    'No email or postal address on file – send manually.': 'Weder E-Mail- noch Postanschrift hinterlegt – bitte manuell versenden.',
  };
  const SUGGEST = { 'the benefit type': 'die Leistungsart liegt', 'the general practitioner': 'die Angabe zum Hausarzt liegt',
    'the representative identity proof': 'der Identitätsnachweis der bevollmächtigten Person liegt' };
  const RULES = [
    [/^(.+) \(born (.+)\)$/, (m, n, d) => `${n === 'the applicant' ? WHOLE[n] : n} (geb. ${d})`],
    [/^(.+) \(family caregiver, assumed\)$/, (m, n) => `${n} (pflegende/r Angehörige/r, angenommen)`],
    [/^(.+) \(([a-z ]+)\)$/, (m, n, r) => REL[r] ? `${n} (${REL[r]})` : m],
    [/^(.+) \((\d+) working days remaining\)$/, (m, d, n) => `${d} (noch ${n} Arbeitstage)`],
    [/^(\d+) working days remaining$/, (m, n) => `noch ${n} Arbeitstage`],
    [/^Letter to (.+) – after your approval$/, (m, n) => `Schreiben an ${n === 'the applicant' ? WHOLE[n] : n} – nach Ihrer Freigabe`],
    [/^Escalation to the Case Manager – a missing-information request was already sent on (.+?)( \(per (.+)\))?$/,
      (m, d, x, p) => `Eskalation an den Fallmanager – eine Nachforderung wurde bereits am ${d} gesendet${p ? ` (gemäß ${p})` : ''}`],
    [/^a missing-information request was already sent on (.+)$/, (m, d) => `eine Nachforderung wurde bereits am ${d} gesendet`],
    [/^Level (\d+) – (Team Lead|Case Manager)$/, (m, n, o) => `Stufe ${n} – ${o === 'Team Lead' ? 'Teamleitung' : 'Fallmanager'}`],
    [/^Identity proof of authorized representative (.+?) is missing – Vollmacht \(power of attorney\): identity check covers the applicant only\.$/,
      (m, n) => `Identitätsnachweis der bevollmächtigten Person ${n} fehlt – Vollmacht: Die Identitätsprüfung umfasst nur die antragstellende Person.`],
    [/^Identity proof of authorized representative (.+?) is missing\.$/, (m, n) => `Identitätsnachweis der bevollmächtigten Person ${n} fehlt.`],
    [/^Check earlier ARIS case (\S+) – (the benefit type|the general practitioner|the representative identity proof) may already be on file there \(suggestion only\)\.$/,
      (m, c, w) => `Früheren ARIS-Fall ${c} prüfen – ${SUGGEST[w]} dort eventuell bereits vor (nur Vorschlag).`],
    [/^After approval the escalation is sent to the Case Manager \((.+?)\) for phone outreach today$/,
      (m, e) => `Nach der Freigabe geht die Eskalation an den Fallmanager (${e}) – telefonische Kontaktaufnahme noch heute`],
    [/^After approval the letter can be emailed to (\S+) or printed and posted to (.+)\.$/,
      (m, e, a) => `Nach der Freigabe kann das Schreiben per E-Mail an ${e} gesendet oder gedruckt und per Post an ${a} geschickt werden.`],
    [/^No email address on file – after approval the letter is printed and posted to (.+)\.$/,
      (m, a) => `Keine E-Mail-Adresse hinterlegt – nach der Freigabe wird das Schreiben gedruckt und per Post an ${a} geschickt.`],
  ];
  // "(per Operating Procedure §3 (Applicant Data))" / "(per PA-2026-02)" at the end of a sentence
  const PER = /\s*\(per (?:Operating Procedure (§\d+) \(([^)]+)\)|([^()]+))\)(\.?)$/;
  const perDe = (m, sec, name, other, dot) => ` (gemäß ${sec ? `Verfahrensanweisung ${sec} (${SECTION[name] || name})` : other})${dot}`;

  function tx(text) {
    if (lang !== 'de' || text == null || text === '') return text;
    let s = String(text).trim(), tail = '';
    const per = s.match(PER);
    if (per) { tail = s.slice(per.index).replace(PER, perDe); s = s.slice(0, per.index); }
    let out = WHOLE[s] ?? WHOLE[s + '.']?.slice(0, -1);
    if (out == null) for (const [re, fn] of RULES) { if (re.test(s)) { out = s.replace(re, fn); break; } }
    if (out == null) out = s;
    return dates(out + tail);
  }
  const field = k => (lang === 'de' && FIELD[k]) || k;

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

  window.I18N = { lang, t, has, date, locale, apply, setLang, tx, field };
})();
