import { useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, keccak256, toBytes } from 'viem';
import { VERA_ESCROW_ABI, CONTRACT_ADDRESS } from '../lib/contract';
import { pinJSONToIPFS, ipfsHashToBytes32, ProjectMetadata } from '../lib/ipfs';

interface SimpleProjectCreatorProps {
  onClose?: () => void;
}

export default function SimpleProjectCreator({ onClose }: SimpleProjectCreatorProps) {
  const { address } = useAccount();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [freelancerAddress, setFreelancerAddress] = useState('');
  const [skills, setSkills] = useState('');
  const [milestones, setMilestones] = useState([
    { description: '', amount: '' }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const addMilestone = () => {
    setMilestones([...milestones, { description: '', amount: '' }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: 'description' | 'amount', value: string) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!freelancerAddress || !freelancerAddress.startsWith('0x')) {
      alert('Please enter a valid freelancer address');
      return;
    }

    setIsCreating(true);
    try {
      // Prepare metadata
      const metadata: ProjectMetadata = {
        title,
        description,
        budget,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        milestones: milestones.map(m => ({
          description: m.description,
          amount: m.amount,
          deliverables: []
        })),
        createdAt: Date.now()
      };

      // Pin to IPFS
      const ipfsHash = await pinJSONToIPFS(metadata);
      const ipfsBytes32 = ipfsHashToBytes32(ipfsHash);

      // Generate unique project ID
      const projectId = keccak256(toBytes(`${address}-${Date.now()}`));

      //{isSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400">
            ✅ Project created successfully! Transaction confirmed.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Project Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g., Build a DeFi Dashboard"
            required
            disabled={isCreating || isPending || isConfirming}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field min-h-[120px]"
            placeholder="Describe your project requirements..."
            required
            disabled={isCreating || isPending || isConfirming}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Freelancer Address
          </label>
          <input
            type="text"
            value={freelancerAddress}
            onChange={(e) => setFreelancerAddress(e.target.value)}
            className="input-field font-mono text-sm"
            placeholder="0x..."
            required
            disabled={isCreating || isPending || isConfirming}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Skills Required (comma-separated)
          </label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="input-field"
            placeholder="React, Solidity, Web3.js"
            required
            disabled={isCreating || isPending || isConfirming}
    <div className="card p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Create New Project</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Project Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g., Build a DeFi Dashboard"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field min-h-[120px]"
            placeholder="Describe your project requirements..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Total Budget (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="input-field"
            placeholder="0.1"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-slate-300">
              Milestones
            </label>
            <button
              type="button"
              onClick={addMilestone}
              className="btn-ghost text-sm inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </button>
          </div>
          
            type="submit" 
            className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
            disabled={isCreating || isPending || isConfirming}
          >
            {(isCreating || isPending || isConfirming) && (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            {isConfirming ? 'Confirming...' : isPending ? 'Waiting for approval...' : isCreating ? 'Creating...' : 'Create Project'}
          </button>
          {onClose && (
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary"
              disabled={isCreating || isPending || isConfirming}
            
                  <input
                    type="text"
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    className="input-field mb-2"
                    placeholder="Milestone description"
                    required
                  />
                  <input
                    type="number"
                    step="0.001"
                    value={milestone.amount}
                    onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                    className="input-field"
                    placeholder="Amount (ETH)"
                    required
                  />
                </div>
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="btn-primary flex-1">
            Create Project
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
