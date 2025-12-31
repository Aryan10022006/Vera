'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Clock, DollarSign, Tag, TrendingUp, Users } from 'lucide-react';
import { ProjectListing, MarketplaceFilters } from '@/types/marketplace';
import { useAccount } from 'wagmi';

export function MarketplaceBrowse() {
  const { address } = useAccount();
  const [projects, setProjects] = useState<ProjectListing[]>([]);
  const [filters, setFilters] = useState<MarketplaceFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectListing | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    // In production, fetch from blockchain + IPFS
    const mockProjects: ProjectListing[] = [
      {
        id: '1',
        status: 'open',
        clientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        title: 'Build DeFi Dashboard with Real-time Analytics',
        description: 'Need a React dashboard that displays real-time DeFi metrics from multiple protocols. Must integrate with TheGraph and display TVL, APY, and liquidity data.',
        budget: {
          total: '5.0',
          technical: '4.0',
          subjective: '1.0'
        },
        requirements: {
          technical: [
            { id: 't1', description: 'React + TypeScript frontend', acceptanceCriteria: ['Clean TypeScript', 'Component tests'], weight: 30 },
            { id: 't2', description: 'TheGraph integration', acceptanceCriteria: ['Multiple protocols', 'Real-time updates'], weight: 40 },
            { id: 't3', description: 'Responsive design', acceptanceCriteria: ['Mobile friendly', 'Dark mode'], weight: 30 }
          ],
          subjective: [
            { id: 's1', description: 'Professional UI/UX', weight: 100 }
          ]
        },
        timeline: {
          estimated: 14
        },
        skills: ['React', 'TypeScript', 'Web3', 'TheGraph'],
        createdAt: Date.now() - 86400000,
        proposals: []
      },
      {
        id: '2',
        status: 'open',
        clientAddress: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        title: 'Smart Contract Audit for NFT Marketplace',
        description: 'Need security audit for custom NFT marketplace contracts. Focus on reentrancy, access control, and gas optimization.',
        budget: {
          total: '8.0',
          technical: '6.4',
          subjective: '1.6'
        },
        requirements: {
          technical: [
            { id: 't1', description: 'Complete security audit report', acceptanceCriteria: ['All vulnerabilities documented', 'Severity ratings'], weight: 60 },
            { id: 't2', description: 'Gas optimization recommendations', acceptanceCriteria: ['Before/after comparisons', 'Implementation guide'], weight: 40 }
          ],
          subjective: [
            { id: 's1', description: 'Report clarity and professionalism', weight: 100 }
          ]
        },
        timeline: {
          estimated: 7
        },
        skills: ['Solidity', 'Security', 'Auditing', 'Gas Optimization'],
        createdAt: Date.now() - 43200000,
        proposals: []
      }
    ];
    setProjects(mockProjects);
  }, []);

  const filteredProjects = projects.filter(project => {
    if (searchTerm && !project.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !project.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.status && project.status !== filters.status) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Browse Projects
          </h2>
          <p className="text-slate-600">Find your next opportunity in the decentralized freelance marketplace</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
            <div className="flex items-center space-x-2 text-green-700">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold text-sm">{projects.filter(p => p.status === 'open').length} Open Projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-xl border border-slate-300 font-semibold transition-all">
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Project Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Users className="w-3 h-3" />
                    <span>{project.clientAddress.substring(0, 6)}...{project.clientAddress.substring(38)}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{Math.floor((Date.now() - project.createdAt) / 86400000)}d ago</span>
                  </div>
                </div>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                  Open
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                {project.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.skills.slice(0, 4).map((skill) => (
                  <div key={skill} className="flex items-center space-x-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-semibold border border-indigo-100">
                    <Tag className="w-3 h-3" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>

              {/* Budget and Timeline */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Budget</div>
                    <div className="font-bold text-slate-900">{project.budget.total} ETH</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Timeline</div>
                    <div className="font-bold text-slate-900">{project.timeline.estimated} days</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                View & Submit Proposal
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-slate-600 text-lg">No projects found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
