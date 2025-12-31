import Navigation from '../components/Navigation';
import MarketplaceBrowser from '../components/MarketplaceBrowser';

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <div className="pt-32 px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Project <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-slate-400">Discover and join exciting projects</p>
        </div>

        <MarketplaceBrowser />
      </div>
    </div>
  );
}
