# Zero Gap Agent – Caseworker Portal

Frontend only. The two agents run in n8n; this app reads their executions through the n8n API and shows them:
home page with live counters, one portal per agent (progress steps + review), Approve / Reject with
✉ e-mail and/or 🖨 print buttons, printable letter, and CSV exports for ARIS Process Mining.

## Run
```
pip install -r requirements.txt
copy .env.example .env      (Windows)   |   cp .env.example .env   (Mac/Linux)
python app.py
```
Open http://localhost:8000

## Setup in n8n
1. Settings → **n8n API** → create an API key → `N8N_API_KEY`.
2. The two workflow IDs → `N8N_WORKFLOW_ARIS` and `N8N_WORKFLOW_ZERO`.
3. In both flows: ⋯ → Settings → **Save execution progress = Save** (steps show live).

If Approve / Reject in the portal shows an error, approve from the review e-mail – newer n8n versions sign the resume link.

## Deploy on Railway
One service runs everything: the Python server also serves the pages.
1. Push this folder to a GitHub repo (`.env` is git-ignored – never commit it).
2. Railway → **New Project → Deploy from GitHub repo** → pick the repo. `railway.json` sets the start command and health check.
3. **Variables**: `N8N_URL`, `N8N_API_KEY`, `N8N_WORKFLOW_ARIS`, `N8N_WORKFLOW_ZERO`, and `PORTAL_USER` / `PORTAL_PASSWORD`
   (browser login – strongly recommended, the portal shows applicant data).
4. **Volume**: add one mounted at `/data` and set `CASE_MEMORY_FILE=/data/.case_memory.json`, so the last cases survive a redeploy.
5. **Settings → Networking → Generate Domain**, then open the URL.

## Language
The portal is in German by default; the **DE | EN** switch in the header changes it (remembered per browser, or use `?lang=en` / `?lang=de` in a link).
Texts live in `portal/i18n.js`. The CSV exports are always German (`portal/de.py`); letters and findings come from the n8n flows in their own language.
