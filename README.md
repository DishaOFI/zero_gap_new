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

## Deploy on Render (free tier)
1. Push this folder to a GitHub/GitLab repo (`.env` is git-ignored – never commit it).
2. Render → **New → Blueprint** → pick the repo. It reads `render.yaml` (free Python web service).
3. Fill in the prompted secrets: `N8N_API_KEY`, `N8N_WORKFLOW_ARIS`, `N8N_WORKFLOW_ZERO`,
   and `PORTAL_USER` / `PORTAL_PASSWORD` (browser login – strongly recommended, the portal shows applicant data).
4. Open `https://<service>.onrender.com`.

Free instances sleep after 15 min without traffic; the first request afterwards takes ~1 min.
