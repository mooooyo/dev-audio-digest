# Dev Audio Digest

Daily dev news digest powered by GitHub Actions + Groq + GitHub Pages.

## Blog

[https://mooooyo.github.io/dev-audio-digest/](https://mooooyo.github.io/dev-audio-digest/)

## Sources

- GitHub Releases (React, Next.js, TypeScript)
- Chrome Developers Blog (RSS)
- GitHub Trending (JavaScript)
- Hacker News API
- npm Download Trends
- Best of JS Monthly Rankings

## How it works

1. GitHub Actions runs daily at 06:00 KST
2. Collects data from all sources
3. Summarizes with Groq (llama-3.3-70b)
4. Generates markdown blog post
5. Auto-commits to `_posts/` and deploys via GitHub Pages

## Project Structure

```
src/
├── main.ts              # entrypoint: collect → summarize → save post
├── category-loader.ts   # load categories/*.yaml configs
├── summarizer.ts        # send data to Groq, get markdown back
├── types.ts             # type definitions
└── collectors/          # one file per source (all same pattern)
    ├── github-utils.ts  # shared octokit & fetchReadme
    ├── github.ts        # GitHub Releases
    ├── github-trending.ts # GitHub Trending (scrape)
    ├── chrome-blog.ts   # Chrome Developers Blog (RSS)
    ├── hackernews.ts    # Hacker News (Firebase API)
    ├── npm-trends.ts    # npm weekly download comparison
    └── bestofjs.ts      # Best of JS monthly rankings (scrape)

categories/
└── frontend.yaml        # category config (add yaml to add category)

_posts/                   # auto-generated blog posts (Jekyll)
```
