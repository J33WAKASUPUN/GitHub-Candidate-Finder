// 1. The input schema: What the AI Agent will send to our tool
export interface FindCandidatesArgs {
  location: string;
  language: string;
  limit?: number; // How many candidates to return (e.g., 5)
}

// 2. GitHub API Response: User Search
export interface GitHubUser {
  login: string;
  html_url: string;
  repos_url: string; // We will use this to fetch their actual work
}

export interface GitHubSearchResponse {
  items: GitHubUser[];
}

// 3. GitHub API Response: Repository Data
// We need these specific fields to calculate if an engineer is "strong" and "recent"
export interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string; // ISO date string to check recent activity
}

// 4. Result Shaping: The optimized output sent back to the AI Agent
export interface RankedCandidate {
  username: string;
  github_url: string;
  score: number;
  reasoning: string; // e.g., "Has 3 recent Go repositories with 45 stars."
  top_language_stars: number;
  last_active: string | null;
}