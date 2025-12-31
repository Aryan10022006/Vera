'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Clock, DollarSign, Users, Code, MessageCircle } from 'lucide-react';
import { ProjectListing, Proposal } from '@/types/marketplace';

interface ProjectMarketplaceProps {
  onProjectSelect?: (project: ProjectListing) => void;
  onChatOpen?: (projectId: string, clientAddress: string) => void;
}

export function ProjectMarketplace({ onProjectSelect, onChatOpen }: ProjectMarketplaceProps) {
  const [projects, setProjects] = useState<ProjectListing[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress'>('open');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch projects from IPFS/backend
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      // TODO: Fetch from backend/IPFS
      const mockProjects: ProjectListing[] = [
        {
          id: 'proj-1',
          status: 'open',
          clientAddress: '0x1234...',
          title: 'E-commerce Platform Development',
          description: 'Build a modern e-commerce platform with React and Node.js',
          budget: {
            total: '2.5',
            technical: '2.0',
            subjective: '0.5'
          },
          requirements: {
            technical: [],
            subjective: []
          },
          timeline: {
            estimated: 30
          },
          skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
          createdAt: Date.now() - 86400000,
          proposals: []
        }
      ];
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = projects;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredProjects(filtered);
  }, [searchQuery, filterStatus, projects]);

  const handleSubmitProposal = (projectId: string) => {
    // Open proposal modal
    console.log('Submit proposal for', projectId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Project Marketplace
        </h2>
        <p className="text-slate-600 text-lg">Browse and bid on projects secured by smart contracts</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by title, description, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-slate-900 placeholder-slate-400"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-6 py-4 rounded-xl font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-6 py-4 rounded-xl font-semibold transition-all ${
              filterStatus === 'open'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-green-300'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-6 py-4 rounded-xl font-semibold transition-all ${
              filterStatus === 'in_progress'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-amber-300'
            }`}
          >
            In Progress
          </button>
        </div>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border-2 border-dashed border-slate-300">
          <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-xl text-slate-600 font-semibold">No projects found</p>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-2xl transition-all duration-300">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    project.status === 'open'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {project.status === 'open' ? 'Open for Proposals' : 'In Progress'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Budget & Timeline */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-slate-900">{project.budget.total} ETH</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{project.timeline.estimated} days</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                  {project.skills.length > 3 && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                      +{project.skills.length - 3} more
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {project.status === 'open' && (
                    <>
                      <button
                        onClick={() => handleSubmitProposal(project.id)}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                      >
                        <Code className="w-4 h-4" />
                        <span>Submit Proposal</span>
                      </button>
                      <button
                        onClick={() => onChatOpen?.(project.id, project.clientAddress)}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                        title="Chat with client"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {project.status !== 'open' && (
                    <button
                      onClick={() => onProjectSelect?.(project)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-semibold transition-all"
                    >
                      View Details
                    </button>
                  )}
                </div>

                {/* Proposals count */}
                {project.proposals.length > 0 && (
                  <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-slate-500">
                    <Users className="w-4 h-4" />
                    <span>{project.proposals.length} proposal{project.proposals.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
