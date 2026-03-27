import { Octokit } from "@octokit/rest";
import type { CategoryConfig, BestOfJSProject } from "../types.js";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function collectBestOfJS(
  _config: CategoryConfig
): Promise<BestOfJSProject[]> {
  try {
    const res = await fetch("https://bestofjs.org/rankings/monthly");
    const html = await res.text();

    // extract unique project slug + github repo pairs
    const repoMatches = [
      ...html.matchAll(
        /github\.com\/([^"]+?)(?=" aria-label="GitHub repository)/g
      ),
    ];
    const slugMatches = [
      ...html.matchAll(/href="\/projects\/([^"]+)"/g),
    ];

    // dedupe slugs (each appears twice in the HTML)
    const seen = new Set<string>();
    const projects: { slug: string; repo: string }[] = [];

    const repos = repoMatches.map((m) => m[1]);
    let repoIdx = 0;

    for (const m of slugMatches) {
      const slug = m[1];
      if (seen.has(slug)) continue;
      seen.add(slug);
      if (repoIdx < repos.length) {
        projects.push({ slug, repo: repos[repoIdx] });
        repoIdx++;
      }
    }

    // take top 10, fetch descriptions from GitHub
    const top10 = projects.slice(0, 10);

    const results = await Promise.all(
      top10.map(async (p) => {
        const [owner, name] = p.repo.split("/");
        let description = "";
        try {
          const { data } = await octokit.repos.get({ owner, repo: name });
          description = data.description ?? "";
        } catch {
          // ignore
        }
        return {
          name: p.slug,
          repo: p.repo,
          url: `https://github.com/${p.repo}`,
          description,
        };
      })
    );

    return results;
  } catch (err) {
    console.error("[bestofjs] collect failed:", (err as Error).message);
    return [];
  }
}
