import Groq from "groq-sdk";
import type { CategoryConfig, CollectResult } from "./types.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildContext(data: CollectResult): string {
  const sections: string[] = [];

  if (data.github_releases.length > 0) {
    sections.push("## GitHub Releases");
    for (const r of data.github_releases) {
      sections.push(`### ${r.repo} ${r.tag} ${r.prerelease ? "(pre-release)" : ""}`);
      sections.push(`URL: ${r.html_url}`);
      sections.push(r.body);
    }
  }

  if (data.chrome_blog.length > 0) {
    sections.push("## Chrome Developers Blog");
    for (const item of data.chrome_blog) {
      sections.push(`### ${item.title}`);
      sections.push(`URL: ${item.link}`);
      sections.push(item.summary);
    }
  }

  if (data.hackernews.length > 0) {
    sections.push("## Hacker News");
    for (const story of data.hackernews) {
      sections.push(`### ${story.title} (score: ${story.score}, comments: ${story.comments})`);
      sections.push(`URL: ${story.url}`);
    }
  }

  if (data.trending.length > 0) {
    sections.push("## GitHub Trending");
    for (const repo of data.trending) {
      sections.push(`- **${repo.name}** ⭐${repo.stars} (+${repo.stars_today} today): ${repo.description}`);
      sections.push(`  URL: ${repo.url}`);
    }
  }

  return sections.join("\n\n");
}

export async function summarize(
  config: CategoryConfig,
  data: CollectResult
): Promise<string> {
  const context = buildContext(data);

  if (context.trim().length === 0) {
    return "";
  }

  const today = new Date().toISOString().slice(0, 10);

  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a dev news blogger. Today is ${today}.
Given raw data collected from various sources, write a blog post in Korean.

Instructions:
${config.prompt}

Rules:
- Write in markdown format
- Title should be: "${today} ${config.name} 뉴스 정리"
- Include original source links
- Use code blocks for code/API changes
- Keep it concise but informative
- Group by topic, not by source
- Skip trivial items (patch-only, pre-release unless significant)
- If there's nothing noteworthy, say so briefly`,
      },
      {
        role: "user",
        content: `Raw data:\n${context}`,
      },
    ],
  });

  return result.choices[0]?.message?.content ?? "";
}
