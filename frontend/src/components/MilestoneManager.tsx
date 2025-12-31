import { useState } from 'react';
import { Upload, Loader2, AlertTriangle, Check } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VERA_ESCROW_ABI, CONTRACT_ADDRESS } from '../lib/contract';
import { pinJSONToIPFS } from '../lib/ipfs';

interface MilestoneManagerProps {
  projectId: string;
  milestoneId: string;
  milestoneNumber: number;
  description: string;
  amount: string;
  status: number;
  isFreelancer: boolean;
  isClient: boolean;
}

export default function MilestoneManager({
  projectId,
  milestoneId,
  milestoneNumber,
  description,
  amount,
  status,
  isFreelancer,
  isClient
}: MilestoneManagerProps) {
  const [githubUrl, setGithubUrl] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSubmitMilestone = async () => {
    if (!githubUrl || !deliverables) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Upload submission details to IPFS
      const metadata = {
        projectId,
        milestoneId,
        githubUrl,
        deliverables: deliverables.split('\n').filter(Boolean),
        submittedAt: Date.now()
      };

      const ipfsHash = await pinJSONToIPFS(metadata);
      console.log('Submission uploaded to IPFS:', ipfsHash);

      // Call smart contract submitMilestone function
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VERA_ESCROW_ABI,
        functionName: 'submitMilestone',
        args: [milestoneId as `0x${string}`]
      });
    } catch (error) {
      console.error('Error submitting milestone:', error);
      alert('Failed to submit milestone');
    }
  };

  const handleRaiseDispute = async () => {
    if (!disputeReason) {
      alert('Please provide a reason for the dispute');
      return;
    }

    try {
      // Upload dispute details to IPFS
      const disputeData = {
        projectId,
        milestoneId,
        reason: disputeReason,
        raisedBy: isClient ? 'client' : 'freelancer',
        timestamp: Date.now()
      };

      const ipfsHash = await pinJSONToIPFS(disputeData);
      console.log('Dispute uploaded to IPFS:', ipfsHash);

      // Call smart contract raiseDispute function (if implemented)
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VERA_ESCROW_ABI,
        functionName: 'raiseDispute',
        args: [milestoneId as `0x${string}`, disputeReason]
      });
    } catch (error) {
      console.error('Error raising dispute:', error);
      alert('Failed to raise dispute');
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Submitted';
      case 2: return 'Technical Released';
      case 3: return 'Fully Released';
      case 4: return 'Disputed';
      default: return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 0: return 'bg-slate-500';
      case 1: return 'bg-blue-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-green-500';
      case 4: return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
        <Check className="w-5 h-5 text-green-400" />
        <div>
          <p className="text-green-400 font-medium">Transaction successful!</p>
          <p className="text-sm text-green-400/80">Your action has been recorded on the blockchain</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 space-y-4">
      {/* Milestone Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-white font-semibold">Milestone {milestoneNumber}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()} text-white`}>
              {getStatusText()}
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-2">{description}</p>
          <p className="text-slate-300 font-medium">{amount} ETH</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isFreelancer && status === 0 && (
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="btn-primary text-sm"
          >
            <Upload className="w-4 h-4" />
            Submit Work
          </button>
        )}

        {isClient && status === 1 && (
          <button
            onClick={() => setShowDisputeForm(!showDisputeForm)}
            className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Raise Dispute
          </button>
        )}
      </div>

      {/* Submit Form */}
      {showSubmitForm && isFreelancer && (
        <div className="space-y-3 pt-3 border-t border-slate-700">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              GitHub Repository URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="input-field"
              placeholder="https://github.com/username/repo"
              disabled={isPending || isConfirming}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Deliverables (one per line)
            </label>
            <textarea
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="- Feature implementation&#10;- Unit tests&#10;- Documentation"
              disabled={isPending || isConfirming}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmitMilestone}
              disabled={isPending || isConfirming}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isPending ? 'Confirm in wallet...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Submit Milestone
                </>
              )}
            </button>
            <button
              onClick={() => setShowSubmitForm(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              disabled={isPending || isConfirming}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Dispute Form */}
      {showDisputeForm && isClient && (
        <div className="space-y-3 pt-3 border-t border-slate-700">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Dispute Reason
            </label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="Explain what doesn't meet the requirements..."
              disabled={isPending || isConfirming}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRaiseDispute}
              disabled={isPending || isConfirming}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex-1 flex items-center justify-center gap-2"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Submit Dispute
                </>
              )}
            </button>
            <button
              onClick={() => setShowDisputeForm(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              disabled={isPending || isConfirming}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Silent Consent Timer (for submitted milestones) */}
      {status === 1 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium text-sm">Silent Consent Active</p>
              <p className="text-yellow-400/80 text-xs mt-1">
                72-hour review period. Funds will auto-release if no dispute is raised.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
