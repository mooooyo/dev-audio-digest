import type { CategoryConfig, HNStory } from "../types.js";

const HN_API = "https://hacker-news.firebaseio.com/v0";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json() as Promise<T>;
}

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  descendants?: number;
  time: number;
  type: string;
}

export async function collectHackerNews(
  config: CategoryConfig
): Promise<HNStory[]> {
  const source = config.sources.secondary?.hackernews;
  if (!source) return [];

  try {
    const topIds = await fetchJSON<number[]>(`${HN_API}/topstories.json`);
    const top50 = topIds.slice(0, 50);

    const items = await Promise.all(
      top50.map((id) => fetchJSON<HNItem>(`${HN_API}/item/${id}.json`))
    );

    const keywords = source.keywords.map((k) => k.toLowerCase());
    const minScore = source.min_score;

    return items
      .filter((item) => {
        if (!item || item.type !== "story") return false;
        if (item.score < minScore) return false;
        const title = item.title.toLowerCase();
        const url = (item.url ?? "").toLowerCase();
        return keywords.some((kw) => title.includes(kw) || url.includes(kw));
      })
      .map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
        score: item.score,
        comments: item.descendants ?? 0,
        published_at: new Date(item.time * 1000).toISOString(),
      }));
  } catch (err) {
    console.error("[hackernews] collect failed:", (err as Error).message);
    return [];
  }
}
