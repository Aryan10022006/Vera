import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Vera Protocol - AI-Mediated Web3 Escrow',
  description: 'Eliminate freelance fraud with AI-powered neutral arbitration and voice-first interface. Built for HackXios 2k25.',
  keywords: ['vera', 'protocol', 'escrow', 'ai', 'web3', 'freelance', 'ethereum', 'blockchain'],
  authors: [{ name: 'Vera Protocol Team' }],
  openGraph: {
    title: 'Vera Protocol - AI-Mediated Web3 Escrow',
    description: 'Revolutionary escrow platform with AI arbitration',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vera Protocol',
    description: 'AI-Mediated Pure Web3 Escrow Platform',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <div className="min-h-screen">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative group">
                      <div className="w-10 h-10 bg-gradient-to-br from-vera-primary to-vera-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <span className="text-white font-bold text-lg">V</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-vera-accent rounded-full animate-pulse shadow-lg"></div>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold gradient-text">
                        Vera Protocol
                      </h1>
                      <p className="text-xs text-slate-500 font-medium">AI-Mediated Escrow</p>
                    </div>
                  </div>
                  
                  <nav className="hidden md:flex items-center space-x-1">
                    <a href="/" className="px-4 py-2 text-slate-600 hover:text-vera-primary hover:bg-white/50 rounded-lg transition-all duration-200 font-medium">
                      Dashboard
                    </a>
                    <a href="/create" className="px-4 py-2 text-slate-600 hover:text-vera-primary hover:bg-white/50 rounded-lg transition-all duration-200 font-medium">
                      Create Project
                    </a>
                    <a href="/milestones" className="px-4 py-2 text-slate-600 hover:text-vera-primary hover:bg-white/50 rounded-lg transition-all duration-200 font-medium">
                      Milestones
                    </a>
                    <a href="/disputes" className="px-4 py-2 text-slate-600 hover:text-vera-primary hover:bg-white/50 rounded-lg transition-all duration-200 font-medium">
                      Disputes
                    </a>
                  </nav>

                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white/80 border border-white/40 px-4 py-2 rounded-full shadow-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                      <span>Sepolia</span>
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/20 bg-white/50 backdrop-blur-sm mt-20">
              <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="col-span-2">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-vera-primary to-vera-secondary rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">V</span>
                      </div>
                      <span className="text-lg font-bold text-slate-900">Vera Protocol</span>
                    </div>
                    <p className="text-slate-600 mb-4 max-w-md leading-relaxed">
                      Eliminating freelance fraud with AI-powered neutral arbitration. 
                      Built for HackXios 2k25 to win both Kiro and Ethereum tracks.
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium">
                        <div className="w-2 h-2 bg-vera-success rounded-full shadow-sm"></div>
                        <span>95%+ Auto-Release</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium">
                        <div className="w-2 h-2 bg-vera-accent rounded-full shadow-sm"></div>
                        <span>&lt;24h Disputes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Platform</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li><a href="#" className="hover:text-vera-primary transition-colors">How it Works</a></li>
                      <li><a href="#" className="hover:text-vera-primary transition-colors">Security</a></li>
                      <li><a href="#" className="hover:text-vera-primary transition-colors">Pricing</a></li>
                      <li><a href="#" className="hover:text-vera-primary transition-colors">API Docs</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Community</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li><a href="#" className="hover:text-vera-primary transition-colors">Discord</a></li>
                      <li><a href="#" className="hover:text-vera-primary transition-colors">GitHub</a></li>
                      <li><a href="#" className="hover:text-vera-primary transition-colors">Twitter</a></li>
                      <li><a href="#" className="hover:text-vera-primary transition-colors">Blog</a></li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                  <p className="text-sm text-slate-500">
                    © 2025 Vera Protocol. Built for HackXios 2k25.
                  </p>
                  <div className="flex items-center space-x-6 mt-4 md:mt-0">
                    <span className="text-xs text-slate-400 font-medium">Powered by</span>
                    <div className="flex items-center space-x-4 text-xs text-slate-500 font-semibold">
                      <span>Ethereum</span>
                      <span>•</span>
                      <span>IPFS</span>
                      <span>•</span>
                      <span>Kiro AI</span>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}