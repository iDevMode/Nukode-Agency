import React from 'react';
import { Button } from './Button';
import { Sparkles, FileText, TrendingUp } from 'lucide-react';

export const AiConsultant: React.FC = () => {
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
              Get Your Free <br />
              <span className="italic">AI Automation Audit</span>
            </h2>
            <p className="text-nukode-muted text-lg mb-8 font-light">
              Discover exactly where AI can transform your business. Our comprehensive audit identifies automation opportunities, estimates ROI, and creates a custom implementation roadmap tailored to your unique challenges.
            </p>

            <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
              <h4 className="text-white font-medium mb-2">Why Nukode?</h4>
              <p className="text-sm text-nukode-muted">
                Most agencies just "add AI" to everything. We build targeted agents that reduce overhead costs by 40-60% within the first quarter.
              </p>
            </div>
          </div>

          {/* Right Column: CTA Card */}
          <div className="bg-nukode-card border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-full mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-serif text-white italic">
                Ready to Unlock Your Business Potential?
              </h3>

              <p className="text-nukode-muted leading-relaxed">
                Answer a few quick questions about your business, and we'll generate a personalized AI automation audit showing you exactly how to save time and reduce costs.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3 text-left">
                  <div className="mt-1">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm mb-1">Detailed ROI Analysis</h4>
                    <p className="text-nukode-muted text-sm">See projected savings and implementation timelines</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <div className="mt-1">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm mb-1">Custom Strategy</h4>
                    <p className="text-nukode-muted text-sm">Get a tailored automation roadmap for your business</p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                onClick={() => window.open('https://form.typeform.com/to/BYcoTN6c', '_blank')}
              >
                Start Your Free Audit
              </Button>

              <p className="text-xs text-nukode-muted">
                Takes less than 2 minutes • No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};