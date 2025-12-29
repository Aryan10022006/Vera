# Vera Protocol - Custom MCP Servers

This directory contains custom MCP (Model Context Protocol) servers for Vera Protocol, specifically designed to handle GitHub authentication, repository analysis, and milestone verification.

## 🎯 Purpose

The custom MCP servers extend Kiro's capabilities to:

1. **Authenticate Freelancers**: GitHub OAuth integration for secure repository access
2. **Analyze Repositories**: Comprehensive code quality, security, and functionality analysis
3. **Verify Milestones**: Neutral arbitration logic for milestone completion assessment
4. **Handle Submissions**: Automated milestone submission and verification workflow

## 🏗️ Architecture

### vera-github-mcp.ts

The main MCP server that provides:

#### Tools Available:
- `authenticate_freelancer`: GitHub OAuth authentication and project linking
- `analyze_repository`: Comprehensive repository analysis for verification
- `submit_milestone`: Milestone submission with repository proof
- `get_repository_metrics`: Detailed code metrics and quality analysis
- `verify_milestone_completion`: Neutral arbitration against technical requirements

#### Key Features:
- **GitHub OAuth Integration**: Secure authentication with repository access
- **Repository Analysis**: Code quality, security, tests, and documentation assessment
- **Neutral Arbitration**: Implements arbitration.md logic for fair evaluation
- **EIP-712 Integration**: Cryptographic signatures for smart contract interaction

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend-agents/mcp-servers
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. GitHub OAuth App Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App with:
   - **Application name**: Vera Protocol
   - **Homepage URL**: Your frontend URL
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
3. Copy Client ID and Client Secret to `.env`

### 4. Build and Start

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 5. Configure in Kiro

Add to your `~/.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "vera-github": {
      "command": "node",
      "args": ["path/to/vera-protocol/backend-agents/mcp-servers/dist/vera-github-mcp.js"],
      "env": {
        "GITHUB_CLIENT_ID": "your_client_id",
        "GITHUB_CLIENT_SECRET": "your_client_secret",
        "ARBITER_PRIVATE_KEY": "your_private_key",
        "CONTRACT_ADDRESS": "your_contract_address"
      },
      "disabled": false,
      "autoApprove": []
    },
    "github": {
      "command": "uvx",
      "args": ["github-mcp-server@latest"],
      "env": {
        "GITHUB_TOKEN": "your_github_token"
      },
      "disabled": false
    },
    "fetch": {
      "command": "uvx",
      "args": ["fetch-mcp-server@latest"],
      "disabled": false
    }
  }
}
```

## 🔧 Usage Examples

### Authenticate Freelancer

```typescript
// In Kiro agent
const result = await use_tool("vera-github", "authenticate_freelancer", {
  freelancerAddress: "0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e4c2",
  projectId: "project_123",
  milestoneId: "milestone_1",
  githubCode: "oauth_authorization_code"
});
```

### Analyze Repository

```typescript
// In Kiro agent
const analysis = await use_tool("vera-github", "analyze_repository", {
  freelancerAddress: "0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e4c2",
  repositoryUrl: "https://github.com/freelancer/project-repo",
  requirements: [
    {
      id: "tech_1",
      description: "Implement user authentication",
      acceptanceCriteria: ["Login/logout functionality", "Password hashing", "Session management"]
    }
  ]
});
```

### Submit Milestone

```typescript
// In Kiro agent
const submission = await use_tool("vera-github", "submit_milestone", {
  freelancerAddress: "0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e4c2",
  milestoneId: "milestone_1",
  repositoryUrl: "https://github.com/freelancer/project-repo",
  commitSha: "abc123def456",
  submissionMessage: "Completed user authentication milestone"
});
```

## 🤖 Integration with Kiro Hooks

The MCP server works seamlessly with Kiro hooks:

### Milestone Verification Hook
- **Trigger**: GitHub push event
- **Action**: Automatically calls `analyze_repository` and `verify_milestone_completion`
- **Result**: EIP-712 signature for smart contract if approved

### Freelancer Onboarding Hook
- **Trigger**: Project invitation acceptance
- **Action**: Guides through `authenticate_freelancer` process
- **Result**: GitHub account linked to Ethereum address

### Dispute Resolution Hook
- **Trigger**: Dispute or scope creep detection
- **Action**: Applies neutral arbitration logic
- **Result**: Evidence-based resolution recommendation

## 🔒 Security Features

### Authentication Security
- **OAuth 2.0**: Secure GitHub authentication flow
- **Token Management**: Encrypted storage of access tokens
- **Scope Limitation**: Minimal required repository permissions

### Verification Security
- **Neutral Arbitration**: Emotionally detached, evidence-driven decisions
- **Cryptographic Signatures**: EIP-712 signatures for tamper-proof verification
- **Audit Trails**: Complete verification history on IPFS

### Data Protection
- **No Sensitive Storage**: Tokens stored temporarily in memory only
- **Encrypted Communication**: All API calls over HTTPS
- **Privacy Compliance**: Minimal data collection and processing

## 📊 Analysis Capabilities

### Code Quality Assessment
- **Language Analysis**: Multi-language code complexity calculation
- **Test Coverage**: Automated test detection and analysis
- **Documentation**: README, API docs, and deployment guide verification
- **Best Practices**: ESLint, Prettier, and TypeScript compliance

### Security Analysis
- **Vulnerability Scanning**: GitHub security advisories integration
- **Dependency Analysis**: Package vulnerability assessment
- **Secret Detection**: Accidental secret exposure prevention
- **Security Best Practices**: OWASP compliance checking

### Performance Metrics
- **Repository Statistics**: Commits, contributors, releases tracking
- **Code Metrics**: Lines of code, file count, complexity analysis
- **Activity Analysis**: Development velocity and consistency
- **Quality Trends**: Historical quality improvement tracking

## 🎯 Neutral Arbitration Logic

The MCP server implements the complete neutral arbitration logic from `arbitration.md`:

### Technical Soundness Assessment (80%)
- **Code Quality**: Automated testing and security scans ✅
- **Functionality**: All specified technical requirements ✅
- **Performance**: Documented performance benchmarks ✅
- **Documentation**: Required technical documentation ✅

### Subjective Elements (20%)
- **Visual Design**: UI/UX preferences → Hold for review
- **Content Style**: Tone and style preferences → Hold for review
- **User Experience**: Subjective usability → Hold for review

### Scoring Algorithm
```typescript
const technicalScore = (
  codeQualityScore * 0.25 +
  functionalityScore * 0.35 +
  securityScore * 0.25 +
  documentationScore * 0.15
);

const approved = technicalScore >= 80;
```

## 🚀 Production Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- GitHub OAuth credentials
- Ethereum private keys (securely managed)
- IPFS gateway configuration
- Contract addresses

### Monitoring
- **Health Checks**: Server availability monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time and throughput tracking
- **Security Monitoring**: Authentication and authorization logging

### Scaling
- **Horizontal Scaling**: Multiple server instances for high availability
- **Load Balancing**: Request distribution across instances
- **Caching**: Repository analysis result caching
- **Rate Limiting**: GitHub API rate limit management

---

**Built for HackXios 2k25 - Kiro & Ethereum Tracks** 🏆