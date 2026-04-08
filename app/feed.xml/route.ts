import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

// Next.js 15 App Router with `output: 'export'` supports route handlers that
// opt into static generation via `dynamic = 'force-static'`. The route is
// invoked at build time and the result is written to `out/feed.xml`.
export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = getAllPosts().slice(0, 20);
  const now = new Date().toUTCString();

  const items = posts
    .map((p) => {
      const url = `${siteConfig.url}/posts/${p.slug}/`;
      const pubDate = new Date(p.date).toUTCString();
      const categories = p.tags
        .map((t) => `<category>${escapeXml(t)}</category>`)
        .join("");
      return `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${p.summary ?? ""}]]></description>
      <author>noreply@ahngo13.github.io (${escapeXml(siteConfig.author)})</author>
      ${categories}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>ko-KR</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
