import os

import firebase_admin
from firebase_admin import credentials

_initialized = False


def ensure_firebase_initialized() -> None:
    global _initialized
    if _initialized:
        return

    credentials_path = os.getenv('FIREBASE_ACCOUNT_CREDENTIALS_PATH')
    if not credentials_path or not os.path.isfile(credentials_path):
        raise RuntimeError(
            'FIREBASE_ACCOUNT_CREDENTIALS_PATH must point to a service account JSON file.'
        )

    cred = credentials.Certificate(credentials_path)
    firebase_admin.initialize_app(cred)
    _initialized = True
