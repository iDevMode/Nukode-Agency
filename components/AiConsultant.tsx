import React, { useState } from 'react';
import { analyzeBusinessROI } from '../services/gemini';
import { ROIAnalysis, BotStatus } from '../types';
import { Button } from './Button';
import { Sparkles, Loader2, DollarSign, Briefcase } from 'lucide-react';

export const AiConsultant: React.FC = () => {
  const [businessType, setBusinessType] = useState('');
  const [bottleneck, setBottleneck] = useState('');
  const [status, setStatus] = useState<BotStatus>(BotStatus.IDLE);
  const [analysis, setAnalysis] = useState<ROIAnalysis | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType || !bottleneck) return;

    setStatus(BotStatus.THINKING);
    try {
      const result = await analyzeBusinessROI(businessType, bottleneck);
      setAnalysis(result);
      setStatus(BotStatus.COMPLETED);
    } catch (error) {
      console.error(error);
      setStatus(BotStatus.ERROR);
    }
  };

  return (
    <section id="consultant" className="py-24 bg-gradient-to-b from-nukode-black to-nukode-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.02] blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Context */}
          <div>
            <div className="inline-flex items-center gap-2 text-white border border-white/20 px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wider uppercase">AI Powered Analysis</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Estimate Your <br />
              <span className="italic">Automation ROI</span>
            </h2>
            <p className="text-nukode-muted text-lg mb-8 font-light">
              Unsure where to start? Tell our AI consultant about your business, and we'll generate a custom automation strategy tailored to your specific bottlenecks instantly.
            </p>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <h4 className="text-white font-medium mb-2">Why Nukode?</h4>
              <p className="text-sm text-nukode-muted">
                Most agencies just "add AI" to everything. We build targeted agents that reduce overhead costs by 40-60% within the first quarter.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Form/Result */}
          <div className="bg-nukode-card border border-white/10 rounded-2xl p-8 shadow-2xl">
            
            {status === BotStatus.IDLE || status === BotStatus.THINKING || status === BotStatus.ERROR ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">What is your business type?</label>
                  <input 
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. Real Estate Agency, E-commerce Store, Law Firm"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">What is your biggest manual bottleneck?</label>
                  <textarea 
                    value={bottleneck}
                    onChange={(e) => setBottleneck(e.target.value)}
                    placeholder="e.g. Answering repetitive customer emails, manually entering data into CRM, scheduling appointments"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors h-32 resize-none"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={status === BotStatus.THINKING}
                >
                  {status === BotStatus.THINKING ? (
                    <span className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Analyzing...
                    </span>
                  ) : (
                    "Generate Strategy"
                  )}
                </Button>

                {status === BotStatus.ERROR && (
                  <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>
                )}
              </form>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif text-white italic">Your Custom Strategy</h3>
                  <button 
                    onClick={() => setStatus(BotStatus.IDLE)} 
                    className="text-xs text-nukode-muted hover:text-white underline"
                  >
                    Start Over
                  </button>
                </div>

                {analysis && (
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Briefcase className="w-5 h-5 text-white" />
                        <span className="text-sm font-bold text-nukode-muted uppercase tracking-wide">Recommended Workflow</span>
                      </div>
                      <p className="text-lg text-white font-medium">{analysis.strategy}</p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-5 h-5 text-white" />
                        <span className="text-sm font-bold text-nukode-muted uppercase tracking-wide">Implementation Plan</span>
                      </div>
                      <p className="text-sm text-nukode-muted leading-relaxed">{analysis.implementation}</p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="text-sm font-bold text-green-400 uppercase tracking-wide">Projected Impact</span>
                      </div>
                      <p className="text-xl font-bold text-white">{analysis.savings}</p>
                    </div>

                    <Button className="w-full mt-4" onClick={() => window.location.href = "mailto:founder@nukode.agency"}>
                      Discuss This Implementation
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};