import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Vera Protocol',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'vera-protocol',
  chains: [sepolia, hardhat],
  ssr: true,
});

// Contract configuration
export const VERA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
export const AUTHORIZED_AGENT = process.env.NEXT_PUBLIC_AUTHORIZED_AGENT as `0x${string}`;
export const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

// Contract ABI (essential functions only)
export const VERA_CONTRACT_ABI = [
  {
    "inputs": [
      {"name": "projectId", "type": "bytes32"},
      {"name": "freelancer", "type": "address"},
      {"name": "ipfsHash", "type": "bytes32"}
    ],
    "name": "createProject",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "projectId", "type": "bytes32"},
      {"name": "milestoneId", "type": "bytes32"},
      {"name": "totalAmount", "type": "uint256"}
    ],
    "name": "createMilestone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "milestoneId", "type": "bytes32"}
    ],
    "name": "submitMilestone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {"name": "projectId", "type": "bytes32"},
          {"name": "milestoneId", "type": "bytes32"},
          {"name": "freelancer", "type": "address"},
          {"name": "technicalAmount", "type": "uint256"},
          {"name": "subjectiveAmount", "type": "uint256"},
          {"name": "timestamp", "type": "uint256"},
          {"name": "ipfsHash", "type": "bytes32"},
          {"name": "approved", "type": "bool"}
        ],
        "name": "data",
        "type": "tuple"
      },
      {"name": "signature", "type": "bytes"}
    ],
    "name": "verifyAndRelease",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "milestoneId", "type": "bytes32"}
    ],
    "name": "releaseSilentConsent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "milestoneId", "type": "bytes32"}
    ],
    "name": "approveSubjective",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "", "type": "bytes32"}
    ],
    "name": "projects",
    "outputs": [
      {"name": "id", "type": "bytes32"},
      {"name": "client", "type": "address"},
      {"name": "freelancer", "type": "address"},
      {"name": "totalAmount", "type": "uint256"},
      {"name": "ipfsHash", "type": "bytes32"},
      {"name": "status", "type": "uint8"},
      {"name": "createdAt", "type": "uint256"},
      {"name": "milestonesCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "", "type": "bytes32"}
    ],
    "name": "milestones",
    "outputs": [
      {"name": "id", "type": "bytes32"},
      {"name": "projectId", "type": "bytes32"},
      {"name": "technicalAmount", "type": "uint256"},
      {"name": "subjectiveAmount", "type": "uint256"},
      {"name": "status", "type": "uint8"},
      {"name": "submittedAt", "type": "uint256"},
      {"name": "silentConsentDeadline", "type": "uint256"},
      {"name": "technicalReleased", "type": "bool"},
      {"name": "subjectiveReleased", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;