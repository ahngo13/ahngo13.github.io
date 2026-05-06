import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPostsByPlatform,
  getEffectivePlatform,
  type AppPlatform,
} from "@/lib/posts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const PLATFORM_META: Record<AppPlatform, { label: string; emoji: string; desc: string }> = {
  android: {
    label: "안드로이드",
    emoji: "🤖",
    desc: "Google Play Store에 출시된 앱 글 모음",
  },
  ios: {
    label: "iOS",
    emoji: "🍎",
    desc: "App Store에 출시된 앱 글 모음",
  },
};

interface PageProps {
  params: Promise<{ platform: string }>;
}

export function generateStaticParams() {
  return [{ platform: "android" }, { platform: "ios" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { platform } = await params;
  if (platform !== "android" && platform !== "ios") return {};
  const meta = PLATFORM_META[platform as AppPlatform];
  return {
    title: `${meta.label} 앱`,
    description: meta.desc,
  };
}

export default async function PlatformPage({ params }: PageProps) {
  const { platform } = await params;
  if (platform !== "android" && platform !== "ios") notFound();

  const meta = PLATFORM_META[platform as AppPlatform];
  const posts = getPostsByPlatform(platform as AppPlatform);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <p className="text-sm text-muted-foreground">플랫폼</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {meta.emoji} {meta.label}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {posts.length}개의 글 — {meta.desc}
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">아직 글이 없습니다.</p>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => {
            const p = getEffectivePlatform(post);
            const pMeta = PLATFORM_META[p];
            return (
              <Link key={post.slug} href={`/posts/${post.slug}`} className="block">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-1">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      <span>·</span>
                      <Badge variant="outline" className="font-normal">
                        {pMeta.emoji} {pMeta.label}
                      </Badge>
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
            );
          })}
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-border">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← 홈으로
        </Link>
      </div>
    </div>
  );
}

export const dynamicParams = false;
