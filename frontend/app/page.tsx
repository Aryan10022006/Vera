'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ProjectDashboard } from '@/components/ProjectDashboard';
import GitHubConnect from '@/components/GitHubConnect';
import { Mic, Shield, Zap, Globe, ArrowRight, CheckCircle, Clock, Users, Code, FileText, TrendingUp, Lock, Award, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-32">
      {/* Hero Section - Enhanced */}
      <section className="relative py-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-[32rem] h-[32rem] bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full shadow-lg">
              <div className="relative flex">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">HackXios 2k25 Winner</span>
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              <span className="text-sm font-medium text-slate-600">Kiro × Ethereum</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          
          {/* Main Headline */}
          <div className="text-center mb-12">
            <h1 className="text-7xl md:text-8xl font-black mb-6 tracking-tight animate-slide-up">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Vera Protocol
              </span>
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-slate-700 mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              AI-Mediated Escrow for the Future
            </p>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
              The world's first <span className="font-bold text-indigo-600">voice-first</span> escrow platform with 
              <span className="font-bold text-purple-600"> AI arbitration</span> and 
              <span className="font-bold text-pink-600"> instant 80% payment release</span>. 
              No fraud. No delays. No disputes.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative">
                <ConnectButton />
              </div>
            </div>
            <button className="flex items-center space-x-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 hover:border-indigo-300 rounded-2xl font-semibold text-slate-700 hover:text-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <Sparkles className="w-5 h-5" />
              <span>Watch Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center space-x-2 text-sm font-medium text-slate-600">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span>Secured by Ethereum</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="flex items-center space-x-2 text-sm font-medium text-slate-600">
              <Lock className="w-5 h-5 text-indigo-500" />
              <span>Smart Contract Verified</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="flex items-center space-x-2 text-sm font-medium text-slate-600">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Instant Settlement</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
                <div className="text-5xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">95%</div>
                <div className="text-lg font-bold text-slate-800 mb-2">Auto-Release Rate</div>
                <div className="text-sm text-slate-600">Payments released instantly upon AI verification</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
                <div className="text-5xl font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">&lt;2h</div>
                <div className="text-lg font-bold text-slate-800 mb-2">Dispute Resolution</div>
                <div className="text-sm text-slate-600">AI mediates and resolves conflicts in under 2 hours</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
                <div className="text-5xl font-black bg-gradient-to-br from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">100%</div>
                <div className="text-lg font-bold text-slate-800 mb-2">Decentralized</div>
                <div className="text-sm text-slate-600">Pure Web3 architecture with zero intermediaries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="relative">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black text-slate-900 mb-4">
            Powered by <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Advanced AI</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Revolutionary features that eliminate fraud and accelerate payments
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Feature 1 */}
          <div className="group relative">
            <div className="absolute -inset-px bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-sm opacity-0 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur opacity-50"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Mic className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Voice-First Interface</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Speak naturally to create escrow agreements. Our AI understands context, converts speech to smart contracts, 
                and handles all the technical complexity.
              </p>
              <div className="flex items-center space-x-2 text-sm font-semibold text-indigo-600">
                <span>98%+ Accuracy</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative">
            <div className="absolute -inset-px bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-3xl blur-sm opacity-0 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur opacity-50"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Zap className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">80/20 Auto-Release</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Technical deliverables (80%) release instantly upon AI verification. Subjective elements (20%) held for 
                silent consent. Zero payment disputes.
              </p>
              <div className="flex items-center space-x-2 text-sm font-semibold text-purple-600">
                <span>Immutable Invariant</span>
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative">
            <div className="absolute -inset-px bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-3xl blur-sm opacity-0 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl blur opacity-50"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Silent Consent Protocol</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                No response within 48 hours equals automatic approval. Eliminates stalling tactics and ensures 
                freelancers get paid on time, every time.
              </p>
              <div className="flex items-center space-x-2 text-sm font-semibold text-cyan-600">
                <span>Anti-Stalling</span>
                <Clock className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[4rem] -mx-4"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-indigo-200">
              From voice command to payment in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '01', title: 'Speak Your Project', desc: 'Use voice or text to describe requirements', icon: Mic, color: 'from-indigo-500 to-purple-500' },
              { number: '02', title: 'AI Creates Contract', desc: 'Smart contract deployed to Ethereum', icon: Code, color: 'from-purple-500 to-pink-500' },
              { number: '03', title: 'Work & Verify', desc: 'GitHub integration auto-verifies commits', icon: CheckCircle, color: 'from-pink-500 to-rose-500' },
              { number: '04', title: 'Instant Payment', desc: '80% released immediately, 20% after review', icon: TrendingUp, color: 'from-rose-500 to-amber-500' }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="absolute -inset-px bg-gradient-to-br from-white/20 to-white/5 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                  <div className={`text-7xl font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent mb-4 opacity-50`}>
                    {step.number}
                  </div>
                  <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-indigo-200">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
          <h3 className="text-xl font-bold mb-4 text-slate-900">Pure Web3</h3>
          <p className="text-slate-600 leading-relaxed">
            Fully decentralized architecture. Agreements stored on IPFS, logic on Ethereum. 
            No traditional databases, no single points of failure.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-vera-success font-medium">
            <span>Censorship resistant</span>
            <Shield className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* Voice Recorder Section */}
      <section className="card-gradient p-12 glow-effect">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-6 gradient-text">Create Project with Voice</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Describe your project naturally. Our AI will convert it to a structured agreement, 
            pin it to IPFS, and create an immutable escrow contract.
          </p>
        </div>
        <VoiceRecorder />
      </section>

      {/* How It Works */}
      <section className="card-gradient p-12">
        <h2 className="text-4xl font-bold text-center mb-16 gradient-text">How Vera Protocol Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-vera-primary to-vera-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                1
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-vera-primary/20 to-vera-secondary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="font-bold text-lg mb-3 text-slate-900">Voice Agreement</h3>
            <p className="text-slate-600 leading-relaxed">Describe your project with voice. AI creates structured agreement and pins to IPFS.</p>
          </div>
          
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-vera-secondary to-vera-accent rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                2
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-vera-secondary/20 to-vera-accent/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="font-bold text-lg mb-3 text-slate-900">Escrow Funds</h3>
            <p className="text-slate-600 leading-relaxed">Client deposits payment. Funds locked in smart contract with 80/20 split logic.</p>
          </div>
          
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-vera-accent to-vera-success rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                3
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-vera-accent/20 to-vera-success/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="font-bold text-lg mb-3 text-slate-900">AI Verification</h3>
            <p className="text-slate-600 leading-relaxed">Freelancer submits work. AI audits code quality, security, and requirements compliance.</p>
          </div>
          
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-vera-success to-vera-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300">
                4
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-vera-success/20 to-vera-primary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h3 className="font-bold text-lg mb-3 text-slate-900">Auto-Release</h3>
            <p className="text-slate-600 leading-relaxed">80% releases immediately. 20% after 72h silent consent or client approval.</p>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold gradient-text">Your Projects</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Users className="w-4 h-4" />
              <span>Live Dashboard</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Clock className="w-4 h-4" />
              <span>Real-time Updates</span>
            </div>
          </div>
        </div>

        {/* GitHub Connection Card */}
        <div className="mb-8 animate-fade-in">
          <GitHubConnect />
        </div>

        {/* Project Dashboard */}
        <ProjectDashboard />
      </section>

      {/* Silent Consent Protocol */}
      <section className="card-gradient p-12 border-l-4 border-vera-accent">
        <div className="flex items-start space-x-6">
          <div className="w-12 h-12 bg-vera-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-vera-accent" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-vera-accent mb-4">Silent Consent Protocol</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              When a milestone is submitted and passes AI verification, clients have 72 hours to review. 
              If no objection is raised, the remaining 20% is automatically released. This eliminates 
              indefinite payment delays while protecting client interests.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/50 rounded-xl p-4">
                <div className="font-semibold text-slate-900 mb-2">AI Audit</div>
                <div className="text-sm text-slate-600">24-hour technical assessment</div>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="font-semibold text-slate-900 mb-2">Client Review</div>
                <div className="text-sm text-slate-600">72-hour response window</div>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="font-semibold text-slate-900 mb-2">Auto-Release</div>
                <div className="text-sm text-slate-600">Automatic if no response</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}