import Navigation from '../components/Navigation';
import MarketplaceBrowser from '../components/MarketplaceBrowser';
import { useAuth } from '../contexts/AuthContext';

export default function MarketplacePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <div className="pt-32 px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Project <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-slate-400">
            {user?.role === 'client' 
              ? 'Find talented freelancers for your projects' 
              : user?.role === 'freelancer'
              ? 'Discover and join exciting projects'
              : 'Browse available projects and opportunities'}
          </p>
          {!user && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-sm">
                💡 Sign in to submit proposals and chat with project owners
              </p>
            </div>
          )}
        </div>

        <MarketplaceBrowser />
      </div>
    </div>
  );
}
