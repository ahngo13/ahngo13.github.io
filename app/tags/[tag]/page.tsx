import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded}`,
    description: `${decoded} 태그가 달린 글 목록`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);

  if (posts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <p className="text-sm text-muted-foreground">태그</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">#{decoded}</h1>
        <p className="mt-2 text-muted-foreground">{posts.length}개의 글</p>
      </header>

      <div className="space-y-5">
        {posts.map((post) => (
          <Link key={post.slug} href={`/posts/${post.slug}`} className="block">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-1">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  {post.tags.length > 0 && (
                    <>
                      <span>·</span>
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((t) => (
                          <Badge key={t} variant="secondary">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <CardTitle>{post.title}</CardTitle>
                {post.summary && (
                  <CardDescription className="pt-1 text-base text-muted-foreground">
                    {post.summary}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-border">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← 홈으로
        </Link>
      </div>
    </div>
  );
}

export const dynamicParams = false;
