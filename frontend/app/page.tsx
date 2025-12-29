import { ConnectButton } from '@rainbow-me/rainbowkit';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ProjectDashboard } from '@/components/ProjectDashboard';
import { Mic, Shield, Zap, Globe, ArrowRight, CheckCircle, Clock, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-vera-primary/5 via-vera-secondary/5 to-vera-accent/5 rounded-3xl"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-vera-primary/10 to-vera-secondary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-vera-accent/10 to-vera-success/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 mb-8 animate-fade-in">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">Built for HackXios 2k25</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <span className="text-sm text-slate-500">Kiro & Ethereum Tracks</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-8 animate-slide-up">
            <span className="gradient-text">Vera Protocol</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Eliminate freelance fraud with <span className="font-semibold text-vera-primary">AI-powered neutral arbitration</span>. 
            Create projects with voice, get paid automatically with our revolutionary 80/20 variance buffer.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <ConnectButton />
            <div className="flex items-center space-x-3 text-sm text-slate-500 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <Shield className="w-4 h-4 text-vera-success" />
              <span>Secured by Ethereum</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span>Verified by AI</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-scale-in" style={{ animationDelay: '0.6s' }}>
            <div className="card p-8 text-center glow-effect">
              <div className="text-4xl font-bold gradient-text mb-2">95%</div>
              <div className="text-slate-600 font-medium">Automatic Releases</div>
              <div className="text-sm text-slate-500 mt-2">No manual intervention needed</div>
            </div>
            <div className="card p-8 text-center glow-effect">
              <div className="text-4xl font-bold gradient-text mb-2">&lt;24h</div>
              <div className="text-slate-600 font-medium">Dispute Resolution</div>
              <div className="text-sm text-slate-500 mt-2">AI-mediated arbitration</div>
            </div>
            <div className="card p-8 text-center glow-effect">
              <div className="text-4xl font-bold gradient-text mb-2">100%</div>
              <div className="text-slate-600 font-medium">Decentralized</div>
              <div className="text-sm text-slate-500 mt-2">Pure Web3 architecture</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="card-gradient p-8 text-center interactive-hover">
          <div className="w-16 h-16 bg-gradient-to-br from-vera-primary to-vera-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-4 text-slate-900">Voice-First Interface</h3>
          <p className="text-slate-600 leading-relaxed">
            Create projects naturally with voice commands. Our AI converts speech to structured agreements. 
            No coding required - perfect for designers, writers, and entrepreneurs.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-vera-primary font-medium">
            <span>98%+ accuracy</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
        
        <div className="card-gradient p-8 text-center interactive-hover">
          <div className="w-16 h-16 bg-gradient-to-br from-vera-accent to-vera-success rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-4 text-slate-900">80/20 Auto-Release</h3>
          <p className="text-slate-600 leading-relaxed">
            Technical work (80%) releases automatically when verified. Style disputes (20%) held for review. 
            Revolutionary variance buffer eliminates payment disputes.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-vera-accent font-medium">
            <span>Immutable invariant</span>
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        
        <div className="card-gradient p-8 text-center interactive-hover">
          <div className="w-16 h-16 bg-gradient-to-br from-vera-success to-vera-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Globe className="w-8 h-8 text-white" />
          </div>
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