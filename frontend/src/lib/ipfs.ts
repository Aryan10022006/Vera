export interface ProjectMetadata {
  title: string;
  description: string;
  budget: string;
  skills: string[];
  milestones: MilestoneData[];
  createdAt: number;
}

export interface MilestoneData {
  description: string;
  amount: string;
  deliverables: string[];
}

export async function pinJSONToIPFS(data: ProjectMetadata): Promise<string> {
  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
    },
    body: JSON.stringify({
      pinataContent: data,
      pinataMetadata: {
        name: `vera-project-${Date.now()}`,
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to pin to IPFS');
  }

  const result = await response.json();
  return result.IpfsHash;
}

export async function getFromIPFS(ipfsHash: string): Promise<ProjectMetadata> {
  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch from IPFS');
  }

  return response.json();
}

export function ipfsHashToBytes32(ipfsHash: string): string {
  // Convert IPFS hash (CIDv0) to bytes32 for smart contract storage
  // Uses proper base58 decoding to extract the 32-byte SHA-256 hash
  const bs58 = require('bs58');
  
  // Decode the base58 IPFS hash
  const decoded = bs58.decode(ipfsHash);
  
  // IPFS CIDv0 format: <0x12><0x20><32-byte-hash>
  // Extract the last 32 bytes (the actual SHA-256 hash)
  const hashBytes = decoded.slice(2);
  
  // Convert to hex string
  return '0x' + Buffer.from(hashBytes).toString('hex');
}

export function bytes32ToIPFSHash(bytes32: string): string {
  // Convert bytes32 back to IPFS hash (CIDv0 Qm... format)
  const bs58 = require('bs58');
  
  // Remove 0x prefix and convert to buffer
  const hashHex = bytes32.startsWith('0x') ? bytes32.slice(2) : bytes32;
  const hashBytes = Buffer.from(hashHex, 'hex');
  
  // Reconstruct multihash: 0x12 (SHA-256) + 0x20 (32 bytes) + hash
  const multihash = Buffer.concat([
    Buffer.from([0x12, 0x20]),
    hashBytes
  ]);
  
  // Encode to base58 (Qm... format)
  return bs58.encode(multihash);
}
