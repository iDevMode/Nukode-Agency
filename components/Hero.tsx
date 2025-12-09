import React from 'react';
import { Button } from './Button';
import { ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section id="about" className="relative min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden">
      {/* Abstract Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        
        <div className="max-w-4xl flex flex-col items-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium tracking-wide text-nukode-muted uppercase">Accepting New Clients</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif text-white leading-[1.1]">
            Build Systems, <br />
            <span className="italic text-nukode-muted">Not Hype.</span>
          </h1>
          
          <p className="text-lg text-nukode-muted max-w-lg font-light leading-relaxed mx-auto">
            Nukode builds agentic workflows and chatbots that solve real business problems. We focus on measurable ROI, replacing manual drudgery with intelligent automation.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => document.getElementById('consultant')?.scrollIntoView({ behavior: 'smooth' })}>
              Calculate Your ROI
            </Button>
            <Button variant="outline" showArrow={false} onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}>
              How It Works
            </Button>
          </div>

          <div className="pt-8 border-t border-white/10 w-full max-w-xl">
            <p className="text-sm text-nukode-muted mb-4">Trusted by innovative founders</p>
            <div className="flex gap-8 justify-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Placeholders for logos */}
               <div className="font-bold text-lg font-serif">IPSUM</div>
               <div className="font-bold text-lg font-sans tracking-tighter">LOGIA</div>
               <div className="font-bold text-lg font-mono">VORTEX</div>
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