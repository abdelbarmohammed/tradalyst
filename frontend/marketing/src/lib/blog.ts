import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_BASE = path.join(process.cwd(), "src/content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  seoTitle: string;
  date: string;
  lastModified: string;
  excerpt: string;
  description: string;
  category: string;
  readTime: string;
  author: string;
  keywords: string[];
  lang: string;
  hreflang: Record<string, string>;
  featuredImage: string;
  featuredImageAlt: string;
  content: string;
}

function blogDir(locale: string): string {
  const localePath = path.join(BLOG_BASE, locale);
  return fs.existsSync(localePath) ? localePath : BLOG_BASE;
}

export function getAllPosts(locale = "es"): Omit<BlogPost, "content">[] {
  const dir = blogDir(locale);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = matter(raw);
      const title = data.title ?? "";
      return {
        slug,
        title,
        seoTitle: data.seoTitle ?? title,
        date: data.date ?? "",
        lastModified: data.lastModified ?? data.date ?? "",
        excerpt: data.excerpt ?? "",
        description: data.description ?? data.excerpt ?? "",
        category: data.category ?? "",
        readTime: typeof data.readTime === "number" ? `${data.readTime} min` : (data.readTime ?? "5 min"),
        author: data.author ?? "Equipo Tradalyst",
        keywords: data.keywords ?? [],
        lang: data.lang ?? (locale === "en" ? "en" : "es"),
        hreflang: data.hreflang ?? {},
        featuredImage: data.featuredImage ?? "",
        featuredImageAlt: data.featuredImageAlt ?? "",
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string, locale = "es"): BlogPost | null {
  const dir = blogDir(locale);
  const filePath = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const title = data.title ?? "";
  return {
    slug,
    title,
    seoTitle: data.seoTitle ?? title,
    date: data.date ?? "",
    lastModified: data.lastModified ?? data.date ?? "",
    excerpt: data.excerpt ?? "",
    description: data.description ?? data.excerpt ?? "",
    category: data.category ?? "",
    readTime: typeof data.readTime === "number" ? `${data.readTime} min` : (data.readTime ?? "5 min"),
    author: data.author ?? "Equipo Tradalyst",
    keywords: data.keywords ?? [],
    lang: data.lang ?? (locale === "en" ? "en" : "es"),
    hreflang: data.hreflang ?? {},
    featuredImage: data.featuredImage ?? "",
    featuredImageAlt: data.featuredImageAlt ?? "",
    content,
  };
}
