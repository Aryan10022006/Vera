/**
 * Vera Protocol - External GitHub Integration MCP Server
 * Provides comprehensive GitHub repository analysis and management
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Octokit } from '@octokit/rest';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';

interface GitHubConfig {
  clientId: string;
  clientSecret: string;
  token?: string;
}

interface RepositoryAnalysis {
  repository: {
    name: string;
    fullName: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    size: number;
    defaultBranch: string;
  };
  codeQuality: {
    linesOfCode: number;
    files: number;
    languages: Record<string, number>;
    complexity: number;
    maintainabilityIndex: number;
  };
  security: {
    vulnerabilities: SecurityVulnerability[];
    dependencies: Dependency[];
    secrets: SecretScan[];
    securityScore: number;
  };
  testing: {
    hasTests: boolean;
    testFiles: string[];
    coverage: number;
    testFrameworks: string[];
  };
  documentation: {
    hasReadme: boolean;
    hasApiDocs: boolean;
    hasContributing: boolean;
    hasLicense: boolean;
    documentationScore: number;
  };
  activity: {
    lastCommit: CommitInfo;
    commitFrequency: number;
    contributors: number;
    openIssues: number;
    openPRs: number;
  };
}

interface SecurityVulnerability {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  file: string;
  line?: number;
  cwe?: string;
}

interface Dependency {
  name: string;
  version: string;
  vulnerabilities: number;
  outdated: boolean;
  license: string;
}

interface SecretScan {
  type: string;
  file: string;
  line: number;
  description: string;
}

interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

class GitHubIntegrationMCP {
  private server: Server;
  private octokit: Octokit;
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: 'vera-github-integration',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.octokit = new Octokit({
      auth: config.token,
    });

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'authenticate_freelancer',
            description: 'Authenticate freelancer with GitHub OAuth and get repository access',
            inputSchema: {
              type: 'object',
              properties: {
                oauthCode: {
                  type: 'string',
                  description: 'OAuth authorization code from GitHub',
                },
                freelancerAddress: {
                  type: 'string',
                  description: 'Ethereum address of the freelancer',
                },
              },
              required: ['oauthCode', 'freelancerAddress'],
            },
          },
          {
            name: 'analyze_repository',
            description: 'Perform comprehensive analysis of a GitHub repository',
            inputSchema: {
              type: 'object',
              properties: {
                repositoryUrl: {
                  type: 'string',
                  description: 'GitHub repository URL to analyze',
                },
                analysisDepth: {
                  type: 'string',
                  enum: ['basic', 'standard', 'comprehensive'],
                  description: 'Depth of analysis to perform',
                  default: 'standard',
                },
              },
              required: ['repositoryUrl'],
            },
          },
          {
            name: 'get_commit_history',
            description: 'Get detailed commit history for a repository',
            inputSchema: {
              type: 'object',
              properties: {
                repositoryUrl: {
                  type: 'string',
                  description: 'GitHub repository URL',
                },
                since: {
                  type: 'string',
                  description: 'ISO date string to get commits since',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of commits to return',
                  default: 50,
                },
              },
              required: ['repositoryUrl'],
            },
          },
          {
            name: 'run_security_scan',
            description: 'Run comprehensive security scan on repository',
            inputSchema: {
              type: 'object',
              properties: {
                repositoryUrl: {
                  type: 'string',
                  description: 'GitHub repository URL to scan',
                },
                scanType: {
                  type: 'string',
                  enum: ['vulnerabilities', 'secrets', 'dependencies', 'all'],
                  description: 'Type of security scan to perform',
                  default: 'all',
                },
              },
              required: ['repositoryUrl'],
            },
          },
          {
            name: 'analyze_code_quality',
            description: 'Analyze code quality metrics and maintainability',
            inputSchema: {
              type: 'object',
              properties: {
                repositoryUrl: {
                  type: 'string',
                  description: 'GitHub repository URL to analyze',
                },
                includeMetrics: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['complexity', 'maintainability', 'duplication', 'coverage'],
                  },
                  description: 'Specific metrics to include in analysis',
                },
              },
              required: ['repositoryUrl'],
            },
          },
          {
            name: 'setup_webhook',
            description: 'Set up webhook for repository events',
            inputSchema: {
              type: 'object',
              properties: {
                repositoryUrl: {
                  type: 'string',
                  description: 'GitHub repository URL',
                },
                webhookUrl: {
                  type: 'string',
                  description: 'URL to receive webhook events',
                },
                events: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'GitHub events to subscribe to',
                  default: ['push', 'pull_request'],
                },
                secret: {
                  type: 'string',
                  description: 'Webhook secret for signature verification',
                },
              },
              required: ['repositoryUrl', 'webhookUrl'],
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'authenticate_freelancer':
            return await this.authenticateFreelancer(args);
          case 'analyze_repository':
            return await this.analyzeRepository(args);
          case 'get_commit_history':
            return await this.getCommitHistory(args);
          case 'run_security_scan':
            return await this.runSecurityScan(args);
          case 'analyze_code_quality':
            return await this.analyzeCodeQuality(args);
          case 'setup_webhook':
            return await this.setupWebhook(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async authenticateFreelancer(args: any) {
    const { oauthCode, freelancerAddress } = args;

    try {
      // Exchange OAuth code for access token
      const auth = createOAuthAppAuth({
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      });

      const { token } = await auth({
        type: 'oauth-user',
        code: oauthCode,
      });

      // Get user information
      const octokit = new Octokit({ auth: token });
      const { data: user } = await octokit.rest.users.getAuthenticated();
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        visibility: 'all',
        sort: 'updated',
        per_page: 100,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              freelancer: {
                address: freelancerAddress,
                github: {
                  username: user.login,
                  name: user.name,
                  email: user.email,
                  avatar: user.avatar_url,
                },
                repositories: repos.map(repo => ({
                  name: repo.name,
                  fullName: repo.full_name,
                  url: repo.html_url,
                  private: repo.private,
                  language: repo.language,
                })),
                token: token, // Store securely
              },
            }),
          },
        ],
      };
    } catch (error) {
      throw new Error(`GitHub authentication failed: ${error.message}`);
    }
  }

  private async analyzeRepository(args: any): Promise<any> {
    const { repositoryUrl, analysisDepth = 'standard' } = args;
    const [owner, repo] = this.parseRepositoryUrl(repositoryUrl);

    try {
      // Get repository information
      const { data: repoData } = await this.octokit.rest.repos.get({ owner, repo });

      // Get languages
      const { data: languages } = await this.octokit.rest.repos.listLanguages({ owner, repo });

      // Get commits
      const { data: commits } = await this.octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 100,
      });

      // Get contributors
      const { data: contributors } = await this.octokit.rest.repos.listContributors({
        owner,
        repo,
      });

      // Analyze repository structure
      const analysis: RepositoryAnalysis = {
        repository: {
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description || '',
          language: repoData.language || 'Unknown',
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          size: repoData.size,
          defaultBranch: repoData.default_branch,
        },
        codeQuality: await this.analyzeCodeQualityMetrics(owner, repo, languages),
        security: await this.analyzeSecurityMetrics(owner, repo),
        testing: await this.analyzeTestingMetrics(owner, repo),
        documentation: await this.analyzeDocumentationMetrics(owner, repo),
        activity: {
          lastCommit: commits.length > 0 ? {
            sha: commits[0].sha,
            message: commits[0].commit.message,
            author: commits[0].commit.author?.name || 'Unknown',
            date: commits[0].commit.author?.date || new Date().toISOString(),
            url: commits[0].html_url,
          } : null,
          commitFrequency: this.calculateCommitFrequency(commits),
          contributors: contributors.length,
          openIssues: repoData.open_issues_count,
          openPRs: 0, // Would need separate API call
        },
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              analysis,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Repository analysis failed: ${error.message}`);
    }
  }

  private async analyzeCodeQualityMetrics(owner: string, repo: string, languages: any) {
    const totalLines = Object.values(languages).reduce((a: number, b: number) => a + b, 0);
    
    return {
      linesOfCode: totalLines,
      files: Object.keys(languages).length,
      languages: languages as Record<string, number>,
      complexity: this.calculateComplexity(languages),
      maintainabilityIndex: this.calculateMaintainabilityIndex(languages, totalLines),
    };
  }

  private async analyzeSecurityMetrics(owner: string, repo: string) {
    // In a real implementation, this would integrate with security scanning tools
    return {
      vulnerabilities: [],
      dependencies: [],
      secrets: [],
      securityScore: 85, // Placeholder
    };
  }

  private async analyzeTestingMetrics(owner: string, repo: string) {
    try {
      const { data: contents } = await this.octokit.rest.search.code({
        q: `repo:${owner}/${repo} filename:test OR filename:spec`,
      });

      return {
        hasTests: contents.total_count > 0,
        testFiles: contents.items.map((item: any) => item.name),
        coverage: 0, // Would need integration with coverage tools
        testFrameworks: this.detectTestFrameworks(contents.items),
      };
    } catch (error) {
      return {
        hasTests: false,
        testFiles: [],
        coverage: 0,
        testFrameworks: [],
      };
    }
  }

  private async analyzeDocumentationMetrics(owner: string, repo: string) {
    const checks = await Promise.allSettled([
      this.octokit.rest.repos.getContent({ owner, repo, path: 'README.md' }),
      this.octokit.rest.repos.getContent({ owner, repo, path: 'docs' }),
      this.octokit.rest.repos.getContent({ owner, repo, path: 'CONTRIBUTING.md' }),
      this.octokit.rest.repos.getContent({ owner, repo, path: 'LICENSE' }),
    ]);

    const hasReadme = checks[0].status === 'fulfilled';
    const hasApiDocs = checks[1].status === 'fulfilled';
    const hasContributing = checks[2].status === 'fulfilled';
    const hasLicense = checks[3].status === 'fulfilled';

    return {
      hasReadme,
      hasApiDocs,
      hasContributing,
      hasLicense,
      documentationScore: this.calculateDocumentationScore({
        hasReadme,
        hasApiDocs,
        hasContributing,
        hasLicense,
      }),
    };
  }

  // Helper methods
  private parseRepositoryUrl(url: string): [string, string] {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return [match[1], match[2].replace('.git', '')];
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

  private calculateMaintainabilityIndex(languages: Record<string, number>, totalLines: number): number {
    // Simplified maintainability index calculation
    const complexity = this.calculateComplexity(languages);
    const languageCount = Object.keys(languages).length;
    
    // Higher is better (0-100 scale)
    return Math.max(0, Math.min(100, 100 - (complexity * 10) - (languageCount * 2) + Math.log10(totalLines) * 5));
  }

  private calculateCommitFrequency(commits: any[]): number {
    if (commits.length < 2) return 0;
    
    const firstCommit = new Date(commits[commits.length - 1].commit.author.date);
    const lastCommit = new Date(commits[0].commit.author.date);
    const daysDiff = (lastCommit.getTime() - firstCommit.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysDiff > 0 ? commits.length / daysDiff : 0;
  }

  private detectTestFrameworks(testFiles: any[]): string[] {
    const frameworks = new Set<string>();
    
    testFiles.forEach((file: any) => {
      const name = file.name.toLowerCase();
      if (name.includes('jest')) frameworks.add('Jest');
      if (name.includes('mocha')) frameworks.add('Mocha');
      if (name.includes('jasmine')) frameworks.add('Jasmine');
      if (name.includes('cypress')) frameworks.add('Cypress');
      if (name.includes('playwright')) frameworks.add('Playwright');
    });
    
    return Array.from(frameworks);
  }

  private calculateDocumentationScore(docs: any): number {
    let score = 0;
    if (docs.hasReadme) score += 40;
    if (docs.hasApiDocs) score += 30;
    if (docs.hasContributing) score += 15;
    if (docs.hasLicense) score += 15;
    return score;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Vera GitHub Integration MCP Server running on stdio');
  }
}

// Start the server
const config: GitHubConfig = {
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  token: process.env.GITHUB_TOKEN,
};

const server = new GitHubIntegrationMCP(config);
server.run().catch(console.error);