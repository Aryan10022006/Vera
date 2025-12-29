'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VERA_CONTRACT_ADDRESS, VERA_CONTRACT_ABI } from '@/lib/wagmi';
import { getAgreementFromIPFS, Agreement } from '@/lib/ipfs';
import { Clock, CheckCircle, AlertCircle, ExternalLink, Github } from 'lucide-react';
import { formatEther, keccak256, toUtf8Bytes } from 'viem';

interface Project {
  id: string;
  client: string;
  freelancer: string;
  totalAmount: bigint;
  ipfsHash: string;
  status: number;
  createdAt: bigint;
  milestonesCount: bigint;
}

interface Milestone {
  id: string;
  projectId: string;
  technicalAmount: bigint;
  subjectiveAmount: bigint;
  status: number;
  submittedAt: bigint;
  silentConsentDeadline: bigint;
  technicalReleased: boolean;
  subjectiveReleased: boolean;
}

const PROJECT_STATUS = {
  0: 'Active',
  1: 'Completed', 
  2: 'Disputed',
  3: 'Cancelled'
};

const MILESTONE_STATUS = {
  0: 'Pending',
  1: 'Submitted',
  2: 'Technical Released',
  3: 'Fully Released',
  4: 'Disputed'
};

export function ProjectDashboard() {
  const { address } = useAccount();
  const [projects, setProjects] = useState<Project[]>([]);
  const [agreements, setAgreements] = useState<Record<string, Agreement>>({});
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>({});

  // Mock project data - in production, this would come from contract events or subgraph
  useEffect(() => {
    if (address) {
      // Mock projects for demonstration
      const mockProjects: Project[] = [
        {
          id: 'project_1',
          client: address,
          freelancer: '0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e4c2',
          totalAmount: BigInt('1000000000000000000'), // 1 ETH
          ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
          status: 0,
          createdAt: BigInt(Date.now() - 86400000), // 1 day ago
          milestonesCount: BigInt(2)
        }
      ];
      setProjects(mockProjects);

      // Load agreements from IPFS
      mockProjects.forEach(async (project) => {
        try {
          const agreement = await getAgreementFromIPFS(project.ipfsHash);
          setAgreements(prev => ({ ...prev, [project.id]: agreement }));
        } catch (error) {
          console.error('Failed to load agreement:', error);
        }
      });
    }
  }, [address]);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createProject = async (agreement: Agreement, ipfsHash: string) => {
    if (!address) return;

    const projectIdHash = keccak256(toUtf8Bytes(agreement.projectId));
    const ipfsHashBytes = keccak256(toUtf8Bytes(ipfsHash));

    writeContract({
      address: VERA_CONTRACT_ADDRESS,
      abi: VERA_CONTRACT_ABI,
      functionName: 'createProject',
      args: [projectIdHash, agreement.parties.freelancer as `0x${string}`, ipfsHashBytes],
      value: BigInt(agreement.payment.total)
    });
  };

  const submitMilestone = (milestoneId: string) => {
    const milestoneIdHash = keccak256(toUtf8Bytes(milestoneId));
    
    writeContract({
      address: VERA_CONTRACT_ADDRESS,
      abi: VERA_CONTRACT_ABI,
      functionName: 'submitMilestone',
      args: [milestoneIdHash]
    });
  };

  const releaseSilentConsent = (milestoneId: string) => {
    const milestoneIdHash = keccak256(toUtf8Bytes(milestoneId));
    
    writeContract({
      address: VERA_CONTRACT_ADDRESS,
      abi: VERA_CONTRACT_ABI,
      functionName: 'releaseSilentConsent',
      args: [milestoneIdHash]
    });
  };

  if (!address) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-600">Connect your wallet to view your projects</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-600 mb-4">No projects found</p>
        <p className="text-sm text-slate-500">Create your first project using the voice recorder above</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Projects Grid */}
      <div className="grid gap-6">
        {projects.map((project) => {
          const agreement = agreements[project.id];
          const isClient = project.client.toLowerCase() === address.toLowerCase();
          const isFreelancer = project.freelancer.toLowerCase() === address.toLowerCase();

          return (
            <div key={project.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {agreement?.title || 'Loading...'}
                  </h3>
                  <p className="text-sm text-slate-600 mb-2">
                    {agreement?.description || 'Loading project details...'}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>ID: {project.id}</span>
                    <span>•</span>
                    <span>Created: {new Date(Number(project.createdAt)).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-vera-primary mb-1">
                    {formatEther(project.totalAmount)} ETH
                  </div>
                  <span className={`status-${PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS].toLowerCase()}`}>
                    {PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS]}
                  </span>
                </div>
              </div>

              {/* Project Participants */}
              <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-slate-500">Client:</span>
                  <div className="font-mono text-xs mt-1">
                    {project.client.substring(0, 20)}...
                    {isClient && <span className="ml-2 text-vera-primary">(You)</span>}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Freelancer:</span>
                  <div className="font-mono text-xs mt-1">
                    {project.freelancer.substring(0, 20)}...
                    {isFreelancer && <span className="ml-2 text-vera-accent">(You)</span>}
                  </div>
                </div>
              </div>

              {/* Milestones */}
              {agreement && (
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-700">Milestones</h4>
                  {agreement.payment.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Milestone {index + 1}</span>
                        <span className="text-sm text-slate-600">
                          {formatEther(BigInt(milestone.amount))} ETH
                        </span>
                      </div>
                      
                      {/* 80/20 Split Visualization */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span>Technical (80%)</span>
                          <span className="text-vera-success">
                            {formatEther(BigInt(milestone.amount) * BigInt(80) / BigInt(100))} ETH
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-vera-success h-2 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span>Subjective (20%)</span>
                          <span className="text-vera-warning">
                            {formatEther(BigInt(milestone.amount) * BigInt(20) / BigInt(100))} ETH
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className="bg-vera-warning h-2 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>

                      {/* Milestone Actions */}
                      <div className="flex space-x-2">
                        {isFreelancer && (
                          <button
                            onClick={() => submitMilestone(milestone.id)}
                            disabled={isPending || isConfirming}
                            className="btn-primary text-xs px-3 py-1 disabled:opacity-50"
                          >
                            {isPending || isConfirming ? 'Submitting...' : 'Submit Work'}
                          </button>
                        )}
                        
                        <a
                          href={`https://github.com/freelancer/repo`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-xs px-3 py-1 flex items-center space-x-1"
                        >
                          <Github className="w-3 h-3" />
                          <span>View Code</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* IPFS Link */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${project.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-vera-primary hover:text-vera-primary/80 flex items-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View Agreement on IPFS</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Silent Consent Timer (for demonstration) */}
      <div className="card p-6 bg-vera-accent/5 border-vera-accent/20">
        <h3 className="font-semibold text-vera-accent mb-2">Silent Consent Protocol</h3>
        <p className="text-sm text-slate-600 mb-3">
          When a milestone is submitted and passes AI verification, clients have 72 hours to review. 
          If no objection is raised, the remaining 20% is automatically released.
        </p>
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-vera-accent" />
          <span>Next auto-release in: 47h 23m</span>
        </div>
      </div>
    </div>
  );
}