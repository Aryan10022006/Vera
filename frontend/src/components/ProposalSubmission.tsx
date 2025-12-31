import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { pinJSONToIPFS } from '../lib/ipfs';

interface ProposalSubmissionProps {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
  onSubmit: (proposalHash: string) => void;
}

export default function ProposalSubmission({ projectId, projectTitle, onClose, onSubmit }: ProposalSubmissionProps) {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [timeline, setTimeline] = useState('');
  const [githubProfile, setGithubProfile] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const proposal = {
        projectId,
        freelancerEmail: user?.email,
        freelancerName: user?.name,
        coverLetter,
        proposedTimeline: parseInt(timeline),
        githubProfile,
        portfolio: portfolio.split(',').map(p => p.trim()).filter(Boolean),
        submittedAt: Date.now(),
      };

      const ipfsHash = await pinJSONToIPFS(proposal);
      onSubmit(ipfsHash);
      onClose();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Failed to submit proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Submit Proposal</h2>
            <p className="text-slate-400 mt-1">{projectTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cover Letter *
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="input-field min-h-[150px]"
              placeholder="Explain why you're the best fit for this project..."
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Proposed Timeline (days) *
            </label>
            <input
              type="number"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="input-field"
              placeholder="30"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              GitHub Profile
            </label>
            <input
              type="url"
              value={githubProfile}
              onChange={(e) => setGithubProfile(e.target.value)}
              className="input-field"
              placeholder="https://github.com/username"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Portfolio Links (comma-separated)
            </label>
            <input
              type="text"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              className="input-field"
              placeholder="https://example.com, https://project.com"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Proposal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
