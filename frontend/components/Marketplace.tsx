'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Search, Filter, Clock, DollarSign, User, MessageCircle, Send, Star, MapPin, Calendar, Code, Palette, PenTool, Briefcase, Eye, Heart, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface ProjectListing {
  id: string;
  status: 'open' | 'in_progress' | 'completed' | 'disputed';
  clientAddress: string;
  clientName?: string;
  clientRating?: number;
  title: string;
  description: string;
  budget: {
    total: string;
    currency: 'ETH' | 'USD';
    type: 'fixed' | 'hourly';
  };
  skills: string[];
  timeline: {
    estimated: number; // days
    deadline?: number; // timestamp
    posted: number; // timestamp
  };
  location?: string;
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  proposals: Proposal[];
  views: number;
  saves: number;
  ipfsHash?: string;
  category: 'development' | 'design' | 'writing' | 'marketing' | 'other';
}

interface Proposal {
  id: string;
  freelancerAddress: string;
  freelancerName: string;
  freelancerRating: number;
  coverLetter: string;
  proposedBudget: string;
  proposedTimeline: number;
  portfolio: string[];
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  senderType: 'client' | 'freelancer';
  content: string;
  timestamp: number;
  read: boolean;
}

const CATEGORIES = [
  { id: 'development', name: 'Development', icon: Code, color: 'bg-blue-500' },
  { id: 'design', name: 'Design', icon: Palette, color: 'bg-purple-500' },
  { id: 'writing', name: 'Writing', icon: PenTool, color: 'bg-green-500' },
  { id: 'marketing', name: 'Marketing', icon: Briefcase, color: 'bg-orange-500' },
];

const SKILLS = [
  'React', 'TypeScript', 'Solidity', 'Node.js', 'Python', 'UI/UX Design', 
  'Figma', 'Photoshop', 'Content Writing', 'SEO', 'Social Media', 'Blockchain'
];

export function Marketplace() {
  const { address } = useAccount();
  const [projects, setProjects] = useState<ProjectListing[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectListing[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectListing | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    coverLetter: '',
    proposedBudget: '',
    proposedTimeline: '',
    portfolio: ''
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userType, setUserType] = useState<'client' | 'freelancer' | null>(null);

  // Mock data - in production, this would come from IPFS/blockchain
  useEffect(() => {
    const mockProjects: ProjectListing[] = [
      {
        id: 'proj_1',
        status: 'open',
        clientAddress: '0x1234...5678',
        clientName: 'TechCorp Inc.',
        clientRating: 4.8,
        title: 'Build a DeFi Trading Dashboard',
        description: 'Looking for an experienced React developer to build a comprehensive DeFi trading dashboard with real-time price feeds, portfolio tracking, and advanced charting capabilities. The project requires integration with multiple DEX protocols and wallet connections.',
        budget: { total: '5.0', currency: 'ETH', type: 'fixed' },
        skills: ['React', 'TypeScript', 'Web3', 'DeFi', 'Chart.js'],
        timeline: { estimated: 21, posted: Date.now() - 86400000 },
        location: 'Remote',
        experienceLevel: 'expert',
        proposals: [],
        views: 47,
        saves: 12,
        category: 'development'
      },
      {
        id: 'proj_2',
        status: 'open',
        clientAddress: '0x2345...6789',
        clientName: 'Creative Studio',
        clientRating: 4.6,
        title: 'NFT Collection Art & Branding',
        description: 'Seeking a talented digital artist to create a unique 10,000 piece NFT collection with consistent art style and compelling storyline. Must include character design, trait variations, and complete brand identity.',
        budget: { total: '3.5', currency: 'ETH', type: 'fixed' },
        skills: ['Digital Art', 'NFT Design', 'Photoshop', 'Illustrator', 'Branding'],
        timeline: { estimated: 14, posted: Date.now() - 172800000 },
        location: 'Remote',
        experienceLevel: 'intermediate',
        proposals: [
          {
            id: 'prop_1',
            freelancerAddress: address || '0x3456...7890',
            freelancerName: 'Alex Designer',
            freelancerRating: 4.9,
            coverLetter: 'I have 5+ years of experience in NFT art creation...',
            proposedBudget: '3.2',
            proposedTimeline: 12,
            portfolio: ['https://portfolio1.com', 'https://portfolio2.com'],
            status: 'pending',
            submittedAt: Date.now() - 43200000
          }
        ],
        views: 89,
        saves: 23,
        category: 'design'
      },
      {
        id: 'proj_3',
        status: 'open',
        clientAddress: '0x3456...7890',
        clientName: 'Blockchain Startup',
        clientRating: 4.7,
        title: 'Smart Contract Security Audit',
        description: 'Need a thorough security audit of our DeFi protocol smart contracts. Looking for an experienced auditor with proven track record in finding vulnerabilities and providing detailed reports.',
        budget: { total: '8.0', currency: 'ETH', type: 'fixed' },
        skills: ['Solidity', 'Security Audit', 'DeFi', 'Smart Contracts'],
        timeline: { estimated: 7, posted: Date.now() - 259200000 },
        location: 'Remote',
        experienceLevel: 'expert',
        proposals: [],
        views: 156,
        saves: 34,
        category: 'development'
      }
    ];
    
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, [address]);

  // Filter projects based on search and filters
  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    if (selectedSkills.length > 0) {
      filtered = filtered.filter(project =>
        selectedSkills.some(skill => project.skills.includes(skill))
      );
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedCategory, selectedSkills]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const submitProposal = async () => {
    if (!selectedProject || !address) return;

    const newProposal: Proposal = {
      id: `prop_${Date.now()}`,
      freelancerAddress: address,
      freelancerName: 'Your Name', // Would come from profile
      freelancerRating: 4.5, // Would come from profile
      coverLetter: proposalForm.coverLetter,
      proposedBudget: proposalForm.proposedBudget,
      proposedTimeline: parseInt(proposalForm.proposedTimeline),
      portfolio: proposalForm.portfolio.split(',').map(url => url.trim()),
      status: 'pending',
      submittedAt: Date.now()
    };

    // Update project with new proposal
    setProjects(prev => prev.map(p => 
      p.id === selectedProject.id 
        ? { ...p, proposals: [...p.proposals, newProposal] }
        : p
    ));

    setShowProposalModal(false);
    setProposalForm({ coverLetter: '', proposedBudget: '', proposedTimeline: '', portfolio: '' });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedProject) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: address || '',
      senderType: userType || 'freelancer',
      content: newMessage,
      timestamp: Date.now(),
      read: false
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Project Marketplace
          </h1>
          <p className="text-slate-600">Discover amazing projects and connect with clients worldwide</p>
        </div>
        
        {/* User Type Toggle */}
        <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setUserType('freelancer')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              userType === 'freelancer' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I'm a Freelancer
          </button>
          <button
            onClick={() => setUserType('client')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              userType === 'client' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I'm a Client
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects, skills, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Skills Filter */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Filter by Skills</h3>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map(skill => (
              <button
                key={skill}
                onClick={() => handleSkillToggle(skill)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedSkills.includes(skill)
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600">
          <span className="font-semibold text-slate-900">{filteredProjects.length}</span> projects found
        </p>
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <Filter className="w-4 h-4" />
          <span>Sort by: Most Recent</span>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid gap-6">
        {filteredProjects.map(project => (
          <div key={project.id} className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Project Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${
                      project.status === 'open' ? 'bg-green-500' : 'bg-slate-400'
                    }`}></div>
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      {project.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm text-slate-500">{formatTimeAgo(project.timeline.posted)}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Client Info */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{project.clientName}</div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-400 fill-current" />
                          <span className="text-sm text-slate-500">{project.clientRating}</span>
                        </div>
                      </div>
                    </div>
                    {project.location && (
                      <>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center space-x-1 text-sm text-slate-500">
                          <MapPin className="w-3 h-3" />
                          <span>{project.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Project Stats */}
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600 mb-1">
                    {project.budget.total} {project.budget.currency}
                  </div>
                  <div className="text-sm text-slate-500 mb-4">
                    {project.budget.type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{project.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{project.saves}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-sm text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>{project.timeline.estimated} days</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <span className="font-medium">{project.proposals.length} proposals</span>
                  {project.proposals.length > 0 && (
                    <>
                      <span>•</span>
                      <span>Last proposal {formatTimeAgo(Math.max(...project.proposals.map(p => p.submittedAt)))}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setShowChatModal(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </button>
                  
                  {userType === 'freelancer' && (
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowProposalModal(true);
                      }}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Proposal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Proposal Modal */}
      {showProposalModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Submit Proposal</h2>
              <button
                onClick={() => setShowProposalModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">{selectedProject.title}</h3>
                <p className="text-slate-600 text-sm">{selectedProject.description.substring(0, 200)}...</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cover Letter *
                </label>
                <textarea
                  value={proposalForm.coverLetter}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                  placeholder="Explain why you're the perfect fit for this project..."
                  className="w-full h-32 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Budget (ETH) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={proposalForm.proposedBudget}
                    onChange={(e) => setProposalForm(prev => ({ ...prev, proposedBudget: e.target.value }))}
                    placeholder="3.5"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Timeline (days) *
                  </label>
                  <input
                    type="number"
                    value={proposalForm.proposedTimeline}
                    onChange={(e) => setProposalForm(prev => ({ ...prev, proposedTimeline: e.target.value }))}
                    placeholder="14"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Portfolio Links (comma-separated)
                </label>
                <input
                  type="text"
                  value={proposalForm.portfolio}
                  onChange={(e) => setProposalForm(prev => ({ ...prev, portfolio: e.target.value }))}
                  placeholder="https://portfolio.com, https://github.com/username"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitProposal}
                  disabled={!proposalForm.coverLetter || !proposalForm.proposedBudget || !proposalForm.proposedTimeline}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Submit Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900">{selectedProject.title}</h3>
                <p className="text-sm text-slate-500">Chat with {selectedProject.clientName}</p>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Start a conversation about this project</p>
                </div>
              ) : (
                chatMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === address ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        message.sender === address
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === address ? 'text-indigo-200' : 'text-slate-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-slate-200">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}