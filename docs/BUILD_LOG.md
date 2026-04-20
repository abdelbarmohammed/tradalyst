# Tradalyst — Build Log

> Living record of what has been built, updated after every major milestone.
> Will serve as source material for the Spanish memoria documentation.
> Last updated: 2026-04-20

---

## Project Overview

Tradalyst is a full-stack AI-powered trading journal built as a final project (DAW) at Digitech FP, Málaga. Traders log trades with entry/exit prices, position size, emotional state, and reasoning notes. The backend exposes a Django REST API that feeds three surfaces: a trade journal, a statistics dashboard, and an AI chat interface powered by Claude. The platform supports three non-overlapping roles — trader, mentor, and admin — with JWT authentication stored exclusively in httpOnly cookies.

---

## Milestone 1 — Environment Setup & Project Scaffold

**Date:** 2026-04 (initial commits)

### What Was Installed

- **Python 3.12** via Homebrew (`brew install python@3.12`)
- **PostgreSQL 15** via Homebrew (`brew install postgresql@15`), running as a Mac background service (`brew services start postgresql@15`)
- **Node.js 20** via Homebrew (frontend, not yet built)
- **Python virtual environment** at `backend/venv/` — activated per session with `source venv/bin/activate`

### Key Dependencies (backend/requirements.txt)

| Package | Version | Purpose |
|---------|---------|---------|
| `django` | 5.0.4 | Web framework |
| `djangorestframework` | 3.15.1 | REST API layer |
| `djangorestframework-simplejwt` | 5.3.1 | JWT auth + token blacklist |
| `django-cors-headers` | 4.3.1 | CORS for cross-origin frontend |
| `psycopg2-binary` | 2.9.9 | PostgreSQL driver |
| `python-decouple` | 3.8 | `.env` file reader |
| `anthropic` | 0.25.1 | Claude API client |
| `django-filter` | 24.2 | QuerySet filtering for trade list |
| `requests` | 2.31.0 | HTTP calls to CoinGecko + Finnhub |
| `gunicorn` | 21.2.0 | Production WSGI server |

### How PostgreSQL Runs Locally

PostgreSQL starts automatically as a Homebrew background service on Mac. No Docker. The database is `tradalyst_dev`, accessible via:

```bash
psql -U postgres -d tradalyst_dev
```

The `DATABASE_URL` in `backend/.env` uses the format:
```
postgresql://postgres:password@localhost:5432/tradalyst_dev
```

Django parses this URL with a custom inline parser in `base.py` — `dj-database-url` was deliberately excluded to keep dependencies minimal.

### Settings Architecture

Three-file settings split — never a single `settings.py`:
- `tradalyst/settings/base.py` — shared configuration (DB, DRF, JWT, CORS, logging)
- `tradalyst/settings/development.py` — `DEBUG=True`, local CORS origins, local DB
- `tradalyst/settings/production.py` — `DEBUG=False`, real domain CORS, Nginx-aware

The active settings file is selected via the `DJANGO_SETTINGS_MODULE` environment variable set in `.env`.

---

## Milestone 2 — Backend: apps/users/

**Files:** `models.py`, `serializers.py`, `views.py`, `urls.py`, `user_urls.py`, `permissions.py`, `authentication.py`

### What Was Built

**Custom user model** (`CustomUser`) that replaces Django's default `User`:
- Login field is `email` (not `username`)
- Fields: `email`, `display_name`, `bio`, `role`, `is_active`, `is_staff`, `date_joined`
- Table: `users_customuser`
- `CustomUserManager` handles `create_user` and `create_superuser`

**Three roles** defined as a `TextChoices` enum:

| Role | Value | Default |
|------|-------|---------|
| `trader` | `"trader"` | Yes |
| `mentor` | `"mentor"` | No |
| `admin` | `"admin"` | No |

**JWT authentication via httpOnly cookies** — custom `CookieJWTAuthentication` class (`authentication.py`) extends `JWTAuthentication` to read the token from the `access_token` cookie instead of the `Authorization` header. This means credentials never touch JavaScript.

**Token lifecycle:**
- Access token: 15 minutes (from `core/constants.py`)
- Refresh token: 7 days (from `core/constants.py`)
- `ROTATE_REFRESH_TOKENS = True` — each refresh issues a new refresh token and blacklists the old one
- Logout blacklists the current refresh token via simplejwt's token blacklist app

**Four permission classes** (`permissions.py`):
- `IsTrader` — trader role only
- `IsMentor` — mentor role only
- `IsAdmin` — admin role only
- `IsTraderOrMentor` — shared endpoints (prices, watchlist)

**Auth views** (`urls.py` → `/api/auth/`):
- `RegisterView` — creates user, issues cookie-based JWTs immediately on registration
- `LoginView` — authenticates via Django's `authenticate()`, sets cookies
- `LogoutView` — blacklists refresh token, clears both cookies
- `CookieTokenRefreshView` — reads refresh cookie, issues new access + refresh cookies

**User management views** (`user_urls.py` → `/api/users/`):
- `UserMeView` — GET/PATCH own profile (any authenticated user)
- `AdminUserListView` — list all users (admin only)
- `AdminUserDetailView` — view/modify any user including role and `is_active` (admin only)

### Key Decisions

- **Email as username** — traders identify by email, no separate username field. Avoids a redundant field and is more natural for a web app.
- **httpOnly cookies, not Authorization header** — eliminates XSS token theft. Frontend never touches the JWT. The `CookieJWTAuthentication` class handles this transparently.
- **`password_confirm` required at registration** — `RegisterSerializer` validates both passwords match before creating the user. This means `POST /api/auth/register/` requires `password_confirm` in the request body.
- **Role is set at registration** — `RegisterSerializer` includes `role` in the writable fields, so a trader, mentor, or admin can all self-register. In production, mentor and admin accounts should be created by an admin.

---

## Milestone 3 — Backend: apps/trades/

**Files:** `models.py`, `serializers.py`, `views.py`, `urls.py`, `filters.py`

### What Was Built

**Trade model** — the core journal entry:

| Field | Type | Notes |
|-------|------|-------|
| `user` | FK → CustomUser | Scoped per trader |
| `pair` | CharField(20) | e.g. `BTC/USD`, `EURUSD` |
| `direction` | TextChoices | `long` / `short` |
| `entry_price` | NUMERIC(20,8) | Never FloatField |
| `exit_price` | NUMERIC(20,8) | Nullable (open trade) |
| `quantity` | NUMERIC(20,8) | Position size |
| `entry_time` | DateTimeField | Required |
| `exit_time` | DateTimeField | Nullable (open trade) |
| `pnl` | NUMERIC(20,8) | Nullable — calculated externally or on close |
| `risk_reward_ratio` | NUMERIC(10,4) | Nullable |
| `result` | TextChoices | `win` / `loss` / `breakeven` |
| `emotion` | TextChoices | `calm`, `confident`, `fearful`, `greedy`, `anxious`, `fomo`, `revenge`, `neutral` |
| `notes` | TextField | Free-form trader reasoning |

Default ordering: `-entry_time` (most recent first).

**TradeFilter** (`filters.py`) — querystring filtering via `django-filter`:
- `?pair=BTC` (case-insensitive contains)
- `?direction=long`
- `?result=win`
- `?emotion=fomo`
- `?entry_time_after=2024-01-01` / `?entry_time_before=2024-12-31`

**TradeStatsView** — `GET /api/trades/stats/` returns aggregate analytics:
- Total / closed / winning / losing / breakeven trade counts
- Win rate (percentage)
- Total P&L, average P&L per trade
- Average risk/reward ratio
- Maximum drawdown (peak-to-trough cumulative P&L, chronological)
- Best and worst individual trade P&L
- Most-traded pair

**TradeSerializer validation** — `exit_time` cannot be before `entry_time`. Enforced in the serializer, not the view.

### Key Decisions

- **`NUMERIC(20,8)` for all prices and P&L** — float arithmetic causes rounding errors on financial data. Decimal fields with 8 decimal places handle crypto prices (e.g. `0.00000034`) without loss of precision.
- **P&L is user-supplied** — the API does not calculate P&L server-side. The frontend or the trader enters it. This is intentional: different asset classes have different P&L formulas (forex lots vs crypto units vs stock shares).
- **All querysets filtered by `user=request.user`** — a trader can never read, edit, or delete another trader's trades. Enforced at the queryset level, not with object permissions.
- **Stats computed with ORM aggregation** — no Python loops over querysets for counting or summing. Only the max drawdown calculation iterates in Python (because it requires sequential state).

---

## Milestone 4 — Backend: apps/mentors/

**Files:** `models.py`, `serializers.py`, `views.py`, `urls.py`

### What Was Built

**MentorAssignment** — links a trader to a mentor:
- `unique_together = [("trader", "mentor")]` — one active relationship per pair
- `is_active` flag — allows soft-deactivation without deleting history
- Created by the trader (Pro plan feature)

**MentorAnnotation** — a mentor's note on a specific trade:
- FK to `Trade` and FK to `CustomUser` (mentor)
- Free-text `body` field
- Ordered by `-created_at`

**Six views** across two URL patterns (`/api/mentors/`):

| View | Method | Auth | Description |
|------|--------|------|-------------|
| `AssignmentListCreateView` | GET/POST | Trader | List own mentors / assign a new one |
| `AssignmentDetailView` | GET/DELETE | Trader | View or remove a specific assignment |
| `MentorTraderListView` | GET | Mentor | List all active assigned traders |
| `MentorTraderTradeListView` | GET | Mentor | Read full trade journal of one assigned trader |
| `AnnotationListCreateView` | GET/POST | Mentor | List or add annotations on a specific trade |
| `AnnotationDetailView` | GET/PATCH/DELETE | Mentor | View, edit, or delete an annotation |

### Key Decisions

- **Mentors cannot annotate unassigned traders** — `AnnotationListCreateView.perform_create` checks `MentorAssignment.objects.filter(mentor=..., trader=trade.user, is_active=True).exists()` before saving. Raises `PermissionDenied` if not assigned.
- **`MentorTraderTradeListView` also guards access** — even for reads, the mentor must have an active assignment to the trader whose trades they are requesting.
- **`MentorAssignmentSerializer` validates mentor role** — the `validate_mentor` method raises a `ValidationError` if the assigned user does not have `role == "mentor"`. Prevents traders from being assigned as mentors.
- **Read-only trade access for mentors** — mentors can only list a trader's trades; they cannot create, modify, or delete them. Separate viewsets enforce this cleanly.

---

## Milestone 5 — Backend: apps/prices/

**Files:** `views.py`, `urls.py`, `services/coingecko.py`, `services/finnhub.py`

### What Was Built

**Single endpoint:** `GET /api/prices/?symbols=BTC,ETH,OANDA:EUR_USD,AAPL`

Routes requests to the correct external API based on the symbol:
- **Crypto symbols** (BTC, ETH, SOL, etc.) → CoinGecko
- **Everything else** (forex pairs, stocks) → Finnhub

**CoinGeckoService** (`services/coingecko.py`):
- 19 crypto symbols supported with a hardcoded `SYMBOL_TO_ID` mapping (e.g. `BTC → bitcoin`)
- Returns: `price` (USD), `change_24h`, `market_cap`, `source: "coingecko"`
- Caches responses in Django's cache backend for `PRICE_CACHE_TTL` seconds (60s)
- Cache key includes all requested coin IDs sorted — consistent across different symbol orderings

**FinnhubService** (`services/finnhub.py`):
- Fetches real-time quote for each symbol individually via `/api/v1/quote`
- Returns: `price`, `change_24h` (percentage), `high`, `low`, `source: "finnhub"`
- Caches each symbol separately under `finnhub_{SYMBOL}` key
- Returns `None` (and skips the symbol in the response) if `c` (current price) is missing

### Key Decisions

- **No serializer for prices** — price data is proxied directly from the external APIs as plain dicts. Adding a DRF serializer would add no validation value for passthrough data.
- **`IsTraderOrMentor` permission** — mentors need price data when reviewing a trader's journal. Admins do not need prices (they have no personal journal).
- **Never called from the frontend** — all external API calls go through this Django proxy. API keys stay on the server. The frontend only calls `/api/prices/`.
- **`PRICE_CACHE_TTL` from `core/constants.py`** — the cache duration is a named constant, not a magic number. Currently 60 seconds.

---

## Milestone 6 — Backend: apps/analysis/

**Files:** `models.py`, `serializers.py`, `views.py`, `urls.py`, `services/claude.py`, `services/prompts.py`

### What Was Built

**AiInsight model** — a persisted weekly AI report:
- `content` — Claude's full response text
- `period_start` / `period_end` — the date range analysed
- `trade_count` — number of trades included in the analysis
- Table: `analysis_aiinsight`

**ChatMessage model** — persistent chat history:
- `role` — `user` or `assistant` (TextChoices)
- `content` — message text
- Table: `analysis_chatmessage`
- Ordered by `created_at` ascending (chronological)

**ClaudeService** (`services/claude.py`) — all Claude API calls live here only:

1. `generate_weekly_insight(user)`:
   - Guards: requires at least `AI_INSIGHT_MIN_TRADES` (5) trades in the last `TRADE_SUMMARY_DAYS` (90) days
   - Serialises trades into a plain-text summary block
   - Calls `claude-sonnet-4-6` with the weekly insight system prompt
   - Persists and returns the `AiInsight` object
   - Max tokens: 1500

2. `chat(user, message)`:
   - Builds trade context from last 90 days
   - Fetches last `CHAT_HISTORY_LIMIT` (10) messages as conversation history
   - Sends full message list to Claude with the chat system prompt injected with trade context
   - Persists both the user message and assistant reply
   - Max tokens: 800

**Prompt loading** (`services/prompts.py`):
- System prompts are loaded from `tools/prompts/weekly-insight.txt` and `tools/prompts/chat-system.txt`
- If a file is missing, safe inline defaults are used as fallback
- `build_chat_system_with_context(trade_context)` injects the trader's recent activity into the chat system prompt at call time

**Four views** (`/api/analysis/`):

| View | Method | Description |
|------|--------|-------------|
| `InsightListView` | GET | List all past insights for the trader |
| `InsightGenerateView` | POST | Trigger a new insight generation |
| `ChatHistoryView` | GET | Return full chat history |
| `ChatSendView` | POST | Send a message, receive assistant reply |

### Key Decisions

- **All Claude calls isolated in `services/claude.py`** — views only handle HTTP. No API calls in views or serializers.
- **Prompt templates in `tools/prompts/`** — not hardcoded in Python. This allows prompt iteration without code changes.
- **`AI_INSIGHT_MIN_TRADES` guard** — Claude gives poor analysis on sparse data. The service raises `ValueError` before calling the API if the trader has fewer than 5 trades.
- **Chat history is persistent** — `ChatMessage` rows are stored in the database. The frontend does not need to manage state; it just calls `GET /api/analysis/chat/` to restore the full conversation.
- **Last 10 messages sent to Claude** — `CHAT_HISTORY_LIMIT` keeps the context window manageable. Older messages are still stored in the DB but not included in the API call.
- **Model: `claude-sonnet-4-6`** — hardcoded as a module-level constant `_MODEL` in `claude.py`. Changing models requires one edit in one file.

---

## API Endpoints Summary

All endpoints are prefixed with `/api/`. All require authentication unless marked **Public**.

### Auth — `/api/auth/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register/` | Public | Create account, returns user + sets JWT cookies |
| POST | `/api/auth/login/` | Public | Authenticate, returns user + sets JWT cookies |
| POST | `/api/auth/logout/` | Authenticated | Blacklist refresh token, clear cookies |
| POST | `/api/auth/token/refresh/` | Public | Read refresh cookie, issue new JWT pair |

### Users — `/api/users/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/PATCH | `/api/users/me/` | Authenticated | View or update own profile |
| GET | `/api/users/` | Admin | List all platform users |
| GET/PATCH | `/api/users/<id>/` | Admin | View or modify any user |

### Trades — `/api/trades/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/trades/` | Trader | List own trades (filterable + paginated) |
| POST | `/api/trades/` | Trader | Create a new trade |
| GET | `/api/trades/stats/` | Trader | Aggregate trading statistics |
| GET | `/api/trades/<id>/` | Trader | Retrieve one trade |
| PATCH | `/api/trades/<id>/` | Trader | Update a trade |
| DELETE | `/api/trades/<id>/` | Trader | Delete a trade |

### Analysis — `/api/analysis/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/analysis/insights/` | Trader | List all past AI insights |
| POST | `/api/analysis/insights/generate/` | Trader | Generate a new weekly insight |
| GET | `/api/analysis/chat/` | Trader | Retrieve full chat history |
| POST | `/api/analysis/chat/send/` | Trader | Send a message to Claude AI |

### Mentors — `/api/mentors/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/mentors/assignments/` | Trader | List own mentor assignments |
| POST | `/api/mentors/assignments/` | Trader | Assign a new mentor |
| GET/DELETE | `/api/mentors/assignments/<id>/` | Trader | View or remove an assignment |
| GET | `/api/mentors/my-traders/` | Mentor | List all assigned traders |
| GET | `/api/mentors/traders/<trader_id>/trades/` | Mentor | Read a trader's full journal |
| GET/POST | `/api/mentors/trades/<trade_id>/annotations/` | Mentor | List or add annotations |
| GET/PATCH/DELETE | `/api/mentors/annotations/<id>/` | Mentor | Manage one annotation |

### Prices — `/api/prices/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/prices/?symbols=BTC,ETH,OANDA:EUR_USD` | Trader or Mentor | Fetch live prices |

**Total: 21 endpoints across 6 groups.**

---

## Known Notes

- **`POST /api/auth/register/` requires `password_confirm`** — the `RegisterSerializer` validates that `password` and `password_confirm` match. Both fields must be in the request body or the API returns a 400 with `{"password_confirm": ["This field is required."]}`.
- **P&L is not auto-calculated** — traders enter `pnl` manually. The backend stores it but does not compute it. This is intentional (different asset classes use different formulas).
- **Prices endpoint returns only symbols it could resolve** — if a crypto symbol is not in the `SYMBOL_TO_ID` map, or if Finnhub returns no quote, that symbol is silently omitted from the response. The frontend should handle missing keys.
- **`AI_INSIGHT_MIN_TRADES = 5`** — the AI analysis endpoint returns 400 if the trader has fewer than 5 trades in the last 90 days. This is enforced in `ClaudeService`, not the view.
- **Role is set at registration** — in the current implementation there is no admin-only endpoint to change a user's role after creation. An admin can PATCH `/api/users/<id>/` with `{"role": "mentor"}` using the `AdminUserSerializer`.
- **`ROTATE_REFRESH_TOKENS = True`** — every token refresh invalidates the old refresh token. If a client retries a failed refresh request (e.g. due to a network timeout), the second attempt will fail because the token was already rotated. The client must handle 401 on refresh gracefully.

---

## What Is Not Built Yet

### Backend
- Watchlist app — `GET/POST /api/watchlist/` (pinned assets per user, max `WATCHLIST_MAX_ASSETS = 8`)
- CSV export endpoint for trade journal (`GET /api/trades/export/`)
- Admin dashboard stats endpoint (platform-wide aggregates)
- Password reset flow (email-based)
- Email verification on registration

### Frontend
- Both Next.js applications (`frontend/marketing/` and `frontend/app/`) — not scaffolded yet
- All UI components, pages, and hooks
- `middleware.ts` for edge-level JWT role enforcement
- `src/lib/api.ts` central fetch client
- Design system implementation (IBM Plex Sans/Mono, dark theme)

### Infrastructure
- Nginx configuration (`nginx/conf.d/`)
- Production deployment to Hetzner VPS
- Cloudflare DNS/SSL setup
- CI/CD pipeline

### Other
- Database seed data (`database/seeds.sql` — demo accounts + Alex's trade history)
- Final logo mark (icon variant)
- Stripe payment integration (Pro plan)
- Privacy policy + Terms pages (required for RGPD compliance)
- Mobile responsive behaviour
- Full mentor and admin page specs
