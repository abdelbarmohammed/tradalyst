# Tradalyst — SEO Strategy
**Version:** 1.0  
**Domain:** tradalyst.com (live, zero GSC data, fresh domain authority)  
**Stack:** Next.js (frontend) · Django (backend) · PostgreSQL  
**i18n:** Spanish default (`/`) · English at `/en/`  
**Existing content:** 4 blog posts live (ES + EN translations)  
**Audience:** Retail traders — Spanish-speaking primary, English-speaking secondary  
**Competitors:** Edgewonk, TraderSync, Tradervue, TradesViz  
**Differentiator:** Claude AI behavioural analysis, affordable, bilingual  

---

## TABLE OF CONTENTS

1. [Keyword Research](#1-keyword-research)
2. [Content Audit — Existing 4 Posts](#2-content-audit)
3. [Content Plan — Next 20 Posts](#3-content-plan)
4. [Content Clusters & Internal Linking](#4-content-clusters)
5. [Technical SEO Checklist](#5-technical-seo)
6. [On-Page SEO Rules](#6-on-page-rules)
7. [Blog Post Markdown Template](#7-markdown-template)
8. [Google Search Console Setup](#8-google-search-console)
9. [Quick Wins — First 7 Days](#9-quick-wins)
10. [Blog Post Image Strategy](#10-blog-post-image-strategy)

---

## 1. KEYWORD RESEARCH

### Do Spanish traders search in Spanish or English?

This is the most important strategic question before anything else.

**The answer: it splits by topic and experience level.**

Spanish-speaking traders search in **English** for: advanced technical concepts (order flow, ICT, smart money, supply and demand, backtesting), broker reviews, and specific trading strategies. This content simply doesn't exist in quality Spanish — so experienced traders default to English.

They search in **Spanish** for: "qué es el FOMO", "cómo gestionar el riesgo", "por qué pierdo en trading", "diario de trading", tool comparisons, and beginner-to-intermediate educational content. This is the gap — and where Tradalyst can rank.

**Strategic implication:** Target Spanish for commercial intent (the product itself) and educational content aimed at intermediate traders. Target English for the same topics adapted — not copied — because English competition is higher but the traffic ceiling is also much higher.

The bilingual setup (`/` ES + `/en/` EN) is correct. Don't try to rank for advanced English strategy keywords on a fresh domain. Go after long-tail, low-competition English terms where the intent matches the product.

---

### 1.1 Spanish Keywords

#### Primary — high intent, trading journal niche

| Keyword | Intent | Difficulty (new domain) | Priority |
|---|---|---|---|
| diario de trading | Info + Commercial | Medium | Now |
| diario de trading online | Commercial | Low | Now |
| diario de trading gratis | Commercial | Low | Now |
| app diario de trading | Commercial | Low | Now |
| plantilla diario de trading | Informational | Low | Now |
| registro de operaciones trading | Informational | Low | Now |
| cómo llevar un diario de trading | Informational | Low | Now |
| mejor diario de trading | Commercial | Medium | Month 1 |
| software diario de trading | Commercial | Medium | Month 2 |

**Why these are reachable:** The Spanish-language trading journal niche is thin. Edgewonk has a Spanish site but doesn't rank for Spanish-language long-tail terms. TraderSync has no Spanish presence. This is a genuine gap.

#### Secondary — broader trading education

| Keyword | Intent | Difficulty | Priority |
|---|---|---|---|
| psicología del trading | Informational | High | Month 3 |
| gestión de riesgo trading | Informational | Medium | Month 1 |
| errores comunes traders | Informational | Low | Now |
| FOMO trading | Informational | Low | Now |
| métricas de trading | Informational | Low | Now |
| ratio riesgo beneficio | Informational | Low | Month 1 |
| win rate trading | Informational | Low | Month 1 |
| drawdown trading | Informational | Low | Month 1 |
| revenge trading | Informational | Low | Month 1 |
| análisis de operaciones | Informational | Low | Month 1 |
| trading conductual | Informational | Very Low | Now |
| IA para traders | Info + Commercial | Very Low | Now |

#### Long-tail — specific, low competition, high intent

| Keyword | Intent | Difficulty | Priority |
|---|---|---|---|
| qué apuntar en el diario de trading | Informational | Very Low | Now |
| cómo mejorar como trader principiante | Informational | Low | Month 1 |
| por qué pierdo dinero en trading | Informational | Low | Now |
| cómo controlar las emociones en el trading | Informational | Low | Month 1 |
| herramienta para analizar trades | Commercial | Very Low | Now |
| cómo calcular el drawdown máximo | Informational | Very Low | Month 1 |
| qué es el revenge trading | Informational | Very Low | Month 1 |
| cómo saber si soy un trader rentable | Informational | Very Low | Month 1 |
| diario de trading para crypto | Informational | Very Low | Month 2 |
| cómo analizar mis operaciones perdedoras | Informational | Very Low | Month 1 |

#### Question keywords — PAA targets

These are gold for a new domain. Spanish PAA boxes are less contested than English. A well-structured FAQ section can appear in PAA results within weeks of indexing.

- ¿Qué es un diario de trading?
- ¿Cómo hacer un diario de trading?
- ¿Para qué sirve el diario de trading?
- ¿Por qué los traders pierden dinero?
- ¿Qué es el FOMO en trading?
- ¿Cómo se calcula el win rate?
- ¿Qué es el revenge trading?
- ¿Qué métricas debe seguir un trader?
- ¿Qué es el drawdown máximo?
- ¿Cómo mejorar la disciplina en trading?

**Implementation rule:** Every blog post must include a FAQ section with 3–5 of these answered in 40–70 words each. Short, direct, complete answers — no preamble like "en este artículo veremos...". Google extracts these directly for PAA boxes.

---

### 1.2 English Keywords

#### Primary — trading journal niche

| Keyword | Intent | Difficulty (new domain) | Priority |
|---|---|---|---|
| trading journal | Info + Commercial | High | Month 3 (pillar) |
| free trading journal | Commercial | Medium | Month 1 |
| trading journal app | Commercial | High | Month 3 |
| trading journal template | Informational | Medium | Month 1 |
| how to keep a trading journal | Informational | Low | Now |
| trading journal for beginners | Informational | Low | Now |
| trading diary | Info + Commercial | Medium | Month 2 |
| best trading journal 2025 | Commercial | Medium | Month 2 |

#### Secondary — psychology and education

| Keyword | Intent | Difficulty | Priority |
|---|---|---|---|
| FOMO trading | Informational | Low–Medium | Now |
| revenge trading | Informational | Low | Now |
| trading psychology | Informational | High | Month 3 |
| trading mistakes beginners | Informational | Low | Now |
| how to improve trading performance | Informational | Low | Month 1 |
| trading win rate | Informational | Low | Month 1 |
| trading drawdown explained | Informational | Low | Month 1 |
| behavioral trading analysis | Informational | Very Low | Month 1 |

#### Long-tail — very low competition, high specificity

| Keyword | Intent | Difficulty | Priority |
|---|---|---|---|
| how to analyze your trading mistakes | Informational | Very Low | Now |
| AI trading journal | Info + Commercial | Very Low | Now |
| trading journal with AI analysis | Commercial | Very Low | Now |
| why do traders lose money statistics | Informational | Low | Now |
| how to track trading performance | Informational | Low | Month 1 |
| trading metrics to track | Informational | Low | Month 1 |
| trading journal for forex traders | Informational | Low | Month 2 |
| trading journal for crypto | Informational | Low | Month 2 |

#### Competitor gap keywords

Terms Edgewonk/TraderSync rank for where a focused piece of content from a new domain can compete — especially "alternative" searches where the user is already in buying mode.

| Keyword | Who ranks | Attack angle |
|---|---|---|
| edgewonk alternative | Edgewonk (poorly) | Tradalyst is cheaper + has AI |
| tradervue alternative | Tradervue | Tradalyst is free tier + modern |
| tradersync alternative | TraderSync | Tradalyst is a fraction of the price |
| free trading journal software | Multiple weak sites | Month 1 priority |
| ai trading analysis tool | Very weak competition | Own this — no one is doing it well in English |

**Note on comparison posts:** Be factual, not dismissive. Edgewonk is excellent software — it just has no AI and costs more. TraderSync has AI but costs $80/month. Tradalyst has AI and is free/€9.99. The comparison writes itself when you're honest.

---

## 2. CONTENT AUDIT

### Post 1 — "Cómo llevar un diario de trading efectivo"
**Target keyword:** diario de trading

**Is the topic right?** Yes — this is the most important post on the site. It's the product's core value proposition in article form.

**Is the difficulty appropriate?** The head term "diario de trading" is medium difficulty. The long-tail title "cómo llevar un diario de trading efectivo" is low. Well-targeted.

**What's missing to rank:**
- Minimum 1,800 words — posts ranking for this keyword are 1,500–2,500 words
- A concrete example entry (fictional but specific — not "asset: BTC, result: +$200" but a full realistic entry with reasoning and emotion tag written out)
- FAQ section with at least 3 PAA questions answered in 50–70 words each
- Internal links to at least 2 other posts (metrics, FOMO)
- Mid-article CTA block
- `Article` + `FAQPage` schema markup
- A checklist: "What to include in every trade entry" — increases time-on-page and earns natural backlinks

**Specific improvements:**
- Add H2: "¿Qué diferencia un diario de trading que funciona de uno que no?" — high snippet probability
- Add H2: "Ejemplo real de entrada en el diario" — the most-skimmed section, make it concrete and specific
- The CTA should name Tradalyst explicitly — this post IS the product pitch

---

### Post 2 — "Qué es el FOMO trading y cómo evitarlo"
**Target keyword:** FOMO trading

**Is the topic right?** Yes. Low difficulty, decent volume, emotionally resonant. Someone searching "FOMO trading" recognises the problem in themselves — exactly the Tradalyst user.

**Is the difficulty appropriate?** Very appropriate. Ideal keyword for a new domain — specific enough to rank, broad enough to drive traffic.

**What's missing:**
- FAQ section — "¿Qué es el FOMO en trading?", "¿Cómo se controla el FOMO?", "¿El FOMO es lo mismo que la codicia?" — 50-word answers
- A practical section: "3 señales de que estás operando por FOMO" — actionable content outperforms definition-only posts
- Internal link to the diario de trading post (the journal is the tool to detect FOMO patterns — natural connection)
- Internal link to revenge trading post (related psychological pattern)
- `FAQPage` schema markup

**Specific improvement:** Add a section connecting FOMO to journaling: "El problema con el FOMO es que muchos traders no lo reconocen en el momento — sólo después. Registrar el estado emocional antes de cada operación es la forma más directa de detectarlo." This is also a soft Tradalyst mention.

---

### Post 3 — "Los mejores indicadores de rendimiento para traders" / "Métricas de trading"
**Target keyword:** métricas trading

**Is the topic right?** Yes, but highest risk of being generic. The posts that rank well for this keyword go deep on the math — not just the names.

**Is the difficulty appropriate?** Low–medium. Good choice.

**What's missing:**
- This must be the longest post in the initial batch: 2,000–2,500 words minimum
- A table for each metric: name · formula · what it tells you · what a good value looks like
- These metrics must be covered with actual formulas:

| Metric | Formula |
|---|---|
| Win Rate | (Winning trades / Total trades) × 100 |
| Risk:Reward Ratio | Average win / Average loss |
| Profit Factor | Gross profit / Gross loss |
| Expectancy | (Win% × Avg win) – (Loss% × Avg loss) |
| Max Drawdown | (Peak value – Trough value) / Peak value |

- A section: "Métricas que el 90% de los traders ignoran" — high-CTR hook, covers expectancy and profit factor
- FAQ: "¿Cuál es un buen win rate en trading?", "¿Qué es el profit factor?", "¿Cómo se calcula el drawdown?"
- Internal link to the diario post (where you record these metrics) and the "por qué pierden" post

**Specific improvement:** Add natural CTA — "Tradalyst calcula estas métricas automáticamente a partir de tus operaciones registradas." No hype — just a fact.

---

### Post 4 — "Por qué el 80% de los traders pierden dinero"
**Target keyword:** por qué pierden dinero los traders

**Is the topic right?** Strongest hook in the batch. High emotional resonance, clear search intent, and the person searching it is frustrated — receptive to a solution. Best post of the four for driving registrations.

**Is the difficulty appropriate?** Medium–low. Most existing posts on this topic are generic listicles. A post with real statistics, specific causes, and clear structure can rank above them.

**What's missing:**
- Real statistics with source. ESMA publishes data on CFD retail investor losses — cite it. This adds credibility a generic post can't match.
- Structure as numbered causes, each with a concrete mechanism and connection back to journaling as the diagnostic tool
- FAQ: "¿Qué porcentaje de traders pierde dinero?", "¿Por qué es tan difícil ganar en trading?", "¿Cómo sé si estoy mejorando como trader?"
- Internal links to FOMO post, revenge trading post, metrics post

**Specific improvement:** Post should end with: "El trader que no sabe por qué pierde, seguirá perdiendo. El primer paso es registrarlo." — then CTA to register.

---

## 3. CONTENT PLAN — Next 20 Posts

### Prioritisation logic

1. **Low difficulty first** — a fresh domain cannot compete for high-difficulty terms yet. Build authority on easy wins.
2. **Long-tail specific** — better to rank #2 for "ai trading journal" than #80 for "trading journal"
3. **Build clusters, not isolated posts** — every new post must link to existing posts
4. **Bilingual in parallel** — when publishing an ES post, publish the EN adaptation simultaneously. Not a word-for-word translation — adapted content with different examples and phrasing.
5. **Commercial intent posts come after informational** — you need domain authority before Google trusts your commercial comparisons

---

### WEEK 1 — Already live (optimise before adding new content)

| # | Title | Lang | Target Keyword | Difficulty | Min Words |
|---|---|---|---|---|---|
| E1 | Cómo llevar un diario de trading efectivo | ES | diario de trading | Medium | 1,800 |
| E2 | Qué es el FOMO trading y cómo evitarlo | ES | FOMO trading | Low | 1,400 |
| E3 | Las métricas de trading que todo trader debe conocer | ES | métricas trading | Low | 2,200 |
| E4 | Por qué el 80% de los traders pierden dinero | ES | por qué pierden traders | Medium | 1,600 |

**Do not publish new posts before applying the audit fixes above.** Four well-optimised posts outperform eight mediocre ones on a new domain.

---

### MONTH 1 — Foundation building

| # | Title | Lang | Target Keyword | Difficulty | Words | Cluster |
|---|---|---|---|---|---|---|
| 5 | How to Keep a Trading Journal That Actually Works | EN | how to keep a trading journal | Low | 1,800 | Journal |
| 6 | What Is Revenge Trading and How to Stop It | EN | revenge trading | Low | 1,400 | Psychology |
| 7 | Qué es el revenge trading y cómo detectarlo | ES | revenge trading qué es | Very Low | 1,200 | Psychology |
| 8 | Cómo calcular el ratio riesgo-beneficio en trading | ES | ratio riesgo beneficio trading | Low | 1,400 | Performance |
| 9 | Trading Journal Template: What to Include in Every Trade | EN | trading journal template | Medium | 1,600 | Journal |
| 10 | Why Do Traders Lose Money? (The Real Reasons, With Data) | EN | why do traders lose money | Low | 1,800 | Psychology |

---

### MONTH 2 — Cluster expansion + commercial intent

| # | Title | Lang | Target Keyword | Difficulty | Words | Cluster |
|---|---|---|---|---|---|---|
| 11 | AI Trading Journal: How AI Analyses Your Trading Behaviour | EN | AI trading journal | Very Low | 1,600 | AI Tools |
| 12 | Cómo usar la IA para analizar tus operaciones de trading | ES | IA para traders | Very Low | 1,400 | AI Tools |
| 13 | Trading Drawdown Explained: How to Track and Recover | EN | trading drawdown explained | Low | 1,400 | Performance |
| 14 | Qué es el drawdown máximo y cómo controlarlo | ES | drawdown trading | Low | 1,200 | Performance |
| 15 | The Best Free Trading Journal Apps in 2025 | EN | free trading journal app | Medium | 2,000 | Journal |
| 16 | Cómo analizar tus operaciones perdedoras sin perder la cabeza | ES | analizar operaciones perdedoras | Very Low | 1,400 | Performance |

---

### MONTH 3 — Authority content + comparison posts

| # | Title | Lang | Target Keyword | Difficulty | Words | Cluster |
|---|---|---|---|---|---|---|
| 17 | Edgewonk Alternative: A Free Trading Journal with AI Analysis | EN | edgewonk alternative | Low | 1,800 | AI Tools |
| 18 | Win Rate en Trading: Qué es y por qué no lo es todo | ES | win rate trading | Low | 1,200 | Performance |
| 19 | How to Analyse Your Trading Mistakes (Step-by-Step) | EN | how to analyze trading mistakes | Very Low | 1,600 | Performance |
| 20 | Diario de trading para crypto: qué registrar y cómo | ES | diario trading crypto | Very Low | 1,200 | Journal |
| 21 | Trading Journal for Forex Traders: What's Different | EN | trading journal for forex | Low | 1,400 | Journal |
| 22 | Trading Psychology: The Mental Edge of Profitable Traders | EN | trading psychology | High | 2,500 | Psychology |
| 23 | The Complete Guide to Trading Journals (2025) | EN | trading journal (pillar) | High | 3,500 | Journal |
| 24 | Guía completa del diario de trading | ES | diario de trading (pilar) | Medium | 3,000 | Journal |

**Note on posts 22–24:** These are pillar / high-difficulty content. Don't attempt them until you have 15+ posts published and GSC is showing ranking signals for the cluster keywords. Publish the long-tail posts first, build topical authority, then attack the pillar.

---

## 4. CONTENT CLUSTERS

The 24 posts form 4 topic clusters. Each cluster has a pillar page that links to all posts in the cluster. Posts within a cluster also cross-link to each other.

**Why clusters matter for a new domain:** Google establishes topical authority by seeing a site cover a topic deeply across multiple related pages — not just one long post. The internal linking structure signals which page is the most important (the pillar) and how topics relate.

---

### Cluster 1 — TRADING JOURNAL

**Pillar ES:** Post 24 — "Guía completa del diario de trading"  
**Pillar EN:** Post 23 — "The Complete Guide to Trading Journals (2025)"

Posts in cluster: E1 · 5 · 9 · 15 · 20 · 21 · 23 · 24

```
Pillar 23/24 ──► E1, 5, 9, 15, 20, 21 (all cluster posts)
E1  ──► 9 (template), E3 (metrics), E2 (FOMO)
5   ──► 9, 15, 11 (AI journal)
9   ──► E1, 5, E3
15  ──► 5, 9, 11, 23
20  ──► E1, 5, 21
21  ──► 5, 20, 9
```

---

### Cluster 2 — TRADING PSYCHOLOGY

**Pillar EN:** Post 22 — "Trading Psychology: The Mental Edge"  
**Pillar ES:** Future post (Month 4)

Posts in cluster: E2 · E4 · 6 · 7 · 10 · 22

```
Pillar 22 ──► E2, E4, 6, 7, 10
E2 ──► 7, E4, 6
E4 ──► E2, 6, 7, 10
6  ──► E2, 7, E4
7  ──► 6, E2, E4
10 ──► E4, 6, 22
```

---

### Cluster 3 — TRADING PERFORMANCE

**Pillar:** Future post (Month 3–4) — "The Complete Trading Metrics Guide"

Posts in cluster: E3 · 8 · 13 · 14 · 16 · 18 · 19

```
E3 ──► 8, 13, 14, 18
8  ──► E3, 14, 18
13 ──► 14, E3, 19
14 ──► 13, E3, 8
16 ──► 19, E3, 13
18 ──► E3, 8, 19
19 ──► 16, E3, 13
```

---

### Cluster 4 — AI TRADING TOOLS

**Pillar:** Future post — "AI for Traders: How Behavioural Analysis Changes Everything"

Posts in cluster: 11 · 12 · 17

```
11 ──► 12 (ES equivalent), 5, 15
12 ──► 11 (EN equivalent), E1, 8
17 ──► 11, 15
```

---

### Internal linking rules

1. **Minimum links per post:** 800–1,200 words → 2 links · 1,200–2,000 words → 3 links · Pillar pages → link to every post in the cluster
2. **Anchor text must be descriptive and natural.** "cómo llevar un diario de trading" ✅ — "haz click aquí" ❌
3. **Vary anchor text** — don't use the exact same phrase every time you link to the same post
4. **Links go in the body of the post,** not only in a "related posts" section at the bottom
5. **Never force a link.** If it doesn't fit naturally in the prose, don't add it

---

## 5. TECHNICAL SEO

### 5.1 What Next.js handles automatically

- **Server-side rendering** — pages rendered on the server, fully readable by Googlebot without JavaScript execution ✅
- **Static generation for blog posts** — with `generateStaticParams`, each post compiles to static HTML at build time ✅
- **`next/image`** — automatic WebP conversion, lazy loading, responsive sizes ✅
- **Code splitting** — each page loads only the JS it needs ✅
- **Prefetching** — `next/link` prefetches linked pages on hover ✅

---

### 5.2 What needs manual implementation

#### sitemap.xml

Verify it exists at `https://tradalyst.com/sitemap.xml`. If not, implement via `app/sitemap.ts`:

```ts
// app/sitemap.ts
import { MetadataRoute } from 'next'

async function getAllPosts(lang: 'es' | 'en') {
  // Read from your markdown directory
  // Return array of { slug, date }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const esPosts = await getAllPosts('es')
  const enPosts = await getAllPosts('en')

  const esPostUrls = esPosts.map(post => ({
    url: `https://tradalyst.com/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const enPostUrls = enPosts.map(post => ({
    url: `https://tradalyst.com/en/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    { url: 'https://tradalyst.com',                priority: 1.0, changeFrequency: 'weekly' },
    { url: 'https://tradalyst.com/en',             priority: 1.0, changeFrequency: 'weekly' },
    { url: 'https://tradalyst.com/precios',        priority: 0.9, changeFrequency: 'monthly' },
    { url: 'https://tradalyst.com/funcionalidades',priority: 0.8, changeFrequency: 'monthly' },
    { url: 'https://tradalyst.com/blog',           priority: 0.8, changeFrequency: 'daily' },
    { url: 'https://tradalyst.com/en/blog',        priority: 0.8, changeFrequency: 'daily' },
    { url: 'https://tradalyst.com/sobre-nosotros', priority: 0.4, changeFrequency: 'yearly' },
    ...esPostUrls,
    ...enPostUrls,
  ]
}
```

---

#### robots.txt

```ts
// app/robots.ts
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: 'https://tradalyst.com/sitemap.xml',
  }
}
```

`app.tradalyst.com` is already a separate subdomain — Googlebot won't touch it from the marketing site's robots.txt. No action needed there.

---

#### Canonical URLs — handling ES/EN content

```ts
// In generateMetadata() for each blog post
export async function generateMetadata({ params }): Promise<Metadata> {
  const isEnglish = /* your i18n routing logic */

  return {
    alternates: {
      canonical: isEnglish
        ? `https://tradalyst.com/en/blog/${params.slug}`
        : `https://tradalyst.com/blog/${params.slug}`,
      languages: {
        'es': `https://tradalyst.com/blog/${params.esSlug}`,
        'en': `https://tradalyst.com/en/blog/${params.enSlug}`,
        'x-default': `https://tradalyst.com/blog/${params.esSlug}`,
      },
    },
  }
}
```

**Rule:** ES canonical → points to itself. EN canonical → points to itself. Neither points to the other as "the original". The `hreflang` relationship handles the cross-language connection separately from canonical.

---

#### hreflang validation

Next.js generates hreflang tags automatically from `alternates.languages`. Verify the output HTML contains:

```html
<link rel="alternate" hreflang="es" href="https://tradalyst.com/blog/diario-de-trading" />
<link rel="alternate" hreflang="en" href="https://tradalyst.com/en/blog/trading-journal" />
<link rel="alternate" hreflang="x-default" href="https://tradalyst.com/blog/diario-de-trading" />
```

**Validate:** [Aleyda Solís hreflang tool](https://www.aleydasolis.com/english/international-seo-tools/hreflang-tags-generator/)

**Common mistake:** If a post exists in ES but the EN version isn't written yet, do not include the EN hreflang tag. Never point hreflang at a missing page — GSC flags it as an error and may discard all hreflang on the site.

---

#### Meta descriptions

Must be unique per page. Never inherit from `layout.tsx`. Verify every page overrides `description` in `generateMetadata`. 

**Bug to check:** if your root `layout.tsx` has a fallback `metadata.description`, any page that doesn't explicitly override it will share the same meta description. Google flags this.

---

#### Open Graph tags

Every blog post needs:

```ts
openGraph: {
  type: 'article',
  title: 'Post title',
  description: 'Post description (~120 chars)',
  url: 'https://tradalyst.com/blog/slug',
  siteName: 'Tradalyst',
  publishedTime: '2025-01-15T00:00:00Z',
  images: [{ url: 'https://tradalyst.com/og/slug.png', width: 1200, height: 630 }],
  locale: 'es_ES', // or 'en_US'
},
twitter: {
  card: 'summary_large_image',
  title: 'Post title',
  description: 'Post description',
  images: ['https://tradalyst.com/og/slug.png'],
},
```

**OG images:** Generate dynamically using Next.js `ImageResponse` via `app/og/route.tsx`. Auto-generates a branded 1200×630 image for every post without manual Figma work.

---

#### Schema markup

**Article schema** — every blog post:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Cómo llevar un diario de trading efectivo",
  "description": "Meta description text",
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-15",
  "author": { "@type": "Organization", "name": "Tradalyst" },
  "publisher": {
    "@type": "Organization",
    "name": "Tradalyst",
    "logo": { "@type": "ImageObject", "url": "https://tradalyst.com/logo.png" }
  },
  "mainEntityOfPage": "https://tradalyst.com/blog/diario-de-trading",
  "inLanguage": "es"
}
```

**FAQPage schema** — every post with a FAQ section:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "¿Qué es un diario de trading?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Un diario de trading es un registro sistemático de cada operación — precio de entrada, salida, razonamiento, estado emocional y resultado. Sirve para identificar patrones de comportamiento y corregirlos."
    }
  }]
}
```

**SoftwareApplication schema** — homepage and pricing page only:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Tradalyst",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "description": "Diario de trading con análisis de comportamiento por inteligencia artificial",
  "offers": [
    { "@type": "Offer", "price": "0", "priceCurrency": "EUR", "name": "Free" },
    { "@type": "Offer", "price": "9.99", "priceCurrency": "EUR", "name": "Pro", "billingDuration": "P1M" }
  ]
}
```

**Validate all schema:** [search.google.com/test/rich-results](https://search.google.com/test/rich-results)

---

#### Core Web Vitals — Next.js on Hetzner

| Metric | Target | Action |
|---|---|---|
| LCP | < 2.5s | Add `priority` prop to hero `next/image`. Blog posts are static — no issue if images are properly sized. |
| CLS | < 0.1 | Always declare `width` and `height` on every `next/image`. Use `next/font` for IBM Plex — eliminates font-swap shift. |
| INP | < 200ms | Blog posts are nearly 100% static HTML — no issue. |

**Font loading** — use `next/font/google`, not a `<link>` tag. Most impactful single CLS fix:

```ts
// app/layout.tsx
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})
```

**Cloudflare caching:** Ensure Cloudflare caches `/_next/static/*` with TTL ≥ 1 year. These assets have content hashes in filenames — stale cache is never an issue, and the performance gain is significant.

---

## 6. ON-PAGE SEO RULES

These rules are mandatory for every blog post. Claude Code must follow them without exception.

---

### Title tag formula

```
[Primary keyword] — [Benefit or hook] | Tradalyst
```

Hard limits: **50–60 characters**. Count every character including spaces and `| Tradalyst`.

```
Diario de Trading: Cómo Llevarlo y Mejorar | Tradalyst        ← 54 chars ✅
FOMO Trading: Qué Es y Cómo Evitarlo | Tradalyst              ← 50 chars ✅
AI Trading Journal: Analyse Your Behaviour | Tradalyst        ← 55 chars ✅
Cómo Llevar un Diario de Trading Efectivo para Principiantes | Tradalyst  ← 72 chars ❌
```

Primary keyword must appear in the first 30 characters where possible.

---

### Meta description formula

```
[Problem or question the reader has] + [What they'll get] + [Implicit CTA].
```

Hard limits: **140–160 characters**. Anything over 160 is truncated in SERPs.

```
¿Sigues repitiendo los mismos errores en trading? Un diario bien llevado es la primera herramienta para detectarlos. Guía práctica con ejemplos.  ← 149 chars ✅

Learn why 80% of traders lose money — and what the profitable ones do differently. Data-backed breakdown with actionable fixes.  ← 128 chars ✅
```

Rules: must contain primary keyword or close variant · never repeat the title tag · use second person (tú / you) · no quotes inside (can break in parsers) · every page needs a unique description.

---

### H1 / H2 / H3 structure

**H1:** One per page. Contains primary keyword. Can differ slightly from title tag — title tag is for Google, H1 is for readers. Max 70 characters.

**H2:** 4–7 per post. Each H2 should contain a keyword or direct question. Someone reading only the H2s should understand the post structure. At least 2 H2s must contain the primary keyword or semantic variant.

**H3:** Optional. Use sparingly. Never use H3 where H2 would do.

**Skeleton for a 1,800-word post:**
```
H1: [Primary keyword in first 3 words]
  Intro paragraph (150–200 words, keyword in first 100)
H2: [Section 1 — defines the problem]
H2: [Section 2 — why it matters]
H2: [Section 3 — practical method / solution]
  [MID-ARTICLE CTA BLOCK — not a heading]
H2: [Section 4 — examples or deeper detail]
H2: [Section 5 — common mistakes]
H2: Preguntas frecuentes / Frequently Asked Questions
  H3: ¿Question 1?
  H3: ¿Question 2?
  H3: ¿Question 3?
H2: Conclusión / Conclusion
  [END CTA]
```

---

### Keyword placement

| Location | Rule |
|---|---|
| Title tag | Primary keyword — mandatory |
| Meta description | Primary keyword or close variant — mandatory |
| H1 | Primary keyword — mandatory |
| First 100 words | Primary keyword at least once |
| H2 headings | At least 2 H2s contain primary keyword or semantic variant |
| Body text density | 1–1.5% (in 1,800 words: ~18–27 natural mentions) |
| Image alt text | At least 1 image with primary keyword in alt text |
| URL slug | Primary keyword, no stop words |

**Golden rule:** if it sounds forced when read aloud, don't write it. Google reads for naturalness. Keyword stuffing actively hurts rankings.

---

### Word count minimums

| Post type | Minimum |
|---|---|
| Definition / "what is" post | 1,200 words |
| How-to / guide post | 1,600 words |
| List / comparison post | 1,800 words |
| Pillar page / complete guide | 3,000 words |

Minimums, not targets. Write as long as the content needs — no padding.

---

### Internal links

- 800–1,200 word posts: minimum 2 internal links
- 1,200–2,000 word posts: minimum 3 internal links
- Pillar pages: link to every post in the cluster

Anchor text: descriptive and varied. "cómo llevar un diario de trading" ✅ — "este artículo" ❌ — "haz click aquí" ❌

---

### External links

- Only when the link adds genuine credibility (ESMA data, academic study, official regulator source)
- Maximum 2–3 external links per post
- Always `target="_blank" rel="noopener noreferrer"`
- Never link to direct competitors
- Acceptable sources: ESMA, financial regulators, academic papers, Investopedia (definitions only)

---

### Image alt text formula

```
[Description of what the image shows] — [contextual keyword]
```

```
Ejemplo de entrada en un diario de trading digital — Tradalyst  ✅
Gráfico de ratio riesgo-beneficio para una operación EUR/USD     ✅
image001.jpg                                                     ❌
```

Every image needs alt text. No two images in the same post should have identical alt text.

---

### URL slug rules

- Lowercase only · hyphens not underscores · no accented characters · no stop words unless part of the keyword
- ES slugs for ES posts, EN slugs for EN posts
- **Never change a slug after publishing** without a 301 redirect — breaks external links and loses ranking

```
/blog/diario-de-trading               ✅
/blog/fomo-trading                    ✅
/blog/metricas-trading                ✅  (no accent in slug)
/en/blog/trading-journal              ✅
/en/blog/how-to-keep-trading-journal  ✅
```

---

### CTA placement

- **Mid-article CTA:** between the 3rd and 4th H2 (roughly the post midpoint). Visually distinct block — light background, border, slightly offset from post body. Text: *"¿Quieres analizar tus propias operaciones?"* → *"Empieza gratis"* → `/registro`
- **End CTA:** after conclusion, before related posts. Can use the tagline: *"El diario que detecta lo que tú no ves."*
- **Maximum 2 CTAs per post.** Never place a CTA after every H2.

---

### Reading level target

- **Spanish:** Flesch-Kincaid grade 8–10. Short sentences. Paragraphs of maximum 4 lines. Explain every piece of jargon on first use.
- **English:** Same. The reader is a retail trader, not a finance academic.
- **Practical rule:** if a sentence exceeds 25 words, split it into two.

---

## 7. BLOG POST MARKDOWN TEMPLATE

Every blog post must use exactly this frontmatter and content structure. This is the spec Claude Code follows for all blog content generation and optimisation.

```markdown
---
title: "Cómo Llevar un Diario de Trading Efectivo"
seoTitle: "Diario de Trading: Cómo Llevarlo y Mejorar | Tradalyst"
# seoTitle = the <title> tag. Max 60 chars.
# title = the H1. Can be longer and more readable.
# If seoTitle is omitted, title is used for both.

description: "Un diario de trading bien llevado es la herramienta más infravalorada del trader retail. Guía práctica con plantilla y ejemplos reales."
# Max 160 chars. Must be unique. Must contain primary keyword.

date: "2025-01-15"
lastModified: "2025-01-15"
# Always update lastModified when you make content changes.

author: "Tradalyst"

category: "journal"
# Allowed values: journal | psychology | performance | ai-tools

keywords:
  - "diario de trading"
  - "cómo llevar un diario de trading"
  - "registro de operaciones trading"
# First keyword = primary. Rest = secondary/semantic variants.

readTime: 8
# Estimated minutes: word count / 200, rounded.

lang: "es"
# Values: es | en

hreflang:
  es: "/blog/diario-de-trading"
  en: "/en/blog/trading-journal"
# Only include a language if that version of the post exists.
# Never point hreflang at a missing URL.

featuredImage: "/images/blog/diario-de-trading.webp"
featuredImageAlt: "Ejemplo de entrada en un diario de trading — Tradalyst"
---

<!--
  INTRO — no H2 tag, flows directly from H1
  150–200 words
  Primary keyword in the first 100 words
  Hook in the first two sentences — state the problem directly
-->

Un **diario de trading** es la herramienta más infravalorada que existe para mejorar como trader. La mayoría de los traders que pierden dinero tienen algo en común: no registran sus operaciones con suficiente detalle para aprender de ellas.

[Continue intro — what problem does this post solve? What will the reader get? No "en este artículo veremos...". Just write it directly.]

---

## [H2 — Define the core problem or concept]

[200–300 words. Short paragraphs. One idea per paragraph.]

---

## [H2 — Explain why it matters / what's at stake]

[200–300 words.]

---

## [H2 — The practical method or solution]

[200–300 words.]

<!-- MID-ARTICLE CTA — rendered as a visually distinct block by the MDX component -->
<BlogCta
  heading="¿Quieres que la IA analice tus operaciones automáticamente?"
  buttonText="Empieza gratis"
  href="/registro"
/>

---

## [H2 — Examples or practical application]

[200–300 words.]

---

## [H2 — Common mistakes or what to avoid]

[150–200 words — optional, use if it adds real value]

---

## Preguntas frecuentes

<!--
  3–5 questions targeting PAA boxes.
  Each answer: 40–70 words. Complete. No preamble.
  Write as standalone answers — someone reading only the answer 
  must understand it without needing the question for context.
-->

### ¿Qué es un diario de trading?

Un diario de trading es un registro sistemático de cada operación que realizas — precio de entrada, salida, razonamiento, estado emocional y resultado. Su función es identificar patrones de comportamiento repetidos: qué haces bien, qué haces mal, y en qué condiciones cometes más errores.

### ¿Para qué sirve el diario de trading?

[40–70 word answer.]

### ¿Qué debo apuntar en cada operación?

[40–70 word answer.]

---

## Conclusión

<!--
  2–3 paragraphs.
  Synthesise — don't repeat everything.
  Primary keyword appears naturally at least once.
-->

[Key takeaway in one or two sentences.]

[What the reader should do next — bridge to the CTA.]

<!-- END CTA -->
<BlogCta
  heading="El diario que detecta lo que tú no ves."
  buttonText="Probar Tradalyst gratis"
  href="/registro"
/>

---

## Artículos relacionados

- [Qué es el FOMO trading y cómo evitarlo](/blog/fomo-trading)
- [Las métricas de trading que todo trader debe conocer](/blog/metricas-trading)
- [Por qué el 80% de los traders pierden dinero](/blog/por-que-pierden-traders)
```

---

### Template implementation notes

**`seoTitle` vs `title`:** Two separate fields with different purposes. `seoTitle` → `<title>` tag (max 60 chars, keyword-first). `title` → H1 on the page (can be longer and more readable). Always populate both.

**`lastModified`:** Update every time you make meaningful content changes. The sitemap reads this field and signals Google to recrawl. A post updated 6 months later can recover lost rankings.

**`hreflang`:** Only add a language entry if that version exists. Pointing hreflang at a missing page is an error GSC reports and can cause Google to ignore all hreflang on the site.

**`<BlogCta />`:** Custom MDX component — implement in `components/blog/BlogCta.tsx`. The mid-article CTA should only render if the post word count exceeds 1,000 words — short posts don't need the interruption.

**`category`:** Drives cluster logic in the "related posts" component. That component should pull from the same category automatically, supplemented by the manually listed links.

---

## 8. GOOGLE SEARCH CONSOLE SETUP

### Step 1 — Verify tradalyst.com via Cloudflare

1. Go to [search.google.com/search-console](https://search.google.com/search-console) → Add property → **"Domain"** (not "URL prefix")
2. Enter `tradalyst.com` — no `www`, no `https://`
3. Google provides a TXT record: `google-site-verification=XXXXXXXXXXXX`
4. In Cloudflare dashboard → DNS → Add record:
   - Type: `TXT` · Name: `@` · Content: the verification string · TTL: Auto
5. Back in GSC → Verify. With Cloudflare, propagation is usually instant.

**Why Domain property:** covers `tradalyst.com`, `www.tradalyst.com`, `http://`, `https://`, all subdomains — in a single view. URL prefix requires separate properties for each variation. Always use Domain.

**Do not add** `app.tradalyst.com` or `api.tradalyst.com`. The app must not be indexed.

---

### Step 2 — Submit sitemap

GSC → Sitemaps → Enter `https://tradalyst.com/sitemap.xml` → Submit

Status changes to "Success" within 24–48 hours. GSC will show Discovered URLs vs Indexed URLs — they'll diverge initially, which is normal.

---

### Step 3 — Request indexing for individual URLs

On launch day, manually request indexing — don't wait for the sitemap crawl:

**Priority order:**
1. `https://tradalyst.com/`
2. `https://tradalyst.com/precios`
3. `https://tradalyst.com/blog`
4. All 4 blog posts (ES)
5. `https://tradalyst.com/en/`
6. All 4 blog posts (EN)

GSC limits manual requests to ~10–12 per day. Spread across 2 days if needed.

---

### Step 4 — What to monitor in the first 30 days

| What | Where in GSC | What you're looking for |
|---|---|---|
| Indexing status | Coverage → Valid | Number grows each week |
| Crawl errors | Coverage → Errors | Should be zero |
| First impressions | Performance → Queries | Impressions start appearing before clicks |
| Core Web Vitals | Experience | All pages green |
| hreflang errors | Internationalisation | Zero errors |
| Sitemap status | Sitemaps | "Success" not "Couldn't fetch" |

**Realistic timeline:** Fresh domain with quality content — pages start appearing in GSC Performance data (impressions) within 2–4 weeks. First actual rankings for low-difficulty keywords begin at 4–8 weeks. Don't panic before 8 weeks.

---

### Step 5 — ES and EN in GSC

**One Domain property covers both.** `tradalyst.com` includes all paths including `/en/`.

To filter by language in GSC: Performance → Add filter → Page → Contains → `/en/` → shows only EN performance. Remove the filter to see everything combined. No separate property needed.

---

## 9. QUICK WINS — First 7 Days

### Day 1

1. **Verify GSC.** Nothing else matters until this is done.
2. **Submit the sitemap.** `https://tradalyst.com/sitemap.xml` → Sitemaps.
3. **Verify the sitemap is valid.** Open it in a browser — should return XML with all URLs. If it's a 404, fix it before submitting.
4. **Request indexing** for homepage, precios, blog, and all 4 posts (ES + EN) — ~10 URLs.
5. **Validate hreflang** at [Aleyda Solís's tool](https://www.aleydasolis.com/english/international-seo-tools/hreflang-tags-generator/). Fix any errors before Google crawls them.
6. **Validate schema** at [Rich Results Test](https://search.google.com/test/rich-results). Test homepage (SoftwareApplication) and one blog post (Article + FAQPage).

---

### Days 2–7

7. **Run PageSpeed Insights** on the homepage and one blog post at [pagespeed.web.dev](https://pagespeed.web.dev). Target: 90+ mobile and desktop. Fix any LCP or CLS issues.
8. **Optimise the 4 existing posts** per Section 6:
   - Title tags ≤ 60 chars, keyword in first 30
   - Meta descriptions ≤ 160 chars, unique, contains keyword
   - Keyword appears in first 100 words
   - FAQ sections present with 40–70 word answers
   - Minimum internal links in place
9. **Check robots.txt** at `https://tradalyst.com/robots.txt`. Should allow all crawling, include sitemap URL.
10. **Set up Bing Webmaster Tools** at [bing.com/webmasters](https://www.bing.com/webmasters). Import from GSC — 2 minutes. Bing is ~7% of search in Spain. Free traffic.
11. **Verify no `noindex` tags** on indexable pages. Chrome → View Source → search "noindex". If it appears on any public page, remove immediately.

---

### What to avoid in the first 30 days

| Mistake | Problem | Prevention |
|---|---|---|
| Changing slugs after publishing | Breaks external links, loses ranking signal | Define final slugs before publishing. Lock them. |
| Publishing ES and EN posts with identical content | Google treats it as duplicate content | Adapt content — different examples, phrasing. Same topic, different article. |
| Pointing hreflang at a missing page | GSC errors; Google may discard all hreflang on site | Only add hreflang once both language versions exist |
| Leaving meta descriptions blank | Google writes its own — almost always worse | Every page needs a written, unique meta description |
| Publishing posts below word count minimums | Thin content — won't rank, may suppress other pages | Follow Section 6 minimums. If a post isn't ready, don't publish. |
| Buying backlinks or link schemes | Penalty risk | Earn links through genuinely useful content |
| Ignoring Core Web Vitals | CWV is a ranking signal | Fix before launch, not after traffic arrives |
| Submitting app.tradalyst.com to GSC | Googlebot hits login walls, reports errors | Keep the app subdomain completely out of GSC |

---

*Document version: 1.1*  
*Stack context: Next.js + Django + PostgreSQL · Cloudflare DNS · Hetzner VPS*  
*This document is the reference spec for Claude Code when generating and optimising all blog content*  
*Next review: 30 days post-launch — update Section 2 with actual GSC performance data*

---

## 10. BLOG POST IMAGE STRATEGY

### Why this matters for SEO specifically

Images affect three ranking signals directly: **page speed** (LCP), **crawlability** (alt text, structured filenames), and **image search traffic** (a secondary but real source of clicks for trading education content). Getting all three right on a fresh domain is one of the few areas where you can move fast and see measurable early results.

---

### next/image — check and fix this first

Before anything else, verify whether your blog post MDX renderer is using `next/image` or native `<img>` tags. Open any live blog post, right-click an image → Inspect — if you see a plain `<img>` tag with no `srcset` attribute, you are not using `next/image`.

**Why it matters:** `next/image` gives you automatic WebP conversion, lazy loading, responsive `srcset`, and prevents the layout shift that kills your LCP score. A native `<img>` tag does none of that.

**The fix — custom MDX image component:**

```tsx
// components/blog/MdxImage.tsx
import Image from 'next/image'

interface MdxImageProps {
  src: string
  alt: string
  width?: number
  height?: number
}

export function MdxImage({ src, alt, width = 800, height = 450 }: MdxImageProps) {
  return (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-auto"
        // No priority here — body images are below the fold.
        // Reserve priority={true} for featuredImage only.
      />
      {alt && (
        <figcaption className="mt-2 text-center text-sm text-muted font-mono">
          {alt}
        </figcaption>
      )}
    </figure>
  )
}
```

```tsx
// In your MDX provider / useMDXComponents
import { MdxImage } from '@/components/blog/MdxImage'

export function useMDXComponents(components) {
  return {
    img: (props) => <MdxImage {...props} />,
    ...components,
  }
}
```

The `featuredImage` (hero at the top of each post) is the one exception — it gets `priority={true}` because it's above the fold and directly determines LCP.

---

### Image types for blog posts

#### Custom graphics — SVGs, charts, diagrams (preferred)

These are the best images for SEO and brand consistency. Google can read SVG content, they're resolution-independent, and they load faster than any raster format. On a fresh domain where you can't yet rank for competitive web search terms, a well-labelled custom graphic can drive Image Search clicks you'd never get otherwise.

**What to produce as custom graphics:**
- Metric formula breakdowns (e.g. a visual showing how expectancy is calculated step by step)
- Process flow diagrams ("how a journal entry becomes an AI insight")
- Comparison layouts (Tradalyst vs competitors rendered as styled HTML, not a screenshot)
- Chart examples — a realistic but fictional P&L curve, a win rate bar chart, a heatmap
- The "before/after" concept — a vague spreadsheet entry vs a complete Tradalyst entry

**Format decision per use case:**

| Use case | Format | Reason |
|---|---|---|
| Static diagram, decorative | SVG in `/public/images/blog/` | Tiny file, resolution-independent, indexed by Google |
| Data visualisation, complex | React component inline in MDX | No image at all — faster, accessible, Googlebot-readable |
| Process flow with icons | SVG or React component | Same as above |

When a graphic can be a React component inside MDX, make it a component. No image request, no alt text needed, fully semantic.

#### Stock photos — Unsplash, Pexels (use sparingly)

Stock photos add almost no SEO value on their own — they're indexed on thousands of higher-authority sites, so you will never rank for them in Image Search. Use them only where a custom graphic isn't feasible.

**When stock photos are acceptable:**
- Featured image for a post (gives the blog index card a visual)
- Contextual section breaks (trader at a screen, chart on a monitor)

**When to avoid stock photos:**
- Never as the primary educational image in a post — replace with a custom graphic
- Never where the content could be shown as data or a diagram instead

**Stock photo handling rules:**
- **Download the file — never hotlink.** Hotlinking breaks when the source removes the image and you lose the asset permanently.
- **Convert to WebP** before adding to the repo. Use `cwebp` (CLI) or [Squoosh](https://squoosh.app) (browser). Target: under 150KB.
- **Rename using the project naming convention** — never keep the Unsplash filename (`photo-1234567890.jpg`).
- **Check the license explicitly.** Unsplash and Pexels are free for commercial use, but some images have attribution requirements.

---

### File naming convention

Every image file must follow this pattern — filenames are a minor but real ranking signal in Google Image Search:

```
/public/images/blog/[post-slug]-[descriptor]-[number].[ext]

Examples:
/public/images/blog/diario-de-trading-ejemplo-entrada-01.webp
/public/images/blog/diario-de-trading-plantilla-completa-02.webp
/public/images/blog/fomo-trading-diagrama-decision-01.webp
/public/images/blog/metricas-trading-formula-expectancy-01.webp
/public/images/blog/metricas-trading-tabla-resumen-02.webp
/public/images/blog/por-que-pierden-traders-estadistica-esma-01.webp
```

Rules:
- Lowercase only · hyphens not underscores · no accented characters
- Post slug first — groups all assets for a post together in the filesystem
- Descriptor is 2–4 words describing what the image shows — not generic ("imagen", "foto")
- Sequential number at the end for multiple images in the same post

---

### Image sizing and performance targets

| Image type | Max dimensions | Max file size | Format |
|---|---|---|---|
| Featured image (hero) | 1200 × 630px | 120KB | WebP |
| In-body diagram / graphic | 800 × 450px | 80KB | WebP or SVG |
| In-body stock photo | 800 × 500px | 100KB | WebP |
| OG image (social share) | 1200 × 630px | 200KB | PNG |

**Why these limits:** Cloudflare caches static assets at the edge after the first request, but the first load — which is what Google's crawler and PageSpeed Insights measure — hits your Hetzner server directly. Staying within these limits keeps LCP under 2.5s on a cold cache.

**OG images** are a special case — they're never loaded in the page itself, only fetched by social platforms and crawlers when a URL is shared. PNG is fine, file size ceiling is looser.

---

### Alt text — full rules

The formula from Section 6 applied to real examples across both image types:

```
// Custom graphic
alt="Fórmula del ratio riesgo-beneficio explicada paso a paso"
alt="Diagrama de flujo de una operación registrada en diario de trading"
alt="Ejemplo de entrada completa en un diario de trading — Tradalyst"
alt="Gráfico de curva de P&L acumulada para un trader de forex"

// Stock photo
alt="Trader analizando gráficos de trading en pantalla"
alt="Gráfico de velas japonesas para operación en EUR/USD"

// Never write these
alt="imagen"
alt="foto"
alt="trading"
alt=""    ← empty alt on a content image is an accessibility violation
```

**The decorative image exception:** images that are purely visual with no informational content — a stock photo used only as a section break, for example — should have `alt=""` intentionally. This tells screen readers to skip them. A decorative image with a non-empty alt text creates noise for screen reader users. A diagram explaining a formula is never decorative.

---

### How many images per post

| Post length | Images |
|---|---|
| ~1,200 words | 1–2 (featured + 1 in-body) |
| 1,600–1,800 words | 2–3 (featured + 1–2 in-body) |
| 2,000–2,500 words | 3–4 |
| Pillar (3,000+ words) | 4–6 |

More is not better. Every image that isn't genuinely useful adds page weight and distraction. The brand rule already covers this: data is the visual. A well-formatted table or inline React component is better than a generic stock photo inserted to break up text.

---

### Google Image Search — worth caring about?

For trading education content: yes, moderately. Searches like "trading journal example", "risk reward ratio diagram", and "trading metrics explained" return image results prominently in both English and Spanish. A well-labelled custom graphic targeting a low-competition keyword can drive Image Search clicks that you'd never get from web search on a fresh domain.

The compound effect matters: Image Search click → page visit → time on page → signals to Google the page is useful → improves web search ranking for the same keyword. It's a secondary flywheel, but it's real and it costs nothing extra if you're already producing the graphics.
