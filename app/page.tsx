import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <section className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {siteConfig.name}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {siteConfig.description}
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
          최신 글
        </h2>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">아직 글이 없습니다.</p>
        ) : (
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
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
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
        )}
      </section>

      <section className="mt-16 rounded-lg border border-border bg-muted/30 p-6">
        <p className="text-sm text-muted-foreground">
          앱의 공식 스펙시트·다운로드 링크는{" "}
          <a
            href={siteConfig.sisterSite.appsBaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-700 hover:underline"
          >
            {siteConfig.sisterSite.name}
          </a>
          에서 확인할 수 있습니다.{" "}
          <a
            href={siteConfig.sisterSite.appsBaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-700 hover:underline"
          >
            앱 공식 페이지 →
          </a>
        </p>
      </section>
    </div>
  );
}
