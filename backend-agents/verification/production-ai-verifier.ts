/**
 * Vera Protocol - Production AI Verification Service
 * Uses OpenAI GPT-4 or Anthropic Claude for real code analysis
 * 
 * This is the PRODUCTION system - NOT using Kiro (dev tool only)
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Octokit } from '@octokit/rest';
import { ethers } from 'ethers';

// Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // 'openai' or 'anthropic'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface VerificationRequest {
  projectId: string;
  milestoneId: string;
  repositoryUrl: string;
  ipfsAgreementHash: string;
  requirements: {
    technical: string[];
    subjective: string[];
  };
  freelancerAddress: string;
}

interface VerificationResult {
  approved: boolean;
  technicalScore: number; // 0-100
  subjectiveScore: number; // 0-100
  reasoning: string;
  issues: string[];
  recommendations: string[];
  technicalAmount: string;
  subjectiveAmount: string;
  signature?: string;
}

export class ProductionAIVerifier {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private github: Octokit;
  private wallet: ethers.Wallet;
  private contractAddress: string;

  constructor(
    privateKey: string,
    contractAddress: string,
    githubToken?: string
  ) {
    // Initialize AI provider
    if (AI_PROVIDER === 'openai' && OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    } else if (AI_PROVIDER === 'anthropic' && ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    } else {
      throw new Error('No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY');
    }

    // Initialize GitHub
    this.github = new Octokit({ 
      auth: githubToken || GITHUB_TOKEN 
    });

    // Initialize wallet for signing
    this.wallet = new ethers.Wallet(privateKey);
    this.contractAddress = contractAddress;
  }

  /**
   * Main verification function - analyzes repository and generates signature
   */
  async verifyMilestone(request: VerificationRequest): Promise<VerificationResult> {
    console.log(`🔍 Starting AI verification for milestone: ${request.milestoneId}`);

    try {
      // 1. Fetch repository content
      const repoContent = await this.fetchRepositoryContent(request.repositoryUrl);

      // 2. Fetch IPFS agreement
      const agreement = await this.fetchIPFSAgreement(request.ipfsAgreementHash);

      // 3. Analyze with AI
      const analysis = await this.analyzeWithAI(
        repoContent,
        request.requirements,
        agreement
      );

      // 4. Calculate payment split (80/20)
      const milestone = agreement.payment.milestones.find(
        (m: any) => m.id === request.milestoneId
      );
      
      if (!milestone) {
        throw new Error('Milestone not found in agreement');
      }

      const totalAmount = BigInt(milestone.amount);
      const technicalAmount = (totalAmount * BigInt(80)) / BigInt(100);
      const subjectiveAmount = totalAmount - technicalAmount;

      // 5. Generate EIP-712 signature if approved
      let signature: string | undefined;
      if (analysis.approved) {
        signature = await this.generateEIP712Signature({
          projectId: request.projectId,
          milestoneId: request.milestoneId,
          freelancer: request.freelancerAddress,
          technicalAmount: technicalAmount.toString(),
          subjectiveAmount: subjectiveAmount.toString(),
          timestamp: Math.floor(Date.now() / 1000),
          approved: true
        });
      }

      return {
        approved: analysis.approved,
        technicalScore: analysis.technicalScore,
        subjectiveScore: analysis.subjectiveScore,
        reasoning: analysis.reasoning,
        issues: analysis.issues,
        recommendations: analysis.recommendations,
        technicalAmount: technicalAmount.toString(),
        subjectiveAmount: subjectiveAmount.toString(),
        signature
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Verification failed:', errorMessage);
      throw new Error(`Verification failed: ${errorMessage}`);
    }
  }

  /**
   * Fetch repository content from GitHub
   */
  private async fetchRepositoryContent(repositoryUrl: string): Promise<{
    files: Array<{ path: string; content: string }>;
    readme: string | null;
    packageJson: any;
    commits: number;
    hasTests: boolean;
  }> {
    const [owner, repo] = this.parseGitHubUrl(repositoryUrl);

    // Get repository tree
    const { data: repoData } = await this.github.rest.repos.get({ owner, repo });
    const { data: tree } = await this.github.rest.git.getTree({
      owner,
      repo,
      tree_sha: repoData.default_branch,
      recursive: '1'
    });

    // Get important files
    const files: Array<{ path: string; content: string }> = [];
    let readme: string | null = null;
    let packageJson: any = null;

    // Fetch key files (limit to prevent rate limits)
    const importantFiles = tree.tree
      .filter((item) => item.type === 'blob' && item.path)
      .filter((item) => {
        const path = item.path!.toLowerCase();
        return (
          path.endsWith('.ts') ||
          path.endsWith('.js') ||
          path.endsWith('.tsx') ||
          path.endsWith('.jsx') ||
          path.endsWith('.sol') ||
          path === 'readme.md' ||
          path === 'package.json'
        );
      })
      .slice(0, 20); // Limit to 20 files to avoid token limits

    for (const file of importantFiles) {
      if (!file.path) continue;

      try {
        const { data } = await this.github.rest.repos.getContent({
          owner,
          repo,
          path: file.path
        });

        if ('content' in data) {
          const content = Buffer.from(data.content, 'base64').toString('utf-8');
          
          if (file.path.toLowerCase() === 'readme.md') {
            readme = content;
          } else if (file.path.toLowerCase() === 'package.json') {
            packageJson = JSON.parse(content);
          } else {
            files.push({ path: file.path, content });
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch ${file.path}`);
      }
    }

    // Check for tests
    const hasTests = tree.tree.some(
      (item) =>
        item.path?.includes('test') ||
        item.path?.includes('spec') ||
        item.path?.includes('__tests__')
    );

    // Get commit count
    const { data: commits } = await this.github.rest.repos.listCommits({
      owner,
      repo,
      per_page: 100
    });

    return {
      files,
      readme,
      packageJson,
      commits: commits.length,
      hasTests
    };
  }

  /**
   * Analyze code using AI (OpenAI GPT-4 or Anthropic Claude)
   */
  private async analyzeWithAI(
    repoContent: any,
    requirements: { technical: string[]; subjective: string[] },
    agreement: any
  ): Promise<{
    approved: boolean;
    technicalScore: number;
    subjectiveScore: number;
    reasoning: string;
    issues: string[];
    recommendations: string[];
  }> {
    const prompt = this.buildAnalysisPrompt(repoContent, requirements, agreement);

    let response: string;

    if (this.openai) {
      // Use OpenAI GPT-4
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a neutral code arbitrator for Vera Protocol escrow system. Analyze code objectively and fairly. Return valid JSON only.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Low temperature for consistency
        response_format: { type: 'json_object' }
      });

      response = completion.choices[0].message.content || '{}';
    } else if (this.anthropic) {
      // Use Anthropic Claude
      const completion = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      response = completion.content[0].type === 'text' ? completion.content[0].text : '{}';
    } else {
      throw new Error('No AI provider available');
    }

    // Parse AI response
    const analysis = JSON.parse(response);

    return {
      approved: analysis.technicalScore >= 80, // Auto-approve if 80%+
      technicalScore: analysis.technicalScore,
      subjectiveScore: analysis.subjectiveScore,
      reasoning: analysis.reasoning,
      issues: analysis.issues || [],
      recommendations: analysis.recommendations || []
    };
  }

  /**
   * Build comprehensive analysis prompt for AI
   */
  private buildAnalysisPrompt(
    repoContent: any,
    requirements: { technical: string[]; subjective: string[] },
    agreement: any
  ): string {
    return `You are a neutral code arbitrator for an escrow system. Analyze this repository objectively.

**PROJECT REQUIREMENTS:**
${requirements.technical.map((req, i) => `${i + 1}. ${req}`).join('\n')}

**SUBJECTIVE REQUIREMENTS:**
${requirements.subjective.map((req, i) => `${i + 1}. ${req}`).join('\n')}

**REPOSITORY ANALYSIS:**
- Files: ${repoContent.files.length}
- Has Tests: ${repoContent.hasTests ? 'Yes' : 'No'}
- Commits: ${repoContent.commits}
- README: ${repoContent.readme ? 'Present' : 'Missing'}
- Package.json: ${repoContent.packageJson ? 'Present' : 'Missing'}

**SAMPLE CODE FILES:**
${repoContent.files.slice(0, 5).map((f: any) => `
File: ${f.path}
\`\`\`
${f.content.slice(0, 500)}...
\`\`\`
`).join('\n')}

**README CONTENT:**
${repoContent.readme ? repoContent.readme.slice(0, 1000) : 'No README found'}

**EVALUATION CRITERIA:**
1. **Code Quality (30%)**: Clean code, proper structure, TypeScript/types
2. **Functionality (40%)**: Meets technical requirements
3. **Security (20%)**: No vulnerabilities, proper validation
4. **Documentation (10%)**: README, comments, API docs

**80/20 SPLIT RULE:**
- Technical score ≥80% → Auto-release 80% payment immediately
- Technical score <80% → Reject with specific feedback
- Subjective score is for client review (20% held for 72 hours)

Return ONLY valid JSON in this exact format:
{
  "technicalScore": 0-100,
  "subjectiveScore": 0-100,
  "reasoning": "Detailed explanation of evaluation",
  "issues": ["List of specific issues found"],
  "recommendations": ["List of improvement suggestions"],
  "breakdown": {
    "codeQuality": 0-100,
    "functionality": 0-100,
    "security": 0-100,
    "documentation": 0-100
  }
}

Be objective, evidence-based, and fair. Focus on technical merit.`;
  }

  /**
   * Fetch IPFS agreement
   */
  private async fetchIPFSAgreement(ipfsHash: string): Promise<any> {
    const gateway = process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
    const response = await fetch(`${gateway}${ipfsHash}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch IPFS content: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Generate EIP-712 signature for verified milestone
   */
  private async generateEIP712Signature(data: {
    projectId: string;
    milestoneId: string;
    freelancer: string;
    technicalAmount: string;
    subjectiveAmount: string;
    timestamp: number;
    approved: boolean;
  }): Promise<string> {
    const domain = {
      name: 'VeraProtocol',
      version: '1.0.0',
      chainId: 11155111, // Sepolia
      verifyingContract: this.contractAddress
    };

    const types = {
      VerificationData: [
        { name: 'projectId', type: 'bytes32' },
        { name: 'milestoneId', type: 'bytes32' },
        { name: 'freelancer', type: 'address' },
        { name: 'technicalAmount', type: 'uint256' },
        { name: 'subjectiveAmount', type: 'uint256' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'approved', type: 'bool' }
      ]
    };

    const value = {
      projectId: ethers.keccak256(ethers.toUtf8Bytes(data.projectId)),
      milestoneId: ethers.keccak256(ethers.toUtf8Bytes(data.milestoneId)),
      freelancer: data.freelancer,
      technicalAmount: data.technicalAmount,
      subjectiveAmount: data.subjectiveAmount,
      timestamp: data.timestamp,
      approved: data.approved
    };

    const signature = await this.wallet.signTypedData(domain, types, value);
    return signature;
  }

  /**
   * Parse GitHub repository URL
   */
  private parseGitHubUrl(url: string): [string, string] {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return [match[1], match[2].replace('.git', '')];
  }
}

// Factory function
export function createProductionVerifier(
  privateKey: string,
  contractAddress: string,
  githubToken?: string
): ProductionAIVerifier {
  return new ProductionAIVerifier(privateKey, contractAddress, githubToken);
}
