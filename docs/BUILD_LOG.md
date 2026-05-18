# Tradalyst — Build Log

> Living record of what has been built, updated after every major milestone.
> Will serve as source material for the Spanish memoria documentation.
> Last updated: 2026-05-18

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
| `anthropic` | 0.40+ | Claude API client |
| `django-filter` | 24.2 | QuerySet filtering for trade list |
| `requests` | 2.31.0 | HTTP calls to CoinGecko + Finnhub |
| `gunicorn` | 21.2.0 | Production WSGI server |
| `stripe` | 11.4.1 | Stripe Checkout + webhook |

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
- Fields: `email`, `display_name`, `bio`, `role`, `is_active`, `is_staff`, `date_joined`, `onboarding_completed`, `theme_preference`, `plan`, `trial_ends_at`, `stripe_customer_id`, `language_preference`, `pinned_assets`
- Table: `users_customuser`
- `CustomUserManager` handles `create_user` and `create_superuser`

**Three roles** defined as a `TextChoices` enum:

| Role | Value | Default |
|------|-------|---------|
| `trader` | `"trader"` | Yes |
| `mentor` | `"mentor"` | No |
| `admin` | `"admin"` | No |

**Plan field:**
- `free` (default) — full journal, basic stats, 1 AI insight/week
- `pro` — full AI chat, full analytics, mentor access, all features

**Theme and language preferences** stored on the user record:
- `theme_preference`: `light` (default) | `dark`
- `language_preference`: `es` (default) | `en`
- `pinned_assets`: JSONField — list of up to 8 watchlist symbols

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

- **Email as username** — traders identify by email, no separate username field.
- **httpOnly cookies, not Authorization header** — eliminates XSS token theft.
- **Role in JWT payload** — `TradalystRefreshToken` subclass injects `role` into the JWT so the Next.js edge middleware can read it without a database call.

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
| `exit_time` | DateTimeField | Nullable |
| `pnl` | NUMERIC(20,8) | Auto-calculated in `save()` |
| `risk_reward_ratio` | NUMERIC(10,4) | Nullable |
| `result` | TextChoices | `win` / `loss` / `breakeven` |
| `emotion` | TextChoices | `calm`, `confident`, `fearful`, `greedy`, `anxious`, `fomo`, `revenge`, `neutral` |
| `notes` | TextField | Free-form trader reasoning |

**P&L auto-calculation** — `Trade.save()` override:
- Long: `(exit_price - entry_price) × quantity`
- Short: `(entry_price - exit_price) × quantity`
- If any field is missing, `pnl` is set to `None`

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

**TradeCSVImportView** — `POST /api/trades/import/`:
- `MultiPartParser` for file upload
- Accepts CSV files up to 5 MB / 1000 rows (`CSV_IMPORT_MAX_ROWS`, `CSV_IMPORT_MAX_SIZE_BYTES`)
- Flexible header aliasing — `_COL_ALIASES` map accepts English and Spanish column names (e.g. `fecha`, `par`, `entrada`, `emocion`)
- Parses dates in multiple formats: `%Y-%m-%dT%H:%M:%S`, `%Y-%m-%d`, `%d/%m/%Y`
- Validates required fields (entry_time, pair, direction, entry_price, quantity) per row
- Calls `trade.save()` per row so auto-P&L fires; returns `{ imported, skipped, errors }`

---

## Milestone 4 — Backend: apps/mentors/ (with Request/Accept Flow)

**Files:** `models.py`, `serializers.py`, `views.py`, `urls.py`

### What Was Built

**MentorRequest** — a mentor's request to follow a trader:
- Fields: `mentor`, `trader`, `status` (`pending` / `accepted` / `rejected`)
- `unique_together = [("mentor", "trader")]`
- Created by the mentor; accepted or rejected by the trader

**MentorAssignment** — active mentor–trader relationship:
- Created automatically when a `MentorRequest` is accepted
- `is_active` flag allows soft-deactivation
- `unique_together = [("trader", "mentor")]`

**MentorAnnotation** — a mentor's note on a specific trade:
- FK to `Trade` and FK to `CustomUser` (mentor)
- Free-text `body` field, ordered by `-created_at`

**Views across `/api/mentors/`:**

| View | Method | Auth | Description |
|------|--------|------|-------------|
| `MentorRequestCreateView` | POST | Mentor | Send a follow request to a trader by email |
| `MentorRequestSentView` | GET | Mentor | List all requests the mentor has sent |
| `MentorRequestReceivedView` | GET | Trader | List all pending requests received |
| `MentorRequestAcceptView` | POST | Trader | Accept a request → creates assignment |
| `MentorRequestRejectView` | POST | Trader | Reject a pending request |
| `AssignmentDeleteView` | DELETE | Trader or Mentor | End the relationship (either party can) |
| `MentorTraderListView` | GET | Mentor | List all active assigned traders |
| `MentorMyMentorView` | GET | Trader | Get own active mentor assignment |
| `MentorTraderTradeListView` | GET | Mentor | Read an assigned trader's journal |
| `MentorTradesView` | GET | Trader | Read mentor's own trade journal |
| `AnnotationListCreateView` | GET/POST | Mentor | List or add annotations on a trade |
| `AnnotationDetailView` | GET/PATCH/DELETE | Mentor | Manage one annotation |

### Key Decisions

- **Request-first flow** — mentors cannot self-assign. They send a request; the trader approves. This keeps traders in control of who sees their data.
- **Either party can end the relationship** — `AssignmentDeleteView` checks `user.role` to determine which FK to look up.
- **Assignments auto-created on accept** — `MentorRequestAcceptView.post()` uses `get_or_create` so re-accepting a previously ended relationship reactivates it without duplicates.

---

## Milestone 5 — Backend: apps/prices/

**Files:** `views.py`, `urls.py`, `services/coingecko.py`, `services/finnhub.py`

### What Was Built

**Single endpoint:** `GET /api/prices/?symbols=BTC,ETH,OANDA:EUR_USD,AAPL`

Routes requests to the correct external API based on the symbol:
- **Crypto symbols** → CoinGecko
- **Everything else** → Finnhub

**CoinGeckoService** (`services/coingecko.py`):
- 19 crypto symbols supported with a hardcoded `SYMBOL_TO_ID` mapping
- Returns: `price` (USD), `change_24h`, `market_cap`, `source: "coingecko"`
- Caches the transformed response (not raw API response) for `PRICE_CACHE_TTL` seconds

**FinnhubService** (`services/finnhub.py`):
- Returns: `price`, `change_24h`, `high`, `low`, `source: "finnhub"`
- Caches each symbol separately

---

## Milestone 6 — Backend: apps/analysis/

**Files:** `models.py`, `serializers.py`, `views.py`, `urls.py`, `services/claude.py`, `services/prompts.py`

### What Was Built

**AiInsight model** — persisted weekly AI report with `content`, `period_start`, `period_end`, `trade_count`

**ChatMessage model** — persistent chat history with `role` (`user` / `assistant`) and `content`

**ClaudeService** (`services/claude.py`):

1. `generate_weekly_insight(user)` — guards on `AI_INSIGHT_MIN_TRADES` (5), calls `claude-sonnet-4-6`, persists result
2. `chat(user, message)` — builds trade context from last 90 days, fetches last 10 messages, returns and persists reply

---

## Milestone 7 — Backend: apps/billing/ (Stripe)

**Date:** 2026-05

New Django app at `backend/apps/billing/` with three endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/billing/create-checkout-session/` | POST | Stripe Checkout session for PRO plan with 7-day trial |
| `/api/billing/portal/` | GET | Stripe Customer Portal session |
| `/api/billing/webhook/` | POST | Stripe webhook handler (no auth, verified by signature) |

**Webhook events handled:**
- `checkout.session.completed` → upgrades user to PRO
- `customer.subscription.deleted` / `customer.subscription.paused` → downgrades to FREE
- `customer.subscription.updated` → syncs plan status

**Model changes:** `stripe_customer_id` added to `CustomUser`. Migration: `apps/users/migrations/0005_customuser_stripe_customer_id.py`.

---

## Milestone 8 — API Endpoints Summary

All endpoints prefixed with `/api/`. All require authentication unless marked Public.

### Auth — `/api/auth/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register/` | Public | Create account, returns user + JWT cookies |
| POST | `/api/auth/login/` | Public | Authenticate, returns user + JWT cookies |
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
| GET | `/api/trades/stats/` | Trader | Aggregate statistics |
| POST | `/api/trades/import/` | Trader | Import trades from CSV file |
| GET | `/api/trades/<id>/` | Trader | Retrieve one trade |
| PATCH | `/api/trades/<id>/` | Trader | Update a trade |
| DELETE | `/api/trades/<id>/` | Trader | Delete a trade |

### Analysis — `/api/analysis/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/analysis/insights/` | Trader | List past AI insights |
| POST | `/api/analysis/insights/generate/` | Trader | Generate a new insight |
| GET | `/api/analysis/chat/` | Trader | Full chat history |
| POST | `/api/analysis/chat/send/` | Trader | Send message to Claude |

### Mentors — `/api/mentors/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/mentors/requests/` | Mentor | Send a follow request |
| GET | `/api/mentors/requests/sent/` | Mentor | List sent requests |
| GET | `/api/mentors/requests/received/` | Trader | List pending received requests |
| POST | `/api/mentors/requests/<id>/accept/` | Trader | Accept a request |
| POST | `/api/mentors/requests/<id>/reject/` | Trader | Reject a request |
| DELETE | `/api/mentors/assignments/<id>/` | Trader or Mentor | End a relationship |
| GET | `/api/mentors/my-traders/` | Mentor | List assigned traders |
| GET | `/api/mentors/my-mentor/` | Trader | Get own mentor assignment |
| GET | `/api/mentors/traders/<id>/trades/` | Mentor | Read trader's journal |
| GET | `/api/mentors/mentor-trades/` | Trader | Read mentor's journal |
| GET/POST | `/api/mentors/trades/<id>/annotations/` | Mentor | List or add annotations |
| GET/PATCH/DELETE | `/api/mentors/annotations/<id>/` | Mentor | Manage one annotation |

### Prices — `/api/prices/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/prices/?symbols=BTC,ETH` | Trader or Mentor | Fetch live prices |

### Billing — `/api/billing/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/billing/create-checkout-session/` | Trader | Start Stripe Checkout |
| GET | `/api/billing/portal/` | Trader | Open Customer Portal |
| POST | `/api/billing/webhook/` | Public (Stripe HMAC) | Handle subscription events |

**Total: 31 endpoints across 7 groups.**

---

## Milestone 9 — Frontend App: Foundation + Core Pages

**Date:** 2026-04-22

### What Was Built

- **Login page** (`/login`) — email + password, role-based redirect, error display
- **Registration page** (`/registro`) — email, password (with strength meter), role selector (Trader / Mentor), light/dark toggle, language toggle
- **Onboarding wizard** (`/onboarding`) — 3-step flow: trader type selection → first trade (optional) → confirmation
- **Dashboard** (`/dashboard`) — prices strip, stat cards, P&L chart, heatmap, recent trades, AI insight card
- **Journal** (`/journal`) — paginated trade list with filters; `/journal/new`, `/journal/[id]`, `/journal/[id]/edit`
- **AI page** (`/ai`) — two-panel layout: insight accordion (left) + persistent chat (right)
- **Analytics** (`/analytics`) — 6 SVG charts: P&L by period, P&L by asset, win rate by emotion, trades by hour, long vs short, drawdown
- **Settings** (`/settings`) — 5-tab page: profile, security, mentor, plan, cuenta (CSV export + account delete)
- **Mentor-trades page** (`/mentor-trades`) — trader reads their mentor's journal (read-only)

### Technology

- Next.js 14 (App Router) + TypeScript strict mode
- Tailwind CSS with custom design tokens
- IBM Plex Sans + IBM Plex Mono fonts
- `src/lib/api.ts` — central fetch wrapper
- `src/lib/format.ts` — P&L, price, date formatters
- `src/types/index.ts` — TypeScript interfaces for all API shapes
- `src/middleware.ts` — edge auth + role enforcement before every page load

---

## Milestone 10 — Frontend App: Mentor & Admin Pages

**Date:** 2026-04-23

### Mentor pages (role: mentor)

- `/mentor` — list of assigned traders with Dashboard/Diario action buttons
- `/mentor/[traderId]` — read-only trade journal with filters and pagination
- `/mentor/[traderId]/dashboard` — stats dashboard for one trader
- `/mentor/[traderId]/trade/[id]` — trade detail with annotation panel

### Admin pages (role: admin)

- `/admin` — stat tiles + recent registrations table
- `/admin/users` — searchable, filterable user list with role tabs
- `/admin/users/[id]` — user detail with suspend/activate/delete actions

### Layout components

- `Sidebar`, `BottomNav` — trader role layout
- `MentorSidebar`, `MentorBottomNav` — mentor role layout
- `AdminSidebar`, `AdminBottomNav` — admin role layout

---

## Milestone 11 — Frontend App: Light/Dark Theme System

**Date:** 2026-05

### What Was Built

- Default theme is **light** (base `#eceee8`, surface `#f5f6f2`)
- Dark mode theme retained (base `#1e1e1e`, surface `#272727`, elevated `#303030`)
- Theme toggle in registration page header (sun/moon icons)
- Theme toggle in Settings → Perfil tab
- Theme stored as `THEME` cookie (persists across sessions and pages)
- Applied via `document.documentElement.classList` on mount and on toggle
- `PATCH /api/users/me/ { theme_preference }` syncs preference to backend
- Tailwind CSS classes use `light:` and `dark:` variants throughout

---

## Milestone 12 — Frontend App: i18n (ES/EN)

**Date:** 2026-05

### What Was Built

- `next-intl` installed on both frontends
- **App frontend** — all user-facing strings extracted to `messages/es.json` and `messages/en.json`
- **Marketing frontend** — same extraction across all pages and components
- Language toggle in registration/login page headers (ES/EN buttons)
- Language toggle in Settings → Perfil tab
- Language stored as `NEXT_LOCALE` cookie
- `PATCH /api/users/me/ { language_preference }` syncs to backend
- `language_preference` field on `CustomUser` model (`es` default)
- Marketing site passes `?lang=` param to app URLs so language choice crosses subdomain boundary

### Known Issue Fixed

A label bug was found where the language toggle was displaying `"IS|IN"` instead of `"ES|EN"`. Root cause: translation key `language.toggle` had wrong interpolation. Fixed by using hardcoded locale codes `"ES"` / `"EN"` in the toggle component.

---

## Milestone 13 — Frontend App: TradingView Widgets

**Date:** 2026-05

### What Was Built

**TickerTape** (`src/components/dashboard/TickerTape.tsx`):
- TradingView TickerTape embedded widget loaded via CDN script injection
- Shows: BTC, ETH, SOL, BNB, EUR/USD, GBP/USD, AAPL, TSLA, NVDA
- Mounted at the top of the trader layout (`TickerTapeWrapper`)
- Theme-aware: passes `colorTheme` from current theme cookie
- Locale-aware: passes `locale` from `useLocale()`

**MarketQuotes** (`src/components/dashboard/MarketQuotes.tsx`):
- TradingView Market Quotes embedded widget loaded via CDN script injection
- Replaces the old `PricesStrip` component (which called `/api/prices/` directly)
- Shows user's `pinned_assets` from their profile
- Includes a **Manage Watchlist modal** (inline, no separate route):
  - Fetches `GET /api/users/me/` on mount to load saved `pinned_assets`
  - Search input with autocomplete across 30+ crypto, forex, and stock symbols
  - Add/remove tags UI with `MAX_ASSETS = 8` cap
  - `PATCH /api/users/me/ { pinned_assets }` on save
- Default assets if none are saved: `["BTC", "ETH", "EUR/USD", "AAPL"]`

---

## Milestone 14 — Frontend App: CSV Import Modal

**Date:** 2026-05

### What Was Built

**CsvImportModal** (`src/components/journal/CsvImportModal.tsx`):
- 3-step modal: upload → preview → result
- Step 1: drag-and-drop or file picker, "Descargar plantilla" button generates a template CSV
- Step 2: shows first 5 rows of the file in a table for user confirmation
- Step 3: result summary — `X operaciones importadas, Y omitidas`
- POSTs `FormData` with `file` field to `/api/trades/import/`
- Opened from `/journal` page header via "Importar CSV" button
- `onImported()` callback triggers a journal list refresh after success

---

## Milestone 15 — Frontend App: Analytics Charts Fixes

**Date:** 2026-05

### What Was Fixed

**Drawdown chart** — rebuilt as an area chart (`DrawdownAreaChart`):
- X-axis: chronological trade entries
- Y-axis: cumulative P&L running total
- Red fill from the peak down to the current level during drawdown periods
- Calculates peak-to-trough for visual shading

**P&L by period (bars)** — fixed negative bar rendering:
- Bars now correctly render below the zero line when P&L is negative
- Zero line centred vertically when mixed positive/negative bars exist
- Week/month toggle preserved

**Activity heatmap** — expanded from 13 to **26 weeks** (6 months of history visible)

**AI insight card state** — fixed bug where the card showed stale data after generating a new insight

**Emotion labels** — fixed incorrect label mapping (`i18n` keys were mismatched)

---

## Milestone 16 — Frontend App: Mobile Fixes

**Date:** 2026-05

### What Was Fixed

- **Logout on mobile** — logout button was inside the sidebar which was hidden on mobile; added to `BottomNav` with correct `logout()` call
- **Trade form on mobile** — direction toggle buttons now meet 52px touch target requirement
- **Settings page on mobile** — tab bar scrolls horizontally, form inputs full-width
- **Language/theme toggles** — parity ensured across all roles (trader, mentor, admin) and all auth pages (login, registro)
- **Global error boundary** (`/global-error.tsx`) — catches stale-deployment chunk load errors and shows a reload prompt

---

## Milestone 17 — Frontend App: Onboarding Language Handoff

**Date:** 2026-05

The marketing site passes the user's current locale to the app when linking to `/registro`:
- Marketing links include `?lang=es` or `?lang=en`
- The registro page reads the `lang` param on mount and sets the `NEXT_LOCALE` cookie
- This means a user browsing the English marketing site arrives at the English registration form

---

## Milestone 18 — Frontend Marketing: Full Build

### Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — Hero, TrustBar, Problem, HowItWorks, AiSpotlight, AnalyticsPreview, FeatureGrid, Testimonials, PricingPreview, FinalCta |
| `/funcionalidades` | Four feature rows with detail, screenshots, CTA band |
| `/precios` | Free vs Pro comparison table + FAQ accordion |
| `/blog` | Blog index grid with featured image cards |
| `/blog/[slug]` | Individual post with SVG chart components embedded inline |
| `/sobre-nosotros` | About page — text-only hero, founder section |
| `/login` | Redirect to `app.tradalyst.com/login` |
| `/registro` | Redirect to `app.tradalyst.com/registro` |
| `/privacidad` | Full RGPD privacy policy (ES) |
| `/en/privacy-policy` | Same in English |
| `/terminos` | Terms of use (ES) |
| `/en/terms-of-use` | Same in English |
| `/cookies` | Cookie policy (ES) |
| `/en/cookie-policy` | Same in English |
| `/[locale]/not-found` | Custom 404 — brand-styled, green "404" eyebrow |

### Blog Posts (ES)

| Post | Description |
|------|-------------|
| `diario-de-trading` | How to keep a trading journal |
| `fomo-trading` | FOMO in trading — recognition and control |
| `gestion-de-capital` | Capital management / position sizing |
| `metricas-trading` | Trading metrics — formulas and tools |
| `overtrading` | Overtrading — causes and solutions |
| `por-que-pierden-dinero-los-traders` | Why traders lose money |
| `porcentaje-traders-pierden-dinero` | The statistics behind trader losses |
| `ratio-riesgo-beneficio` | Risk/reward ratio explained |
| `revenge-trading` | Revenge trading — psychology and prevention |

### Blog Posts (EN)

| Post | Description |
|------|-------------|
| `diario-de-trading` | Same as ES (translated) |
| `fomo-trading` | Same as ES |
| `how-to-keep-a-trading-journal` | Expanded EN version (2,800 words) |
| `metricas-trading` | Same as ES |
| `overtrading` | Same as ES |
| `por-que-pierden-dinero-los-traders` | Same as ES |
| `position-sizing` | Position sizing guide |
| `revenge-trading` | Same as ES |
| `trading-journal-template` | Template and framework guide |
| `what-is-fomo-trading` | EN-targeted FOMO piece |
| `why-do-traders-lose-money` | EN-targeted loss psychology piece |

---

## Milestone 19 — Marketing Site: SEO Infrastructure

**Date:** 2026-05

### Technical SEO

- `sitemap.xml` auto-generated from all blog slugs + static pages
- `robots.txt` — allows all crawlers, points to sitemap
- `canonical` links on every page and post
- `hreflang` alternate links on all bilingual pages
- `og:image` via dynamic `/og` route (generates branded OG images server-side)
- `schema.org` `SoftwareApplication` structured data on pricing page
- `schema.org` `Article` structured data on all blog posts
- `schema.org` `FAQPage` structured data where FAQs exist

### Content Expansions (GSC-driven)

Three posts expanded to target near-page-1 keywords:
- `/blog/metricas-trading` — 1,800 → 3,200 words; 5 formula examples, 5 common errors, FAQ
- `/blog/fomo-trading` — 1,500 → 2,600 words; FOMO cycle, 3-step protocol, FAQ
- `/en/blog/diario-de-trading` — 850 → 2,800 words; 7-field framework, weekly review, AI section, FAQ

Two new SEO posts added:
- `/blog/overtrading` (ES + EN mirror)
- `/blog/gestion-de-capital` (ES, covers position-sizing topic)

New posts for GSC impression coverage (May 2026):
- `/blog/porcentaje-traders-pierden-dinero` (ES)
- `/en/blog/what-is-fomo-trading` (EN)
- `/en/blog/why-do-traders-lose-money` (EN)
- `/en/blog/position-sizing` (EN)
- `/en/blog/trading-journal-template` (EN)

### Blog Images

22 WebP files at `frontend/marketing/public/images/blog/`, 800×450px, <80KB each:
- Featured images for every blog post
- In-content images for expanded posts (2 per expanded post)

### SVG Chart Components (Blog)

Four reusable React components embedded inside blog posts:
- `PnlCurveChart` — animated cumulative P&L line chart
- `EmotionWinRateChart` — horizontal bar chart of win rates by emotion
- `RiskRewardDiagram` — visual R:R ratio diagram
- `MetricsTable` — styled metrics reference table

### MdxImage Fix

Bug: `COMPONENT_RE` regex used `[^/]*` which failed to match props containing slashes (`href="/registro"`, `src="/images/..."`). Fix: changed to `[\s\S]*?` (non-greedy, matches any character including `/` and newlines).

---

## Milestone 20 — Marketing Site: PageSpeed Improvements

**Date:** 2026-05

### Changes Made

- Removed `browsersListForSwc` config key (unsupported in Next.js 14, caused warning + minor bundle overhead)
- Converted hero and marketing images to WebP format
- Added `next/image` with `sizes` and `priority` props to above-the-fold images
- Lazy loading applied to below-fold images

Result: Marketing site mobile PageSpeed score improved from 1 to >60.

---

## Milestone 21 — Marketing Site: Footer Redesign

**Date:** 2026-05

### Changes Made

Old: single-row flat layout. New: 3-column grid + bottom bar:
- **Brand column:** Logo, tagline, `hola@tradalyst.com`, copyright
- **Producto column:** Funcionalidades, Precios, Blog, Nosotros
- **Legal column:** Privacidad, Términos, Cookies
- **Bottom bar:** "Hecho con IA en Málaga, España" left · "Powered by Claude · Anthropic" right

Background changed from `bg-white` to `bg-surface`. Logo is clickable (links to `/`).

---

## Milestone 22 — Marketing Site: RGPD Compliance + Cookie Banner

**Date:** 2026-05

### Pages Added

- `/privacidad` + `/en/privacy-policy` — full privacy policy (RGPD/GDPR compliant)
- `/terminos` + `/en/terms-of-use` — terms of use
- `/cookies` + `/en/cookie-policy` — cookie policy

### Cookie Consent Banner

- Component: `frontend/marketing/src/components/legal/CookieBanner.tsx`
- Stores consent in `localStorage` (`cookie_consent: "accepted" | "rejected"`)
- Only loads Google Analytics (`loadGA()`) if accepted
- Persists across page loads via localStorage check on mount

### Google Analytics

- Component: `frontend/marketing/src/components/analytics/GoogleAnalytics.tsx`
- Dynamically appends `gtag.js` script tag on accept
- GA Measurement ID from `NEXT_PUBLIC_GA_ID` env var
- Guard: does not re-inject if script already present

---

## Milestone 23 — Stripe Payments Integration

**Date:** 2026-05

### Frontend Changes

**PlanTab redesign** in `frontend/app/src/app/(trader)/settings/page.tsx`:
- Free user: "Probar 7 días gratis · €9,99/mes" button → calls `POST /api/billing/create-checkout-session/` → redirects to Stripe Checkout
- Pro user: feature list + "Gestionar suscripción" link → calls `GET /api/billing/portal/` → redirects to Stripe Customer Portal
- Handles `?upgrade=success` (refresh user plan, show success banner) and `?upgrade=cancelled` (show dismissable note)
- Tab state reads from `?tab=plan` URL param for direct linking

---

## Milestone 24 — Demo Seed Data

**Date:** 2026-04-23

### Accounts Created

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `admin@tradalyst.com` | `Admin1234!` | admin | Platform admin |
| `trader@tradalyst.com` | `Trader1234!` | trader | Demo: Alex García |
| `mentor@tradalyst.com` | `Mentor1234!` | mentor | Demo: Carlos Ruiz |

### Trade Generation

135 trades over 90 days across 5 assets (BTC/USDT 33%, ETH/USDT 27%, SOL/USDT 17%, EUR/USD 13%, AAPL 10%) with emotion-weighted win rates (confident 93%, fearful 86%, FOMO 33%, revenge 30%). Final result: ~61.5% win rate, +~$2,150 total P&L.

**Support scripts:**
- `tools/scripts/seed_demo.py` — creates the four accounts and 135 trades from scratch
- `tools/scripts/topup_trades.py` — gap-fills from last trade date to today; run before demos

---

## Milestone 25 — Production Deployment (Hetzner VPS)

**Date:** 2026-04-23

- **VPS:** Hetzner, `49.13.237.4`, user `mohammed` (root SSH disabled)
- **Marketing frontend:** PM2 process (`tradalyst-marketing`) on port 3000
- **App frontend:** PM2 process (`tradalyst-app`) on port 3001
- **Backend:** systemd service (`tradalyst`) running Gunicorn on port 8000
- **Reverse proxy:** Nginx routing by subdomain
- **DNS + SSL:** Cloudflare (Full Strict mode)

---

## Milestone 26 — Database Documentation

**Date:** 2026-05-08

- `database/schema.sql` — full production-schema SQL generated from PostgreSQL 16
- `database/er_diagram_instructions.md` — DBML notation + instructions for dbdiagram.io
- `database/seeds.sql` — reference SQL documenting demo account seed data

---

## What Is Not Built Yet

### Backend
- Password reset flow (email-based)
- Email verification on registration
- Change password endpoint (`POST /api/auth/change-password/`) — frontend shows placeholder
- Platform-wide admin stats endpoint
- CSV export endpoint (currently done client-side in browser)

### Frontend
- Full feature gating enforcement at runtime (plan check on every Pro feature)
- Annual pricing plan toggle on pricing page (UI exists, not wired to Stripe)
- Upgrade upsell modal component

### Infrastructure
- CI/CD pipeline
- Stripe webhook must be registered in Stripe Dashboard pointing to `https://api.tradalyst.com/api/billing/webhook/`

### Other
- Final logo mark (icon variant — wordmark exists)
- Mobile-responsive polish pass on trader analytics page
- Privacy policy + terms pages for the app subdomain (currently only on marketing)
