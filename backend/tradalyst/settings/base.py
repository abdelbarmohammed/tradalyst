"""
Shared settings inherited by development.py and production.py.
Never import this module directly — always use an environment-specific file.
"""

from pathlib import Path
from decouple import config
from datetime import timedelta
from core.constants import ACCESS_TOKEN_LIFETIME_MINUTES, REFRESH_TOKEN_LIFETIME_DAYS

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

# BASE_DIR points to the backend/ folder (two levels up from this file).
# All other paths are built relative to this so the project is portable.
BASE_DIR = Path(__file__).resolve().parent.parent.parent


# ---------------------------------------------------------------------------
# Security
# ---------------------------------------------------------------------------

# SECRET_KEY must never be hardcoded. python-decouple reads it from .env.
SECRET_KEY = config("SECRET_KEY")

CLAUDE_API_KEY: str = config("CLAUDE_API_KEY", default="")
FINNHUB_API_KEY: str = config("FINNHUB_API_KEY", default="")
STRIPE_SECRET_KEY: str = config("STRIPE_SECRET_KEY", default="")
STRIPE_WEBHOOK_SECRET: str = config("STRIPE_WEBHOOK_SECRET", default="")
STRIPE_PRO_PRICE_ID: str = config("STRIPE_PRO_PRICE_ID", default="")

# ALLOWED_HOSTS is set per environment — base leaves it empty on purpose.
ALLOWED_HOSTS: list[str] = []


# ---------------------------------------------------------------------------
# Application definition
# ---------------------------------------------------------------------------

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
]

LOCAL_APPS = [
    "apps.users",
    "apps.trades",
    "apps.analysis",
    "apps.mentors",
    "apps.prices",
    "apps.billing",
]

# Splitting into three groups makes it easy to see what is framework,
# what is third-party, and what is our own code.
INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS


# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

MIDDLEWARE = [
    # CorsMiddleware must be first — before CommonMiddleware — so that CORS
    # headers are added to every response, including 4xx errors.
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ---------------------------------------------------------------------------
# URL configuration
# ---------------------------------------------------------------------------

ROOT_URLCONF = "tradalyst.urls"


# ---------------------------------------------------------------------------
# Templates (needed for Django admin)
# ---------------------------------------------------------------------------

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ---------------------------------------------------------------------------
# WSGI / ASGI
# ---------------------------------------------------------------------------

WSGI_APPLICATION = "tradalyst.wsgi.application"


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

# DATABASE_URL is read from .env. Format:
# postgresql://postgres:password@localhost:5432/tradalyst_dev
# We parse it manually rather than pulling in dj-database-url to keep
# dependencies minimal.
_db_url = config("DATABASE_URL")

def _parse_db_url(url: str) -> dict:
    """Parse a postgres:// URL into a Django DATABASES dict."""
    from urllib.parse import urlparse
    parsed = urlparse(url)
    return {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": parsed.path.lstrip("/"),
        "USER": parsed.username,
        "PASSWORD": parsed.password,
        "HOST": parsed.hostname,
        "PORT": str(parsed.port or 5432),
    }

DATABASES = {
    "default": _parse_db_url(_db_url)
}

# Use BigAutoField for all auto-generated primary keys.
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ---------------------------------------------------------------------------
# Custom user model
# ---------------------------------------------------------------------------

# We replace Django's built-in User with our own so we can add role,
# bio, and other trader-specific fields without hacks.
AUTH_USER_MODEL = "users.CustomUser"


# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ---------------------------------------------------------------------------
# Internationalisation
# ---------------------------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------------------------
# Static files
# ---------------------------------------------------------------------------

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"


# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------

REST_FRAMEWORK = {
    # All endpoints require authentication unless explicitly marked public.
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.users.authentication.CookieJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    # Pagination applied globally — individual views can override page_size.
    "DEFAULT_PAGINATION_CLASS": "core.pagination.StandardResultsPagination",
    "PAGE_SIZE": 20,
    # django-filter integration for trade list filtering.
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
    ],
    # Return proper 4xx JSON errors instead of Django HTML error pages.
    "EXCEPTION_HANDLER": "core.exceptions.custom_exception_handler",
}


# ---------------------------------------------------------------------------
# JWT (djangorestframework-simplejwt)
# ---------------------------------------------------------------------------

# Token lifetimes come from constants.py — never hardcode durations here.
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=ACCESS_TOKEN_LIFETIME_MINUTES),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=REFRESH_TOKEN_LIFETIME_DAYS),
    "SIGNING_KEY": config("JWT_SIGNING_KEY"),
    # Rotate refresh tokens: every time you refresh, you get a new refresh
    # token and the old one is blacklisted. Tighter security with no UX cost.
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    # Read the JWT from the Authorization header as a Bearer token.
    # The Next.js API client attaches it — httpOnly cookies are handled
    # in the auth views, not here at the DRF level.
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

# Allowed origins are set per environment (dev vs prod).
# This base just declares the setting exists.
CORS_ALLOWED_ORIGINS: list[str] = []

# Allow cookies to be sent cross-origin (needed for httpOnly JWT cookies).
CORS_ALLOW_CREDENTIALS = True


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "apps": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}
