import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getAllPosts } from "@/lib/blog";

const CATEGORIES = ["all", "journal", "psychology", "performance", "risk"] as const;
type Category = (typeof CATEGORIES)[number];

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return { title: t("title"), description: t("description") };
}

export default async function BlogIndex({ params, searchParams }: Props) {
  const { locale } = await params;
  const { category } = await searchParams;
  const t = await getTranslations({ locale, namespace: "blog" });
  const allPosts = getAllPosts(locale);

  const activeCategory: Category =
    category && (CATEGORIES as readonly string[]).includes(category)
      ? (category as Category)
      : "all";

  const featured = allPosts[0];
  const rest = allPosts.slice(1);
  const filtered =
    activeCategory === "all"
      ? rest
      : rest.filter((p) => p.category === activeCategory);

  const dateFormatter = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale === "en" ? "en-GB" : "es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="bg-light min-h-screen">
      {/* Hero */}
      <section className="py-20 lg:py-28 border-b border-black/[0.08]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left */}
            <div>
              <p className="eyebrow mb-4">{t("eyebrow")}</p>
              <h1 className="font-sans text-[40px] lg:text-[52px] font-bold text-text leading-[1.05] tracking-[-0.02em]">
                {t("heading")}
              </h1>
              <p className="font-sans text-[16px] text-text-secondary mt-4 leading-relaxed max-w-[420px]">
                {t("subheading")}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-3 mt-6 flex-wrap">
                <span className="font-mono text-[10px] text-text-muted">
                  {t("stats.articles", { count: allPosts.length })}
                </span>
                <span className="text-text-muted/50 text-[10px]">·</span>
                <span className="font-mono text-[10px] text-text-muted">{t("stats.languages")}</span>
                <span className="text-text-muted/50 text-[10px]">·</span>
                <span className="font-mono text-[10px] text-green">{t("stats.free")}</span>
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-2 mt-5">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={cat === "all" ? "/blog" : `/blog?category=${cat}`}
                    className={`font-mono text-[10px] px-[10px] py-[5px] border transition-colors duration-150 ${
                      activeCategory === cat
                        ? "border-green bg-green/10 text-green"
                        : "border-black/[0.12] text-text-muted hover:text-text hover:border-black/[0.25]"
                    }`}
                  >
                    {t(`categories.${cat}`)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: featured latest post */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="group block">
                {featured.featuredImage ? (
                  <div className="relative aspect-[16/9] overflow-hidden mb-5">
                    <Image
                      src={featured.featuredImage}
                      alt={featured.featuredImageAlt || featured.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 560px"
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      priority
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-black/[0.06] mb-5" />
                )}

                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-green mb-2">
                  {t("featuredPost")} · {featured.category}
                </p>
                <h2 className="font-sans text-[22px] font-semibold text-text leading-snug tracking-[-0.01em] mb-3 group-hover:text-green transition-colors duration-150">
                  {featured.title}
                </h2>
                <p className="font-sans text-[13px] text-text-secondary leading-relaxed line-clamp-2">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <span className="font-mono text-[10px] text-text-muted">{dateFormatter(featured.date)}</span>
                  <span className="font-mono text-[10px] text-text-muted">·</span>
                  <span className="font-mono text-[10px] text-text-muted">{featured.readTime}</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {filtered.length === 0 ? (
            <p className="font-sans text-[15px] text-text-muted text-center py-12">
              {t("categories.all")}
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black/[0.06]">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="bg-white group hover:-translate-y-[2px] hover:shadow-md transition-all duration-200 block"
                >
                  {post.featuredImage ? (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.featuredImageAlt || post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-black/[0.06]" />
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-green">
                        {post.category}
                      </span>
                      <span className="font-mono text-[9px] text-text-muted">{post.readTime}</span>
                    </div>

                    <h2 className="font-sans text-[16px] font-semibold text-text leading-snug tracking-[-0.01em] mb-2 group-hover:text-green transition-colors duration-150 line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="font-sans text-[13px] text-text-secondary leading-relaxed mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-text-muted">
                        {dateFormatter(post.date)}
                      </span>
                      <span className="font-mono text-[11px] text-green opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        {t("readMore")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
