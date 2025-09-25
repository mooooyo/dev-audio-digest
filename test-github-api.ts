import dotenv from 'dotenv';
import { json } from 'stream/consumers';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN is not defined in environment variables');
}
console.log('GITHUB_TOKEN:', GITHUB_TOKEN);

async function fetchGitHubReleases() {
  const response = await fetch(
    'https://api.github.com/repos/facebook/react/releases?per_page=5',
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  console.log(data[0]);
  data.forEach((release: any) => {
    console.log(`- ${release.name || release.tag_name} (${release.published_at})`);
  });
}

fetchGitHubReleases();

// https://api.github.com/repos/facebook/react/releases?per_page=5
