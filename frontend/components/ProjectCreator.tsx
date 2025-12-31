'use client';

import { useState } from 'react';
import { Mic, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { uploadToIPFS } from '@/lib/ipfs';

interface ProjectListing {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  requirements: {
    technical: string[];
    subjective: string[];
  };
  skills: string[];
  clientAddress: string;
  status: 'draft' | 'open' | 'in_progress' | 'completed';
  createdAt: string;
}

export default function ProjectCreator() {
  const { address } = useAccount();
  const [mode, setMode] = useState<'form' | 'voice'>('form');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [listing, setListing] = useState<Partial<ProjectListing>>({
    status: 'draft',
    requirements: { technical: [], subjective: [] },
    skills: []
  });
  const [ipfsHash, setIpfsHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Voice recording state
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError('');

    try {
      // Send to voice processing agent
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/voice/process', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Voice processing failed');
      }

      const result = await response.json();
      
      // Update listing with AI-extracted information
      setListing({
        ...listing,
        title: result.title || '',
        description: result.description || '',
        budget: result.budget || '',
        deadline: result.deadline || '',
        requirements: result.requirements || { technical: [], subjective: [] },
        skills: result.skills || []
      });
    } catch (err) {
      setError('Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setListing({ ...listing, [field]: value });
  };

  const addRequirement = (type: 'technical' | 'subjective', requirement: string) => {
    if (!requirement.trim()) return;
    
    setListing({
      ...listing,
      requirements: {
        ...listing.requirements!,
        [type]: [...(listing.requirements?.[type] || []), requirement]
      }
    });
  };

  const removeRequirement = (type: 'technical' | 'subjective', index: number) => {
    setListing({
      ...listing,
      requirements: {
        ...listing.requirements!,
        [type]: listing.requirements![type].filter((_, i) => i !== index)
      }
    });
  };

  const addSkill = (skill: string) => {
    if (!skill.trim() || listing.skills?.includes(skill)) return;
    setListing({
      ...listing,
      skills: [...(listing.skills || []), skill]
    });
  };

  const removeSkill = (skill: string) => {
    setListing({
      ...listing,
      skills: listing.skills?.filter(s => s !== skill) || []
    });
  };

  const publishListing = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!listing.title || !listing.description || !listing.budget) {
      setError('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create complete listing object
      const completeListing: ProjectListing = {
        title: listing.title!,
        description: listing.description!,
        budget: listing.budget!,
        deadline: listing.deadline || '',
        requirements: listing.requirements || { technical: [], subjective: [] },
        skills: listing.skills || [],
        clientAddress: address,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      // Upload to IPFS
      const hash = await uploadToIPFS(JSON.stringify(completeListing));
      setIpfsHash(hash);

      // Store in marketplace (backend API)
      const response = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipfsHash: hash,
          listing: completeListing
        })
      });

      if (!response.ok) {
        throw new Error('Failed to publish listing');
      }

      // Reset form
      setListing({
        status: 'draft',
        requirements: { technical: [], subjective: [] },
        skills: []
      });

      alert('Project listing published successfully! Freelancers can now submit proposals.');
    } catch (err) {
      setError('Failed to publish listing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Create Project Listing</h2>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setMode('form')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              mode === 'form'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="inline-block w-5 h-5 mr-2" />
            Form Input
          </button>
          <button
            onClick={() => setMode('voice')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              mode === 'voice'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Mic className="inline-block w-5 h-5 mr-2" />
            Voice Input
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Voice Mode */}
        {mode === 'voice' && (
          <div className="mb-8">
            <div className="text-center py-12">
              {!isRecording && !isProcessing && (
                <button
                  onClick={startVoiceRecording}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 mx-auto flex items-center justify-center"
                >
                  <Mic className="w-16 h-16" />
                </button>
              )}

              {isRecording && (
                <button
                  onClick={stopVoiceRecording}
                  className="w-32 h-32 rounded-full bg-red-600 text-white shadow-2xl animate-pulse mx-auto flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-4 h-4 bg-white rounded-full mx-auto mb-2" />
                    <span className="text-sm font-semibold">Recording...</span>
                  </div>
                </button>
              )}

              {isProcessing && (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                  <p className="text-slate-600 font-medium">Processing your voice input...</p>
                </div>
              )}

              <p className="mt-6 text-slate-600">
                {!isRecording && !isProcessing && 'Click the microphone to describe your project'}
                {isRecording && 'Speak clearly about your project requirements'}
                {isProcessing && 'AI is analyzing your requirements...'}
              </p>
            </div>
          </div>
        )}

        {/* Form Mode */}
        {mode === 'form' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={listing.title || ''}
                onChange={(e) => handleFormChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Build a responsive e-commerce website"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                value={listing.description || ''}
                onChange={(e) => handleFormChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Describe your project in detail..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Budget (ETH) *
                </label>
                <input
                  type="text"
                  value={listing.budget || ''}
                  onChange={(e) => handleFormChange('budget', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., 2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={listing.deadline || ''}
                  onChange={(e) => handleFormChange('deadline', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Technical Requirements (80% of payment)
              </label>
              <div className="space-y-2">
                {listing.requirements?.technical.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-4 py-2 bg-slate-100 rounded-lg">{req}</span>
                    <button
                      onClick={() => removeRequirement('technical', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Add technical requirement (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addRequirement('technical', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subjective Requirements (20% of payment)
              </label>
              <div className="space-y-2">
                {listing.requirements?.subjective.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-4 py-2 bg-slate-100 rounded-lg">{req}</span>
                    <button
                      onClick={() => removeRequirement('subjective', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Add subjective requirement (press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addRequirement('subjective', e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Required Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {listing.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add skill (press Enter)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addSkill(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Preview Section */}
        {(listing.title || listing.description) && (
          <div className="mt-8 p-6 bg-slate-50 rounded-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Preview</h3>
            <div className="space-y-3">
              {listing.title && (
                <div>
                  <span className="text-sm font-semibold text-slate-600">Title:</span>
                  <p className="text-slate-900">{listing.title}</p>
                </div>
              )}
              {listing.description && (
                <div>
                  <span className="text-sm font-semibold text-slate-600">Description:</span>
                  <p className="text-slate-900">{listing.description}</p>
                </div>
              )}
              {listing.budget && (
                <div>
                  <span className="text-sm font-semibold text-slate-600">Budget:</span>
                  <p className="text-slate-900">{listing.budget} ETH</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Publish Button */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={publishListing}
            disabled={isProcessing || !listing.title || !listing.description || !listing.budget}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Publish to Marketplace
              </>
            )}
          </button>
        </div>

        {ipfsHash && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-800 font-medium">✓ Published to IPFS: {ipfsHash}</p>
          </div>
        )}
      </div>
    </div>
  );
}
