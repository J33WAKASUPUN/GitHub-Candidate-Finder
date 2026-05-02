import axios from 'axios';
import dotenv from 'dotenv';
import { GitHubSearchResponse, GitHubRepo, GitHubUser } from './types';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Create an Axios instance. If we have a token, attach it. If not, it runs anonymously.
const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    ...(GITHUB_TOKEN && { Authorization: `token ${GITHUB_TOKEN}` }),
  },
});

/**
 * Searches for users matching a specific location and language.
 */
export async function searchGitHubUsers(location: string, language: string, limit: number = 5): Promise<GitHubUser[]> {
  try {
    // Construct the GitHub search query, e.g., q=location:"Sri Lanka" language:Go
    const query = `location:"${location}" language:${language}`;
    
    const response = await githubApi.get<GitHubSearchResponse>('/search/users', {
      params: {
        q: query,
        // TRADEOFF 1: We explicitly ask GitHub to only return the top 'limit' (e.g., 5) users.
        // We skip processing hundreds of users to avoid hitting the N+1 rate limit issue.
        per_page: limit, 
      },
    });
    
    return response.data.items;
  } catch (error) {
    console.error("Error fetching users from GitHub API:", error);
    throw new Error("Failed to fetch users from GitHub API");
  }
}

/**
 * Fetches the most recently updated repositories for a specific user.
 */
export async function getUserRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const response = await githubApi.get<GitHubRepo[]>(`/users/${username}/repos`, {
      params: {
        // TRADEOFF 2: The CTO asked for "recent" projects. We sort by 'updated' 
        // and only fetch the top 10 repos. We don't need their 10-year-old projects.
        sort: 'updated',
        per_page: 10,
      },
    });
    
    return response.data;
  } catch (error) {
    // TRADEOFF 3: Graceful failure. If one user's repos fail to load (e.g., rate limit hit mid-request),
    // we return an empty array instead of crashing the whole tool. The agent just sees they have 0 recent repos.
    console.error(`Error fetching repos for ${username}:`, error);
    return [];
  }
}