import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { loadAllCategories } from "./category-loader.js";
import { collectGitHubReleases } from "./collectors/github.js";
import { collectChromeBlog } from "./collectors/chrome-blog.js";
import { collectHackerNews } from "./collectors/hackernews.js";
import { collectGitHubTrending } from "./collectors/github-trending.js";
import type { CollectResult } from "./types.js";

const DATA_DIR = join(import.meta.dirname, "..", "data");

async function main() {
  const categories = loadAllCategories();
  const today = new Date().toISOString().slice(0, 10);
  const dayDir = join(DATA_DIR, today);
  mkdirSync(dayDir, { recursive: true });

  for (const category of categories) {
    console.log(`\n[${category.name}] collecting...`);

    const [releases, chromeBlog, hn, trending] = await Promise.all([
      collectGitHubReleases(category),
      collectChromeBlog(category),
      collectHackerNews(category),
      collectGitHubTrending(category),
    ]);

    console.log(`  GitHub releases: ${releases.length}`);
    console.log(`  Chrome blog: ${chromeBlog.length}`);
    console.log(`  Hacker News: ${hn.length}`);
    console.log(`  Trending repos: ${trending.length}`);

    const result: CollectResult = {
      category: category.name,
      collected_at: new Date().toISOString(),
      github_releases: releases,
      chrome_blog: chromeBlog,
      hackernews: hn,
      trending: trending,
    };

    const filepath = join(dayDir, `${category.name}.json`);
    writeFileSync(filepath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`  saved: ${filepath}`);

    const total = releases.length + chromeBlog.length + hn.length + trending.length;
    if (total === 0) {
      console.log(`  -> nothing collected`);
    }
  }

  console.log("\ncollection done!");
}

main().catch(console.error);
