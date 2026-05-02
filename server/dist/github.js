import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
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
export async function searchGitHubUsers(location, language, limit = 5) {
    try {
        const query = `location:"${location}" language:${language}`;
        const response = await githubApi.get('/search/users', {
            params: {
                q: query,
                per_page: limit,
            },
        });
        return response.data.items;
    }
    catch (error) {
        console.error("Error fetching users from GitHub API:", error);
        throw new Error("Failed to fetch users from GitHub API");
    }
}
/**
 * Fetches the most recently updated repositories for a specific user.
 */
export async function getUserRepos(username) {
    try {
        const response = await githubApi.get(`/users/${username}/repos`, {
            params: {
                sort: 'updated',
                per_page: 10,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error(`Error fetching repos for ${username}:`, error);
        return [];
    }
}
