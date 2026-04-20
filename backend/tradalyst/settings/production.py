"""
Production settings for the Hetzner VPS.
Activate with: DJANGO_SETTINGS_MODULE=tradalyst.settings.production
"""

from decouple import config
from .base import *  # noqa: F401, F403

DEBUG = False

ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=lambda v: [s.strip() for s in v.split(",")])

CORS_ALLOWED_ORIGINS = [
    "https://tradalyst.com",
    "https://app.tradalyst.com",
]

# Tell browsers to only send cookies over HTTPS.
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Force HTTPS for one year (31536000 seconds). Only enable once SSL is confirmed working.
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Redirect all HTTP requests to HTTPS.
SECURE_SSL_REDIRECT = True

# httpOnly JWT cookie settings — SameSite=None required for cross-subdomain (api.* ↔ app.*).
COOKIE_SECURE: bool = True
COOKIE_SAMESITE: str = "None"
