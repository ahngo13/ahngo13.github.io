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
