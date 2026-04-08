import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

/**
 * Give recent posts higher priority so Google crawls them more eagerly.
 * Decays from 1.0 (within a week) down to 0.4 (older than a year).
 */
function postPriority(postDate: Date): number {
  const days = (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24);
  if (days < 7) return 1.0;
  if (days < 30) return 0.9;
  if (days < 90) return 0.8;
  if (days < 365) return 0.6;
  return 0.4;
}

function postChangeFreq(postDate: Date): ChangeFreq {
  const days = (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24);
  if (days < 7) return "weekly";
  return "monthly";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about/`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const posts = getAllPosts();

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    const postDate = new Date(post.date);
    return {
      url: `${base}/posts/${post.slug}/`,
      lastModified: postDate,
      changeFrequency: postChangeFreq(postDate),
      priority: postPriority(postDate),
    };
  });

  // Use the most recent post date in each tag as the tag page's lastModified,
  // which gives Google a better signal than a static "now".
  const tagRoutes: MetadataRoute.Sitemap = getAllTags().map((tag) => {
    const latestForTag = posts
      .filter((p) => p.tags.includes(tag))
      .reduce<Date>((acc, p) => {
        const d = new Date(p.date);
        return d > acc ? d : acc;
      }, new Date(0));

    return {
      url: `${base}/tags/${encodeURIComponent(tag)}/`,
      lastModified: latestForTag.getTime() > 0 ? latestForTag : now,
      changeFrequency: "weekly",
      priority: 0.4,
    };
  });

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
