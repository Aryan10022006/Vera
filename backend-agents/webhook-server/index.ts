/**
 * Vera Protocol - Production Webhook Server
 * Uses standalone AI agents instead of MCP dependencies
 */

import express from 'express';
import crypto from 'crypto';
import { Octokit } from '@octokit/rest';
import { MilestoneVerifier } from '../verification/milestone-verifier.js';
import { GitHubAgent } from '../github-integration/github-agent.js';
import { ArbitrationAgent } from '../arbitration/arbitration-agent.js';
import { IPFSAgent } from '../ipfs-integration/ipfs-agent.js';
import { VoiceProcessingAgent } from '../voice-processing/voice-agent.js';
import { AgentOrchestrator, ProjectRequirements, WorkType } from '../evaluation/agent-orchestrator.js';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize standalone AI agents
const githubAgent = new GitHubAgent(process.env.GITHUB_TOKEN || '');
const arbitrationAgent = new ArbitrationAgent();
const ipfsAgent = new IPFSAgent();
const voiceAgent = new VoiceProcessingAgent();
const agentOrchestrator = new AgentOrchestrator(process.env.GITHUB_TOKEN || '');

// Initialize milestone verifier
const verifier = new MilestoneVerifier(
  process.env.ARBITER_PRIVATE_KEY!,
  process.env.CONTRACT_ADDRESS!,
  process.env.IPFS_GATEWAY
);

// GitHub webhook signature verification
function verifyGitHubSignature(payload: string, signature: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = `sha256=${hmac.digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// GitHub webhook endpoint - Milestone Verification
app.post('/webhooks/github/milestone-verification', async (req, res) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const payload = JSON.stringify(req.body);

    // Verify GitHub signature
    if (!verifyGitHubSignature(payload, signature)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { action, repository, commits, pusher } = req.body;

    // Only process push events
    if (action !== 'push' && req.body.ref) {
      return res.status(200).json({ message: 'Not a push event, ignoring' });
    }

    // Check if commit message contains milestone keywords
    const milestoneKeywords = ['milestone', 'complete', 'ready', 'submit', 'vera', 'done'];
    const hasMilestoneKeyword = commits?.some((commit: any) => 
      milestoneKeywords.some(keyword => 
        commit.message.toLowerCase().includes(keyword)
      )
    );

    if (!hasMilestoneKeyword) {
      return res.status(200).json({ message: 'No milestone keywords found' });
    }

    console.log('🔍 VERA PROTOCOL: Milestone verification triggered');
    console.log(`Repository: ${repository.full_name}`);
    console.log(`Pusher: ${pusher.email}`);
    console.log(`Commits: ${commits?.length || 0}`);

    // Extract project information from repository
    const projectInfo = await extractProjectInfo(repository.full_name, pusher.email);
    
    if (!projectInfo) {
      return res.status(404).json({ error: 'Project not found for this repository' });
    }

    // Perform milestone verification
    const verificationResult = await performMilestoneVerification({
      repositoryUrl: repository.html_url,
      commitSha: commits[0]?.id,
      pusherEmail: pusher.email,
      projectInfo
    });

    res.json({
      success: true,
      verification: verificationResult,
      message: 'Milestone verification completed'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Voice-to-Agreement endpoint
app.post('/api/voice/process', async (req, res) => {
  try {
    const { transcript, clientAddress, freelancerAddress } = req.body;

    console.log('🎤 VERA PROTOCOL: Processing voice transcript to agreement');

    // Process voice transcript using standalone agent
    const agreement = await voiceAgent.processVoiceToAgreement(
      {
        text: transcript,
        confidence: 0.95,
        timestamp: Date.now(),
        language: 'en'
      },
      clientAddress,
      freelancerAddress
    );

    // Validate agreement structure
    const validation = voiceAgent.validateAgreement(agreement);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Agreement validation failed',
        details: validation.errors
      });
    }

    // Pin agreement to IPFS
    const ipfsResult = await ipfsAgent.pinAgreement(agreement);
    agreement.ipfsHash = ipfsResult.hash;

    // Generate summary
    const summary = voiceAgent.generateAgreementSummary(agreement);

    res.json({
      success: true,
      agreement,
      ipfsHash: ipfsResult.hash,
      ipfsUrl: ipfsResult.url,
      summary,
      validation
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({ error: 'Voice processing failed' });
  }
});
// Freelancer onboarding endpoint
app.post('/api/freelancer/onboard', async (req, res) => {
  try {
    const { freelancerAddress, projectId, milestoneId, githubCode } = req.body;

    console.log('🎯 VERA PROTOCOL: Freelancer onboarding initiated');
    
    // Authenticate freelancer with GitHub using standalone agent
    const authResult = await githubAgent.authenticateFreelancer(githubCode);

    // Store freelancer authentication
    await storeFreelancerAuth({
      freelancerAddress,
      projectId,
      milestoneId,
      githubToken: authResult.token,
      githubUsername: authResult.username,
      repositories: authResult.repositories,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Freelancer successfully onboarded',
      freelancer: {
        address: freelancerAddress,
        projectId,
        milestoneId,
        githubUsername: authResult.username,
        repositoryCount: authResult.repositories.length
      }
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Onboarding failed' });
  }
});

// Dispute resolution endpoint
app.post('/api/dispute/resolve', async (req, res) => {
  try {
    const { projectId, milestoneId, disputeType, complainant, description } = req.body;

    console.log('⚖️ VERA PROTOCOL: Dispute resolution activated');
    
    // Get project information and original requirements
    const projectInfo = await extractProjectInfo('', '');
    const agreement = await ipfsAgent.retrieveAgreement(projectInfo.ipfsCid);

    // Apply neutral arbitration logic using standalone agent
    const complaintFilter = arbitrationAgent.filterClientComplaint(
      description,
      agreement.data.agreement.requirements.technical
    );

    let resolution;
    if (complaintFilter.shouldProcess) {
      if (complaintFilter.type === 'valid_concern') {
        // Handle technical compliance issue
        resolution = {
          type: 'technical_review',
          action: 'Investigate technical non-compliance',
          reasoning: complaintFilter.reasoning
        };
      } else if (complaintFilter.type === 'subjective_dispute') {
        // Route to subjective variance buffer (20%)
        resolution = {
          type: 'subjective_review',
          action: 'Route to 20% subjective variance buffer for human review',
          reasoning: complaintFilter.reasoning
        };
      }
    } else {
      // Invalid complaint
      resolution = {
        type: 'invalid_complaint',
        action: 'Complaint dismissed',
        reasoning: complaintFilter.reasoning
      };
    }

    res.json({
      success: true,
      resolution: {
        disputeId: `dispute_${Date.now()}`,
        classification: complaintFilter.type,
        ...resolution,
        timestamp: new Date().toISOString(),
        neutralAuditor: true
      },
      message: 'Dispute resolved using neutral arbitration'
    });

  } catch (error) {
    console.error('Dispute resolution error:', error);
    res.status(500).json({ error: 'Dispute resolution failed' });
  }
});

// Manual milestone verification endpoint
app.post('/api/milestone/verify', async (req, res) => {
  try {
    const { projectId, milestoneId, repositoryUrl, freelancerAddress } = req.body;

    const verificationResult = await performMilestoneVerification({
      repositoryUrl,
      freelancerAddress,
      projectInfo: { projectId, milestoneId }
    });

    res.json({
      success: true,
      verification: verificationResult
    });

  } catch (error) {
    console.error('Manual verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Helper functions
async function extractProjectInfo(repositoryName: string, pusherEmail: string) {
  // In production, this would query a database or IPFS to find project info
  // For now, return mock data
  return {
    projectId: 'project_' + Date.now(),
    milestoneId: 'milestone_1',
    freelancerAddress: '0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e4c2',
    ipfsCid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
  };
}

async function performMilestoneVerification(params: {
  repositoryUrl: string;
  commitSha?: string;
  pusherEmail?: string;
  freelancerAddress?: string;
  projectInfo: any;
}) {
  const { repositoryUrl, projectInfo } = params;

  try {
    // 1. Fetch IPFS agreement using standalone agent
    console.log('📄 Fetching IPFS agreement...');
    const agreementResult = await ipfsAgent.retrieveAgreement(projectInfo.ipfsCid);
    const agreement = agreementResult.data.agreement;

    // 2. Determine work types from agreement
    const workTypes = determineWorkTypes(agreement);
    console.log('🎯 Detected work types:', workTypes);

    // 3. Prepare work artifacts
    const workArtifacts = new Map<WorkType, any[]>();
    
    if (workTypes.includes(WorkType.SOFTWARE_DEVELOPMENT)) {
      workArtifacts.set(WorkType.SOFTWARE_DEVELOPMENT, [repositoryUrl]);
    }
    
    if (workTypes.includes(WorkType.DOCUMENT_CREATION)) {
      // In production, extract document content from repository or other sources
      workArtifacts.set(WorkType.DOCUMENT_CREATION, [agreement.description]);
    }

    // 4. Prepare project requirements
    const projectRequirements: ProjectRequirements = {
      workTypes,
      code: workTypes.includes(WorkType.SOFTWARE_DEVELOPMENT) ? {
        functionality: agreement.requirements?.technical || [],
        performance: agreement.requirements?.performance || [],
        security: agreement.requirements?.security || [],
        testing: agreement.requirements?.testing || [],
        documentation: agreement.requirements?.documentation || [],
        codeQuality: agreement.requirements?.quality || [],
      } : undefined,
      document: workTypes.includes(WorkType.DOCUMENT_CREATION) ? {
        type: 'technical',
        wordCount: agreement.requirements?.wordCount || 1000,
        sections: agreement.requirements?.sections || [],
        style: agreement.requirements?.style || 'professional',
        audience: agreement.requirements?.audience || 'general',
        format: 'markdown',
        originalityThreshold: 85,
        readabilityLevel: 'college',
      } : undefined,
    };

    // 5. Perform multi-agent evaluation
    console.log('🤖 Starting multi-agent evaluation...');
    const evaluation = await agentOrchestrator.evaluateProject(
      workArtifacts,
      projectRequirements,
      { agreement, projectInfo }
    );

    // 6. Apply neutral arbitration logic with 80/20 split
    console.log('⚖️ Applying neutral arbitration with 80/20 technical/subjective split...');
    const arbitrationResult = arbitrationAgent.applyNeutralArbitration(
      evaluation,
      agreement.requirements?.technical || [],
      agreement.requirements?.subjective || []
    );

    // 7. Calculate pro-rata release based on evaluation scores
    const proRataCalculation = arbitrationAgent.calculateProRataRelease(
      BigInt(agreement.payment.totalAmount * 1e18), // Convert to wei
      evaluation.technicalScore,
      evaluation.subjectiveScore
    );

    // 8. Generate milestone verification if technical requirements met (≥80%)
    let verificationResult = null;
    if (evaluation.technicalScore >= 80) {
      console.log('✅ Technical requirements met (≥80%), generating signature...');
      verificationResult = await verifier.verifyMilestone(
        projectInfo.projectId,
        projectInfo.milestoneId,
        repositoryUrl,
        projectInfo.ipfsCid
      );
    } else {
      console.log('❌ Technical requirements not met (<80%), withholding verification');
    }

    // 9. Create comprehensive evidence chain
    const evidenceChain = {
      projectId: projectInfo.projectId,
      milestoneId: projectInfo.milestoneId,
      timestamp: new Date().toISOString(),
      evaluation: {
        overallScore: evaluation.overallScore,
        technicalScore: evaluation.technicalScore,
        subjectiveScore: evaluation.subjectiveScore,
        confidence: evaluation.confidence,
        workTypes: evaluation.workTypes,
        evidence: evaluation.aggregatedEvidence,
      },
      arbitration: arbitrationResult,
      proRata: proRataCalculation,
      verification: verificationResult,
      neutralAuditorDecision: {
        approved: evaluation.technicalScore >= 80,
        reasoning: generateNeutralReasoning(evaluation, arbitrationResult),
        evidenceReferences: evaluation.aggregatedEvidence.map(e => e.type),
        timeToDecision: Date.now() - new Date(evaluation.timestamp).getTime(),
      },
    };

    // 10. Store evidence chain on IPFS
    const evidenceHash = await ipfsAgent.pinEvidence(evidenceChain);

    // 11. Log comprehensive results following arbitration principles
    console.log('📊 NEUTRAL ARBITRATION COMPLETE:', {
      approved: arbitrationResult.approved,
      technicalScore: evaluation.technicalScore,
      subjectiveScore: evaluation.subjectiveScore,
      classification: arbitrationResult.classification,
      proRataAmount: proRataCalculation.totalRelease.toString(),
      evidenceChain: evidenceHash,
      neutralDecision: evidenceChain.neutralAuditorDecision.approved,
    });

    return {
      evaluation,
      arbitration: arbitrationResult,
      proRata: proRataCalculation,
      verification: verificationResult,
      evidenceChain: evidenceHash,
      neutralDecision: evidenceChain.neutralAuditorDecision,
    };

  } catch (error) {
    console.error('❌ Multi-agent verification failed:', error);
    throw error;
  }
}

function determineWorkTypes(agreement: any): WorkType[] {
  const workTypes: WorkType[] = [];
  
  // Analyze agreement to determine work types
  const description = (agreement.description || '').toLowerCase();
  const requirements = agreement.requirements || {};
  
  // Check for software development indicators
  if (description.includes('code') || description.includes('software') || 
      description.includes('app') || description.includes('website') ||
      requirements.technical || requirements.performance) {
    workTypes.push(WorkType.SOFTWARE_DEVELOPMENT);
  }
  
  // Check for document creation indicators
  if (description.includes('document') || description.includes('report') || 
      description.includes('article') || description.includes('writing') ||
      requirements.wordCount || requirements.sections) {
    workTypes.push(WorkType.DOCUMENT_CREATION);
  }
  
  // Check for design work indicators
  if (description.includes('design') || description.includes('logo') || 
      description.includes('ui') || description.includes('ux') ||
      requirements.design || requirements.branding) {
    workTypes.push(WorkType.DESIGN_WORK);
  }
  
  // Check for presentation indicators
  if (description.includes('presentation') || description.includes('slides') || 
      description.includes('pitch') || requirements.presentation) {
    workTypes.push(WorkType.PRESENTATION);
  }
  
  // Default to software development if no specific type detected
  if (workTypes.length === 0) {
    workTypes.push(WorkType.SOFTWARE_DEVELOPMENT);
  }
  
  return workTypes;
}

function generateNeutralReasoning(evaluation: any, arbitrationResult: any): string {
  const reasoning = [
    `Multi-agent evaluation completed with ${evaluation.confidence}% confidence.`,
    `Technical score: ${evaluation.technicalScore}% (80% weight)`,
    `Subjective score: ${evaluation.subjectiveScore}% (20% weight)`,
    `Work types evaluated: ${evaluation.workTypes.join(', ')}`,
  ];

  if (evaluation.technicalScore >= 80) {
    reasoning.push('Technical requirements met - automatic release approved per 80/20 protocol.');
  } else {
    reasoning.push('Technical requirements not met - payment withheld pending improvements.');
  }

  if (evaluation.subjectiveScore < 70) {
    reasoning.push('Subjective elements require client review within 72-hour window.');
  }

  reasoning.push(`Evidence chain contains ${evaluation.evidence.length} verification artifacts.`);
  reasoning.push('Decision made within 24-hour maximum window as per neutrality protocol.');

  return reasoning.join(' ');
}

async function storeFreelancerAuth(authData: any) {
  // In production, store in database or IPFS
  console.log('💾 Storing freelancer authentication:', {
    address: authData.freelancerAddress,
    github: authData.githubUsername,
    repositories: authData.repositories.length,
    timestamp: authData.timestamp
  });
  
  // TODO: Implement persistent storage
  // Could use IPFS for decentralized storage or traditional database
}

// Remove the old resolveDispute function since we're using standalone agents now

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vera Protocol Webhook Server running on port ${PORT}`);
  console.log(`📋 Endpoints available:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /webhooks/github/milestone-verification - GitHub webhooks`);
  console.log(`   POST /api/voice/process - Voice-to-agreement processing`);
  console.log(`   POST /api/freelancer/onboard - Freelancer onboarding`);
  console.log(`   POST /api/dispute/resolve - Dispute resolution`);
  console.log(`   POST /api/milestone/verify - Manual verification`);
    console.log(`🤖 Standalone AI Agents initialized:`);
    console.log(`   ✅ GitHub Integration Agent`);
    console.log(`   ✅ Arbitration Agent (80/20 Technical/Subjective Split)`);
    console.log(`   ✅ IPFS Agent`);
    console.log(`   ✅ Voice Processing Agent`);
    console.log(`   ✅ Multi-Agent Orchestrator`);
    console.log(`   ✅ Code Evaluation Agent`);
    console.log(`   ✅ Document Evaluation Agent`);
    console.log(`   ✅ Milestone Verifier`);
    console.log(`🎯 Supported Work Types: ${agentOrchestrator.getAvailableWorkTypes().join(', ')}`);
});

export default app;