import React from 'react';
import { Button } from './Button';
import { ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section id="about" className="relative min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden">
      {/* Abstract Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-screen-2xl w-full mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center text-center">
        
        <div className="max-w-5xl mx-auto flex flex-col items-center space-y-10">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-widest text-nukode-muted uppercase">Accepting New Clients</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-serif text-white leading-[1.1] tracking-tighter">
            Build Systems, <br />
            <span className="italic text-nukode-muted border border-[#3b82f6] px-6 py-1 mt-4 inline-block">Not Hype.</span>
          </h1>
          
          <p className="text-xl text-nukode-muted max-w-2xl font-light leading-relaxed mx-auto mt-6">
            Nukode builds agentic workflows and chatbots that solve real business problems. We focus on measurable ROI, <span className="text-white font-medium">replacing</span> <span className="line-through decoration-[#3b82f6] decoration-2 text-white/60">manual drudgery</span> with intelligent automation.
          </p>

          <div className="flex flex-wrap gap-5 justify-center mt-4">
            <Button onClick={() => document.getElementById('consultant')?.scrollIntoView({ behavior: 'smooth' })}>
              Calculate Your ROI
            </Button>
            <Button variant="outline" showArrow={false} onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}>
              How It Works
            </Button>
          </div>

          <div className="pt-16 border-t border-white/5 w-full max-w-5xl">
            <p className="text-xs font-semibold text-nukode-muted mb-10 tracking-[0.2em] uppercase opacity-50">Powered by best-in-class technology</p>
            
            <div className="flex flex-wrap gap-x-12 gap-y-8 md:gap-x-20 justify-center items-center">
              
              {/* OpenAI - Clean Sans */}
              <div className="group opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-default">
                <span className="text-white font-sans text-xl md:text-2xl font-semibold tracking-wide">OpenAI</span>
              </div>

              {/* Claude - Elegant Serif (Garamond style) */}
              <div className="group opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-default">
                <span className="text-white text-2xl md:text-3xl font-medium tracking-tight" style={{ fontFamily: 'Garamond, Georgia, "Times New Roman", serif' }}>Claude</span>
              </div>

              {/* n8n - Technical Mono/Sans feel */}
              <div className="group opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-default">
                <span className="text-white font-mono text-2xl md:text-3xl font-bold tracking-tighter">n8n</span>
              </div>

              {/* IIElevenLabs - Bold, balanced size for length */}
              <div className="group opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-default">
                <span className="text-white font-sans text-xl md:text-2xl font-bold tracking-tight">IIElevenLabs</span>
              </div>

              {/* GoHighLevel - Bold, balanced size for length */}
              <div className="group opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-default">
                <span className="text-white font-sans text-xl md:text-2xl font-bold tracking-tight">GoHighLevel</span>
              </div>

            </div>
          </div>
        </div>

      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50 hidden md:block">
        <ArrowDown className="w-6 h-6 text-white" />
      </div>
    </section>
  );
};