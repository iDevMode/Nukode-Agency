import React from 'react';
import { Code, Twitter, Linkedin, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToSection = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-nukode-black border-t border-white/5 pt-24 pb-12">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-8">
              <Code className="w-8 h-8 text-white" strokeWidth={3} />
              <span className="text-2xl font-sans font-bold tracking-tight text-white">Nukode</span>
            </div>
            <p className="text-nukode-muted max-w-md mb-8 text-lg font-light leading-relaxed">
              Transforming businesses with ROI-driven AI automation. We build the future of work, today.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-nukode-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-nukode-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="text-nukode-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Github className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-8 text-lg">Company</h4>
            <ul className="space-y-5">
              <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-nukode-muted hover:text-white transition-colors">About Us</a></li>
              <li><a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="text-nukode-muted hover:text-white transition-colors">Services</a></li>
              <li><a href="#process" onClick={(e) => scrollToSection(e, 'process')} className="text-nukode-muted hover:text-white transition-colors">Process</a></li>
              <li><a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="text-nukode-muted hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-8 text-lg">Legal</h4>
            <ul className="space-y-5">
              <li><a href="#" className="text-nukode-muted hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-nukode-muted hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-nukode-muted mb-4 md:mb-0">
            © {new Date().getFullYear()} Nukode. All rights reserved.
          </p>
          <p className="text-sm text-nukode-muted">
            Designed for the future.
          </p>
        </div>
      </div>
    </footer>
  );
};