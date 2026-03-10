"""
Development settings. Never use in production.
Activate with: DJANGO_SETTINGS_MODULE=tradalyst.settings.development
"""

from .base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Allow both Next.js frontends running locally.
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # marketing site
    "http://localhost:3001",  # app
]

# httpOnly JWT cookie settings — no HTTPS required in development.
COOKIE_SECURE: bool = False
COOKIE_SAMESITE: str = "Lax"

# Keep the browsable HTML interface available locally for debugging.
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [  # type: ignore[index]
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
]
