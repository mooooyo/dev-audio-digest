import { Octokit } from "@octokit/rest";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function fetchReadme(fullName: string): Promise<string> {
  // try common README filenames via raw.githubusercontent.com (no auth needed)
  const filenames = ["README.md", "readme.md", "Readme.md"];
  for (const f of filenames) {
    try {
      const url = `https://raw.githubusercontent.com/${fullName}/HEAD/${f}`;
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        return text.slice(0, 1500);
      }
    } catch {
      // try next
    }
  }
  return "";
}
