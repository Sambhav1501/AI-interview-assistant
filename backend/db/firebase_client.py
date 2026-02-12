import os
import logging
import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger(__name__)

_db = None


def initialize_firebase():
    global _db

    if firebase_admin._apps:
        logger.info("✅ Firebase already initialized")
        return _db

    # 🔒 HARD absolute backend root
    BACKEND_ROOT = os.path.abspath(
        os.path.normpath(
            os.path.join(os.path.dirname(__file__), "..")
        )
    )

    cred_path = os.getenv(
        "FIREBASE_CREDENTIALS_PATH",
        os.path.abspath(
            os.path.join(BACKEND_ROOT, "firebase_admin_key.json")
        ),
    )

    logger.info(f"🔍 Firebase credential path resolved to: {cred_path}")

    if not os.path.isfile(cred_path):
        raise FileNotFoundError(f"Firebase credentials not found at {cred_path}")

    project_id = os.getenv("FIREBASE_PROJECT_ID")
    if not project_id:
        raise EnvironmentError("FIREBASE_PROJECT_ID is not set")

    try:
        cred = credentials.Certificate(cred_path)

        firebase_admin.initialize_app(
            cred,
            {"projectId": project_id},
        )

        _db = firestore.client()
        logger.info("✅ Firebase Admin SDK initialized successfully")
        return _db

    except Exception:
        logger.exception("❌ Firebase initialization failed")
        raise


def get_db():
    if _db is None:
        raise RuntimeError("Firebase has not been initialized")
    return _db
