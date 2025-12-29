/**
 * IPFS utilities for Vera Protocol
 * Handles agreement storage and retrieval
 */

import { create } from 'ipfs-http-client';

// IPFS client configuration
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

// Agreement interface matching the verification engine
export interface Agreement {
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
  ipfsHash?: string;
}

export interface TechnicalRequirement {
  id: string;
  description: string;
  acceptanceCriteria: string[];
  weight: number;
  type: 'technical';
}

export interface SubjectiveRequirement {
  id: string;
  description: string;
  weight: number;
  type: 'subjective';
}

export interface MilestonePayment {
  id: string;
  amount: string;
  type: 'technical' | 'subjective';
}

/**
 * Pin agreement JSON to IPFS using Pinata
 */
export async function pinAgreementToIPFS(agreement: Agreement): Promise<string> {
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY!,
        'pinata_secret_api_key': PINATA_SECRET_KEY!,
      },
      body: JSON.stringify({
        pinataContent: agreement,
        pinataMetadata: {
          name: `vera-agreement-${agreement.projectId}`,
          keyvalues: {
            projectId: agreement.projectId,
            client: agreement.parties.client,
            freelancer: agreement.parties.freelancer,
            type: 'agreement'
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Pinata API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error) {
    console.error('Failed to pin to IPFS:', error);
    throw error;
  }
}

/**
 * Retrieve agreement from IPFS
 */
export async function getAgreementFromIPFS(ipfsHash: string): Promise<Agreement> {
  try {
    const response = await fetch(`${IPFS_GATEWAY}${ipfsHash}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const agreement = await response.json();
    return agreement as Agreement;
  } catch (error) {
    console.error('Failed to retrieve from IPFS:', error);
    throw error;
  }
}

/**
 * Generate agreement from voice input (mock implementation)
 * In production, this would use advanced NLP
 */
export function generateAgreementFromVoice(
  transcript: string,
  client: string,
  freelancer: string
): Agreement {
  // Mock NLP processing - extract key information
  const projectId = `project_${Date.now()}`;
  
  // Simple keyword extraction (would be replaced with proper NLP)
  const title = extractTitle(transcript) || 'Freelance Project';
  const description = extractDescription(transcript) || transcript;
  const totalAmount = extractAmount(transcript) || '1000000000000000000'; // 1 ETH default
  const deadline = extractDeadline(transcript) || Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

  // Generate technical requirements (80% weight)
  const technicalRequirements: TechnicalRequirement[] = [
    {
      id: 'tech_1',
      description: 'Implement core functionality as specified',
      acceptanceCriteria: [
        'Code passes all unit tests',
        'No critical security vulnerabilities',
        'Performance meets specified benchmarks'
      ],
      weight: 0.4,
      type: 'technical'
    },
    {
      id: 'tech_2',
      description: 'Provide comprehensive documentation',
      acceptanceCriteria: [
        'README with setup instructions',
        'API documentation',
        'Deployment guide'
      ],
      weight: 0.4,
      type: 'technical'
    }
  ];

  // Generate subjective requirements (20% weight)
  const subjectiveRequirements: SubjectiveRequirement[] = [
    {
      id: 'subj_1',
      description: 'User interface design and experience',
      weight: 0.2,
      type: 'subjective'
    }
  ];

  // Generate milestone payments
  const milestones: MilestonePayment[] = [
    {
      id: 'milestone_1',
      amount: totalAmount,
      type: 'technical'
    }
  ];

  return {
    projectId,
    title,
    description,
    requirements: {
      technical: technicalRequirements,
      subjective: subjectiveRequirements
    },
    payment: {
      total: totalAmount,
      milestones
    },
    parties: {
      client,
      freelancer
    },
    timeline: {
      created: Date.now(),
      deadline
    }
  };
}

// Helper functions for NLP processing (simplified)
function extractTitle(transcript: string): string | null {
  const titlePatterns = [
    /(?:build|create|develop|make)\s+(?:a|an)?\s*([^.!?]+)/i,
    /(?:project|app|website|system)\s+(?:for|to|that)\s+([^.!?]+)/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = transcript.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

function extractDescription(transcript: string): string {
  // Return first sentence or up to 200 characters
  const sentences = transcript.split(/[.!?]+/);
  return sentences[0].trim().substring(0, 200);
}

function extractAmount(transcript: string): string | null {
  const amountPatterns = [
    /(\d+(?:\.\d+)?)\s*eth/i,
    /(\d+(?:\.\d+)?)\s*ether/i,
    /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/
  ];
  
  for (const pattern of amountPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(',', ''));
      // Convert to wei (assuming ETH)
      return (amount * 1e18).toString();
    }
  }
  
  return null;
}

function extractDeadline(transcript: string): number | null {
  const deadlinePatterns = [
    /(?:in|within)\s+(\d+)\s+days?/i,
    /(?:in|within)\s+(\d+)\s+weeks?/i,
    /(?:by|before)\s+(\w+\s+\d+)/i
  ];
  
  for (const pattern of deadlinePatterns) {
    const match = transcript.match(pattern);
    if (match) {
      if (pattern.source.includes('days')) {
        const days = parseInt(match[1]);
        return Date.now() + (days * 24 * 60 * 60 * 1000);
      } else if (pattern.source.includes('weeks')) {
        const weeks = parseInt(match[1]);
        return Date.now() + (weeks * 7 * 24 * 60 * 60 * 1000);
      }
    }
  }
  
  return null;
}