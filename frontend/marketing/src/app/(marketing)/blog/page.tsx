import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog — Tradalyst",
  description: "Artículos sobre trading, psicología y análisis de rendimiento.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="bg-light min-h-screen">
      {/* Header */}
      <section className="py-20 lg:py-28 border-b border-black/[0.08]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <p className="eyebrow mb-4">Blog</p>
          <h1 className="font-sans text-[40px] lg:text-[52px] font-bold text-text leading-[1.05] tracking-[-0.02em]">
            Aprende a operar mejor.
          </h1>
        </div>
      </section>

      {/* Post grid */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black/[0.06]">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white p-7 group hover:-translate-y-[2px] hover:shadow-md transition-all duration-200 block"
              >
                {/* Category + read time */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-green">
                    {post.category}
                  </span>
                  <span className="font-mono text-[9px] text-text-muted">
                    {post.readTime}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-sans text-[17px] font-semibold text-text leading-snug tracking-[-0.01em] mb-3 group-hover:text-green transition-colors duration-150">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="font-sans text-[13px] text-text-secondary leading-relaxed mb-5 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Date + arrow */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-text-muted">
                    {new Date(post.date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-mono text-[11px] text-green opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    Leer →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
