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

# Cloudflare terminates TLS before requests reach Nginx. Django therefore
# receives every request over plain HTTP.  Tell it to trust the
# X-Forwarded-Proto header that Nginx injects (set to "https" unconditionally
# in the Nginx proxy config) so that Django treats all requests as HTTPS.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Do NOT redirect to HTTPS inside Django — Cloudflare already enforces it at
# the edge.  Enabling this with Flexible SSL causes an infinite redirect loop:
# Cloudflare → HTTP → Nginx → HTTP → Django → 301 → repeat.
SECURE_SSL_REDIRECT = False

# Django 4.0+: declare the trusted origins for CSRF checks.
# Must list the HTTPS URLs that browsers actually use.
CSRF_TRUSTED_ORIGINS = [
    "https://tradalyst.com",
    "https://app.tradalyst.com",
    "https://api.tradalyst.com",
]

# Trust the Host header forwarded by Nginx.
USE_X_FORWARDED_HOST = True

# Tell browsers to only send cookies over HTTPS.
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# HSTS — instruct browsers to use HTTPS for one year.
# Django sends this header; Cloudflare passes it through to the browser.
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# httpOnly JWT cookie settings — SameSite=None + Domain=.tradalyst.com required so
# api.tradalyst.com can set cookies that app.tradalyst.com middleware can read.
COOKIE_SECURE: bool = True
COOKIE_SAMESITE: str = "None"
COOKIE_DOMAIN: str = ".tradalyst.com"
