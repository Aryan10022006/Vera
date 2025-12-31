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

      const ipfsHash = await pinJSONToIPFS(metadata);
      const ipfsBytes32 = ipfsHashToBytes32(ipfsHash);
      const projectId = keccak256(toBytes(`${address}-${Date.now()}`));

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VERA_ESCROW_ABI,
        functionName: 'createProject',
        args: [projectId, freelancerAddress as `0x${string}`, ipfsBytes32 as `0x${string}`],
        value: parseEther(budget)
      });
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
      setIsCreating(false);
    }
  };

  if (isSuccess && !isConfirming) {
    setTimeout(() => {
      onClose?.();
      setIsCreating(false);
    }, 2000);
  }

  return (
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
        {isSuccess && (
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
            disabled={isCreating || isPending || isConfirming}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-300">
              Milestones
            </label>
            <button
              type="button"
              onClick={addMilestone}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
              disabled={isCreating || isPending || isConfirming}
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </button>
          </div>

          {milestones.map((milestone, index) => (
            <div key={index} className="bg-slate-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">
                  Milestone {index + 1}
                </span>
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="p-1 hover:bg-slate-700 rounded"
                    disabled={isCreating || isPending || isConfirming}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={milestone.description}
                onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                className="input-field"
                placeholder="Milestone description"
                required
                disabled={isCreating || isPending || isConfirming}
              />
              <input
                type="number"
                step="0.001"
                value={milestone.amount}
                onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                className="input-field"
                placeholder="Amount in ETH"
                required
                disabled={isCreating || isPending || isConfirming}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
              disabled={isCreating || isPending || isConfirming}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex-1 btn-primary flex items-center justify-center gap-2"
            disabled={isCreating || isPending || isConfirming}
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isPending ? 'Confirm in wallet...' : 'Creating on blockchain...'}
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
