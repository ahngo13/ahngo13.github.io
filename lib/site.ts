export const siteConfig = {
  name: "Aiden Ahn의 개발 블로그",
  description: "Play Store에 출시한 앱들의 소식과 후기",
  url: "https://ahngo13.github.io",
  author: "Aiden Ahn",
  github: "https://github.com/ahngo13",
  sisterSite: {
    name: "reactiveworks.dev",
    url: "https://reactiveworks.dev",
    appsBaseUrl: "https://reactiveworks.dev/apps",
  },
};

export function appUrl(appSlug: string): string {
  return `${siteConfig.sisterSite.appsBaseUrl}/${appSlug}`;
}
