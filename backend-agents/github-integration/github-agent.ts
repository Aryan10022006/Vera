/**
 * Vera Protocol - Standalone GitHub Integration Agent
 * Direct GitHub API integration without MCP dependencies
 */

import { Octokit } from '@octokit/rest';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';

export interface RepositoryAnalysis {
  owner: string;
  repo: string;
  branch: string;
  lastCommit: {
    sha: string;
    message: string;
    author: string;
    date: string;
  };
  codeQuality: {
    linesOfCode: number;
    files: number;
    languages: Record<string, number>;
    complexity: number;
  };
  security: {
    vulnerabilities: any[];
    dependencies: any[];
    secrets: any[];
  };
  tests: {
    hasTests: boolean;
    testFiles: string[];
    coverage: number;
  };
  documentation: {
    hasReadme: boolean;
    hasApiDocs: boolean;
    hasDeploymentGuide: boolean;
  };
}

export class GitHubAgent {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Analyze repository for milestone verification
   */
  async analyzeRepository(repositoryUrl: string): Promise<RepositoryAnalysis> {
    const [owner, repo] = this.parseRepositoryUrl(repositoryUrl);

    try {
      // Get repository information
      const { data: repoData } = await this.octokit.rest.repos.get({ owner, repo });

      // Get latest commit
      const { data: commits } = await this.octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 1,
      });

      // Analyze code quality
      const codeQuality = await this.analyzeCodeQuality(owner, repo);

      // Check for security issues
      const security = await this.analyzeSecurityIssues(owner, repo);

      // Analyze tests
      const tests = await this.analyzeTests(owner, repo);

      // Check documentation
      const documentation = await this.analyzeDocumentation(owner, repo);

      return {
        owner,
        repo,
        branch: repoData.default_branch,
        lastCommit: {
          sha: commits[0].sha,
          message: commits[0].commit.message,
          author: commits[0].commit.author?.name || 'Unknown',
          date: commits[0].commit.author?.date || new Date().toISOString(),
        },
        codeQuality,
        security,
        tests,
        documentation,
      };
    } catch (error) {
      throw new Error(`Repository analysis failed: ${error.message}`);
    }
  }

  /**
   * Authenticate freelancer with GitHub OAuth
   */
  async authenticateFreelancer(oauthCode: string): Promise<{
    token: string;
    username: string;
    repositories: string[];
  }> {
    try {
      const auth = createOAuthAppAuth({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      });

      const { token } = await auth({
        type: 'oauth-user',
        code: oauthCode,
      });

      const octokit = new Octokit({ auth: token });
      const { data: user } = await octokit.rest.users.getAuthenticated();
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        visibility: 'all',
        sort: 'updated',
        per_page: 100,
      });

      return {
        token,
        username: user.login,
        repositories: repos.map(repo => repo.full_name),
      };
    } catch (error) {
      throw new Error(`GitHub authentication failed: ${error.message}`);
    }
  }

  private parseRepositoryUrl(url: string): [string, string] {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return [match[1], match[2].replace('.git', '')];
  }

  private async analyzeCodeQuality(owner: string, repo: string) {
    const { data: languages } = await this.octokit.rest.repos.listLanguages({ owner, repo });
    
    const totalLines = Object.values(languages).reduce((a: number, b: number) => a + b, 0);
    
    return {
      linesOfCode: totalLines,
      files: Object.keys(languages).length,
      languages: languages as Record<string, number>,
      complexity: this.calculateComplexity(languages as Record<string, number>),
    };
  }

  private async analyzeSecurityIssues(owner: string, repo: string) {
    try {
      const { data: advisories } = await this.octokit.rest.securityAdvisories.listRepositoryAdvisories({
        owner,
        repo,
      });

      return {
        vulnerabilities: advisories,
        dependencies: [],
        secrets: [],
      };
    } catch (error) {
      return {
        vulnerabilities: [],
        dependencies: [],
        secrets: [],
      };
    }
  }

  private async analyzeTests(owner: string, repo: string) {
    try {
      const { data: contents } = await this.octokit.rest.search.code({
        q: `repo:${owner}/${repo} filename:test OR filename:spec`,
      });

      return {
        hasTests: contents.total_count > 0,
        testFiles: contents.items.map((item: any) => item.name),
        coverage: 0,
      };
    } catch (error) {
      return {
        hasTests: false,
        testFiles: [],
        coverage: 0,
      };
    }
  }

  private async analyzeDocumentation(owner: string, repo: string) {
    try {
      const checks = await Promise.allSettled([
        this.octokit.rest.repos.getContent({ owner, repo, path: 'README.md' }),
        this.octokit.rest.repos.getContent({ owner, repo, path: 'docs' }),
        this.octokit.rest.repos.getContent({ owner, repo, path: 'DEPLOYMENT.md' }),
      ]);

      return {
        hasReadme: checks[0].status === 'fulfilled',
        hasApiDocs: checks[1].status === 'fulfilled',
        hasDeploymentGuide: checks[2].status === 'fulfilled',
      };
    } catch (error) {
      return {
        hasReadme: false,
        hasApiDocs: false,
        hasDeploymentGuide: false,
      };
    }
  }

  private calculateComplexity(languages: Record<string, number>): number {
    const complexityWeights: Record<string, number> = {
      JavaScript: 1,
      TypeScript: 1.2,
      Python: 1.1,
      Java: 1.3,
      'C++': 1.5,
      Rust: 1.4,
      Go: 1.2,
    };

    let totalWeight = 0;
    let totalLines = 0;

    for (const [lang, lines] of Object.entries(languages)) {
      const weight = complexityWeights[lang] || 1;
      totalWeight += weight * lines;
      totalLines += lines;
    }

    return totalLines > 0 ? totalWeight / totalLines : 1;
  }
}