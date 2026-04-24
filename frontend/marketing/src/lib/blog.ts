import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_BASE = path.join(process.cwd(), "src/content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  readTime: string;
  author: string;
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
      return {
        slug,
        title: data.title ?? "",
        date: data.date ?? "",
        excerpt: data.excerpt ?? "",
        category: data.category ?? "",
        readTime: data.readTime ?? "5 min",
        author: data.author ?? "Equipo Tradalyst",
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
  return {
    slug,
    title: data.title ?? "",
    date: data.date ?? "",
    excerpt: data.excerpt ?? "",
    category: data.category ?? "",
    readTime: data.readTime ?? "5 min",
    author: data.author ?? "Equipo Tradalyst",
    content,
  };
}
