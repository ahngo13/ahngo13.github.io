import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about/`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/posts/${post.slug}/`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const tagRoutes: MetadataRoute.Sitemap = getAllTags().map((tag) => ({
    url: `${base}/tags/${encodeURIComponent(tag)}/`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
