import Navigation from '../components/Navigation';
import { Plus, Wallet, UserCircle, Briefcase, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import SimpleProjectCreator from '../components/SimpleProjectCreator';
import ProjectDashboard from '../components/ProjectDashboard';
import { useAuth } from '../contexts/AuthContext';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function DashboardPage() {
  const [showCreator, setShowCreator] = useState(false);
  const { isAuthenticated, user, setUserRole, loginWithGoogle, isClient, isFreelancer } = useAuth();
  const { isConnected } = useAccount();

  // Onboarding Step 1: Connect Wallet
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <div className="pt-32 px-6 max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-vera-600 to-vera-500 rounded-2xl flex items-center justify-center">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <div className="mb-2 text-sm font-medium text-vera-400">Step 1 of 3</div>
            <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Connect your Ethereum wallet to securely manage escrow payments and project agreements.
            </p>
            <div className="flex justify-center mb-6">
              <ConnectButton />
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-vera-500 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding Step 2: Sign in with Google
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <div className="pt-32 px-6 max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <UserCircle className="w-10 h-10 text-white" />
            </div>
            <div className="mb-2 text-sm font-medium text-blue-400">Step 2 of 3</div>
            <h2 className="text-3xl font-bold text-white mb-4">Sign In to Continue</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Sign in with Google to create your Vera Protocol profile and access the dashboard.
            </p>
            <button
              onClick={loginWithGoogle}
              className="btn-primary inline-flex items-center gap-2 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-vera-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding Step 3: Choose Role
  if (!user.role) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <div className="pt-32 px-6 max-w-5xl mx-auto">
          <div className="glass-card p-12">
            <div className="text-center mb-10">
              <div className="mb-2 text-sm font-medium text-purple-400">Step 3 of 3</div>
              <h2 className="text-3xl font-bold text-white mb-4">Choose Your Role</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Select how you want to use Vera Protocol. You can change this later in settings.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Client Role */}
              <button
                onClick={() => setUserRole('client')}
                className="group relative p-8 bg-slate-800/50 hover:bg-slate-800 border-2 border-slate-700 hover:border-vera-500 rounded-2xl transition-all duration-300 text-left"
              >
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-vera-600 to-vera-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <div className="w-16 h-16 mb-6 bg-gradient-to-br from-vera-600 to-vera-500 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">I'm a Client</h3>
                <p className="text-slate-400 mb-4">
                  Post projects, hire freelancers, and manage escrow payments securely.
                </p>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-vera-500 rounded-full"></div>
                    Create project listings
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-vera-500 rounded-full"></div>
                    Review proposals from freelancers
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-vera-500 rounded-full"></div>
                    Approve milestones and release payments
                  </li>
                </ul>
              </button>

              {/* Freelancer Role */}
              <button
                onClick={() => setUserRole('freelancer')}
                className="group relative p-8 bg-slate-800/50 hover:bg-slate-800 border-2 border-slate-700 hover:border-blue-500 rounded-2xl transition-all duration-300 text-left"
              >
                <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <div className="w-16 h-16 mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">I'm a Freelancer</h3>
                <p className="text-slate-400 mb-4">
                  Browse projects, submit proposals, and get paid securely for your work.
                </p>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Browse marketplace projects
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Submit proposals to clients
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Submit milestones and get paid
                  </li>
                </ul>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-vera-500 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fully authenticated - Show dashboard
  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <div className="pt-32 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {isClient ? 'Client' : 'Freelancer'} <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-slate-400">
              {isClient 
                ? 'Manage your projects and review proposals' 
                : 'Track your projects and submit milestones'}
            </p>
          </div>
          {isClient && (
            <button
              onClick={() => setShowCreator(!showCreator)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
          )}
        </div>

        {showCreator && isClient && (
          <div className="mb-8">
            <SimpleProjectCreator onClose={() => setShowCreator(false)} />
          </div>
        )}

        <ProjectDashboard />
      </div>
    </div>
  );
}
