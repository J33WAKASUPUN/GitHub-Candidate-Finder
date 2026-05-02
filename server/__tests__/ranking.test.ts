import { rankCandidates } from '../src/ranking.js';
import { GitHubUser, GitHubRepo } from '../src/types.js';

describe('Ranking Logic', () => {
  it('correctly ranks candidates based on language matches, stars, and recency', () => {
    // Mock Users
    const aliceUser: GitHubUser = { login: 'alice', html_url: 'url', repos_url: 'url' };
    const bobUser: GitHubUser = { login: 'bob', html_url: 'url', repos_url: 'url' };
    const charlieUser: GitHubUser = { login: 'charlie', html_url: 'url', repos_url: 'url' };

    // Set dates for recency bonus
    const recentDate = new Date();
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 100); // 100 days ago (no recent bonus)

    // Mock Repositories
    // Alice: Target language (Go), 30 stars (*2 = 60), +10 (lang match), +20 (recent) = 90 pts
    const aliceRepos: GitHubRepo[] = [{
      name: 'go-api', html_url: '', description: '',
      language: 'Go', stargazers_count: 30, pushed_at: recentDate.toISOString()
    }];

    // Bob: Target language (Go), 0 stars, +10 (lang match), +0 (old) = 10 pts
    const bobRepos: GitHubRepo[] = [{
      name: 'go-old', html_url: '', description: '',
      language: 'Go', stargazers_count: 0, pushed_at: oldDate.toISOString()
    }];

    // Charlie: Wrong language (JavaScript), 50 stars (*1 = 50), +0 (wrong lang), +20 (recent) = 70 pts
    const charlieRepos: GitHubRepo[] = [{
      name: 'js-app', html_url: '', description: '',
      language: 'JavaScript', stargazers_count: 50, pushed_at: recentDate.toISOString()
    }];

    // The payload containing all candidates
    const input = [
      { user: bobUser, repos: bobRepos },
      { user: charlieUser, repos: charlieRepos },
      { user: aliceUser, repos: aliceRepos }, // Purposely mixed up order
    ];

    // Execute ranking
    const result = rankCandidates(input, 'Go');

    // Assertions to prove our ranking claim
    expect(result.length).toBe(3);
    
    // Alice should be first (Strongest signal: right language, high stars, recent)
    expect(result[0].username).toBe('alice');
    expect(result[0].score).toBe(90);

    // Bob should be second (Weak signal, but at least writes the right language)
    expect(result[1].username).toBe('bob');
    expect(result[1].score).toBe(10);

    // Charlie should be last (Strong developer, but 0 target language repos = 0 points)
    expect(result[2].username).toBe('charlie');
    expect(result[2].score).toBe(0);
  });
});