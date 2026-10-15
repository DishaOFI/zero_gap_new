"""German labels for the CSV exports (ARIS Process Mining). Column names avoid umlauts so imports stay simple."""

AGENT = {'aris': 'Agent mit ARIS-Kontext', 'zero': 'Agent ohne Kontext'}

STATUS = {'success': 'erfolgreich', 'error': 'Fehler', 'crashed': 'abgestürzt', 'waiting': 'wartend',
          'running': 'läuft', 'new': 'neu', 'canceled': 'abgebrochen'}

FINAL_STATUS = {'Missing Information': 'Fehlende Angaben', 'Ready for Assessment': 'Bereit zur Begutachtung'}

NEXT_STEP = {'escalation': 'Eskalation an Fallmanager', 'letter': 'Nachforderungsschreiben', 'none': 'Bereit zur Begutachtung'}

MATCH = {'Correct person': 'Richtige Person', 'No match': 'Kein Treffer', 'Wrong person': 'Falsche Person'}

DECISION = {'approved': 'freigegeben', 'rejected': 'abgelehnt'}

# n8n node names (the activities of the event log); unknown names are exported unchanged
NODE = {
    'AI: Draft Letter': 'KI: Schreiben entwerfen',
    'AI: Draft Review Summary & Letter': 'KI: Prüfzusammenfassung & Schreiben entwerfen',
    'APPROVED: Release for Dispatch': 'FREIGEGEBEN: Versand freigeben',
    'ARIS Case History': 'ARIS-Fallhistorie',
    'Anything to Convert?': 'Etwas zu konvertieren?',
    'Apply ARIS Policy (SOPs)': 'ARIS-Richtlinien anwenden (SOPs)',
    'Apply SOP Rules': 'SOP-Regeln anwenden',
    'Approved?': 'Freigegeben?',
    'Build ARIS History Query': 'ARIS-Historienabfrage erstellen',
    'Build Case Document Searches': 'Suche nach Falldokumenten vorbereiten',
    'Build Case Document Searches1': 'Suche nach Falldokumenten vorbereiten',
    'Build Case File': 'Fallakte erstellen',
    'Build SOP Searches': 'SOP-Suche vorbereiten',
    'Collect Case Document IDs': 'Falldokument-IDs sammeln',
    'Collect SOP Document IDs': 'SOP-Dokument-IDs sammeln',
    'Completeness Rules Engine': 'Regelwerk Vollständigkeit',
    'Compliance Controls (ARIS)': 'Compliance-Kontrollen (ARIS)',
    'Convert to Google Docs & Sheets': 'In Google Docs & Sheets konvertieren',
    'Create Letter PDF': 'Schreiben als PDF erstellen',
    'Extract Application PDF': 'Antrags-PDF auslesen',
    'Get Case Document (Google Docs)': 'Falldokument abrufen (Google Docs)',
    'Get SOP Document (Google Docs)': 'SOP-Dokument abrufen (Google Docs)',
    'Gmail Trigger': 'E-Mail-Eingang (Gmail)',
    'Gmail Trigger1': 'E-Mail-Eingang (Gmail)',
    'Guardrails: Validate AI Draft': 'Guardrails: KI-Entwurf prüfen',
    'HTTP Request': 'HTTP-Anfrage',
    'Keep Case Documents Only': 'Nur Falldokumente behalten',
    'Keep SOP Documents Only': 'Nur SOP-Dokumente behalten',
    'List Case Documents': 'Falldokumente auflisten',
    'List Folder Files': 'Ordnerdateien auflisten',
    'List SOP Documents': 'SOP-Dokumente auflisten',
    'Look Up Applicant in Event Log': 'Antragsteller/in im Ereignisprotokoll suchen',
    'MCP: Get Case Document Text': 'MCP: Text der Falldokumente abrufen',
    'MCP: Get Document Text': 'MCP: Dokumenttext abrufen',
    'MCP: Get SOP Text': 'MCP: SOP-Text abrufen',
    'MCP: Get Script Language Instructions': 'MCP: Anleitung zur Abfragesprache abrufen',
    'MCP: List DataSets': 'MCP: Datensätze auflisten',
    'MCP: Query Case History': 'MCP: Fallhistorie abfragen',
    'MCP: Retrieve Meta Info': 'MCP: Metainformationen abrufen',
    'Make Google Copy (converted in Drive)': 'Google-Kopie erstellen (in Drive konvertiert)',
    'No outreach needed': 'Keine Kontaktaufnahme nötig',
    'One Item per File': 'Ein Eintrag pro Datei',
    'OpenAI Chat Model': 'OpenAI-Chatmodell',
    'Outreach Needed?': 'Kontaktaufnahme nötig?',
    'Pick Files to Convert': 'Zu konvertierende Dateien auswählen',
    'Prepare Dispatch': 'Versand vorbereiten',
    'Prepare Letter & Review Email': 'Schreiben & Prüf-E-Mail vorbereiten',
    'Print Letter (not connected)': 'Schreiben drucken (nicht verbunden)',
    'Print Letter / Release (no email)': 'Schreiben drucken / Freigabe (ohne E-Mail)',
    'REJECTED: Manual Handling': 'ABGELEHNT: Manuelle Bearbeitung',
    'Read Case Document Text': 'Text der Falldokumente lesen',
    'Read SOP Text': 'SOP-Text lesen',
    'Ready for Assessment?': 'Bereit zur Begutachtung?',
    'Respond: Decision Recorded': 'Antwort: Entscheidung erfasst',
    'Respond: Letter Released': 'Antwort: Schreiben freigegeben',
    'Search Case Documents': 'Falldokumente suchen',
    'Search Event Log by Name': 'Ereignisprotokoll nach Namen durchsuchen',
    'Search event log by name': 'Ereignisprotokoll nach Namen durchsuchen',
    'Search SOPs and Amendments': 'SOPs und Richtlinienänderungen suchen',
    'Send Letter or Escalation': 'Schreiben oder Eskalation senden',
    'Send Review Email (letter attached)': 'Prüf-E-Mail senden (Schreiben angehängt)',
    'Send by Email?': 'Per E-Mail senden?',
    'Wait for Caseworker Decision': 'Auf Entscheidung der Sachbearbeitung warten',
    'Write Case Record (CRM)': 'Falldatensatz schreiben (CRM)',
    'Zero-Context Agent': 'Agent ohne Kontext',
    # node names of earlier versions of the flows (still in older runs)
    'Build ARIS Case Query': 'ARIS-Fallabfrage erstellen',
    'Extract from File': 'Aus Datei auslesen',
    'Link Case & Compute SLA': 'Fall verknüpfen & Frist berechnen',
    'MCP: Query Application details': 'MCP: Antragsdetails abfragen',
    'Parse Application Form': 'Antragsformular auswerten',
    'Search relevant Document': 'Relevantes Dokument suchen',
    'Split Document IDs': 'Dokument-IDs aufteilen',
    'Transform Application Data': 'Antragsdaten umwandeln',
}
