import { useState } from 'react';
import { LogOut, User, ChevronDown, Briefcase, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDisconnect } from 'wagmi';

export default function UserMenu() {
  const { user, isAuthenticated, logout, isClient, isFreelancer, address } = useAuth();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated || !user) return null;

  const handleLogout = async () => {
    await logout();
    disconnect();
    setIsOpen(false);
  };

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
      >
        <img
          src={user.picture}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="text-left hidden md:block">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-slate-400">
            {isClient && 'Client'}
            {isClient && isFreelancer && ' / '}
            {isFreelancer && 'Freelancer'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
            {/* User Info */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </div>
              
              {/* Role Badge */}
              <div className="flex gap-2">
                {isClient && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-medium text-blue-400">Client</span>
                  </div>
                )}
                {isFreelancer && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-medium text-purple-400">Freelancer</span>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Info */}
            {address && (
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">Wallet Connected</span>
                </div>
                <p className="text-sm font-mono text-slate-300">{formatAddress(address)}</p>
              </div>
            )}

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
