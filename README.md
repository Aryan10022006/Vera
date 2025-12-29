# Vera Protocol - Comprehensive AI-Mediated Escrow Platform

> Eliminate freelance disputes with multi-agent AI evaluation and evidence-based neutral arbitration

Vera Protocol is a comprehensive escrow platform that supports multiple types of freelance work through **specialized multi-agent AI evaluation systems**. The platform uses external MCP servers for tool integration, real-time quality monitoring, and evidence-based neutral arbitration.

## 🎯 Core Innovation

- **Multi-Agent Evaluation**: Specialized AI agents for code, documents, designs, and presentations
- **External MCP Integration**: Modular tool connections via Model Context Protocol servers
- **Real-Time Quality Monitoring**: Intelligent hooks providing instant feedback during development
- **Evidence-Based Arbitration**: Immutable evidence chains with transparent reasoning
- **80/20 Technical/Subjective Split**: Objective metrics auto-release 80%, subjective elements held for review
- **Cross-Platform Integration**: Works with GitHub, Google Drive, Figma, and presentation tools

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   API Gateway   │    │ Evaluation Svc  │
│   (Next.js)     │◀──▶│   (Express)     │◀──▶│ (Multi-Agent)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Cache     │    │ Message Queue   │    │ MCP Connectors  │
│   (CloudFlare)  │    │   (Redis)       │    │ (External APIs) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Evidence Chain  │    │ Smart Contracts │    │ IPFS Network    │
│   (Immutable)   │    │   (Ethereum)    │    │ (Decentralized) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🤖 Multi-Agent Evaluation System

### Specialized AI Agents

**Code Evaluation Agent**: Static analysis, security scanning, test coverage, compilation verification
**Document Evaluation Agent**: Content analysis, grammar checking, plagiarism detection, format validation
**Design Evaluation Agent**: Visual analysis, brand compliance, accessibility checking, specification validation
**Presentation Evaluation Agent**: Content structure, visual design, message clarity, technical accuracy
**Quality Assurance Agent**: Automated testing, performance benchmarking, optimization suggestions

### External MCP Servers

**GitHub MCP Server**: Repository analysis, OAuth authentication, webhook management
**Document Analysis MCP**: Text processing, format conversion, quality metrics
**Design Tools MCP**: Figma integration, Adobe Creative Suite support, specification validation
**Presentation MCP**: PowerPoint/Google Slides analysis, content extraction, effectiveness scoring

### Real-Time Monitoring

**Intelligent Hooks**: File-based quality monitoring, Git-based commit analysis, real-time feedback delivery
**Quality Thresholds**: Progressive scoring, trend analysis, smart notifications
**Evidence Collection**: Immutable audit trails, cryptographic signatures, IPFS storage

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** and **npm/yarn**
2. **Ethereum wallet** (MetaMask recommended)
3. **Sepolia testnet ETH** for testing
4. **Pinata account** for IPFS pinning
5. **GitHub account** for repository integration
6. **External MCP servers** (GitHub, Document Analysis, Design Tools)

### 1. Clone and Install

```bash
git clone https://github.com/your-username/vera-protocol
cd vera-protocol

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install backend agent dependencies
cd ../backend-agents
npm install
```

### 2. Configure Environment

#### Contracts (.env)
```bash
cd contracts
cp .env.example .env
# Edit .env with your values:
# - SEPOLIA_RPC_URL (Infura/Alchemy)
# - PRIVATE_KEY (deployer wallet)
# - ETHERSCAN_API_KEY (for verification)
```

#### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your values:
# - NEXT_PUBLIC_PINATA_API_KEY
# - NEXT_PUBLIC_PINATA_SECRET_KEY
# - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
# - NEXT_PUBLIC_CONTRACT_ADDRESS
```

#### Backend Agents (.env)
```bash
cd backend-agents/webhook-server
cp .env.example .env
# Edit .env with your values:
# - GITHUB_CLIENT_ID/SECRET
# - GITHUB_TOKEN
# - ARBITER_PRIVATE_KEY
# - CONTRACT_ADDRESS
# - IPFS_GATEWAY
```

#### MCP Servers (.env)
```bash
cd backend-agents/mcp-servers
cp .env.example .env
# Edit .env with your values:
# - GITHUB_CLIENT_ID/SECRET
# - DOCUMENT_ANALYSIS_API_KEY
# - DESIGN_TOOLS_API_KEY
# - PRESENTATION_API_KEY
```

### 3. Deploy Smart Contract

```bash
cd contracts
npm run compile
npm run deploy:sepolia

# Note the deployed contract address and update environment files
```

### 4. Start External MCP Servers

```bash
# Terminal 1: GitHub MCP Server
cd backend-agents/mcp-servers
npm run start:github-mcp

# Terminal 2: Document Analysis MCP Server
npm run start:document-mcp

# Terminal 3: Design Tools MCP Server
npm run start:design-mcp
```

### 5. Start Core Services

```bash
# Terminal 4: Webhook server (AI orchestration)
cd backend-agents/webhook-server
npm run dev

# Terminal 5: Frontend
cd frontend
npm run dev

# Visit http://localhost:3000 to use Vera Protocol!
```

## 🎯 How to Use

### 1. Create Project (Multiple Work Types Supported)

1. Connect your Ethereum wallet
2. Select work type(s): Code, Documents, Design, Presentations, Data Analysis, Content
3. Define requirements using natural language or structured forms
4. Set milestone structure and payment amounts
5. Enter freelancer's Ethereum address
6. Generate agreement and pin to IPFS

### 2. Freelancer Workflow

1. Receive project invitation
2. Authenticate with relevant platforms (GitHub, Google Drive, Figma, etc.)
3. Start work using preferred tools
4. **Real-time quality monitoring** provides instant feedback
5. Submit milestones when ready
6. **Multi-agent evaluation** assesses work automatically
7. 80% payment releases immediately if technical requirements met

### 3. Multi-Agent Evaluation Process

**For Code Projects:**
- Static code analysis and security scanning
- Test coverage and quality metrics
- Compilation and build verification
- Documentation completeness check

**For Document Projects:**
- Content quality and coherence analysis
- Grammar and style checking
- Plagiarism detection and originality verification
- Format and structure validation

**For Design Projects:**
- Visual design quality assessment
- Brand guideline compliance checking
- Accessibility standards verification (WCAG)
- Technical specification matching

**For Presentation Projects:**
- Content structure and flow analysis
- Visual design consistency evaluation
- Message clarity and effectiveness scoring
- Technical accuracy verification

### 4. Client Review and Arbitration

1. Receive notification of milestone completion
2. Review work within 72 hours
3. **Evidence-based arbitration** provides transparent reasoning
4. Approve subjective elements (20%) or let silent consent trigger
5. Raise disputes with comprehensive evidence chain support

## 🤖 Multi-Agent AI Evaluation

The platform implements specialized evaluation agents for different work types:

### Technical Assessment (80% Auto-Release)
- ✅ **Code Quality**: ESLint, TypeScript, security scans, performance benchmarks
- ✅ **Document Quality**: Grammar, style, readability, factual accuracy, plagiarism detection
- ✅ **Design Quality**: Visual consistency, brand compliance, accessibility (WCAG), technical specs
- ✅ **Presentation Quality**: Content structure, visual design, message clarity, technical accuracy
- ✅ **Testing & Validation**: Automated tests, quality metrics, specification compliance

### Subjective Review (20% Buffer)
- 🎨 Visual design preferences and aesthetic choices
- 📝 Content tone, style, and creative elements
- 🔄 User experience nuances and subjective feedback
- 💡 Creative interpretation and innovative approaches

### Evidence-Based Arbitration
- **Immutable Evidence Chain**: Every evaluation step recorded with cryptographic signatures
- **Transparent Reasoning**: All decisions include detailed explanations with evidence links
- **Neutral Auditor Persona**: Emotionally detached, evidence-driven, time-bounded decisions
- **Multi-Criteria Analysis**: Weighted scoring across multiple evaluation dimensions
- **Fallback Mechanisms**: Human oversight available for complex edge cases

### Real-Time Quality Monitoring
- **File-Save Hooks**: Instant compilation checks and error analysis
- **Git-Commit Hooks**: Automated test execution and quality scoring
- **Progressive Feedback**: Quality trends and improvement suggestions
- **Smart Notifications**: Threshold-based alerts and recommendations

## 📋 Project Structure

```
vera-protocol/
├── .kiro/
│   ├── steering/           # Project steering files (product vision, tech standards, arbitration logic)
│   ├── Vera/              # Comprehensive specifications (requirements, design, tasks)
│   └── hooks/             # Intelligent Kiro hooks for real-time quality monitoring
├── contracts/
│   ├── src/               # Solidity smart contracts with 80/20 immutable invariants
│   ├── scripts/           # Deployment scripts
│   └── test/              # Contract tests
├── frontend/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components with glassmorphism design
│   └── lib/               # Utilities and configurations
├── backend-agents/
│   ├── evaluation/        # Multi-agent evaluation system
│   │   ├── code-evaluation-agent.ts      # Code quality, security, testing analysis
│   │   ├── document-evaluation-agent.ts  # Content, grammar, originality analysis
│   │   └── agent-orchestrator.ts         # Multi-agent coordination and scoring
│   ├── mcp-servers/       # External MCP servers for tool integration
│   │   ├── github-integration-mcp.ts     # GitHub OAuth and repository analysis
│   │   ├── document-analysis-mcp.ts      # Text processing and quality metrics
│   │   └── design-tools-mcp.ts           # Visual design and accessibility analysis
│   ├── webhook-server/    # Production webhook server with multi-agent integration
│   ├── arbitration/       # Neutral arbitration with 80/20 technical/subjective split
│   ├── github-integration/ # Direct GitHub API integration
│   ├── ipfs-integration/  # Decentralized storage with evidence chains
│   ├── voice-processing/  # Speech-to-text and NLP
│   └── shared/           # Common utilities and types
└── docker-compose.yml    # Complete production deployment
```

## 🔐 Security Features

- **EIP-712 Signatures**: Domain-separated signatures prevent replay attacks
- **Reentrancy Guards**: Protection against reentrancy attacks
- **Access Control**: Role-based permissions for critical functions
- **Emergency Pause**: Circuit breaker for security incidents
- **Immutable Invariants**: 80/20 split and 72h consent cannot be changed
- **Multi-Agent Security**: Code vulnerability scanning, dependency analysis, secret detection
- **Evidence Chain Integrity**: Cryptographic signatures for all evaluation steps
- **Neutral Arbitration**: Emotionally detached, evidence-driven decisions
- **Cross-Platform Security**: Secure integrations with GitHub, Google Drive, Figma

## 🧪 Testing

```bash
# Test smart contracts
cd contracts
npm test

# Test frontend components
cd frontend
npm test

# Test multi-agent evaluation system
cd backend-agents
npm test

# Test MCP server integrations
cd backend-agents/mcp-servers
npm test

# Run comprehensive integration tests
npm run test:integration

# Test real-time hooks and quality monitoring
npm run test:hooks
```

## 🚀 Deployment

### Development Environment
```bash
# Start all services locally
docker-compose up -d

# Or start individual services:

# 1. Start MCP servers
cd backend-agents/mcp-servers
npm run dev:github-mcp &
npm run dev:document-mcp &
npm run dev:design-mcp &

# 2. Start webhook server with multi-agent system
cd backend-agents/webhook-server
npm run dev

# 3. Start frontend
cd frontend
npm run dev
```

### Production Deployment
```bash
# Deploy smart contracts to mainnet
cd contracts
npm run deploy:mainnet
npm run verify:mainnet

# Build and deploy frontend
cd frontend
npm run build
# Deploy to Vercel or your preferred platform

# Deploy AI agents with Docker
docker-compose -f docker-compose.prod.yml up -d

# Configure external MCP servers
# Set up monitoring and alerting
# Configure load balancing and auto-scaling
```

## 🏆 HackXios 2k25 Tracks

### Kiro Track
- ✅ Advanced MCP server integration (GitHub, Fetch)
- ✅ Intelligent agent workflows for code verification
- ✅ Voice-first interface with natural language processing
- ✅ Automated hook triggers on GitHub events

### Ethereum Track
- ✅ Production-grade smart contracts with security best practices
- ✅ EIP-712 typed data signatures
- ✅ Gas-optimized escrow mechanisms
- ✅ Immutable protocol invariants (80/20, 72h consent)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Demo**: [vera-protocol.vercel.app](https://vera-protocol.vercel.app)
- **Contract**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/CONTRACT_ADDRESS)
- **IPFS**: [Pinata Gateway](https://gateway.pinata.cloud/ipfs/)
- **Documentation**: [docs.vera-protocol.com](https://docs.vera-protocol.com)

---

**Built with ❤️ for HackXios 2k25 by the Vera Protocol Team**

*Eliminating freelance fraud, one AI-verified milestone at a time.*