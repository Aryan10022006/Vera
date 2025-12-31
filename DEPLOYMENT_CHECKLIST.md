# Vera Protocol - Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Complete
- [x] Smart contracts implemented
- [x] Frontend components built
- [x] Backend agents configured
- [x] WebSocket server ready
- [x] Authentication flow complete
- [x] Real-time features implemented

### ✅ Environment Variables Set
Check that all required environment variables are configured:

**Frontend (.env.local):**
- [ ] VITE_WALLETCONNECT_PROJECT_ID
- [ ] VITE_PINATA_API_KEY
- [ ] VITE_PINATA_SECRET_KEY
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_CONTRACT_ADDRESS (after deployment)
- [ ] VITE_WS_URL

**Backend (.env):**
- [ ] OPENAI_API_KEY
- [ ] ANTHROPIC_API_KEY
- [ ] GITHUB_TOKEN
- [ ] PINATA_API_KEY
- [ ] PINATA_SECRET_KEY
- [ ] PORT

**Contracts (.env):**
- [ ] SEPOLIA_RPC_URL
- [ ] PRIVATE_KEY
- [ ] ETHERSCAN_API_KEY

## Deployment Steps

### Step 1: Deploy Smart Contracts to Sepolia

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Save the output:
# CONTRACT_ADDRESS=0x...
# AUTHORIZED_AGENT=0x...
# DOMAIN_SEPARATOR=0x...
```

**Verify on Etherscan:**
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> "<AUTHORIZED_AGENT>"
```

### Step 2: Update Frontend Configuration

```typescript
// frontend/src/lib/contract.ts
export const CONTRACT_ADDRESS = '0x...' // Paste deployed address
```

```bash
# frontend/.env.local
VITE_CONTRACT_ADDRESS=0x...
```

### Step 3: Start Backend Services

```bash
cd backend-agents/webhook-server

# Install dependencies
npm install

# Start server
npm run dev

# Verify health check
curl http://localhost:3001/health
```

### Step 4: Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Testing Checklist

### End-to-End Testing

#### Test 1: User Onboarding
- [ ] Connect wallet (MetaMask/WalletConnect)
- [ ] Sign in with Google
- [ ] Select role (Client or Freelancer)
- [ ] Access dashboard

#### Test 2: Create Project (Client)
- [ ] Click "New Project"
- [ ] Fill in project details
- [ ] Add milestones
- [ ] Deposit ETH
- [ ] Confirm transaction in wallet
- [ ] Verify project appears on blockchain
- [ ] Check project in marketplace

#### Test 3: Browse & Apply (Freelancer)
- [ ] Browse marketplace without auth
- [ ] View project details
- [ ] Sign in to apply
- [ ] Submit proposal
- [ ] Verify proposal stored on IPFS

#### Test 4: Accept Proposal (Client)
- [ ] View proposals in project detail
- [ ] Review freelancer profile
- [ ] Accept proposal
- [ ] Verify escrow contract updated
- [ ] Chat becomes available

#### Test 5: Real-Time Chat
- [ ] Send message from client
- [ ] Receive message as freelancer
- [ ] Send message from freelancer
- [ ] Receive message as client
- [ ] Verify message history persists

#### Test 6: Submit Milestone (Freelancer)
- [ ] Navigate to project milestones
- [ ] Click "Submit Work"
- [ ] Enter GitHub repository URL
- [ ] List deliverables
- [ ] Submit milestone
- [ ] Verify transaction confirmed
- [ ] Check AI verification triggered

#### Test 7: AI Verification
- [ ] Wait for AI analysis (< 24 hours)
- [ ] Verify 80% payment released
- [ ] Check 72-hour timer started
- [ ] Verify notifications sent

#### Test 8: Silent Consent
- [ ] Wait 72 hours (or fast-forward in test)
- [ ] Call `releaseSilentConsent()`
- [ ] Verify 20% payment released
- [ ] Check milestone marked complete

#### Test 9: Dispute Flow
- [ ] Client raises dispute within 24h
- [ ] Enter dispute reason
- [ ] Submit dispute
- [ ] Verify AI arbitration triggered
- [ ] Check dispute status updated
- [ ] Verify notifications sent

#### Test 10: Early Approval
- [ ] Client approves subjective elements
- [ ] Before 72 hours expire
- [ ] Verify 20% releases immediately
- [ ] Check milestone completed

### Security Testing
- [ ] Test with insufficient funds
- [ ] Test with invalid addresses
- [ ] Test with expired signatures
- [ ] Test reentrancy protection
- [ ] Test pause functionality
- [ ] Test emergency withdrawal

### Performance Testing
- [ ] Load test WebSocket connections
- [ ] Test with multiple concurrent users
- [ ] Verify real-time updates scale
- [ ] Check IPFS upload/download speeds
- [ ] Monitor gas costs

## Post-Deployment Verification

### Smart Contract Verification
- [ ] Contract verified on Etherscan
- [ ] All functions callable
- [ ] Events emitting correctly
- [ ] Balance tracking accurate
- [ ] No security warnings

### Frontend Verification
- [ ] All pages load correctly
- [ ] Wallet connection works
- [ ] Google sign-in works
- [ ] Role selection persists
- [ ] Real-time updates working
- [ ] Chat messages deliver
- [ ] Transactions confirm

### Backend Verification
- [ ] WebSocket server running
- [ ] Health check responds
- [ ] GitHub webhooks receiving
- [ ] AI agents responding
- [ ] IPFS uploads working
- [ ] Logs capturing events

## Monitoring Setup

### Metrics to Track
- [ ] Active WebSocket connections
- [ ] Projects created per day
- [ ] Milestones submitted per day
- [ ] Payments released per day
- [ ] Disputes raised per day
- [ ] AI verification success rate
- [ ] Average verification time
- [ ] Gas costs per transaction

### Alerts to Configure
- [ ] WebSocket server down
- [ ] Smart contract paused
- [ ] High dispute rate (>5%)
- [ ] Low verification success (<80%)
- [ ] IPFS upload failures
- [ ] AI API errors

## Rollback Plan

### If Issues Detected
1. **Pause Smart Contract**
   ```solidity
   contract.pause()
   ```

2. **Stop Backend Services**
   ```bash
   # Stop webhook server
   pm2 stop webhook-server
   ```

3. **Display Maintenance Page**
   ```bash
   # Update frontend
   VITE_MAINTENANCE_MODE=true
   ```

4. **Emergency Withdrawal**
   ```solidity
   contract.emergencyWithdraw(projectId)
   ```

## Success Criteria

### Deployment Successful If:
- ✅ Smart contracts deployed and verified
- ✅ Frontend connects to contracts
- ✅ Backend services running
- ✅ End-to-end flow works
- ✅ Real-time updates deliver
- ✅ Payments execute correctly
- ✅ No critical errors in logs

### Ready for Users If:
- ✅ All tests passing
- ✅ Security audit complete
- ✅ Gas costs optimized
- ✅ Documentation published
- ✅ Support channels ready
- ✅ Monitoring configured
- ✅ Rollback plan tested

## Next Steps After Deployment

1. **Announce Launch**
   - Social media posts
   - Blog article
   - Email to waitlist
   - Community updates

2. **Monitor Closely**
   - Watch logs for errors
   - Track user feedback
   - Monitor gas costs
   - Check AI performance

3. **Iterate Based on Feedback**
   - Fix bugs quickly
   - Optimize UX
   - Add requested features
   - Improve documentation

4. **Plan Mainnet Migration**
   - Security audit
   - Insurance coverage
   - Legal compliance
   - Marketing campaign

## Emergency Contacts

- **Smart Contract Issues**: [Developer]
- **Frontend Issues**: [Developer]
- **Backend Issues**: [Developer]
- **Infrastructure**: [DevOps]
- **Security**: [Security Team]

---

**Remember**: Test thoroughly on Sepolia before considering mainnet deployment!
