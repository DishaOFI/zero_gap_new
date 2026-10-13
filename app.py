"""Zero Gap Agent – caseworker portal. The agents run in n8n; this app shows them.

  python app.py        then open http://localhost:8000
"""
import uvicorn
from portal.settings import settings

if __name__ == '__main__':
    uvicorn.run('portal.server:app', host=settings.host, port=settings.port, log_level='info')
