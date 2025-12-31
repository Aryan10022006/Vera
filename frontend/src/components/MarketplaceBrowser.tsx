import { useState } from 'react';
import { Search, Clock, DollarSign, Code, Loader2, LogIn } from 'lucide-react';
import { useMarketplaceProjects } from '../hooks/useProjects';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProjectDetailView from './ProjectDetailView';

export default function MarketplaceBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const { address } = useAccount();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const projects = useMarketplaceProjects();

  const filteredProjects = projects.filter(project =>
    (project.metadata?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.metadata?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.metadata?.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: bigint) => {
    const now = Date.now();
    const created = Number(timestamp) * 1000;
    const diff = now - created;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-14"
          placeholder="Search projects by title, description, or skills..."
        />
      </div>

      {/* Project Listings */}
      <div className="grid gap-6">
        {projects.length === 0 ? (
          <div className="card p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-vera-500 animate-spin" />
            <p className="text-slate-400 text-lg">Loading projects...</p>
            <p className="text-slate-500 mt-2">Fetching projects from the blockchain</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-slate-400 text-lg">No projects found</p>
            <p className="text-slate-500 mt-2">Try adjusting your search</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} className="card p-6 hover:scale-[1.01] transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {project.metadata?.title || 'Untitled Project'}
                  </h3>
                  <p className="text-slate-400 leading-relaxed mb-4">
                    {project.metadata?.description || 'No description available'}
                  </p>
                </div>
              </div>

              {project.metadata?.skills && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.metadata.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-vera-600/10 border border-vera-500/20 rounded-lg text-vera-400 text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-vera-600 to-vera-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Budget</p>
                    <p className="text-white font-bold">{formatEther(project.totalAmount)} ETH</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Posted</p>
                    <p className="text-white font-bold">{formatTimeAgo(project.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl flex items-center justify-center">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Client</p>
                    <p className="text-white font-bold font-mono text-sm">{formatAddress(project.client)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                {!isAuthenticated ? (
                  <button 
                    onClick={handleApply}
                    className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In to Apply
                  </button>
                ) : address && project.client.toLowerCase() === address.toLowerCase() ? (
                  <button className="btn-secondary flex-1" disabled>
                    Your Project
                  </button>
                ) : (
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="btn-primary flex-1"
                  >
                    Apply Now
                  </button>
                )}
                <button 
                  onClick={() => setSelectedProject(project)}
                  className="btn-ghost"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProject && (
        <ProjectDetailView
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
