# Tradalyst — Current State

> Snapshot of the project as of 2026-05-18.
> Everything listed here is implemented and deployed unless noted otherwise.

---

## Live URLs

| URL | Status | Description |
|-----|--------|-------------|
| `https://tradalyst.com` | Live | Marketing site + blog |
| `https://app.tradalyst.com` | Live | Trading journal application |
| `https://api.tradalyst.com` | Live | Django REST API |

All three subdomains run on a single Hetzner VPS (`49.13.237.4`, Germany).
Nginx routes by subdomain. Cloudflare handles DNS and SSL (Full Strict mode).

---

## Demo Accounts

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `trader@tradalyst.com` | `Trader1234!` | trader | Pre-loaded with ~135 trades, insights, chat history |
| `mentor@tradalyst.com` | `Mentor1234!` | mentor | Assigned to the demo trader |
| `admin@tradalyst.com` | `Admin1234!` | admin | Platform administration |

Seed: `python tools/scripts/seed_demo.py` (run from project root on the VPS)
Gap fill: `python tools/scripts/topup_trades.py` (run before demos to keep data current)

---

## All Pages — Marketing Site (`tradalyst.com`)

Available in Spanish (default) and English (`/en/` prefix).

| Route (ES) | Route (EN) | Description |
|-----------|-----------|-------------|
| `/` | `/en/` | Homepage — 10 sections |
| `/funcionalidades` | `/en/funcionalidades` | Feature detail page — 4 rows |
| `/precios` | `/en/precios` | Pricing — Free vs Pro comparison + FAQ |
| `/blog` | `/en/blog` | Blog index |
| `/blog/diario-de-trading` | `/en/blog/diario-de-trading` | Trading journal guide |
| `/blog/fomo-trading` | `/en/blog/fomo-trading` | FOMO in trading |
| `/blog/gestion-de-capital` | — | Capital management (ES only) |
| `/blog/metricas-trading` | `/en/blog/metricas-trading` | Trading metrics |
| `/blog/overtrading` | `/en/blog/overtrading` | Overtrading |
| `/blog/por-que-pierden-dinero-los-traders` | `/en/blog/por-que-pierden-dinero-los-traders` | Why traders lose money |
| `/blog/porcentaje-traders-pierden-dinero` | — | Trader loss statistics (ES only) |
| `/blog/ratio-riesgo-beneficio` | — | Risk/reward ratio (ES only) |
| `/blog/revenge-trading` | `/en/blog/revenge-trading` | Revenge trading |
| — | `/en/blog/how-to-keep-a-trading-journal` | EN-targeted journal guide |
| — | `/en/blog/position-sizing` | Position sizing |
| — | `/en/blog/trading-journal-template` | Journal template |
| — | `/en/blog/what-is-fomo-trading` | EN-targeted FOMO piece |
| — | `/en/blog/why-do-traders-lose-money` | EN-targeted loss psychology |
| `/sobre-nosotros` | `/en/sobre-nosotros` | About page |
| `/privacidad` | `/en/privacy-policy` | Privacy policy (RGPD compliant) |
| `/terminos` | `/en/terms-of-use` | Terms of use |
| `/cookies` | `/en/cookie-policy` | Cookie policy |
| `/login` | `/en/login` | Redirects to `app.tradalyst.com/login` |
| `/registro` | `/en/registro` | Redirects to `app.tradalyst.com/registro` |
| `404` | `404` | Custom branded 404 page |

---

## All Pages — App (`app.tradalyst.com`)

### Public (unauthenticated)

| Route | Description |
|-------|-------------|
| `/login` | Email + password login; role-based redirect on success |
| `/registro` | Registration with role selector (trader/mentor), password strength meter |

### Trader role

| Route | Description |
|-------|-------------|
| `/onboarding` | 3-step wizard: trader type → first trade (optional) → confirmation |
| `/dashboard` | TickerTape + stat cards + P&L chart + heatmap + recent trades + AI card + watchlist |
| `/journal` | Paginated trade list with filters (pair, direction, result, emotion, date range) |
| `/journal/new` | Create trade form |
| `/journal/[id]` | Trade detail — all fields + edit/delete actions |
| `/journal/[id]/edit` | Edit trade form pre-filled |
| `/ai` | AI insights accordion + persistent chat interface |
| `/analytics` | 6 SVG charts: P&L by period, P&L by asset, win rate by emotion, trades by hour, long vs short, drawdown |
| `/settings` | Profile, security, mentor, plan (Stripe), cuenta (CSV export) |
| `/mentor-trades` | Read-only view of mentor's trade journal |

### Mentor role

| Route | Description |
|-------|-------------|
| `/mentor` | List of assigned traders |
| `/mentor/[traderId]` | Trader's journal (read-only, filtered, paginated) |
| `/mentor/[traderId]/dashboard` | Trader's stats dashboard |
| `/mentor/[traderId]/trade/[id]` | Trade detail + annotation panel |

### Admin role

| Route | Description |
|-------|-------------|
| `/admin` | Platform stat tiles + recent registrations |
| `/admin/users` | Searchable, filterable user list |
| `/admin/users/[id]` | User detail with suspend/activate/delete |

---

## All API Endpoints — Backend (`api.tradalyst.com`)

### `/api/auth/`

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register/` | Public |
| POST | `/api/auth/login/` | Public |
| POST | `/api/auth/logout/` | Any |
| POST | `/api/auth/token/refresh/` | Public |

### `/api/users/`

| Method | Path | Auth |
|--------|------|------|
| GET/PATCH | `/api/users/me/` | Any |
| GET | `/api/users/` | Admin |
| GET/PATCH | `/api/users/<id>/` | Admin |

### `/api/trades/`

| Method | Path | Auth |
|--------|------|------|
| GET/POST | `/api/trades/` | Trader |
| GET | `/api/trades/stats/` | Trader |
| POST | `/api/trades/import/` | Trader |
| GET/PATCH/DELETE | `/api/trades/<id>/` | Trader |

### `/api/analysis/`

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/analysis/insights/` | Trader |
| POST | `/api/analysis/insights/generate/` | Trader |
| GET | `/api/analysis/chat/` | Trader |
| POST | `/api/analysis/chat/send/` | Trader |

### `/api/mentors/`

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/mentors/requests/` | Mentor |
| GET | `/api/mentors/requests/sent/` | Mentor |
| GET | `/api/mentors/requests/received/` | Trader |
| POST | `/api/mentors/requests/<id>/accept/` | Trader |
| POST | `/api/mentors/requests/<id>/reject/` | Trader |
| DELETE | `/api/mentors/assignments/<id>/` | Trader/Mentor |
| GET | `/api/mentors/my-traders/` | Mentor |
| GET | `/api/mentors/my-mentor/` | Trader |
| GET | `/api/mentors/traders/<id>/trades/` | Mentor |
| GET | `/api/mentors/mentor-trades/` | Trader |
| GET/POST | `/api/mentors/trades/<id>/annotations/` | Mentor |
| GET/PATCH/DELETE | `/api/mentors/annotations/<id>/` | Mentor |

### `/api/prices/`

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/prices/?symbols=BTC,ETH` | Trader/Mentor |

### `/api/billing/`

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/billing/create-checkout-session/` | Trader |
| GET | `/api/billing/portal/` | Trader |
| POST | `/api/billing/webhook/` | Public (Stripe HMAC) |

**Total: 31 endpoints.**

---

## Database Tables (Current Schema)

| Table | App | Purpose |
|-------|-----|---------|
| `users_customuser` | users | All platform users — email as login field |
| `trades_trade` | trades | All trade journal entries |
| `analysis_aiinsight` | analysis | Claude AI weekly insight reports |
| `analysis_chatmessage` | analysis | Persistent AI chat history |
| `mentors_mentorrequest` | mentors | Mentor follow requests (pending/accepted/rejected) |
| `mentors_mentorassignment` | mentors | Active mentor–trader relationships |
| `mentors_mentorannotation` | mentors | Mentor notes on individual trades |
| `token_blacklist_blacklistedtoken` | simplejwt | Blacklisted refresh tokens (logout) |
| `token_blacklist_outstandingtoken` | simplejwt | Issued tokens (simplejwt auto-managed) |

### Key fields on `users_customuser`

| Field | Type | Notes |
|-------|------|-------|
| `email` | VARCHAR | Unique, login field |
| `role` | VARCHAR(10) | `trader` / `mentor` / `admin` |
| `plan` | VARCHAR(4) | `free` / `pro` |
| `theme_preference` | VARCHAR(5) | `light` / `dark` |
| `language_preference` | VARCHAR(2) | `es` / `en` |
| `pinned_assets` | JSONB | User's watchlist (up to 8 symbols) |
| `stripe_customer_id` | VARCHAR(100) | Stripe customer reference |
| `onboarding_completed` | BOOLEAN | Gate for onboarding redirect |

### Key fields on `trades_trade`

| Field | Type | Notes |
|-------|------|-------|
| `pair` | VARCHAR(20) | e.g. `BTC/USDT`, `EURUSD` |
| `direction` | VARCHAR(5) | `long` / `short` |
| `entry_price` | NUMERIC(20,8) | Never FloatField |
| `exit_price` | NUMERIC(20,8) | Nullable (open trade) |
| `quantity` | NUMERIC(20,8) | Position size |
| `pnl` | NUMERIC(20,8) | Auto-calculated in `save()` |
| `result` | VARCHAR(10) | `win` / `loss` / `breakeven` |
| `emotion` | VARCHAR(10) | `calm` / `confident` / `fearful` / `greedy` / `anxious` / `fomo` / `revenge` / `neutral` |

---

## Features — Complete List

### Authentication & Security
- [x] Email + password registration with role selector
- [x] JWT stored exclusively in httpOnly cookies
- [x] Access token: 15 min TTL; Refresh token: 7 days TTL
- [x] Refresh token rotation with blacklist
- [x] Role claim injected into JWT payload (`TradalystRefreshToken`)
- [x] Edge middleware enforces role-based routing before page render
- [x] Logout blacklists token server-side
- [x] Password strength meter on registration

### Trade Journal
- [x] Create, read, update, delete trades
- [x] Emotion tagging (8 emotional states)
- [x] Result tagging (win / loss / breakeven)
- [x] Auto P&L calculation (long/short formulas)
- [x] Filters: pair, direction, result, emotion, date range
- [x] Pagination (20 per page)
- [x] CSV import (up to 1,000 rows, flexible header aliases, ES+EN column names)
- [x] CSV export (client-side blob generation from journal)
- [ ] Server-side CSV export endpoint (currently browser-only)

### Analytics & Dashboard
- [x] Live prices: TickerTape (BTC, ETH, SOL, BNB, EUR/USD, GBP/USD, AAPL, TSLA, NVDA)
- [x] User-customisable watchlist via MarketQuotes widget (up to 8 assets from 30+ options)
- [x] Stat cards: Total P&L, Win Rate, Trade count, Avg R:R
- [x] Cumulative P&L line chart (SVG)
- [x] Activity heatmap (26 weeks / 6 months)
- [x] P&L by period bar chart (week/month toggle)
- [x] P&L by asset horizontal bar chart
- [x] Win rate by emotion horizontal bar chart
- [x] Trades by hour bar chart
- [x] Long vs short win rate comparison
- [x] Drawdown area chart
- [x] Aggregate stats: max drawdown, best/worst trade, most-traded pair

### AI Analysis
- [x] AI insight generation (requires ≥5 trades in last 90 days)
- [x] Insight history with accordion UI
- [x] Persistent AI chat (stored in DB, restored on page load)
- [x] Trade context injected into chat (last 90 days)
- [x] Chat history limit: last 10 messages sent to Claude
- [x] Typing indicator (animated dots)
- [x] Suggested prompts grid when chat is empty
- [x] Optimistic UI updates (message appears immediately)

### Mentor System
- [x] Mentor sends follow request to trader by email
- [x] Trader sees pending requests and accepts/rejects
- [x] Either party can end the relationship
- [x] Mentor reads assigned trader's full journal (read-only)
- [x] Mentor views trader's stats dashboard
- [x] Mentor leaves annotations on individual trades
- [x] Trader can read their mentor's trade journal
- [x] Mentor tab in trader settings shows pending requests + current mentor

### Payments
- [x] Stripe Checkout integration (test mode)
- [x] 7-day free trial before billing
- [x] Stripe Customer Portal for subscription management
- [x] Webhook handlers for upgrade/downgrade events
- [x] Plan field on user model (`free` / `pro`)
- [ ] Feature gating enforcement at runtime (plan read but not hard-blocked yet)

### Personalisation
- [x] Light/dark theme toggle (persisted via cookie + synced to DB)
- [x] Language preference (ES/EN) — persisted via cookie + synced to DB
- [x] User-customisable watchlist (saved to `pinned_assets` JSON field)

### Marketing Site
- [x] Full homepage (10 sections)
- [x] Funcionalidades, Precios, Sobre Nosotros pages
- [x] Blog with 20 posts across ES and EN
- [x] 4 reusable SVG chart components embedded in posts
- [x] 22 optimised WebP blog images
- [x] Full i18n (ES default, EN via `/en/` prefix)
- [x] Cookie consent banner (RGPD compliant)
- [x] Google Analytics (loaded only on consent)
- [x] RGPD legal pages (privacy, terms, cookies) in ES + EN
- [x] Custom 404 page
- [x] `sitemap.xml`, `robots.txt`
- [x] `hreflang` alternate links on all bilingual pages
- [x] OG image generation via `/og` route
- [x] `schema.org` structured data (SoftwareApplication + Article + FAQPage)
- [x] Footer with brand + product + legal columns

### Infrastructure
- [x] Three-file Django settings (`base`, `development`, `production`)
- [x] Nginx reverse proxy (3 subdomains from one VPS)
- [x] Cloudflare DNS + SSL (Full Strict mode)
- [x] PM2 process manager for both Next.js apps
- [x] Gunicorn + systemd for Django
- [x] PostgreSQL 15 (production: PostgreSQL 16 on VPS)
- [x] Database schema SQL (`database/schema.sql`)
- [x] ER diagram DBML (`database/er_diagram_instructions.md`)

---

## Environment Variables Required

### `backend/.env`

```bash
DJANGO_SETTINGS_MODULE=tradalyst.settings.development
SECRET_KEY=<django-secret-key>
DATABASE_URL=postgresql://postgres:password@localhost:5432/tradalyst_dev
CLAUDE_API_KEY=<anthropic-api-key>
FINNHUB_API_KEY=<finnhub-api-key>
JWT_SIGNING_KEY=<jwt-signing-key>
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
STRIPE_SECRET_KEY=<stripe-sk-test-...>
STRIPE_WEBHOOK_SECRET=<stripe-whsec-...>
STRIPE_PRO_PRICE_ID=<stripe-price-id>
COOKIE_DOMAIN=localhost
COOKIE_SECURE=False
COOKIE_SAMESITE=Lax
```

### `frontend/app/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_MARKETING_URL=http://localhost:3000
```

### `frontend/marketing/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_GA_ID=<google-analytics-id>
```

Production uses real domain names instead of localhost.

---

## Known Issues and Limitations

| Issue | Status | Notes |
|-------|--------|-------|
| Feature gating not enforced at runtime | Open | Plan field exists; Pro features accessible to free users |
| CSV export is client-side only | Open | No `/api/trades/export/` endpoint; done in browser |
| Password change endpoint not implemented | Open | Frontend shows "coming soon" placeholder |
| Email verification not implemented | Open | Registration creates active accounts immediately |
| Password reset (email flow) not implemented | Open | No "forgot password" flow |
| Annual pricing plan not wired to Stripe | Open | Toggle UI on pricing page exists but non-functional |
| Analytics page not fully mobile-responsive | Open | Desktop-first; some overflow on small screens |
| Stripe webhook not registered in Dashboard | Open | Must be done manually before going live |
| Admin stats endpoint not built | Open | Admin page shows user counts only, no revenue/trade totals |

---

## Local Development Setup

```bash
# Tab 1 — Backend
cd backend
source venv/bin/activate
python manage.py runserver 8000

# Tab 2 — Marketing site (port 3000)
cd frontend/marketing
npm run dev

# Tab 3 — App (port 3001)
cd frontend/app
npm run dev
```

PostgreSQL runs as a Homebrew background service on Mac (`brew services start postgresql@15`).

---

## Production Deployment

```bash
ssh mohammed@49.13.237.4

# After frontend changes
cd /var/www/tradalyst/frontend/app
npm run build && pm2 restart tradalyst-app

# After backend changes
cd /var/www/tradalyst/backend
source venv/bin/activate
python manage.py migrate
sudo systemctl restart tradalyst

# Refresh demo data
cd /var/www/tradalyst
python tools/scripts/topup_trades.py
```
