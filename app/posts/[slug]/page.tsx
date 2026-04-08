import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  estimateWordCount,
  getAllPosts,
  getPostBySlug,
  getPostSlugs,
  getPrevNextPosts,
  getRelatedPosts,
} from "@/lib/posts";
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

  const postUrl = `${siteConfig.url}/posts/${post.slug}/`;
  const ogImages = post.coverImage
    ? [{ url: post.coverImage, alt: post.title }]
    : [{ url: "/og-default.png", width: 1200, height: 630, alt: post.title }];

  return {
    title: post.title,
    description: post.summary ?? undefined,
    keywords: post.tags,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary ?? undefined,
      url: postUrl,
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [siteConfig.author],
      tags: post.tags,
      images: ogImages,
      siteName: siteConfig.name,
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary ?? undefined,
      images: post.coverImage ? [post.coverImage] : ["/og-default.png"],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const minutes = readingTime(post.rawContent);
  const wordCount = estimateWordCount(post.rawContent);
  const relatedAppUrl = post.appSlug ? appUrl(post.appSlug) : null;
  const related = getRelatedPosts(post.slug, 3);
  const { prev, next } = getPrevNextPosts(post.slug);

  const postUrl = `${siteConfig.url}/posts/${post.slug}/`;
  const imageForSchema = post.coverImage ?? `${siteConfig.url}/og-default.png`;

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
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/og-default.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    image: imageForSchema,
    keywords: post.tags.join(", "),
    wordCount,
    inLanguage: "ko-KR",
    articleSection: post.type === "release" ? "App Release" : "Development Notes",
    url: postUrl,
    ...(post.appSlug
      ? {
          about: {
            "@type": "SoftwareApplication",
            name: post.appSlug,
            operatingSystem: "Android",
            url: appUrl(post.appSlug),
          },
        }
      : {}),
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

      {related.length > 0 && (
        <section className="mt-14 pt-6 border-t border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            관련 글
          </h2>
          <ul className="space-y-4">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/posts/${r.slug}/`} className="group block">
                  <p className="font-medium group-hover:text-emerald-700 transition-colors">
                    {r.title}
                  </p>
                  {r.summary && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {r.summary}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(prev || next) && (
        <nav
          aria-label="포스트 네비게이션"
          className="mt-10 pt-6 border-t border-border grid grid-cols-2 gap-4"
        >
          {next && (
            <Link href={`/posts/${next.slug}/`} className="group">
              <p className="text-xs text-muted-foreground">← 이전 글</p>
              <p className="text-sm font-medium mt-1 group-hover:text-emerald-700 transition-colors line-clamp-2">
                {next.title}
              </p>
            </Link>
          )}
          {prev && (
            <Link
              href={`/posts/${prev.slug}/`}
              className={`group text-right ${next ? "" : "col-start-2"}`}
            >
              <p className="text-xs text-muted-foreground">다음 글 →</p>
              <p className="text-sm font-medium mt-1 group-hover:text-emerald-700 transition-colors line-clamp-2">
                {prev.title}
              </p>
            </Link>
          )}
        </nav>
      )}

      <div className="mt-12 pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          ← 모든 글 보기
        </Link>
        <span className="text-xs">{wordCount} words</span>
      </div>
    </article>
  );
}

export const dynamicParams = false;
