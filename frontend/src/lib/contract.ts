export const VERA_ESCROW_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_authorizedAgent", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "projectId", "type": "bytes32"},
      {"internalType": "address", "name": "freelancer", "type": "address"},
      {"internalType": "bytes32", "name": "ipfsHash", "type": "bytes32"}
    ],
    "name": "createProject",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes32", "name": "projectId", "type": "bytes32"},
      {"internalType": "bytes32", "name": "milestoneId", "type": "bytes32"},
      {"internalType": "uint256", "name": "totalAmount", "type": "uint256"}
    ],
    "name": "createMilestone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "milestoneId", "type": "bytes32"}],
    "name": "submitMilestone",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "name": "projects",
    "outputs": [
      {"internalType": "bytes32", "name": "id", "type": "bytes32"},
      {"internalType": "address", "name": "client", "type": "address"},
      {"internalType": "address", "name": "freelancer", "type": "address"},
      {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
      {"internalType": "bytes32", "name": "ipfsHash", "type": "bytes32"},
      {"internalType": "uint8", "name": "status", "type": "uint8"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
      {"internalType": "uint256", "name": "milestonesCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "name": "milestones",
    "outputs": [
      {"internalType": "bytes32", "name": "id", "type": "bytes32"},
      {"internalType": "bytes32", "name": "projectId", "type": "bytes32"},
      {"internalType": "uint256", "name": "technicalAmount", "type": "uint256"},
      {"internalType": "uint256", "name": "subjectiveAmount", "type": "uint256"},
      {"internalType": "uint8", "name": "status", "type": "uint8"},
      {"internalType": "uint256", "name": "submittedAt", "type": "uint256"},
      {"internalType": "uint256", "name": "silentConsentDeadline", "type": "uint256"},
      {"internalType": "bool", "name": "technicalReleased", "type": "bool"},
      {"internalType": "bool", "name": "subjectiveReleased", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "projectId", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "client", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "freelancer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256"},
      {"indexed": false, "internalType": "bytes32", "name": "ipfsHash", "type": "bytes32"}
    ],
    "name": "ProjectCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "milestoneId", "type": "bytes32"},
      {"indexed": true, "internalType": "bytes32", "name": "projectId", "type": "bytes32"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "MilestoneSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "milestoneId", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "freelancer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "TechnicalReleaseExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "milestoneId", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "freelancer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "SubjectiveReleaseExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "milestoneId", "type": "bytes32"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "SilentConsentTriggered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "bytes32", "name": "milestoneId", "type": "bytes32"},
      {"indexed": true, "internalType": "address", "name": "disputer", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "reason", "type": "string"}
    ],
    "name": "DisputeRaised",
    "type": "event"
  }
] as const;

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
