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
