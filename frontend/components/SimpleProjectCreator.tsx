'use client';

import { useState } from 'react';
import { Sparkles, Zap, Shield, Code } from 'lucide-react';
import { ProjectListing } from '@/types/marketplace';
import { useAccount } from 'wagmi';

interface SimpleProjectCreatorProps {
  onProjectCreated?: (project: ProjectListing) => void;
}

export function SimpleProjectCreator({ onProjectCreated }: SimpleProjectCreatorProps) {
  const { address } = useAccount();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('14');
  const [skills, setSkills] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdProject, setCreatedProject] = useState<ProjectListing | null>(null);

  const handleCreate = async () => {
    if (!title || !description || !budget || !address) {
      alert('Please fill all required fields and connect your wallet');
      return;
    }

    setIsCreating(true);
    try {
      const budgetNum = parseFloat(budget);
      const listing: ProjectListing = {
        id: `proj-${Date.now()}`,
        status: 'open',
        clientAddress: address,
        title,
        description,
        budget: {
          total: budgetNum.toString(),
          technical: (budgetNum * 0.8).toString(),
          subjective: (budgetNum * 0.2).toString()
        },
        requirements: {
          technical: [],
          subjective: []
        },
        timeline: {
          estimated: parseInt(timeline)
        },
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        createdAt: Date.now(),
        proposals: []
      };

      // Pin to IPFS
      const ipfsResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY!,
          'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY!,
        },
        body: JSON.stringify({
          pinataContent: listing,
          pinataMetadata: {
            name: `vera-project-${listing.id}`,
          }
        })
      });

      const ipfsData = await ipfsResponse.json();
      listing.ipfsHash = ipfsData.IpfsHash;

      setCreatedProject(listing);
      onProjectCreated?.(listing);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (createdProject) {
    return (
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-white to-green-50 rounded-3xl p-8 border-2 border-green-200 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Project Posted! 🎉
              </h3>
              <p className="text-sm text-green-600 font-medium">Freelancers can now submit proposals</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-green-100">
              <div className="text-xs text-slate-500 font-semibold mb-1">Title</div>
              <div className="text-sm font-semibold text-slate-900">{createdProject.title}</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-green-100">
              <div className="text-xs text-slate-500 font-semibold mb-1">Budget</div>
              <div className="text-lg font-bold text-green-600">{createdProject.budget.total} ETH</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-green-100">
              <div className="text-xs text-slate-500 font-semibold mb-1">Timeline</div>
              <div className="text-sm text-slate-900">{createdProject.timeline.estimated} days</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-green-100">
              <div className="text-xs text-slate-500 font-semibold mb-1">IPFS Hash</div>
              <div className="font-mono text-xs text-slate-900 truncate">{createdProject.ipfsHash}</div>
            </div>
          </div>

          <button
            onClick={() => {
              setCreatedProject(null);
              setTitle('');
              setDescription('');
              setBudget('');
              setSkills('');
            }}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all"
          >
            Create Another Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., Build a DeFi Dashboard"
            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Budget (ETH) *
          </label>
          <input
            type="number"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="E.g., 2.5"
            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
          />
          {budget && (
            <p className="mt-2 text-xs text-slate-600">
              80%={(parseFloat(budget) * 0.8).toFixed(2)} ETH (technical), 20%={(parseFloat(budget) * 0.2).toFixed(2)} ETH (subjective)
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-900 mb-2">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your project requirements in detail..."
          rows={6}
          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all resize-none"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Timeline (days)
          </label>
          <input
            type="number"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            placeholder="14"
            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Required Skills (comma-separated)
          </label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="React, Node.js, Solidity"
            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-xs font-semibold text-indigo-900">Smart Contract Escrow</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-xs font-semibold text-purple-900">AI-Verified Delivery</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Code className="w-6 h-6 text-pink-600" />
            </div>
            <div className="text-xs font-semibold text-pink-900">IPFS Storage</div>
          </div>
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={isCreating || !title || !description || !budget || !address}
        className="w-full group relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
      >
        {isCreating ? (
          <span className="flex items-center justify-center space-x-3">
            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creating Project...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center space-x-3">
            <Sparkles className="w-5 h-5" />
            <span>Post to Marketplace</span>
          </span>
        )}
      </button>
    </div>
  );
}
