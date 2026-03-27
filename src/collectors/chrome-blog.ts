import RSSParser from "rss-parser";
import type { CategoryConfig, RSSItem } from "../types.js";

const parser = new RSSParser();

export async function collectChromeBlog(
  config: CategoryConfig
): Promise<RSSItem[]> {
  const source = config.sources.core?.chrome_developers;
  if (!source) return [];

  try {
    const feed = await parser.parseURL(source.url);
    const since = new Date();
    since.setDate(since.getDate() - 1); // last 24 hours

    return (feed.items ?? [])
      .filter((item) => new Date(item.pubDate ?? "") >= since)
      .map((item) => ({
        title: item.title ?? "",
        link: item.link ?? "",
        published_at: item.pubDate ?? "",
        summary: (item.contentSnippet ?? "").slice(0, 500),
      }));
  } catch (err) {
    console.error("[chrome-blog] collect failed:", (err as Error).message);
    return [];
  }
}
