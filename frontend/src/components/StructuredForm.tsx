import { useState } from 'react';
import { X, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle, DollarSign, FileText, Target, Sparkles } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, keccak256, toBytes } from 'viem';
import { VERA_ESCROW_ABI, CONTRACT_ADDRESS } from '../lib/contract';
import { pinJSONToIPFS, ipfsHashToBytes32 } from '../lib/ipfs';
import VoiceRecorder from './VoiceRecorder';

interface StructuredFormProps {
  onClose: () => void;
}

interface Milestone {
  description: string;
  amount: string;
  deliverables: string[];
}

interface TechnicalRequirement {
  description: string;
  verificationCriteria: string[];
}

interface SubjectiveRequirement {
  description: string;
  evaluationCriteria: string[];
}

/**
 * StructuredForm Component
 * 
 * Multi-step form for creating projects with detailed requirements
 * 
 * Features:
 * - Step-by-step project creation wizard
 * - Voice input integration for natural language
 * - Milestone management with 80/20 split visualization
 * - Technical and subjective requirement builder
 * - Real-time budget calculation
 * - IPFS metadata storage
 * - Smart contract integration
 * 
 * Requirements: 1.1, 2.2, 6.1
 * Validates 80/20 split (Property 4)
 */
export default function StructuredForm({ onClose }: StructuredFormProps) {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const [useVoiceInput, setUseVoiceInput] = useState(false);

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [freelancerAddress, setFreelancerAddress] = useState('');

  // Step 2: Requirements
  const [technicalRequirements, setTechnicalRequirements] = useState<TechnicalRequirement[]>([
    { description: '', verificationCriteria: [''] }
  ]);
  const [subjectiveRequirements, setSubjectiveRequirements] = useState<SubjectiveRequirement[]>([
    { description: '', evaluationCriteria: [''] }
  ]);

  // Step 3: Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([
    { description: '', amount: '', deliverables: [''] }
  ]);

  // Step 4: Budget & Timeline
  const [totalBudget, setTotalBudget] = useState('');
  const [estimatedTimeline, setEstimatedTimeline] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Voice transcript handler
  const handleVoiceTranscript = (transcript: string) => {
    if (currentStep === 1) {
      // Parse voice input for project details
      setDescription(transcript);
      
      // Simple NLP: Extract potential budget
      const budgetMatch = transcript.match(/(\d+(?:\.\d+)?)\s*eth/i);
      if (budgetMatch) {
        setTotalBudget(budgetMatch[1]);
      }

      // Simple NLP: Extract timeline
      const timelineMatch = transcript.match(/(\d+)\s*days?/i);
      if (timelineMatch) {
        setEstimatedTimeline(timelineMatch[1]);
      }
    }
  };

  // Calculate 80/20 split
  const calculateSplit = (amount: string) => {
    if (!amount) return { technical: '0', subjective: '0' };
    const total = parseFloat(amount);
    return {
      technical: (total * 0.8).toFixed(4),
      subjective: (total * 0.2).toFixed(4)
    };
  };

  // Add/Remove handlers
  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addTechnicalRequirement = () => {
    setTechnicalRequirements([...technicalRequirements, { description: '', verificationCriteria: [''] }]);
  };

  const removeTechnicalRequirement = (index: number) => {
    setTechnicalRequirements(technicalRequirements.filter((_, i) => i !== index));
  };

  const addSubjectiveRequirement = () => {
    setSubjectiveRequirements([...subjectiveRequirements, { description: '', evaluationCriteria: [''] }]);
  };

  const removeSubjectiveRequirement = (index: number) => {
    setSubjectiveRequirements(subjectiveRequirements.filter((_, i) => i !== index));
  };

  const addMilestone = () => {
    setMilestones([...milestones, { description: '', amount: '', deliverables: [''] }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const addDeliverable = (milestoneIndex: number) => {
    const updated = [...milestones];
    updated[milestoneIndex].deliverables.push('');
    setMilestones(updated);
  };

  const removeDeliverable = (milestoneIndex: number, deliverableIndex: number) => {
    const updated = [...milestones];
    updated[milestoneIndex].deliverables = updated[milestoneIndex].deliverables.filter((_, i) => i !== deliverableIndex);
    setMilestones(updated);
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const updateDeliverable = (milestoneIndex: number, deliverableIndex: number, value: string) => {
    const updated = [...milestones];
    updated[milestoneIndex].deliverables[deliverableIndex] = value;
    setMilestones(updated);
  };

  // Total milestone budget
  const totalMilestoneBudget = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  // Navigation
  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return title.trim() && description.trim();
      case 2:
        return technicalRequirements.some(r => r.description.trim());
      case 3:
        return milestones.some(m => m.description.trim() && m.amount.trim());
      case 4:
        return totalBudget.trim() && estimatedTimeline.trim();
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Submit project
  const handleSubmit = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsCreating(true);

    try {
      // Create metadata object
      const metadata = {
        title,
        description,
        skills,
        requirements: {
          technical: technicalRequirements.filter(r => r.description.trim()),
          subjective: subjectiveRequirements.filter(r => r.description.trim())
        },
        milestones: milestones.filter(m => m.description.trim() && m.amount.trim()),
        payment: {
          totalAmount: totalBudget,
          currency: 'ETH',
          split: {
            technical: calculateSplit(totalBudget).technical,
            subjective: calculateSplit(totalBudget).subjective
          }
        },
        timeline: {
          estimated: parseInt(estimatedTimeline)
        },
        createdBy: address,
        createdAt: Date.now()
      };

      // Upload to IPFS
      const ipfsHash = await pinJSONToIPFS(metadata);
      const ipfsBytes32 = ipfsHashToBytes32(ipfsHash);

      // Generate project ID
      const projectId = keccak256(toBytes(`${address}-${Date.now()}`));

      // Create project on blockchain
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VERA_ESCROW_ABI,
        functionName: 'createProject',
        args: [projectId, (freelancerAddress || '0x0000000000000000000000000000000000000000') as `0x${string}`, ipfsBytes32 as `0x${string}`],
        value: parseEther(totalBudget)
      });
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
      setIsCreating(false);
    }
  };

  if (isSuccess && !isConfirming) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Project Created!</h2>
          <p className="text-slate-400 mb-6">
            Your project has been successfully created and stored on the blockchain.
          </p>
          <button onClick={onClose} className="btn-primary w-full">
            View Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Project</h2>
            <p className="text-slate-400 mt-1">Step {currentStep} of 5</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            disabled={isCreating || isPending || isConfirming}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex justify-between mb-2 text-xs text-slate-500">
            <span>Basic Info</span>
            <span>Requirements</span>
            <span>Milestones</span>
            <span>Budget</span>
            <span>Review</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-vera-600 to-vera-500 transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Project Information</h3>
                <button
                  onClick={() => setUseVoiceInput(!useVoiceInput)}
                  className="btn-ghost text-sm flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {useVoiceInput ? 'Use Form' : 'Use Voice'}
                </button>
              </div>

              {useVoiceInput ? (
                <VoiceRecorder 
                  onTranscriptComplete={handleVoiceTranscript}
                  placeholder="Speak your project details naturally..."
                />
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input-field"
                      placeholder="e.g., React Dashboard with Authentication"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-field min-h-[120px]"
                      placeholder="Describe your project requirements in detail..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Required Skills
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className="input-field flex-1"
                        placeholder="e.g., React, TypeScript, Node.js"
                      />
                      <button onClick={addSkill} className="btn-ghost">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-vera-600/10 border border-vera-500/20 rounded-lg text-vera-400 text-sm font-medium flex items-center gap-2"
                        >
                          {skill}
                          <button onClick={() => removeSkill(idx)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Freelancer Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={freelancerAddress}
                      onChange={(e) => setFreelancerAddress(e.target.value)}
                      className="input-field font-mono text-sm"
                      placeholder="0x..."
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Leave empty to post on marketplace for proposals
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Requirements */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    Technical Requirements (80%)
                  </h3>
                  <button onClick={addTechnicalRequirement} className="btn-ghost text-sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </button>
                </div>
                {technicalRequirements.map((req, idx) => (
                  <div key={idx} className="card p-4 mb-3 bg-slate-900/50">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-400">Requirement {idx + 1}</span>
                      {technicalRequirements.length > 1 && (
                        <button onClick={() => removeTechnicalRequirement(idx)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={req.description}
                      onChange={(e) => {
                        const updated = [...technicalRequirements];
                        updated[idx].description = e.target.value;
                        setTechnicalRequirements(updated);
                      }}
                      className="input-field mb-2"
                      placeholder="e.g., Implement user authentication with JWT"
                    />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-yellow-400" />
                    Subjective Requirements (20%)
                  </h3>
                  <button onClick={addSubjectiveRequirement} className="btn-ghost text-sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </button>
                </div>
                {subjectiveRequirements.map((req, idx) => (
                  <div key={idx} className="card p-4 mb-3 bg-slate-900/50">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-400">Requirement {idx + 1}</span>
                      {subjectiveRequirements.length > 1 && (
                        <button onClick={() => removeSubjectiveRequirement(idx)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={req.description}
                      onChange={(e) => {
                        const updated = [...subjectiveRequirements];
                        updated[idx].description = e.target.value;
                        setSubjectiveRequirements(updated);
                      }}
                      className="input-field mb-2"
                      placeholder="e.g., Clean code with proper documentation"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Milestones */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Project Milestones</h3>
                <button onClick={addMilestone} className="btn-ghost text-sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Milestone
                </button>
              </div>

              {milestones.map((milestone, idx) => {
                const split = calculateSplit(milestone.amount);
                return (
                  <div key={idx} className="card p-4 bg-slate-900/50">
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-medium text-slate-300">Milestone {idx + 1}</span>
                      {milestones.length > 1 && (
                        <button onClick={() => removeMilestone(idx)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(idx, 'description', e.target.value)}
                      className="input-field mb-2"
                      placeholder="Milestone description"
                    />

                    <input
                      type="number"
                      step="0.01"
                      value={milestone.amount}
                      onChange={(e) => updateMilestone(idx, 'amount', e.target.value)}
                      className="input-field mb-2"
                      placeholder="Amount in ETH"
                    />

                    {milestone.amount && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                          <p className="text-xs text-green-400/80">Technical (80%)</p>
                          <p className="text-sm font-medium text-green-400">{split.technical} ETH</p>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                          <p className="text-xs text-yellow-400/80">Subjective (20%)</p>
                          <p className="text-sm font-medium text-yellow-400">{split.subjective} ETH</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400">Deliverables</label>
                      {milestone.deliverables.map((deliverable, dIdx) => (
                        <div key={dIdx} className="flex gap-2">
                          <input
                            type="text"
                            value={deliverable}
                            onChange={(e) => updateDeliverable(idx, dIdx, e.target.value)}
                            className="input-field text-sm flex-1"
                            placeholder="e.g., GitHub repository link"
                          />
                          {milestone.deliverables.length > 1 && (
                            <button onClick={() => removeDeliverable(idx, dIdx)} className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addDeliverable(idx)} className="btn-ghost text-xs w-full">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Deliverable
                      </button>
                    </div>
                  </div>
                );
              })}

              {totalMilestoneBudget > 0 && (
                <div className="card p-4 bg-vera-600/10 border-vera-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Total Milestone Budget</span>
                    <span className="text-xl font-bold text-vera-400">{totalMilestoneBudget.toFixed(4)} ETH</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Budget & Timeline */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white mb-4">Budget & Timeline</h3>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Budget (ETH) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="input-field text-2xl font-bold"
                  placeholder="2.5"
                />
              </div>

              {totalBudget && (
                <div className="card p-6 bg-slate-900/50">
                  <h4 className="font-medium text-white mb-4">Payment Structure (80/20 Split)</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div>
                        <p className="text-sm text-green-400/80">Technical Requirements</p>
                        <p className="text-xs text-slate-500">Released after AI verification</p>
                      </div>
                      <p className="text-2xl font-bold text-green-400">{calculateSplit(totalBudget).technical} ETH</p>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div>
                        <p className="text-sm text-yellow-400/80">Subjective Elements</p>
                        <p className="text-xs text-slate-500">Released via Silent Consent (72h)</p>
                      </div>
                      <p className="text-2xl font-bold text-yellow-400">{calculateSplit(totalBudget).subjective} ETH</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Estimated Timeline (days) *
                </label>
                <input
                  type="number"
                  value={estimatedTimeline}
                  onChange={(e) => setEstimatedTimeline(e.target.value)}
                  className="input-field"
                  placeholder="30"
                />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white mb-4">Review Your Project</h3>

              <div className="card p-6 bg-slate-900/50">
                <h4 className="font-medium text-white mb-2">{title}</h4>
                <p className="text-slate-400 text-sm mb-4">{description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Budget</p>
                    <p className="text-lg font-bold text-vera-400">{totalBudget} ETH</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Timeline</p>
                    <p className="text-lg font-bold text-white">{estimatedTimeline} days</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Skills Required</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-vera-600/10 border border-vera-500/20 rounded text-vera-400 text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-2">Milestones ({milestones.length})</p>
                  {milestones.map((m, idx) => (
                    <div key={idx} className="text-sm text-slate-300 mb-1">
                      {idx + 1}. {m.description} - {m.amount} ETH
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-400 text-sm">
                  ℹ️ Your project will be stored on IPFS and the blockchain. 
                  Funds will be locked in escrow until milestones are verified and approved.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isCreating || isPending || isConfirming}
            className="btn-ghost flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="btn-primary flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isCreating || isPending || isConfirming || !canProceed()}
              className="btn-primary flex items-center gap-2"
            >
              {isPending || isConfirming ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  {isPending ? 'Confirming...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Create Project
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
