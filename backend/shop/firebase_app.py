import os
from pathlib import Path

import firebase_admin
from firebase_admin import credentials

_initialized = False
BASE_DIR = Path(__file__).resolve().parent.parent


def _resolve_credentials_path() -> Path | None:
    raw = os.getenv('FIREBASE_ACCOUNT_CREDENTIALS_PATH')
    if not raw:
        return None
    path = Path(raw)
    if not path.is_absolute():
        path = BASE_DIR / path
    return path if path.is_file() else None


def ensure_firebase_initialized() -> None:
    global _initialized
    if _initialized:
        return

    credentials_path = _resolve_credentials_path()
    if credentials_path is None:
        raise RuntimeError(
            'FIREBASE_ACCOUNT_CREDENTIALS_PATH must point to a service account JSON file.'
        )

    cred = credentials.Certificate(str(credentials_path))
    firebase_admin.initialize_app(cred)
    _initialized = True
