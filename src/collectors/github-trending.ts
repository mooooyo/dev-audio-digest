import { Octokit } from "@octokit/rest";
import type { CategoryConfig, TrendingRepo } from "../types.js";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function fetchReadme(fullName: string): Promise<string> {
  const [owner, repo] = fullName.split("/");
  try {
    const { data } = await octokit.repos.getReadme({ owner, repo });
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return content.slice(0, 1000); // first 1000 chars
  } catch {
    return "";
  }
}

export async function collectGitHubTrending(
  config: CategoryConfig
): Promise<TrendingRepo[]> {
  const source = config.sources.core?.github_trending;
  if (!source) return [];

  const { language, since } = source;
  const url = `https://github.com/trending/${language}?since=${since}`;

  try {
    const res = await fetch(url);
    const html = await res.text();

    const repos: TrendingRepo[] = [];
    const articles = html.split('<article class="Box-row">').slice(1);

    for (const article of articles.slice(0, 10)) {
      const ownerMatch = article.match(
        /class="text-normal">\s*([^<]+?)\s*\/\s*<\/span>\s*([\s\S]*?)<\/a>/
      );
      if (!ownerMatch) continue;

      const owner = ownerMatch[1].trim();
      const name = ownerMatch[2].replace(/<[^>]*>/g, "").trim();
      const fullName = `${owner}/${name}`;

      const descMatch = article.match(
        /<p class="col-9[^"]*">\s*([\s\S]*?)\s*<\/p>/
      );
      const description = descMatch
        ? descMatch[1].replace(/<[^>]*>/g, "").trim()
        : "";

      const starsMatch = article.match(
        /\/stargazers"[^>]*>[\s\S]*?([\d,]+)\s*<\/a>/
      );
      const stars = starsMatch
        ? parseInt(starsMatch[1].replace(/,/g, ""))
        : 0;

      const todayMatch = article.match(/([\d,]+)\s*stars\s*today/i);
      const starsToday = todayMatch
        ? parseInt(todayMatch[1].replace(/,/g, ""))
        : 0;

      const langMatch = article.match(
        /itemprop="programmingLanguage">([^<]+)</
      );

      repos.push({
        name: fullName,
        description,
        language: langMatch ? langMatch[1].trim() : language,
        stars,
        stars_today: starsToday,
        url: `https://github.com/${fullName}`,
        readme: "", // placeholder
      });
    }

    // fetch READMEs in parallel
    const readmes = await Promise.all(
      repos.map((r) => fetchReadme(r.name))
    );
    repos.forEach((r, i) => {
      r.readme = readmes[i];
    });

    return repos;
  } catch (err) {
    console.error(
      "[github-trending] collect failed:",
      (err as Error).message
    );
    return [];
  }
}
