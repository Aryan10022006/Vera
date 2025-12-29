# Vera Protocol - Workspace Structure

## Root Directory Organization
```
vera-protocol/
├── frontend/           # Next.js application
├── contracts/          # Solidity smart contracts
├── backend-agents/     # Standalone AI agents
└── .kiro/             # Documentation and steering (dev only)
```

## Frontend Structure (/frontend)
```
frontend/
├── app/               # Next.js App Router pages
├── components/        # Reusable UI components
├── lib/              # Utility functions and configurations
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── styles/           # Global styles and Tailwind config
└── public/           # Static assets
```

## Contracts Structure (/contracts)
```
contracts/
├── src/              # Solidity source files
│   ├── escrow/       # Escrow contract logic
│   ├── governance/   # DAO and voting mechanisms
│   └── utils/        # Shared contract utilities
├── test/             # Contract test suites
├── scripts/          # Deployment and utility scripts
└── artifacts/        # Compiled contract artifacts
```

## Backend Agents Structure (/backend-agents)
```
backend-agents/
├── webhook-server/    # Production webhook server (replaces Kiro hooks)
├── verification/      # Standalone AI verification agents
├── arbitration/      # Dispute resolution AI agents
├── voice-processing/ # Speech-to-text and NLP agents
├── github-integration/ # GitHub API integration agents
├── shared/           # Common utilities and types
└── config/           # Agent configuration files
```

## Development Workflow
- **Frontend Development**: Use `/frontend` for all UI/UX work
- **Smart Contract Development**: Use `/contracts` for blockchain logic
- **AI Agent Development**: Use `/backend-agents` for intelligent automation
- **Cross-Layer Integration**: Coordinate through shared type definitions

## File Naming Conventions
- **Components**: PascalCase (e.g., `ProjectCard.tsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Contracts**: PascalCase (e.g., `EscrowManager.sol`)
- **Agents**: kebab-case (e.g., `milestone-verifier.ts`)

## Import Path Standards
- Use absolute imports with path mapping
- Frontend: `@/components`, `@/lib`, `@/types`
- Contracts: `@contracts/src`, `@contracts/test`
- Agents: `@agents/shared`, `@agents/arbitration`

## Environment Configuration
- **Development**: Local blockchain + local AI agents
- **Staging**: Sepolia testnet + staging AI agents
- **Production**: Ethereum mainnet + production AI agents

## Deployment Strategy
- **Frontend**: Vercel with automatic deployments
- **Contracts**: Hardhat deployment scripts
- **AI Agents**: Docker containers + webhook servers