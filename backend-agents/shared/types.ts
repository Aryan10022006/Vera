/**
 * Vera Protocol - Shared Types for Standalone AI Agents
 * Common interfaces and types used across all agents
 */

// Core Vera Protocol Types
export interface VeraProject {
  projectId: string;
  title: string;
  description: string;
  ipfsHash: string;
  clientAddress: string;
  freelancerAddress: string;
  totalAmount: bigint;
  status: ProjectStatus;
  createdAt: number;
  deadline: number;
}

export interface VeraMilestone {
  milestoneId: string;
  projectId: string;
  title: string;
  description: string;
  requirements: MilestoneRequirement[];
  amount: bigint;
  status: MilestoneStatus;
  submittedAt?: number;
  verifiedAt?: number;
  releasedAt?: number;
}

export interface MilestoneRequirement {
  id: string;
  description: string;
  type: 'technical' | 'subjective';
  weight: number;
  acceptanceCriteria: string[];
  completed: boolean;
  verificationNotes?: string;
}

// Agent Communication Types
export interface AgentRequest {
  id: string;
  type: AgentRequestType;
  payload: any;
  timestamp: number;
  requester: string;
}

export interface AgentResponse {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
  processingTime: number;
}

// Verification Types
export interface VerificationRequest {
  projectId: string;
  milestoneId: string;
  repositoryUrl: string;
  ipfsHash: string;
  freelancerAddress: string;
}

export interface VerificationResult {
  approved: boolean;
  technicalScore: number;
  subjectiveScore: number;
  reasoning: string;
  evidence: string[];
  signature?: string;
  timestamp: number;
}

// Arbitration Types
export interface DisputeCase {
  disputeId: string;
  projectId: string;
  milestoneId: string;
  complainant: 'client' | 'freelancer';
  type: DisputeType;
  description: string;
  evidence: string[];
  status: DisputeStatus;
  createdAt: number;
  resolvedAt?: number;
}

export interface ArbitrationDecision {
  disputeId: string;
  decision: 'approve' | 'reject' | 'partial';
  reasoning: string;
  evidence: string[];
  releaseAmount: bigint;
  timestamp: number;
  appealable: boolean;
}

// GitHub Integration Types
export interface GitHubRepository {
  owner: string;
  repo: string;
  url: string;
  branch: string;
  lastCommit: GitHubCommit;
  languages: Record<string, number>;
  hasTests: boolean;
  hasDocumentation: boolean;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

// Voice Processing Types
export interface VoiceTranscript {
  text: string;
  confidence: number;
  language: string;
  timestamp: number;
  duration: number;
}

export interface ProcessedAgreement {
  projectId: string;
  title: string;
  description: string;
  requirements: {
    technical: TechnicalRequirement[];
    subjective: SubjectiveRequirement[];
  };
  payment: PaymentStructure;
  timeline: ProjectTimeline;
  parties: ProjectParties;
}

// IPFS Types
export interface IPFSMetadata {
  hash: string;
  size: number;
  url: string;
  pinned: boolean;
  timestamp: number;
  gateway: string;
}

export interface IPFSContent {
  data: any;
  metadata: IPFSMetadata;
  verified: boolean;
}

// Enums
export enum ProjectStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  DISPUTED = 'disputed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MilestoneStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RELEASED = 'released',
  DISPUTED = 'disputed'
}

export enum DisputeType {
  TECHNICAL_COMPLIANCE = 'technical_compliance',
  SCOPE_CREEP = 'scope_creep',
  SUBJECTIVE_PREFERENCE = 'subjective_preference',
  PAYMENT_DELAY = 'payment_delay',
  COMMUNICATION = 'communication'
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  CLOSED = 'closed'
}

export enum AgentRequestType {
  VERIFY_MILESTONE = 'verify_milestone',
  RESOLVE_DISPUTE = 'resolve_dispute',
  ANALYZE_REPOSITORY = 'analyze_repository',
  PROCESS_VOICE = 'process_voice',
  PIN_TO_IPFS = 'pin_to_ipfs',
  RETRIEVE_FROM_IPFS = 'retrieve_from_ipfs'
}

// Vera Protocol Constants
export const VERA_CONSTANTS = {
  TECHNICAL_PERCENTAGE: 80,
  SUBJECTIVE_PERCENTAGE: 20,
  SILENT_CONSENT_HOURS: 72,
  AUDIT_WINDOW_HOURS: 24,
  DISPUTE_WINDOW_HOURS: 24,
  MIN_TECHNICAL_SCORE: 80,
  MAX_PROCESSING_TIME_MS: 30000,
  IPFS_GATEWAYS: [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ]
} as const;

// Helper Types
export interface TechnicalRequirement {
  id: string;
  description: string;
  acceptanceCriteria: string[];
  weight: number;
  type: 'technical';
  measurable: boolean;
}

export interface SubjectiveRequirement {
  id: string;
  description: string;
  weight: number;
  type: 'subjective';
  reviewRequired: boolean;
}

export interface PaymentStructure {
  totalAmount: number;
  currency: string;
  technicalPercentage: number;
  subjectivePercentage: number;
  escrowAddress?: string;
}

export interface ProjectTimeline {
  created: number;
  deadline: number;
  silentConsentHours: number;
  milestones: MilestoneTimeline[];
}

export interface MilestoneTimeline {
  milestoneId: string;
  deadline: number;
  submittedAt?: number;
  auditStarted?: number;
  auditCompleted?: number;
  clientReviewDeadline?: number;
  autoReleaseAt?: number;
}

export interface ProjectParties {
  client: string;
  freelancer: string;
  arbiter?: string;
}

// Utility Types
export type AgentType = 'github' | 'arbitration' | 'voice' | 'ipfs' | 'verification';
export type NetworkType = 'mainnet' | 'sepolia' | 'localhost';
export type CurrencyType = 'ETH' | 'USD' | 'USDC';

// Error Types
export class VeraError extends Error {
  constructor(
    message: string,
    public code: string,
    public agent: AgentType,
    public details?: any
  ) {
    super(message);
    this.name = 'VeraError';
  }
}

export class ArbitrationError extends VeraError {
  constructor(message: string, details?: any) {
    super(message, 'ARBITRATION_ERROR', 'arbitration', details);
  }
}

export class GitHubError extends VeraError {
  constructor(message: string, details?: any) {
    super(message, 'GITHUB_ERROR', 'github', details);
  }
}

export class IPFSError extends VeraError {
  constructor(message: string, details?: any) {
    super(message, 'IPFS_ERROR', 'ipfs', details);
  }
}

export class VoiceProcessingError extends VeraError {
  constructor(message: string, details?: any) {
    super(message, 'VOICE_ERROR', 'voice', details);
  }
}

export class VerificationError extends VeraError {
  constructor(message: string, details?: any) {
    super(message, 'VERIFICATION_ERROR', 'verification', details);
  }
}