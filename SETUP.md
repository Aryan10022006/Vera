# Vera Protocol - Complete Setup Guide

This guide will walk you through setting up Vera Protocol from scratch, including all external tools and services required for a production deployment.

## 🎯 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Ethereum wallet (MetaMask) with Sepolia ETH
- [ ] GitHub account
- [ ] Pinata account (IPFS)
- [ ] Infura/Alchemy account (RPC)
- [ ] Etherscan account (verification)
- [ ] WalletConnect account (optional)

## 📋 Step-by-Step Setup

### 1. External Services Setup

#### A. Pinata (IPFS Storage)
1. Go to [pinata.cloud](https://pinata.cloud) and create account
2. Navigate to API Keys section
3. Create new API key with admin permissions
4. Save `API Key` and `API Secret` for later

#### B. Infura/Alchemy (Ethereum RPC)
1. Go to [infura.io](https://infura.io) or [alchemy.com](https://alchemy.com)
2. Create new project for Ethereum
3. Copy the Sepolia testnet RPC URL
4. Format: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

#### C. Etherscan (Contract Verification)
1. Go to [etherscan.io](https://etherscan.io)
2. Create account and navigate to API section
3. Generate new API key
4. Save for contract verification

#### D. GitHub (Code Repository)
1. Create new repository for your project
2. Generate Personal Access Token:
   - Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` permissions
3. Save token for MCP server configuration

#### E. WalletConnect (Optional)
1. Go to [walletconnect.com](https://walletconnect.com)
2. Create new project
3. Copy Project ID for frontend configuration

### 2. Project Setup

#### A. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd vera-protocol

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install agent dependencies
cd ../backend-agents
npm install
```

#### B. Environment Configuration

**Contracts Environment (`contracts/.env`)**
```bash
cd contracts
cp .env.example .env

# Edit .env file:
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_deployer_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
AUTHORIZED_AGENT_ADDRESS=your_ai_agent_wallet_address
```

**Frontend Environment (`frontend/.env.local`)**
```bash
cd frontend
cp .env.example .env.local

# Edit .env.local file:
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### 3. Smart Contract Deployment

#### A. Get Sepolia ETH
1. Visit [sepoliafaucet.com](https://sepoliafaucet.com)
2. Enter your wallet address
3. Request test ETH (you need ~0.1 ETH for deployment)

#### B. Deploy Contract
```bash
cd contracts

# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia

# Expected output:
# ✅ VeraEscrow deployed to: 0x1234...
# 📋 Contract Details:
#   - Technical Release: 80% (IMMUTABLE)
#   - Subjective Buffer: 20% (IMMUTABLE)
#   - Silent Consent: 72 hours (IMMUTABLE)
# 🔐 Domain Separator: 0xabcd...

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "<AUTHORIZED_AGENT_ADDRESS>"
```

#### C. Update Frontend Configuration
```bash
# Update frontend/.env.local with deployed contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234... # From deployment output
NEXT_PUBLIC_AUTHORIZED_AGENT=0x5678... # Your AI agent address
```

### 4. Kiro MCP Server Configuration

#### A. Install UV (Python Package Manager)
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Verify installation
uv --version
```

#### B. Configure MCP Servers
Edit your Kiro MCP configuration file (`~/.kiro/settings/mcp.json`):

```json
{
  "mcpServers": {
    "github": {
      "command": "uvx",
      "args": ["github-mcp-server@latest"],
      "env": {
        "GITHUB_TOKEN": "your_github_personal_access_token"
      },
      "disabled": false,
      "autoApprove": []
    },
    "fetch": {
      "command": "uvx",
      "args": ["fetch-mcp-server@latest"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

#### C. Test MCP Servers
1. Open Kiro
2. Run command palette: "MCP: Reconnect All Servers"
3. Test with: "List available MCP tools"
4. You should see GitHub and Fetch tools available

### 5. AI Agent Setup

#### A. Generate Agent Wallet
```bash
cd backend-agents

# Create new wallet for AI agent
node -e "
const { Wallet } = require('ethers');
const wallet = Wallet.createRandom();
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
"

# Fund this wallet with small amount of Sepolia ETH for gas
```

#### B. Configure Agent Environment
```bash
cd backend-agents
cp .env.example .env

# Edit .env file:
ARBITER_PRIVATE_KEY=your_ai_agent_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### 6. Frontend Development

#### A. Start Development Server
```bash
cd frontend
npm run dev

# Visit http://localhost:3000
```

#### B. Test Voice Recording
1. Connect MetaMask wallet
2. Click microphone button
3. Grant microphone permissions
4. Speak: "I need a React dashboard with authentication, budget 1 ETH, deadline 30 days"
5. Enter freelancer address
6. Click "Generate Agreement & Pin to IPFS"

### 7. Production Deployment

#### A. Frontend Deployment (Vercel)
```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard:
# - NEXT_PUBLIC_CONTRACT_ADDRESS
# - NEXT_PUBLIC_AUTHORIZED_AGENT
# - NEXT_PUBLIC_PINATA_API_KEY
# - NEXT_PUBLIC_PINATA_SECRET_KEY
# - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

#### B. Contract Verification
```bash
cd contracts

# Verify contract on Etherscan
npm run verify:sepolia

# Check verification status at:
# https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

## 🧪 Testing the Complete Flow

### 1. Create Project
1. Visit your deployed frontend
2. Connect wallet with Sepolia ETH
3. Use voice recorder to create project
4. Verify IPFS pinning successful
5. Create project on-chain (requires gas)

### 2. Freelancer Workflow
1. Switch to freelancer wallet
2. Create GitHub repository with project code
3. Submit milestone for verification
4. Trigger Kiro agent verification hook

### 3. AI Verification
1. Agent fetches IPFS agreement using #[fetch]
2. Agent audits GitHub repository using #[github]
3. Agent generates EIP-712 signature if approved
4. 80% payment auto-releases immediately

### 4. Silent Consent
1. Client has 72 hours to review subjective elements
2. If no response, remaining 20% auto-releases
3. Client can dispute within 24-hour window

## 🔧 Troubleshooting

### Common Issues

**MCP Servers Not Working**
- Ensure UV is installed correctly
- Check GitHub token permissions
- Restart Kiro and reconnect MCP servers

**Contract Deployment Fails**
- Verify you have enough Sepolia ETH
- Check RPC URL is correct
- Ensure private key format is correct (with 0x prefix)

**IPFS Pinning Fails**
- Verify Pinata API credentials
- Check API key permissions
- Test with smaller JSON payloads

**Voice Recording Not Working**
- Grant microphone permissions in browser
- Test in Chrome/Edge (better speech recognition)
- Check HTTPS requirement for microphone access

**Wallet Connection Issues**
- Ensure MetaMask is on Sepolia network
- Clear browser cache and cookies
- Try different wallet (WalletConnect)

### Support Channels

- **GitHub Issues**: [Repository Issues](https://github.com/your-repo/issues)
- **Discord**: [Vera Protocol Community](https://discord.gg/vera-protocol)
- **Documentation**: [docs.vera-protocol.com](https://docs.vera-protocol.com)

## 🎉 Success Checklist

- [ ] Smart contract deployed and verified on Sepolia
- [ ] Frontend deployed and accessible
- [ ] MCP servers configured and working
- [ ] Voice recording creates IPFS agreements
- [ ] AI agent can verify GitHub repositories
- [ ] 80/20 payment split working correctly
- [ ] Silent consent protocol functioning
- [ ] All environment variables configured
- [ ] Production monitoring set up

**Congratulations! Vera Protocol is now ready for HackXios 2k25! 🚀**

---

*For additional support, refer to the main README.md or contact the development team.*