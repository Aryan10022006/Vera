# Vera Protocol - Production AI Architecture

## 🎯 CRITICAL UNDERSTANDING

**Kiro IDE ≠ Production Runtime**

- ✅ **Kiro**: Development tool for documentation, task tracking, code generation
- ❌ **Kiro**: NOT used in production for AI verification
- ✅ **Production**: OpenAI GPT-4 / Anthropic Claude APIs
- ✅ **Production**: Real LLM-based code analysis and arbitration

---

## 🏗️ Production System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    VERA PROTOCOL                           │
│              Production Architecture                       │
└────────────────────────────────────────────────────────────┘

┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Frontend (Next.js - Port 3000)     │
│  • Structured Form / Voice Input    │
│  • Wallet Integration (RainbowKit)  │
│  • IPFS Upload (Pinata)             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  IPFS (Pinata Cloud)                │
│  • Agreement Storage                │
│  • Decentralized Metadata           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Smart Contract (Sepolia/Mainnet)   │
│  • VeraEscrow.sol                   │
│  • 80/20 Payment Split              │
│  • 72h Silent Consent               │
│  • EIP-712 Verification             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Webhook Server (Express - Port 3001│
│  • Milestone Submission Handler     │
│  • Triggers AI Verification         │
│  • Manages Verification Queue       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Production AI Verifier              │
│  • OpenAI GPT-4 Turbo (Primary)     │
│  • Anthropic Claude (Fallback)      │
│  • GitHub API Integration           │
│  • Multi-Criteria Analysis          │
└──────────────┬──────────────────────┘
               │
               ├─────────────────────────┐
               │                         │
               ▼                         ▼
┌──────────────────────┐    ┌──────────────────┐
│  GitHub API          │    │  LLM API         │
│  • Fetch Code        │    │  • GPT-4 Turbo   │
│  • Get Commits       │    │  • Claude Opus   │
│  • Check Tests       │    │  • Structured    │
│  • Read README       │    │    Analysis      │
└──────────────────────┘    └──────────────────┘
```

---

## 🔑 Key Components

### 1. **Frontend (Next.js)**
**File**: `frontend/app/page.tsx`
- Multi-modal input (Form + Voice)
- IPFS agreement creation
- Smart contract interaction
- Real-time project dashboard

**Key Features**:
- ✅ Structured form (recommended)
- ✅ Voice input (accessibility)
- ✅ Wallet connection (MetaMask)
- ✅ IPFS pinning (Pinata)

### 2. **Smart Contract (Solidity)**
**File**: `contracts/src/VeraEscrow.sol`
- Immutable 80/20 split
- 72-hour silent consent
- EIP-712 signature verification
- Multi-milestone support

**Key Features**:
- ✅ Escrow management
- ✅ Automated releases
- ✅ Dispute handling
- ✅ Event emissions

### 3. **Production AI Verifier** ⭐ NEW
**File**: `backend-agents/verification/production-ai-verifier.ts`
- Real LLM integration (OpenAI/Anthropic)
- GitHub repository analysis
- Multi-criteria scoring system
- EIP-712 signature generation

**Key Features**:
- ✅ GPT-4 Turbo code analysis
- ✅ Claude Opus fallback
- ✅ Structured JSON responses
- ✅ Evidence-based decisions
- ✅ Transparent reasoning

### 4. **Webhook Server**
**File**: `backend-agents/webhook-server/index.ts`
- Listens for milestone submissions
- Triggers AI verification
- Manages verification queue
- Broadcasts results

---

## 🧠 Production AI Verification Flow

```typescript
// Example: How AI verification works in production

1. Freelancer submits: "Milestone 1 complete" → GitHub repo URL

2. Webhook server receives:
   {
     projectId: "project_123",
     milestoneId: "milestone_1", 
     repositoryUrl: "https://github.com/user/repo",
     ipfsHash: "QmX7..."
   }

3. Production AI Verifier executes:
   a) Fetch GitHub code via GitHub API
   b) Fetch requirements from IPFS
   c) Send to OpenAI GPT-4:
      - Repository code (up to 20 files)
      - Technical requirements
      - Acceptance criteria
      - Prompt: "Analyze objectively, score 0-100"
   
   d) GPT-4 returns structured JSON:
      {
        "technicalScore": 85,
        "subjectiveScore": 90,
        "reasoning": "Code quality excellent, all tests pass...",
        "issues": [],
        "breakdown": {
          "codeQuality": 90,
          "functionality": 85,
          "security": 80,
          "documentation": 85
        }
      }

4. Verifier logic:
   - IF technicalScore >= 80:
     - approved = true
     - Generate EIP-712 signature
     - 80% payment auto-releases
   - ELSE:
     - approved = false
     - Return detailed feedback
     - No payment release

5. Smart contract:
   - Verifies EIP-712 signature
   - Releases 80% to freelancer
   - Starts 72h timer for 20%
```

---

## 💰 Cost Structure

### Per Milestone Verification:

**OpenAI GPT-4 Turbo**:
- Input: ~3,000 tokens (code + requirements) @ $0.01/1K = $0.03
- Output: ~500 tokens (analysis) @ $0.03/1K = $0.015
- **Total: ~$0.05 per verification**

**Anthropic Claude Opus** (fallback):
- Input: ~3,000 tokens @ $0.015/1K = $0.045
- Output: ~500 tokens @ $0.075/1K = $0.0375
- **Total: ~$0.08 per verification**

### Monthly Estimates:
- 10 verifications/month: **$0.50 - $0.80**
- 100 verifications/month: **$5 - $8**
- 1000 verifications/month: **$50 - $80**

**Much cheaper than human arbitrators!** 🎉

---

## 🔧 Setup Instructions

### 1. Install Dependencies
```powershell
cd backend-agents
npm install
```

This installs:
- `openai` - OpenAI API client
- `@anthropic-ai/sdk` - Anthropic API client
- `@octokit/rest` - GitHub API client
- `ethers` - Ethereum interaction

### 2. Get API Keys

**OpenAI (Recommended)**:
1. Go to https://platform.openai.com
2. Sign up / Add payment method
3. Create API key
4. Copy `sk-...` key

**Anthropic (Alternative)**:
1. Go to https://console.anthropic.com
2. Sign up / Add payment
3. Create API key
4. Copy `sk-ant-...` key

**GitHub**:
1. Go to https://github.com/settings/tokens
2. Generate new token
3. Select `repo` scope
4. Copy `ghp_...` token

### 3. Configure Environment
```env
# backend-agents/.env

AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_key_here
# ANTHROPIC_API_KEY=sk-ant-your_key_here

GITHUB_TOKEN=ghp_your_token

SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/...
CONTRACT_ADDRESS=0x...
ARBITER_PRIVATE_KEY=0x...
```

### 4. Test the Verifier
```typescript
// test-verifier.ts
import { createProductionVerifier } from './verification/production-ai-verifier';

const verifier = createProductionVerifier(
  process.env.ARBITER_PRIVATE_KEY!,
  process.env.CONTRACT_ADDRESS!
);

const result = await verifier.verifyMilestone({
  projectId: 'test_123',
  milestoneId: 'milestone_1',
  repositoryUrl: 'https://github.com/vercel/next.js',
  ipfsAgreementHash: 'QmTest...',
  requirements: {
    technical: ['TypeScript code', 'Tests included', 'README present'],
    subjective: ['Code is readable']
  },
  freelancerAddress: '0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e4c2'
});

console.log('✅ Approved:', result.approved);
console.log('📊 Technical Score:', result.technicalScore);
console.log('💭 Reasoning:', result.reasoning);
```

---

## 📊 Verification Criteria

The AI evaluates code on 4 dimensions:

### 1. Code Quality (30% weight)
- Clean code structure
- Proper naming conventions
- TypeScript types / JSDoc
- Code organization

### 2. Functionality (40% weight)
- Meets technical requirements
- All features implemented
- No critical bugs
- Proper error handling

### 3. Security (20% weight)
- No vulnerabilities
- Input validation
- Authentication/authorization
- Dependency security

### 4. Documentation (10% weight)
- README present
- API documentation
- Code comments
- Deployment guide

**Scoring**:
- 90-100: Excellent work
- 80-89: Good work (auto-approve)
- 70-79: Needs minor fixes
- <70: Significant issues (reject)

---

## 🚨 Important Notes

### ✅ DO Use in Production:
- `production-ai-verifier.ts`
- OpenAI or Anthropic APIs
- GitHub API for code fetching
- Real LLM analysis

### ❌ DON'T Use in Production:
- Kiro IDE runtime
- MCP servers (dev tool)
- `milestone-verifier.ts` (legacy/reference only)
- Mock implementations

### 🔒 Security Best Practices:
1. Never commit API keys
2. Use environment variables
3. Rotate keys regularly
4. Monitor API usage
5. Set spending limits

### 📈 Scaling Considerations:
1. Queue system for high volume
2. Rate limiting on API calls
3. Caching repeated analyses
4. Fallback to Anthropic if OpenAI fails
5. Database for verification history

---

## 🎯 Next Steps

1. ✅ Install dependencies: `cd backend-agents && npm install`
2. ✅ Get OpenAI API key
3. ✅ Configure `.env` file
4. ✅ Test verifier locally
5. ⏳ Deploy webhook server
6. ⏳ Test end-to-end flow
7. ⏳ Monitor costs and performance

---

**Production Status**: ✅ Ready for deployment  
**AI Provider**: OpenAI GPT-4 Turbo (configurable)  
**Cost per Verification**: ~$0.05  
**Kiro Usage**: Development only (NOT production)

---

For questions or issues, refer to:
- `.kiro/README.md` - Kiro vs Production clarification
- `backend-agents/verification/production-ai-verifier.ts` - Implementation
- `QUICKSTART.md` - Setup guide
