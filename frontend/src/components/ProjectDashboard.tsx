import { Clock, DollarSign, CheckCircle, AlertCircle, MessageCircle, User, Briefcase } from 'lucide-react';
import { useMyProjects } from '../hooks/useProjects';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

export default function ProjectDashboard() {
  const { address } = useAccount();
  const { myProjects, asClient, asFreelancer } = useMyProjects();

  if (!address) {
    return (
      <div className="card p-12 text-center">
        <p className="text-slate-400 text-lg mb-4">Connect your wallet to view your projects</p>
        <p className="text-slate-500">You need to be connected to see your dashboard</p>
      </div>
    );
  }

  const getStatusFromNumber = (status: number): 'active' | 'pending' | 'completed' | 'disputed' => {
    switch (status) {
      case 0: return 'active';
      case 1: return 'completed';
      case 2: return 'disputed';
      case 3: return 'pending';
      default: return 'pending';
    }
  };

  const getStatusColor = (status: number) => {
    const statusStr = getStatusFromNumber(status);
    switch (statusStr) {
      case 'active': return 'status-active';
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'disputed': return 'status-disputed';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status: number) => {
    const statusStr = getStatusFromNumber(status);
    switch (statusStr) {
      case 'active': return Clock;
      case 'completed': return CheckCircle;
      case 'disputed': return AlertCircle;
      default: return Clock;
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Role Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">As Client</p>
              <p className="text-2xl font-bold text-white">{asClient.length}</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm">Projects you've created</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">As Freelancer</p>
              <p className="text-2xl font-bold text-white">{asFreelancer.length}</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm">Projects you're working on</p>
        </div>
      </div>

      {myProjects.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 text-lg mb-4">No projects yet</p>
          <p className="text-slate-500">Create your first project to get started</p>
        </div>
      ) : (
        myProjects.map((project) => {
          const StatusIcon = getStatusIcon(project.status);
          const isClient = project.client.toLowerCase() === address.toLowerCase();
          const otherParty = isClient ? project.freelancer : project.client;
          const role = isClient ? 'Client' : 'Freelancer';

          return (
            <div key={project.id} className="card p-6 hover:scale-[1.01] transition-transform">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {project.metadata?.title || 'Untitled Project'}
                  </h3>
                  <p className="text-sm text-slate-400 mb-2">
                    {project.metadata?.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500">
                      Your role: <span className="text-vera-400 font-medium">{role}</span>
                    </span>
                    <span className="text-slate-500">
                      {isClient ? 'Freelancer' : 'Client'}: <span className="text-vera-400 font-mono">{formatAddress(otherParty)}</span>
                    </span>
                  </div>
                </div>
                <span className={getStatusColor(project.status)}>
                  <StatusIcon className="w-4 h-4 mr-1 inline" />
                  {getStatusFromNumber(project.status)}
                </span>
              </div>

              {project.metadata?.skills && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.metadata.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-vera-600/10 border border-vera-500/20 rounded-lg text-vera-400 text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <div className="flex items-center text-slate-400 text-sm mb-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Budget
                  </div>
                  <p className="text-2xl font-bold text-white">{formatEther(project.totalAmount)} ETH</p>
                </div>
                
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <div className="flex items-center text-slate-400 text-sm mb-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Milestones
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {Number(project.milestonesCount)}
                  </p>
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4">
                  <div className="flex items-center text-slate-400 text-sm mb-1">
                    <Clock className="w-4 h-4 mr-1" />
                    Created
                  </div>
                  <p className="text-lg font-bold text-white">
                    {new Date(Number(project.createdAt) * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="btn-secondary flex-1 inline-flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
                <button className="btn-ghost">View Details</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
