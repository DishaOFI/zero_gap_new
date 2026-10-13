"""Settings from a .env file next to app.py (see .env.example)."""
import os, re
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        v = v.strip()
        if len(v) >= 2 and v[0] in '"\'' and v[0] in v[1:]:
            v = v[1:v.index(v[0], 1)]
        else:
            v = '' if v.startswith('#') else re.split(r'\s#', v, maxsplit=1)[0].strip()
        os.environ.setdefault(k.strip(), v)


_load_dotenv(ROOT / '.env')
_env = lambda k, d='': os.environ.get(k, d).strip()  # noqa: E731


@dataclass
class Settings:
    host: str = field(default_factory=lambda: _env('HOST', '0.0.0.0'))
    port: int = field(default_factory=lambda: int(_env('PORT', '8000')))
    n8n_url: str = field(default_factory=lambda: _env('N8N_URL').rstrip('/'))
    n8n_api_key: str = field(default_factory=lambda: _env('N8N_API_KEY'))
    n8n_workflow_aris: str = field(default_factory=lambda: _env('N8N_WORKFLOW_ARIS'))
    n8n_workflow_zero: str = field(default_factory=lambda: _env('N8N_WORKFLOW_ZERO'))
    portal_user: str = field(default_factory=lambda: _env('PORTAL_USER'))
    portal_password: str = field(default_factory=lambda: _env('PORTAL_PASSWORD'))


settings = Settings()
