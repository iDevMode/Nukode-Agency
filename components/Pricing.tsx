import React from 'react';
import { Check } from 'lucide-react';
import { Button } from './Button';

export const Pricing: React.FC = () => {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for small teams getting started with AI automation.",
      price: "£1,990",
      period: "/setup",
      features: [
        "1 AI Chatbot or Workflow",
        "500 automated interactions/mo",
        "Basic Lead Capture",
        "Email Support",
        "Standard Integration"
      ]
    },
    {
      name: "Growth",
      description: "Ideal for growing businesses scaling their operations.",
      price: "£4,990",
      period: "/setup",
      popular: true,
      features: [
        "Up to 3 AI Workflows",
        "5,000 automated interactions/mo",
        "Lead Scoring + Nurturing",
        "Advanced CRM Integration",
        "Priority Slack Channel"
      ]
    },
    {
      name: "Enterprise",
      description: "For large teams with advanced custom model needs.",
      price: "Custom",
      period: "",
      features: [
        "Unlimited Workflows",
        "Unlimited Interactions",
        "Custom Model Fine-Tuning",
        "Dedicated Account Manager",
        "Onboarding & Strategy Sessions"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-nukode-black">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-widest text-nukode-muted uppercase mb-4 block">Pricing Plan</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Investment, <span className="italic">Not Cost</span>
          </h2>
          <p className="text-nukode-muted max-w-2xl mx-auto">
            We structure our pricing to ensure you see a return on investment within the first 90 days.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 xl:gap-12">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col ${
                plan.popular 
                  ? 'bg-white/5 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.05)]' 
                  : 'bg-nukode-card border-white/5 hover:border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-medium text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-nukode-muted h-10">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-serif text-white">{plan.price}</span>
                <span className="text-nukode-muted">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm text-nukode-muted">
                    <Check className="w-5 h-5 text-white mr-3 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.popular ? 'primary' : 'secondary'} 
                className="w-full"
                onClick={() => document.getElementById('consultant')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};