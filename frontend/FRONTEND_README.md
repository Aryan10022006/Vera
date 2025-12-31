# Vera Protocol - React Frontend

## Overview
Modern, elegant React-based frontend for the Vera Protocol decentralized escrow platform. Built with React, TypeScript, Tailwind CSS, and RainbowKit for seamless Web3 integration.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:5173

## Tech Stack

- **React 18** + **TypeScript** - Modern React with type safety
- **Vite** - Lightning fast development
- **Tailwind CSS** - Utility-first styling with custom design
- **RainbowKit** - Beautiful wallet connection
- **wagmi** - React hooks for Ethereum
- **React Router** - Client-side routing

## Features

### Pages
- **Home** (`/`) - Hero with animated orbs, features showcase
- **Marketplace** (`/marketplace`) - Browse and search projects
- **Dashboard** (`/dashboard`) - Manage your projects

### Components
- Navigation with wallet connect
- Project creator with milestones
- Project dashboard with progress tracking
- Marketplace browser with search

### Design
- Dark theme with glass morphism
- Animated backgrounds and transitions
- Fully responsive mobile-first
- Custom Vera color palette

## Environment Variables

Create `.env` file:

```env
VITE_CONTRACT_ADDRESS=0xF6c7481A8760647Cf9706815E1072Cf074E85F51
VITE_PINATA_JWT=your_jwt_token
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Deployment

```bash
npm run build  # Creates dist/ folder
npm run preview  # Preview production build
```

Deploy to Vercel/Netlify and add environment variables.

---

Built with ❤️ for Vera Protocol
