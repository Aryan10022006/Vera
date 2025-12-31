import Navigation from '../components/Navigation';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import SimpleProjectCreator from '../components/SimpleProjectCreator';
import ProjectDashboard from '../components/ProjectDashboard';

export default function DashboardPage() {
  const [showCreator, setShowCreator] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <div className="pt-32 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              My <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-slate-400">Manage your projects and milestones</p>
          </div>
          <button
            onClick={() => setShowCreator(!showCreator)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {showCreator && (
          <div className="mb-8">
            <SimpleProjectCreator onClose={() => setShowCreator(false)} />
          </div>
        )}

        <ProjectDashboard />
      </div>
    </div>
  );
}
