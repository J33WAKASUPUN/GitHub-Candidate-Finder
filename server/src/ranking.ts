import { GitHubUser, GitHubRepo, RankedCandidate } from './types.js';

/**
 * Takes an array of users and their repos, evaluates them, and returns a sorted ranking.
 */
export function rankCandidates(
  candidatesWithRepos: { user: GitHubUser; repos: GitHubRepo[] }[],
  targetLanguage: string
): RankedCandidate[] {
  const ranked = candidatesWithRepos.map(({ user, repos }) =>
    evaluateCandidate(user, repos, targetLanguage)
  );

  // Sort descending: highest score first
  return ranked.sort((a, b) => b.score - a.score);
}

/**
 * Defines what "strong" and "recent" mean mathematically.
 */
function evaluateCandidate(
  user: GitHubUser,
  repos: GitHubRepo[],
  targetLanguage: string
): RankedCandidate {
  let score = 0;
  let targetLanguageStars = 0;
  let targetLangRepoCount = 0;
  let mostRecentPush: Date | null = null;

  const normalizedTargetLang = targetLanguage.toLowerCase();

  for (const repo of repos) {
    const repoLang = (repo.language || '').toLowerCase();
    const isTargetLang = repoLang === normalizedTargetLang;
    
    // Track their most recent code push across all repos
    const pushedDate = new Date(repo.pushed_at);
    if (!mostRecentPush || pushedDate > mostRecentPush) {
      mostRecentPush = pushedDate;
    }

    if (isTargetLang) {
      targetLangRepoCount++;
      targetLanguageStars += repo.stargazers_count;
      
      // Points for writing in the requested language
      score += 10; 
      // Stars in the target language count double (shows specific expertise)
      score += repo.stargazers_count * 2; 
    } else {
      // General stars still show they are a competent engineer
      score += repo.stargazers_count; 
    }
  }

  // Calculate "Recent" bonus
  const now = new Date();
  const daysSinceLastPush = mostRecentPush
    ? Math.floor((now.getTime() - mostRecentPush.getTime()) / (1000 * 3600 * 24))
    : null;

  if (daysSinceLastPush !== null && daysSinceLastPush <= 90) {
    // Big bonus if they shipped code in the last 3 months
    score += 20; 
  }

  if (targetLangRepoCount === 0) {
    score = 0; 
  }

  // Generate a human-readable reasoning string for the AI agent
  let reasoning = `Scored ${score}. Found ${targetLangRepoCount} repos in ${targetLanguage} with ${targetLanguageStars} stars. `;
  if (daysSinceLastPush !== null) {
    reasoning += `Last active ${daysSinceLastPush} days ago.`;
  } else {
    reasoning += `No recent activity found.`;
  }

  return {
    username: user.login,
    github_url: user.html_url,
    score,
    target_repo_count: targetLangRepoCount,
    top_language_stars: targetLanguageStars,
    reasoning,
    last_active: mostRecentPush ? mostRecentPush.toISOString() : null,
  };
}