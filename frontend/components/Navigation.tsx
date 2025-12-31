'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
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
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <a href="#marketplace" className="px-4 py-2 text-slate-600 hover:text-vera-primary hover:bg-white/50 rounded-lg transition-all duration-200 font-medium">
              Marketplace
            </a>
            <a href="#create" className="px-4 py-2 text-slate-600 hover:text-vera-primary hover:bg-white/50 rounded-lg transition-all duration-200 font-medium">
              Create Project
            </a>
            <a href="#dashboard" className="px-4 py-2 text-slate-600 hover:text-vera-primary hover:bg-white/50 rounded-lg transition-all duration-200 font-medium">
              Dashboard
            </a>
            <a href="#how-it-works" className="px-4 py-2 text-slate-600 hover:text-vera-primary hover:bg-white/50 rounded-lg transition-all duration-200 font-medium">
              How It Works
            </a>
          </nav>

          {/* Wallet Connection & Mobile Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white/80 border border-white/40 px-4 py-2 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
              <span>Sepolia</span>
            </div>
            <div className="hidden md:block">
              <ConnectButton 
                showBalance={false}
                chainStatus="icon"
              />
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-vera-primary transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-slate-200 mt-4 space-y-2">
            <a href="#marketplace" className="block px-4 py-2 text-slate-600 hover:text-vera-primary hover:bg-white/50 rounded-lg transition-all duration-200 font-medium">
              Marketplace
            </a>
            <a href="#create" className="block px-4 py-2 text-slate-600 hover:text-vera-primary hover:bg-white/50 rounded-lg transition-all duration-200 font-medium">
              Create Project
            </a>
            <a href="#dashboard" className="block px-4 py-2 text-slate-600 hover:text-vera-primary hover:bg-white/50 rounded-lg transition-all duration-200 font-medium">
              Dashboard
            </a>
            <a href="#how-it-works" className="block px-4 py-2 text-slate-600 hover:text-vera-primary hover:bg-white/50 rounded-lg transition-all duration-200 font-medium">
              How It Works
            </a>
            <div className="pt-2">
              <ConnectButton showBalance={false} chainStatus="icon" />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
