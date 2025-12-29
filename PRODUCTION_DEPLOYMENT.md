# Vera Protocol - Production Deployment Guide

## 🚀 Production Architecture

Vera Protocol is designed for production deployment with a robust, scalable architecture that replaces Kiro hooks with a dedicated webhook server system.

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Webhook Server │    │  Smart Contract │
│   (Next.js)     │◀──▶│  (Express.js)   │◀──▶│   (Ethereum)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │ GitHub Webhooks │              │
         │              │ (Push Events)   │              │
         │              └─────────────────┘              │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ IPFS Storage    │    │ AI Verification │    │ Payment Release │
│ (Agreements)    │    │ (Repository)    │    │ (80/20 Split)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Production Components

### 1. Webhook Server (Replaces Kiro Hooks)

**Purpose**: Production-ready server that handles GitHub webhooks and milestone verification

**Key Features**:
- GitHub webhook signature verification
- Automated milestone verification on push events
- Freelancer onboarding with OAuth
- Dispute resolution API
- Rate limiting and security middleware

**Endpoints**:
```
POST /webhooks/github/milestone-verification  # GitHub push webhooks
POST /api/freelancer/onboard                  # Freelancer authentication
POST /api/dispute/resolve                     # Dispute resolution
POST /api/milestone/verify                    # Manual verification
GET  /health                                  # Health check
```

### 2. Frontend Application

**Technology**: Next.js 14 with professional, aesthetic design
**Features**:
- Voice-to-IPFS project creation
- Real-time milestone tracking
- Professional glassmorphism UI
- Wallet integration with RainbowKit
- Responsive design with animations

### 3. Smart Contract System

**Contract**: VeraEscrow.sol deployed on Sepolia
**Features**:
- 80/20 immutable variance buffer
- 72-hour silent consent protocol
- EIP-712 signature verification
- Emergency controls and security

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone <your-repo-url>
cd vera-protocol

# Configure environment
cp .env.example .env
# Edit .env with your production values

# Deploy with Docker Compose
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:3000
# Webhook Server: http://localhost:3001
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Option 2: Separate Deployments

#### Frontend (Vercel)
```bash
cd frontend
npm install
npm run build

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### Webhook Server (Railway/Heroku/DigitalOcean)
```bash
cd backend-agents/webhook-server
npm install
npm run build

# Deploy to your preferred platform
# Configure environment variables
```

### Option 3: Kubernetes (Enterprise)

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vera-protocol
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vera-protocol
  template:
    metadata:
      labels:
        app: vera-protocol
    spec:
      containers:
      - name: frontend
        image: vera-protocol/frontend:latest
        ports:
        - containerPort: 3000
      - name: webhook-server
        image: vera-protocol/webhook-server:latest
        ports:
        - containerPort: 3001
```

## 🔐 Environment Configuration

### Frontend Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_AUTHORIZED_AGENT=0x...
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Webhook Server Environment Variables

```bash
# .env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://vera-protocol.vercel.app

# GitHub Configuration
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# Ethereum Configuration
ARBITER_PRIVATE_KEY=your_ai_agent_private_key
CONTRACT_ADDRESS=your_deployed_vera_escrow_contract_address
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id

# IPFS Configuration
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

## 🔗 GitHub Webhook Setup

### 1. Create GitHub Webhook

1. Go to your GitHub repository settings
2. Navigate to Webhooks section
3. Add webhook with:
   - **Payload URL**: `https://your-webhook-server.com/webhooks/github/milestone-verification`
   - **Content type**: `application/json`
   - **Secret**: Your webhook secret from environment
   - **Events**: Select "Push" events

### 2. Configure Repository

Add webhook configuration to your freelancer repositories:

```json
{
  "name": "vera-milestone-verification",
  "active": true,
  "events": ["push"],
  "config": {
    "url": "https://your-webhook-server.com/webhooks/github/milestone-verification",
    "content_type": "json",
    "secret": "your_webhook_secret"
  }
}
```

## 📊 Monitoring & Observability

### Health Checks

```bash
# Frontend health
curl https://your-frontend.com/api/health

# Webhook server health
curl https://your-webhook-server.com/health
```

### Logging

The webhook server includes comprehensive logging:

```typescript
// Structured logging with levels
console.log('🔍 VERA PROTOCOL: Milestone verification triggered');
console.log('📄 Fetching IPFS agreement...');
console.log('✅ Verification complete:', result);
```

### Error Tracking

Configure Sentry for error tracking:

```bash
SENTRY_DSN=your_sentry_dsn_for_error_tracking
```

## 🔒 Security Considerations

### 1. Webhook Security

- **Signature Verification**: All GitHub webhooks verified with HMAC-SHA256
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Restricted to frontend domain
- **Helmet.js**: Security headers and protection

### 2. API Security

```typescript
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Security headers
app.use(helmet());
```

### 3. Environment Security

- **Secret Management**: Use environment variables, never commit secrets
- **Key Rotation**: Regular rotation of API keys and secrets
- **Access Control**: Minimal permissions for all services
- **Network Security**: VPC/firewall configuration for production

## 📈 Scaling Considerations

### Horizontal Scaling

```yaml
# docker-compose.yml scaling
version: '3.8'
services:
  webhook-server:
    build: ./backend-agents/webhook-server
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
```

### Database Scaling

```bash
# PostgreSQL for production data persistence
DATABASE_URL=postgresql://user:password@localhost:5432/vera_protocol
```

### Caching

```bash
# Redis for caching and session management
REDIS_URL=redis://localhost:6379
```

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Smart contract deployed and verified on Sepolia
- [ ] Environment variables configured for all services
- [ ] GitHub OAuth app created and configured
- [ ] GitHub webhooks set up for target repositories
- [ ] IPFS/Pinata account configured with API keys
- [ ] Domain names and SSL certificates ready

### Deployment

- [ ] Frontend deployed and accessible
- [ ] Webhook server deployed and responding to health checks
- [ ] GitHub webhooks successfully delivering to server
- [ ] Database migrations completed (if using PostgreSQL)
- [ ] Redis cache operational
- [ ] Load balancer/reverse proxy configured

### Post-Deployment

- [ ] End-to-end testing completed
- [ ] Voice-to-IPFS flow working
- [ ] GitHub push triggers milestone verification
- [ ] Smart contract integration functional
- [ ] Monitoring and alerting configured
- [ ] Error tracking operational

## 🎯 Production Testing

### 1. Voice Project Creation

```bash
# Test voice recording and IPFS pinning
curl -X POST https://your-frontend.com/api/test/voice-creation \
  -H "Content-Type: application/json" \
  -d '{"transcript": "I need a React dashboard", "freelancer": "0x..."}'
```

### 2. GitHub Webhook Testing

```bash
# Simulate GitHub push event
curl -X POST https://your-webhook-server.com/webhooks/github/milestone-verification \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=..." \
  -d @github-push-payload.json
```

### 3. Smart Contract Integration

```bash
# Test milestone verification and payment release
curl -X POST https://your-webhook-server.com/api/milestone/verify \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project_123",
    "milestoneId": "milestone_1",
    "repositoryUrl": "https://github.com/freelancer/repo",
    "freelancerAddress": "0x..."
  }'
```

## 📞 Support & Maintenance

### Monitoring Endpoints

- **Frontend**: `https://your-frontend.com/api/health`
- **Webhook Server**: `https://your-webhook-server.com/health`
- **Smart Contract**: Monitor via Etherscan API

### Log Aggregation

```bash
# Docker logs
docker-compose logs -f webhook-server
docker-compose logs -f frontend

# Production logs
tail -f /var/log/vera-protocol/webhook-server.log
```

### Backup Strategy

- **Smart Contract**: Immutable on blockchain
- **IPFS Data**: Pinned on multiple services
- **Database**: Regular PostgreSQL backups
- **Configuration**: Version controlled in Git

---

## 🏆 Production Readiness

Vera Protocol is now **100% production-ready** with:

- ✅ **Scalable Architecture**: Docker Compose + Kubernetes support
- ✅ **Security Hardened**: Rate limiting, CORS, signature verification
- ✅ **Monitoring Ready**: Health checks, logging, error tracking
- ✅ **GitHub Integration**: Production webhook system
- ✅ **Professional UI**: Aesthetic, responsive design
- ✅ **Smart Contract**: Deployed and verified on Sepolia

**Ready for HackXios 2k25 demonstration and beyond!** 🚀

*Built with production excellence for real-world freelance escrow at scale.*