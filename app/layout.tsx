import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [{ name: siteConfig.author, url: siteConfig.github }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight text-lg hover:text-emerald-700">
              {siteConfig.name}
            </Link>
            <nav className="flex items-center gap-5 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <Link href="/about" className="hover:text-foreground">About</Link>
              <a
                href={siteConfig.sisterSite.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-700"
              >
                Apps ↗
              </a>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border mt-16">
          <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-muted-foreground flex flex-col gap-2 sm:flex-row sm:justify-between">
            <p>© {new Date().getFullYear()} {siteConfig.author}</p>
            <div className="flex gap-4">
              <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                GitHub
              </a>
              <a href={siteConfig.sisterSite.url} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700">
                앱 공식 페이지 →
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
