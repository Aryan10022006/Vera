import { useState } from 'react';
import { X, MessageCircle, FileText, Clock, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import ChatInterface from './ChatInterface';
import MilestoneManager from './MilestoneManager';
import ProposalSubmission from './ProposalSubmission';

interface Proposal {
  id: string;
  freelancerAddress: string;
  freelancerName?: string;
  coverLetter: string;
  proposedTimeline: number;
  githubProfile?: string;
  portfolio?: string[];
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: number;
}

interface Milestone {
  id: string;
  description: string;
  amount: string;
  status: number;
  deliverables?: string[];
}

interface ProjectDetailViewProps {
  project: {
    id: string;
    client: string;
    freelancer: string;
    totalAmount: bigint;
    status: number;
    metadata?: {
      title: string;
      description: string;
      budget: string;
      skills: string[];
      milestones?: Milestone[];
    };
  };
  onClose: () => void;
}

export default function ProjectDetailView({ project, onClose }: ProjectDetailViewProps) {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'proposals'>('overview');
  const [showChat, setShowChat] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const isClient = project.client.toLowerCase() === address?.toLowerCase();
  const isFreelancer = project.freelancer.toLowerCase() === address?.toLowerCase();
  const hasFreelancer = project.freelancer !== '0x0000000000000000000000000000000000000000';

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleProposalSubmit = (ipfsHash: string) => {
    console.log('Proposal submitted:', ipfsHash);
    // In production, this would update the blockchain
    setShowProposalForm(false);
  };

  const handleAcceptProposal = (proposalId: string) => {
    console.log('Accepting proposal:', proposalId);
    // In production, this would call the smart contract
  };

  const technicalAmount = (Number(project.totalAmount) * 0.8).toString();
  const subjectiveAmount = (Number(project.totalAmount) * 0.2).toString();

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4 overflow-y-auto">
        <div className="card max-w-6xl w-full my-8">
          {/* Header */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {project.metadata?.title || 'Untitled Project'}
                </h2>
                <p className="text-slate-400 mb-4">
                  {project.metadata?.description || 'No description available'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.metadata?.skills?.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-vera-600/10 border border-vera-500/20 rounded-lg text-vera-400 text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-slate-800">
            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="flex items-center text-slate-400 text-sm mb-1">
                <DollarSign className="w-4 h-4 mr-1" />
                Total Budget
              </div>
              <p className="text-2xl font-bold text-white">{formatEther(project.totalAmount)} ETH</p>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="flex items-center text-slate-400 text-sm mb-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                Technical (80%)
              </div>
              <p className="text-2xl font-bold text-green-400">{formatEther(BigInt(technicalAmount))} ETH</p>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="flex items-center text-slate-400 text-sm mb-1">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Subjective (20%)
              </div>
              <p className="text-2xl font-bold text-yellow-400">{formatEther(BigInt(subjectiveAmount))} ETH</p>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="flex items-center text-slate-400 text-sm mb-1">
                <Clock className="w-4 h-4 mr-1" />
                Status
              </div>
              <p className="text-lg font-bold text-white">
                {project.status === 0 ? 'Active' : project.status === 1 ? 'Completed' : 'Disputed'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 px-6 pt-6 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-2 font-medium transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'text-vera-400 border-vera-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`pb-3 px-2 font-medium transition-colors border-b-2 ${
                activeTab === 'milestones'
                  ? 'text-vera-400 border-vera-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              Milestones
            </button>
            {!hasFreelancer && isClient && (
              <button
                onClick={() => setActiveTab('proposals')}
                className={`pb-3 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'proposals'
                    ? 'text-vera-400 border-vera-400'
                    : 'text-slate-400 border-transparent hover:text-slate-300'
                }`}
              >
                Proposals ({proposals.length})
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Project Details</h3>
                  <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                    <div>
                      <p className="text-sm text-slate-400">Client</p>
                      <p className="text-white font-mono">{formatAddress(project.client)}</p>
                    </div>
                    {hasFreelancer && (
                      <div>
                        <p className="text-sm text-slate-400">Freelancer</p>
                        <p className="text-white font-mono">{formatAddress(project.freelancer)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-400">Payment Structure</p>
                      <p className="text-white">80% Technical / 20% Subjective</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Technical payment releases automatically upon AI verification. Subjective payment releases after 72-hour silent consent period.
                      </p>
                    </div>
                  </div>
                </div>

                {!hasFreelancer && !isClient && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-blue-400 font-medium mb-3">Interested in this project?</p>
                    <button
                      onClick={() => setShowProposalForm(true)}
                      className="btn-primary w-full"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Submit Proposal
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'milestones' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-3">Project Milestones</h3>
                {project.metadata?.milestones && project.metadata.milestones.length > 0 ? (
                  project.metadata.milestones.map((milestone, idx) => (
                    <MilestoneManager
                      key={milestone.id}
                      projectId={project.id}
                      milestoneId={milestone.id}
                      milestoneNumber={idx + 1}
                      description={milestone.description}
                      amount={milestone.amount}
                      status={milestone.status}
                      isFreelancer={isFreelancer}
                      isClient={isClient}
                    />
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-8">
                    No milestones defined yet
                  </div>
                )}
              </div>
            )}

            {activeTab === 'proposals' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-3">Freelancer Proposals</h3>
                {proposals.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    No proposals yet
                  </div>
                ) : (
                  proposals.map((proposal) => (
                    <div key={proposal.id} className="bg-slate-900/50 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-white font-medium">{proposal.freelancerName || 'Anonymous'}</p>
                          <p className="text-sm text-slate-400 font-mono">{formatAddress(proposal.freelancerAddress)}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          proposal.status === 'accepted' ? 'bg-green-500/10 text-green-400' :
                          proposal.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                          'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {proposal.status}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-3">{proposal.coverLetter}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                        <span>Timeline: {proposal.proposedTimeline} days</span>
                        {proposal.githubProfile && (
                          <a href={proposal.githubProfile} target="_blank" rel="noopener noreferrer" className="text-vera-400 hover:underline">
                            GitHub Profile
                          </a>
                        )}
                      </div>
                      {proposal.status === 'pending' && isClient && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptProposal(proposal.id)}
                            className="btn-primary flex-1"
                          >
                            Accept Proposal
                          </button>
                          <button className="btn-ghost flex-1">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {hasFreelancer && (isClient || isFreelancer) && (
            <div className="p-6 border-t border-slate-800">
              <button
                onClick={() => setShowChat(true)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Open Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {showChat && (
        <ChatInterface
          projectId={project.id}
          projectTitle={project.metadata?.title || 'Project'}
          otherParty={isClient ? formatAddress(project.freelancer) : formatAddress(project.client)}
          onClose={() => setShowChat(false)}
        />
      )}

      {showProposalForm && (
        <ProposalSubmission
          projectId={project.id}
          projectTitle={project.metadata?.title || 'Project'}
          onClose={() => setShowProposalForm(false)}
          onSubmit={handleProposalSubmit}
        />
      )}
    </>
  );
}
