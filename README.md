# Vera Protocol

> AI-Mediated Freelance Escrow Platform with 80/20 Variance Buffer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built for HackXios 2k25](https://img.shields.io/badge/HackXios-2k25-orange.svg)](https://hackxios.com)

**Vera Protocol** eliminates freelance fraud through intelligent AI-powered arbitration, automated payment releases, and decentralized agreement storage.

---

## 🎯 What is Vera Protocol?

Vera is a **Pure Web3 escrow platform** that uses production-grade AI (OpenAI GPT-4 / Anthropic Claude) to automatically verify milestone completion and release payments. No human arbitrators, no centralized databases—just smart contracts, IPFS, and intelligent code analysis.

### Core Innovation: The 80/20 Split

- **80% Technical** → Auto-releases on AI verification
- **20% Subjective** → Held for client review (72 hours)
- **Silent Consent** → Auto-release after 72h if no dispute

### Key Features

✅ **Multi-Modal Input**: Structured forms or voice commands  
✅ **AI Verification**: GPT-4 analyzes code quality, functionality, security  
✅ **Instant Payments**: 80% releases in seconds after verification  
✅ **Decentralized**: IPFS storage, Ethereum smart contracts  
✅ **Cost-Effective**: ~$0.05 per AI verification  
✅ **Fair Disputes**: Evidence-based AI arbitration

---

## 🏗️ System Architecture

```
┌─────────────┐
│   Client    │ Creates project via form/voice
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Frontend (Next.js)         │ → Agreement → IPFS (Pinata)
│  • Structured Form          │              ↓
│  • Voice Input              │         IPFS Hash
│  • Wallet Integration       │              ↓
│  • WebSocket Client         │    Smart Contract (Ethereum)
└─────────────────────────────┘         ↓
                                   Escrow Locked
                                   (80% + 20%)
                                         ↓
┌─────────────┐                         │
│ Freelancer  │ ← Work → Submit ← ──────┘
└──────┬──────┘                    GitHub Repo
       │
       ▼
┌─────────────────────────────┐
│  Webhook Server (Port 3001) │ → Triggers AI Verification
│  • REST API                 │ → WebSocket Broadcasts
│  • Real-time notifications  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Production AI Verifier     │
│  • OpenAI GPT-4 Turbo       │ → Analyzes Code
│  • GitHub API               │ → Scores 0-100
│  • Multi-Criteria Eval      │ → Generates Signature
└──────────┬──────────────────┘
           │
           ▼ (if score ≥ 80)
     EIP-712 Signature
           │
           ▼
    Smart Contract
           │
           ├─→ 80% → Freelancer (instant)
           │         ↓
           │    WebSocket broadcast
           │         ↓
           │    Both parties notified
           │
           └─→ 20% → 72h Silent Consent Timer
                     ↓
              No dispute? → Auto-release
              Dispute? → Arbitration flow
                     ↓
              WebSocket alert (< 1 min)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask wallet
- ~0.5 Sepolia ETH (free from faucet)
- Pinata account (free)
- OpenAI API key (~$5 credit)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd Vera

# Install all dependencies
npm run install:all
# Or manually:
cd contracts && npm install
cd ../frontend && npm install
cd ../backend-agents && npm install
```

### Configuration

Create `.env` files in each directory:

**contracts/.env**:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_metamask_private_key
AUTHORIZED_AGENT_ADDRESS=0x0000000000000000000000000000000000000000
```

**frontend/.env.local**:
```env
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret
NEXT_PUBLIC_CONTRACT_ADDRESS=deployed_contract_address
```

**backend-agents/.env**:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_openai_key
GITHUB_TOKEN=your_github_token
CONTRACT_ADDRESS=deployed_contract_address
```

> See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.

### Deploy & Run

```bash
# 1. Deploy smart contract
cd contracts
npm run deploy:sepolia

# 2. Start frontend (new terminal)
cd frontend
npm run dev
# Opens http://localhost:3000

# 3. Start backend AI verifier (new terminal)
cd backend-agents
npm run dev
# HTTP API: http://localhost:3001
# WebSocket: ws://localhost:3001?address=<wallet_address>
# Real-time notifications: milestone updates, payments, disputes
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | 15-minute setup guide with all API keys |
| [PRODUCTION_AI_GUIDE.md](./PRODUCTION_AI_GUIDE.md) | Production AI architecture and costs |
| [SETUP.md](./SETUP.md) | Comprehensive deployment guide |
| [.kiro/README.md](./.kiro/README.md) | Development workflow documentation |

---

## 🧠 How AI Verification Works

### 1. Freelancer Submits Work
```json
{
  "milestoneId": "milestone_1",
  "repositoryUrl": "https://github.com/user/project",
  "ipfsHash": "QmX7..."
}
```

### 2. AI Analyzes Code
- Fetches repository via GitHub API
- Retrieves requirements from IPFS
- Sends to OpenAI GPT-4:
  - Code files (up to 20 files)
  - Technical requirements
  - Acceptance criteria

### 3. GPT-4 Returns Structured Analysis
```json
{
  "technicalScore": 85,
  "subjectiveScore": 90,
  "reasoning": "Code quality excellent, all tests pass...",
  "breakdown": {
    "codeQuality": 90,
    "functionality": 85,
    "security": 80,
    "documentation": 85
  }
}
```

### 4. Smart Contract Action
- **Score ≥ 80**: Generate EIP-712 signature → Release 80%
- **Score < 80**: Reject with feedback → No payment
- **20% buffer**: Held for 72 hours for client review

---

## 💰 Cost Structure

### AI Verification Costs (Production)

| Provider | Per Verification | 100/month | 1000/month |
|----------|-----------------|-----------|------------|
| OpenAI GPT-4 Turbo | $0.05 | $5 | $50 |
| Anthropic Claude | $0.08 | $8 | $80 |

**Much cheaper than human arbitrators!** Traditional escrow charges 3-5% + hourly rates.

### Blockchain Costs (Sepolia Testnet)
- Contract deployment: ~0.02 ETH (~$0 on testnet)
- Project creation: ~0.005 ETH per project
- Milestone verification: ~0.003 ETH per signature

---

## 🔧 Tech Stack

### Smart Contracts
- **Solidity 0.8.19**: Escrow logic
- **Hardhat**: Development & testing
- **OpenZeppelin**: Security standards
- **EIP-712**: Typed data signatures

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **RainbowKit**: Wallet connection
- **Wagmi + Viem**: Ethereum interaction
- **Tailwind CSS**: Styling

### AI & Backend
- **OpenAI GPT-4 Turbo**: Primary AI verifier
- **Anthropic Claude**: Fallback option
- **GitHub API**: Code repository access
- **Express**: Webhook server + REST API
- **WebSocket (ws)**: Real-time notifications
- **Ethers.js**: Blockchain interaction

### Storage & Infrastructure
- **IPFS (Pinata)**: Decentralized agreement storage
- **Ethereum (Sepolia)**: Testnet blockchain
- **Infura**: RPC provider

---

## 📁 Project Structure

```
Vera/
├── .kiro/                          # Kiro IDE documentation (dev only)
│   ├── README.md                   # Kiro vs Production clarification
│   ├── Vera/
│   │   ├── requirements.md         # System requirements
│   │   ├── design.md              # Architecture design
│   │   └── tasks.md               # Implementation tracking
│   └── steering/                   # Product specifications
├── contracts/                      # Smart contracts
│   ├── src/VeraEscrow.sol         # Main escrow contract
│   ├── scripts/deploy.js          # Deployment script
│   └── hardhat.config.js
├── frontend/                       # Next.js application
│   ├── app/                       # App router
│   │   ├── page.tsx               # Homepage with tabs
│   │   └── layout.tsx
│   ├── components/
│   │   ├── StructuredForm.tsx     # Multi-step form (P0)
│   │   ├── VoiceRecorder.tsx      # Voice input
│   │   └── ProjectDashboard.tsx   # Project tracking
│   └── lib/
│       ├── ipfs.ts                # IPFS utilities
│       └── wagmi.ts               # Web3 config
├── backend-agents/                 # AI verification system
│   ├── verification/
│   │   └── production-ai-verifier.ts  # PRODUCTION AI (GPT-4/Claude)
│   ├── webhook-server/            # Express server
│   └── github-integration/        # GitHub API client
├── README.md                       # This file
├── QUICKSTART.md                   # 15-min setup guide
├── PRODUCTION_AI_GUIDE.md          # AI architecture
└── SETUP.md                        # Deployment guide
```

---

## 🔐 Security

### Smart Contract Security
- ✅ ReentrancyGuard on all fund transfers
- ✅ Pausable for emergency stops
- ✅ Access control (Ownable)
- ✅ EIP-712 signature verification
- ✅ Immutable 80/20 split constants

### AI Security
- ✅ Deterministic scoring (low temperature)
- ✅ Structured JSON output validation
- ✅ Multi-criteria evaluation
- ✅ Evidence-based reasoning
- ✅ Transparent decision logging

### Data Security
- ✅ No centralized database (Pure Web3)
- ✅ IPFS content addressing (tamper-proof)
- ✅ On-chain event logs (audit trail)
- ✅ Encrypted private keys (environment variables)

---

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npm run test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### AI Verifier Tests
```bash
cd backend-agents
npm run test
```

---

## 🌐 Deployment

### Testnet (Sepolia)
```bash
# Deploy contracts
cd contracts
npm run deploy:sepolia

# Start services
npm run start:all
```

### Production (Mainnet)
```bash
# Deploy to Ethereum mainnet
npm run deploy:mainnet

# Update environment variables
# Start production servers with PM2
pm2 start ecosystem.config.js
```

> See [SETUP.md](./SETUP.md) for production deployment guide.

---

## 🎯 Roadmap

### ✅ Phase 1: Core Platform (Current)
- [x] Smart contract escrow with 80/20 split
- [x] IPFS agreement storage
- [x] Multi-modal input (form + voice)
- [x] Production AI verifier (OpenAI GPT-4)
- [x] GitHub integration
- [x] WebSocket real-time notifications
- [x] Silent Consent 72h timer
- [x] Dispute resolution flow
- [x] Dashboard and wallet integration
- [ ] Sepolia testnet deployment
- [ ] End-to-end testing

### 🔄 Phase 2: Enhanced Features (Q1 2026)
- [ ] Template library for common projects
- [ ] Multi-signature support
- [ ] Dispute resolution UI
- [ ] Analytics dashboard
- [ ] Email notifications

### 🚀 Phase 3: Scale & Optimize (Q2 2026)
- [ ] Layer 2 deployment (Arbitrum/Optimism)
- [ ] Multi-chain support
- [ ] DAO governance
- [ ] Staking mechanism
- [ ] Mobile app

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup
```bash
# Fork and clone
git clone https://github.com/your-username/vera-protocol
cd vera-protocol

# Install dependencies
npm run install:all

# Create feature branch
git checkout -b feature/your-feature

# Make changes and test
npm run test:all

# Submit PR
```

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

Built for **HackXios 2k25** - Kiro & Ethereum Tracks

### Technologies Used
- **OpenAI** - GPT-4 Turbo for AI verification
- **Anthropic** - Claude as fallback AI
- **Ethereum** - Decentralized smart contracts
- **IPFS** - Distributed storage via Pinata
- **Infura** - Ethereum RPC provider
- **Hardhat** - Smart contract development
- **Next.js** - React framework by Vercel
- **RainbowKit** - Wallet connection UX

---

## 📞 Support & Contact

- **Documentation**: [/docs](./docs)
- **Issues**: [GitHub Issues](https://github.com/your-username/vera-protocol/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/vera-protocol/discussions)
- **Twitter**: [@VeraProtocol](https://twitter.com/veraprotocol)

---

## 🎓 Learn More

### Blog Posts
- [How Vera Protocol Eliminates Freelance Fraud](./docs/blog/eliminating-fraud.md)
- [The 80/20 Split: Technical vs Subjective](./docs/blog/80-20-split.md)
- [AI Arbitration: Better than Human Judges?](./docs/blog/ai-arbitration.md)

### Videos
- [5-Minute Demo](https://youtube.com/watch?v=demo)
- [Architecture Deep Dive](https://youtube.com/watch?v=architecture)
- [Smart Contract Walkthrough](https://youtube.com/watch?v=contracts)

---

**⚡ Built with AI • Secured by Blockchain • Powered by Web3**

Made with ❤️ by the Vera Protocol Team
