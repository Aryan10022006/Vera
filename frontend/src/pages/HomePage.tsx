import Navigation from '../components/Navigation';
import { ArrowRight, Shield, Zap, Users, CheckCircle, Code, Coins, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';

export default function HomePage() {
  const { projects } = useProjects();

  const activeProjects = projects.filter(p => p.status === 0).length;
  const totalValue = projects.reduce((sum, p) => sum + Number(p.totalAmount), 0);
  const totalValueETH = (totalValue / 1e18).toFixed(2);
  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />

      {/* Hero Section with Dark Background and Animated Orbs */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Orbs Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vera-600/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-vera-600/10 border border-vera-500/20 text-vera-400 font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>Decentralized Project Escrow Platform</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="gradient-text">Trust-Free</span>
              <br />
              <span className="text-white">Project Collaboration</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Secure your projects with blockchain-verified milestones, AI-powered dispute resolution, and voice-based proofs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/marketplace" className="btn-primary inline-flex items-center gap-2 group">
                <span>Browse Projects</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/dashboard" className="btn-secondary inline-flex items-center gap-2">
                <Code className="w-5 h-5" />
                <span>Get Started</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 animate-slide-up">
            <div className="glass-card p-8 text-center hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-vera-600 to-vera-500 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{activeProjects}</h3>
              <p className="text-slate-400">Active Projects</p>
            </div>

            <div className="glass-card p-8 text-center hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{totalValueETH}Ξ</h3>
              <p className="text-slate-400">Total Value Locked</p>
            </div>

            <div className="glass-card p-8 text-center hover:bg-white/10 transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">AI</h3>
              <p className="text-slate-400">Powered Disputes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="gradient-text">Vera</span>?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Built for developers, by developers. Secure, transparent, and efficient.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure Escrow',
                description: 'Smart contract-based escrow ensures funds are only released when milestones are verified.',
                color: 'from-vera-600 to-vera-500',
              },
              {
                icon: CheckCircle,
                title: 'Milestone Tracking',
                description: 'Break projects into milestones with clear deliverables and payment schedules.',
                color: 'from-blue-600 to-blue-500',
              },
              {
                icon: Zap,
                title: 'Voice Proofs',
                description: 'Submit milestone proofs using voice recordings, transcribed and stored on IPFS.',
                color: 'from-purple-600 to-purple-500',
              },
              {
                icon: Users,
                title: 'Dispute Resolution',
                description: 'AI-powered dispute resolution analyzes evidence and suggests fair outcomes.',
                color: 'from-pink-600 to-pink-500',
              },
              {
                icon: Code,
                title: 'GitHub Integration',
                description: 'Connect your GitHub repos to automatically verify code-based milestones.',
                color: 'from-green-600 to-green-500',
              },
              {
                icon: Coins,
                title: 'Fair Payments',
                description: 'Automatic payment release when milestones are approved by both parties.',
                color: 'from-yellow-600 to-yellow-500',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="card p-8 hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 mb-6 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 md:p-16 glow-effect">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Building?
            </h2>
            <p className="text-xl text-slate-400 mb-10">
              Join Vera Protocol today and experience trustless collaboration.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/marketplace" className="btn-primary inline-flex items-center gap-2 group">
                <span>Explore Projects</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="https://github.com/yourusername/vera-protocol" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Code className="w-5 h-5" />
                <span>View Docs</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2 className="w-8 h-8 text-vera-500" />
            <span className="text-2xl font-bold gradient-text">Vera</span>
          </div>
          <p className="text-slate-500">
            Decentralized Project Escrow Platform © 2024
          </p>
        </div>
      </footer>
    </div>
  );
}
