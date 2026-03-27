import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { loadAllCategories } from "./category-loader.js";
import { collectGitHubReleases } from "./collectors/github.js";
import type { CollectResult } from "./types.js";

const DATA_DIR = join(import.meta.dirname, "..", "data");

async function main() {
  const categories = loadAllCategories();
  const today = new Date().toISOString().slice(0, 10);
  const dayDir = join(DATA_DIR, today);
  mkdirSync(dayDir, { recursive: true });

  for (const category of categories) {
    console.log(`\n[${category.name}] collecting...`);

    const releases = await collectGitHubReleases(category);
    console.log(`  GitHub releases: ${releases.length}`);

    const result: CollectResult = {
      category: category.name,
      collected_at: new Date().toISOString(),
      github_releases: releases,
    };

    const filename = category.name.toLowerCase().replace(/[^a-z]/g, "") + ".json";
    const filepath = join(dayDir, filename);
    writeFileSync(filepath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`  saved: ${filepath}`);

    if (releases.length === 0) {
      console.log(`  -> no new releases in the last 24 hours`);
    } else {
      for (const r of releases) {
        console.log(`  -> ${r.repo} ${r.tag} (${r.prerelease ? "pre" : "stable"})`);
      }
    }
  }

  console.log("\ncollection done!");
}

main().catch(console.error);
