# Vera Protocol - System Design

## Architecture Overview
Vera Protocol implements a Pure Web3 escrow system using AI agents as off-chain oracles, IPFS for decentralized storage, and smart contracts for trustless fund management.

## System Architecture

```mermaid
graph TB
    subgraph "Client Interface"
        A[Voice Input] --> B[Speech-to-Text]
        B --> C[NLP Processing]
        C --> D[Agreement Generator]
    end
    
    subgraph "IPFS Layer"
        D --> E[JSON Agreement]
        E --> F[IPFS Pinning]
        F --> G[IPFS Hash]
    end
    
    subgraph "Kiro Agent Oracle"
        H[Milestone Submission] --> I[Fetch IPFS Agreement]
        I --> J[GitHub Code Audit]
        J --> K[Verification Logic]
        K --> L[EIP-712 Signature]
    end
    
    subgraph "Blockchain Layer"
        G --> M[Smart Contract]
        L --> M
        M --> N[Fund Release]
        M --> O[Event Emission]
    end
    
    subgraph "Dispute Resolution"
        P[80% Technical] --> Q[Auto-Release]
        R[20% Subjective] --> S[Manual Review]
        T[72h Timer] --> U[Silent Consent]
    end
```

## Complete Workflow Sequence

```mermaid
sequenceDiagram
    participant C as Client
    participant V as Voice Interface
    participant IPFS as IPFS Network
    participant SC as Smart Contract
    participant F as Freelancer
    participant AI as Standalone AI Agent
    participant GH as GitHub API
    
    Note over C,GH: Phase 1: Voice-to-IPFS Handshake
    C->>V: Voice Input (Project Requirements)
    V->>V: Speech-to-Text + NLP Processing
    V->>IPFS: Pin Agreement JSON
    IPFS->>V: Return IPFS Hash
    V->>SC: Create Project with IPFS Hash
    SC->>C: Project Created + Escrow Funds
    
    Note over C,GH: Phase 2: Development & Submission
    F->>F: Complete Milestone Work
    F->>GH: Push Code to Repository
    GH->>AI: Webhook Trigger (Push Event)
    
    Note over C,GH: Phase 3: Standalone AI Agent Audit
    AI->>IPFS: Fetch Agreement JSON (Direct API)
    AI->>AI: Validate JSON Schema
    AI->>GH: Audit Repository (Direct GitHub API)
    AI->>AI: Verify Technical Requirements
    
    alt Technical Requirements Met (80%)
        AI->>AI: Generate EIP-712 Signature
        AI->>SC: Submit Verification Signature
        SC->>SC: Verify Signature + Auto-Release 80%
        SC->>F: Transfer 80% Payment
        SC->>C: Notify Auto-Release
        
        Note over C,GH: Phase 4: Silent Consent (20% Buffer)
        SC->>SC: Start 72h Timer for 20% Buffer
        SC->>C: Notify Subjective Review Period
        
        alt Client Responds Within 72h
            C->>SC: Approve/Reject Subjective Elements
            SC->>F: Release/Hold 20% Buffer
        else 72h Timeout (Silent Consent)
            SC->>SC: Auto-Release 20% Buffer
            SC->>F: Transfer Remaining 20%
        end
        
    else Technical Requirements Failed
        AI->>SC: Submit Failure Report
        SC->>C: Notify Milestone Rejection
        SC->>F: Notify Required Corrections
    end
```

## Component Design

### 1. Voice-to-IPFS Pipeline

```mermaid
sequenceDiagram
    participant C as Client
    participant V as Voice Processor
    participant NLP as NLP Engine
    participant IPFS as IPFS Network
    participant SC as Smart Contract
    
    C->>V: Voice Input
    V->>NLP: Transcribed Text
    NLP->>NLP: Extract Requirements
    NLP->>IPFS: Pin Agreement JSON
    IPFS->>SC: Store IPFS Hash
    SC->>C: Project Created
```

#### Agreement JSON Structure
```json
{
  "projectId": "uuid",
  "title": "string",
  "description": "string",
  "requirements": {
    "technical": [
      {
        "id": "milestone_1",
        "description": "string",
        "acceptanceCriteria": ["string"],
        "weight": 0.4,
        "type": "technical"
      }
    ],
    "subjective": [
      {
        "id": "design_review",
        "description": "string",
        "weight": 0.2,
        "type": "subjective"
      }
    ]
  },
  "payment": {
    "total": "1000000000000000000",
    "currency": "ETH",
    "milestones": [
      {
        "id": "milestone_1",
        "amount": "800000000000000000",
        "type": "technical"
      }
    ]
  },
  "parties": {
    "client": "0x...",
    "freelancer": "0x..."
  },
  "timeline": {
    "created": "timestamp",
    "deadline": "timestamp"
  },
  "ipfsHash": "QmHash...",
  "signature": "0x..."
}
```

### 2. Standalone AI Agent Verification System

**Production AI Agents**: Independent TypeScript agents with direct GitHub API integration for repository analysis and milestone verification.

```mermaid
flowchart TD
    A[Milestone Submitted] --> B[Webhook Server Receives GitHub Push]
    B --> C[Fetch IPFS Agreement via Direct API]
    C --> D[Validate JSON Schema]
    D --> E{Schema Valid?}
    E -->|No| F[Reject Submission]
    E -->|Yes| G[Parse Requirements]
    G --> H[GitHub API Repository Access]
    H --> I[Code Quality Analysis]
    I --> J[Functionality Testing]
    J --> K[Security Scan]
    K --> L{All Checks Pass?}
    L -->|Yes| M[Generate EIP-712 Signature]
    L -->|No| N[Generate Failure Report]
    M --> O[Submit to Smart Contract]
    N --> P[Notify Parties]
```

#### Verification Criteria
- **Code Quality**: ESLint/Prettier compliance, TypeScript types
- **Functionality**: Unit tests pass, integration tests pass
- **Security**: No critical vulnerabilities, dependency audit clean
- **Requirements**: All acceptance criteria met
- **Documentation**: README, API docs, deployment guide

### 3. EIP-712 Typed Data Structure

```solidity
struct VerificationData {
    bytes32 projectId;
    bytes32 milestoneId;
    address freelancer;
    uint256 amount;
    uint256 timestamp;
    bytes32 ipfsHash;
    bool approved;
}

bytes32 constant VERIFICATION_TYPEHASH = keccak256(
    "VerificationData(bytes32 projectId,bytes32 milestoneId,address freelancer,uint256 amount,uint256 timestamp,bytes32 ipfsHash,bool approved)"
);
```

### 4. Smart Contract Architecture

```mermaid
classDiagram
    class VeraEscrow {
        +mapping projects
        +mapping milestones
        +address oracleAgent
        +uint256 disputeWindow
        +createProject()
        +depositFunds()
        +submitMilestone()
        +verifyAndRelease()
        +disputeMilestone()
        +emergencyPause()
    }
    
    class Project {
        +bytes32 id
        +address client
        +address freelancer
        +uint256 totalAmount
        +bytes32 ipfsHash
        +ProjectStatus status
        +uint256 createdAt
    }
    
    class Milestone {
        +bytes32 id
        +bytes32 projectId
        +uint256 amount
        +MilestoneType milestoneType
        +MilestoneStatus status
        +uint256 submittedAt
        +uint256 releaseTime
    }
    
    VeraEscrow --> Project
    VeraEscrow --> Milestone
```

### 5. 80/20 Variance Buffer Implementation

```mermaid
graph LR
    A[Total Payment] --> B[80% Technical]
    A --> C[20% Subjective]
    B --> D[Auto-Release on Verification]
    C --> E[Manual Review Required]
    E --> F[Client Approval]
    E --> G[Dispute Resolution]
    E --> H[72h Timeout]
```

#### Buffer Logic
```solidity
function calculatePayout(bytes32 milestoneId) internal view returns (uint256) {
    Milestone memory milestone = milestones[milestoneId];
    
    if (milestone.milestoneType == MilestoneType.TECHNICAL) {
        return milestone.amount; // Full amount for technical milestones
    } else {
        return milestone.amount * 20 / 100; // 20% for subjective elements
    }
}
```

### 6. Silent Consent Protocol

```mermaid
sequenceDiagram
    participant F as Freelancer
    participant A as AI Agent
    participant SC as Smart Contract
    participant C as Client
    
    F->>A: Submit Milestone
    A->>A: Verify Work
    A->>SC: Submit Verification
    SC->>C: Notify Client
    SC->>SC: Start 72h Timer
    
    alt Client Responds
        C->>SC: Approve/Reject
        SC->>F: Release/Hold Funds
    else 72h Timeout
        SC->>SC: Auto-Release
        SC->>F: Transfer Funds
    end
    
    opt Dispute Window (24h)
        C->>SC: Raise Dispute
        SC->>SC: Pause Release
    end
```

### 7. Data Flow Architecture

```mermaid
graph TB
    subgraph "Off-Chain Components"
        A[Voice Interface]
        B[AI Agent]
        C[IPFS Network]
        D[GitHub API]
    end
    
    subgraph "On-Chain Components"
        E[Vera Escrow Contract]
        F[EIP-712 Verifier]
        G[Payment System]
    end
    
    A --> C
    B --> C
    B --> D
    B --> F
    F --> E
    E --> G
    
    C -.->|Content Addressing| B
    D -.->|Code Verification| B
```

## Security Considerations

### 1. Oracle Security
- **Multi-signature validation** for agent authorization
- **Reputation system** for agent reliability
- **Slashing conditions** for malicious behavior
- **Backup oracle network** for redundancy

### 2. Smart Contract Security
- **Reentrancy guards** on all external calls
- **Access control** with role-based permissions
- **Pause mechanism** for emergency stops
- **Upgrade proxy pattern** for contract evolution

### 3. IPFS Security
- **Content addressing** ensures immutability
- **Pinning services** prevent data loss
- **Encryption** for sensitive project details
- **Backup storage** across multiple nodes

## Scalability Design

### 1. Layer 2 Integration
- Deploy on Polygon for lower gas costs
- Use state channels for frequent updates
- Implement rollup solutions for batch processing

### 2. IPFS Optimization
- Use IPFS clusters for high availability
- Implement content caching strategies
- Optimize JSON structures for minimal size

### 3. Agent Scaling
- Horizontal scaling of verification agents
- Load balancing across agent instances
- Async processing for non-critical operations

## Integration Points

### 1. MCP Server Configuration
```json
{
  "mcpServers": {
    "github": {
      "command": "uvx",
      "args": ["github-mcp-server@latest"],
      "env": {
        "GITHUB_TOKEN": "ghp_..."
      }
    },
    "fetch": {
      "command": "uvx",
      "args": ["fetch-mcp-server@latest"]
    }
  }
}
```

### 2. Agent Workflow
1. **Trigger**: Milestone submission event
2. **Fetch**: IPFS agreement using #[fetch]
3. **Audit**: GitHub repository using #[github]
4. **Verify**: Compare against requirements
5. **Sign**: Generate EIP-712 signature
6. **Submit**: Send to smart contract

This design ensures complete decentralization while maintaining security, scalability, and user experience aligned with the Vera Protocol vision.