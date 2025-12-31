import { useState } from 'react';
import { X, Briefcase, User, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const { loginWithGoogle, setUserRole, user, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to login with Google. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRoleSelection = (role: 'client' | 'freelancer') => {
    setSelectedRole(role);
    setUserRole(role);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // Show role selection if user logged in but hasn't selected role
  if (user && !user.role) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="card max-w-2xl w-full p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Select Your Role</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <p className="text-slate-400 mb-8 text-center">
            How would you like to use Vera Protocol?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Card */}
            <button
              onClick={() => handleRoleSelection('client')}
              className={`relative p-8 rounded-2xl border-2 transition-all ${
                selectedRole === 'client'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
              }`}
            >
              {selectedRole === 'client' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">I'm a Client</h3>
              <p className="text-slate-400 text-sm">
                Post projects, hire freelancers, and manage escrow payments
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Create projects
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Review milestones
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Auto-release payments
                </div>
              </div>
            </button>

            {/* Freelancer Card */}
            <button
              onClick={() => handleRoleSelection('freelancer')}
              className={`relative p-8 rounded-2xl border-2 transition-all ${
                selectedRole === 'freelancer'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
              }`}
            >
              {selectedRole === 'freelancer' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">I'm a Freelancer</h3>
              <p className="text-slate-400 text-sm">
                Browse projects, submit work, and receive guaranteed payments
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  Browse marketplace
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  Submit milestones
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  Instant payouts
                </div>
              </div>
            </button>
          </div>

          {selectedRole && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
              <p className="text-green-400 font-medium">
                ✓ Role selected! Redirecting...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show Google login
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Sign in to Vera</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <p className="text-slate-400 mb-8 text-center">
          Secure, AI-mediated freelance escrow platform
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn || loading}
            className="btn-primary w-full flex items-center justify-center gap-3 py-3"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            By signing in, you agree to Vera's Terms of Service and Privacy Policy.
            Your data is secured with Firebase Authentication.
          </p>
        </div>
      </div>
    </div>
  );
}

