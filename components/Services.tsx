import React from 'react';
import { Bot, Workflow, BarChart3, Database } from 'lucide-react';

export const Services: React.FC = () => {
  const services = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Intelligent Chatbots",
      description: "Custom-trained LLMs that handle customer support, internal queries, and lead qualification 24/7 with human-like accuracy."
    },
    {
      icon: <Workflow className="w-8 h-8" />,
      title: "Agentic Workflows",
      description: "Autonomous agents that can browse the web, scrape data, draft emails, and execute complex sequences without supervision."
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Process Automation",
      description: "Connect your disparate software stack (CRM, Email, Slack). We remove the manual glue holding your operations together."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "ROI-First Strategy",
      description: "We audit your business to find the highest leverage points. If an automation doesn't pay for itself, we don't build it."
    }
  ];

  return (
    <section id="services" className="py-24 bg-nukode-black relative">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
            We're a Full-Service <br />
            <span className="italic text-nukode-muted">AI Automation Agency</span>
          </h2>
          <p className="text-nukode-muted max-w-2xl text-lg font-light">
            Specializing in transforming how businesses operate through smart, scalable, and efficient solutions. Our mission is simple: eliminate repetitive tasks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group glass-card p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-white/20"
            >
              <div className="mb-6 p-4 bg-white/5 rounded-xl inline-block text-white group-hover:bg-white group-hover:text-black transition-colors duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-medium text-white mb-4">{service.title}</h3>
              <p className="text-nukode-muted text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};