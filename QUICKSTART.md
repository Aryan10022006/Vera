# Vera Protocol - Quick Start Guide
## 🚀 Get Running in 15 Minutes (Free Tier)

This guide gets you from zero to a working Vera Protocol system using only free services.

---

## ⚡ STEP 1: Get Free API Keys (15 minutes)

### A. Pinata (IPFS Storage) - FREE
1. Visit https://pinata.cloud
2. Sign up for free account
3. Go to **API Keys** → **New Key**
4. Enable **Admin** permissions
5. **SAVE**: API Key + API Secret

### B. Infura (Ethereum RPC) - FREE
1. Visit https://infura.io
2. Create free account
3. Create **New Project** → **Ethereum**
4. Copy **Sepolia** endpoint: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### C. OpenAI API (AI Verification) - PAID BUT CHEAP
1. Visit https://platform.openai.com
2. Sign up and add payment method
3. Generate API key
4. **Cost**: ~$0.10-$0.30 per verification (very affordable)
5. Alternative: Anthropic Claude at https://console.anthropic.com

### D. Get Free Sepolia ETH - FREE
1. Visit https://sepoliafaucet.com OR https://faucets.chain.link
2. Enter your MetaMask address
3. Request 0.5 Sepolia ETH (test money, no value)
4. Wait 1-2 minutes for confirmation

---

## ⚡ STEP 2: Install & Configure (3 minutes)

Open PowerShell in project folder:

```powershell
cd C:\Users\aryan\OneDrive\Desktop\Vera

# Install all dependencies
cd contracts
npm install
cd ..\frontend
npm install
cd ..\backend-agents
npm install
cd ..
```

---

## ⚡ STEP 3: Create Environment Files (2 minutes)

### A. Contracts Environment
```powershell
cd contracts
copy .env.example .env
```

Edit `contracts\.env` with:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_ID
PRIVATE_KEY=your_metamask_private_key_from_wallet
ETHERSCAN_API_KEY=optional_for_now
AUTHORIZED_AGENT_ADDRESS=0x0000000000000000000000000000000000000000
```

### B. Frontend Environment
```powershell
cd ..\frontend
copy .env.example .env.local
```

Edit `frontend\.env.local` with:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=will_fill_after_deployment
NEXT_PUBLIC_AUTHORIZED_AGENT=will_fill_after_deployment
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

### C. Backend Environment
```powershell
cd ..\backend-agents
copy .env.example .env
```

Edit `backend-agents\.env` with:
```env
# AI Provider (PRODUCTION - NOT Kiro!)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_openai_api_key_from_platform.openai.com
# Alternative: ANTHROPIC_API_KEY=sk-ant-your_anthropic_key

# GitHub
GITHUB_TOKEN=your_github_personal_access_token

# Blockchain
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_ID
CONTRACT_ADDRESS=will_fill_after_deployment
ARBITER_PRIVATE_KEY=will_generate_next_step

# IPFS
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Server
PORT=3001
FRONTEND_URL=http://localhost:3000
```

---

## ⚡ STEP 4: Deploy Smart Contract (2 minutes)

```powershell
cd C:\Users\aryan\OneDrive\Desktop\Vera\contracts

# Compile
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia
```

**Expected Output:**
```
✅ VeraEscrow deployed to: 0x1234567890abcdef...
   Authorized Agent: 0xabcdef123456...
```

**IMPORTANT**: Copy these addresses:
1. Update `frontend\.env.local`:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef...`
   - `NEXT_PUBLIC_AUTHORIZED_AGENT=0xabcdef123456...`

2. Update `backend-agents\.env`:
   - `CONTRACT_ADDRESS=0x1234567890abcdef...`
   - `ARBITER_PRIVATE_KEY=0xabcdef123456...private_key`

---

## ⚡ STEP 5: Start All Services (1 minute)

Open **TWO** separate PowerShell windows:

### Window 1 - Frontend
```powershell
cd C:\Users\aryan\OneDrive\Desktop\Vera\frontend
npm run dev
```
Should show: **Ready on http://localhost:3000**

### Window 2 - Backend (Optional for basic testing)
```powershell
cd C:\Users\aryan\OneDrive\Desktop\Vera\backend-agents
npm run dev
```
Should show: **Server running on port 3001**

---

## ✅ STEP 6: Test the System!

1. **Open Browser**: http://localhost:3000
2. **Connect Wallet**: Click "Connect Wallet" → Select MetaMask → Switch to Sepolia
3. **Try Creating Agreement**:
   - Option A: Click microphone and speak
   - Option B: Use the form (coming in next update)
4. **Pin to IPFS**: Click "Generate Agreement" → Should see IPFS hash
5. **Create Project**: Click "Create Project on Blockchain" → Confirm in MetaMask

---

## 🎯 What Works Right Now (Without Full Kiro Agent)

✅ Voice-to-text agreement creation  
✅ IPFS storage via Pinata  
✅ Smart contract deployment  
✅ On-chain project creation  
✅ Escrow fund locking  
✅ Basic dashboard  

⏳ Coming Next:
- Structured form input (easier than voice)
- Template library for common projects
- Automated AI verification via Kiro
- Real-time milestone tracking

---

## 🆘 Troubleshooting

### "Cannot find module @octokit/rest"
```powershell
cd backend-agents
npm install
```

### "Invalid environment variable"
Double-check your `.env` files have all values filled in (no placeholders)

### "Insufficient funds"
Make sure you have Sepolia ETH in your wallet from the faucet

### Frontend won't start
```powershell
cd frontend
rm -r node_modules
npm install
npm run dev
```

---

## 📊 System Status Check

After starting, verify:
- [ ] Frontend accessible at http://localhost:3000
- [ ] Wallet connects to Sepolia network
- [ ] Voice recording captures audio
- [ ] IPFS pinning returns hash
- [ ] Smart contract transaction succeeds

---

## 🎓 Next Steps

1. **Create your first test project**
2. **Invite a friend as freelancer (use another wallet)**
3. **Test milestone submission flow**
4. **Explore the dashboard**

**Support**: Check PROJECT_STATUS.md for detailed implementation info

---

**Time to first working project: ~15 minutes!** 🚀
