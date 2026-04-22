# Tradalyst — Information Architecture & UX Specification

> Produced in: Information Architecture & UX chat  
> Status: In progress — Marketing site + Trader app pages defined. Mentor & Admin pages pending.  
> Language note: This document is in English (technical reference). All user-facing UI copy is in Spanish.

---

## 1. DECISIONS LOCKED IN THIS SESSION

| Decision | Detail |
|---|---|
| Pricing tiers | Free + Pro only. No third tier. |
| Mentor pricing | Mentor is NOT a paid tier. Mentors create a free account. Mentor access is a feature of the trader's Pro plan. |
| Demo page | REMOVED from scope. Free tier is the demo. No `/demo` route. |
| App theme | Light theme default. Dark mode toggle available. Preference saved to localStorage + DB (`theme_preference` on user record). |
| Marketing site theme | Light only. No dark mode on marketing site. |
| Site language | Spanish — all user-facing copy, UI labels, CTAs, marketing content. |
| Tagline | *"El diario que detecta lo que tú no ves."* — confirmed, use exactly as-is. |
| Stock/Forex API | Finnhub — chosen over Alpha Vantage. |
| Icon library | Lucide Icons — used throughout app and marketing site. |
| AI threshold | Minimum 5 trades required before AI generates first insight. |
| Onboarding flag | `onboarding_completed` boolean on users table. |
| Chat persistence | Chat messages stored in DB. New table required: `chat_messages`. |
| Price proxy | All external API calls proxied through PHP backend — never called directly from frontend. |
| Pinned assets | Stored as JSON column `pinned_assets` on users table. Max 8 assets. |
| Data export | CSV export of trades — RGPD compliance requirement. |
| Trial period | 7-day free trial on Pro plan. `trial_ends_at` field on users table. |
| Blog implementation | Markdown files in repo, rendered statically by Next.js. No CMS. |

---

## 2. SITE MAP — Complete Route Structure

### 2.1 Marketing Site (`tradalyst.com`) — Light theme

```
tradalyst.com/
├── /                          Homepage
├── /funcionalidades           Features page
├── /precios                   Pricing page (Free vs Pro)
├── /blog                      Blog index
│   └── /blog/[slug]           Individual blog post
├── /sobre-nosotros            About page
├── /login                     Login (redirects to app if already authenticated)
└── /registro                  Register (redirects to app if already authenticated)
```

**Notes:**
- No `/demo` route — removed from scope
- All routes public, no authentication required
- Spanish slugs for all routes

---

### 2.2 App (`app.tradalyst.com`) — Light theme default, dark mode toggle

#### Auth routes (unauthenticated only)
```
/login
/registro
```

#### Trader routes
```
/onboarding                    First-time setup (3 steps). One-time only.
/dashboard                     Main dashboard
/journal                       Trade list with filters and search
/journal/new                   Log a new trade
/journal/[id]                  Single trade detail view
/journal/[id]/edit             Edit a trade
/ai                            AI Analysis (insights panel + chat)
/analytics                     Deep analytics
/settings                      Profile, security, mentor, plan, account
```

#### Mentor routes
```
/mentor                        Mentor home — list of assigned traders
/mentor/[traderId]             Read-only journal for one trader
/mentor/[traderId]/dashboard   Read-only dashboard for one trader
/mentor/[traderId]/trade/[id]  Single trade view + annotation panel
```

#### Admin routes
```
/admin                         Admin home — platform stats
/admin/users                   Full user list with filters
/admin/users/[id]              Individual user profile + actions
```

#### System routes
```
/onboarding                    First-time setup wizard
/404                           Not found
/403                           Forbidden (wrong role)
```

---

### 2.3 API (`api.tradalyst.com`) — PHP REST API, no pages

Documented separately in Architecture phase.

---

### 2.4 Role Access Matrix

| Route | Guest | Trader | Mentor | Admin |
|---|---|---|---|---|
| `tradalyst.com/*` | ✅ | ✅ | ✅ | ✅ |
| `app/login`, `app/registro` | ✅ | redirect | redirect | redirect |
| `/onboarding` | ❌ | ✅ first login only | ❌ | ❌ |
| `/dashboard` | ❌ | ✅ | ❌ | ❌ |
| `/journal/*` | ❌ | ✅ | ❌ | ❌ |
| `/ai` | ❌ | ✅ | ❌ | ❌ |
| `/analytics` | ❌ | ✅ | ❌ | ❌ |
| `/settings` | ❌ | ✅ | ✅ | ❌ |
| `/mentor/*` | ❌ | ❌ | ✅ | ❌ |
| `/admin/*` | ❌ | ❌ | ❌ | ✅ |

**Important:** Admin accounts are platform operators only — no personal journal or dashboard. If an admin also trades, that is a separate trader account. Keep roles clean and non-overlapping.

**Login redirect logic:** After successful login, the backend JWT payload includes the user role. Frontend reads the role and redirects accordingly:
- Trader → `/dashboard`
- Mentor → `/mentor`
- Admin → `/admin`

---

## 3. MARKETING SITE — Page Blueprints

### 3.1 Homepage (`/`)

**Conversion logic:** What is this → Do I need it → Can I trust it → What do I get → How much → I'll try it. Sections map to this sequence exactly.

#### Nav
- Transparent on hero, frosted glass (`rgba(236,238,232,0.92)` + `backdrop-filter: blur(12px)`) on scroll
- Logo left, links centre (Funcionalidades, Precios, Blog, Nosotros), actions right (Iniciar sesión + Empezar gratis)
- Sticky, `z-index: 100`

#### Section 1 — Hero
- **Animation:** Staggered load — eyebrow (0.1s) → H1 (0.2s) → sub (0.35s) → CTAs (0.48s) → mockup slides up (0.6s)
- H1: *"El diario que detecta lo que tú no ves."* — this IS the tagline, use exactly as-is, no changes
- Sub: *"Registra tus operaciones, añade tu razonamiento, y deja que la IA encuentre los patrones que te están costando dinero."*
- CTAs: "Empezar gratis" (green primary) + "Ver cómo funciona" (outline, scrolls to #how section)
- Hero visual: Dark app dashboard mockup — large, prominent. Shows: sidebar nav, 4 stat cards, P&L SVG curve chart, activity heatmap row, AI insight card
- **Visual additions needed:** Expand mockup to be more prominent. Add mini heatmap below P&L chart inside mockup.
- **⚠️ Flag:** Hero visual is currently a coded mockup. Replace with real app screenshot once app is built.

#### Section 2 — Trust bar
- **Animation:** Slides in on scroll. Numbers count up from 0 when entering viewport (Intersection Observer + requestAnimationFrame counter).
- Slim horizontal band, white background, top/bottom border
- Four stats: `2.400+ traders` · `180.000+ operaciones registradas` · `Claude` (motor de IA) · `4,9★` (valoración media)
- IBM Plex Mono for all numbers and labels

#### Section 3 — Problem (3 cards)
- **Animation:** Cards stagger in left to right, 100ms delay between each
- Three cards, horizontal desktop / stacked mobile
- Green top-border reveal on hover
- Card 01: *"Llevas meses registrando operaciones. No estás aprendiendo de ellas."* — sub: *"Los datos están ahí. El patrón también. Pero sin análisis, son solo números."*
- Card 02: *"Tu win rate parece aceptable. Tu comportamiento dice otra cosa."* — sub: *"FOMO, revenge trading, sobreoperar en días malos — los números no te lo cuentan."*
- Card 03: *"Sabes que algo falla. No sabes exactamente qué."* — sub: *"Sin un diario que lea tu razonamiento, el error se repite indefinidamente."*
- **Visual additions needed:** Each card gets a small micro-chart illustrating the pain: Card 01 → flat P&L line going nowhere. Card 02 → bar chart win rate vs FOMO trades. Card 03 → drawdown chart with sharp dip.
- No CTA in this section. Earns trust before selling.

#### Section 4 — How it works (`#how`)
- **Animation:** Steps reveal one by one on scroll. Step number circle scales up slightly on enter.
- Label: *"Cómo funciona"* · H2: *"Tres pasos. Sin fricción."* · Sub: *"De la operación al insight en menos de 60 segundos."*
- Step 01 — **Registra:** *"Añade tu operación: activo, dirección, precio, resultado y razonamiento. 60 segundos."* Tag: `Crypto · Forex · Acciones`
- Step 02 — **Analiza:** *"La IA lee tu historial completo — números y texto — y detecta patrones de comportamiento."* Tag: `Claude AI · Análisis conductual`
- Step 03 — **Mejora:** *"Recibe insights semanales y habla con tu IA sobre tus operaciones de forma directa."* Tag: `Insights · Chat IA`
- Step 02 visual: Show a mini insight card with a small chart embedded — makes the AI step tangible.

#### Section 5 — AI Spotlight
- **Animation:** Section background shifts to dark (`#1e1e1e`) — the ONLY dark section on the marketing site. Creates visual drama and contrast. Content fades in.
- Label: `IA · CLAUDE` · H2: *"No solo qué operaste. Por qué lo operaste."*
- Left side: AI insight demo card with typewriter effect. Types realistic insight text character by character. Tags animate in after typing completes.
- Example insight text: *"En los últimos 30 días has abierto 14 operaciones marcadas como FOMO. 11 fueron pérdidas. Tu mejor rendimiento ocurre los martes entre las 10h y las 13h cuando registras 'confiado' como estado emocional. Considera reducir operaciones después de las 15h — tu tasa de error sube un 38%."*
- Tags: `FOMO Trading ↑` (red) · `Martes 10h–13h ★` (green) · `R:R Mejorando` (green) · `BTC Long Bias` (neutral)
- Right side: Three AI capability points with Lucide icons (`BrainCircuit`, `MessageSquare`, `Zap`)
- CTA: *"Obtén tu análisis"* → `/registro`
- **Visual additions needed:** Add a supporting chart next to/below the insight card — scatter plot or bar breakdown of "FOMO trades vs normal trades" by outcome. Makes the AI insight feel data-backed.
- **⚠️ Flag:** Example insight copy must feel real and specific. Never use placeholder text here.

#### Section 6 — Analytics Preview (NEW — not yet built)
- **Animation:** Charts animate in as viewport is reached. Numbers count up.
- Full dedicated section showing 3–4 actual chart types from the app: P&L curve, activity heatmap, win/loss by emotion bar chart, drawdown chart.
- This is the section that makes traders stop and say "I need this."
- Position: between AI Spotlight and Feature grid.
- Label: *"Tu rendimiento, en datos"* · H2: *"Los gráficos que los otros diarios no tienen."*

#### Section 7 — Feature grid
- **Animation:** Cards fade up in staggered 2×2 grid
- H2: *"Todo lo que necesitas para operar mejor."*
- Four feature cards with Lucide icons (no emojis):
  - `BookOpen` — **Diario completo** — *"Crypto, forex y acciones en un solo lugar. Razonamiento y estado emocional por operación."* Badge: `CRUD completo`
  - `BrainCircuit` — **IA conductual** — *"Detecta FOMO, revenge trading y sobreoperar antes de que se conviertan en pérdidas crónicas."* Badge: `Powered by Claude`
  - `Eye` — **Vista mentor** — *"Asigna un mentor. Puede revisar y anotar tus operaciones — sin tocar tus datos."* Badge: `Pro`
  - `BarChart2` — **Dashboard de rendimiento** — *"Curva P&L, heatmap, winrate y más. Todo filtrable."* Badge: `Tiempo real`
- Hover effect: lift (`translateY(-2px)`) + subtle box-shadow
- **Visual additions needed:** Each feature card gets a small embedded graph preview instead of just icon + text. Dashboard card → mini heatmap. Journal card → tiny trade table row. AI card → mini chat bubble with a stat. Performance card → mini P&L line.

#### Section 8 — Testimonials
- **Animation:** Infinite horizontal auto-scroll carousel, 28s loop, pauses on hover. Fade masks on left and right edges.
- H2: *"Lo que dicen los traders que ya llevan diario."*
- 6 cards, duplicated for seamless loop
- Realistic Spanish trader personas with specific, credible quotes (not vague praise)
- Avatar initials with brand-aligned colors

#### Section 9 — Pricing preview
- **Animation:** Two cards scale up from 0.95 to 1.0 on enter
- H2: *"Sin sorpresas. Sin $80/mes."*
- Two cards: Free (light) and Pro (dark with green border + "Más popular" badge)
- Key features only — not the full matrix. Link to `/precios` for full comparison.
- Free CTA: *"Empezar gratis"* · Pro CTA: *"Probar 7 días gratis"*

#### Section 10 — Final CTA band
- Dark background (`#1e1e1e`) with radial green ambient glow
- H2: *"Tu próxima operación ya está en los datos."*
- Sub: *"Únete a los traders que ya saben lo que otros no pueden ver."*
- CTA: *"Empezar gratis — sin tarjeta"*

#### Footer
- Logo + tagline
- Nav: Funcionalidades, Precios, Blog, Nosotros, Privacidad, Términos
- © Tradalyst 2025
- **⚠️ Legal note:** Privacy policy and Terms pages are required for RGPD compliance (school requirement). Create minimal versions of both.

---

### 3.2 Pricing Page (`/precios`)

**Job:** Remove the last reason not to sign up. Every element answers an objection.

#### Section 1 — Header
- H1: *"Precios claros. Sin sorpresas."*
- Sub: *"Empieza gratis hoy. Pasa a Pro cuando estés listo. Cancela cuando quieras."*
- No CTA here — let them read first.
- No annual/monthly toggle at launch — monthly only. Note *"Facturación anual disponible próximamente"* if asked.

#### Section 2 — Plan cards
Two cards, side by side:

**Free card:**
- Plan: `FREE` (mono)
- Price: `€0` — *"para siempre"*
- Positioning: *"Para empezar sin compromiso."*
- Features (benefit language, not technical labels):
  - ✅ Diario ilimitado de operaciones
  - ✅ Dashboard básico de rendimiento
  - ✅ Hasta 3 análisis de IA al mes
  - ✅ Precios en tiempo real (crypto)
  - ❌ Chat ilimitado con IA
  - ❌ Vista mentor
  - ❌ Analítica avanzada
  - ❌ Forex y acciones en tiempo real
- CTA: *"Empezar gratis"* (outline)

**Pro card (featured, dark background):**
- Badge: *"Más popular"*
- Plan: `PRO` (mono)
- Price: `€9,99` — *"al mes · cancela cuando quieras"*
- Positioning: *"Para el trader que quiere mejorar en serio."*
- Features:
  - ✅ Todo lo del plan Free
  - ✅ Insights de IA ilimitados
  - ✅ Chat ilimitado con IA
  - ✅ Análisis conductual completo
  - ✅ Vista mentor incluida
  - ✅ Analítica avanzada
  - ✅ Precios en tiempo real (crypto, forex, acciones)
- CTA: *"Probar 7 días gratis"* (green solid)
- **⚠️ Flag:** 7-day trial requires `trial_ends_at` field on users table and trial expiry logic in the backend.

#### Section 3 — Full comparison table
Rows grouped by category. Columns: Feature · Free · Pro.

**Diario**
- Operaciones ilimitadas: ✅ ✅
- Crypto, forex y acciones: ✅ ✅
- Razonamiento y etiqueta emocional: ✅ ✅
- Historial completo: ✅ ✅

**IA**
- Insights semanales: Free: 3/mes · Pro: Ilimitados
- Chat directo con la IA: ❌ ✅
- Análisis conductual: ❌ ✅

**Analítica**
- Dashboard básico: ✅ ✅
- Curva P&L completa: ❌ ✅
- Heatmap de actividad: ❌ ✅
- Breakdown por activo y emoción: ❌ ✅

**Mentor**
- Vista mentor: ❌ ✅
- Anotaciones por operación: ❌ ✅

**Precios en tiempo real**
- Crypto via CoinGecko: ✅ ✅
- Forex y acciones via Finnhub: ❌ ✅

#### Section 4 — FAQ (6 questions)
1. *¿Necesito tarjeta de crédito para empezar?* — No. El plan Free es gratis para siempre sin datos de pago.
2. *¿Puedo cancelar en cualquier momento?* — Sí. Sin permanencia, sin penalización.
3. *¿Qué pasa con mis datos si cancelo?* — Tu historial sigue siendo tuyo. Puedes exportarlo en cualquier momento.
4. *¿Cómo funciona el período de prueba de 7 días?* — Acceso completo a Pro durante 7 días. Si no cancelas antes, se activa la suscripción mensual.
5. *¿El mentor también paga?* — No. El mentor crea una cuenta gratuita y accede cuando el trader le asigna desde su plan Pro.
6. *¿Qué IA usa Tradalyst?* — Claude, desarrollado por Anthropic. La misma IA que usan empresas como Slack, Notion y Quora.

#### Section 5 — Final CTA band
- *"La diferencia entre un trader que mejora y uno que no es el análisis."*
- *"Empezar gratis"*

---

### 3.3 Features Page (`/funcionalidades`)

Low complexity. Expanded feature section for SEO and detail-oriented visitors.

- Hero: *"Todo lo que necesitas para operar mejor."*
- Four feature rows, alternating image-left/text-right layout
- Each row: feature name, 2–3 sentences benefit copy, UI screenshot or chart visual
- Bottom CTA band
- **⚠️ Flag:** UI screenshots don't exist yet. Build this page last — after the app is built and can be screenshotted.

---

### 3.4 Blog (`/blog` + `/blog/[slug]`)

Exists for SEO. 4 posts minimum at launch.

**Blog index:** Grid of post cards — title, category tag, date, excerpt, read time.

**Post template:**
- Title, author, date, read time
- Body with headings — no walls of text
- Related posts at the bottom
- Mid-article or end CTA card: *"¿Quieres analizar tus propias operaciones?"* → `/registro`

**Minimum 4 posts targeting these keywords:**
1. *"Cómo llevar un diario de trading efectivo"* → keyword: "diario de trading"
2. *"Qué es el FOMO trading y cómo evitarlo"* → keyword: "FOMO trading"
3. *"Los mejores indicadores de rendimiento para traders"* → keyword: "métricas trading"
4. *"Por qué el 80% de los traders pierden dinero"* → high search volume, strong hook

**Implementation:** Markdown files in Next.js repo. No CMS needed. Static generation.

---

### 3.5 About Page (`/sobre-nosotros`)

Minimal. Professors will check it exists.

- Origin story: trader frustration → spreadsheets → idea → build. Honest and direct.
- Tech stack briefly mentioned — transparency
- Note on AI: *"Tradalyst usa Claude, desarrollado por Anthropic, para analizar patrones de comportamiento en el historial de operaciones."*
- Contact email

No team photos. One person built this — that's the story.

---

### 3.6 Login (`/login`)

Centred card on light background. Same layout as register.

**Fields:** Email · Contraseña · *"¿Olvidaste tu contraseña?"* link

**CTA:** *"Iniciar sesión"*

**Below card:** *"¿No tienes cuenta?"* → *"Regístrate gratis"*

**Validation states:**
- Empty field on submit → inline error below each field
- Wrong credentials → *"Email o contraseña incorrectos"* (never specify which — security)
- Account suspended → *"Tu cuenta ha sido suspendida. Contacta con soporte."*

**Post-login redirect by role:**
- Trader (first login) → `/onboarding`
- Trader (returning) → `/dashboard`
- Mentor → `/mentor`
- Admin → `/admin`

---

### 3.7 Register (`/registro`)

Centred card on light background.

**Fields:** Nombre completo · Email · Contraseña · Confirmar contraseña

**Additional:** Password strength indicator (visual bar). Terms checkbox (RGPD — required).

**CTA:** *"Crear cuenta gratis"*

**Below card:** *"¿Ya tienes cuenta?"* → *"Iniciar sesión"*

**Validation states:**
- Email already registered → *"Ya existe una cuenta con este email"*
- Password too weak → inline requirement checklist (8+ chars, one number, one uppercase)
- Passwords don't match → *"Las contraseñas no coinciden"*
- Terms unchecked → *"Debes aceptar los términos para continuar"*

**Post-register redirect:** Always → `/onboarding` (never `/dashboard` — empty state is a bad first experience)

---

## 4. APP PAGES — Page Blueprints

### 4.1 Onboarding (`/onboarding`)

One-time only. `onboarding_completed` flag on users table prevents repeat visits.

**Step 1 — Bienvenida**
- *"Bienvenido a Tradalyst, [nombre]."*
- Single question: *"¿Qué tipo de trader eres principalmente?"*
- Pill options: Crypto · Forex · Acciones · Todos
- Answer pre-configures asset dropdown defaults in trade form

**Step 2 — Primera operación**
- *"Registra tu primera operación."*
- Full trade form with progress indicator (Step 2 of 3)
- Asset pre-filled from Step 1 answer
- Skip link: *"Prefiero explorar primero"*

**Step 3 — Listo**
- If traded: *"Tu primera operación está registrada. La IA necesita al menos 5 operaciones para generar tu primer análisis."*
- If skipped: *"Cuando tengas 5 operaciones registradas, la IA generará tu primer análisis automáticamente."*
- CTA: *"Ir al dashboard"* → `/dashboard`

**⚠️ Flag:** The 5-trade minimum for AI is a product rule enforced in the backend. Store as a constant, not hardcoded.

---

### 4.2 Dashboard (`/dashboard`)

Most important page in the app. Traders see this every day.

**Layout:** Two columns desktop, single column mobile.

**Top bar:**
- *"Buenos días/Buenas tardes, [nombre]"* — IBM Plex Sans, large
- Current date — IBM Plex Mono
- *"+ Nueva operación"* — green button, always visible, top right

**Date range filter:** Hoy / Esta semana / Este mes / Todo — applies to all widgets below

**Row 1 — Stat cards (4 across):**
- P&L Total — green if positive, red if negative, IBM Plex Mono
- Win Rate — percentage, IBM Plex Mono
- Total operaciones — count, IBM Plex Mono
- R:R Medio — ratio, IBM Plex Mono

**Row 2 — Prices widget (NEW):**
Slim horizontal strip, full width. Positioned between stat cards and P&L chart.

Each pinned asset shows: Asset name · Current price (IBM Plex Mono) · 24h change % (green/red) · Tiny 7-day sparkline

`+` button at the end → modal to add/remove pinned assets (max 8)

Default pins based on onboarding answer: Crypto selected → BTC, ETH pre-pinned. Forex → EUR/USD, GBP/USD. Stocks → AAPL, TSLA.

Price refresh: fetch on page load + `setInterval` every 60 seconds. Show *"Actualizado hace Xs"* timestamp in mono.

**⚠️ Flag:** Price fetches must go through the PHP backend proxy (`/api/prices`), never directly from the frontend to CoinGecko/Finnhub. The backend caches responses for 60 seconds to avoid rate limiting. This is mandatory — not optional.

**Row 3 — P&L curve (65%) + AI Insight card (35%):**

P&L curve: cumulative line chart. Green line + green fill below. X axis dates, Y axis currency. Full date range selectable.

AI Insight card:
- Green pulsing dot + *"IA · Actualizado hace X días"*
- Insight text (3–4 sentences)
- 2–3 behaviour tags
- *"Hablar con la IA"* → `/ai`
- **Empty state (< 5 trades):** Progress bar showing trades logged vs 5 minimum. *"Registra 5 operaciones para activar tu primer análisis de IA."*

**Row 4 — Activity heatmap:**
Full width. 52 weeks × 7 days. GitHub-style grid.
- Green = profitable day (intensity scales with P&L magnitude)
- Red = losing day (intensity scales with loss magnitude)
- Grey = no trades
- Tooltip on hover: date, P&L, trade count

**Row 5 — Recent trades table:**
Last 5 trades. Columns: Fecha · Activo · Dirección · Resultado · P&L · Emoción
- Direction pill: Long (green) / Short (red)
- P&L: green if positive, red if negative, IBM Plex Mono
- Resultado pill: Win (green) / Loss (red) / Breakeven (neutral)
- Link: *"Ver todas las operaciones"* → `/journal`

**Empty state (zero trades):**
No empty charts. Single centred prompt: *"Aún no tienes operaciones registradas."* + *"+ Registrar primera operación"* green button.

---

### 4.3 Trade Journal (`/journal`)

**Top bar:**
- Title: *"Diario de operaciones"*
- *"+ Nueva operación"* — green, right
- Search bar — searches asset name AND reasoning text

**Filter bar:**
- Activo (multi-select dropdown)
- Dirección: Todos / Long / Short
- Resultado: Todos / Win / Loss / Breakeven
- Emoción: Todos / Confiado / FOMO / Incierto / Revenge
- Fecha: date range picker
- *"Limpiar filtros"* link

**Trade table columns:**
Fecha · Activo · Dirección (Long/Short pill) · Entrada · Salida · P&L · Resultado · Emoción · Actions (eye, pencil, trash icons)

Row click → `/journal/[id]`

**Pagination:** 20 per page, prev/next.

**⚠️ Flag:** Reasoning text search uses `LIKE` query — fine at school project scale. Document as a known scaling limitation.

---

### 4.4 Trade Form (`/journal/new` + `/journal/[id]/edit`)

Same component, two contexts. New = empty fields. Edit = pre-filled.

**Fields:**
- **Activo** — text input with autocomplete (BTC/USD, ETH/USD, EUR/USD, AAPL, etc.)
- **Tipo de mercado** — pill toggle: Crypto / Forex / Acciones (auto-detects from asset input)
- **Dirección** — two large toggle buttons: Long (green highlight) / Short (red highlight)
- **Precio de entrada** — IBM Plex Mono number input. If crypto: *"Precio actual: $X · hace Xs"* appears via backend proxy. *"Usar este precio"* one-click fill.
- **Precio de salida** — IBM Plex Mono number input
- **Tamaño de posición** — number
- **P&L** — auto-calculated, read-only, shown in green/red. Updates live as user types prices.
- **Fecha y hora** — datetime picker, defaults to now
- **Resultado** — three pills: Win / Loss / Breakeven. Auto-suggests from P&L but user can override.
- **Razonamiento** — textarea, large. Placeholder: *"¿Por qué entraste en esta operación? ¿Qué veías en el mercado?"* Word count nudge: *"La IA analiza mejor con al menos 20 palabras."*
- **Estado emocional** — four pill buttons: Confiado / FOMO / Incierto / Revenge

**Actions:** *"Guardar operación"* (green) · *"Cancelar"* (ghost, goes back)

**Inline price widget (NEW — on this form):**
When asset field loses focus → fetch from backend proxy → show:
```
Precio actual: $83,420  ·  hace 45s   [Usar este precio]
```
Cache last fetched price for 30 seconds. Never fetch on every keystroke.

**Validation:**
- Required: Activo, Dirección, Precio entrada, Fecha
- All errors inline below each field, not a top-level alert

---

### 4.5 Trade Detail (`/journal/[id]`)

Read-only.

**Layout:**
- Back link: *"← Volver al diario"*
- Trade header: Asset (large) · Direction pill · Date (mono)
- Two columns:
  - Left: all trade fields displayed cleanly
  - Right: AI mini-analysis of this specific trade (if available) + mentor annotations (if any)
- Edit button (top right) → `/journal/[id]/edit`
- Delete button (red) → confirmation modal: *"¿Eliminar esta operación? Esta acción no se puede deshacer."*

---

### 4.6 AI Analysis (`/ai`)

Two-panel layout on desktop. Stacked on mobile.

**Left panel — Insights (40%):**
- Current weekly insight card: green pulse dot, insight text, tags
- *"Actualizar análisis"* button → triggers new Claude API call, shows loading state
- Previous insights: collapsed accordion, last 4 weeks
- Behaviour tags summary: most frequent patterns across all history

**Right panel — Chat (60%):**
- Full chat interface — message history scrollable
- User messages: right-aligned, green background
- AI messages: left-aligned, dark surface background
- IBM Plex Mono for any numbers/data in AI responses
- Input bar: text field + send button (Lucide `Send` icon)
- Suggested prompts (shown on first load / empty state):
  - *"¿Por qué sigo perdiendo en cortos?"*
  - *"¿Cuál es mi mejor setup?"*
  - *"¿Qué días opero mejor?"*
  - *"Analiza mis últimas 10 operaciones"*

**⚠️ Flag — Chat persistence:** Chat messages MUST persist across sessions. Required DB table:
```sql
chat_messages: id, user_id, role ENUM('user','assistant'), content TEXT, created_at
```

**⚠️ Flag — Token strategy:** Each chat message sends the user's full trade history as context. As history grows, the API payload grows. Solutions: (a) send only last N trades, (b) summarise older history. Decide in Architecture phase. Flag in documentation.

---

### 4.7 Analytics (`/analytics`)

Detailed charts. For traders who want to go deeper than the dashboard.

**Sections:**

**Performance overview** — same 4 stat cards + comparison vs previous period: *"vs. mes anterior ↑12%"*

**P&L breakdown** — bar chart by week or month (switchable toggle)

**Win/Loss by asset** — horizontal bar chart. Most to least profitable assets.

**Win/Loss by emotion** — bar chart. This is the most revealing chart in the app. Shows e.g. FOMO trades 23% win rate vs Confident trades 67% win rate.

**Win/Loss by time of day** — bar chart showing best and worst trading hours.

**Win/Loss by direction** — Long vs Short performance side by side.

**Drawdown chart** — maximum consecutive losses and recovery time.

All charts share the same date range and asset filters. Filters are sticky at the top.

**⚠️ Flag:** Each chart is a separate aggregation query. Multiple DB queries per page load. Acceptable at school project scale. Document as known scaling point.

---

### 4.8 Settings (`/settings`)

Tabbed layout.

**Tab: Perfil**
- Name, email (read-only), profile picture upload
- *"Guardar cambios"*

**Tab: Seguridad**
- Change password: current password + new + confirm
- *"Actualizar contraseña"*

**Tab: Mentor**
- Current mentor display (if assigned): name, email, *"Revocar acceso"* button
- Assign mentor: email input field → sends invitation
- Explanation: *"Tu mentor puede ver tu diario completo y añadir anotaciones. No puede editar ni eliminar tus operaciones."*

**Tab: Plan**
- Current plan badge (Free / Pro)
- Free → upgrade CTA → `/precios`
- Pro → next billing date + *"Cancelar suscripción"* link

**Tab: Cuenta**
- *"Exportar mis datos"* → downloads CSV of all user's trades (RGPD — right to portability)
- *"Eliminar cuenta"* → red, requires confirmation modal, permanent and irreversible

---

## 5. MARKET PRICES WIDGET — Full Specification

This widget appears in two places with slightly different behaviour.

### 5.1 Dashboard prices strip

**Position:** Between stat cards (Row 1) and P&L chart (Row 3). Full width.

**Each asset card shows:**
- Asset identifier (e.g. BTC/USD) — IBM Plex Sans
- Current price — IBM Plex Mono, medium
- 24h change % — green if positive, red if negative, IBM Plex Mono
- 7-day sparkline (small SVG line) — optional but high visual value

**Controls:**
- `+` button at the end of the strip → modal: search + add asset, remove existing
- Max 8 pinned assets

**Refresh logic:**
- Fetch on page load
- `setInterval` every 60 seconds
- Show *"Actualizado hace Xs"* timestamp below strip (IBM Plex Mono, muted)

**Default pins (from onboarding answer):**
- Crypto → BTC/USD, ETH/USD
- Forex → EUR/USD, GBP/USD
- Acciones → AAPL, TSLA
- Todos → BTC/USD, ETH/USD, EUR/USD, AAPL

### 5.2 Trade form inline price hint

**Trigger:** When the `Activo` field loses focus (on blur) or user selects from autocomplete.

**Display:**
```
Precio de entrada  [ 83,204.00        ]
                     Precio actual: $83,420  ·  hace 45s   [Usar este precio]
```

**Behaviour:**
- *"Usar este precio"* → one click pre-fills the entry price field
- User can still override manually
- Cache last fetched price for 30 seconds — never fetch on every keystroke

### 5.3 API routing (mandatory)

```
Frontend → api.tradalyst.com/api/prices?asset=BTC&currency=USD
        → PHP backend checks cache
        → If cache miss: fetch CoinGecko (crypto) or Finnhub (forex/stocks)
        → Cache response for 60 seconds
        → Return to frontend
```

**Routing logic:**
- Crypto tickers (BTC, ETH, SOL, etc.) → CoinGecko
- Forex pairs (EUR/USD, GBP/USD, etc.) → Finnhub
- Stock tickers (AAPL, TSLA, etc.) → Finnhub

**Never** call CoinGecko or Finnhub directly from the frontend. Ever.

**School requirement satisfied:** *"Consumo de una API externa pública que tenga sentido para el proyecto"* — live market prices in a trading journal is the most natural possible use. Backend proxy also demonstrates server-side API integration.

---

## 6. HOMEPAGE — Visual Additions PENDING BUILD

These additions were agreed in this session but not yet built into the prototype. Add them when building the final homepage:

| Location | Addition | Priority |
|---|---|---|
| Hero mockup | Make P&L chart more prominent. Add mini heatmap row below chart inside mockup. | High |
| Problem cards | Micro-chart per card: flat line (01), win rate bar (02), drawdown (03) | High |
| How it works Step 02 | Mini insight card with embedded chart | Medium |
| AI Spotlight | Supporting chart next to typewriter: FOMO vs normal trades outcome breakdown | High |
| New Analytics Preview section | 3–4 chart types shown as full visual section | High |
| Feature cards | Small embedded graph per card instead of icon only | Medium |

**Current prototype file:** `tradalyst-homepage.html` — base to iterate from.

---

## 7. DB ADDITIONS FROM THIS SESSION

These fields/tables are required based on IA/UX decisions made here. Add to the schema:

| Table | Field/Change | Reason |
|---|---|---|
| `users` | `onboarding_completed BOOLEAN DEFAULT FALSE` | Skip onboarding on return |
| `users` | `theme_preference ENUM('light','dark') DEFAULT 'light'` | Dark mode persistence |
| `users` | `pinned_assets JSON DEFAULT '["BTC","ETH"]'` | Market prices widget |
| `users` | `trial_ends_at DATETIME NULL` | Pro trial logic |
| `users` | `plan ENUM('free','pro') DEFAULT 'free'` | Plan management |
| `chat_messages` | New table: `id, user_id, role ENUM('user','assistant'), content TEXT, created_at` | AI chat persistence |

---

## 8. PENDING — NOT YET PLANNED IN THIS SESSION

| Area | Status |
|---|---|
| Mentor pages (`/mentor/*`) | ⬜ Not yet planned |
| Admin pages (`/admin/*`) | ⬜ Not yet planned |
| UX Flows (4 key journeys) | ⬜ Not yet planned |
| Mobile responsive behaviour | ⬜ Not yet planned |
| Error states and edge cases | ⬜ Not yet planned |

---

## 9. IMPLEMENTATION FLAGS — Summary

All `⚠️ Flag` items from this session collected in one place:

1. **Hero visual** — currently a coded mockup. Replace with real screenshot after app is built.
2. **AI example insight copy** — must feel real and specific. Never placeholder text.
3. **5-trade AI threshold** — enforce in backend. Store as a named constant.
4. **7-day Pro trial** — requires `trial_ends_at` on users table and expiry logic.
5. **Login redirect by role** — JWT payload must include role. Read on frontend for redirect target.
6. **Empty dashboard state** — never show empty charts. Show prompt + CTA instead.
7. **Reasoning word count nudge** — encourage 20+ words. AI quality depends on it.
8. **Price proxy mandatory** — never call external APIs from frontend. Always proxy through backend.
9. **Price cache** — backend caches external API responses for 60 seconds. Solves rate limiting.
10. **CoinGecko rate limit** — 30 calls/minute on free tier. Proxy + cache solves this.
11. **Mentor multi-trader** — design mentor home for multiple assigned traders from day one.
12. **Admin layout/middleware** — protect at routing level, not just component level. No flash of admin UI.
13. **Chat token strategy** — decide in Architecture phase: last N trades or summarised history.
14. **Journal search** — `LIKE` query on reasoning text. Document as scaling limitation.
15. **Analytics queries** — multiple aggregation queries per page load. Document as scaling point.
16. **Data export (RGPD)** — CSV export of trades required. Right to portability.
17. **Privacy policy + Terms** — minimal versions required for RGPD compliance (school requirement).
18. **Features page** — build last, after real app screenshots exist.
19. **Blog posts** — 4 minimum at launch for SEO school requirement.
20. **`onboarding_completed` flag** — set to TRUE after Step 3 is completed or skipped.

---

*Document version: 1.0 — End of Information Architecture & UX session (marketing site + trader app pages)*  
*Next session: Mentor pages, Admin pages, UX flows, DB schema*
