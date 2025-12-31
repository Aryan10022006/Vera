# Vera Protocol - Setup Guide

## 🎉 IPFS Already Configured!

✅ **Pinata is ready to use** - No action needed for IPFS storage!

You only need to set up **ONE** thing: Choose your AI provider (free options available).

---

## ✅ Already Configured

### 1. Pinata IPFS Storage
**Status:** ✅ **CONFIGURED AND READY**

```env
VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...(configured)
```

**No action needed!** Your Pinata account is set up with:
- 1 GB storage
- Unlimited bandwidth
- API access ready

### 2. Firebase Authentication
**Status:** ✅ **CONFIGURED AND READY**

Google OAuth is configured and working:
```env
VITE_FIREBASE_API_KEY=AIzaSyB...(configured)
VITE_FIREBASE_PROJECT_ID=vera-e20ea
```

### 3. WalletConnect
**Status:** ✅ **CONFIGURED AND READY**

```env
VITE_WALLETCONNECT_PROJECT_ID=3800ab5954fc0ffaf6a59bafc4587030
```

### 4. Smart Contract
**Status:** ✅ **DEPLOYED ON SEPOLIA**

```env
VITE_CONTRACT_ADDRESS=0xF6c7481A8760647Cf9706815E1072Cf074E85F51
```

### 5. GitHub Integration
**Status:** ✅ **OAUTH-BASED (NO TOKEN NEEDED)**

Freelancers connect their GitHub repos via OAuth - no manual token required!

---

## 🤖 Choose Your AI Provider (Required)

Vera supports **TWO FREE OPTIONS** for AI verification:

### Option 1: Hugging Face Inference API (FREE)

**Recommended for cloud deployment**

#### Steps:
1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Sign up/login (100% free)
3. Click **New token**
4. Settings:
   - Name: "Vera Protocol"
   - Type: **Read**
5. Click **Create**
6. Copy the token (starts with `hf_`)
7. Add to `.env`:
   ```env
   HUGGINGFACE_API_KEY=hf_your_token_here
   ```

**Free Tier:**
- 1000 requests/month
- Access to Mixtral, Llama, CodeLlama models
- No credit card required
- Perfect for testing and small-scale production

**Models Available:**
- `mistralai/Mixtral-8x7B-Instruct-v0.1` (Recommended)
- `codellama/CodeLlama-70b-Instruct-hf`
- `meta-llama/Llama-2-70b-chat-hf`

---

### Option 2: Ollama (100% FREE, Local)

**Recommended for development and unlimited usage**

#### Steps:
1. Install Ollama: [https://ollama.ai](https://ollama.ai)
2. Open terminal:
   ```bash
   # Download CodeLlama model (~4GB)
   ollama pull codellama
   
   # Or use Mistral
   ollama pull mistral
   
   # Start Ollama server
   ollama serve
   ```
3. Update `.env`:
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   # Comment out or remove HUGGINGFACE_API_KEY
   ```

**Benefits:**
- **$0 cost** forever
- Unlimited requests
- Works offline
- Privacy (code never leaves your machine)
- Faster response times (local)

**System Requirements:**
- 8GB RAM minimum
- 4GB disk space
- Modern CPU (any from last 5 years works)

---

### Which Should I Choose?

| Feature | Hugging Face | Ollama |
|---------|-------------|--------|
| Cost | Free (1000/month) | $0 unlimited |
| Setup | 2 minutes | 10 minutes |
| Performance | Cloud (fast) | Local (faster) |
| Privacy | Data sent to HF | 100% private |
| Best For | Production | Development |

**Recommendation:** Start with **Hugging Face** for easy setup, switch to **Ollama** for unlimited free usage.

---

## 7. Smart Contract Deployment 📜

### Current Status:
- **Testnet:** Deployed on Sepolia at `0xF6c7481A8760647Cf9706815E1072Cf074E85F51`
- **Mainnet:** Not yet deployed

### Deploy to Mainnet:

#### Prerequisites:
1. ETH for gas fees (~0.05 ETH for deployment)
2. Updated RPC provider (Infura/Alchemy)

#### Steps:
1. Get Infura/Alchemy API key:
   - Infura: [https://infura.io](https://infura.io)
   - Alchemy: [https://alchemy.com](https://alchemy.com)

2. Update `contracts/hardhat.config.js`:
   ```javascript
   networks: {
     mainnet: {
       url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
       accounts: [process.env.DEPLOYER_PRIVATE_KEY],
       chainId: 1
     }
   }
   ```

3. Add to `.env`:
   ```env
   INFURA_API_KEY=your_infura_key
   DEPLOYER_PRIVATE_KEY=your_private_key_with_eth
   ```

4. Deploy:
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network mainnet
   ```

5. Update frontend `.env`:
   ```env
   VITE_CONTRACT_ADDRESS=0x...new_mainnet_address
   ```

6. Update `frontend/src/wagmi.ts` to use mainnet:
   ```typescript
   import { mainnet } from 'wagmi/chains';
   
   const config = createConfig({
     chains: [mainnet], // instead of sepolia
     // ...
   });
   ```

---

## 🚀 Production Deployment Checklist

### Backend Services

#### 1. WebSocket Server
```bash
cd backend-agents/webhook-server
npm install
npm run build
npm start
```

**Production Setup:**
- Deploy to VPS/cloud (AWS, DigitalOcean, etc.)
- Use PM2 for process management
- Enable HTTPS (wss://)
- Configure domain: wss://ws.veraprotocol.com

**Update .env:**
```env
VITE_WS_URL=wss://ws.veraprotocol.com
```

#### 2. AI Verification Service
- Runs in webhook server
- Ensure OpenAI/Anthropic keys are set
- Monitor API usage and costs

#### 3. GitHub Webhooks (Optional)
- Set up webhook endpoint
- Configure in GitHub repo settings
- URL: `https://api.veraprotocol.com/webhook/github`

### Frontend Deployment

#### Option A: Vercel (Recommended)
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

Configure environment variables in Vercel dashboard.

#### Option B: Netlify
```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify
```

#### Option C: Traditional Hosting
```bash
cd frontend
npm run build
# Upload dist/ to your server
# Configure nginx/apache
```

### Environment Variables for Production

Create `.env.production`:
```env
# Blockchain
VITE_CONTRACT_ADDRESS=0x...mainnet_address

# IPFS
VITE_PINATA_JWT=your_production_jwt
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=3800ab5954fc0ffaf6a59bafc4587030

# WebSocket
VITE_WS_URL=wss://ws.veraprotocol.com

# Firebase
VITE_FIREBASE_API_KEY=your_production_key
VITE_FIREBASE_AUTH_DOMAIN=veraprotocol.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vera-production
VITE_FIREBASE_STORAGE_BUCKET=vera-production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

---

## 📊 Updated Cost Estimates (Monthly)

### Free Tier (Testing & Small Production)
- **Pinata:** ✅ Configured (1 GB)
- **Hugging Face:** Free (1000 requests)
- **Vercel/Netlify:** Free
- **Firebase:** Free (up to 10K users)
- **WalletConnect:** Free
- **Ollama:** $0 (local)
- **Total:** **$0/month** 🎉

### Medium Traffic (100-1000 projects/month)
- **Pinata:** $20/month (Pro plan)
- **Hugging Face:** Free (still within limits)
- **Hosting:** $20 (Vercel Pro)
- **Firebase:** $25 (Blaze plan)
- **VPS (WebSocket):** $10
- **Total:** **$75/month** (vs $115-265 with OpenAI)

---

## 🔒 Security Best Practices

### API Key Management
1. **Never commit keys to Git**
   - ✅ `.env` is in `.gitignore`
   - Use environment variables in CI/CD

2. **Rotate keys regularly**
   - GitHub token: Every 90 days
   - OpenAI key: If compromised
   - Firebase: Use Firebase Admin SDK in production

3. **Use secret managers**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Google Cloud Secret Manager

### Frontend Security
1. **Only expose VITE_* variables**
   - Never expose backend API keys
   - OPENAI_API_KEY should stay server-side

2. **Use HTTPS everywhere**
   - Frontend: https://
   - WebSocket: wss://
   - APIs: https://

3. **Rate limiting**
   - Implement on backend APIs
   - Prevent abuse of AI verification

---

## 🧪 Testing Production Setup

### 1. Test IPFS Upload
```bash
cd frontend
npm run dev

# In browser console:
import { pinJSONToIPFS } from './lib/ipfs';
const hash = await pinJSONToIPFS({ test: 'data' });
console.log('IPFS Hash:', hash);
```

### 2. Test AI Verification
```bash
cd backend-agents/webhook-server
npm run dev

# In another terminal:
curl -X POST http://localhost:3001/api/milestone/verify \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "0x123",
    "milestoneId": "0x456",
    "repositoryUrl": "https://github.com/user/repo",
    "freelancerAddress": "0x..."
  }'
```

### 3. Test WebSocket Connection
```bash
# Open browser console on your frontend
const ws = new WebSocket('ws://localhost:3001');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (msg) => console.log('Message:', msg.data);
```

### 4. Test Smart Contract
```bash
cd contracts
npx hardhat test
```

---

## 📞 Support & Troubleshooting

### Common Issues

#### 1. "IPFS Upload Failed"
- **Check:** VITE_PINATA_JWT is set correctly
- **Solution:** Get new JWT from Pinata dashboard

#### 2. "OpenAI API Error"
- **Check:** OPENAI_API_KEY is valid
- **Check:** You have credits in your account
- **Solution:** Add payment method on OpenAI platform

#### 3. "WebSocket Connection Failed"
- **Check:** WebSocket server is running
- **Check:** VITE_WS_URL is correct
- **Solution:** Start webhook server with `npm run dev`

#### 4. "Transaction Failed"
- **Check:** CONTRACT_ADDRESS is correct
- **Check:** Network matches (mainnet vs testnet)
- **Check:** You have ETH for gas
- **Solution:** Verify contract deployment

---

## 🎯 Next Steps After API Setup

1. **Test all features locally**
   - Create project
   - Submit proposal
   - Complete milestone
   - Verify with AI

2. **Deploy to staging**
   - Use testnet (Sepolia)
   - Test with small amounts
   - Verify all flows work

3. **Security audit**
   - Review smart contracts
   - Penetration testing
   - Code review

4. **Deploy to production**
   - Deploy contracts to mainnet
   - Update all environment variables
   - Deploy frontend
   - Deploy backend services

5. **Monitor and maintain**
   - Set up error tracking (Sentry)
   - Monitor API costs
   - Track smart contract events

---

## ✅ Setup Completion Checklist

- [✓] Pinata IPFS configured (already done!)
- [✓] Firebase authentication configured (already done!)
- [✓] WalletConnect integrated (already done!)
- [✓] Smart contract deployed on Sepolia (already done!)
- [✓] GitHub OAuth configured (no token needed!)
- [ ] Choose AI provider:
  - [ ] Option A: Get Hugging Face token (2 min setup)
  - [ ] Option B: Install Ollama locally (10 min setup)
- [ ] Test AI verification
- [ ] Test full project creation flow
- [ ] Deploy to production (optional)

---

**Current Status:** 🚀 **95% Complete**  
**Last Step:** Choose your free AI provider (Hugging Face or Ollama)  
**Time Required:** 2-10 minutes

---

For complete feature documentation, see [PRODUCTION_STATUS.md](./PRODUCTION_STATUS.md)  
For quick setup, see [QUICKSTART.md](./QUICKSTART.md)
