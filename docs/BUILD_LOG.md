# Tradalyst — Build Log

> Living record of what has been built, updated after every major milestone.
> Will serve as source material for the Spanish memoria documentation.
> Last updated: 2026-04-24

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

---

## Milestone 7 — Backend: JWT Role Claim + P&L Auto-calculation

**Date:** 2026-04-22

### What Was Changed

**`apps/users/authentication.py`** — new `TradalystRefreshToken` class:
- Subclasses `RefreshToken` from simplejwt
- Overrides `for_user()` to inject `role` into the JWT payload: `token["role"] = user.role`
- Used in all three auth views (`RegisterView`, `LoginView`, `CookieTokenRefreshView`) instead of the plain `RefreshToken`

**Why this matters:** The frontend's `middleware.ts` reads the JWT's `role` claim to enforce role-based routing at the edge. Without this injection, the claim was absent and all authenticated users were treated identically.

**`apps/users/serializers.py`** — `UserProfileSerializer` updated:
- Added `plan` and `onboarding_completed` to `fields`
- Both fields added to `read_only_fields` except `onboarding_completed`, which the trader patches at the end of onboarding

**`apps/trades/models.py`** — `save()` override for auto P&L:
- When `exit_price`, `entry_price`, and `quantity` are all present, P&L is computed automatically:
  - Long: `(exit_price - entry_price) × quantity`
  - Short: `(entry_price - exit_price) × quantity`
- If any field is missing (open trade), `pnl` is set to `None`
- Previously, P&L was left `None` unless the frontend explicitly sent a value

**`apps/trades/serializers.py`** — `pnl` made read-only:
- `pnl` added to `read_only_fields` so the frontend cannot override the server-computed value

### Key Decisions

- **Role in JWT is required for edge middleware** — Next.js middleware runs before any page load and needs the role claim to redirect correctly. simplejwt does not add custom claims by default; a subclass is the clean solution.
- **P&L in model `save()`** — computing P&L server-side ensures consistency regardless of how trades are created (API, Django admin, management commands). The calculation is deterministic and has no side effects.

---

## Milestone 8 — Backend: Bug Fixes

**Date:** 2026-04-22

### Fixes Applied

**CoinGecko cache format bug (`apps/prices/services/coingecko.py`):**
- **Root cause:** The service cached the raw CoinGecko API response (format: `{ coin_id: { "usd": price } }`), but on a cache hit it returned `cached[coin_id]` — a dict with a `usd` key, not a `price` key. The frontend expected `price`, causing `TypeError: Cannot read properties of undefined`.
- **Fix:** Cache the already-transformed dict (format: `{ symbol: { "price": ..., "change_24h": ... } }`) instead of the raw response. Cache-hit path returns `cached[symbol]` directly.

---

## Milestone 9 — Frontend: App Foundation (`frontend/app/`)

**Date:** 2026-04-22

### What Was Built

**Technology:**
- Next.js 14 (App Router) + TypeScript strict mode
- Tailwind CSS with custom design tokens (see `tailwind.config.ts`)
- IBM Plex Sans + IBM Plex Mono via `next/font`

**Design tokens (from brand identity):**

| Token | Value | Use |
|-------|-------|-----|
| `base` | `#1e1e1e` | Page backgrounds |
| `surface` | `#272727` | Cards, panels |
| `elevated` | `#303030` | Inputs, nested surfaces |
| `green` | `#2fac66` | CTAs, profit, AI highlights |
| `green-hover` | `#27954f` | Hover state for green buttons |
| `loss` | `#f06060` | Negative P&L only |
| `primary` | `#f5f5f5` | Main text |
| `secondary` | `#c0c0c0` | Supporting text |
| `muted` | `#6b6b6b` | Labels, disabled states |

**`src/lib/api.ts`** — Central fetch wrapper:
- `get<T>`, `post<T>`, `patch<T>`, `del<T>` helpers
- All calls include `credentials: "include"` (sends httpOnly cookies)
- Base URL from `NEXT_PUBLIC_API_URL` environment variable
- Throws `ApiError` with status code on non-2xx responses

**`src/lib/format.ts`** — Number and date formatters:
- `formatPnl(n)` — `+1,234.56` with sign, IBM Plex Mono class
- `formatPrice(n)` — 2–8 decimal places based on magnitude
- `formatDate(iso)` — locale-aware date display

**`src/types/index.ts`** — TypeScript interfaces for every API response:
- `UserProfile`, `LoginResponse`, `RegisterResponse`
- `Trade`, `PaginatedTrades`, `TradeCreatePayload`, `TradeUpdatePayload`
- `TradeStats`, `AiInsight`, `ChatMessage`, `ChatSendPayload`, `ChatSendResponse`
- `PriceQuote`, `PricesResponse`
- `MentorAssignment`, `MentorAnnotation`
- `PnlPoint`, `HeatmapDay`, `DateRange`, `ApiValidationError`

**`src/middleware.ts`** — Edge auth + role enforcement:
- Runs before every page load
- Reads `access_token` cookie, decodes JWT (without signature verification — edge runtime limitation)
- Redirects unauthenticated users to `/login`
- Enforces role separation: trader routes require `role === "trader"`, etc.
- Login/register pages redirect already-authenticated users to their dashboard

**Route groups:**
- `(trader)/` — dashboard, journal, AI, analytics, settings, onboarding
- `(mentor)/` — mentor page (placeholder)
- `(admin)/` — admin page (placeholder)

---

## Milestone 10 — Frontend: Login Page

**Date:** 2026-04-22
**File:** `src/app/login/page.tsx`

### What Was Built

- Full dark-themed login form: email + password fields, submit button
- POSTs `{ email, password }` to `/api/auth/login/` with `credentials: "include"`
- On success: reads `role` from JSON response, redirects by role:
  - `trader` → `/dashboard`
  - `mentor` → `/mentor`
  - `admin` → `/admin`
- On failure (400/401): shows "Email o contraseña incorrectos." inline below the form
- `LoginForm` component wraps `useSearchParams()` inside `<Suspense fallback={null}>` — required by Next.js 14 to avoid prerender errors
- Link to registration page, tradalyst wordmark at top

### Test Account

```
email:    trader@test.com
password: Test1234!
role:     trader
```

---

## Milestone 11 — Frontend: Dashboard Page

**Date:** 2026-04-22
**File:** `src/app/(trader)/dashboard/page.tsx`

### What Was Built

Six data rows, all loading real API data with skeleton states:

| Row | Data source | Description |
|-----|-------------|-------------|
| PricesStrip | `GET /api/prices/?symbols=BTC,ETH,SOL,EURUSD,AAPL` | Live prices, 24h change pill |
| Stats cards | `GET /api/trades/stats/` | Total P&L, win rate, trade count, avg R/R |
| P&L chart | `GET /api/trades/?page_size=1000` | Cumulative P&L line chart (SVG, no library) |
| Heatmap | Same trades fetch | Daily P&L intensity by colour |
| Recent trades | Same trades fetch | Last 10 entries, pair + result + P&L |
| AI insight | `GET /api/analysis/insights/` | Latest insight excerpt, CTA to `/ai` |

**Skeleton loading:** every card shows a `bg-elevated animate-pulse` placeholder while fetching. No layout shift on load.

**PricesStrip guards:** `q.price != null` check before calling `.toLocaleString()` — prevents crash if a symbol is not in the CoinGecko map.

---

## Milestone 12 — Frontend: Journal Pages

**Date:** 2026-04-22
**Files:** `src/app/(trader)/journal/`

### Pages Built

**`/journal` — Trade list:**
- Paginated list with filters: pair (text), direction, result, emotion, date range
- 10 rows per page, previous/next pagination controls
- Each row: pair, direction badge, entry date, entry/exit price, P&L with colour
- Link to individual trade detail
- "Nueva operación" button → `/journal/new`
- Empty state when no trades match filters

**`/journal/new` — Create trade:**
- Full trade form: pair, direction toggle, entry/exit price, quantity, entry/exit time, result pills, emotion pills, notes textarea
- Client-side validation before POST
- `POST /api/trades/` on submit
- Redirects to `/journal` on success

**`/journal/[id]` — Trade detail:**
- All fields displayed in read-only layout
- P&L shown with sign and colour
- Emotion + result displayed as styled pills
- "Editar" button → `/journal/[id]/edit`
- "Eliminar" button with confirmation modal → `DELETE /api/trades/[id]/`

**`/journal/[id]/edit` — Edit trade:**
- Same form as `/journal/new` pre-filled with existing values
- `PATCH /api/trades/[id]/` on submit
- Redirects to `/journal/[id]` on success

---

## Milestone 13 — Frontend: AI Analysis Page

**Date:** 2026-04-22
**File:** `src/app/(trader)/ai/page.tsx`

### What Was Built

Two-panel layout (40% insights / 60% chat):

**Left panel — Insights:**
- `GET /api/analysis/insights/` on load
- Most recent insight shown expanded (full content)
- Older insights in collapsible `InsightAccordion` rows (date + preview → click to expand)
- "Generar nuevo análisis" button → `POST /api/analysis/insights/generate/`
- Shows `InsufficientDataMessage` if the API returns 400 (fewer than 5 trades)
- Skeleton placeholder while loading

**Right panel — Chat:**
- `GET /api/analysis/chat/` on load — restores full persistent history
- `MessageBubble` component: user messages right-aligned with green bg, assistant messages left-aligned with elevated bg
- `TypingBubble`: 3 animated dots while waiting for assistant response
- Optimistic updates: user message added to UI immediately, removed on error
- Auto-scroll to bottom via `bottomRef.current?.scrollIntoView({ behavior: "smooth" })`
- Textarea: Enter sends, Shift+Enter inserts newline, auto-resizes up to 120px
- Suggested prompts grid (4 cards) when chat is empty
- `POST /api/analysis/chat/send/` with `{ message }`

---

## Milestone 14 — Frontend: Analytics Page

**Date:** 2026-04-22
**File:** `src/app/(trader)/analytics/page.tsx`

### What Was Built

Client-side analytics computed from a single `GET /api/trades/?page_size=1000` fetch. All charts are pure SVG — no external charting libraries.

**4 stat cards at top:**
- Total P&L (signed, coloured)
- Win Rate %
- Total operations count
- Best day P&L

**Charts:**

| Chart | Type | Description |
|-------|------|-------------|
| P&L por período | BarChart SVG | Week/month toggle, negative bars rendered below zero line |
| P&L por activo | HorizontalBar | Each pair with fill proportion and value |
| Win Rate por emoción | HorizontalBar | Rates by emotion state |
| Operaciones por hora | BarChart SVG | Binned by 4-hour windows |
| Long vs Short | Stat pair | Win rate and trade count per direction |
| Drawdown | BarChart SVG | Cumulative P&L with peak-to-trough visualisation |

**BarChart SVG component:**
- Vertical bars with proportional height to max absolute value
- Zero line at bottom for positive-only data; centred for mixed data
- Y-axis labels at 0, mid, max
- Bar colour: green if ≥ 0, loss red if < 0

**HorizontalBar component:**
- Label left, fill bar proportional to value vs max, numeric value right
- Colour: green for win rate bars

---

## Milestone 15 — Frontend: Settings Page

**Date:** 2026-04-22
**File:** `src/app/(trader)/settings/page.tsx`

### What Was Built

5-tab settings page (tab state in URL hash):

**Perfil tab:**
- `GET /api/users/me/` on load to pre-fill fields
- `display_name` + `bio` fields
- `PATCH /api/users/me/` on save
- Success/error feedback inline

**Seguridad tab:**
- Current password + new password + confirm fields
- `POST /api/auth/change-password/` — endpoint stubbed, returns placeholder until backend implements it
- Client-side validation: new passwords must match

**Mentor tab:**
- Placeholder explaining Pro plan feature
- Link to Plan tab to upgrade

**Plan tab:**
- Reads `user.plan` from profile (`free` or `pro`)
- Free plan: feature comparison table + "Actualizar a Pro" CTA (Stripe pending)
- Pro plan: active badge + cancel subscription link

**Cuenta tab:**
- "Exportar CSV" button — client-side Blob generation from `GET /api/trades/?page_size=10000`
  - Columns: `id, pair, direction, entry_time, exit_time, entry_price, exit_price, quantity, pnl, result, emotion, notes`
  - Downloads as `tradalyst-trades.csv` via `URL.createObjectURL()`
- "Eliminar cuenta" danger zone — modal requires typing `ELIMINAR` to confirm
  - `DELETE /api/users/me/` → logout → redirect to `/login` (endpoint pending)

---

## Milestone 16 — Frontend: Onboarding Wizard

**Date:** 2026-04-22
**File:** `src/app/(trader)/onboarding/page.tsx`

### What Was Built

3-step wizard shown to new traders before they reach the dashboard:

**`StepDots` component:**
- Animated pill indicator: completed steps show small green circle, current step shows wide green pill, future steps show dim circle
- `current + 1 / total` counter

**Step 0 — Trader type:**
- 4 type pills: Crypto (₿), Forex (€), Acciones (📈), Todos (∞)
- Selecting a type pre-fills the `pair` field in Step 1 with a sensible default (e.g. Crypto → `BTC`)
- "Continuar" disabled until a type is selected

**Step 1 — First trade (optional):**
- Full trade form identical to `/journal/new`: pair, direction buttons, entry/exit price, quantity, datetime-local, result pills, emotion pills, notes
- Client-side validation on required fields (pair, entry price, quantity)
- `POST /api/trades/` on submit
- "Prefiero explorar primero" skip link → jumps to Step 2 without logging a trade
- After successful submit: calls `completeOnboarding()` which PATCHes `{ onboarding_completed: true }` to `/api/users/me/`

**Step 2 — Confirmation:**
- Green check icon in circle
- Conditional message: if trade was logged → "Tu primera operación está registrada. La IA necesita al menos 5 operaciones para generar tu primer análisis." If skipped → "Cuando tengas 5 operaciones registradas, la IA generará tu primer análisis automáticamente."
- "Ir al dashboard" → `router.push("/dashboard")`

**`completeOnboarding()` flow:**
1. `PATCH /api/users/me/ { onboarding_completed: true }` — marks onboarding done so middleware stops redirecting here
2. `setStep(2)` — always advances regardless of whether the PATCH succeeded (non-blocking)

---

---

## Milestone 17 — Frontend: Mentor Pages (Full Build)

**Date:** 2026-04-23

### What Was Built

**New components:**

`MentorSidebar` (`src/components/layout/MentorSidebar.tsx`) — client component, uses `usePathname` for active highlight, `logout()` from `@/lib/auth` on sign-out. Nav links: Eye → `/mentor`, Settings → `/settings`. "Vista mentor" role label below wordmark.

`MentorBottomNav` (`src/components/layout/MentorBottomNav.tsx`) — `lg:hidden fixed bottom-0` bar with Eye/Traders and Settings/Ajustes. Mirrors sidebar on mobile.

**`(mentor)/layout.tsx` rewritten** from placeholder to full layout:
- MentorSidebar (desktop) + MentorBottomNav (mobile)
- `pb-20 lg:pb-7` on main content area so bottom nav never overlaps content

**`/mentor` (`mentor/page.tsx`):**
- `GET /api/mentors/my-traders/` → list of `MentorAssignment` objects
- Each assignment rendered as a trader card: display name (fallback to email), assignment date
- Two action buttons per card: Dashboard → `/mentor/${trader_detail.id}/dashboard`, Diario → `/mentor/${trader_detail.id}`
- Empty state: "Aún no tienes traders asignados."
- Skeleton loading grid while fetching

**`/mentor/[traderId]` (`mentor/[traderId]/page.tsx`):**
- Read-only trade journal for one assigned trader
- Fetches trader name from `GET /api/mentors/my-traders/` (finds matching assignment by `trader_detail.id`)
- Trade list from `GET /api/mentors/traders/${traderId}/trades/` with same filter controls as the trader's own journal (pair, direction, result, date range — all server-side filtered)
- Pagination: 20 per page with numbered page buttons
- No create/edit/delete actions. Only Eye icon → `/mentor/${traderId}/trade/${t.id}`
- Header: "← Mis traders" back link + "Dashboard" button to companion view

**`/mentor/[traderId]/dashboard` (`mentor/[traderId]/dashboard/page.tsx`):**
- Full stats dashboard computed client-side from all trades (walks paginated `next` links to fetch everything)
- Stat cards: Total P&L, Win Rate (W/L counts), Operaciones, R:R Medio
- P&L cumulative line chart (same `PnlChart` component as trader dashboard)
- Activity heatmap (same `ActivityHeatmap` component)
- Recent trades section (inline, not `RecentTradesTable`) — links to `/mentor/${traderId}/trade/${t.id}` not `/journal/${t.id}`
- Header: "← Mis traders" back link + "Diario" button to journal view

**`/mentor/[traderId]/trade/[id]` (`mentor/[traderId]/trade/[id]/page.tsx`):**
- Trade detail: fetches list (`?page_size=100`) and finds trade client-side by ID (no single-trade endpoint exists on mentor routes)
- Left column: full trade fields (direction, result, P&L, prices, quantity, R/R, times, emotion)
- Right column: annotation panel — list of `MentorAnnotation` + new annotation textarea
- Annotations fetched from `GET /api/mentors/trades/${id}/annotations/`
- New annotation posted to `POST /api/mentors/trades/${id}/annotations/` with `{ body: content }`
- Annotations displayed with `annotation.body` and `annotation.created_at`

### Backend Fix Applied

**`apps/mentors/serializers.py`** — `MentorAssignmentSerializer` was missing `trader_detail`. Added:

```python
trader_detail = UserProfileSerializer(source="trader", read_only=True)
```

Without this, the mentor's trader list returned `trader: <int>` instead of the nested `{ id, email, display_name }` object that all four mentor pages need.

### Type Corrections Applied

**`src/types/index.ts`:**
- `MentorAssignment.created_at` — was `assigned_at` (field does not exist on the model)
- `MentorAssignment.trader_detail` — added (was only `mentor_detail` before)
- `MentorAnnotation.body` — was `content` (the model field is `body`)

---

## Milestone 18 — Frontend: Admin Pages (Full Build)

**Date:** 2026-04-23

### What Was Built

**New components:**

`AdminSidebar` (`src/components/layout/AdminSidebar.tsx`) — same pattern as MentorSidebar. Nav: Users → `/admin`, Settings → `/settings`. "Admin" role label.

`AdminBottomNav` (`src/components/layout/AdminBottomNav.tsx`) — Users/Usuarios and Settings/Ajustes.

**`(admin)/layout.tsx` rewritten** using AdminSidebar + AdminBottomNav.

**`/admin` (`admin/page.tsx`):**
- Fetches `GET /api/users/?page_size=10&ordering=-date_joined`
- Four `StatTile` cards: total users, traders (filtered count), mentors, admins
- Recent registrations table: email, display name, role badge, active/suspended indicator, date joined
- Each row links to `/admin/users/${id}`
- "Ver todos →" link to `/admin/users`

**`/admin/users` (`admin/users/page.tsx`):**
- Full user list with search (debounced 350ms) and role filter tabs (Todos / Traders / Mentores / Admins)
- Server-side pagination: 20 per page with numbered controls
- Desktop: grid table with 6 columns (email, name, role badge, status, joined, action link)
- Mobile: card stack — `hidden lg:block` / `lg:hidden` toggles per row
- Each entry links to `/admin/users/${id}`

**`/admin/users/[id]` (`admin/users/[id]/page.tsx`):**
- Fetches `GET /api/users/${id}/`
- Field rows: ID, email, display name, bio, role, account status, date joined
- Three action buttons:
  - Suspend → `PATCH /api/users/${id}/ { is_active: false }` (shown only when active)
  - Activate → `PATCH /api/users/${id}/ { is_active: true }` (shown only when suspended)
  - Delete → `DELETE /api/users/${id}/`
- `ConfirmModal` component: danger-styled (red border + bg) for destructive actions, normal-styled for reversible ones
- On delete success: `window.location.href = "/admin/users"` (hard redirect to clear state)

---

## Milestone 19 — Demo Seed Data

**Date:** 2026-04-23

### What Was Built

**`tools/scripts/seed_demo.py`** — creates four accounts and populates 135 realistic trades.

**Accounts created:**

| Email | Role | Password | Purpose |
|-------|------|----------|---------|
| `admin@tradalyst.com` | admin | `Admin1234!` | Platform admin |
| `trader@tradalyst.com` | trader | `Trader1234!` | Demo trader (Alex García) |
| `mentor@tradalyst.com` | mentor | `Mentor1234!` | Carlos Ruiz |
| — | — | — | Assignment: Carlos mentors Alex |

**Trade generation — 135 trades over 90 days:**

| Asset | Weight | Base price | Annual drift |
|-------|--------|------------|-------------|
| BTC/USDT | 33% | $55,000 | +60% |
| ETH/USDT | 27% | $2,800 | +45% |
| SOL/USDT | 17% | $130 | +90% |
| EUR/USD | 13% | 1.085 | −2% |
| AAPL | 10% | $185 | +25% |

**Emotion distribution and win rates:**

| Emotion | Share | Base win rate |
|---------|-------|---------------|
| `confident` | 40% | 93% |
| `fomo` | 25% | 33% |
| `fearful` | 20% | 86% |
| `revenge` | 15% | 30% |

Win rate modifiers: Tuesday × 0.74 (bad day pattern), 2 consecutive losses × 0.85, 3+ losses × 0.68. Tilt mechanic shifts emotion distribution toward `fomo`/`revenge` after losing streaks.

**P&L pre-calculated manually** — `Trade.objects.bulk_create()` skips the model's `save()` override. P&L is computed inline using the same formula: long → `(exit − entry) × qty`, short → `(entry − exit) × qty`.

**6 mentor annotations** backdate-patched via `MentorAnnotation.objects.filter(pk=...).update(created_at=..., updated_at=...)` to spread realistically across the 90-day window.

**Final seed result:** 135 trades, ~61.5% win rate, +~$2,150 total P&L. Intended target: 63% (close enough for demo realism).

**`tools/scripts/topup_trades.py`** — gap-fill script for keeping demo data current.

- Reads `Trade.objects.filter(user=trader).order_by("-entry_time").first()` to find the last trade
- Generates trades from `last_trade.date + 1 day` through `datetime.now()`
- Same asset config, emotion config, and win rate logic as `seed_demo.py`
- Carries forward consecutive-loss state from the tail of existing trades
- Appends only — never deletes existing data
- Intended to be run via cron or manually before demos to keep the last trade ≤1 day old

**Root cause of original gap (April 10 → April 23):** The seed script sorted all timestamps then took `timestamps[:n]`, which front-loaded trades into the earliest days. Fix: `sorted(random.sample(timestamps, min(n, len(timestamps))))` — selects a random sample spread across the full window.

---

## Milestone 20 — Production Deployment (Hetzner VPS)

**Date:** 2026-04-23

### Infrastructure

- **VPS:** Hetzner, `49.13.237.4`, user `mohammed` (root SSH disabled)
- **Frontend:** PM2 process (`tradalyst-app`) running Next.js build at `/var/www/tradalyst/frontend/app`
- **Backend:** systemd service (`tradalyst`) running Gunicorn at `/var/www/tradalyst/backend`
- **Reverse proxy:** Nginx routing `app.tradalyst.com` → Next.js, `api.tradalyst.com` → Gunicorn

### Deployment Steps

After changes to frontend:
```bash
ssh mohammed@49.13.237.4
cd /var/www/tradalyst/frontend/app && npm run build && pm2 restart tradalyst-app
```

After changes to backend (models, serializers, views):
```bash
ssh mohammed@49.13.237.4
cd /var/www/tradalyst/backend && source venv/bin/activate && python manage.py migrate
sudo systemctl restart tradalyst
```

After running seed scripts:
```bash
ssh mohammed@49.13.237.4
cd /var/www/tradalyst && python tools/scripts/seed_demo.py
# or for gap fill:
python tools/scripts/topup_trades.py
```

---

## Milestone 21 — RGPD Legal Compliance + Cookie Banner

**Date:** 2026-05

### Pages added
- `/privacidad` + `/en/privacy-policy` — full Spanish/English privacy policy (RGPD/GDPR compliant)
- `/terminos` + `/en/terms-of-use` — terms of use
- `/cookies` + `/en/cookie-policy` — cookie policy explaining analytics cookies and session storage

### Cookie consent banner
- Component: `frontend/marketing/src/components/CookieBanner.tsx`
- Stores consent in `localStorage` (`cookie_consent: "accepted" | "rejected"`)
- Only loads Google Analytics if accepted
- Persists across page loads via localStorage check on mount

---

## Milestone 22 — Blog SEO Expansion + Image Improvements

**Date:** 2026-05

### Blog post rewrites (3 near-page-1 URLs)
- `/blog/metricas-trading` — expanded 1,800 → 3,200 words; added 5 worked formula examples, 5 common errors, tools section, FAQ (5 PAA questions)
- `/blog/fomo-trading` — expanded 1,500 → 2,600 words; added 5 FOMO signals, FOMO cycle diagram prose, 3-step protocol, FOMO vs conviction table, FAQ (5 questions)
- `/en/blog/diario-de-trading` — expanded 850 → 2,800 words; new title "How to Keep a Trading Journal That Actually Improves Your Trading"; 7-field framework, weekly review step-by-step, real example entry, AI analysis section, FAQ (5 questions)

### MdxImage component fix
- Bug: `COMPONENT_RE` regex used `[^/]*` which failed to match props containing slashes (`href="/registro"`, `src="/images/..."`)
- Fix: Changed to `[\s\S]*?` (non-greedy, matches any character including `/` and newlines)
- Added `MdxImage` to ComponentName type, import, and renderComponent switch case

### In-content images (6 new WebP files)
All at `frontend/marketing/public/images/blog/`, 800×450, <80KB:
- `metricas-trading-dashboard.webp`, `metricas-trading-analisis.webp`
- `fomo-trading-stress.webp`, `fomo-trading-control.webp`
- `trading-journal-notes.webp`, `trading-journal-review.webp`

### SEO strategy doc
- Added "Image SEO Rules" section to `docs/seo_strategy.md` covering featured image requirements, in-content image requirements, sharp conversion command, sourcing rules, pre-publish checklist

---

## Milestone 23 — Marketing Site: Footer Redesign + Sobre Nosotros Fix

**Date:** 2026-05

### Footer redesign (`frontend/marketing/src/components/layout/Footer.tsx`)
- Old: single-row flat layout (Logo + tagline | all 7 links | copyright)
- New: 3-column grid + bottom bar
  - Brand column: Logo, tagline, `hola@tradalyst.com`, copyright
  - Producto column: Funcionalidades, Precios, Blog, Nosotros
  - Legal column: Privacidad, Términos, Cookies
  - Bottom bar: "Hecho con IA en Málaga, España 🇪🇸" left · "Powered by Claude · Anthropic" right
- Background changed from `bg-white` to `bg-surface` (`#f5f6f2`)
- New translation keys added to `es.json` and `en.json`: `productHeading`, `legalHeading`, `email`, `madeIn`, `poweredBy`

### Sobre nosotros hero fix (`frontend/marketing/src/app/[locale]/(marketing)/sobre-nosotros/page.tsx`)
- Removed stock photo (`about-founder.webp`) and flex wrapper from hero section
- Hero is now text-only: eyebrow + H1 — no avatar, no photo

### Custom 404 page
- Created `frontend/marketing/src/app/[locale]/not-found.tsx`
- Brand-styled: green "404" eyebrow, H1, description, "Volver al inicio" CTA button

---

## Milestone 24 — Stripe Payments Integration (Test Mode)

**Date:** 2026-05

### Backend: `apps/billing/`
New Django app at `backend/apps/billing/` with three endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/billing/create-checkout-session/` | POST | Creates Stripe Checkout session for PRO plan with 7-day trial |
| `/api/billing/portal/` | GET | Creates Stripe Customer Portal session for subscription management |
| `/api/billing/webhook/` | POST | Handles Stripe webhook events (no auth, signature verified) |

**Webhook events handled:**
- `checkout.session.completed` → upgrades user to PRO
- `customer.subscription.deleted` / `customer.subscription.paused` → downgrades to FREE
- `customer.subscription.updated` → syncs status (active/trialing → PRO, else FREE)

**Model change:** Added `stripe_customer_id = CharField(max_length=100, blank=True)` to `CustomUser`. Migration: `apps/users/migrations/0005_customuser_stripe_customer_id.py`.

**Settings:** Added `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID` to `base.py` (read from `.env`). All documented in `.env.example`.

**Dependency:** Added `stripe==11.4.1` to `requirements.txt`.

### Frontend: `PlanTab` redesign (`frontend/app/src/app/(trader)/settings/page.tsx`)
- Free user: "Probar 7 días gratis · €9,99/mes" button → calls `POST /api/billing/create-checkout-session/` → redirects to Stripe Checkout
- Pro user: feature list + "Gestionar suscripción" link → calls `GET /api/billing/portal/` → redirects to Stripe Customer Portal
- Handles `?upgrade=success` (refresh user plan, show success banner) and `?upgrade=cancelled` (show dismissable note) URL params after Checkout redirect
- Tab state now reads from `?tab=plan` URL param for direct linking

---

## What Is Not Built Yet

### Backend
- Watchlist app — `GET/POST /api/watchlist/` (pinned assets per user, max `WATCHLIST_MAX_ASSETS = 8`)
- CSV export endpoint for trade journal (`GET /api/trades/export/`)
- Admin dashboard stats endpoint (platform-wide aggregates)
- Password reset flow (email-based)
- Email verification on registration
- Change password endpoint (`POST /api/auth/change-password/`) — stubbed in frontend settings

### Frontend
- Mobile responsive behaviour (partially done in mentor/admin pages, trader pages still desktop-first)
- Upgrade modal component (in-app upsell at feature gate touchpoints)
- Feature gates on analytics page, AI chat limit display, mentor tab, Finnhub prices widget

### Infrastructure
- Cloudflare DNS/SSL setup
- CI/CD pipeline

### Stripe
- Stripe webhook endpoint must be registered in Stripe Dashboard pointing to `https://api.tradalyst.com/api/billing/webhook/`
- Stripe keys (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID) must be added to `.env` on VPS before deploy
- Annual pricing plan (€7.99/month) — UI toggle exists on pricing page but not wired to Stripe

### Other
- Final logo mark (icon variant)
