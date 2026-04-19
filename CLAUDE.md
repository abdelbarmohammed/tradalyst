# Tradalyst — CLAUDE.md

> This file is read automatically by Claude Code on every session.
> Keep it accurate. Update it when decisions change.
> Last updated: 2026-04

---

## What This Project Is

Tradalyst is a full-stack AI-powered trading journal web application.
Traders log trades with reasoning and emotional state. The Claude AI API
analyses behavioural patterns and delivers personalised insights through
a dashboard, insight cards, and a live AI chat interface.

- **Target users:** Casual-to-serious retail traders (crypto, forex, stocks)
- **Built as:** DAW Final Project at Digitech FP, Málaga, Spain
- **Developer:** Mo — interning at Ebury (Fintech)
- **Tagline:** "El diario que detecta lo que tú no ves."

---

## Subdomains

| URL | What | Tech |
|-----|------|------|
| `tradalyst.com` | Marketing site + blog | Next.js 14 (light theme) |
| `app.tradalyst.com` | Trading journal app | Next.js 14 (dark theme) |
| `api.tradalyst.com` | REST API | Django + DRF |

All three subdomains point to the same Hetzner VPS.
Nginx routes traffic to the correct service.
Cloudflare handles DNS and SSL.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + Tailwind CSS (App Router) |
| Backend | Python Django 5 + Django REST Framework |
| Database | PostgreSQL |
| Auth | djangorestframework-simplejwt (httpOnly cookies) |
| AI | Claude API — `claude-sonnet-4-6` |
| Reverse proxy | Nginx (production only — Hetzner VPS) |
| External APIs | CoinGecko (crypto) + Finnhub (stocks/forex) |
| DNS + CDN | Cloudflare |
| Hosting | Hetzner VPS |
| Version control | Git + GitHub |

**Note: No Docker.** Local development runs services directly.
Production deployment installs services directly on Hetzner VPS.

---

## Local Development Setup

No Docker. Three terminal tabs run everything locally.

**Prerequisites (install once):**
```bash
brew install postgresql@15 python@3.12 node@20
brew services start postgresql@15
npm install -g @anthropic-ai/claude-code
```

**Tab 1 — Django backend (api — port 8000):**
```bash
cd backend
source venv/bin/activate
python manage.py runserver 8000
```

**Tab 2 — Next.js marketing site (port 3000):**
```bash
cd frontend/marketing
npm run dev
```

**Tab 3 — Next.js app (port 3001):**
```bash
cd frontend/app
npm run dev
```

**PostgreSQL** runs as a Mac background service via Homebrew.
Connect locally: `psql -U postgres -d tradalyst_dev`

**Environment files:**
- `backend/.env` — Django secrets (never commit)
- `frontend/marketing/.env.local` — Next.js env vars
- `frontend/app/.env.local` — Next.js env vars

---

## Monorepo Structure

```
tradalyst/
├── CLAUDE.md                    ← You are here
├── README.md
├── .gitignore
│
├── backend/                     ← Django REST API
│   ├── tradalyst/               ← Django project (settings)
│   │   └── settings/
│   │       ├── base.py
│   │       ├── development.py
│   │       └── production.py
│   ├── apps/
│   │   ├── users/               ← Auth, profiles, roles
│   │   ├── trades/              ← Trade journal CRUD
│   │   ├── analysis/            ← Claude AI: insights + chat
│   │   ├── mentors/             ← Assignments + annotations
│   │   └── prices/              ← CoinGecko + Finnhub proxy
│   ├── core/
│   │   ├── constants.py         ← ALL magic numbers live here
│   │   ├── exceptions.py
│   │   └── pagination.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                     ← Never commit
│
├── frontend/
│   ├── marketing/               ← tradalyst.com
│   │   ├── src/app/             ← Next.js App Router pages
│   │   ├── src/components/
│   │   ├── src/lib/blog.ts      ← Markdown blog renderer
│   │   └── src/content/blog/    ← .md blog posts (4 minimum at launch)
│   └── app/                     ← app.tradalyst.com
│       ├── src/app/             ← Next.js App Router pages
│       ├── src/components/
│       ├── src/hooks/
│       ├── src/lib/
│       │   ├── api.ts           ← Central fetch wrapper
│       │   ├── auth.ts          ← Token management (httpOnly cookies)
│       │   └── format.ts        ← Number/date formatters
│       ├── src/middleware.ts    ← Edge auth + role enforcement
│       └── src/types/
│
├── nginx/                       ← Production only (Hetzner VPS)
│   └── conf.d/
│       ├── marketing.conf
│       ├── app.conf
│       └── api.conf
│
├── database/
│   ├── schema.sql               ← Generated reference (do not run manually)
│   ├── seeds.sql                ← Demo accounts + Alex's trade history
│   └── er_diagram.png
│
├── docs/
│   ├── decisions/               ← Architecture Decision Records (ADRs)
│   └── runbooks/                ← Deploy, seed, rollback procedures
│
└── tools/
    ├── scripts/                 ← seed_db.py, export_schema.sh
    └── prompts/                 ← Claude prompt templates
        ├── weekly-insight.txt
        └── chat-system.txt
```

---

## Django App Structure

Each Django app owns its domain completely:

```
apps/users/      → CustomUser model, auth, roles, permissions
apps/trades/     → Trade CRUD, filters, CSV export, stats
apps/analysis/   → AiInsight, ChatMessage, Claude service
apps/mentors/    → MentorAssignment, MentorAnnotation
apps/prices/     → CoinGecko + Finnhub proxy with cache
```

**Every new endpoint follows this exact pattern — no exceptions:**
`models.py` → `serializers.py` → `views.py` → `urls.py`

---

## Code Standards — Read Before Writing Any Code

These standards apply to every file generated or modified in this project.
The goal is code that is readable, scalable, and maintainable by anyone
who picks it up — not just the original author.

### General Principles

- **One responsibility per function/class** — if you need "and" to describe
  what something does, split it into two things
- **Explicit over implicit** — name things clearly, never abbreviate unless
  universally understood (e.g. `id`, `url`)
- **Fail loudly** — raise proper exceptions with meaningful messages,
  never silently swallow errors
- **No dead code** — never leave commented-out code in commits,
  never leave TODO comments without a GitHub issue reference
- **No magic numbers** — every numeric constant lives in `core/constants.py`
  with a name that explains its purpose
- **No hardcoded strings** — status values, role names, and error messages
  use constants or enums, never inline strings

### Python / Django Standards

- **Type hints on every function signature** — parameters and return types
  ```python
  def get_trade_stats(user_id: int, days: int = 30) -> dict:
  ```
- **Docstrings on every non-trivial function** — one line explaining what,
  not how
  ```python
  def generate_weekly_insight(user: CustomUser) -> AiInsight:
      """Generate and persist a Claude AI insight for the given trader."""
  ```
- **Serializers handle validation** — never validate in views
- **Views handle HTTP only** — business logic lives in services or models,
  never in views
- **Services layer for complex logic** — `apps/analysis/services/claude.py`
  pattern applies to all complex operations
- **QuerySets are lazy** — never evaluate a queryset before you need to,
  never loop to filter what the ORM can filter
- **`select_related` and `prefetch_related`** — always used when
  accessing related models to avoid N+1 queries
- **Never use `except Exception`** — catch specific exceptions only
- **Logging not print** — use `import logging; logger = logging.getLogger(__name__)`
  never `print()` in production code

### TypeScript / Next.js Standards

- **TypeScript strict mode** — `"strict": true` in `tsconfig.json`
  no `any` types ever — use `unknown` and narrow properly
- **Every API response typed** — define interfaces in `src/types/`
  for every Django endpoint response shape
- **Central API client** — all fetch calls go through `src/lib/api.ts`
  never raw `fetch()` scattered across components
- **Server Components by default** — only use `"use client"` when
  the component genuinely needs browser APIs or interactivity
- **Error boundaries** — every page-level component wrapped in error boundary
- **Loading states** — every async operation has a skeleton or spinner state
- **No inline styles** — Tailwind classes only, never `style={{}}`
- **Component naming** — PascalCase for components, camelCase for functions
  and variables, SCREAMING_SNAKE_CASE for constants

### Security Standards

- **JWT in httpOnly cookies** — never localStorage, never sessionStorage
- **CORS locked down** — only `tradalyst.com` and `app.tradalyst.com`
  allowed in production
- **All inputs validated twice** — client-side for UX, server-side for security
- **Never trust the frontend** — role checks happen in Django permissions,
  never only in the Next.js middleware
- **Environment variables only** — API keys, secrets, database URLs
  never in source code, never in version control
- **`.env.example` always updated** — when adding a new env var,
  add it to `.env.example` with an empty value and a comment

### Git Standards

- **Conventional commits:**
  ```
  feat: add trade export to CSV
  fix: correct P&L calculation on short trades
  docs: update API endpoint reference
  refactor: extract Claude prompt to template file
  chore: add missing type hints to serializers
  ```
- **One feature per branch** — never commit directly to `main`
- **Branch naming:** `feat/trade-export`, `fix/pnl-calculation`
- **No commits with broken tests or linting errors**

---

## Critical Rules — Read Before Every Code Change

### Authentication
- JWT stored in **httpOnly cookies only** — never localStorage
- Access token TTL: 15 minutes
- Refresh token TTL: 7 days
- Logout blacklists the refresh token via simplejwt
- `middleware.ts` in Next.js enforces auth at the edge — before any page loads
- Never bypass middleware for role checking

### Constants
- **Never hardcode magic numbers in logic**
- All named constants live in `backend/core/constants.py`
- Current constants:
  ```python
  AI_INSIGHT_MIN_TRADES = 5      # Minimum trades before AI activates
  PRICE_CACHE_TTL = 60           # Seconds to cache external API responses
  CHAT_HISTORY_LIMIT = 10        # Last N messages sent to Claude
  TRADE_SUMMARY_DAYS = 90        # Days of history in AI chat context
  WATCHLIST_MAX_ASSETS = 8       # Max pinned assets per user
  ```

### External APIs
- **Never call CoinGecko or Finnhub from the frontend**
- All price calls go through `/api/prices/` — Django proxies them
- Backend caches responses for `PRICE_CACHE_TTL` seconds
- Crypto tickers → CoinGecko (`apps/prices/services/coingecko.py`)
- Forex + stocks → Finnhub (`apps/prices/services/finnhub.py`)

### AI Integration
- All Claude API calls live in `apps/analysis/services/claude.py` only
- Prompt templates live in `tools/prompts/` — not hardcoded in views
- AI insight requires `AI_INSIGHT_MIN_TRADES` trades before activation
- Chat context = last `TRADE_SUMMARY_DAYS` days + last `CHAT_HISTORY_LIMIT` messages
- Never expose the Claude API key — lives in `.env` only

### Database
- Django ORM only — never raw SQL in views or serializers
- Migrations are source of truth — never edit `schema.sql` by hand
- `NUMERIC(20,8)` for all price and P&L fields — never `FloatField`
- All timestamps use `DateTimeField` → maps to `TIMESTAMPTZ` in PostgreSQL
- Always use `select_related` / `prefetch_related` on related model access

### Settings
- Never use a single `settings.py`
- Select environment via `DJANGO_SETTINGS_MODULE`:
  - `tradalyst.settings.development` — local
  - `tradalyst.settings.production` — server
- `DEBUG=True` only in `development.py` — never in `production.py`

### Frontend Routing
- Route groups enforce role separation: `(trader)/`, `(mentor)/`, `(admin)/`
- `middleware.ts` reads JWT role and redirects wrong-role requests before render
- Login redirect by role: trader → `/dashboard`, mentor → `/mentor`,
  admin → `/admin`

---

## User Roles

| Role | Access |
|------|--------|
| `trader` | Own journal, dashboard, AI analysis, analytics, settings |
| `mentor` | Read-only journal + dashboard of assigned traders, annotations |
| `admin` | Platform stats, user management — no personal journal |

Roles are **non-overlapping**. An admin who also trades uses a separate trader account.
Mentor access is a **feature of the trader's Pro plan** — not a separate paid tier.

---

## Database Tables (Quick Reference)

| Table | Django App | Purpose |
|-------|-----------|---------|
| `users_customuser` | users | All users — email is login field |
| `trades_trade` | trades | All trade journal entries |
| `analysis_aiinsight` | analysis | Weekly AI-generated insights |
| `analysis_chatmessage` | analysis | Persistent chat history |
| `mentors_mentorassignment` | mentors | Trader ↔ mentor relationships |
| `mentors_mentorannotation` | mentors | Mentor notes on individual trades |
| `token_blacklist_*` | simplejwt | Logout token invalidation (auto-managed) |

Full schema: `docs/architecture/database_schema.md`

---

## API Endpoint Groups (Quick Reference)

| Group | Base path | Auth |
|-------|-----------|------|
| Auth | `/api/auth/` | Public + authenticated |
| Trades | `/api/trades/` | Trader |
| Analysis | `/api/analysis/` | Trader |
| Prices | `/api/prices/` | Authenticated |
| Watchlist | `/api/watchlist/` | Trader + Mentor |
| Mentors | `/api/mentors/` | Trader + Mentor |
| Users | `/api/users/` | Admin + self |

Full endpoint list: `docs/architecture/api_endpoints.md`

---

## Design System (Quick Reference)

**Marketing site:** Light theme — base `#eceee8`, surface `#f5f6f2`
**App:** Dark theme — base `#1e1e1e`, surface `#272727`, elevated `#303030`
**Accent:** Green `#2fac66` — CTAs, active states, profit, AI highlights ONLY
**Loss:** `#d94040` (light bg) / `#f06060` (dark bg) — ONLY for negative P&L
**Never:** Purple, blue, amber, gradients on buttons/backgrounds, border-radius > 6px
**Fonts:** IBM Plex Sans (UI) + IBM Plex Mono (all numbers, prices, timestamps)

Full design system: `tradalyst-brand-identity.html`

---

## Environment Variables Required

```bash
# backend/.env
DJANGO_SETTINGS_MODULE=tradalyst.settings.development
SECRET_KEY=
DATABASE_URL=postgresql://postgres:password@localhost:5432/tradalyst_dev
CLAUDE_API_KEY=
FINNHUB_API_KEY=
JWT_SIGNING_KEY=
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# frontend/app/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# frontend/marketing/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Production values use real domains instead of localhost.
See `.env.example` in each directory for the full list.

---

## What Is Not Built Yet

- Final logo mark (wordmark exists, icon mark pending)
- Mentor pages full spec (`/mentor/*`)
- Admin pages full spec (`/admin/*`)
- Mobile responsive behaviour
- Payment/subscription integration (Stripe — planned, not yet specced)
- Privacy policy + Terms pages (required for RGPD)

---

## Key Reference Documents

| Document | Location | Contents |
|----------|----------|---------|
| Project overview | `docs/architecture/project_overview.md` | Full project context |
| IA/UX spec | `docs/architecture/ia_ux_spec.md` | Sitemap, page blueprints, UX flows |
| Database schema | `docs/architecture/database_schema.md` | All tables, columns, constraints |
| API endpoints | `docs/architecture/api_endpoints.md` | All 37 endpoints with shapes |
| Architecture decisions | `docs/decisions/` | ADRs for every major decision |
| Brand identity | `tradalyst-brand-identity.html` | Full design system |
