# Kiro IDE Project Documentation

## ⚠️ IMPORTANT: Kiro's Role in Vera Protocol

**Kiro IDE is a DEVELOPMENT TOOL ONLY** - it is NOT used in production runtime.

### What Kiro IS Used For:

✅ **Development Workflow**
- Task tracking and planning ([tasks.md](Vera/tasks.md))
- Requirements documentation ([requirements.md](Vera/requirements.md))
- System design documentation ([design.md](Vera/design.md))
- Code generation and scaffolding during development
- Development environment setup

✅ **Documentation Management**
- Maintaining project specifications
- Tracking implementation progress
- Managing development tasks
- Code examples and prototyping

### What Kiro is NOT Used For:

❌ **Production Runtime** - Kiro does not run in production
❌ **AI Verification** - Production uses OpenAI/Anthropic APIs
❌ **Code Analysis** - Production uses dedicated LLM services
❌ **Milestone Verification** - Production uses `production-ai-verifier.ts`

---

## Production AI Architecture

### Actual Production System:

```
┌─────────────────────────────────────────────────────────┐
│                  PRODUCTION STACK                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (Next.js)                                     │
│       ↓                                                 │
│  IPFS (Pinata) ← Stores agreements                     │
│       ↓                                                 │
│  Smart Contract (Ethereum) ← Escrow logic              │
│       ↓                                                 │
│  Webhook Server ← Triggers verification                │
│       ↓                                                 │
│  ProductionAIVerifier ← Real AI analysis               │
│       ├─→ OpenAI GPT-4    (Option 1)                   │
│       ├─→ Anthropic Claude (Option 2)                  │
│       └─→ GitHub API       (Code fetching)             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Production AI Verifier Features:

1. **Real LLM Integration**
   - OpenAI GPT-4 Turbo for code analysis
   - Anthropic Claude Opus as alternative
   - Structured JSON output for consistency

2. **GitHub Integration**
   - Direct GitHub API access (no MCP)
   - Fetches actual repository code
   - Analyzes commits, tests, documentation

3. **Intelligent Evaluation**
   - Multi-criteria scoring (code quality, functionality, security, docs)
   - Context-aware analysis using project requirements
   - Evidence-based reasoning

4. **EIP-712 Signing**
   - Cryptographic verification signatures
   - On-chain payment authorization
   - Replay attack protection

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
