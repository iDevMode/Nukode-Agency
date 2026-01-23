import React from 'react';
import { MessageSquare, Zap, Users } from 'lucide-react';
import { Button } from './Button';

export const Pricing: React.FC = () => {
  const benefits = [
    {
      icon: Zap,
      name: "Custom Pricing",
      description: "Tailored solutions designed for your exact requirements.",
      popular: true,
      features: [
        "Bespoke solution architecture",
        "Detailed scope and deliverables",
        "Transparent cost breakdown",
        "Flexible payment options",
        "ROI-focused investment"
      ],
      buttonText: "Enquire Now",
      buttonAction: () => window.open('https://form.typeform.com/to/BYcoTN6c', '_blank')
    },
    {
      icon: MessageSquare,
      name: "Free Consultation",
      description: "No-obligation discussion of your automation needs.",
      features: [
        "Understand your business challenges",
        "Identify automation opportunities",
        "Explore potential solutions",
        "No pressure, no commitment",
        "Expert guidance from day one"
      ],
      buttonText: "Book a Call",
      buttonAction: () => window.open('https://calendly.com/phil-shields92', '_blank')
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-nukode-black">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-widest text-nukode-muted uppercase mb-4 block">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Every Business is <span className="italic">Unique</span>
          </h2>
          <p className="text-nukode-muted max-w-2xl mx-auto">
            That's why we don't do one-size-fits-all pricing. Let's discuss your specific needs and create a solution that delivers real ROI.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 xl:gap-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col ${
                benefit.popular
                  ? 'bg-white/5 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.05)]'
                  : 'bg-nukode-card border-white/5 hover:border-white/10'
              }`}
            >
              {benefit.popular && (
                <div className="absolute top-4 right-4 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Our Approach
                </div>
              )}

              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">{benefit.name}</h3>
                <p className="text-nukode-muted leading-relaxed">{benefit.description}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {benefit.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-nukode-muted leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-white mr-3 mt-2.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={benefit.popular ? 'primary' : 'secondary'}
                className="w-full"
                onClick={benefit.buttonAction}
              >
                {benefit.buttonText}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-nukode-muted mt-8">
          No commitment required • Response within 24 hours
        </p>
      </div>
    </section>
  );
};
