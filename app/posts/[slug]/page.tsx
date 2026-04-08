import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPosts, getPostBySlug, getPostSlugs } from "@/lib/posts";
import { Badge } from "@/components/ui/badge";
import { formatDate, readingTime } from "@/lib/utils";
import { siteConfig, appUrl } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getAllPosts().find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.summary ?? undefined,
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary ?? undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const minutes = readingTime(post.rawContent);
  const relatedAppUrl = post.appSlug ? appUrl(post.appSlug) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: siteConfig.author,
      url: siteConfig.github,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/posts/${post.slug}/`,
    },
    image: post.coverImage,
    keywords: post.tags.join(", "),
  };

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>·</span>
          <span>{minutes}분 읽기</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>

        {post.summary && (
          <p className="mt-4 text-lg text-muted-foreground">{post.summary}</p>
        )}

        {post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                <Badge variant="secondary">#{tag}</Badge>
              </Link>
            ))}
          </div>
        )}
      </header>

      <div
        className="prose-blog"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {relatedAppUrl && (
        <aside className="mt-14 rounded-lg border border-border bg-accent/40 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            관련 앱
          </h2>
          <p className="text-base">
            이 글에서 다룬 앱의 공식 스펙·다운로드 링크를 확인하세요.
          </p>
          <a
            href={relatedAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-medium text-emerald-700 hover:underline"
          >
            {post.appSlug} 공식 페이지 →
          </a>
        </aside>
      )}

      <div className="mt-12 pt-6 border-t border-border">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← 모든 글 보기
        </Link>
      </div>
    </article>
  );
}

export const dynamicParams = false;
