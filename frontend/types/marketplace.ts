/**
 * Marketplace Types for Vera Protocol
 * Real marketplace where clients post projects and freelancers propose
 */

export interface ProjectListing {
  id: string;
  status: 'open' | 'in_progress' | 'in_review' | 'completed' | 'disputed';
  clientAddress: string;
  title: string;
  description: string;
  budget: {
    total: string; // in ETH
    technical: string; // 80%
    subjective: string; // 20%
  };
  requirements: {
    technical: TechnicalRequirement[];
    subjective: SubjectiveRequirement[];
  };
  timeline: {
    estimated: number; // days
    deadline?: number; // timestamp
  };
  skills: string[];
  ipfsHash?: string;
  createdAt: number;
  proposals: Proposal[];
  selectedFreelancer?: string;
}

export interface TechnicalRequirement {
  id: string;
  description: string;
  acceptanceCriteria: string[];
  weight: number;
}

export interface SubjectiveRequirement {
  id: string;
  description: string;
  weight: number;
}

export interface Proposal {
  id: string;
  freelancerAddress: string;
  freelancerName?: string;
  freelancerAvatar?: string;
  coverLetter: string;
  proposedTimeline: number; // days
  githubProfile?: string;
  portfolio?: string[];
  questions?: string[];
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: number;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  sender: string;
  senderType: 'client' | 'freelancer';
  content: string;
  timestamp: number;
  read: boolean;
}

export interface ProjectChat {
  projectId: string;
  participants: {
    client: string;
    freelancer: string;
  };
  messages: ChatMessage[];
  lastActivity: number;
}

export interface UserProfile {
  address: string;
  type: 'client' | 'freelancer' | 'both';
  name?: string;
  avatar?: string;
  bio?: string;
  githubUsername?: string;
  skills?: string[];
  completedProjects: number;
  totalEarned?: string;
  totalSpent?: string;
  rating?: number;
  joinedAt: number;
}

export interface MarketplaceFilters {
  skills?: string[];
  budgetMin?: number;
  budgetMax?: number;
  timeline?: 'urgent' | 'short' | 'medium' | 'long';
  status?: ProjectListing['status'];
}
