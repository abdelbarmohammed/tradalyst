import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const esPosts = getAllPosts("es");
  const enPosts = getAllPosts("en");

  const esPostUrls: MetadataRoute.Sitemap = esPosts.map((post) => ({
    url: `https://tradalyst.com/blog/${post.slug}`,
    lastModified: new Date(post.lastModified || post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const enPostUrls: MetadataRoute.Sitemap = enPosts.map((post) => ({
    url: `https://tradalyst.com/en/blog/${post.slug}`,
    lastModified: new Date(post.lastModified || post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    { url: "https://tradalyst.com", priority: 1.0, changeFrequency: "weekly" },
    { url: "https://tradalyst.com/en", priority: 1.0, changeFrequency: "weekly" },
    { url: "https://tradalyst.com/precios", priority: 0.9, changeFrequency: "monthly" },
    { url: "https://tradalyst.com/funcionalidades", priority: 0.8, changeFrequency: "monthly" },
    { url: "https://tradalyst.com/blog", priority: 0.8, changeFrequency: "daily" },
    { url: "https://tradalyst.com/en/blog", priority: 0.8, changeFrequency: "daily" },
    { url: "https://tradalyst.com/sobre-nosotros", priority: 0.4, changeFrequency: "yearly" },
    ...esPostUrls,
    ...enPostUrls,
  ];
}
