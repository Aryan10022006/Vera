import { useAccount, useReadContract, useWatchContractEvent, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VERA_ESCROW_ABI, CONTRACT_ADDRESS, isContractConfigured } from '../lib/contract';
import { useState, useEffect } from 'react';
import { getFromIPFS, bytes32ToIPFSHash } from '../lib/ipfs';
import { parseEther } from 'viem';

export interface Project {
  id: string;
  client: string;
  freelancer: string;
  totalAmount: bigint;
  ipfsHash: string;
  status: number;
  createdAt: bigint;
  milestonesCount: bigint;
  metadata?: {
    title: string;
    description: string;
    budget: string;
    skills: string[];
  };
}

export function useProjects() {
  const { address } = useAccount();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Watch for new project creation events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: VERA_ESCROW_ABI,
    eventName: 'ProjectCreated',
    enabled: isContractConfigured(),
    onLogs(logs) {
      logs.forEach(async (log) => {
        const { projectId, client, freelancer, totalAmount, ipfsHash } = log.args;
        
        try {
          const ipfsHashStr = bytes32ToIPFSHash(ipfsHash as string);
          const metadata = await getFromIPFS(ipfsHashStr);
          
          setProjects(prev => {
            // Check if project already exists
            const exists = prev.some(p => p.id === projectId);
            if (exists) return prev;
            
            return [...prev, {
              id: projectId as string,
              client: client as string,
              freelancer: freelancer as string,
              totalAmount: totalAmount as bigint,
              ipfsHash: ipfsHash as string,
              status: 0,
              createdAt: BigInt(Date.now()),
              milestonesCount: BigInt(0),
              metadata: {
                title: metadata.title,
                description: metadata.description,
                budget: metadata.budget,
                skills: metadata.skills
              }
            }];
          });
        } catch (error) {
          console.error('Error fetching project metadata:', error);
        }
      });
    },
  });

  useEffect(() => {
    // If contract not configured, show empty state
    if (!isContractConfigured()) {
      setLoading(false);
      return;
    }
    
    // TODO: Fetch existing projects from contract
    // For now, just rely on event watching
    setLoading(false);
  }, []);

  return { projects, loading, isClient: !!address, isFreelancer: !!address };
}

export function useMyProjects() {
  const { address } = useAccount();
  const { projects } = useProjects();
  
  const myProjects = projects.filter(p => 
    p.client.toLowerCase() === address?.toLowerCase() ||
    p.freelancer.toLowerCase() === address?.toLowerCase()
  );

  const asClient = myProjects.filter(p => p.client.toLowerCase() === address?.toLowerCase());
  const asFreelancer = myProjects.filter(p => p.freelancer.toLowerCase() === address?.toLowerCase());

  return { myProjects, asClient, asFreelancer };
}

export function useMarketplaceProjects() {
  const { projects } = useProjects();
  
  // Filter for open projects without freelancers assigned
  return projects.filter(p => p.status === 0);
}

// Hook for creating projects
export function useCreateProject() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createProject = async (
    projectId: string,
    freelancer: string,
    ipfsHash: string,
    amount: string
  ) => {
    if (!isContractConfigured()) {
      throw new Error('Contract not configured. Please deploy contracts first.');
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: VERA_ESCROW_ABI,
      functionName: 'createProject',
      args: [projectId as `0x${string}`, freelancer as `0x${string}`, ipfsHash as `0x${string}`],
      value: parseEther(amount),
    });
  };

  return {
    createProject,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
