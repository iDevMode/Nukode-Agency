import React from 'react';
import { Code, Twitter, Linkedin, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-nukode-black border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Code className="w-8 h-8 text-white" strokeWidth={3} />
              <span className="text-xl font-sans font-bold tracking-tight text-white">Nukode</span>
            </div>
            <p className="text-nukode-muted max-w-sm mb-6">
              Transforming businesses with ROI-driven AI automation. We build the future of work, today.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-nukode-muted hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-nukode-muted hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="text-nukode-muted hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#about" className="text-sm text-nukode-muted hover:text-white transition-colors">About Us</a></li>
              <li><a href="#services" className="text-sm text-nukode-muted hover:text-white transition-colors">Services</a></li>
              <li><a href="#process" className="text-sm text-nukode-muted hover:text-white transition-colors">Process</a></li>
              <li><a href="#pricing" className="text-sm text-nukode-muted hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-nukode-muted hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-nukode-muted hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-nukode-muted mb-4 md:mb-0">
            © {new Date().getFullYear()} Nukode. All rights reserved.
          </p>
          <p className="text-xs text-nukode-muted">
            Designed for the future.
          </p>
        </div>
      </div>
    </footer>
  );
};