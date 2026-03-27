import { Octokit } from "@octokit/rest";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function fetchReadme(fullName: string): Promise<string> {
  const [owner, repo] = fullName.split("/");
  try {
    const { data } = await octokit.repos.getReadme({ owner, repo });
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return content.slice(0, 1500);
  } catch {
    return "";
  }
}
