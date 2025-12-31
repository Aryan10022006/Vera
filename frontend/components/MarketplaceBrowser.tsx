'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Clock, DollarSign, User, Code, TrendingUp, Star, MessageCircle } from 'lucide-react';

export interface MarketplaceProject {
  id: string;
  status: 'open' | 'in_progress' | 'in_review' | 'completed' | 'disputed';
  clientAddress: string;
  title: string;
  description: string;
  budget: {
    total: string;
    technical: string;
    subjective: string;
  };
  requirements: {
    technical: { id: string; description: string }[];
    subjective: { id: string; description: string }[];
  };
  timeline: {
    estimated: number;
    deadline?: number;
  };
  skills: string[];
  ipfsHash?: string;
  createdAt: number;
  proposals: any[];
  selectedFreelancer?: string;
}

export interface MarketplaceBrowserProps {
  onProjectSelect?: (project: MarketplaceProject) => void;
  onStartChat?: (projectId: string, clientAddress: string) => void;
}

export function MarketplaceBrowser({ onProjectSelect, onStartChat }: MarketplaceBrowserProps) {
  const [projects, setProjects] = useState<MarketplaceProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<MarketplaceProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 100]);

  useEffect(() => {
    // TODO: Fetch projects from IPFS/blockchain
    // For now, using mock data
    const mockProjects: MarketplaceProject[] = [
      {
        id: 'proj_1',
        status: 'open',
        clientAddress: '0x1234...5678',
        title: 'Build DeFi Dashboard with Real-time Price Feeds',
        description: 'Need an experienced React developer to build a comprehensive DeFi dashboard with live cryptocurrency price feeds, wallet integration, and trading analytics.',
        budget: {
          total: '5.0',
          technical: '4.0',
          subjective: '1.0'
        },
        requirements: {
          technical: [
            { id: 'tech_1', description: 'React 18+ with TypeScript' },
            { id: 'tech_2', description: 'Web3 wallet integration (MetaMask, WalletConnect)' },
            { id: 'tech_3', description: 'Real-time WebSocket price feeds' }
          ],
          subjective: [
            { id: 'subj_1', description: 'Clean, modern UI design' }
          ]
        },
        timeline: {
          estimated: 14
        },
        skills: ['React', 'TypeScript', 'Web3', 'WebSocket'],
        createdAt: Date.now() - 86400000,
        proposals: []
      },
      {
        id: 'proj_2',
        status: 'open',
        clientAddress: '0x9876...4321',
        title: 'Smart Contract Audit for NFT Marketplace',
        description: 'Looking for a Solidity expert to audit our NFT marketplace smart contracts. Must identify security vulnerabilities and suggest improvements.',
        budget: {
          total: '8.0',
          technical: '6.4',
          subjective: '1.6'
        },
        requirements: {
          technical: [
            { id: 'tech_1', description: 'Solidity security audit' },
            { id: 'tech_2', description: 'Gas optimization recommendations' },
            { id: 'tech_3', description: 'Comprehensive audit report' }
          ],
          subjective: [
            { id: 'subj_1', description: 'Clear documentation of findings' }
          ]
        },
        timeline: {
          estimated: 7
        },
        skills: ['Solidity', 'Smart Contracts', 'Security', 'Auditing'],
        createdAt: Date.now() - 172800000,
        proposals: []
      }
    ];

    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(p =>
        selectedSkills.every(skill => p.skills.includes(skill))
      );
    }

    setFilteredProjects(filtered);
  }, [searchQuery, selectedSkills, projects]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Browse Open Projects
        </h2>
        <p className="text-xl text-slate-600">
          Find projects matching your skills and start earning
        </p>
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
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-xl font-semibold transition-all duration-200 shadow-lg border border-slate-300 flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{project.clientAddress.substring(0, 6)}...{project.clientAddress.substring(38)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(project.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {project.status}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 mb-4 line-clamp-3">
                {project.description}
              </p>

              {/* Budget and Timeline */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-slate-500 font-semibold">Budget</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">{project.budget.total} ETH</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-slate-500 font-semibold">Timeline</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">{project.timeline.estimated} days</div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Requirements Summary */}
              <div className="mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Code className="w-4 h-4" />
                    <span>{project.requirements.technical.length} technical requirements</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Star className="w-4 h-4" />
                    <span>{project.proposals.length} proposals</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => onProjectSelect?.(project)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  View Details
                </button>
                <button
                  onClick={() => onStartChat?.(project.id, project.clientAddress)}
                  className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-semibold rounded-xl transition-all duration-200 shadow-lg border border-slate-300 flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No projects found</h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
