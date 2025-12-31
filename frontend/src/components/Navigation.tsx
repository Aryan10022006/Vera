import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Code2, LayoutDashboard, Store } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-vera-600 to-vera-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">Vera</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'bg-vera-600/20 text-vera-400 border border-vera-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/marketplace')
                  ? 'bg-vera-600/20 text-vera-400 border border-vera-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Store className="w-4 h-4" />
              Marketplace
            </Link>
            <Link
              to="/dashboard"
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/dashboard')
                  ? 'bg-vera-600/20 text-vera-400 border border-vera-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          {/* Wallet Connect */}
          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2 mt-4">
          <Link
            to="/"
            className={`flex-1 px-4 py-2 rounded-xl text-center font-medium transition-all duration-200 ${
              isActive('/')
                ? 'bg-vera-600/20 text-vera-400 border border-vera-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/marketplace"
            className={`flex-1 px-4 py-2 rounded-xl text-center font-medium transition-all duration-200 ${
              isActive('/marketplace')
                ? 'bg-vera-600/20 text-vera-400 border border-vera-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Marketplace
          </Link>
          <Link
            to="/dashboard"
            className={`flex-1 px-4 py-2 rounded-xl text-center font-medium transition-all duration-200 ${
              isActive('/dashboard')
                ? 'bg-vera-600/20 text-vera-400 border border-vera-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
