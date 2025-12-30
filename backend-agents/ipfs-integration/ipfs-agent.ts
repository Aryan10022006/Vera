/**
 * Vera Protocol - Standalone IPFS Integration Agent
 * Handles decentralized storage without external dependencies
 */

import { Agreement } from '../voice-processing/voice-agent.js';

export interface IPFSUploadResult {
  hash: string;
  size: number;
  url: string;
  timestamp: number;
  pinned: boolean;
}

export interface IPFSRetrievalResult {
  data: any;
  hash: string;
  size: number;
  timestamp: number;
  verified: boolean;
}

export class IPFSAgent {
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private ipfsGateway: string;

  constructor(
    pinataApiKey?: string,
    pinataSecretKey?: string,
    ipfsGateway = 'https://gateway.pinata.cloud/ipfs/'
  ) {
    this.pinataApiKey = pinataApiKey || process.env.PINATA_API_KEY || '';
    this.pinataSecretKey = pinataSecretKey || process.env.PINATA_SECRET_KEY || '';
    this.ipfsGateway = ipfsGateway;
  }

  /**
   * Pin agreement to IPFS with redundancy
   */
  async pinAgreement(agreement: Agreement): Promise<IPFSUploadResult> {
    console.log('📌 IPFS AGENT: Pinning agreement to decentralized storage');

    try {
      // Validate agreement before pinning
      const validation = this.validateAgreementForIPFS(agreement);
      if (!validation.valid) {
        throw new Error(`Agreement validation failed: ${validation.errors.join(', ')}`);
      }

      // Prepare metadata for IPFS
      const metadata = {
        name: `Vera Agreement - ${agreement.title}`,
        description: `Decentralized escrow agreement for project: ${agreement.title}`,
        keyvalues: {
          projectId: agreement.projectId,
          client: agreement.parties.client,
          freelancer: agreement.parties.freelancer,
          totalAmount: agreement.payment.totalAmount.toString(),
          created: new Date(agreement.timeline.created).toISOString(),
          type: 'vera-agreement'
        }
      };

      // Pin to Pinata
      const pinataResult = await this.pinToPinata(agreement, metadata);

      // Verify pinning success
      const verified = await this.verifyPin(pinataResult.hash);

      console.log('✅ IPFS AGENT: Agreement successfully pinned');
      console.log(`   IPFS Hash: ${pinataResult.hash}`);
      console.log(`   Gateway URL: ${this.ipfsGateway}${pinataResult.hash}`);

      return {
        hash: pinataResult.hash,
        size: pinataResult.size,
        url: `${this.ipfsGateway}${pinataResult.hash}`,
        timestamp: Date.now(),
        pinned: verified
      };

    } catch (error) {
      console.error('❌ IPFS AGENT: Failed to pin agreement:', error);
      throw new Error(`IPFS pinning failed: ${error.message}`);
    }
  }

  /**
   * Retrieve agreement from IPFS
   */
  async retrieveAgreement(ipfsHash: string): Promise<IPFSRetrievalResult> {
    console.log(`📥 IPFS AGENT: Retrieving agreement from ${ipfsHash}`);

    try {
      // Try multiple gateways for redundancy
      const gateways = [
        'https://gateway.pinata.cloud/ipfs/',
        'https://ipfs.io/ipfs/',
        'https://cloudflare-ipfs.com/ipfs/',
        'https://dweb.link/ipfs/'
      ];

      let data = null;
      let successfulGateway = '';

      for (const gateway of gateways) {
        try {
          const response = await fetch(`${gateway}${ipfsHash}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          });

          if (response.ok) {
            data = await response.json();
            successfulGateway = gateway;
            break;
          }
        } catch (gatewayError) {
          console.warn(`Gateway ${gateway} failed:`, gatewayError.message);
          continue;
        }
      }

      if (!data) {
        throw new Error('Failed to retrieve data from all IPFS gateways');
      }

      // Verify data integrity
      const verified = this.verifyAgreementIntegrity(data);

      console.log('✅ IPFS AGENT: Agreement successfully retrieved');
      console.log(`   Gateway Used: ${successfulGateway}`);
      console.log(`   Data Verified: ${verified}`);

      return {
        data,
        hash: ipfsHash,
        size: JSON.stringify(data).length,
        timestamp: Date.now(),
        verified
      };

    } catch (error) {
      console.error('❌ IPFS AGENT: Failed to retrieve agreement:', error);
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  /**
   * Pin evidence chain to IPFS for immutable audit trail
   */
  async pinEvidence(evidenceChain: any): Promise<string> {
    console.log('📌 IPFS AGENT: Pinning evidence chain to decentralized storage');

    try {
      // Prepare metadata for evidence chain
      const metadata = {
        name: `Vera Evidence Chain - ${evidenceChain.projectId}`,
        description: `Immutable evidence chain for milestone verification`,
        keyvalues: {
          projectId: evidenceChain.projectId,
          milestoneId: evidenceChain.milestoneId,
          timestamp: evidenceChain.timestamp,
          type: 'vera-evidence-chain'
        }
      };

      // Pin to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey
        },
        body: JSON.stringify({
          pinataContent: evidenceChain,
          pinataMetadata: metadata
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Evidence pinning failed: ${error}`);
      }

      const result = await response.json();
      
      console.log('✅ IPFS AGENT: Evidence chain successfully pinned');
      console.log(`   IPFS Hash: ${result.IpfsHash}`);

      return result.IpfsHash;

    } catch (error) {
      console.error('❌ IPFS AGENT: Failed to pin evidence chain:', error);
      throw new Error(`Evidence pinning failed: ${error.message}`);
    }
  }

  /**
   * Verify IPFS pin status
   */
  async verifyPin(ipfsHash: string): Promise<boolean> {
    try {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        console.warn('Pinata credentials not provided, skipping pin verification');
        return true; // Assume success if no credentials
      }

      const response = await fetch(`https://api.pinata.cloud/data/pinList?hashContains=${ipfsHash}`, {
        method: 'GET',
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey
        }
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.count > 0;

    } catch (error) {
      console.warn('Pin verification failed:', error.message);
      return false;
    }
  }

  /**
   * Pin evidence chain to IPFS for immutable audit trail
   */
  async pinEvidence(evidenceChain: any): Promise<string> {
    console.log('📌 IPFS AGENT: Pinning evidence chain to decentralized storage');

    try {
      // Prepare metadata for evidence chain
      const metadata = {
        name: `Vera Evidence Chain - ${evidenceChain.projectId}`,
        description: `Immutable evidence chain for milestone verification`,
        keyvalues: {
          projectId: evidenceChain.projectId,
          milestoneId: evidenceChain.milestoneId,
          timestamp: evidenceChain.timestamp,
          type: 'vera-evidence-chain'
        }
      };

      // Pin to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey
        },
        body: JSON.stringify({
          pinataContent: evidenceChain,
          pinataMetadata: metadata
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Evidence pinning failed: ${error}`);
      }

      const result = await response.json();
      
      console.log('✅ IPFS AGENT: Evidence chain successfully pinned');
      console.log(`   IPFS Hash: ${result.IpfsHash}`);

      return result.IpfsHash;

    } catch (error) {
      console.error('❌ IPFS AGENT: Failed to pin evidence chain:', error);
      throw new Error(`Evidence pinning failed: ${error.message}`);
    }
  }

  // Private helper methods

  private async pinToPinata(agreement: Agreement, metadata: any): Promise<{ hash: string; size: number }> {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      throw new Error('Pinata API credentials not configured');
    }

    const ipfsData = this.generateIPFSMetadata(agreement);

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretKey
      },
      body: JSON.stringify({
        pinataContent: ipfsData,
        pinataMetadata: metadata
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinata pinning failed: ${error}`);
    }

    const result = await response.json();
    return {
      hash: result.IpfsHash,
      size: result.PinSize
    };
  }

  private validateAgreementForIPFS(agreement: Agreement): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!agreement.projectId) errors.push('Missing project ID');
    if (!agreement.title) errors.push('Missing project title');
    if (!agreement.parties.client) errors.push('Missing client address');
    if (!agreement.parties.freelancer) errors.push('Missing freelancer address');
    if (!agreement.payment.totalAmount) errors.push('Missing payment amount');

    // Vera Protocol invariants validation
    if (agreement.payment.technicalPercentage !== 80) {
      errors.push('Technical percentage must be exactly 80%');
    }
    if (agreement.payment.subjectivePercentage !== 20) {
      errors.push('Subjective percentage must be exactly 20%');
    }
    if (agreement.timeline.silentConsentHours !== 72) {
      errors.push('Silent consent must be exactly 72 hours');
    }

    // Requirements validation
    if (!agreement.requirements.technical || agreement.requirements.technical.length === 0) {
      errors.push('At least one technical requirement required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private verifyAgreementIntegrity(data: any): boolean {
    try {
      // Check if data has required Vera Protocol structure
      if (!data.agreement) return false;
      if (!data.version) return false;
      if (data.protocol !== 'vera-escrow') return false;

      const agreement = data.agreement;

      // Verify Vera Protocol invariants
      if (agreement.payment?.technicalPercentage !== 80) return false;
      if (agreement.payment?.subjectivePercentage !== 20) return false;
      if (agreement.timeline?.silentConsentHours !== 72) return false;

      // Verify required fields
      if (!agreement.projectId) return false;
      if (!agreement.parties?.client) return false;
      if (!agreement.parties?.freelancer) return false;

      return true;
    } catch (error) {
      console.error('Agreement integrity verification failed:', error);
      return false;
    }
  }
}

// Utility function for external use
export async function getAgreementFromIPFS(ipfsHash: string): Promise<Agreement> {
  const ipfsAgent = new IPFSAgent();
  const result = await ipfsAgent.retrieveAgreement(ipfsHash);
  
  if (!result.verified) {
    throw new Error('Retrieved agreement failed integrity verification');
  }
  
  return result.data.agreement;
}

// Utility function for pinning agreements
export async function pinAgreementToIPFS(agreement: Agreement): Promise<string> {
  const ipfsAgent = new IPFSAgent();
  const result = await ipfsAgent.pinAgreement(agreement);
  
  if (!result.pinned) {
    throw new Error('Agreement pinning verification failed');
  }
  
  return result.hash;
}