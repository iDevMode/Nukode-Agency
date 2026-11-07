import React from 'react';
import { MessageSquare, Ruler, LineChart, Linkedin } from 'lucide-react';

const principles = [
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: 'Plain English, no hype',
    text: 'We explain what an automation will do, what it costs and what it saves before anything is built.',
  },
  {
    icon: <Ruler className="w-5 h-5" />,
    title: 'Agreed scope up front',
    text: 'Every project starts with a written scope and a transparent cost breakdown, so there are no surprises.',
  },
  {
    icon: <LineChart className="w-5 h-5" />,
    title: 'Measured results',
    text: 'We record how long a task takes before we automate it and check again after, so you can see the return.',
  },
];

export const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-nukode-black">
      <div className="max-w-5xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-semibold tracking-wider uppercase text-nukode-muted">About Nukode</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white mt-4 mb-6">
            Who you'll <span className="italic">work with</span>
          </h2>
          <p className="text-nukode-muted text-lg font-light leading-relaxed">
            Nukode is a UK automation studio. You deal directly with the person who designs and builds your
            automations, from the first call to ongoing support, using tools such as n8n, Airtable, OpenAI, Claude
            and ElevenLabs.
          </p>
          <a
            href="https://www.linkedin.com/in/phillipshields87/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 text-sm text-white underline underline-offset-4 hover:text-nukode-muted"
          >
            <Linkedin className="w-4 h-4" /> Connect on LinkedIn
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {principles.map((p) => (
            <div key={p.title} className="glass-card rounded-2xl p-6">
              <div className="p-2 bg-white/5 rounded-lg text-white inline-block mb-4">{p.icon}</div>
              <h4 className="text-white font-medium mb-2">{p.title}</h4>
              <p className="text-sm text-nukode-muted leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
