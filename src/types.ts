export interface CategoryConfig {
  name: string;
  enabled: boolean;
  output: "text" | "audio";
  sources: {
    core?: {
      chrome_developers?: {
        url: string;
        type: string;
      };
      github_releases?: {
        repos: string[];
        watch: string[];
      };
      github_trending?: {
        language: string;
        since: string;
      };
      npm?: {
        packages: string[];
        alert_threshold: number;
      };
    };
    secondary?: {
      hackernews?: {
        min_score: number;
        keywords: string[];
      };
      javascript_weekly?: {
        url: string;
      };
    };
    optional?: {
      devtools?: {
        keywords: string[];
      };
    };
  };
  prompt: string;
}

export interface GitHubRelease {
  repo: string;
  tag: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
}

export interface RSSItem {
  title: string;
  link: string;
  published_at: string;
  summary: string;
}

export interface HNStory {
  id: number;
  title: string;
  url: string;
  score: number;
  comments: number;
  published_at: string;
}

export interface TrendingRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  stars_today: number;
  url: string;
  readme: string;
}

export interface NpmTrend {
  package: string;
  last_week: number;
  this_week: number;
  change_pct: number;
}

export interface BestOfJSProject {
  name: string;
  repo: string;
  url: string;
  description: string;
}

export interface CollectResult {
  category: string;
  collected_at: string;
  github_releases: GitHubRelease[];
  chrome_blog: RSSItem[];
  hackernews: HNStory[];
  trending: TrendingRepo[];
  npm_trends: NpmTrend[];
  bestofjs: BestOfJSProject[];
}
