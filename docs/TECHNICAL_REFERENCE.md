# Tradalyst — Technical Reference

> **Single source of truth for the entire Tradalyst project.**
> Written for Mo's DAW presentation at Digitech FP, Málaga.
> Last updated: 2026-05-18

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Backend — Django REST API](#3-backend--django-rest-api)
4. [Database Schema](#4-database-schema)
5. [Authentication & Security](#5-authentication--security)
6. [Frontend — Marketing Site](#6-frontend--marketing-site-tradalystcom)
7. [Frontend — App](#7-frontend--app-apptradalystcom)
8. [User Roles](#8-user-roles--detailed-breakdown)
9. [AI Integration](#9-ai-integration)
10. [External APIs](#10-external-apis)
11. [Features — Complete List](#11-features--complete-list)
12. [Deployment](#12-deployment)
13. [Known Limitations & Future Work](#13-known-limitations--future-work)
14. [School Requirements Checklist](#14-school-requirements-checklist)

---

## 1. Project Overview

### What Tradalyst Is

Tradalyst is a full-stack, AI-powered trading journal web application built as the DAW (Desarrollo de Aplicaciones Web) Final Project at Digitech FP, Málaga, Spain. Developed by Mohammed (Mo), who was simultaneously interning at Ebury (a global fintech company), Tradalyst solves a real problem: most retail traders lose money not because of bad market knowledge, but because of bad habits, emotions, and patterns they cannot see in themselves.

The application lets traders log every trade with entry/exit prices, quantity, direction (long/short), outcome (win/loss/breakeven), and — critically — their emotional state at the time of the trade (calm, confident, FOMO, revenge, greedy, etc.). Over time, the platform's Claude AI analyses these journals and surfaces patterns the trader cannot see themselves: "You win 70% of your long trades but only 22% of your shorts" or "Every time you trade while feeling FOMO, you lose." This transforms an ordinary trade log into a behavioural feedback loop.

The tagline — **"El diario que detecta lo que tú no ves"** — captures this exactly: the journal that detects what you cannot see.

Tradalyst supports three user roles. **Traders** maintain their journal and receive AI analysis. **Mentors** are experienced traders who can request access to a trader's journal, leave annotations on individual trades, and guide the trader through their progress. **Admins** manage the platform. The mentor–trader relationship has a formal request-and-accept flow so traders remain in full control of who sees their data.

### Live URLs

| Subdomain | Purpose | Technology |
|-----------|---------|-----------|
| `tradalyst.com` | Marketing site + blog | Next.js 14 (light theme) |
| `app.tradalyst.com` | Trading journal application | Next.js 14 (dark/light toggle) |
| `api.tradalyst.com` | Django REST API | Django 5 + DRF |

All three subdomains run on the same **Hetzner VPS** in Germany. Nginx routes incoming requests to the correct service based on the subdomain. Cloudflare handles DNS, SSL termination (with Full Strict mode), and CDN caching.

### Tech Stack

| Layer | Technology | Version / Notes |
|-------|-----------|----------------|
| Frontend (app) | Next.js + TypeScript | 14, App Router |
| Frontend (marketing) | Next.js + TypeScript | 14, App Router |
| CSS | Tailwind CSS | 3.x |
| Backend | Python + Django | 3.12 / Django 5 |
| REST framework | Django REST Framework | 3.x |
| Database | PostgreSQL | 15 |
| Authentication | djangorestframework-simplejwt | httpOnly JWT cookies |
| AI | Anthropic Claude API | `claude-sonnet-4-6` |
| Crypto prices | CoinGecko API | Free tier, no auth |
| Stock/forex prices | Finnhub API | Free tier, API key required |
| Market widgets | TradingView Embedded Widgets | Free, CDN loaded |
| i18n | next-intl | ES (default) + EN |
| Fonts | IBM Plex Sans + IBM Plex Mono | Via Google Fonts |
| Process manager | PM2 | For both Next.js apps |
| Reverse proxy | Nginx | Production only |
| DNS + SSL | Cloudflare | Full Strict mode |
| Hosting | Hetzner VPS | Ubuntu, Germany |
| Version control | Git + GitHub | |

**Important:** No Docker. All services run directly on the VPS or locally.

### Architecture Overview

```
Browser
  │
  ├─── tradalyst.com ──────────────► Cloudflare ─► Nginx :80/443
  │                                                   │
  ├─── app.tradalyst.com ──────────► Cloudflare ─► Nginx :80/443
  │                                                   │
  └─── api.tradalyst.com ──────────► Cloudflare ─► Nginx :80/443
                                                      │
                             ┌────────────────────────┤
                             │                        │
                    Next.js marketing            Next.js app
                    PM2: tradalyst-marketing      PM2: tradalyst-app
                    Port 3000                     Port 3001
                             │                        │
                             └────────────────────────┤
                                                      │
                                              Gunicorn / Django
                                              systemd: gunicorn
                                              Port 8000
                                                      │
                                               PostgreSQL :5432
```

**Communication pattern:**
- The browser communicates with `api.tradalyst.com` directly via `fetch()` with `credentials: "include"`. JWT tokens travel as httpOnly cookies — they are set by the Django API, stored by the browser, and sent automatically with every cross-origin request.
- The Next.js frontend apps are purely client-side after hydration; they do not proxy API calls through Next.js server routes.
- The marketing site links to the app via regular `<a href>` tags, passing the current locale as a `?lang=` query parameter so the user's language choice is preserved across subdomains.
- CoinGecko and Finnhub are called **only from the Django backend**. The frontend never calls them directly.

### Demo Accounts

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `alex@tradalyst.com` | `Tradalyst2025!` | Trader | Pre-loaded with ~60 trades, insights, and chat history |
| `mentor@tradalyst.com` | `Tradalyst2025!` | Mentor | Assigned to Alex's account |
| `admin@tradalyst.com` | `Tradalyst2025!` | Admin | Platform administration |

> Seed these accounts with: `python tools/scripts/seed_db.py`

---

## 2. Repository Structure

```
tradalyst/
│
├── CLAUDE.md                        ← Project instructions for Claude Code (AI coding assistant)
├── README.md                        ← Project overview and quick start
├── .gitignore
│
├── backend/                         ← Django REST API (api.tradalyst.com)
│   ├── manage.py                    ← Django management entry point
│   ├── requirements.txt             ← Python dependencies
│   ├── .env                         ← Secret keys (NEVER committed)
│   ├── .env.example                 ← Template for required env vars
│   │
│   ├── tradalyst/                   ← Django project configuration
│   │   ├── settings/
│   │   │   ├── base.py              ← Shared settings (apps, middleware, JWT, CORS)
│   │   │   ├── development.py       ← Local dev (DEBUG=True, localhost CORS)
│   │   │   └── production.py        ← VPS production (DEBUG=False, real domains)
│   │   ├── urls.py                  ← Root URL router (delegates to each app)
│   │   ├── wsgi.py                  ← WSGI entry for Gunicorn
│   │   └── asgi.py                  ← ASGI entry (unused, for future async)
│   │
│   ├── apps/
│   │   ├── users/                   ← Auth, profiles, roles
│   │   │   ├── models.py            ← CustomUser model
│   │   │   ├── serializers.py       ← Registration, login, profile serializers
│   │   │   ├── views.py             ← Auth endpoints (register, login, logout, refresh)
│   │   │   ├── urls.py              ← /api/auth/ routes
│   │   │   ├── user_urls.py         ← /api/users/ routes (me, admin)
│   │   │   ├── authentication.py    ← CookieJWTAuthentication, TradalystRefreshToken
│   │   │   ├── permissions.py       ← IsTrader, IsMentor, IsAdmin, IsTraderOrMentor
│   │   │   ├── admin.py             ← Django admin registration
│   │   │   └── migrations/          ← Database migrations
│   │   │
│   │   ├── trades/                  ← Trade journal CRUD
│   │   │   ├── models.py            ← Trade model with auto P&L calculation
│   │   │   ├── serializers.py       ← Trade and stats serializers
│   │   │   ├── views.py             ← CRUD + stats + CSV import
│   │   │   ├── filters.py           ← TradeFilter (pair, direction, result, dates)
│   │   │   ├── urls.py              ← /api/trades/ routes
│   │   │   ├── admin.py
│   │   │   └── migrations/
│   │   │
│   │   ├── analysis/                ← Claude AI: insights + chat
│   │   │   ├── models.py            ← AiInsight, ChatMessage
│   │   │   ├── serializers.py       ← Insight and chat serializers
│   │   │   ├── views.py             ← Insight generation + chat send
│   │   │   ├── urls.py              ← /api/analysis/ routes
│   │   │   ├── admin.py
│   │   │   ├── migrations/
│   │   │   └── services/
│   │   │       ├── claude.py        ← ALL Claude API calls live here
│   │   │       └── prompts.py       ← Loads prompt templates from tools/prompts/
│   │   │
│   │   ├── mentors/                 ← Mentor assignments + annotations
│   │   │   ├── models.py            ← MentorRequest, MentorAssignment, MentorAnnotation
│   │   │   ├── serializers.py       ← Mentor-related serializers
│   │   │   ├── views.py             ← Mentor workflow endpoints
│   │   │   ├── urls.py              ← /api/mentors/ routes
│   │   │   ├── admin.py
│   │   │   └── migrations/
│   │   │
│   │   └── prices/                  ← External price proxy with cache
│   │       ├── views.py             ← Routes requests to CoinGecko or Finnhub
│   │       ├── urls.py              ← /api/prices/ route
│   │       ├── admin.py
│   │       └── services/
│   │           ├── coingecko.py     ← Crypto prices (CoinGecko API)
│   │           └── finnhub.py       ← Stock/forex prices (Finnhub API)
│   │
│   └── core/
│       ├── constants.py             ← ALL magic numbers (AI_INSIGHT_MIN_TRADES, etc.)
│       ├── exceptions.py            ← Custom exception handler for DRF
│       └── pagination.py            ← StandardResultsPagination (20 items/page)
│
├── frontend/
│   ├── marketing/                   ← tradalyst.com (marketing + blog)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── [locale]/        ← i18n routing (es/, en/)
│   │   │   │   │   ├── layout.tsx   ← Marketing layout with NextIntlClientProvider
│   │   │   │   │   └── (marketing)/ ← Route group for all marketing pages
│   │   │   │   │       ├── page.tsx          ← Homepage (Hero, AiSpotlight, etc.)
│   │   │   │   │       ├── precios/page.tsx  ← Full pricing page
│   │   │   │   │       ├── funcionalidades/page.tsx ← Features page
│   │   │   │   │       ├── sobre-nosotros/page.tsx  ← About page
│   │   │   │   │       ├── blog/
│   │   │   │   │       │   ├── page.tsx       ← Blog post index
│   │   │   │   │       │   └── [slug]/page.tsx ← Individual post
│   │   │   │   │       ├── registro/page.tsx  ← Redirects to app + ?lang=
│   │   │   │   │       └── login/page.tsx     ← Redirects to app + ?lang=
│   │   │   │   ├── sitemap.ts       ← Dynamic sitemap.xml generation
│   │   │   │   └── robots.ts        ← robots.txt generation
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Nav.tsx      ← Top navigation (with language toggle)
│   │   │   │   │   └── Footer.tsx
│   │   │   │   ├── sections/
│   │   │   │   │   ├── Hero.tsx     ← Homepage hero section
│   │   │   │   │   ├── AiSpotlight.tsx ← Typewriter AI demo section
│   │   │   │   │   ├── FinalCta.tsx ← Bottom CTA section
│   │   │   │   │   ├── HowItWorks.tsx
│   │   │   │   │   └── PricingPreview.tsx ← Pricing cards
│   │   │   │   └── ui/
│   │   │   │       ├── Logo.tsx
│   │   │   │       └── DashboardMockup.tsx ← Animated SVG demo
│   │   │   ├── content/
│   │   │   │   └── blog/            ← Markdown blog posts (ES)
│   │   │   │       ├── diario-de-trading.md
│   │   │   │       ├── fomo-trading.md
│   │   │   │       ├── metricas-trading.md
│   │   │   │       ├── por-que-pierden-dinero-los-traders.md
│   │   │   │       ├── ratio-riesgo-beneficio.md
│   │   │   │       └── revenge-trading.md
│   │   │   ├── i18n/
│   │   │   │   ├── navigation.ts    ← Typed Link/redirect helpers
│   │   │   │   └── request.ts       ← next-intl plugin config
│   │   │   ├── lib/
│   │   │   │   ├── blog.ts          ← Blog post parsing (gray-matter + markdown)
│   │   │   │   └── urls.ts          ← APP_URL, MARKETING_URL constants
│   │   │   └── messages/
│   │   │       ├── es.json          ← Spanish translations
│   │   │       └── en.json          ← English translations
│   │   ├── next.config.mjs          ← createNextIntlPlugin wrapper
│   │   ├── tailwind.config.ts
│   │   └── .env.local               ← NEXT_PUBLIC_APP_URL
│   │
│   └── app/                         ← app.tradalyst.com (trading journal)
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx       ← Root layout (IntlProvider, theme cookie)
│       │   │   ├── global-error.tsx ← Stale-deploy reload guard
│       │   │   ├── globals.css      ← CSS variables (design tokens), .card class
│       │   │   ├── login/page.tsx   ← Login form
│       │   │   ├── registro/page.tsx ← Registration form (reads ?lang= param)
│       │   │   ├── onboarding/page.tsx ← 3-step new user flow
│       │   │   ├── (trader)/        ← Route group: traders + mentors
│       │   │   │   ├── layout.tsx   ← Sidebar + BottomNav
│       │   │   │   ├── dashboard/page.tsx  ← Main dashboard
│       │   │   │   ├── journal/
│       │   │   │   │   ├── page.tsx        ← Trade list + filters
│       │   │   │   │   ├── new/page.tsx    ← New trade form
│       │   │   │   │   └── [id]/
│       │   │   │   │       ├── page.tsx    ← Trade detail view
│       │   │   │   │       └── edit/page.tsx ← Edit trade form
│       │   │   │   ├── ai/page.tsx         ← AI insights + chat
│       │   │   │   ├── analytics/page.tsx  ← Analytics charts
│       │   │   │   ├── settings/page.tsx   ← Profile, security, mentor, data tabs
│       │   │   │   └── mentor-trades/page.tsx ← Trader views mentor's journal
│       │   │   ├── (mentor)/        ← Route group: mentor-only pages
│       │   │   │   └── mentor/page.tsx ← Mentor's trader list
│       │   │   └── (admin)/         ← Route group: admin-only pages
│       │   │       └── admin/page.tsx ← User management
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── Sidebar.tsx          ← Trader desktop sidebar
│       │   │   │   ├── MentorSidebar.tsx    ← Mentor desktop sidebar
│       │   │   │   ├── AdminSidebar.tsx     ← Admin desktop sidebar
│       │   │   │   ├── BottomNav.tsx        ← Trader mobile bottom nav
│       │   │   │   ├── MentorBottomNav.tsx  ← Mentor mobile bottom nav
│       │   │   │   └── AdminBottomNav.tsx   ← Admin mobile bottom nav
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── StatCard.tsx
│   │   │   │   │   ├── PnlChart.tsx         ← Recharts line chart
│   │   │   │   │   ├── ActivityHeatmap.tsx  ← Calendar heatmap (click to filter)
│   │   │   │   │   ├── RecentTradesTable.tsx
│   │   │   │   │   └── AiInsightCard.tsx
│   │   │   │   ├── market/
│   │   │   │   │   ├── TickerTapeWrapper.tsx ← TradingView ticker tape
│   │   │   │   │   └── MarketQuotes.tsx     ← Watchlist prices display
│   │   │   │   └── providers/
│   │   │   │       └── IntlProvider.tsx     ← "use client" wrapper for next-intl
│   │   ├── hooks/
│   │   │   └── useInView.ts         ← Intersection Observer hook
│   │   ├── lib/
│   │   │   ├── api.ts               ← Central fetch wrapper + 401-refresh logic
│   │   │   ├── auth.ts              ← Token decode, logout helper
│   │   │   ├── format.ts            ← formatCurrency, formatDate helpers
│   │   │   └── urls.ts              ← MARKETING_URL constant
│   │   ├── middleware.ts            ← Edge auth enforcement + role routing
│   │   ├── types/
│   │   │   └── index.ts             ← TypeScript interfaces for all API types
│   │   └── messages/
│   │       ├── en.json              ← English UI strings
│   │       └── es.json              ← Spanish UI strings (default)
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── .env.local                   ← NEXT_PUBLIC_API_URL
│
├── nginx/                           ← Production Nginx config (Hetzner VPS)
│   └── conf.d/
│       ├── marketing.conf           ← tradalyst.com → :3000
│       ├── app.conf                 ← app.tradalyst.com → :3001
│       └── api.conf                 ← api.tradalyst.com → :8000
│
├── database/
│   ├── schema.sql                   ← Generated reference schema (do not run by hand)
│   └── seeds.sql                    ← Demo data (Alex's 60+ trades)
│
├── docs/
│   ├── TECHNICAL_REFERENCE.md      ← This document
│   ├── decisions/                   ← Architecture Decision Records (ADRs)
│   └── runbooks/                    ← Deploy, seed, rollback procedures
│
└── tools/
    ├── scripts/
    │   └── seed_db.py               ← Seeds demo accounts and trade history
    └── prompts/
        ├── weekly-insight.txt       ← Claude system prompt for insight generation
        └── chat-system.txt          ← Claude system prompt for chat sessions
```

---

## 3. Backend — Django REST API

Base URL (production): `https://api.tradalyst.com`
Base URL (development): `http://localhost:8000`

### 3.1 Users App (`apps/users/`)

#### Models

**`CustomUser`** — DB table: `users_customuser`

```python
email             EmailField          UNIQUE, login field
display_name      CharField(100)      blank=True
bio               TextField           blank=True
role              CharField(10)       choices: trader | mentor | admin
                                      default: trader
is_active         BooleanField        default: True
is_staff          BooleanField        default: False (Django admin access)
date_joined       DateTimeField       auto_now_add=True
onboarding_completed BooleanField     default: False
theme_preference  CharField(5)        choices: light | dark
                                      default: light
plan              CharField(4)        choices: free | pro
                                      default: free
trial_ends_at     DateTimeField       null=True, blank=True
language_preference CharField(2)      choices: es | en
                                      default: es
pinned_assets     JSONField           default: [] (list of symbol strings)
```

`USERNAME_FIELD = "email"` — Email replaces username as the login identifier.
`AUTH_USER_MODEL = "users.CustomUser"` — Set in `settings/base.py`.

Custom manager: `CustomUserManager` provides `create_user()` and `create_superuser()`.

#### API Endpoints — Users

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register/` | Public | Register new account |
| POST | `/api/auth/login/` | Public | Login and set JWT cookies |
| POST | `/api/auth/logout/` | Required | Blacklist refresh token, clear cookies |
| POST | `/api/auth/token/refresh/` | Cookie | Rotate access token via refresh cookie |
| GET | `/api/users/me/` | Required | Get current user's profile |
| PATCH | `/api/users/me/` | Required | Update profile (name, bio, theme, language, pinned_assets) |
| GET | `/api/users/` | Admin only | List all users |
| GET | `/api/users/<id>/` | Admin only | Get any user's profile |
| PATCH | `/api/users/<id>/` | Admin only | Update any user's profile |

**POST `/api/auth/register/`**
```json
// Request body:
{
  "email": "trader@example.com",
  "display_name": "Alex García",
  "role": "trader",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123",
  "language_preference": "es"   // optional, default "es"
}

// Response 201:
{
  "id": 1,
  "email": "trader@example.com",
  "display_name": "Alex García",
  "role": "trader",
  "plan": "free",
  "onboarding_completed": false,
  "date_joined": "2026-04-27T10:00:00Z",
  "language_preference": "es",
  "theme_preference": "light",
  "pinned_assets": []
}
// Also sets httpOnly cookies: access_token (15 min), refresh_token (7 days)
```

**POST `/api/auth/login/`**
```json
// Request body:
{ "email": "trader@example.com", "password": "SecurePass123" }

// Response 200: same UserProfile shape as register
// Also sets httpOnly cookies
```

**PATCH `/api/users/me/`**
```json
// Accepts any subset of updatable fields:
{
  "display_name": "New Name",
  "bio": "About me...",
  "theme_preference": "dark",
  "language_preference": "en",
  "pinned_assets": ["BTC", "ETH", "SOL"],
  "onboarding_completed": true
}
```

#### Business Logic

**`CookieJWTAuthentication`** (`apps/users/authentication.py`):
Subclasses `JWTAuthentication`. Reads the JWT access token from the `access_token` httpOnly cookie instead of the `Authorization: Bearer` header. Returns `(user, token)` on success, `None` if cookie is absent (allows public endpoints to pass through).

**`TradalystRefreshToken`** (`apps/users/authentication.py`):
Subclasses `RefreshToken`. Injects the user's `role` field into the JWT payload so the Next.js middleware can read it at the edge without making an API call.

**`change-password` endpoint** (`/api/auth/change-password/`):
Validates `current_password` against stored hash, then calls `set_password()`. Existing sessions are not invalidated (by design — user can rotate their own password without logging out other devices).

---

### 3.2 Trades App (`apps/trades/`)

#### Models

**`Trade`** — DB table: `trades_trade`

```python
user              ForeignKey(CustomUser, CASCADE)    related_name="trades"
pair              CharField(20)                       e.g. "BTC", "EURUSD", "AAPL"
direction         CharField(5)                        choices: long | short
entry_price       DecimalField(max_digits=20, dp=8)
exit_price        DecimalField(max_digits=20, dp=8)  null=True, blank=True
quantity          DecimalField(max_digits=20, dp=8)
entry_time        DateTimeField
exit_time         DateTimeField                       null=True, blank=True
pnl               DecimalField(max_digits=20, dp=8)  null=True, blank=True (auto-calculated)
risk_reward_ratio DecimalField(max_digits=10, dp=4)  null=True, blank=True
result            CharField(10)                       choices: win | loss | breakeven
emotion           CharField(10)                       choices: calm | confident | fearful |
                                                               greedy | anxious | fomo |
                                                               revenge | neutral
notes             TextField                           blank=True
created_at        DateTimeField                       auto_now_add=True
updated_at        DateTimeField                       auto_now=True
```

`ordering = ["-entry_time"]` — Newest trades first.

**Auto P&L calculation** (in `Trade.save()`):
```python
if exit_price and entry_price and quantity:
    if direction == "long":
        pnl = (exit_price - entry_price) * quantity
    else:  # short
        pnl = (entry_price - exit_price) * quantity
else:
    pnl = None
```

#### API Endpoints — Trades

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/trades/` | Trader/Mentor | List trades (paginated, filterable) |
| POST | `/api/trades/` | Trader | Create new trade |
| GET | `/api/trades/<id>/` | Trader/Mentor | Get single trade |
| PATCH | `/api/trades/<id>/` | Trader (own) | Update trade |
| DELETE | `/api/trades/<id>/` | Trader (own) | Delete trade |
| GET | `/api/trades/stats/` | Trader | Aggregate performance stats |
| POST | `/api/trades/import/` | Trader | Bulk import via CSV |

**GET `/api/trades/`** — Query parameters:

| Param | Type | Description |
|-------|------|-------------|
| `pair` | string | Case-insensitive substring match |
| `direction` | `long` \| `short` | Filter by direction |
| `result` | `win` \| `loss` \| `breakeven` | Filter by outcome |
| `emotion` | string | Filter by emotional state |
| `entry_time_after` | ISO 8601 | Trades from this date |
| `entry_time_before` | ISO 8601 | Trades before this date |
| `ordering` | string | e.g. `-entry_time`, `pnl` |
| `page` | integer | Page number (20 per page) |
| `page_size` | integer | Override page size |

**GET `/api/trades/stats/`** — Response:
```json
{
  "total_trades": 60,
  "closed_trades": 55,
  "winning_trades": 35,
  "losing_trades": 18,
  "breakeven_trades": 2,
  "win_rate": 63.6,
  "total_pnl": "4821.50",
  "avg_pnl_per_trade": "87.66",
  "avg_risk_reward": "1.85",
  "max_drawdown": "-320.00",
  "best_trade_pnl": "850.00",
  "worst_trade_pnl": "-220.00",
  "most_traded_pair": "BTC"
}
```

Also accepts `?entry_time_after=` and `?entry_time_before=` to scope stats to a date range (used by the dashboard period selector).

**POST `/api/trades/import/`** — Multipart form with `file` field (CSV).

Accepted column names (Spanish and English aliases):
- Pair: `pair`, `activo`, `par`, `symbol`
- Direction: `direction`, `dirección`, `tipo`, `type`
- Entry price: `entry_price`, `precio_entrada`, `entrada`
- Exit price: `exit_price`, `precio_salida`, `salida`
- Quantity: `quantity`, `cantidad`, `size`, `tamaño`
- Entry time: `entry_time`, `fecha_entrada`, `fecha`, `date`
- Result: `result`, `resultado`
- Emotion: `emotion`, `emoción`
- Notes: `notes`, `notas`, `comentarios`

Response:
```json
{ "imported": 47, "skipped": 3, "errors": ["Row 12: invalid entry price"] }
```

Limits: 1000 rows max, 5 MB file size max.

#### Business Logic

All trade ownership checks happen in views: `get_queryset()` filters by `request.user`. A mentor can view a trader's trades only through the mentors app endpoints (which verify the assignment), never through the `/api/trades/` endpoints directly.

---

### 3.3 Analysis App (`apps/analysis/`)

#### Models

**`AiInsight`** — DB table: `analysis_aiinsight`

```python
user          ForeignKey(CustomUser, CASCADE)   related_name="insights"
content       TextField                          Generated insight markdown text
period_start  DateField                          First date of trade window
period_end    DateField                          Last date of trade window
trade_count   PositiveIntegerField               Number of trades in the period
created_at    DateTimeField                      auto_now_add=True
```

`ordering = ["-created_at"]` — Newest insight first.

**`ChatMessage`** — DB table: `analysis_chatmessage`

```python
user      ForeignKey(CustomUser, CASCADE)   related_name="chat_messages"
role      CharField(10)                      choices: user | assistant
content   TextField
created_at DateTimeField                     auto_now_add=True
```

`ordering = ["created_at"]` — Chronological (oldest first, for correct chat context).

#### API Endpoints — Analysis

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/analysis/insights/` | Trader | List all insights (newest first) |
| POST | `/api/analysis/insights/generate/` | Trader | Trigger new insight generation |
| GET | `/api/analysis/chat/` | Trader | Get full chat history |
| POST | `/api/analysis/chat/send/` | Trader | Send message, get AI response |

**POST `/api/analysis/insights/generate/`**
```json
// Request body: {} (empty)

// Response 201:
{
  "id": 5,
  "content": "**Pattern Summary**\n\n You tend to...",
  "period_start": "2026-01-27",
  "period_end": "2026-04-27",
  "trade_count": 48,
  "created_at": "2026-04-27T15:30:00Z"
}

// Error if fewer than 5 trades:
// HTTP 400: { "detail": "You need at least 5 trades to generate an insight." }
```

**POST `/api/analysis/chat/send/`**
```json
// Request:
{ "message": "Why do I keep losing on shorts?" }

// Response 201:
{
  "id": 42,
  "role": "assistant",
  "content": "Looking at your last 90 days, your short trades...",
  "created_at": "2026-04-27T15:31:00Z"
}
```

#### Claude Service (`apps/analysis/services/claude.py`)

The `ClaudeService` class contains all Anthropic API interactions.

**`generate_weekly_insight(user)`:**
1. Query trades from last `TRADE_SUMMARY_DAYS` (90) days
2. If fewer than `AI_INSIGHT_MIN_TRADES` (5), raise `ValidationError`
3. Build a plain-text trade summary (date, pair, direction, result, P&L, emotion, notes excerpt)
4. Load system prompt from `tools/prompts/weekly-insight.txt`
5. Append language instruction: `"Respond in Spanish."` or `"Respond in English."` based on `user.language_preference`
6. Call `client.messages.create(model="claude-sonnet-4-6", max_tokens=1500)`
7. Save response as `AiInsight` and return it

**`chat(user, user_message)`:**
1. Load last `CHAT_HISTORY_LIMIT` (10) messages from DB as context
2. Build trade summary from last `TRADE_SUMMARY_DAYS` (90) days
3. Load system prompt from `tools/prompts/chat-system.txt`
4. Build `messages` array: trade context as first user message, then chat history, then new user message
5. Call `client.messages.create(model="claude-sonnet-4-6", max_tokens=800)`
6. Save both the user message and assistant response as `ChatMessage` records
7. Return the assistant `ChatMessage`

---

### 3.4 Mentors App (`apps/mentors/`)

#### Models

**`MentorRequest`** — DB table: `mentors_mentorrequest`

```python
mentor      ForeignKey(CustomUser, CASCADE)   related_name="sent_requests"
trader      ForeignKey(CustomUser, CASCADE)   related_name="received_requests"
status      CharField(10)                     choices: pending | accepted | rejected
                                              default: pending
created_at  DateTimeField                     auto_now_add=True
updated_at  DateTimeField                     auto_now=True
```

`unique_together = [("mentor", "trader")]` — One request per pair.

**`MentorAssignment`** — DB table: `mentors_mentorassignment`

```python
trader      ForeignKey(CustomUser, CASCADE)   related_name="mentor_assignments"
mentor      ForeignKey(CustomUser, CASCADE)   related_name="trader_assignments"
is_active   BooleanField                      default: True
created_at  DateTimeField                     auto_now_add=True
```

`unique_together = [("trader", "mentor")]`

**`MentorAnnotation`** — DB table: `mentors_mentorannotation`

```python
trade       ForeignKey(Trade, CASCADE)        related_name="annotations"
mentor      ForeignKey(CustomUser, CASCADE)   related_name="annotations"
body        TextField
created_at  DateTimeField                     auto_now_add=True
updated_at  DateTimeField                     auto_now=True
```

#### API Endpoints — Mentors

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/mentors/requests/` | Mentor | Send request to trader by email |
| GET | `/api/mentors/requests/sent/` | Mentor | List mentor's sent requests |
| GET | `/api/mentors/requests/received/` | Trader | List trader's received requests |
| POST | `/api/mentors/requests/<id>/accept/` | Trader | Accept request → creates assignment |
| POST | `/api/mentors/requests/<id>/reject/` | Trader | Reject request |
| DELETE | `/api/mentors/assignments/<id>/` | Trader/Mentor | End relationship |
| GET | `/api/mentors/my-traders/` | Mentor | List assigned traders with stats |
| GET | `/api/mentors/traders/<trader_id>/trades/` | Mentor | View trader's trade history |
| GET | `/api/mentors/my-mentor/` | Trader | Get own assigned mentor |
| GET | `/api/mentors/mentor-trades/` | Trader | View mentor's trade history |
| GET | `/api/mentors/trades/<trade_id>/annotations/` | Mentor/Trader | List annotations on a trade |
| POST | `/api/mentors/trades/<trade_id>/annotations/` | Mentor | Add annotation to a trade |
| PATCH | `/api/mentors/annotations/<id>/` | Mentor (own) | Edit annotation |
| DELETE | `/api/mentors/annotations/<id>/` | Mentor (own) | Delete annotation |

**POST `/api/mentors/requests/`**
```json
// Request (sent by mentor):
{ "trader_email": "trader@example.com" }

// Response 201:
{
  "id": 1,
  "mentor": 2,
  "trader": 1,
  "mentor_detail": { "id": 2, "email": "mentor@example.com", "display_name": "Pro Mentor" },
  "trader_detail": { "id": 1, "email": "trader@example.com", "display_name": "Alex García" },
  "status": "pending",
  "created_at": "2026-04-27T10:00:00Z"
}
```

**GET `/api/mentors/my-traders/`** — Response per trader includes stats:
```json
[{
  "id": 3,
  "trader": 1,
  "mentor": 2,
  "trader_detail": { "id": 1, "email": "trader@example.com", "display_name": "Alex" },
  "is_active": true,
  "created_at": "2026-04-01T00:00:00Z",
  "stats": {
    "total_trades": 60,
    "win_rate": 63.6,
    "total_pnl": 4821.50,
    "last_trade_date": "2026-04-27"
  }
}]
```

---

### 3.5 Prices App (`apps/prices/`)

#### API Endpoints — Prices

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/prices/?symbols=BTC,ETH,AAPL,EURUSD` | Required | Batch price lookup |

**GET `/api/prices/?symbols=BTC,ETH`** — Response:
```json
{
  "BTC": {
    "price": 68420.50,
    "change_24h": 2.34,
    "source": "coingecko",
    "market_cap": 1349000000000,
    "high": 69100.00,
    "low": 67800.00
  },
  "ETH": {
    "price": 3521.80,
    "change_24h": -0.87,
    "source": "coingecko"
  }
}
```

#### Business Logic

**Routing logic** in `PriceView`:
- Symbol in `CoinGeckoService.SYMBOL_TO_ID` → use CoinGecko
- Everything else → use Finnhub

**`CoinGeckoService`** (`services/coingecko.py`):
- Endpoint: `https://api.coingecko.com/api/v3/coins/markets`
- Parameters: `vs_currency=usd`, `ids=bitcoin,ethereum,...`
- In-memory cache keyed by frozen set of symbols, TTL = `PRICE_CACHE_TTL` (60 seconds)
- No API key required (free tier)
- Supported symbols: BTC, ETH, BNB, SOL, XRP, ADA, AVAX, DOT, MATIC, LINK, UNI, LTC, DOGE, SHIB, ATOM, NEAR, APT, ARB, OP

**`FinnhubService`** (`services/finnhub.py`):
- Endpoint: `https://finnhub.io/api/v1/quote?symbol=<symbol>&token=<key>`
- Per-symbol cache, TTL = `PRICE_CACHE_TTL` (60 seconds)
- Requires `FINNHUB_API_KEY` from `.env`
- Stock prices delayed ~15 minutes on free tier

---

## 4. Database Schema

### Tables Overview

| Django Model | DB Table | App |
|-------------|---------|-----|
| `CustomUser` | `users_customuser` | users |
| `Trade` | `trades_trade` | trades |
| `AiInsight` | `analysis_aiinsight` | analysis |
| `ChatMessage` | `analysis_chatmessage` | analysis |
| `MentorRequest` | `mentors_mentorrequest` | mentors |
| `MentorAssignment` | `mentors_mentorassignment` | mentors |
| `MentorAnnotation` | `mentors_mentorannotation` | mentors |
| `OutstandingToken` | `token_blacklist_outstandingtoken` | simplejwt (auto) |
| `BlacklistedToken` | `token_blacklist_blacklistedtoken` | simplejwt (auto) |

### SQL CREATE Statements

```sql
-- ─── users_customuser ────────────────────────────────────────────────────────
CREATE TABLE users_customuser (
    id                   BIGSERIAL       PRIMARY KEY,
    password             VARCHAR(128)    NOT NULL,
    last_login           TIMESTAMPTZ,
    is_superuser         BOOLEAN         NOT NULL DEFAULT FALSE,
    email                VARCHAR(254)    NOT NULL UNIQUE,
    display_name         VARCHAR(100)    NOT NULL DEFAULT '',
    bio                  TEXT            NOT NULL DEFAULT '',
    role                 VARCHAR(10)     NOT NULL DEFAULT 'trader'
                             CHECK (role IN ('trader','mentor','admin')),
    is_active            BOOLEAN         NOT NULL DEFAULT TRUE,
    is_staff             BOOLEAN         NOT NULL DEFAULT FALSE,
    date_joined          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    onboarding_completed BOOLEAN         NOT NULL DEFAULT FALSE,
    theme_preference     VARCHAR(5)      NOT NULL DEFAULT 'light'
                             CHECK (theme_preference IN ('light','dark')),
    plan                 VARCHAR(4)      NOT NULL DEFAULT 'free'
                             CHECK (plan IN ('free','pro')),
    trial_ends_at        TIMESTAMPTZ,
    language_preference  VARCHAR(2)      NOT NULL DEFAULT 'es'
                             CHECK (language_preference IN ('es','en')),
    pinned_assets        JSONB           NOT NULL DEFAULT '[]'
);

-- ─── trades_trade ─────────────────────────────────────────────────────────────
CREATE TABLE trades_trade (
    id                BIGSERIAL       PRIMARY KEY,
    user_id           BIGINT          NOT NULL REFERENCES users_customuser(id)
                          ON DELETE CASCADE,
    pair              VARCHAR(20)     NOT NULL,
    direction         VARCHAR(5)      NOT NULL
                          CHECK (direction IN ('long','short')),
    entry_price       NUMERIC(20,8)   NOT NULL,
    exit_price        NUMERIC(20,8),
    quantity          NUMERIC(20,8)   NOT NULL,
    entry_time        TIMESTAMPTZ     NOT NULL,
    exit_time         TIMESTAMPTZ,
    pnl               NUMERIC(20,8),
    risk_reward_ratio NUMERIC(10,4),
    result            VARCHAR(10)     NOT NULL DEFAULT ''
                          CHECK (result IN ('','win','loss','breakeven')),
    emotion           VARCHAR(10)     NOT NULL DEFAULT ''
                          CHECK (emotion IN ('','calm','confident','fearful',
                                             'greedy','anxious','fomo','revenge','neutral')),
    notes             TEXT            NOT NULL DEFAULT '',
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
CREATE INDEX trades_trade_user_id ON trades_trade(user_id);
CREATE INDEX trades_trade_entry_time ON trades_trade(entry_time DESC);

-- ─── analysis_aiinsight ───────────────────────────────────────────────────────
CREATE TABLE analysis_aiinsight (
    id           BIGSERIAL   PRIMARY KEY,
    user_id      BIGINT      NOT NULL REFERENCES users_customuser(id) ON DELETE CASCADE,
    content      TEXT        NOT NULL,
    period_start DATE        NOT NULL,
    period_end   DATE        NOT NULL,
    trade_count  INTEGER     NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX analysis_aiinsight_user_id ON analysis_aiinsight(user_id);

-- ─── analysis_chatmessage ─────────────────────────────────────────────────────
CREATE TABLE analysis_chatmessage (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users_customuser(id) ON DELETE CASCADE,
    role       VARCHAR(10) NOT NULL CHECK (role IN ('user','assistant')),
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX analysis_chatmessage_user_id ON analysis_chatmessage(user_id);

-- ─── mentors_mentorrequest ────────────────────────────────────────────────────
CREATE TABLE mentors_mentorrequest (
    id         BIGSERIAL   PRIMARY KEY,
    mentor_id  BIGINT      NOT NULL REFERENCES users_customuser(id) ON DELETE CASCADE,
    trader_id  BIGINT      NOT NULL REFERENCES users_customuser(id) ON DELETE CASCADE,
    status     VARCHAR(10) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','accepted','rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (mentor_id, trader_id)
);

-- ─── mentors_mentorassignment ─────────────────────────────────────────────────
CREATE TABLE mentors_mentorassignment (
    id         BIGSERIAL   PRIMARY KEY,
    trader_id  BIGINT      NOT NULL REFERENCES users_customuser(id) ON DELETE CASCADE,
    mentor_id  BIGINT      NOT NULL REFERENCES users_customuser(id) ON DELETE CASCADE,
    is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (trader_id, mentor_id)
);

-- ─── mentors_mentorannotation ─────────────────────────────────────────────────
CREATE TABLE mentors_mentorannotation (
    id         BIGSERIAL   PRIMARY KEY,
    trade_id   BIGINT      NOT NULL REFERENCES trades_trade(id) ON DELETE CASCADE,
    mentor_id  BIGINT      NOT NULL REFERENCES users_customuser(id) ON DELETE CASCADE,
    body       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Entity-Relationship Diagram (dbdiagram.io format)

```
Table users_customuser {
  id bigint [pk, increment]
  email varchar [unique, not null]
  display_name varchar
  bio text
  role varchar [note: "trader | mentor | admin"]
  plan varchar [note: "free | pro"]
  language_preference varchar [note: "es | en"]
  theme_preference varchar [note: "light | dark"]
  onboarding_completed boolean
  pinned_assets jsonb
  date_joined timestamptz
}

Table trades_trade {
  id bigint [pk, increment]
  user_id bigint [ref: > users_customuser.id]
  pair varchar
  direction varchar [note: "long | short"]
  entry_price numeric
  exit_price numeric [null]
  quantity numeric
  entry_time timestamptz
  exit_time timestamptz [null]
  pnl numeric [null, note: "auto-calculated on save"]
  result varchar [note: "win | loss | breakeven"]
  emotion varchar
  notes text
  created_at timestamptz
}

Table analysis_aiinsight {
  id bigint [pk, increment]
  user_id bigint [ref: > users_customuser.id]
  content text
  period_start date
  period_end date
  trade_count int
  created_at timestamptz
}

Table analysis_chatmessage {
  id bigint [pk, increment]
  user_id bigint [ref: > users_customuser.id]
  role varchar [note: "user | assistant"]
  content text
  created_at timestamptz
}

Table mentors_mentorrequest {
  id bigint [pk, increment]
  mentor_id bigint [ref: > users_customuser.id]
  trader_id bigint [ref: > users_customuser.id]
  status varchar [note: "pending | accepted | rejected"]
  created_at timestamptz
}

Table mentors_mentorassignment {
  id bigint [pk, increment]
  trader_id bigint [ref: > users_customuser.id]
  mentor_id bigint [ref: > users_customuser.id]
  is_active boolean
  created_at timestamptz
}

Table mentors_mentorannotation {
  id bigint [pk, increment]
  trade_id bigint [ref: > trades_trade.id]
  mentor_id bigint [ref: > users_customuser.id]
  body text
  created_at timestamptz
}
```

---

## 5. Authentication & Security

### JWT Token Flow

```
1. User submits login form
   POST /api/auth/login/ { email, password }

2. Django validates credentials, creates JWT pair:
   TradalystRefreshToken.for_user(user)
   → encodes: user_id, email, role, exp, iat
   → access_token  (15 minutes)
   → refresh_token (7 days)

3. Django sets httpOnly cookies on response:
   Set-Cookie: access_token=<jwt>;  HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=900
   Set-Cookie: refresh_token=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800

4. Browser stores cookies automatically (not accessible to JavaScript)

5. Every subsequent API request:
   CookieJWTAuthentication reads access_token from cookie
   → Verifies signature with JWT_SIGNING_KEY
   → If valid → sets request.user
   → If invalid/expired → returns 401

6. On 401 (expired access token):
   api.ts client calls POST /api/auth/token/refresh/
   Django reads refresh_token cookie, issues new access_token
   → Old refresh_token is blacklisted (ROTATE_REFRESH_TOKENS=True)
   → New access_token and refresh_token cookies are set
   → Original request is retried once

7. On logout:
   POST /api/auth/logout/
   → Refresh token is added to token_blacklist_blacklistedtoken
   → Both cookies are cleared (Max-Age=0)
   → Client redirects to /login
```

### Why httpOnly Cookies (Not localStorage)?

httpOnly cookies are never accessible to JavaScript, eliminating the entire class of XSS-based token theft. Even if a malicious script is injected into the page, it cannot read the JWT. The `SameSite=Lax` attribute prevents CSRF in most scenarios.

### Role-Based Permissions

**Layer 1 — Next.js middleware edge (`src/middleware.ts`):**
Runs at Cloudflare/Vercel edge before any page renders. Reads the JWT from the `access_token` cookie, decodes it (no signature verification — just payload reading), checks the `role` claim, and redirects to the role's home if the requested path is not allowed for that role.

```
trader  → allowed: /dashboard /journal /ai /analytics /settings /onboarding /prices
mentor  → allowed: /dashboard /journal /ai /analytics /settings /mentor /mentor-trades /prices
admin   → allowed: /admin /settings
```

**Layer 2 — Django API permissions (`apps/users/permissions.py`):**
Every API view declares which permission classes it requires. Even if a user bypasses the Next.js middleware (e.g., calling the API directly), Django enforces role at the API level:

```python
class IsTrader(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "trader"

class IsMentor(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "mentor"

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "admin"
```

### CORS Configuration

Production (`settings/production.py`):
```python
CORS_ALLOWED_ORIGINS = [
    "https://tradalyst.com",
    "https://app.tradalyst.com",
]
CORS_ALLOW_CREDENTIALS = True  # Required for cookies
```

### Input Validation

- **Client-side:** HTML5 validation attributes + JavaScript validation on all form fields (immediate feedback)
- **Server-side:** DRF serializers validate all inputs before they reach views. Field-level validation (type, length, choices) and cross-field validation (e.g., `password == password_confirm`) in `validate()` methods
- **ORM-level:** Django ORM uses parameterised queries — SQL injection is impossible by design

### Password Security

Django's `set_password()` uses PBKDF2-SHA256 with 600,000 iterations (Django 5 default). `AUTH_PASSWORD_VALIDATORS` enforces minimum length, common password checks, and similarity to user attributes.

### RGPD Compliance

- Privacy policy page linked at registration
- CSV export endpoint (`GET /api/trades/?page_size=10000`) gives users portable access to all their data
- Account deletion in Settings → Data tab permanently removes all user data via `CASCADE` deletes
- Language preference stored on user profile and respected by AI responses

---

## 6. Frontend — Marketing Site (tradalyst.com)

### Routes

| Route | Page | Notes |
|-------|------|-------|
| `/` | Homepage | Hero, HowItWorks, AiSpotlight, PricingPreview, FinalCta |
| `/precios` | Full pricing page | Plan comparison table, FAQ, final CTA |
| `/funcionalidades` | Features page | Feature row sections with illustrations |
| `/sobre-nosotros` | About page | Project story, tech stack, CTA |
| `/blog` | Blog index | All posts in a card grid, sorted by date |
| `/blog/<slug>` | Blog post | Full post, metadata, related articles |
| `/registro` | Registration redirect | Redirects to `app.tradalyst.com/registro?lang=<locale>` |
| `/login` | Login redirect | Redirects to `app.tradalyst.com/login?lang=<locale>` |

All routes are prefixed by `[locale]` for i18n: `/en/`, `/es/`. The default locale (`es`) is served at the root (no prefix).

### i18n Implementation

The marketing site uses **next-intl** with the plugin (`createNextIntlPlugin` in `next.config.mjs`). Locale routing is handled by `[locale]` path segments.

- Config: `src/i18n/request.ts`
- Navigation helpers: `src/i18n/navigation.ts` (typed `Link` and `redirect`)
- Translation files: `src/messages/es.json`, `src/messages/en.json`
- Server components use `getTranslations()` from `next-intl/server`
- Client components use `useTranslations()` and `useLocale()` hooks
- Language toggle in the Nav component switches locale and reloads

**Cross-subdomain locale handoff:** All CTA links to `app.tradalyst.com` append `?lang={locale}` so the app can read the visitor's preferred language and set the `NEXT_LOCALE` cookie accordingly.

### Blog System (`src/lib/blog.ts`)

Blog posts are Markdown files in `src/content/blog/` with YAML frontmatter.

**Frontmatter spec:**
```yaml
---
title: "Por qué el 90% de los traders pierde dinero"
seoTitle: "Por Qué el 90% de los Traders Pierde Dinero (y Cómo Evitarlo)"
date: "2025-11-15"
lastModified: "2025-12-01"
excerpt: "La mayoría de los traders fracasan..."
description: "Análisis de los factores psicológicos..."
category: "Psicología"
readTime: "7 min"
author: "Equipo Tradalyst"
keywords: ["psicología del trading", "gestión del riesgo"]
lang: "es"
hreflang:
  es: "/blog/por-que-pierden-dinero-los-traders"
  en: "/en/blog/why-traders-lose-money"
featuredImage: "/images/blog/traders-psychology.jpg"
featuredImageAlt: "Trader mirando gráficos con expresión de preocupación"
---

# Por qué el 90% de los traders pierde dinero

...markdown content...
```

**Blog posts published:**
- `diario-de-trading.md` — The importance of a trading journal
- `fomo-trading.md` — FOMO: the silent account killer
- `metricas-trading.md` — 5 metrics every trader should track
- `por-que-pierden-dinero-los-traders.md` — Why 90% of traders lose
- `ratio-riesgo-beneficio.md` — Risk-reward ratio explained
- `revenge-trading.md` — Revenge trading: recognise and stop it

### SEO Implementation

**Sitemap** (`src/app/sitemap.ts`):
Dynamically generated. Includes homepage (priority 1.0), all static marketing pages (0.8–0.9), and all blog posts (0.7). Change frequency: weekly for main pages, monthly for blog.

**Robots** (`src/app/robots.ts`):
```
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://tradalyst.com/sitemap.xml
```

**Structured Data (JSON-LD):**
- `SoftwareApplication` schema on the pricing page (name, price, applicationCategory)
- `Article` schema on individual blog posts (author, datePublished, dateModified)
- `FAQPage` schema on the pricing page FAQ section

**hreflang tags:**
Each blog post specifies alternate language URLs in frontmatter. The `[locale]` routing automatically generates canonical URLs and alternate language links in `<head>`.

**Open Graph:**
All pages have `og:title`, `og:description`, `og:image` set via Next.js `metadata` exports.

### Environment Variables

```bash
# frontend/marketing/.env.local
NEXT_PUBLIC_APP_URL=https://app.tradalyst.com
```

---

## 7. Frontend — App (app.tradalyst.com)

### Routes by Role

**Public (no auth):**
| Route | Page |
|-------|------|
| `/login` | Login form |
| `/registro` | Registration form |

**Trader + Mentor:**
| Route | Page | Key Data |
|-------|------|---------|
| `/dashboard` | Main dashboard | `GET /api/trades/stats/`, `GET /api/analysis/insights/?page_size=1` |
| `/journal` | Trade list | `GET /api/trades/` (with filters) |
| `/journal/new` | Create trade form | `POST /api/trades/`, `GET /api/prices/` |
| `/journal/<id>` | Trade detail | `GET /api/trades/<id>/`, `GET /api/mentors/trades/<id>/annotations/` |
| `/journal/<id>/edit` | Edit trade | `PATCH /api/trades/<id>/` |
| `/ai` | AI insights + chat | `GET /api/analysis/insights/`, `GET /api/analysis/chat/` |
| `/analytics` | Performance analytics | `GET /api/trades/` (full set) |
| `/settings` | Account settings | `GET /api/users/me/`, `PATCH /api/users/me/` |
| `/onboarding` | New user flow | `PATCH /api/users/me/` (onboarding_completed), `POST /api/trades/` |

**Trader-only:**
| Route | Page |
|-------|------|
| `/mentor-trades` | View mentor's journal (read-only) |

**Mentor-only:**
| Route | Page |
|-------|------|
| `/mentor` | Assigned traders dashboard |

**Admin-only:**
| Route | Page |
|-------|------|
| `/admin` | User management |

### Page Details

#### `/dashboard`
- **Purpose:** Overview of trading performance
- **Data:** Stats (period-filtered), latest AI insight, recent 5 trades, live market prices
- **Components:** `StatCard`, `PnlChart` (Recharts), `ActivityHeatmap`, `RecentTradesTable`, `AiInsightCard`, `MarketQuotes` (TradingView), `TickerTapeWrapper`
- **Special behaviour:** Date range selector (today/week/month/all) re-fetches stats with date params. Activity heatmap is interactive — clicking a day filters the recent trades list to that date.

#### `/journal`
- **Purpose:** Full trade history with filtering
- **Data:** `GET /api/trades/` with all filter params
- **Components:** Filter bar (direction, result, emotion, date range, pair search), paginated table, delete confirmation modal
- **Special behaviour:** CSV import button triggers file picker → `POST /api/trades/import/`. Filters are URL query params so they survive page refresh.

#### `/journal/new` and `/journal/<id>/edit`
- **Purpose:** Create or edit a trade
- **Data:** Price fetch from `/api/prices/?symbols=<pair>` on pair blur (optional)
- **Components:** Market type selector (crypto/forex/stocks), asset input with live price hint, direction toggle (Long/Short, 52px touch targets), prices grid (stacked on mobile), dates grid, result selector, emotion selector (2×2 on mobile), notes textarea with word count
- **Mobile layout:** Single column, full-width inputs, stacked submit/cancel buttons

#### `/ai`
- **Purpose:** AI weekly insights and live chat
- **Data:** `GET /api/analysis/insights/`, `GET /api/analysis/chat/`
- **Components:** Insights accordion (expandable text), chat message list with role bubbles, input textarea, send button
- **Special behaviour:** If fewer than 5 trades, "Generate" button shows min-trades message. Auto-scroll to bottom on new messages. Language of AI response matches `user.language_preference`.

#### `/analytics`
- **Purpose:** Deep performance analysis by pair, emotion, direction, time
- **Data:** `GET /api/trades/` (large page size), `GET /api/trades/stats/`
- **Components:** Recharts-powered charts — P&L by pair (bar), win rate by emotion (bar), long vs short breakdown (donut), cumulative P&L curve (line)

#### `/settings`
- **Purpose:** Account management
- **Tabs:**
  - **Perfil:** Name, bio, language toggle, theme toggle, save button; logout button on mobile only (`lg:hidden`)
  - **Seguridad:** Change password form
  - **Mentor (trader only):** View assigned mentor, see incoming requests, accept/reject
  - **Mis alumnos (mentor only):** Link to mentor dashboard
  - **Plan (trader only):** Free/Pro status, upgrade link
  - **Cuenta:** CSV export, account deletion (requires typing "ELIMINAR")

#### `/onboarding`
- **Purpose:** 3-step new user setup
- **Steps:**
  1. Select trader type (crypto/forex/stocks/all) — `PATCH /api/users/me/`
  2. Log first trade (optional, full form) — `POST /api/trades/`
  3. Completion screen → `PATCH /api/users/me/ { onboarding_completed: true }`
- **Language:** Reads `NEXT_LOCALE` cookie to show in user's language

### Middleware (`src/middleware.ts`)

Runs at the Next.js edge (before any page renders) on every request.

1. Skip `/_next/*`, `/api/*`, static files, `/favicon.ico`
2. Read `access_token` cookie
3. No token → redirect to `/login?redirect=<original_path>`
4. Malformed token → delete cookie, redirect to `/login`
5. Expired token → **do not block** (api.ts handles 401→refresh on the client)
6. Decode role from JWT payload
7. Authenticated user on public path (`/login`, `/registro`) → redirect to role home
8. Request to `/` → redirect to role home
9. Check path against `ROLE_PATHS[role]` → redirect to role home if not allowed

### i18n Implementation

The app uses next-intl **without the plugin** (no `createNextIntlPlugin` in `next.config.mjs`). Instead:

- `src/app/layout.tsx` reads `NEXT_LOCALE` cookie server-side
- Dynamically imports the correct message file (`messages/es.json` or `messages/en.json`)
- Passes locale and messages to `IntlProvider` (a `"use client"` component that wraps `NextIntlClientProvider`)
- All components use `useTranslations()` hook — translation strings are injected by `NextIntlClientProvider`

**Why no plugin?** The next-intl plugin requires a config file lookup at module level. Without the plugin alias, any Server Component importing `next-intl` directly would trigger a runtime error. The `"use client"` `IntlProvider` wrapper keeps all next-intl code in the client bundle.

**Language switching:**
1. User clicks language button in sidebar or settings
2. `document.cookie = "NEXT_LOCALE=en;path=/;max-age=31536000"`
3. `router.refresh()` causes Next.js to re-render with the new locale cookie
4. `layout.tsx` reads the updated cookie and loads the correct message file

**Login/Registration language:**
- Marketing site appends `?lang={locale}` to all app CTAs
- `/registro` and `/login` pages run a `useEffect` on mount: read `?lang=` param, compare to current `NEXT_LOCALE` cookie, set cookie and call `router.refresh()` if different

### Theme System

**CSS Variables** (`src/app/globals.css`):
```css
:root {           /* light */
  --base:     #eceee8;
  --surface:  #f5f6f2;
  --elevated: #ffffff;
  --border:   rgba(0,0,0,0.08);
  --text-primary: #1a1a1a;
}

.dark {           /* dark */
  --base:     #1e1e1e;
  --surface:  #272727;
  --elevated: #303030;
  --border:   rgba(255,255,255,0.08);
  --text-primary: #f5f5f5;
}

.light {          /* explicit light (same as :root) */
  --base: #eceee8;
  ...
}
```

**Theme toggle flow:**
1. Click Claro/Oscuro button in sidebar or settings
2. `document.documentElement.classList.remove("light","dark"); classList.add(theme)`
3. `document.cookie = "THEME=dark;path=/;max-age=31536000"`
4. `PATCH /api/users/me/ { theme_preference: "dark" }` — persists to DB
5. On next page load: `layout.tsx` reads `THEME` cookie, adds class to `<html>`

**Default:** Dark theme (`THEME` cookie default = `dark`).

### Central API Client (`src/lib/api.ts`)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// All API calls go through this function:
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",     // sends httpOnly JWT cookies
    headers: { "Content-Type": "application/json", ...init?.headers }
  })

  if (res.status === 401) {
    // Try to refresh token
    const refreshed = await refreshTokens()
    if (refreshed) {
      // Retry original request
      const retry = await fetch(`${API_BASE}${path}`, { ...init, credentials: "include" })
      if (retry.ok) return retry.status === 204 ? undefined : retry.json()
    }
    // Refresh failed — redirect to login
    window.location.href = `/login`
    throw new ApiError(401, "Unauthorised")
  }

  if (!res.ok) throw new ApiError(res.status, await res.text())
  if (res.status === 204) return undefined as T
  return res.json()
}

// refreshTokens() posts to /api/auth/token/refresh/ which reads
// the refresh_token httpOnly cookie and sets new access_token cookie
```

### TradingView Widgets

TradingView provides free embeddable widgets loaded from their CDN.

**TickerTapeWrapper** (`src/components/market/TickerTapeWrapper.tsx`):
- Renders a horizontal scrolling price ticker at the top of trader/mentor pages
- Loaded via `useEffect` into a `<div>` by injecting a `<script>` tag
- Shows BTC, ETH, SOL, EURUSD, US30, AAPL and other major assets
- Adapts to theme: `colorTheme: theme === "dark" ? "dark" : "light"`
- Cannot be SSR'd — must be client-only due to `window` dependency

**MarketQuotes** (watchlist display):
- Shows user's `pinned_assets` from their profile
- Data comes from `/api/prices/?symbols=<pinned_assets>`
- Customisation modal lets users pick up to `WATCHLIST_MAX_ASSETS` (8) assets
- Saves selection via `PATCH /api/users/me/ { pinned_assets: [...] }`

### Key Shared Components

| Component | Props | Purpose |
|-----------|-------|---------|
| `StatCard` | `label, value, unit?, change?` | Dashboard KPI card |
| `PnlChart` | `data: PnlPoint[]` | Recharts line chart of cumulative P&L |
| `ActivityHeatmap` | `data: HeatmapDay[], onDayClick` | Clickable calendar heatmap |
| `AiInsightCard` | `insight: AiInsight` | Preview of latest insight |
| `TickerTapeWrapper` | `theme: "light" \| "dark"` | TradingView ticker |
| `IntlProvider` | `locale, messages, children` | Client-side i18n wrapper |

### Environment Variables

```bash
# frontend/app/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000       # Django API URL
```

---

## 8. User Roles — Detailed Breakdown

### Guest (Unauthenticated)

- **Access:** `/login`, `/registro` only
- **Registration:** Select role (trader/mentor) at signup
- **Cannot access:** Any authenticated page — middleware redirects to `/login`

### Trader

**How they get the role:** Select "Soy trader" on the registration form. `role = "trader"` is stored in `CustomUser`.

**What they can access:**

| Feature | How |
|---------|-----|
| Own trade journal | Full CRUD at `/journal/*` |
| Dashboard with stats | `/dashboard` |
| AI weekly insights | `/ai` → generate + view |
| AI chat | `/ai` → chat interface |
| Analytics charts | `/analytics` |
| Settings (profile, security, mentor, plan, data) | `/settings` |
| Mentor's trades (read-only) | `/mentor-trades` (if assigned) |
| CSV export | Settings → Cuenta tab |
| Account deletion | Settings → Cuenta tab |
| Market prices | `/dashboard` + `/journal/new` (live price hint) |
| Watchlist customisation | Dashboard market section |
| Onboarding flow | `/onboarding` (first login) |

**Navigation structure (sidebar):**
- Dashboard
- Journal
- AI
- Analytics
- Settings
- [Bottom of sidebar:] Language toggle, Theme toggle, Log out

**Cannot access:** `/mentor`, `/admin`

### Mentor

**How they get the role:** Select "Soy mentor" on registration form. Same `CustomUser` model, different `role` value.

**Key insight:** A mentor is also a full trader. They have their own journal, dashboard, AI, and analytics — identical to a trader account. The mentor role adds capabilities *on top of* the trader experience.

**Mentor-specific capabilities:**

1. **Send requests to traders:**
   - In the Mentor dashboard (`/mentor`), enter trader's email
   - `POST /api/mentors/requests/ { "trader_email": "..." }`
   - Request appears as `pending` in both mentor's sent list and trader's settings

2. **View assigned traders:**
   - `/mentor` lists all accepted traders with: name, email, total trades, win rate, total P&L, last trade date
   - Click on a trader → `GET /api/mentors/traders/<id>/trades/` — full read-only journal

3. **Annotate trades:**
   - On any of an assigned trader's trades: `POST /api/mentors/trades/<trade_id>/annotations/`
   - Trader sees annotations in their trade detail view

4. **Revoke access:**
   - Either party can `DELETE /api/mentors/assignments/<id>/`

**From the trader's side (Settings → Mentor tab):**
- See incoming pending requests
- Accept (creates `MentorAssignment`) or reject
- View current assigned mentor
- Navigate to `/mentor-trades` to see the mentor's own journal
- Revoke mentor's access at any time

**Navigation structure (sidebar):**
- Dashboard
- Journal
- AI
- Analytics
- Mis alumnos (→ `/mentor`)
- Settings

**Cannot access:** `/admin`

### Admin

**How they get the role:** Created via Django's `create_superuser` command or by an existing admin changing another user's role.

**What they can access:**

| Feature | How |
|---------|-----|
| User list | `/admin` — all users with email, role, status, join date |
| User management | View, modify role, activate/deactivate any user |
| Settings (own profile) | `/settings` |
| Django admin panel | `/admin/` (Django's built-in admin, separate from the app) |

**Cannot access:** `/dashboard`, `/journal`, `/ai`, `/analytics`, `/mentor` — Admins are platform operators, not traders. If an admin also trades, they use a separate trader account.

**Navigation structure (sidebar):**
- Users
- Configuration (→ Settings)

---

## 9. AI Integration

### Claude API Setup

- **Model:** `claude-sonnet-4-6` (Anthropic's capable mid-tier model)
- **SDK:** `anthropic` Python library
- **API key:** `CLAUDE_API_KEY` from `.env`, loaded in `settings/base.py`
- **All Claude code:** exclusively in `backend/apps/analysis/services/claude.py`

### Weekly Insight Generation

**Trigger:** Manual button click on `/ai` page → `POST /api/analysis/insights/generate/`

**Minimum trades required:** `AI_INSIGHT_MIN_TRADES = 5` (from `core/constants.py`)

**Data sent to Claude:**
```
Trade summary for Alex García (last 90 days, 48 trades):

2026-04-15 | BTC | LONG | Entry: 65000 | Exit: 67200 | PnL: +440.00 | Result: WIN | Emotion: CONFIDENT | Notes: "Clean breakout above resistance..."
2026-04-14 | ETH | SHORT | Entry: 3500 | Exit: 3620 | PnL: -120.00 | Result: LOSS | Emotion: FOMO | Notes: "Entered too early, should have waited..."
...
```

**System prompt** (`tools/prompts/weekly-insight.txt`):
```
You are Tradalyst's AI trading coach. You analyse a trader's journal data 
and deliver personalised, actionable insights in a structured report.

Your response must follow this exact structure:
1. **Pattern Summary** — 2-3 sentences on the dominant behavioural patterns you detected.
2. **Emotional Analysis** — What emotions appeared most, and how they correlated with outcomes.
3. **Strengths** — 2-3 specific things the trader did well this period.
4. **Areas to Improve** — 2-3 specific, actionable recommendations.
5. **Key Metric** — One standout stat from their data with brief context.

Be direct, honest, and specific. Use the trade data provided. Never be vague or generic.
Write in second person ("you", "your"). Keep the total response under 400 words.
```

**Language instruction appended dynamically:**
```python
if user.language_preference == "en":
    system_prompt += "\n\nRespond in English."
else:
    system_prompt += "\n\nResponde en español."
```

**Storage:** Response saved as `AiInsight` record in `analysis_aiinsight`. Historical insights are kept indefinitely.

**Max tokens:** 1500

### AI Chat

**System prompt** (`tools/prompts/chat-system.txt`):
```
You are Tradalyst's AI trading coach in a live chat session. You have access 
to the trader's recent trade history and can answer questions, provide analysis, 
and help them reflect on their trading behaviour.

Rules:
- Be concise and direct — this is a chat, not a report.
- Reference specific trades or patterns from their data when relevant.
- Challenge bad habits gently but honestly.
- Never give financial advice or price predictions.
- If asked something outside trading psychology or journal analysis, redirect back.
- Respond in the same language the trader uses.
```

**Context injection:** Each chat request builds a messages array:
```python
[
  # 1. Trade context as first "user" message
  { "role": "user", "content": "Trade summary: [last 90 days]" },
  { "role": "assistant", "content": "Understood. I can see your trades." },
  
  # 2. Last CHAT_HISTORY_LIMIT (10) messages from DB
  { "role": "user", "content": "Why do I lose on shorts?" },
  { "role": "assistant", "content": "Looking at your data..." },
  ...
  
  # 3. Current user message
  { "role": "user", "content": "What's my best setup?" }
]
```

**Constants:**
- `CHAT_HISTORY_LIMIT = 10` — number of past messages included in context
- `TRADE_SUMMARY_DAYS = 90` — days of trade history summarised for context
- `chat_max_tokens = 800` — Claude response length limit for chat

**Persistence:** Both user messages and assistant responses saved as `ChatMessage` records. Chat history is permanent (no auto-deletion).

**Language:** Claude is instructed to "Respond in the same language the trader uses" — if the trader asks in English, Claude responds in English; in Spanish, in Spanish.

---

## 10. External APIs

### CoinGecko

**Purpose:** Real-time cryptocurrency prices for the live price hint in the trade form and the market watchlist.

**API used:** `https://api.coingecko.com/api/v3/coins/markets`

**Parameters:**
```
vs_currency=usd
ids=bitcoin,ethereum,solana,...  (mapped from symbols)
order=market_cap_desc
sparkline=false
price_change_percentage=24h
```

**No API key required** (CoinGecko free public API).

**Caching:** In-memory Python dict cache per frozen set of symbols. TTL: `PRICE_CACHE_TTL = 60` seconds. After 60 seconds, the cache entry expires and the next request triggers a fresh API call.

**Supported symbols:**
```
BTC → bitcoin      ETH → ethereum     BNB → binancecoin
SOL → solana       XRP → ripple       ADA → cardano
AVAX → avalanche-2 DOT → polkadot     MATIC → matic-network
LINK → chainlink   UNI → uniswap      LTC → litecoin
DOGE → dogecoin    SHIB → shiba-inu   ATOM → cosmos
NEAR → near        APT → aptos        ARB → arbitrum
OP → optimism
```

**Code location:** `backend/apps/prices/services/coingecko.py`

### Finnhub

**Purpose:** Stock and forex prices for non-crypto assets (AAPL, TSLA, EURUSD, GBPJPY, etc.).

**API used:** `https://finnhub.io/api/v1/quote?symbol=<symbol>&token=<key>`

**API key required:** `FINNHUB_API_KEY` from `.env`.

**Caching:** Per-symbol in-memory cache, TTL: 60 seconds.

**Important limitation:** Stock prices on the Finnhub free tier are delayed approximately **15 minutes**. Forex and crypto (if routed to Finnhub) may be more real-time. This is disclosed in the UI.

**Code location:** `backend/apps/prices/services/finnhub.py`

### TradingView Widgets

TradingView provides free JavaScript widgets loaded from their CDN. They are rendered client-side only.

**TickerTape** (`src/components/market/TickerTapeWrapper.tsx`):
- Injected via `useEffect` (never SSR'd — relies on `window`)
- Shows scrolling live price ticker at top of trader/mentor layouts
- Config: `colorTheme` set based on the `THEME` cookie (`"dark"` or `"light"`)
- Symbols hardcoded in widget config: BTC, ETH, SOL, BNB, EURUSD, USDJPY, SPX, AAPL

**MarketQuotes** (watchlist in dashboard):
- Displays user's `pinned_assets` (stored in `CustomUser.pinned_assets`)
- Prices fetched from `/api/prices/?symbols=<list>` (not TradingView for this)
- Customisation modal: users can add/remove up to 8 assets, saved via `PATCH /api/users/me/`

**Why `useEffect` instead of SSR:**
TradingView widgets create DOM elements and attach event listeners in `window`. They cannot be server-rendered. The `useEffect` pattern defers execution until after hydration, when the browser environment is available.

---

## 11. Features — Complete List

### Trade Journal (CRUD)

**What it does:** Core of the product. Traders log each trade with full context: asset, direction, prices, quantity, dates, result, emotional state, and free-text reasoning notes. P&L is auto-calculated on save.

**Where it lives:**
- Model: `backend/apps/trades/models.py`
- API: `backend/apps/trades/views.py`
- Form: `frontend/app/src/app/(trader)/journal/new/page.tsx`
- List: `frontend/app/src/app/(trader)/journal/page.tsx`
- Detail: `frontend/app/src/app/(trader)/journal/[id]/page.tsx`
- Edit: `frontend/app/src/app/(trader)/journal/[id]/edit/page.tsx`

**How to demo:** Log in as Alex → Journal → New trade → Fill in BTC, Long, entry 65000, exit 67000, quantity 0.5 → P&L shows automatically → Save

---

### CSV Import

**What it does:** Bulk-import trade history from any broker export. Accepts CSV files with flexible column naming (English and Spanish aliases).

**Where it lives:**
- API: `POST /api/trades/import/` in `backend/apps/trades/views.py`
- UI: "Import CSV" button in `frontend/app/src/app/(trader)/journal/page.tsx`

**How to demo:** Journal → Import CSV → upload file → see success/error report

---

### AI Weekly Insights

**What it does:** Sends trader's last 90 days of trade data to Claude, which analyses patterns and generates a structured 5-section report (Pattern Summary, Emotional Analysis, Strengths, Areas to Improve, Key Metric).

**Where it lives:**
- Claude service: `backend/apps/analysis/services/claude.py`
- Prompt: `tools/prompts/weekly-insight.txt`
- API: `POST /api/analysis/insights/generate/`
- UI: `frontend/app/src/app/(trader)/ai/page.tsx`

**How to demo:** AI tab → Click "Update analysis" → Wait ~5-10s → Insight appears in accordion

---

### AI Chat

**What it does:** Live chat with Claude. The AI has full context of the trader's recent trade history and chat history. It answers questions about patterns, specific trades, and trading psychology — but refuses to give price predictions.

**Where it lives:**
- Claude service: `backend/apps/analysis/services/claude.py`
- Prompt: `tools/prompts/chat-system.txt`
- API: `POST /api/analysis/chat/send/`
- UI: `frontend/app/src/app/(trader)/ai/page.tsx` (bottom half of page)

**How to demo:** AI tab → Type "What's my worst emotional state to trade in?" → Send → AI responds with data-backed analysis

---

### Performance Dashboard

**What it does:** High-level KPIs for the selected date period (today/week/month/all-time). Shows total P&L, win rate, trade count, average R:R, plus P&L chart and activity heatmap.

**Where it lives:** `frontend/app/src/app/(trader)/dashboard/page.tsx`

**How to demo:** Dashboard → select "This month" → stats update → click a day on the heatmap → see that day's trades

---

### Activity Heatmap (Interactive)

**What it does:** Calendar view of daily trading activity. Each day is coloured by P&L (green = profit, red = loss, grey = no trades). Clicking a day filters the recent trades list to show only that day's trades.

**Where it lives:** `frontend/app/src/components/dashboard/ActivityHeatmap.tsx`

**How to demo:** Dashboard → heatmap → click on any active day → recent trades list updates

---

### P&L Curve Chart

**What it does:** Line chart showing cumulative P&L over time. Helps visualise drawdowns, recovery periods, and overall equity curve.

**Where it lives:** `frontend/app/src/components/dashboard/PnlChart.tsx` (Recharts)

**How to demo:** Dashboard → the chart below the stats cards

---

### Analytics Page

**What it does:** Deep performance breakdown. Includes: P&L by asset (bar chart), win rate by emotion (bar chart), long vs short breakdown (donut/bar), cumulative drawdown curve.

**Where it lives:** `frontend/app/src/app/(trader)/analytics/page.tsx`

**How to demo:** Analytics tab → review the charts → note which emotion has highest win rate

---

### Market Prices (TradingView Ticker + Watchlist)

**What it does:** Live price ticker tape at the top of every page for quick market reference. Watchlist shows user's pinned assets with current price and 24h change.

**Where it lives:**
- Ticker: `frontend/app/src/components/market/TickerTapeWrapper.tsx`
- Watchlist: `frontend/app/src/components/market/MarketQuotes.tsx`
- Price API: `backend/apps/prices/`

**How to demo:** Dashboard → see ticker at top → see watchlist cards with live prices

---

### Watchlist Customisation

**What it does:** Each user can pin up to 8 assets to their watchlist. The customisation modal lets them search and toggle assets. Preferences are saved to their profile.

**Where it lives:**
- UI: Dashboard watchlist section → "Manage" button
- API: `PATCH /api/users/me/ { pinned_assets: [...] }`

**How to demo:** Dashboard → click "Manage" on watchlist → add "SOL" and "AAPL" → Save → prices appear

---

### Mentor Request / Accept Flow

**What it does:** Structured request flow where a mentor initiates access to a trader's journal. Trader retains full control.

**Where it lives:**
- Backend: `backend/apps/mentors/`
- Mentor UI: `frontend/app/src/app/(mentor)/mentor/page.tsx`
- Trader UI: `frontend/app/src/app/(trader)/settings/page.tsx` (Mentor tab)

**How to demo:** Log in as mentor → Mentor page → send request to Alex's email → Log in as Alex → Settings → Mentor tab → Accept

---

### Mentor Annotations

**What it does:** Mentors can leave notes on specific trades belonging to their assigned traders. Annotations appear in the trade detail view for both parties.

**Where it lives:**
- API: `POST /api/mentors/trades/<id>/annotations/`
- UI: Mentor's view of a trader's trade detail

**How to demo:** Log in as mentor → view Alex's journal → open any trade → add annotation "Good entry, but exited too early"

---

### Mentor's Own Journal

**What it does:** Mentors have a full personal trading journal, identical to a trader's. Their experience is additive — they use Tradalyst as traders themselves.

**Where it lives:** Same `/journal/*` routes, filtered to mentor's own trades

---

### Trader Views Mentor's Trades

**What it does:** Once a mentor is assigned, the trader can browse the mentor's own trade history as read-only inspiration.

**Where it lives:** `frontend/app/src/app/(trader)/mentor-trades/page.tsx`

**How to demo:** Log in as Alex (with mentor assigned) → navigate to /mentor-trades → see read-only journal

---

### Admin User Management

**What it does:** Admins can list all users, view profiles, change roles, activate or deactivate accounts.

**Where it lives:**
- API: `GET/PATCH /api/users/` and `/api/users/<id>/`
- UI: `frontend/app/src/app/(admin)/admin/page.tsx`

**How to demo:** Log in as admin → Admin page → see all users table → click edit on any user

---

### CSV Export (RGPD)

**What it does:** Downloads all of the user's trades as a CSV file. Required by RGPD Article 20 (right to data portability).

**Where it lives:** Settings → Cuenta tab → "Exportar operaciones CSV" button

**How to demo:** Settings → Cuenta → Export → check downloaded file

---

### Light / Dark Theme Toggle

**What it does:** Toggle between the light (off-white `#eceee8`) and dark (`#1e1e1e`) colour schemes. Preference saved to user profile and cookie.

**Where it lives:**
- Sidebar (desktop): theme buttons in all three sidebars
- Settings page (all devices): Perfil tab
- Login/Register pages: floating toggle (top-left corner)

**How to demo:** Any page → click sun/moon icon in sidebar

---

### ES / EN Language Toggle

**What it does:** Switch all UI strings between Spanish (default) and English. Cookie-based, persists across sessions.

**Where it lives:**
- Sidebar (desktop): language buttons in all three sidebars
- Settings page: Perfil tab
- Login/Register pages: floating toggle (top-right corner)

**How to demo:** Any page → click ES/EN in sidebar → UI reloads in selected language

---

### Bilingual Onboarding

**What it does:** New user flow that detects the user's chosen language (from the `?lang=` param passed from the marketing site) and shows the onboarding in that language.

**Where it lives:** `frontend/app/src/app/onboarding/page.tsx`

**How to demo:** Visit `tradalyst.com/en` → click "Sign up free" → register → onboarding appears in English

---

### Blog with SEO Optimisation

**What it does:** Content marketing blog with 6+ long-form articles on trading psychology and methodology. Posts are Markdown files with full frontmatter. SEO includes: dynamic sitemap, hreflang, structured data, Open Graph.

**Where it lives:**
- Posts: `frontend/marketing/src/content/blog/*.md`
- Parser: `frontend/marketing/src/lib/blog.ts`
- Pages: `frontend/marketing/src/app/[locale]/(marketing)/blog/`

**How to demo:** Visit `tradalyst.com/blog` → open any post

---

### Marketing Site with i18n

**What it does:** Full multilingual marketing site. Every page is available in ES and EN. Language toggle in the nav switches locale and updates all content.

**Where it lives:** `frontend/marketing/` — entire directory

**How to demo:** Visit `tradalyst.com` → click EN in the nav → all copy switches to English

---

## 12. Deployment

### Server

- **Provider:** Hetzner Cloud (Germany)
- **OS:** Ubuntu 22.04 LTS
- **IP:** `49.13.237.4`
- **SSH:** `ssh mohammed@49.13.237.4` (root login disabled)

### Services

| Service | How it runs | Port | PM2/systemd name |
|---------|-------------|------|-----------------|
| Django API | Gunicorn (WSGI) → systemd | 8000 | `gunicorn` (systemd) |
| Marketing site | Node.js → PM2 | 3000 | `tradalyst-marketing` |
| Trader app | Node.js → PM2 | 3001 | `tradalyst-app` |
| PostgreSQL | systemd | 5432 | `postgresql` |
| Nginx | systemd | 80, 443 | `nginx` |

### Nginx Reverse Proxy

Each subdomain has its own config file in `/etc/nginx/conf.d/`:

```nginx
# app.conf — app.tradalyst.com
server {
    listen 443 ssl;
    server_name app.tradalyst.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# api.conf — api.tradalyst.com  
server {
    listen 443 ssl;
    server_name api.tradalyst.com;
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

SSL certificates are managed by Cloudflare (origin certificates issued to the VPS, Cloudflare handles public-facing TLS).

### How to Deploy Updates

```bash
# Full deploy (both frontend apps):
ssh mohammed@49.13.237.4 "cd /var/www/tradalyst && git pull \
  && cd frontend/marketing && npm run build && pm2 restart tradalyst-marketing \
  && cd ../app && npm run build && pm2 restart tradalyst-app"

# Deploy only the app:
ssh mohammed@49.13.237.4 "cd /var/www/tradalyst && git pull \
  && cd frontend/app && npm run build && pm2 restart tradalyst-app"

# Deploy only the backend:
ssh mohammed@49.13.237.4 "cd /var/www/tradalyst/backend \
  && git pull && source venv/bin/activate \
  && pip install -r requirements.txt \
  && python manage.py migrate \
  && sudo systemctl restart gunicorn"

# Deploy everything (full stack):
ssh mohammed@49.13.237.4 "cd /var/www/tradalyst && git pull \
  && cd backend && source venv/bin/activate && pip install -r requirements.txt \
  && python manage.py migrate && sudo systemctl restart gunicorn \
  && cd ../frontend/marketing && npm run build && pm2 restart tradalyst-marketing \
  && cd ../app && npm run build && pm2 restart tradalyst-app"
```

### How to Check Service Status

```bash
# PM2 status (Next.js apps):
ssh mohammed@49.13.237.4 "pm2 list"
ssh mohammed@49.13.237.4 "pm2 logs tradalyst-app --lines 50"
ssh mohammed@49.13.237.4 "pm2 logs tradalyst-marketing --lines 50"

# Clear PM2 logs (before reading fresh errors):
ssh mohammed@49.13.237.4 "pm2 flush"

# Django/Gunicorn:
ssh mohammed@49.13.237.4 "sudo systemctl status gunicorn"
ssh mohammed@49.13.237.4 "sudo journalctl -u gunicorn -n 50"

# Nginx:
ssh mohammed@49.13.237.4 "sudo systemctl status nginx"
ssh mohammed@49.13.237.4 "sudo nginx -t"  # Test config before reloading

# PostgreSQL:
ssh mohammed@49.13.237.4 "sudo systemctl status postgresql"

# Quick health check (all services in one go):
ssh mohammed@49.13.237.4 "pm2 list && sudo systemctl is-active gunicorn nginx postgresql"
```

### Environment Variables per Service

**Backend (`/var/www/tradalyst/backend/.env`):**
```bash
DJANGO_SETTINGS_MODULE=tradalyst.settings.production
SECRET_KEY=<random 50+ char key>
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/tradalyst_prod
CLAUDE_API_KEY=sk-ant-api03-...
FINNHUB_API_KEY=...
JWT_SIGNING_KEY=<random 128 char hex>
ALLOWED_HOSTS=api.tradalyst.com
CORS_ALLOWED_ORIGINS=https://tradalyst.com,https://app.tradalyst.com
```

**App (`/var/www/tradalyst/frontend/app/.env.local`):**
```bash
NEXT_PUBLIC_API_URL=https://api.tradalyst.com
```

**Marketing (`/var/www/tradalyst/frontend/marketing/.env.local`):**
```bash
NEXT_PUBLIC_APP_URL=https://app.tradalyst.com
```

---

## 13. Known Limitations & Future Work

### Plan Enforcement

The `plan` field (`free` | `pro`) exists on `CustomUser` and is shown in Settings, but **no feature gating is currently implemented**. All features are accessible to all users regardless of plan. Stripe integration and plan enforcement are pending.

### Payment Integration

**Not built.** Stripe is planned but not started. The pricing page shows the Pro tier at €9.99/month, but there is no checkout flow, subscription management, or webhook handling.

### Journal Search Performance

The `pair` filter uses `icontains` which maps to SQL `ILIKE '%query%'`. This performs a full-table scan at scale. For the current user base this is fine, but at 100k+ trades per user, a full-text index (`gin_trgm_ops`) or dedicated search service (e.g. Elasticsearch) would be needed.

### Analytics Query Load

The analytics page fetches all trades for a user (`GET /api/trades/?page_size=10000`) and processes charts client-side. For users with thousands of trades this can be slow. Aggregate endpoints (pre-computed stats) would improve this.

### Stock Price Delay

Finnhub free tier delivers stock quotes with a **~15 minute delay**. This is sufficient for logging past trades but not for live trading decisions. The UI does not currently show a delay warning for stock prices.

### TradingView Widget Dependency

The TickerTape and any TradingView widgets require an internet connection and access to TradingView's CDN. They do not render in offline or restricted network environments.

### Funcionalidades Page

The features page (`/funcionalidades`) is partially a placeholder. The feature row sections exist but some illustrations and copy are simplified compared to the final design spec.

### AI Requires API Credits

The Claude API is pay-per-use. All AI features (insight generation, chat) will return errors if the Anthropic API key has no remaining credits or has been revoked. There is no graceful fallback — the user sees an error message.

### Mobile — No Native App

Tradalyst is a responsive web application. There is no native iOS or Android app. The web app is mobile-optimised but does not have home screen installation (PWA) configured.

### ER Diagram Image

The `database/er_diagram.png` referenced in CLAUDE.md has not yet been generated from the final schema. Use the dbdiagram.io spec in Section 4 of this document to generate it.

---

## 14. School Requirements Checklist

> **DAW Final Project — Digitech FP, Málaga**
> Mapping each requirement to Tradalyst's implementation.

### Architecture

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Separate frontend and backend | Three independent services (Django API, marketing Next.js, app Next.js) communicating via REST + httpOnly cookies | ✅ |
| Git repository with documentation | GitHub repo with `CLAUDE.md`, `TECHNICAL_REFERENCE.md`, `docs/` folder, conventional commits | ✅ |
| Functional deployment on server | Live on Hetzner VPS at `tradalyst.com`, `app.tradalyst.com`, `api.tradalyst.com` | ✅ |

### Frontend

| Requirement | Implementation | Status |continue
|-------------|---------------|--------|
| HTML5 / CSS3 / JavaScript | Next.js compiles to standard HTML5/CSS3/JS — no non-standard browser features | ✅ |
| Responsive design | Mobile-first Tailwind CSS; BottomNav for mobile, Sidebar for desktop; tested at 375px, 390px, 414px, 768px, 1280px+ | ✅ |
| Client-side form validation | All forms validate before submit: regex checks, required fields, password strength meter, password match, terms acceptance | ✅ |
| AJAX / fetch calls | All API calls via central `src/lib/api.ts` fetch wrapper — no page reloads | ✅ |
| Brand manual | `tradalyst-brand-identity-final.html` — complete design system (colours, typography, spacing, component rules) | ✅ |
| SEO implementation | Sitemap.xml, robots.txt, JSON-LD structured data, hreflang, Open Graph tags, semantic HTML | ✅ |
| Relevant content / blog | 20 long-form blog posts (9 ES + 11 EN) on trading psychology and strategy, SEO-optimised, with SVG chart components | ✅ |
| External API integration | CoinGecko (crypto prices), Finnhub (stocks/forex), TradingView (market widgets) | ✅ |
| Error handling | `ApiError` class, inline form errors, global error boundary (`global-error.tsx`), API error messages displayed in UI | ✅ |

### Backend

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Adequate server-side technology | Python 3.12 + Django 5 + Django REST Framework — production-grade stack | ✅ |
| REST API | 31 endpoints across 7 Django apps (auth, users, trades, analysis, mentors, prices, billing), all JSON, fully documented | ✅ |
| Database connection | PostgreSQL 15 via Django ORM with connection pool | ✅ |
| Server-side validation | DRF serializers validate all inputs before processing — client-side validation is never the last line of defence | ✅ |

### Database

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Minimum 3 related tables | 7 application tables with foreign key relationships (see Section 4) | ✅ |
| ER diagram | dbdiagram.io spec in Section 4; `database/er_diagram.png` to be generated | ⚠️ PNG pending |
| SQL creation script | `database/schema.sql` (generated reference); full CREATE TABLE statements in Section 4 | ✅ |
| CRUD operations | Full CRUD on: trades, users, insights, chat messages, mentor requests, assignments, annotations | ✅ |
| 4 user roles | Guest (unauthenticated), Trader, Mentor, Admin — enforced at middleware and API level | ✅ |

### Security

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Session / token authentication | JWT in httpOnly cookies — immune to XSS token theft | ✅ |
| SQL injection / XSS protection | Django ORM uses parameterised queries; DRF validates and sanitises all input; Next.js escapes JSX by default | ✅ |
| Well-structured code | Services layer separates business logic from views; type hints on all Python functions; TypeScript strict mode; no `any` types | ✅ |
| RGPD compliance | Privacy policy linked at registration; CSV export (data portability); account deletion (right to be forgotten); explicit consent checkbox | ✅ |

### Documentation

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Introduction / project brief | `docs/TECHNICAL_REFERENCE.md` Section 1; `README.md` | ✅ |
| Planning documentation | `CLAUDE.md` captures all architectural decisions; `docs/decisions/` ADRs | ✅ |
| Design documentation | `tradalyst-brand-identity-final.html` — complete design system | ✅ |
| Installation / deployment manual | `docs/TECHNICAL_REFERENCE.md` Section 12; `docs/runbooks/` | ✅ |
| Screenshots | To be captured from live site for memoria document | ⚠️ Pending |

### Differentiating Element (Elemento Diferenciador)

| Element | Implementation | Status |
|---------|---------------|--------|
| Anthropic Claude AI API | Weekly behavioural insight generation + live AI chat — both with trade data context. Model: `claude-sonnet-4-6`. Real paid API with real costs | ✅ |
| Advanced JWT authentication | httpOnly cookies (not localStorage), token rotation, token blacklisting on logout — enterprise-level security for a student project | ✅ |
| Production deployment | Live VPS, real domain, Cloudflare CDN + SSL, Nginx reverse proxy — not a free hosting demo | ✅ |
| Bilingual AI | AI responses in the user's preferred language (ES/EN) based on their profile | ✅ |
| Mentor system | Full request-accept flow, read-only journal access, trade annotations — a complete multi-user collaboration feature | ✅ |

---

*End of Technical Reference — Tradalyst v1.0*
*Built by Mohammed | DAW Final Project | Digitech FP, Málaga | 2025–2026*
