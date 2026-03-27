export interface CategoryConfig {
  name: string;
  enabled: boolean;
  sources: {
    github?: {
      repos: string[];
      watch: string[];
    };
    npm?: {
      track_downloads: boolean;
      alert_threshold: number;
    };
    community?: {
      reddit?: string[];
      hackernews?: boolean;
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

export interface CollectResult {
  category: string;
  collected_at: string;
  github_releases: GitHubRelease[];
}
