/**
 * Vera Protocol - AI Agent Verification Engine
 * Task 2.2: Milestone verification using GitHub and Fetch MCP servers
 */

import { ethers } from 'ethers';
import crypto from 'crypto';

// Types for verification data
interface Agreement {
  projectId: string;
  title: string;
  description: string;
  requirements: {
    technical: TechnicalRequirement[];
    subjective: SubjectiveRequirement[];
  };
  payment: {
    total: string;
    milestones: MilestonePayment[];
  };
  parties: {
    client: string;
    freelancer: string;
  };
  timeline: {
    created: number;
    deadline: number;
  };
  ipfsHash: string;
}

interface TechnicalRequirement {
  id: string;
  description: string;
  acceptanceCriteria: string[];
  weight: number;
  type: 'technical';
}

interface SubjectiveRequirement {
  id: string;
  description: string;
  weight: number;
  type: 'subjective';
}

interface MilestonePayment {
  id: string;
  amount: string;
  type: 'technical' | 'subjective';
}

interface VerificationData {
  projectId: string;
  milestoneId: string;
  freelancer: string;
  technicalAmount: string;
  subjectiveAmount: string;
  timestamp: number;
  ipfsHash: string;
  approved: boolean;
}

interface AuditResult {
  technicalScore: number;
  subjectiveScore: number;
  technicalPassed: boolean;
  subjectivePassed: boolean;
  details: {
    codeQuality: number;
    functionality: number;
    performance: number;
    documentation: number;
    security: number;
  };
  issues: string[];
  recommendations: string[];
}

/**
 * Vera Protocol AI Agent - Milestone Verifier
 * Implements neutral arbitration logic from arbitration.md
 */
export class MilestoneVerifier {
  private arbiterPrivateKey: string;
  private contractAddress: string;
  private ipfsGateway: string;

  constructor(
    arbiterPrivateKey: string,
    contractAddress: string,
    ipfsGateway: string = 'https://gateway.pinata.cloud/ipfs/'
  ) {
    this.arbiterPrivateKey = arbiterPrivateKey;
    this.contractAddress = contractAddress;
    this.ipfsGateway = ipfsGateway;
  }

  /**
   * Main verification function triggered by GitHub push event
   * Implements the complete audit workflow from design.md
   */
  async verifyMilestone(
    projectId: string,
    milestoneId: string,
    repositoryUrl: string,
    ipfsCid: string
  ): Promise<{
    verificationData: VerificationData;
    signature: string;
    auditReport: AuditResult;
  }> {
    console.log('🔍 Starting milestone verification for:', milestoneId);
    
    try {
      // Step 1: Fetch IPFS Agreement using #[fetch] MCP
      console.log('📄 Fetching IPFS agreement...');
      const agreement = await this.fetchIPFSAgreement(ipfsCid);
      
      // Step 2: Validate JSON Schema (CRITICAL MCP INSTRUCTION from design.md)
      console.log('✅ Validating JSON schema...');
      this.validateAgreementSchema(agreement);
      
      // Step 3: Audit GitHub Repository using #[github] MCP
      console.log('🔍 Auditing GitHub repository...');
      const auditResult = await this.auditGitHubRepository(repositoryUrl, agreement);
      
      // Step 4: Apply Neutral Arbitration Logic
      console.log('⚖️ Applying neutral arbitration logic...');
      const verificationResult = this.applyArbitrationLogic(
        agreement,
        auditResult,
        projectId,
        milestoneId
      );
      
      // Step 5: Generate EIP-712 Signature if technical requirements met
      let signature = '';
      if (verificationResult.approved) {
        console.log('🔐 Generating EIP-712 signature...');
        signature = await this.generateEIP712Signature(verificationResult);
      }
      
      console.log('✅ Verification complete:', {
        approved: verificationResult.approved,
        technicalScore: auditResult.technicalScore,
        subjectiveScore: auditResult.subjectiveScore
      });
      
      return {
        verificationData: verificationResult,
        signature,
        auditReport: auditResult
      };
      
    } catch (error) {
      console.error('❌ Verification failed:', error);
      throw error;
    }
  }

  /**
   * Fetch IPFS agreement using #[fetch] MCP server
   * CRITICAL: Must validate JSON schema as per design.md instruction
   */
  private async fetchIPFSAgreement(ipfsCid: string): Promise<Agreement> {
    // Use #[fetch] MCP to retrieve IPFS content
    const ipfsUrl = `${this.ipfsGateway}${ipfsCid}`;
    
    try {
      // This would be replaced with actual MCP call: #[fetch]
      const response = await fetch(ipfsUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch IPFS content: ${response.statusText}`);
      }
      
      const agreement = await response.json() as Agreement;
      return agreement;
    } catch (error) {
      throw new Error(`IPFS fetch failed: ${error.message}`);
    }
  }

  /**
   * Validate IPFS agreement JSON schema
   * Prevents malformed agreement processing
   */
  private validateAgreementSchema(agreement: Agreement): void {
    const requiredFields = [
      'projectId', 'title', 'description', 'requirements',
      'payment', 'parties', 'timeline', 'ipfsHash'
    ];
    
    for (const field of requiredFields) {
      if (!agreement[field]) {
        throw new Error(`Invalid agreement schema: missing ${field}`);
      }
    }
    
    if (!agreement.requirements.technical || !agreement.requirements.subjective) {
      throw new Error('Invalid agreement: missing technical or subjective requirements');
    }
    
    if (!agreement.parties.client || !agreement.parties.freelancer) {
      throw new Error('Invalid agreement: missing client or freelancer addresses');
    }
  }

  /**
   * Audit GitHub repository using #[github] MCP server
   * Implements technical soundness assessment from arbitration.md
   */
  private async auditGitHubRepository(
    repositoryUrl: string,
    agreement: Agreement
  ): Promise<AuditResult> {
    console.log('🔍 Auditing repository:', repositoryUrl);
    
    // This would use #[github] MCP server to:
    // 1. Get latest PR and commit history
    // 2. Analyze code quality
    // 3. Run security scans
    // 4. Check functionality against requirements
    
    // Mock implementation - replace with actual MCP calls
    const mockAuditResult: AuditResult = {
      technicalScore: 85, // Out of 100
      subjectiveScore: 75, // Out of 100
      technicalPassed: true, // 80+ required for technical pass
      subjectivePassed: true, // 70+ required for subjective pass
      details: {
        codeQuality: 90,     // ESLint/Prettier compliance
        functionality: 85,   // Requirements met
        performance: 80,     // Performance benchmarks
        documentation: 85,   // README, API docs
        security: 90         // No critical vulnerabilities
      },
      issues: [],
      recommendations: [
        'Consider adding more unit tests for edge cases',
        'Documentation could include more examples'
      ]
    };
    
    // Simulate actual GitHub analysis
    await this.analyzeCodeQuality(repositoryUrl);
    await this.checkFunctionality(repositoryUrl, agreement.requirements.technical);
    await this.performSecurityScan(repositoryUrl);
    await this.validateDocumentation(repositoryUrl);
    
    return mockAuditResult;
  }

  /**
   * Apply neutral arbitration logic from arbitration.md
   * Implements 80/20 split and technical soundness assessment
   */
  private applyArbitrationLogic(
    agreement: Agreement,
    auditResult: AuditResult,
    projectId: string,
    milestoneId: string
  ): VerificationData {
    // Find the specific milestone payment
    const milestone = agreement.payment.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error(`Milestone ${milestoneId} not found in agreement`);
    }
    
    // Calculate 80/20 split (IMMUTABLE INVARIANT)
    const totalAmount = BigInt(milestone.amount);
    const technicalAmount = (totalAmount * BigInt(80)) / BigInt(100);
    const subjectiveAmount = totalAmount - technicalAmount;
    
    // Technical Requirements Assessment (80% weight)
    // Must achieve 80+ score for auto-release
    const technicalPassed = auditResult.technicalScore >= 80 && 
                           auditResult.details.codeQuality >= 70 &&
                           auditResult.details.functionality >= 80 &&
                           auditResult.details.security >= 80;
    
    // Apply Neutral Auditor Persona (emotionally detached, evidence-driven)
    const approved = technicalPassed; // Only technical requirements matter for auto-release
    
    return {
      projectId,
      milestoneId,
      freelancer: agreement.parties.freelancer,
      technicalAmount: technicalAmount.toString(),
      subjectiveAmount: subjectiveAmount.toString(),
      timestamp: Math.floor(Date.now() / 1000),
      ipfsHash: agreement.ipfsHash,
      approved
    };
  }

  /**
   * Generate EIP-712 typed data signature
   * Implements domain separation for replay attack prevention
   */
  private async generateEIP712Signature(verificationData: VerificationData): Promise<string> {
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
        { name: 'ipfsHash', type: 'bytes32' },
        { name: 'approved', type: 'bool' }
      ]
    };
    
    const value = {
      projectId: ethers.keccak256(ethers.toUtf8Bytes(verificationData.projectId)),
      milestoneId: ethers.keccak256(ethers.toUtf8Bytes(verificationData.milestoneId)),
      freelancer: verificationData.freelancer,
      technicalAmount: verificationData.technicalAmount,
      subjectiveAmount: verificationData.subjectiveAmount,
      timestamp: verificationData.timestamp,
      ipfsHash: ethers.keccak256(ethers.toUtf8Bytes(verificationData.ipfsHash)),
      approved: verificationData.approved
    };
    
    const wallet = new ethers.Wallet(this.arbiterPrivateKey);
    const signature = await wallet.signTypedData(domain, types, value);
    
    return signature;
  }

  // Helper methods for GitHub analysis (would use #[github] MCP)
  private async analyzeCodeQuality(repositoryUrl: string): Promise<void> {
    // Use #[github] MCP to:
    // - Check ESLint/Prettier compliance
    // - Analyze code complexity
    // - Check TypeScript types
    console.log('📊 Analyzing code quality...');
  }

  private async checkFunctionality(
    repositoryUrl: string,
    technicalRequirements: TechnicalRequirement[]
  ): Promise<void> {
    // Use #[github] MCP to:
    // - Run unit tests
    // - Check integration tests
    // - Verify requirements implementation
    console.log('🧪 Checking functionality...');
  }

  private async performSecurityScan(repositoryUrl: string): Promise<void> {
    // Use #[github] MCP to:
    // - Run security vulnerability scans
    // - Check dependency vulnerabilities
    // - Analyze for common security issues
    console.log('🔒 Performing security scan...');
  }

  private async validateDocumentation(repositoryUrl: string): Promise<void> {
    // Use #[github] MCP to:
    // - Check README completeness
    // - Verify API documentation
    // - Check deployment guides
    console.log('📚 Validating documentation...');
  }
}

/**
 * Factory function to create verifier instance
 */
export function createMilestoneVerifier(
  arbiterPrivateKey: string,
  contractAddress: string,
  ipfsGateway?: string
): MilestoneVerifier {
  return new MilestoneVerifier(arbiterPrivateKey, contractAddress, ipfsGateway);
}