// The input schema: What the AI Agent will send to our tool
export interface FindCandidatesArgs {
  location: string;
  language: string;
  limit?: number;
}

// GitHub API Response: User Search
export interface GitHubUser {
  login: string;
  html_url: string;
  repos_url: string;
}

export interface GitHubSearchResponse {
  items: GitHubUser[];
}

// GitHub API Response: Repository Data
export interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
}

// Result Shaping: The optimized output sent back to the AI Agent
export interface RankedCandidate {
  username: string;
  github_url: string;
  score: number;
  target_repo_count: number;
  reasoning: string;
  top_language_stars: number;
  last_active: string | null;
}