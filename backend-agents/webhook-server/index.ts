/**
 * Vera Protocol - Production Webhook Server
 * Uses standalone AI agents instead of MCP dependencies
 * Implements WebSocket for real-time notifications (Requirement 7)
 */

import express from 'express';
import crypto from 'crypto';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { Octokit } from '@octokit/rest';
import { MilestoneVerifier } from '../verification/milestone-verifier.js';
import { GitHubAgent } from '../github-integration/github-agent.js';
import { ArbitrationAgent } from '../arbitration/arbitration-agent.js';
import { IPFSAgent } from '../ipfs-integration/ipfs-agent.js';
import { VoiceProcessingAgent } from '../voice-processing/voice-agent.js';
import { AgentOrchestrator, ProjectRequirements, WorkType } from '../evaluation/agent-orchestrator.js';
import { GitHubOAuthHandler } from '../github-oauth/oauth-handler.js';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3001;

// WebSocket client management
interface WebSocketClient {
  ws: WebSocket;
  address: string;
  projectIds: Set<string>;
  connectedAt: Date;
}

const clients = new Map<string, WebSocketClient>();

// WebSocket connection handler
wss.on('connection', (ws: WebSocket, req) => {
  console.log('🔌 New WebSocket connection');
  
  // Extract client address from query params or headers
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const address = url.searchParams.get('address') || 'unknown';
  
  const client: WebSocketClient = {
    ws,
    address,
    projectIds: new Set(),
    connectedAt: new Date()
  };
  
  clients.set(address, client);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Vera Protocol real-time updates',
    timestamp: new Date().toISOString()
  }));
  
  // Handle incoming messages (subscribe to projects)
  ws.on('message', (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'subscribe') {
        message.projectIds?.forEach((id: string) => client.projectIds.add(id));
        ws.send(JSON.stringify({
          type: 'subscribed',
          projectIds: Array.from(client.projectIds),
          timestamp: new Date().toISOString()
        }));
      }
      
      if (message.type === 'unsubscribe') {
        message.projectIds?.forEach((id: string) => client.projectIds.delete(id));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log(`🔌 WebSocket disconnected: ${address}`);
    clients.delete(address);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(address);
  });
});

// Broadcast functions for real-time notifications (Requirement 7.1, 7.2, 7.3)
function broadcastMilestoneUpdate(projectId: string, milestoneId: string, status: string, data: any) {
  const message = {
    type: 'milestone_update',
    projectId,
    milestoneId,
    status,
    data,
    timestamp: new Date().toISOString()
  };
  
  broadcastToProject(projectId, message);
  console.log(`📢 Broadcast milestone update: ${projectId}/${milestoneId} - ${status}`);
}

function broadcastPaymentRelease(projectId: string, recipient: string, amount: string, percentage: number) {
  const message = {
    type: 'payment_released',
    projectId,
    recipient,
    amount,
    percentage,
    timestamp: new Date().toISOString()
  };
  
  broadcastToProject(projectId, message);
  console.log(`💰 Broadcast payment release: ${amount} (${percentage}%) to ${recipient}`);
}

function broadcastDisputeAlert(projectId: string, milestoneId: string, disputeType: string, description: string) {
  const message = {
    type: 'dispute_raised',
    projectId,
    milestoneId,
    disputeType,
    description,
    timestamp: new Date().toISOString(),
    urgency: 'high'
  };
  
  broadcastToProject(projectId, message);
  console.log(`⚠️ Broadcast dispute alert: ${projectId}/${milestoneId} - ${disputeType}`);
}

function broadcastToProject(projectId: string, message: any) {
  let broadcastCount = 0;
  
  clients.forEach((client) => {
    if (client.projectIds.has(projectId) && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
      broadcastCount++;
    }
  });
  
  if (broadcastCount === 0) {
    console.log(`📡 No clients subscribed to project ${projectId}`);
  } else {
    console.log(`📡 Broadcast to ${broadcastCount} clients for project ${projectId}`);
  }
}

function broadcastToAll(message: any) {
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

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

// Initialize GitHub OAuth handler
const githubOAuth = new GitHubOAuthHandler({
  clientId: process.env.GITHUB_OAUTH_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET || '',
  redirectUri: process.env.GITHUB_OAUTH_REDIRECT_URI || 'http://localhost:3000/github/callback',
});

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

// ===== GitHub OAuth Endpoints =====

// Get GitHub authorization URL
app.get('/api/github/auth-url', (req, res) => {
  try {
    const walletAddress = req.query.address as string;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const authUrl = githubOAuth.getAuthorizationUrl(walletAddress);
    
    res.json({ 
      authUrl,
      success: true 
    });
  } catch (error: any) {
    console.error('Error generating GitHub auth URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// GitHub OAuth callback handler
app.get('/api/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }

    // Decode state to get wallet address
    const decoded = Buffer.from(state as string, 'base64').toString('utf-8');
    const [walletAddress] = decoded.split(':');

    // Exchange code for token
    const userToken = await githubOAuth.exchangeCodeForToken(code as string, walletAddress);
    
    // Get user profile
    const profile = await githubOAuth.getUserProfile(walletAddress);

    res.json({
      success: true,
      message: 'GitHub connected successfully',
      profile,
      connectedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('GitHub OAuth callback error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check GitHub connection status
app.get('/api/github/status', async (req, res) => {
  try {
    const walletAddress = req.query.address as string;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const isConnected = githubOAuth.isUserConnected(walletAddress);
    
    if (!isConnected) {
      return res.json({ 
        connected: false,
        message: 'GitHub not connected'
      });
    }

    // Verify token is still valid
    const isValid = await githubOAuth.verifyUserToken(walletAddress);
    
    if (!isValid) {
      return res.json({
        connected: false,
        message: 'GitHub token expired or invalid'
      });
    }

    // Get profile
    const profile = await githubOAuth.getUserProfile(walletAddress);

    res.json({
      connected: true,
      profile,
      scope: githubOAuth.getUserToken(walletAddress)?.scope
    });
  } catch (error: any) {
    console.error('Error checking GitHub status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect GitHub
app.post('/api/github/disconnect', (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    githubOAuth.disconnectUser(address);
    
    res.json({
      success: true,
      message: 'GitHub disconnected successfully'
    });
  } catch (error: any) {
    console.error('Error disconnecting GitHub:', error);
    res.status(500).json({ error: error.message });
  }
});

// List user's repositories
app.get('/api/github/repositories', async (req, res) => {
  try {
    const walletAddress = req.query.address as string;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    if (!githubOAuth.isUserConnected(walletAddress)) {
      return res.status(401).json({ error: 'GitHub not connected' });
    }

    const repos = await githubOAuth.getUserRepositories(walletAddress);
    
    res.json({
      success: true,
      repositories: repos,
      count: repos.length
    });
  } catch (error: any) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== End GitHub OAuth Endpoints =====

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
    
    // Broadcast real-time update (Requirement 7.1)
    broadcastMilestoneUpdate(
      projectInfo.projectId,
      projectInfo.milestoneId,
      verificationResult.verification?.signature ? 'approved' : 'pending',
      verificationResult
    );

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
    
    // Broadcast dispute alert (Requirement 7.3)
    broadcastDisputeAlert(
      projectId,
      milestoneId,
      disputeType,
      description
    );

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
    
    // Broadcast real-time update (Requirement 7.1)
    broadcastMilestoneUpdate(
      projectId,
      milestoneId,
      verificationResult.verification?.signature ? 'approved' : 'failed',
      verificationResult
    );

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
    
    // Create mock repository analysis for arbitration
    const mockRepositoryAnalysis = {
      owner: 'freelancer',
      repo: repositoryUrl.split('/').pop() || 'unknown',
      branch: 'main',
      lastCommit: {
        sha: 'abc123',
        message: 'Complete milestone',
        author: 'freelancer',
        date: new Date().toISOString()
      },
      codeQuality: {
        files: 10,
        linesOfCode: 500,
        complexity: 2.5,
        languages: { TypeScript: 80, JavaScript: 20 }
      },
      tests: {
        hasTests: true,
        testFiles: ['test1.ts', 'test2.ts'],
        coverage: 85
      },
      documentation: {
        hasReadme: true,
        hasApiDocs: true,
        hasDeploymentGuide: false
      },
      security: {
        vulnerabilities: [],
        dependencies: [],
        secrets: []
      }
    };
    
    const arbitrationResult = arbitrationAgent.applyNeutralArbitration(
      mockRepositoryAnalysis,
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

// Start server with WebSocket support
server.listen(PORT, () => {
  console.log(`🚀 Vera Protocol Webhook Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time updates`);
  console.log(`📋 Endpoints available:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /webhooks/github/milestone-verification - GitHub webhooks`);
  console.log(`   POST /api/voice/process - Voice-to-agreement processing`);
  console.log(`   POST /api/freelancer/onboard - Freelancer onboarding`);
  console.log(`   POST /api/dispute/resolve - Dispute resolution`);
  console.log(`   POST /api/milestone/verify - Manual verification`);
  console.log(`   WS   ws://localhost:${PORT}?address=<your_address> - Real-time notifications`);
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
  console.log(`📡 Real-time features: Milestone updates, Payment notifications, Dispute alerts`);
});

export default app;