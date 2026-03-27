import type { CategoryConfig, NpmTrend } from "../types.js";

async function fetchDownloads(
  pkg: string,
  period: string
): Promise<number> {
  const url = `https://api.npmjs.org/downloads/point/${period}/${pkg}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return 0;
    const data = (await res.json()) as { downloads: number };
    return data.downloads;
  } catch {
    return 0;
  }
}

export async function collectNpmTrends(
  config: CategoryConfig
): Promise<NpmTrend[]> {
  const source = config.sources.core?.npm;
  if (!source) return [];

  const { packages, alert_threshold } = source;

  const now = new Date();

  // this week: last 7 days
  const thisEnd = new Date(now);
  thisEnd.setDate(thisEnd.getDate() - 1);
  const thisStart = new Date(thisEnd);
  thisStart.setDate(thisStart.getDate() - 6);

  // last week: 7 days before that
  const lastEnd = new Date(thisStart);
  lastEnd.setDate(lastEnd.getDate() - 1);
  const lastStart = new Date(lastEnd);
  lastStart.setDate(lastStart.getDate() - 6);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const thisWeekPeriod = `${fmt(thisStart)}:${fmt(thisEnd)}`;
  const lastWeekPeriod = `${fmt(lastStart)}:${fmt(lastEnd)}`;

  const results: NpmTrend[] = [];

  const fetches = packages.map(async (pkg) => {
    const [thisWeek, lastWeek] = await Promise.all([
      fetchDownloads(pkg, thisWeekPeriod),
      fetchDownloads(pkg, lastWeekPeriod),
    ]);

    if (lastWeek === 0) return null;

    const changePct = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);

    return {
      package: pkg,
      last_week: lastWeek,
      this_week: thisWeek,
      change_pct: changePct,
    };
  });

  const all = await Promise.all(fetches);

  for (const item of all) {
    if (item) results.push(item);
  }

  // sort by absolute change percentage descending
  results.sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct));

  return results;
}
