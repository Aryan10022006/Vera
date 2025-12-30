# 🔐 Vera Protocol - Configuration Guide

Complete setup instructions for all required API keys and environment variables.

---

## 📋 Configuration Checklist

- [ ] Ethereum wallet private key
- [ ] Infura/Alchemy RPC endpoints
- [ ] OpenAI API key (recommended) OR Anthropic API key
- [ ] GitHub personal access token
- [ ] Pinata IPFS credentials
- [ ] WalletConnect project ID
- [ ] Etherscan API key

---

## 🔑 Required API Keys

### 1. Ethereum Private Key

**Where to get:**
1. Open MetaMask browser extension
2. Click account icon → Settings → Security & Privacy
3. Click "Show Private Key"
4. Enter your password
5. Copy the private key (starts with `0x`)

**⚠️ SECURITY WARNING:**
- Never commit your private key to git
- Never share it with anyone
- Use a dedicated testnet wallet for development
- Get free Sepolia ETH from: https://sepoliafaucet.com

**Where to add:**
```bash
contracts/.env → PRIVATE_KEY=0x...
backend-agents/.env → PRIVATE_KEY=0x...
```

---

### 2. Infura RPC URLs

**Where to get:**
1. Go to https://infura.io
2. Sign up for free account
3. Create new project
4. Copy the Sepolia endpoint URL

**Example URL:**
```
https://sepolia.infura.io/v3/abc123def456...
```

**Alternative:** Use Alchemy (https://alchemy.com) instead

**Where to add:**
```bash
contracts/.env → SEPOLIA_RPC_URL=https://...
backend-agents/.env → RPC_URL=https://...
```

---

### 3. OpenAI API Key (Recommended)

**Where to get:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

**Pricing:**
- GPT-4 Turbo: ~$0.01/1k input tokens, ~$0.03/1k output tokens
- Expected cost: **~$0.05 per verification**

**Where to add:**
```bash
backend-agents/.env → OPENAI_API_KEY=sk-...
backend-agents/.env → AI_PROVIDER=openai
```

---

### 4. Anthropic API Key (Alternative)

**Where to get:**
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to API Keys
4. Create new key

**Pricing:**
- Claude Opus: ~$0.015/1k input tokens, ~$0.075/1k output tokens
- Expected cost: **~$0.10 per verification**

**Where to add:**
```bash
backend-agents/.env → ANTHROPIC_API_KEY=sk-ant-...
backend-agents/.env → AI_PROVIDER=anthropic
```

---

### 5. GitHub Personal Access Token

**Where to get:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Add note: "Vera AI Verifier"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:org` (Read org and team membership)
5. Generate token and copy (starts with `ghp_`)

**Where to add:**
```bash
backend-agents/.env → GITHUB_TOKEN=ghp_...
```

---

### 6. Pinata IPFS Credentials

**Where to get:**
1. Go to https://pinata.cloud
2. Sign up for free account (1 GB free storage)
3. Navigate to API Keys section
4. Create new JWT key
5. Copy the JWT token

**Gateway URL:**
- Default: `gateway.pinata.cloud`
- Or create dedicated gateway in Pinata dashboard

**Where to add:**
```bash
frontend/.env.local → NEXT_PUBLIC_PINATA_JWT=eyJhbGc...
frontend/.env.local → NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

---

### 7. WalletConnect Project ID

**Where to get:**
1. Go to https://cloud.walletconnect.com
2. Sign up for free account
3. Create new project
4. Copy the Project ID

**Where to add:**
```bash
frontend/.env.local → NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123...
```

---

### 8. Etherscan API Key

**Where to get:**
1. Go to https://etherscan.io/myapikey
2. Sign up or log in
3. Create new API key
4. Copy the key

**Purpose:** Automated contract verification after deployment

**Where to add:**
```bash
contracts/.env → ETHERSCAN_API_KEY=ABC123...
```

---

## 📝 Environment File Setup

### contracts/.env
```bash
PRIVATE_KEY=0x1234567890abcdef...
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHERSCAN_API_KEY=ABC123DEF456...
```

### frontend/.env.local
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=abc123def456...
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOi...
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### backend-agents/.env
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-abc123...
GITHUB_TOKEN=ghp_abc123def456...
PRIVATE_KEY=0x1234567890abcdef...
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
WEBHOOK_SECRET=random_secure_string_here
PORT=3001
LOG_LEVEL=info
```

---

## 🚀 Next Steps

After configuring all environment files:

1. **Deploy Smart Contract:**
   ```bash
   cd contracts
   npm run deploy:sepolia
   ```
   
2. **Update Contract Addresses:**
   - Copy deployed contract address from terminal output
   - Update in `frontend/.env.local` → `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - Update in `backend-agents/.env` → `CONTRACT_ADDRESS`

3. **Start Services:**
   ```bash
   # Terminal 1 - Frontend
   cd frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd backend-agents
   npm run dev
   ```

4. **Access Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

---

## 🔒 Security Best Practices

1. **Never commit `.env` files to git** (already in `.gitignore`)
2. **Use different wallets for testnet vs mainnet**
3. **Rotate API keys periodically**
4. **Set spending limits on API accounts**
5. **Use environment-specific keys (dev vs production)**
6. **Enable 2FA on all service accounts**

---

## 💰 Cost Estimates

**One-time setup:**
- Free Sepolia ETH: $0
- Infura free tier: $0
- Pinata 1GB: $0
- WalletConnect: $0

**Per-verification costs:**
- OpenAI GPT-4: ~$0.05
- Anthropic Claude: ~$0.10

**Monthly costs (100 projects, 500 verifications):**
- OpenAI: ~$25/month
- IPFS storage: ~$2/month
- Total: **~$27/month**

---

## 🆘 Troubleshooting

### "Invalid API Key" Errors
- Verify key format (OpenAI: `sk-`, GitHub: `ghp_`, etc.)
- Check for extra spaces or newlines
- Ensure key has necessary permissions

### "Insufficient Funds" on Deployment
- Get Sepolia ETH from faucet: https://sepoliafaucet.com
- Verify wallet address has balance on Etherscan

### "Cannot Connect to RPC"
- Verify Infura/Alchemy project ID is correct
- Check if endpoint URL is properly formatted
- Test endpoint with curl or Postman

### "IPFS Upload Failed"
- Verify Pinata JWT is valid
- Check Pinata account storage limits
- Ensure file size is within limits

---

**Configuration complete? Proceed to deployment! 🚀**
