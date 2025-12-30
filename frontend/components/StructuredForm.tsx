'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Plus, Trash2, Calendar, DollarSign } from 'lucide-react';
import { generateAgreementFromForm, pinAgreementToIPFS, Agreement } from '@/lib/ipfs';

interface Milestone {
  id: string;
  name: string;
  description: string;
  percentage: number;
  deadline: string;
}

interface StructuredFormProps {
  onAgreementCreated?: (agreement: Agreement, ipfsHash: string) => void;
}

const PROJECT_TYPES = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'smart-contract', label: 'Smart Contract Development' },
  { value: 'mobile-app', label: 'Mobile App Development' },
  { value: 'ui-design', label: 'UI/UX Design' },
  { value: 'content-writing', label: 'Content Writing' },
  { value: 'data-analysis', label: 'Data Analysis' },
  { value: 'marketing', label: 'Marketing/SEO' },
  { value: 'other', label: 'Other' },
];

export function StructuredForm({ onAgreementCreated }: StructuredFormProps) {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [projectType, setProjectType] = useState('web-development');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [freelancerAddress, setFreelancerAddress] = useState('');
  
  const [technicalRequirements, setTechnicalRequirements] = useState<string[]>([
    'Code must be well-documented',
    'All tests must pass',
    'Security best practices followed',
  ]);
  const [subjectiveRequirements, setSubjectiveRequirements] = useState<string[]>([
    'UI matches design mockups',
    'Code follows style guidelines',
  ]);

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'milestone_1',
      name: 'Initial Setup & Design',
      description: 'Project scaffolding and design mockups',
      percentage: 25,
      deadline: '',
    },
    {
      id: 'milestone_2',
      name: 'Core Development',
      description: 'Main functionality implementation',
      percentage: 50,
      deadline: '',
    },
    {
      id: 'milestone_3',
      name: 'Testing & Deployment',
      description: 'Testing, bug fixes, and production deployment',
      percentage: 25,
      deadline: '',
    },
  ]);

  const addTechnicalRequirement = () => {
    setTechnicalRequirements([...technicalRequirements, '']);
  };

  const updateTechnicalRequirement = (index: number, value: string) => {
    const updated = [...technicalRequirements];
    updated[index] = value;
    setTechnicalRequirements(updated);
  };

  const removeTechnicalRequirement = (index: number) => {
    setTechnicalRequirements(technicalRequirements.filter((_, i) => i !== index));
  };

  const addSubjectiveRequirement = () => {
    setSubjectiveRequirements([...subjectiveRequirements, '']);
  };

  const updateSubjectiveRequirement = (index: number, value: string) => {
    const updated = [...subjectiveRequirements];
    updated[index] = value;
    setSubjectiveRequirements(updated);
  };

  const removeSubjectiveRequirement = (index: number) => {
    setSubjectiveRequirements(subjectiveRequirements.filter((_, i) => i !== index));
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: `milestone_${milestones.length + 1}`,
        name: '',
        description: '',
        percentage: 0,
        deadline: '',
      },
    ]);
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const totalPercentage = milestones.reduce((sum, m) => sum + Number(m.percentage), 0);

  const handleSubmit = async () => {
    if (!address || !freelancerAddress) {
      alert('Please connect your wallet and enter freelancer address');
      return;
    }

    if (totalPercentage !== 100) {
      alert(`Milestone percentages must total 100% (current: ${totalPercentage}%)`);
      return;
    }

    setIsProcessing(true);
    try {
      const formData = {
        projectType,
        title,
        description,
        budget,
        deadline,
        technicalRequirements: technicalRequirements.filter(r => r.trim()),
        subjectiveRequirements: subjectiveRequirements.filter(r => r.trim()),
        milestones,
        clientAddress: address,
        freelancerAddress,
      };

      const agreement = generateAgreementFromForm(formData);
      const ipfsHash = await pinAgreementToIPFS(agreement);
      agreement.ipfsHash = ipfsHash;

      onAgreementCreated?.(agreement, ipfsHash);

      alert('Agreement created and pinned to IPFS successfully!');
    } catch (error) {
      console.error('Failed to create agreement:', error);
      alert('Failed to create agreement. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Project Basics</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Project Type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vera-primary focus:border-transparent"
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Project Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., E-commerce Website with Payment Integration"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vera-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed project description..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vera-primary focus:border-transparent"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Budget (ETH) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="1.5"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vera-primary focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  80% auto-releases, 20% held for review
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Final Deadline *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vera-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Freelancer Wallet Address *</label>
              <input
                type="text"
                value={freelancerAddress}
                onChange={(e) => setFreelancerAddress(e.target.value)}
                placeholder="0x742d35Cc6634C0532925a3b8D0C9e3e0C8b0e4c2"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vera-primary focus:border-transparent font-mono text-sm"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Requirements (80/20 Split)</h3>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">
                  Technical Requirements (80%) - Auto-Release
                </label>
                <button
                  type="button"
                  onClick={addTechnicalRequirement}
                  className="text-sm text-vera-primary hover:text-vera-primary/80 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {technicalRequirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateTechnicalRequirement(index, e.target.value)}
                      placeholder="e.g., All unit tests must pass"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vera-primary focus:border-transparent"
                    />
                    {technicalRequirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTechnicalRequirement(index)}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">
                  Subjective Requirements (20%) - Manual Review
                </label>
                <button
                  type="button"
                  onClick={addSubjectiveRequirement}
                  className="text-sm text-vera-primary hover:text-vera-primary/80 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {subjectiveRequirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateSubjectiveRequirement(index, e.target.value)}
                      placeholder="e.g., Design matches brand guidelines"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vera-primary focus:border-transparent"
                    />
                    {subjectiveRequirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubjectiveRequirement(index)}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Milestones</h3>
              <div className="text-sm">
                Total: <span className={totalPercentage === 100 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {totalPercentage}%
                </span> / 100%
              </div>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Milestone {index + 1}</h4>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={milestone.name}
                    onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                    placeholder="Milestone name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vera-primary focus:border-transparent"
                  />

                  <textarea
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    placeholder="Milestone description"
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vera-primary focus:border-transparent"
                  />

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Payment %</label>
                      <input
                        type="number"
                        value={milestone.percentage}
                        onChange={(e) => updateMilestone(index, 'percentage', Number(e.target.value))}
                        min="0"
                        max="100"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vera-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Deadline</label>
                      <input
                        type="date"
                        value={milestone.deadline}
                        onChange={(e) => updateMilestone(index, 'deadline', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-vera-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {budget && milestone.percentage > 0 && (
                    <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                      Payment: {(Number(budget) * milestone.percentage / 100).toFixed(3)} ETH
                      (80% auto-release: {(Number(budget) * milestone.percentage / 100 * 0.8).toFixed(3)} ETH)
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addMilestone}
              className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-vera-primary hover:text-vera-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Milestone
            </button>

            {totalPercentage !== 100 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                ⚠️ Milestone percentages must total 100%
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Review & Create</h3>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Project Overview</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Type:</dt>
                    <dd className="font-medium">{PROJECT_TYPES.find(t => t.value === projectType)?.label}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Title:</dt>
                    <dd className="font-medium">{title}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Budget:</dt>
                    <dd className="font-medium">{budget} ETH</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Deadline:</dt>
                    <dd className="font-medium">{deadline}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Requirements</h4>
                <p className="text-sm text-slate-600 mb-2">Technical (80%): {technicalRequirements.filter(r => r).length} requirements</p>
                <p className="text-sm text-slate-600">Subjective (20%): {subjectiveRequirements.filter(r => r).length} requirements</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Milestones</h4>
                <div className="space-y-2">
                  {milestones.map((m, i) => (
                    <div key={m.id} className="text-sm flex justify-between">
                      <span>{i + 1}. {m.name}</span>
                      <span className="font-medium">{m.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 How It Works</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Agreement will be stored on IPFS (decentralized)</li>
                  <li>• 80% of each milestone auto-releases on AI verification</li>
                  <li>• 20% held for 72 hours for your review</li>
                  <li>• If no dispute, remaining 20% auto-releases (Silent Consent)</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step === currentStep
                  ? 'bg-vera-primary text-white'
                  : step < currentStep
                  ? 'bg-vera-success text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step < currentStep ? '✓' : step}
            </div>
            {step < 4 && (
              <div
                className={`h-1 w-16 md:w-32 mx-2 ${
                  step < currentStep ? 'bg-vera-success' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">{renderStep()}</div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t">
        <button
          type="button"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            disabled={
              (currentStep === 1 && (!title || !description || !budget || !deadline || !freelancerAddress)) ||
              (currentStep === 3 && totalPercentage !== 100)
            }
            className="px-6 py-2 bg-vera-primary text-white rounded-lg hover:bg-vera-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing || !address}
            className="px-8 py-2 bg-vera-success text-white rounded-lg hover:bg-vera-success/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? 'Creating...' : 'Create Agreement & Pin to IPFS'}
          </button>
        )}
      </div>
    </div>
  );
}
