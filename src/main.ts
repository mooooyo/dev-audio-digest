import "dotenv/config";
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";
import { loadAllCategories } from "./category-loader.js";
import { collectGitHubReleases } from "./collectors/github.js";
import { collectChromeBlog } from "./collectors/chrome-blog.js";
import { collectHackerNews } from "./collectors/hackernews.js";
import { collectGitHubTrending } from "./collectors/github-trending.js";
import { summarize } from "./summarizer.js";
import type { CollectResult } from "./types.js";

const ROOT = join(import.meta.dirname, "..");
const DATA_DIR = join(ROOT, "data");
const POSTS_DIR = join(ROOT, "_posts");

async function main() {
  const categories = loadAllCategories();
  const today = new Date().toISOString().slice(0, 10);
  const dayDir = join(DATA_DIR, today);
  mkdirSync(dayDir, { recursive: true });
  mkdirSync(POSTS_DIR, { recursive: true });

  for (const category of categories) {
    // 1. collect
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

    const data: CollectResult = {
      category: category.name,
      collected_at: new Date().toISOString(),
      github_releases: releases,
      chrome_blog: chromeBlog,
      hackernews: hn,
      trending: trending,
    };

    const dataPath = join(dayDir, `${category.name}.json`);
    writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");

    const total = releases.length + chromeBlog.length + hn.length + trending.length;
    if (total === 0) {
      console.log(`  -> nothing collected, skipping summary`);
      continue;
    }

    // 2. summarize
    if (category.output === "text") {
      console.log(`  summarizing with Groq...`);
      const markdown = await summarize(category, data);

      if (markdown.trim().length === 0) {
        console.log(`  -> empty summary, skipping`);
        continue;
      }

      const frontmatter = [
        "---",
        "layout: post",
        `title: "${today} ${category.name} 뉴스 정리"`,
        `date: ${today}`,
        `categories: ${category.name}`,
        "---",
        "",
      ].join("\n");

      const postPath = join(POSTS_DIR, `${today}-${category.name}.md`);
      writeFileSync(postPath, frontmatter + markdown, "utf-8");
      console.log(`  post saved: ${postPath}`);
    }
  }

  console.log("\ndone!");
}

main().catch(console.error);
