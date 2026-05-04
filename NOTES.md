# Development Notes & Future Scalability

This document outlines the architectural tradeoffs made during the development of the GitHub Candidate Finder, as well as proposed optimizations for scaling the tool in a production environment.

## 1. The N+1 Problem & The GraphQL Migration Path
Currently, the tool uses the GitHub REST API (`v3`). This introduces a classic N+1 data fetching problem:
1. One request to `/search/users` to find candidates.
2. `N` concurrent requests to `/users/{username}/repos` to fetch their activity.

**Current Mitigation:** 
To prevent rate-limit exhaustion, the tool hard-caps the initial user search limit (defaulting to 5, max 10) and only fetches the 10 most recently updated repositories per user. 

**Future Solution:** 
Migrate the data fetching layer to the **GitHub GraphQL API (`v4`)**. A single GraphQL query can fetch a list of users matching the search criteria *alongside* their top `X` repositories and star counts in one network request, completely eliminating the N+1 issue and drastically reducing latency.

## 2. Organization vs. User Filtering
During testing with high-volume languages (e.g., Python), organizational accounts (like `google`, `mongodb`, or universities) occasionally surfaced in the top results. Their massive aggregate star counts mathematically drown out individual developers.

**Proposed Fix:**
For a production recruiting tool, the initial search query should strictly append `type:user` (e.g., `q=location:"Sri Lanka" language:Go type:user`). This ensures the AI agent only spends context window tokens on hireable individuals, not corporate entities.

## 3. Rate Limiting Strategy
The tool is designed to work safely even without a GitHub Personal Access Token (PAT). 
* **Unauthenticated:** 60 requests per hour.
* **Authenticated:** 5,000 requests per hour.

Because an AI agent might call this tool multiple times in a single conversational thread, the application restricts the maximum candidates evaluated per tool call to 10. If the tool is deployed centrally for multiple recruiters, enforcing the `GITHUB_TOKEN` environment variable and implementing a Redis-based caching layer for recent queries will be mandatory.

## 4. Algorithm Evolution
The current scoring engine successfully identifies strong developers by requiring a hard match on the target language, weighing target language stars (x2), and awarding a recency bonus (90 days). 

Future iterations of the `rankCandidates` algorithm could evaluate:
* **Primary vs. Secondary Languages:** Currently, if a repo uses multiple languages, GitHub returns the "majority" language. Using the `/languages` endpoint could verify if the target language is actually a significant portion of the codebase.
* **Commit History:** Fetching actual commit frequency over the last year rather than just checking the `pushed_at` date of repositories.