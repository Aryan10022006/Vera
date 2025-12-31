# Vera Protocol Frontend Features Documentation

## Current Implementation (Next.js 15.5.9)

### Core Pages
- **Homepage (`app/page.tsx`)**: Main landing page with hero section, features, marketplace, dashboard

### Components

#### 1. **VoiceRecorder** (`components/VoiceRecorder.tsx`)
- Voice-to-text conversion using Web Speech API
- Real-time speech recognition
- Audio recording and playback
- Automatic agreement generation from voice input
- IPFS pinning via Pinata
- Displays: transcript, freelancer address input, agreement preview
- Shows project ID, IPFS hash, requirements count, payment amount

#### 2. **SimpleProjectCreator** (`components/SimpleProjectCreator.tsx`)
- Form-based project creation (alternative to voice)
- Fields: title, description, budget, timeline, skills
- Auto-calculates 80/20 split (technical/subjective)
- Creates ProjectListing objects
- Pins to IPFS marketplace

#### 3. **MarketplaceBrowser** (`components/MarketplaceBrowser.tsx`)
- Browse open projects
- Search functionality
- Filter by skills, budget, timeline
- Project cards showing:
  - Title, description, client address
  - Budget (total ETH)
  - Timeline (estimated days)
  - Required skills (tags)
  - Technical requirements count
  - Proposal count
- Actions: View Details, Start Chat

#### 4. **ChatInterface** (`components/ChatInterface.tsx`)
- Real-time WebSocket-based messaging
- 1-on-1 chat between client and freelancer
- Message history loading
- Typing indicators
- Read receipts
- Online/offline status
- Message persistence to IPFS

#### 5. **ProjectDashboard** (`components/ProjectDashboard.tsx`)
- View all user projects
- Filter by status (active, completed, disputed)
- Project cards with milestone progress
- Payment status tracking
- Action buttons: Submit Work, Release Payment, Raise Dispute

#### 6. **GitHubConnect** (`components/GitHubConnect.tsx`)
- GitHub OAuth integration
- Display connection status
- Show connected repositories
- Repository verification for milestone submissions

#### 7. **Navigation** (`components/Navigation.tsx`)
- Sticky top navigation
- Logo and branding
- Navigation links: Marketplace, Create Project, Dashboard, How It Works
- Wallet connection button (RainbowKit)
- Network indicator (Sepolia)
- Mobile responsive menu

### Design System

#### Colors (Tailwind Config)
```javascript
vera: {
  primary: '#6366f1',    // Indigo
  secondary: '#8b5cf6',  // Purple
  accent: '#06b6d4',     // Cyan
  neutral: '#64748b',    // Slate
  success: '#10b981',    // Green
  warning: '#f59e0b',    // Amber
  error: '#ef4444',      // Red
}
```

#### Animations
- `float`: 6s ease-in-out infinite (floating orbs)
- `glow`: 2s ease-in-out infinite alternate
- `fade-in`: 0.8s ease-out
- `slide-up`: 0.6s ease-out
- `scale-in`: 0.5s ease-out
- `pulse-slow`: 3s infinite
- `bounce-slow`: 3s infinite

#### UI Patterns
- **Glass Morphism**: `bg-white/10 backdrop-blur-xl border border-white/20`
- **Gradient Borders**: Pseudo-elements with blur effects
- **Hover Transforms**: `hover:-translate-y-2` on cards
- **Glow Effects**: Gradient shadows with blur
- **Voice Recording Animation**: Pulsing rings

### Page Sections

#### Hero Section
- Dark gradient background (slate-900 → indigo-900 → purple-900)
- Animated floating orbs (3 layers)
- Grid overlay pattern
- Badge: "HackXios 2k25 Winner"
- Large headline with gradient text
- Subtitle and description
- 3 CTA buttons: Start Creating, Watch Demo, Connect Wallet
- Stats cards (glass morphism):
  - 95% Auto-Release Rate
  - <2h Dispute Resolution
  - 100% Decentralized

#### Features Section
- 3-column grid
- Voice-First Interface
- 80/20 Auto-Release
- Silent Consent Protocol
- Each with gradient icons, descriptions, stats

#### How It Works Section
- Dark themed section
- 4-step process cards:
  1. Speak Requirements (Mic icon)
  2. Create Contract (Code icon)
  3. Work & Verify (CheckCircle icon)
  4. Instant Payment (TrendingUp icon)

#### Voice Recorder Section
- Premium card design
- Badge: "Voice-Powered Agreements"
- Large heading
- VoiceRecorder component
- 3 info cards: Instant Processing, Smart Contracts, IPFS Storage

#### Marketplace Section
- Search bar with icon
- Filter button
- Project grid (2 columns)
- Project cards with all details
- Chat and View Details actions

#### Dashboard Section
- Header with title and badges (Live Dashboard, Real-time Updates)
- GitHub connection card (with glow effect)
- ProjectDashboard component

#### Silent Consent Protocol Section
- Premium card with amber/orange gradient
- Large icon (Clock)
- "BREAKTHROUGH FEATURE" badge
- 3 sub-cards: AI Audit, Client Review, Auto-Release

### Typography
- **Font Family**: Inter (sans), JetBrains Mono (mono)
- **Headings**: Font-black, gradient text
- **Body**: Slate-600/700
- **Sizes**: 
  - Hero H1: text-7xl to text-9xl
  - Section H2: text-4xl to text-5xl
  - Card H3: text-xl to text-2xl

### Libraries & Dependencies
- **Next.js**: 14.2.18
- **React**: 18.x
- **RainbowKit**: Wallet connection
- **wagmi**: Ethereum hooks
- **viem**: Ethereum utilities
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **IPFS**: Pinata integration
- **Web Speech API**: Voice recognition

### State Management
- React useState for local state
- WebSocket for real-time updates
- IPFS for decentralized storage
- No Redux/Zustand

### Key Features Summary
1. ✅ Voice-to-contract creation
2. ✅ Form-based project creation
3. ✅ Marketplace browsing and search
4. ✅ Real-time chat (WebSocket)
5. ✅ GitHub OAuth integration
6. ✅ Wallet connection (RainbowKit)
7. ✅ Project dashboard
8. ✅ IPFS integration (Pinata)
9. ✅ Responsive design
10. ✅ Glass morphism UI
11. ✅ Dark hero section
12. ✅ Animated backgrounds
13. ✅ Professional navigation
14. ✅ Mobile menu

### File Structure
```
frontend/
├── app/
│   ├── page.tsx                 # Main homepage
│   ├── layout.tsx              # Root layout with nav/footer
│   ├── providers.tsx           # RainbowKit/wagmi providers
│   ├── globals.css             # Global styles & animations
│   └── github/
│       └── callback/
│           └── page.tsx        # OAuth callback
├── components/
│   ├── VoiceRecorder.tsx
│   ├── SimpleProjectCreator.tsx
│   ├── MarketplaceBrowser.tsx
│   ├── ChatInterface.tsx
│   ├── ProjectDashboard.tsx
│   ├── GitHubConnect.tsx
│   └── Navigation.tsx
├── lib/
│   ├── ipfs.ts                 # IPFS utilities
│   └── wagmi.ts                # Wagmi configuration
├── types/
│   ├── global.d.ts
│   └── marketplace.ts
├── public/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### Environment Variables Required
```
NEXT_PUBLIC_PINATA_API_KEY=
NEXT_PUBLIC_PINATA_SECRET_KEY=
NEXT_PUBLIC_PINATA_JWT=
NEXT_PUBLIC_IPFS_GATEWAY=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_WEBSOCKET_URL=
NEXT_PUBLIC_GITHUB_CLIENT_ID=
NEXT_PUBLIC_GITHUB_REDIRECT_URI=
```

### Routes
- `/` - Homepage
- `/github/callback` - OAuth callback

### API Integrations
- Pinata (IPFS)
- OpenAI (backend)
- GitHub OAuth
- WebSocket server (backend)
- Ethereum (Sepolia testnet)
