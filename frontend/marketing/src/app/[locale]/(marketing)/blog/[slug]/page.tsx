import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import BlogCta from "@/components/blog/BlogCta";
import PnlCurveChart from "@/components/blog/charts/PnlCurveChart";
import EmotionWinRateChart from "@/components/blog/charts/EmotionWinRateChart";
import RiskRewardDiagram from "@/components/blog/charts/RiskRewardDiagram";
import MetricsTable from "@/components/blog/charts/MetricsTable";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const esPosts = getAllPosts("es").map((p) => ({ locale: "es", slug: p.slug }));
  const enPosts = getAllPosts("en").map((p) => ({ locale: "en", slug: p.slug }));
  return [...esPosts, ...enPosts];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) return {};

  const canonical =
    locale === "en"
      ? `https://tradalyst.com/en/blog/${slug}`
      : `https://tradalyst.com/blog/${slug}`;

  const languages: Record<string, string> = {};
  if (post.hreflang.es) languages["es"] = `https://tradalyst.com${post.hreflang.es}`;
  if (post.hreflang.en) languages["en"] = `https://tradalyst.com${post.hreflang.en}`;
  if (post.hreflang.es) languages["x-default"] = `https://tradalyst.com${post.hreflang.es}`;

  const ogImageUrl = `https://tradalyst.com/og?title=${encodeURIComponent(post.seoTitle || post.title)}&category=${encodeURIComponent(post.category)}`;

  return {
    title: post.seoTitle || post.title,
    description: post.description || post.excerpt,
    keywords: post.keywords,
    alternates: {
      canonical,
      languages: Object.keys(languages).length > 0 ? languages : undefined,
    },
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description: post.description || post.excerpt,
      url: canonical,
      siteName: "Tradalyst",
      publishedTime: new Date(post.date).toISOString(),
      modifiedTime: post.lastModified ? new Date(post.lastModified).toISOString() : undefined,
      locale: locale === "en" ? "en_US" : "es_ES",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.description || post.excerpt,
      images: [ogImageUrl],
    },
  };
}

// ─── Component tag parsing ────────────────────────────────────────────────────

type ComponentName =
  | "BlogCta"
  | "PnlCurveChart"
  | "EmotionWinRateChart"
  | "RiskRewardDiagram"
  | "MetricsTable";

interface ParsedComponent {
  name: ComponentName;
  props: Record<string, string>;
}

type Segment =
  | { type: "html"; html: string }
  | { type: "component"; component: ParsedComponent };

const COMPONENT_RE =
  /<(BlogCta|PnlCurveChart|EmotionWinRateChart|RiskRewardDiagram|MetricsTable)\s*([^/]*)\s*\/>/g;

function parseProps(raw: string): Record<string, string> {
  const props: Record<string, string> = {};
  const attrRe = /(\w+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(raw)) !== null) {
    props[m[1]] = m[2];
  }
  return props;
}

async function splitMarkdown(md: string): Promise<Segment[]> {
  const segments: Segment[] = [];
  let lastIndex = 0;
  const re = new RegExp(COMPONENT_RE.source, "g");
  let match: RegExpExecArray | null;

  while ((match = re.exec(md)) !== null) {
    const before = md.slice(lastIndex, match.index);
    if (before.trim()) {
      const result = await remark().use(remarkHtml).process(before);
      segments.push({ type: "html", html: result.toString() });
    }
    segments.push({
      type: "component",
      component: {
        name: match[1] as ComponentName,
        props: parseProps(match[2] ?? ""),
      },
    });
    lastIndex = match.index + match[0].length;
  }

  const tail = md.slice(lastIndex);
  if (tail.trim()) {
    const result = await remark().use(remarkHtml).process(tail);
    segments.push({ type: "html", html: result.toString() });
  }

  return segments;
}

function wordCount(md: string): number {
  return md.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
}

// ─── Schema helpers ───────────────────────────────────────────────────────────

function buildArticleSchema(post: Awaited<ReturnType<typeof getPostBySlug>>, canonical: string) {
  if (!post) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description || post.excerpt,
    datePublished: post.date,
    dateModified: post.lastModified || post.date,
    author: { "@type": "Organization", name: "Tradalyst" },
    publisher: {
      "@type": "Organization",
      name: "Tradalyst",
      logo: { "@type": "ImageObject", url: "https://tradalyst.com/logo.png" },
    },
    mainEntityOfPage: canonical,
    inLanguage: post.lang || "es",
  };
}

function extractFaqSchema(html: string) {
  const questions: Array<{ name: string; text: string }> = [];
  const h3Re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = h3Re.exec(html)) !== null) {
    const name = m[1].replace(/<[^>]+>/g, "").trim();
    const text = m[2].replace(/<[^>]+>/g, "").trim();
    if (name && text) questions.push({ name, text });
  }
  if (questions.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.name,
      acceptedAnswer: { "@type": "Answer", text: q.text },
    })),
  };
}

// ─── Component renderer ───────────────────────────────────────────────────────

function renderComponent(
  c: ParsedComponent,
  locale: string,
  wc: number
): React.ReactNode {
  switch (c.name) {
    case "BlogCta":
      return (
        <BlogCta
          heading={c.props.heading ?? ""}
          buttonText={c.props.buttonText ?? ""}
          href={c.props.href ?? "/registro"}
          wordCount={wc}
        />
      );
    case "PnlCurveChart":
      return (
        <PnlCurveChart
          variant={(c.props.variant as "positive" | "revenge") ?? "positive"}
          lang={locale}
        />
      );
    case "EmotionWinRateChart":
      return <EmotionWinRateChart lang={locale} />;
    case "RiskRewardDiagram":
      return <RiskRewardDiagram lang={locale} />;
    case "MetricsTable":
      return <MetricsTable lang={locale} />;
    default:
      return null;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPost({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });

  const wc = wordCount(post.content);
  const segments = await splitMarkdown(post.content);

  const allPosts = getAllPosts(locale);
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const canonical =
    locale === "en"
      ? `https://tradalyst.com/en/blog/${slug}`
      : `https://tradalyst.com/blog/${slug}`;

  const articleSchema = buildArticleSchema(post, canonical);

  const fullHtml = segments
    .filter((s): s is { type: "html"; html: string } => s.type === "html")
    .map((s) => s.html)
    .join("\n");
  const faqSchema = extractFaqSchema(fullHtml);

  return (
    <div className="bg-light min-h-screen">
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <section className="py-16 lg:py-24 border-b border-black/[0.08]">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <Link
            href="/blog"
            className="font-mono text-[10px] text-text-muted hover:text-text transition-colors duration-150 mb-8 inline-block"
          >
            {t("backToBlog")}
          </Link>
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-green">
              {post.category}
            </span>
            <span className="text-text-muted text-[10px]">·</span>
            <span className="font-mono text-[9px] text-text-muted">{post.readTime}</span>
          </div>
          <h1 className="font-sans text-[32px] lg:text-[40px] font-bold text-text leading-[1.1] tracking-[-0.02em] mb-5">
            {post.title}
          </h1>
          <p className="font-sans text-[16px] text-text-secondary leading-relaxed mb-8">
            {post.description || post.excerpt}
          </p>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-dark2 flex items-center justify-center">
              <span className="font-mono text-[8px] text-text-dark-primary">ET</span>
            </div>
            <div>
              <p className="font-sans text-[12px] font-semibold text-text leading-none">
                {post.author}
              </p>
              <p className="font-mono text-[10px] text-text-muted mt-[2px]">
                {new Date(post.date).toLocaleDateString(
                  locale === "en" ? "en-GB" : "es-ES",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          {segments.map((seg, i) =>
            seg.type === "html" ? (
              <div
                key={i}
                className="prose-tradalyst"
                dangerouslySetInnerHTML={{ __html: seg.html }}
              />
            ) : (
              <div key={i}>{renderComponent(seg.component, locale, wc)}</div>
            )
          )}

          <BlogCta
            heading={
              locale === "en"
                ? "The journal that spots what you can't see."
                : "El diario que detecta lo que tú no ves."
            }
            buttonText={locale === "en" ? "Try Tradalyst free" : "Probar Tradalyst gratis"}
            href="/registro"
          />
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-12 lg:py-16 border-t border-black/[0.08]">
          <div className="max-w-[720px] mx-auto px-6 lg:px-10">
            <h2 className="font-sans text-[20px] font-bold text-text tracking-[-0.01em] mb-8">
              {t("relatedPosts")}
            </h2>
            <div className="grid sm:grid-cols-3 gap-px bg-black/[0.06]">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="bg-white p-5 group hover:-translate-y-[2px] hover:shadow-sm transition-all duration-200 block"
                >
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-green block mb-2">
                    {p.category}
                  </span>
                  <p className="font-sans text-[13px] font-semibold text-text leading-snug group-hover:text-green transition-colors duration-150">
                    {p.title}
                  </p>
                  <span className="font-mono text-[9px] text-text-muted mt-3 block">
                    {p.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
