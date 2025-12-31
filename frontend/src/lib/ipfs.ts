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
  // Convert IPFS hash (base58) to bytes32
  // For simplicity, using keccak256 hash of the IPFS hash
  const encoder = new TextEncoder();
  const data = encoder.encode(ipfsHash);
  return '0x' + Array.from(data)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .padEnd(64, '0')
    .slice(0, 64);
}

export function bytes32ToIPFSHash(bytes32: string): string {
  // This is a simplified version - in production you'd want proper conversion
  return bytes32.replace('0x', '');
}
