import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${siteConfig.author} 소개`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">About</h1>

      <div className="prose-blog mt-8">
        <p>
          안녕하세요. <strong>{siteConfig.author}</strong>입니다.
          Play Store에 여러 개의 개인 프로젝트 앱을 출시·운영하고 있습니다.
        </p>

        <p>
          이 블로그는 출시 소식, 개발 노트, 앱을 만들며 배운 것들을 기록하는
          공간입니다. 앱의 공식 스펙시트와 다운로드 링크는{" "}
          <a href={siteConfig.sisterSite.url} target="_blank" rel="noopener noreferrer">
            {siteConfig.sisterSite.name}
          </a>
          에서 확인할 수 있습니다.
        </p>

        <h2>링크</h2>
        <ul>
          <li>
            GitHub:{" "}
            <a href={siteConfig.github} target="_blank" rel="noopener noreferrer">
              {siteConfig.github}
            </a>
          </li>
          <li>
            앱 카탈로그:{" "}
            <a href={siteConfig.sisterSite.url} target="_blank" rel="noopener noreferrer">
              {siteConfig.sisterSite.url}
            </a>
          </li>
        </ul>
      </div>

      <div className="mt-12 pt-6 border-t border-border">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← 홈으로
        </Link>
      </div>
    </div>
  );
}
