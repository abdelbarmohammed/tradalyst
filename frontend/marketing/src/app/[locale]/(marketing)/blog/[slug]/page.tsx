import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { APP_URL } from "@/lib/urls";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const esPosts = getAllPosts("es").map((p) => ({ locale: "es", slug: p.slug }));
  const enPosts = getAllPosts("en").map((p) => ({ locale: "en", slug: p.slug }));
  return [...esPosts, ...enPosts];
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) return {};
  return { title: `${post.title} — Tradalyst`, description: post.excerpt };
}

async function markdownToHtml(md: string): Promise<string> {
  const result = await remark().use(remarkHtml).process(md);
  return result.toString();
}

export default async function BlogPost({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });
  const html = await markdownToHtml(post.content);
  const allPosts = getAllPosts(locale);
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="bg-light min-h-screen">
      <section className="py-16 lg:py-24 border-b border-black/[0.08]">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <Link
            href="/blog"
            className="font-mono text-[10px] text-text-muted hover:text-text transition-colors duration-150 mb-8 inline-block"
          >
            {t("backToBlog")}
          </Link>
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-green">{post.category}</span>
            <span className="text-text-muted text-[10px]">·</span>
            <span className="font-mono text-[9px] text-text-muted">{post.readTime}</span>
          </div>
          <h1 className="font-sans text-[32px] lg:text-[40px] font-bold text-text leading-[1.1] tracking-[-0.02em] mb-5">
            {post.title}
          </h1>
          <p className="font-sans text-[16px] text-text-secondary leading-relaxed mb-8">{post.excerpt}</p>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-dark2 flex items-center justify-center">
              <span className="font-mono text-[8px] text-text-dark-primary">ET</span>
            </div>
            <div>
              <p className="font-sans text-[12px] font-semibold text-text leading-none">{post.author}</p>
              <p className="font-mono text-[10px] text-text-muted mt-[2px]">
                {new Date(post.date).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="max-w-[720px] mx-auto px-6 lg:px-10">
          <div className="prose-tradalyst" dangerouslySetInnerHTML={{ __html: html }} />

          <div className="my-12 p-7 bg-dark border border-green/20">
            <p className="font-sans text-[15px] font-semibold text-text-dark-primary mb-2">
              {locale === "en" ? "Want to analyse your own trades?" : "¿Quieres analizar tus propias operaciones?"}
            </p>
            <p className="font-sans text-[13px] text-text-dark-secondary mb-5 leading-relaxed">
              {locale === "en"
                ? "Tradalyst detects patterns in your history — FOMO, revenge trading, overtrading — and shows them with real data."
                : "Tradalyst detecta los patrones de tu historial — FOMO, revenge trading, sobreoperar — y te los muestra con datos reales."}
            </p>
            <a
              href={`${APP_URL}/registro`}
              className="inline-block font-sans text-sm font-semibold bg-green hover:bg-green-hover text-white px-5 py-[10px] rounded transition-colors duration-150"
            >
              {locale === "en" ? "Start free" : "Empezar gratis"}
            </a>
          </div>
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
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-green block mb-2">{p.category}</span>
                  <p className="font-sans text-[13px] font-semibold text-text leading-snug group-hover:text-green transition-colors duration-150">
                    {p.title}
                  </p>
                  <span className="font-mono text-[9px] text-text-muted mt-3 block">{p.readTime}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
