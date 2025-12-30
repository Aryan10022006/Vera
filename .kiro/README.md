# 🎯 Vera Protocol - Kiro IDE Project Documentation

> **Development Workflow & Requirements Management**

**Version**: 1.0.0  
**Last Updated**: December 30, 2025  
**Status**: Production-Ready System  
**Kiro Role**: Development Documentation & Task Management Only

---

## ⚠️ CRITICAL: Kiro's Role in This Project

**Kiro IDE is a DEVELOPMENT TOOL ONLY** - it is NOT used in production runtime.

This folder contains project steering documents, requirements specifications, and development task tracking managed through Kiro IDE during the development phase.

---

## 📋 Table of Contents

1. [Kiro's Purpose](#kiros-purpose)
2. [Production System Overview](#production-system-overview)
3. [Project Structure](#project-structure)
4. [Documentation Files](#documentation-files)
5. [Development Workflow](#development-workflow)
6. [Production Architecture](#production-architecture)
7. [AI Verification System](#ai-verification-system)
8. [Deployment Guide](#deployment-guide)
9. [Cost Analysis](#cost-analysis)
10. [Testing Strategy](#testing-strategy)

---

## 🎨 Kiro's Purpose

### ✅ What Kiro IS Used For

**Development Workflow Management**
- 📝 Requirements documentation and tracking
- 📐 System design and architecture planning
- ✅ Task breakdown and progress monitoring
- 📊 Implementation planning and sequencing
- 🧪 Test case generation and validation
- 📚 Code scaffolding and examples

**Documentation Maintenance**
- Maintaining living requirements ([requirements.md](./Vera/requirements.md))
- Tracking system design decisions ([design.md](./Vera/design.md))
- Managing implementation tasks ([tasks.md](./Vera/tasks.md))
- Product specification steering ([steering/](./steering/))

**Code Generation & Prototyping**
- Initial component scaffolding
- Boilerplate code generation
- API interface definitions
- Test template creation

### ❌ What Kiro is NOT Used For

**Production Runtime** (Never deployed to servers)
- ❌ AI verification of milestones
- ❌ Code analysis in production
- ❌ Smart contract interaction
- ❌ Payment processing
- ❌ User-facing features
- ❌ Backend services

**Production uses real systems instead:**
- ✅ OpenAI GPT-4 Turbo / Anthropic Claude for AI
- ✅ GitHub API for code fetching
- ✅ Express.js for webhook server
- ✅ Ethereum smart contracts for escrow
- ✅ IPFS (Pinata) for storage

---

## 🏗️ Production System Overview

Vera Protocol is a **Pure Web3 AI-mediated freelance escrow platform** with the following production architecture:

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      VERA PROTOCOL v1.0                         │
│                   Production Architecture                        │
└─────────────────────────────────────────────────────────────────┘

USER LAYER
┌──────────────┐
│   Client     │ Creates project agreement
│  (Browser)   │ • Structured form input (recommended)
└──────┬───────┘ • Voice command input (alternative)
       │
       ▼
┌────────────────────────────────────────────────────────┐
│  FRONTEND - Next.js 14 (Port 3000)                     │
│  Components:                                            │
│  • StructuredForm.tsx  → Multi-step project creation  │
│  • VoiceRecorder.tsx   → Speech-to-text interface     │
│  • ProjectDashboard.tsx → Real-time tracking          │
│  Libraries:                                            │
│  • RainbowKit  → Wallet connection                    │
│  • Wagmi/Viem  → Ethereum interaction                 │
│  • Tailwind CSS → Styling                             │
└────────────┬───────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────┐
│  STORAGE - IPFS via Pinata                             │
│  • Agreement JSON storage (decentralized)              │
│  • Content addressing (tamper-proof)                   │
│  • Returns: QmX... hash                                │
└────────────┬───────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────┐
│  BLOCKCHAIN - Ethereum (Sepolia → Mainnet)             │
│  Smart Contract: VeraEscrow.sol                        │
│  • Immutable 80/20 payment split                       │
│  • 72-hour silent consent mechanism                    │
│  • EIP-712 signature verification                      │
│  • Automated payment releases                          │
│  • Emergency pause controls                            │
└────────────┬───────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────┐
│  WEBHOOK SERVER - Express.js (Port 3001)               │
│  • GitHub webhook listener                             │
│  • Milestone submission handler                        │
│  • Verification queue management                       │
│  • Result broadcasting (WebSocket)                     │
└────────────┬───────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────┐
│  AI VERIFIER - production-ai-verifier.ts               │
│  Primary: OpenAI GPT-4 Turbo                           │
│  • Model: gpt-4-turbo-preview                          │
│  • Temperature: 0.3 (consistent scoring)               │
│  • Output: Structured JSON                             │
│  Fallback: Anthropic Claude Opus                       │
│  • Model: claude-3-opus-20240229                       │
│  Features:                                             │
│  • Multi-criteria code analysis                        │
│  • GitHub API integration                              │
│  • EIP-712 signature generation                        │
│  • Evidence-based reasoning                            │
└────────────┬───────────────────────────────────────────┘
             │
             ├──────────────────┬─────────────────┐
             ▼                  ▼                 ▼
      ┌────────────┐    ┌────────────┐   ┌──────────────┐
      │ GitHub API │    │  LLM API   │   │  Ethereum    │
      │ • Code     │    │  • GPT-4   │   │  • Sign TX   │
      │ • Commits  │    │  • Claude  │   │  • Release $ │
      │ • Tests    │    │  • Analyze │   │  • Events    │
      └────────────┘    └────────────┘   └──────────────┘
```

### Data Flow

1. **Project Creation**
   - Client fills structured form or speaks requirements
   - Frontend generates standardized JSON agreement
   - Agreement uploaded to IPFS → returns hash
   - Smart contract deployed with IPFS hash reference

2. **Work Submission**
   - Freelancer completes milestone
   - Submits GitHub repository URL
   - Webhook server receives submission

3. **AI Verification** (Automated)
   - Production AI Verifier fetches code from GitHub
   - Retrieves requirements from IPFS
   - Sends to OpenAI GPT-4 for analysis:
     * Code quality scoring
     * Functionality verification
     * Security assessment
     * Documentation check
   - Returns structured score (0-100)

4. **Payment Release**
   - Score ≥ 80: Generate EIP-712 signature
   - Smart contract verifies signature
   - **80% releases instantly** to freelancer
   - **20% held** for 72-hour review period
   - If no dispute → auto-release remaining 20%

---

## 📚 Production Architecture

The production system operates on three core principles:

### 1. Pure Web3 Architecture
**No Centralized Databases**
- All agreements → IPFS (content-addressed storage)
- All financial logic → Ethereum smart contracts
- All verification signatures → EIP-712 cryptographic proofs
- All payment history → blockchain events

**Benefits:**
- Censorship resistant
- Globally accessible
- Trustless execution
- Permanent record keeping

### 2. AI-Powered Verification
**Production-Grade LLM Integration**
- **Primary:** OpenAI GPT-4 Turbo (`gpt-4-turbo-preview`)
- **Fallback:** Anthropic Claude Opus (`claude-3-opus-20240229`)
- **Temperature:** 0.3 for consistent, deterministic scoring
- **Context Window:** 128k tokens (handles large codebases)

**Multi-Criteria Analysis:**
```typescript
interface VerificationResult {
  approved: boolean;
  score: number; // 0-100
  criteria: {
    codeQuality: { score: number; reasoning: string };
    functionality: { score: number; reasoning: string };
    security: { score: number; reasoning: string };
    documentation: { score: number; reasoning: string };
  };
  improvements: string[];
  signature: string; // EIP-712 if approved
}
```

**Cost Economics:**
- Average verification: **~$0.05 USD**
- Input: ~10k tokens (requirements + code)
- Output: ~2k tokens (structured analysis)
- Model: GPT-4 Turbo pricing

### 3. Immutable 80/20 Payment Split
**Smart Contract Enforced**

```solidity
// VeraEscrow.sol - Immutable percentages
uint256 public constant INSTANT_RELEASE_PERCENTAGE = 80;
uint256 public constant DELAYED_RELEASE_PERCENTAGE = 20;
uint256 public constant REVIEW_PERIOD = 72 hours;
```

**Payment Flow:**
1. AI approves (score ≥ 80) → Generate signature
2. Smart contract validates signature → Release 80%
3. 72-hour review window begins
4. If no dispute → Auto-release 20%
5. If dispute → Manual arbitration path

---

## 🛠️ Technical Stack

### Frontend Layer
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| TypeScript | 5.x | Type safety |
| RainbowKit | 2.x | Wallet connection UI |
| Wagmi | 2.x | Ethereum React hooks |
| Viem | 2.x | TypeScript Ethereum library |
| Tailwind CSS | 3.x | Utility-first styling |
| Web Speech API | Native | Voice input |

**Key Components:**
- `StructuredForm.tsx`: Multi-step project creation wizard
- `VoiceRecorder.tsx`: Speech-to-text agreement generator
- `ProjectDashboard.tsx`: Real-time project tracking

### Smart Contract Layer
| Technology | Version | Purpose |
|------------|---------|---------|
| Solidity | 0.8.19 | Smart contract language |
| Hardhat | 2.x | Development environment |
| OpenZeppelin | 4.9.x | Audited contract libraries |
| EIP-712 | Standard | Typed signature verification |

**Contract Features:**
- Immutable payment splits (80/20)
- Silent consent mechanism (72 hours)
- Emergency pause controls
- Reentrancy protection
- Access control (Ownable)

### Backend Services
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x LTS | Runtime environment |
| TypeScript | 5.x | Type-safe backend |
| Express.js | 4.x | Webhook server |
| Octokit | 3.x | GitHub API client |
| OpenAI SDK | 4.x | GPT-4 integration |
| Anthropic SDK | 0.20.x | Claude integration |
| Ethers.js | 6.x | Ethereum interactions |

**Services:**
- GitHub webhook listener (port 3001)
- Production AI Verifier
- EIP-712 signature generator

### Storage & Infrastructure
| Technology | Provider | Purpose |
|------------|----------|---------|
| IPFS | Pinata | Decentralized agreement storage |
| Ethereum | Sepolia → Mainnet | Blockchain layer |
| OpenAI API | OpenAI | Primary AI verification |
| Anthropic API | Anthropic | Backup AI verification |

---

## 📋 Quick Start Guide

### Prerequisites
```bash
Node.js 20.x LTS or higher
npm or yarn package manager
MetaMask wallet browser extension
OpenAI API key (or Anthropic API key)
GitHub personal access token
Pinata API credentials
Ethereum Sepolia testnet ETH
```

### Installation

**1. Clone Repository**
```bash
git clone <repository-url>
cd Vera
```

**2. Install Dependencies**
```bash
# Smart contracts
cd contracts
npm install

# Frontend
cd ../frontend
npm install

# Backend agents
cd ../backend-agents
npm install
```

**3. Configure Environment Variables**

**contracts/.env:**
```bash
PRIVATE_KEY=your_ethereum_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```

**frontend/.env.local:**
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
```

**backend-agents/.env:**
```bash
# AI Provider (choose one)
AI_PROVIDER=openai  # or "anthropic"

# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Anthropic Configuration (alternative)
ANTHROPIC_API_KEY=sk-ant-...

# GitHub
GITHUB_TOKEN=ghp_...

# Ethereum
PRIVATE_KEY=your_private_key
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
CONTRACT_ADDRESS=deployed_contract_address

# Server
WEBHOOK_SECRET=random_secure_string
PORT=3001
```

**4. Deploy Smart Contract**
```bash
cd contracts
npm run deploy:sepolia
# Save the contract address output
```

**5. Start Services**

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
# → http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd backend-agents
npm run dev
# → http://localhost:3001
```

---

## 🧪 Testing Strategy

### Unit Tests
```bash
# Smart contract tests
cd contracts
npm test

# Frontend component tests
cd frontend
npm test

# Backend service tests
cd backend-agents
npm test
```

### Integration Tests
1. **Agreement Creation Flow**
   - Fill structured form
   - Upload to IPFS
   - Deploy escrow contract
   - Verify contract state

2. **Verification Flow**
   - Submit GitHub repository
   - Trigger webhook
   - AI analysis
   - Signature generation
   - Payment release

3. **Dispute Flow**
   - Raise dispute within 72 hours
   - Freeze remaining 20%
   - Manual arbitration

### Manual Testing Checklist
- [ ] Wallet connection (MetaMask)
- [ ] Form validation (all required fields)
- [ ] Voice input processing
- [ ] IPFS upload (verify hash)
- [ ] Contract deployment (check Etherscan)
- [ ] GitHub webhook receipt
- [ ] AI verification response
- [ ] Payment release (80%)
- [ ] Silent consent timer (72h)
- [ ] Final payment release (20%)

---

## 💰 Cost Analysis

### Per-Project Costs

| Service | Cost | Frequency |
|---------|------|-----------|
| IPFS Storage (Pinata) | $0.15/GB | One-time |
| Ethereum Gas (Sepolia) | FREE | Development |
| Ethereum Gas (Mainnet) | ~$5-20 | Per contract |
| AI Verification | ~$0.05 | Per milestone |

**Example Project:**
- Agreement size: 10 KB → $0.0015 IPFS
- Contract deployment: $10 gas
- 5 milestones: 5 × $0.05 = $0.25 AI
- **Total: ~$10.25**

### Monthly Operating Costs (100 projects)
- IPFS: ~$2/month
- AI Verifications (500 milestones): ~$25/month
- Server hosting: $10-50/month
- **Total: $37-77/month**

**Revenue Model:**
- Platform fee: 2% of escrow amount
- $10,000 project → $200 fee
- Costs: ~$10.50
- **Profit margin: ~95%**

---

## 🚀 Deployment Roadmap

### Phase 1: Testnet Launch (Current)
- [x] Core smart contracts
- [x] Frontend interface
- [x] AI verification system
- [x] IPFS integration
- [ ] Sepolia deployment
- [ ] End-to-end testing

### Phase 2: Security Audit
- [ ] Smart contract audit (Certik/OpenZeppelin)
- [ ] Penetration testing
- [ ] Bug bounty program
- [ ] Security documentation

### Phase 3: Mainnet Deployment
- [ ] Ethereum mainnet deployment
- [ ] Production monitoring
- [ ] User onboarding
- [ ] Marketing campaign

### Phase 4: Feature Expansion
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] DAO governance
- [ ] Reputation system
- [ ] Advanced dispute resolution

---

## 🤝 Contributing

This project is under active development. For questions or contributions, please open an issue or pull request.

---

## 📄 License

[Add license information]

---

**Built with ❤️ for the Web3 freelance revolution**

---

## File Structure

```
.kiro/
└── Vera/                    # Vera Protocol project docs
    ├── requirements.md      # System requirements (dev reference)
    ├── design.md           # Architecture design (dev reference)
    ├── tasks.md            # Implementation tasks (dev tracking)
    └── README.md           # This file

backend-agents/
└── verification/
    ├── production-ai-verifier.ts  ← PRODUCTION SYSTEM (OpenAI/Anthropic)
    ├── milestone-verifier.ts      ← Legacy (kept for reference)
    └── README.md

```

---

## For Developers

### During Development (Using Kiro):
1. Use Kiro for task management and documentation
2. Reference requirements.md and design.md
3. Update tasks.md as you complete work
4. Use Kiro for code scaffolding and examples

### For Production Deployment:
1. Use `production-ai-verifier.ts` with real LLM APIs
2. Configure `AI_PROVIDER` environment variable
3. Add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
4. Deploy webhook server to trigger verifications
5. Kiro is NOT deployed or used

---

## Environment Configuration

### Development (.env for local testing):
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...  # Get from platform.openai.com
GITHUB_TOKEN=ghp_...    # GitHub personal access token
```

### Production (.env on server):
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-prod-...
ANTHROPIC_API_KEY=sk-ant-...  # Fallback option
GITHUB_TOKEN=ghp_prod_...
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/...
ARBITER_PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...
```

---

## Cost Estimates (Production)

### OpenAI GPT-4 Turbo:
- Per verification: ~$0.10 - $0.30
- 100 verifications/month: ~$10 - $30
- Input: ~3000 tokens (code + requirements)
- Output: ~500 tokens (analysis)

### Anthropic Claude Opus:
- Per verification: ~$0.15 - $0.40
- 100 verifications/month: ~$15 - $40
- Similar token usage

### Recommendation:
Start with OpenAI GPT-4 Turbo for best cost/performance ratio.

---

## Testing the Production Verifier

```typescript
import { createProductionVerifier } from './verification/production-ai-verifier';

const verifier = createProductionVerifier(
  process.env.ARBITER_PRIVATE_KEY!,
  process.env.CONTRACT_ADDRESS!,
  process.env.GITHUB_TOKEN
);

const result = await verifier.verifyMilestone({
  projectId: 'project_123',
  milestoneId: 'milestone_1',
  repositoryUrl: 'https://github.com/user/repo',
  ipfsAgreementHash: 'QmX7...',
  requirements: {
    technical: ['Unit tests must pass', 'Security audit clean'],
    subjective: ['UI matches design']
  },
  freelancerAddress: '0x...'
});

console.log('Technical Score:', result.technicalScore);
console.log('Approved:', result.approved);
console.log('Signature:', result.signature);
```

---

## Summary

- ✅ **Kiro**: Development documentation and workflow tool
- ✅ **Production**: OpenAI/Anthropic APIs for real AI verification
- ✅ **This folder**: Reference documentation only
- ✅ **Never deploy**: Kiro to production servers

For production AI verification, always use `production-ai-verifier.ts` with proper LLM API keys.

---

**Last Updated**: December 30, 2025  
**Status**: Production-ready AI verifier implemented  
**Kiro Version**: Documentation/Development only
