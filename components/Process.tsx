import React from 'react';

export const Process: React.FC = () => {
  const steps = [
    {
      number: "001",
      title: "Discovery & Audit",
      description: "We dive deep into your current processes to identify bottlenecks and high-value automation opportunities."
    },
    {
      number: "002",
      title: "Custom Implementation",
      description: "We design, build, and deploy agentic workflows tailored specifically to your business needs and tech stack."
    },
    {
      number: "003",
      title: "Optimization & Support",
      description: "We don't just ship and leave. We monitor performance, iterate on the AI models, and scale as you grow."
    }
  ];

  return (
    <section id="process" className="py-24 bg-nukode-dark border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-sm font-semibold tracking-widest text-white uppercase mb-4 block">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white">
            From Idea to <br />
            <span className="italic font-serif">Automation in 3 Steps</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative p-10 bg-nukode-card rounded-lg border border-white/5 group hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="absolute top-6 right-6 text-6xl font-serif text-white/5 group-hover:text-white/10 transition-colors">
                {step.number}
              </div>
              <h3 className="text-2xl font-serif italic text-white mb-6 relative z-10">{step.title}</h3>
              <p className="text-nukode-muted relative z-10 leading-relaxed">
                {step.description}
              </p>
              
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};