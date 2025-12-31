import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { X, Briefcase, User, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const { login, setUserRole, user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | null>(null);

  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      login(credentialResponse.credential);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
    alert('Failed to login with Google. Please try again.');
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
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_black"
            size="large"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            By signing in, you agree to Vera's Terms of Service and Privacy Policy.
            Your data is secured with end-to-end encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
