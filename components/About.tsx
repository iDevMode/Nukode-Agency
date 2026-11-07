import React from 'react';
import { MessageSquare, Ruler, LineChart } from 'lucide-react';

// To add a photo: put it in /public (e.g. /public/phil.jpg) and set FOUNDER_PHOTO = '/phil.jpg'.
// To add LinkedIn: set FOUNDER_LINKEDIN to your profile URL.
const FOUNDER_PHOTO = '/phil.jpg';
const FOUNDER_LINKEDIN = 'https://www.linkedin.com/in/phillipshields87/';

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
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-8 text-center">
              {FOUNDER_PHOTO ? (
                <img
                  src={FOUNDER_PHOTO}
                  alt="Phil Shields, founder of Nukode"
                  className="w-28 h-28 rounded-full object-cover mx-auto mb-6 border border-white/10"
                />
              ) : (
                <div className="w-28 h-28 rounded-full mx-auto mb-6 bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-serif text-white">
                  PS
                </div>
              )}
              <h3 className="text-xl font-medium text-white">Phil Shields</h3>
              <p className="text-sm text-nukode-muted mt-1">Founder, Nukode</p>
              {FOUNDER_LINKEDIN && (
                <a
                  href={FOUNDER_LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm text-white underline underline-offset-4 hover:text-nukode-muted"
                >
                  Connect on LinkedIn
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-nukode-muted">About Nukode</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mt-4 mb-6">
              Who you'll <span className="italic">work with</span>
            </h2>
            <p className="text-nukode-muted text-lg font-light leading-relaxed mb-10">
              Nukode is a UK automation studio run by Phil Shields. You deal directly with the person who
              designs and builds your automations, from the first call to ongoing support, using tools such as
              n8n, Airtable, OpenAI, Claude and ElevenLabs.
            </p>

            <div className="space-y-6">
              {principles.map((p) => (
                <div key={p.title} className="flex gap-4">
                  <div className="mt-1 p-2 bg-white/5 rounded-lg text-white h-fit">{p.icon}</div>
                  <div>
                    <h4 className="text-white font-medium mb-1">{p.title}</h4>
                    <p className="text-sm text-nukode-muted leading-relaxed">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
