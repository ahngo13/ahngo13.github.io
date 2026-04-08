import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

export const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface PostFrontmatter {
  title: string;
  slug: string;
  date: string;
  appSlug?: string;
  type?: string;
  tags: string[];
  coverImage?: string;
  summary?: string;
}

export interface Post extends PostFrontmatter {
  content: string;
  rawContent: string;
}

function parseFile(filename: string): Post {
  const filePath = path.join(POSTS_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const slug = (data.slug as string) || filename.replace(/\.mdx?$/, "");

  return {
    title: (data.title as string) ?? slug,
    slug,
    date: (data.date as string) ?? new Date().toISOString(),
    appSlug: data.appSlug as string | undefined,
    type: data.type as string | undefined,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    coverImage: data.coverImage as string | undefined,
    summary: data.summary as string | undefined,
    content: "",
    rawContent: content,
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f));

  const posts = files.map(parseFile);
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}

export function getPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const all = getAllPosts();
  const post = all.find((p) => p.slug === slug);
  if (!post) return null;

  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypePrettyCode, {
      theme: "github-light",
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(post.rawContent);

  return { ...post, content: String(processed) };
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) tags.add(tag);
  }
  return Array.from(tags).sort();
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

/**
 * Rough word count estimate used for JSON-LD `wordCount` and reading time.
 * Counts whitespace-separated tokens, which works well enough for mixed
 * Korean/English content (Korean characters are counted per syllable group).
 */
export function estimateWordCount(text: string): number {
  if (!text) return 0;
  const stripped = text
    .replace(/```[\s\S]*?```/g, " ") // strip fenced code blocks
    .replace(/`[^`]+`/g, " ")         // strip inline code
    .replace(/[#*_>\[\]()!\-]/g, " ") // strip markdown syntax
    .trim();
  return stripped.split(/\s+/).filter(Boolean).length;
}

/**
 * Return posts related to the given slug, ranked by shared tags and appSlug.
 * Posts with the same `appSlug` get a large weight (10), common tags add 2 each.
 * Only posts with a positive score are returned.
 */
export function getRelatedPosts(currentSlug: string, limit: number = 3): Post[] {
  const all = getAllPosts();
  const current = all.find((p) => p.slug === currentSlug);
  if (!current) return [];

  const candidates = all.filter((p) => p.slug !== currentSlug);

  const scored = candidates.map((p) => {
    let score = 0;
    if (current.appSlug && p.appSlug === current.appSlug) score += 10;
    const commonTags = p.tags.filter((t) => current.tags.includes(t));
    score += commonTags.length * 2;
    return { post: p, score };
  });

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}

/**
 * Return the posts immediately before (newer) and after (older) the given slug
 * in the default date-descending sort order used by `getAllPosts()`.
 *
 * - `prev`: a more recent post (index - 1 in desc sort)
 * - `next`: an older post (index + 1 in desc sort)
 *
 * Returns `null` for either side when the current post is at the boundary.
 */
export function getPrevNextPosts(currentSlug: string): {
  prev: Post | null;
  next: Post | null;
} {
  const all = getAllPosts(); // already sorted desc by date
  const idx = all.findIndex((p) => p.slug === currentSlug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
