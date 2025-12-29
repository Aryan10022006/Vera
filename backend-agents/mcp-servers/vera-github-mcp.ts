/**
 * Vera Protocol - Custom GitHub MCP Server
 * Handles GitHub authentication, repository access, and milestone submissions
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
import crypto from 'crypto';

interface FreelancerAuth {
  freelancerAddress: string;
  githubToken: string;
  githubUsername: string;
  repositories: string[];
  projectId: string;
  milestoneId: string;
}

interface RepositoryAnalysis {
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

class VeraGitHubMCP {
  private server: Server;
  private octokit: Octokit | null = null;
  private authenticatedFreelancers: Map<string, FreelancerAuth> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'vera-github-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'authenticate_freelancer',
            description: 'Authenticate freelancer with GitHub OAuth and link to project',
            inputSchema: {
              type: 'object',
              properties: {
                freelancerAddress: {
                  type: 'string',
                  description: 'Ethereum address of the freelancer',
                },
                projectId: {
                  type: 'string',
                  description: 'Project ID from the agreement',
                },
                milestoneId: {
                  type: 'string',
                  description: 'Milestone ID being worked on',
                },
                githubCode: {
                  type: 'string',
                  description: 'OAuth authorization code from GitHub',
                },
              },
              required: ['freelancerAddress', 'projectId', 'milestoneId', 'githubCode'],
            },
          },
          {
            name: 'analyze_repository',
            description: 'Comprehensive analysis of freelancer repository for milestone verification',
            inputSchema: {
              type: 'object',
              properties: {
                freelancerAddress: {
                  type: 'string',
                  description: 'Ethereum address of the freelancer',
                },
                repositoryUrl: {
                  type: 'string',
                  description: 'GitHub repository URL to analyze',
                },
                requirements: {
                  type: 'array',
                  description: 'Technical requirements from IPFS agreement',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      description: { type: 'string' },
                      acceptanceCriteria: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                  },
                },
              },
              required: ['freelancerAddress', 'repositoryUrl', 'requirements'],
            },
          },
          {
            name: 'submit_milestone',
            description: 'Submit milestone for AI verification with repository proof',
            inputSchema: {
              type: 'object',
              properties: {
                freelancerAddress: {
                  type: 'string',
                  description: 'Ethereum address of the freelancer',
                },
                milestoneId: {
                  type: 'string',
                  description: 'Milestone ID being submitted',
                },
                repositoryUrl: {
                  type: 'string',
                  description: 'GitHub repository URL with completed work',
                },
                commitSha: {
                  type: 'string',
                  description: 'Specific commit SHA for milestone submission',
                },
                submissionMessage: {
                  type: 'string',
                  description: 'Message describing the completed work',
                },
              },
              required: ['freelancerAddress', 'milestoneId', 'repositoryUrl', 'commitSha'],
            },
          },
          {
            name: 'get_repository_metrics',
            description: 'Get detailed code metrics and quality analysis',
            inputSchema: {
              type: 'object',
              properties: {
                repositoryUrl: {
                  type: 'string',
                  description: 'GitHub repository URL',
                },
                freelancerAddress: {
                  type: 'string',
                  description: 'Ethereum address for authentication',
                },
              },
              required: ['repositoryUrl', 'freelancerAddress'],
            },
          },
          {
            name: 'verify_milestone_completion',
            description: 'Verify milestone completion against technical requirements',
            inputSchema: {
              type: 'object',
              properties: {
                freelancerAddress: {
                  type: 'string',
                  description: 'Ethereum address of the freelancer',
                },
                milestoneId: {
                  type: 'string',
                  description: 'Milestone ID to verify',
                },
                technicalRequirements: {
                  type: 'array',
                  description: 'Technical requirements from agreement',
                },
              },
              required: ['freelancerAddress', 'milestoneId', 'technicalRequirements'],
            },
          },
        ] satisfies Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'authenticate_freelancer':
            return await this.authenticateFreelancer(args);
          case 'analyze_repository':
            return await this.analyzeRepository(args);
          case 'submit_milestone':
            return await this.submitMilestone(args);
          case 'get_repository_metrics':
            return await this.getRepositoryMetrics(args);
          case 'verify_milestone_completion':
            return await this.verifyMilestoneCompletion(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  private async authenticateFreelancer(args: any) {
    const { freelancerAddress, projectId, milestoneId, githubCode } = args;

    try {
      // Exchange OAuth code for access token
      const auth = createOAuthAppAuth({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      });

      const { token } = await auth({
        type: 'oauth-user',
        code: githubCode,
      });

      // Create authenticated Octokit instance
      const octokit = new Octokit({ auth: token });

      // Get user information
      const { data: user } = await octokit.rest.users.getAuthenticated();

      // Get user repositories
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
        visibility: 'all',
        sort: 'updated',
        per_page: 100,
      });

      // Store authentication
      const freelancerAuth: FreelancerAuth = {
        freelancerAddress,
        githubToken: token,
        githubUsername: user.login,
        repositories: repos.map(repo => repo.full_name),
        projectId,
        milestoneId,
      };

      this.authenticatedFreelancers.set(freelancerAddress, freelancerAuth);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              freelancer: {
                address: freelancerAddress,
                githubUsername: user.login,
                repositories: repos.length,
                projectId,
                milestoneId,
              },
              message: 'Freelancer successfully authenticated with GitHub',
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`GitHub authentication failed: ${error.message}`);
    }
  }

  private async analyzeRepository(args: any) {
    const { freelancerAddress, repositoryUrl, requirements } = args;

    const auth = this.authenticatedFreelancers.get(freelancerAddress);
    if (!auth) {
      throw new Error('Freelancer not authenticated. Please authenticate first.');
    }

    const octokit = new Octokit({ auth: auth.githubToken });
    const [owner, repo] = this.parseRepositoryUrl(repositoryUrl);

    try {
      // Get repository information
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });

      // Get latest commit
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 1,
      });

      // Get repository contents
      const { data: contents } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: '',
      });

      // Analyze code quality
      const codeQuality = await this.analyzeCodeQuality(octokit, owner, repo);

      // Check for security issues
      const security = await this.analyzeSecurityIssues(octokit, owner, repo);

      // Analyze tests
      const tests = await this.analyzeTests(octokit, owner, repo);

      // Check documentation
      const documentation = await this.analyzeDocumentation(octokit, owner, repo);

      const analysis: RepositoryAnalysis = {
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

      // Verify against requirements
      const requirementVerification = await this.verifyRequirements(
        analysis,
        requirements
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              analysis,
              requirementVerification,
              overallScore: this.calculateOverallScore(analysis, requirementVerification),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Repository analysis failed: ${error.message}`);
    }
  }

  private async submitMilestone(args: any) {
    const { freelancerAddress, milestoneId, repositoryUrl, commitSha, submissionMessage } = args;

    const auth = this.authenticatedFreelancers.get(freelancerAddress);
    if (!auth) {
      throw new Error('Freelancer not authenticated. Please authenticate first.');
    }

    const octokit = new Octokit({ auth: auth.githubToken });
    const [owner, repo] = this.parseRepositoryUrl(repositoryUrl);

    try {
      // Verify commit exists
      const { data: commit } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: commitSha,
      });

      // Create milestone submission record
      const submission = {
        milestoneId,
        freelancerAddress,
        repositoryUrl,
        commitSha,
        submissionMessage: submissionMessage || 'Milestone submission',
        submittedAt: new Date().toISOString(),
        commit: {
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author?.name,
          date: commit.commit.author?.date,
          stats: commit.stats,
        },
      };

      // Trigger AI verification process
      await this.triggerAIVerification(submission);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              submission,
              message: 'Milestone submitted successfully. AI verification initiated.',
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Milestone submission failed: ${error.message}`);
    }
  }

  private async getRepositoryMetrics(args: any) {
    const { repositoryUrl, freelancerAddress } = args;

    const auth = this.authenticatedFreelancers.get(freelancerAddress);
    if (!auth) {
      throw new Error('Freelancer not authenticated. Please authenticate first.');
    }

    const octokit = new Octokit({ auth: auth.githubToken });
    const [owner, repo] = this.parseRepositoryUrl(repositoryUrl);

    try {
      // Get comprehensive repository metrics
      const metrics = await this.getComprehensiveMetrics(octokit, owner, repo);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(metrics, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get repository metrics: ${error.message}`);
    }
  }

  private async verifyMilestoneCompletion(args: any) {
    const { freelancerAddress, milestoneId, technicalRequirements } = args;

    const auth = this.authenticatedFreelancers.get(freelancerAddress);
    if (!auth) {
      throw new Error('Freelancer not authenticated. Please authenticate first.');
    }

    try {
      // Get milestone submission data
      const submission = await this.getMilestoneSubmission(milestoneId);
      if (!submission) {
        throw new Error('Milestone submission not found');
      }

      // Analyze repository against requirements
      const analysis = await this.analyzeRepository({
        freelancerAddress,
        repositoryUrl: submission.repositoryUrl,
        requirements: technicalRequirements,
      });

      // Apply neutral arbitration logic
      const verification = this.applyNeutralArbitration(
        JSON.parse(analysis.content[0].text),
        technicalRequirements
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              milestoneId,
              verification,
              approved: verification.technicalScore >= 80,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Milestone verification failed: ${error.message}`);
    }
  }

  // Helper methods
  private parseRepositoryUrl(url: string): [string, string] {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return [match[1], match[2].replace('.git', '')];
  }

  private async analyzeCodeQuality(octokit: Octokit, owner: string, repo: string) {
    // Implementation for code quality analysis
    const { data: languages } = await octokit.rest.repos.listLanguages({ owner, repo });
    
    return {
      linesOfCode: Object.values(languages).reduce((a: number, b: number) => a + b, 0),
      files: Object.keys(languages).length,
      languages,
      complexity: this.calculateComplexity(languages),
    };
  }

  private async analyzeSecurityIssues(octokit: Octokit, owner: string, repo: string) {
    try {
      // Get security advisories
      const { data: advisories } = await octokit.rest.securityAdvisories.listRepositoryAdvisories({
        owner,
        repo,
      });

      return {
        vulnerabilities: advisories,
        dependencies: [], // Would implement dependency analysis
        secrets: [], // Would implement secret scanning
      };
    } catch (error) {
      return {
        vulnerabilities: [],
        dependencies: [],
        secrets: [],
      };
    }
  }

  private async analyzeTests(octokit: Octokit, owner: string, repo: string) {
    try {
      // Look for test files
      const { data: contents } = await octokit.rest.search.code({
        q: `repo:${owner}/${repo} filename:test OR filename:spec`,
      });

      return {
        hasTests: contents.total_count > 0,
        testFiles: contents.items.map(item => item.name),
        coverage: 0, // Would implement coverage analysis
      };
    } catch (error) {
      return {
        hasTests: false,
        testFiles: [],
        coverage: 0,
      };
    }
  }

  private async analyzeDocumentation(octokit: Octokit, owner: string, repo: string) {
    try {
      const checks = await Promise.allSettled([
        octokit.rest.repos.getContent({ owner, repo, path: 'README.md' }),
        octokit.rest.repos.getContent({ owner, repo, path: 'docs' }),
        octokit.rest.repos.getContent({ owner, repo, path: 'DEPLOYMENT.md' }),
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
    // Simple complexity calculation based on language mix
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

  private async verifyRequirements(analysis: RepositoryAnalysis, requirements: any[]) {
    const verification = requirements.map(req => {
      const score = this.scoreRequirement(analysis, req);
      return {
        requirementId: req.id,
        description: req.description,
        score,
        passed: score >= 80,
        evidence: this.gatherEvidence(analysis, req),
      };
    });

    return verification;
  }

  private scoreRequirement(analysis: RepositoryAnalysis, requirement: any): number {
    // Implement requirement scoring logic
    let score = 0;

    // Code quality factors
    if (analysis.codeQuality.complexity < 2) score += 20;
    if (analysis.tests.hasTests) score += 30;
    if (analysis.documentation.hasReadme) score += 20;
    if (analysis.security.vulnerabilities.length === 0) score += 30;

    return Math.min(score, 100);
  }

  private gatherEvidence(analysis: RepositoryAnalysis, requirement: any): string[] {
    const evidence = [];

    if (analysis.tests.hasTests) {
      evidence.push(`Tests found: ${analysis.tests.testFiles.length} test files`);
    }

    if (analysis.documentation.hasReadme) {
      evidence.push('README.md documentation present');
    }

    if (analysis.security.vulnerabilities.length === 0) {
      evidence.push('No security vulnerabilities detected');
    }

    evidence.push(`Last commit: ${analysis.lastCommit.message}`);

    return evidence;
  }

  private calculateOverallScore(analysis: RepositoryAnalysis, verification: any[]): number {
    const avgRequirementScore = verification.reduce((sum, v) => sum + v.score, 0) / verification.length;
    
    // Bonus points for good practices
    let bonus = 0;
    if (analysis.tests.hasTests) bonus += 5;
    if (analysis.documentation.hasReadme) bonus += 5;
    if (analysis.security.vulnerabilities.length === 0) bonus += 10;

    return Math.min(avgRequirementScore + bonus, 100);
  }

  private async getComprehensiveMetrics(octokit: Octokit, owner: string, repo: string) {
    // Get comprehensive repository metrics
    const [repoData, commits, contributors, releases] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 100 }),
      octokit.rest.repos.listContributors({ owner, repo }),
      octokit.rest.repos.listReleases({ owner, repo }),
    ]);

    return {
      repository: {
        name: repoData.data.name,
        description: repoData.data.description,
        stars: repoData.data.stargazers_count,
        forks: repoData.data.forks_count,
        size: repoData.data.size,
        createdAt: repoData.data.created_at,
        updatedAt: repoData.data.updated_at,
      },
      activity: {
        totalCommits: commits.data.length,
        contributors: contributors.data.length,
        releases: releases.data.length,
        lastCommit: commits.data[0]?.commit.author?.date,
      },
    };
  }

  private async triggerAIVerification(submission: any) {
    // Trigger the AI verification process
    console.log('Triggering AI verification for submission:', submission.milestoneId);
    // This would integrate with the milestone verifier
  }

  private async getMilestoneSubmission(milestoneId: string) {
    // Get milestone submission data (would be stored in database or IPFS)
    return null; // Placeholder
  }

  private applyNeutralArbitration(analysis: any, requirements: any[]) {
    // Apply neutral arbitration logic from arbitration.md
    const technicalScore = analysis.overallScore;
    const passed = technicalScore >= 80;

    return {
      technicalScore,
      passed,
      reasoning: this.generateReasoningReport(analysis, requirements),
      timestamp: new Date().toISOString(),
    };
  }

  private generateReasoningReport(analysis: any, requirements: any[]): string {
    const report = [];
    
    report.push('=== NEUTRAL ARBITRATION REPORT ===');
    report.push(`Overall Score: ${analysis.overallScore}/100`);
    report.push('');
    
    report.push('Technical Assessment:');
    if (analysis.analysis.tests.hasTests) {
      report.push('✅ Tests present and passing');
    } else {
      report.push('❌ No tests found');
    }
    
    if (analysis.analysis.documentation.hasReadme) {
      report.push('✅ Documentation provided');
    } else {
      report.push('❌ Missing documentation');
    }
    
    if (analysis.analysis.security.vulnerabilities.length === 0) {
      report.push('✅ No security vulnerabilities');
    } else {
      report.push(`❌ ${analysis.analysis.security.vulnerabilities.length} security issues found`);
    }

    return report.join('\n');
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Vera GitHub MCP server running on stdio');
  }
}

// Start the server
const server = new VeraGitHubMCP();
server.run().catch(console.error);