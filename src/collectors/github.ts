import { Octokit } from "@octokit/rest";
import type { CategoryConfig, GitHubRelease } from "../types.js";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function collectGitHubReleases(
  config: CategoryConfig
): Promise<GitHubRelease[]> {
  const repos = config.sources.github?.repos ?? [];
  const since = new Date();
  since.setDate(since.getDate() - 1); // last 24 hours

  const results: GitHubRelease[] = [];

  for (const repo of repos) {
    const [owner, name] = repo.split("/");
    try {
      const { data: releases } = await octokit.repos.listReleases({
        owner,
        repo: name,
        per_page: 5,
      });

      const recent = releases
        .filter((r) => new Date(r.published_at ?? "") >= since)
        .map((r) => ({
          repo,
          tag: r.tag_name,
          name: r.name ?? r.tag_name,
          body: r.body?.slice(0, 2000) ?? "",
          published_at: r.published_at ?? "",
          html_url: r.html_url,
          prerelease: r.prerelease,
        }));

      results.push(...recent);
    } catch (err) {
      console.error(`[${repo}] collect failed:`, (err as Error).message);
    }
  }

  return results;
}
