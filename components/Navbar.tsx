import React, { useState, useEffect } from 'react';
import { Menu, X, Code } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'About', href: 'about' },
    { name: 'Services', href: 'services' },
    { name: 'Process', href: 'process' },
    { name: 'Pricing', href: 'pricing' },
    { name: 'Contact', href: 'consultant' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-nukode-black/80 backdrop-blur-md border-nukode-border py-5' 
          : 'bg-transparent border-transparent py-8'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Code className="w-8 h-8 text-white" strokeWidth={2.5} />
          <span className="text-2xl font-sans font-bold tracking-tight text-white">Nukode</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-14">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={`#${link.href}`}
              onClick={(e) => scrollToSection(e, link.href)}
              className="text-base font-medium tracking-wide text-nukode-muted hover:text-white transition-colors cursor-pointer"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <button 
            onClick={(e) => scrollToSection(e, 'consultant')}
            className="text-xs font-bold tracking-[0.15em] border border-white/20 px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all uppercase"
          >
            Get ROI Analysis
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-nukode-black border-b border-nukode-border p-6 flex flex-col gap-8 shadow-2xl">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={`#${link.href}`}
              className="text-xl font-medium text-nukode-muted hover:text-white cursor-pointer"
              onClick={(e) => scrollToSection(e, link.href)}
            >
              {link.name}
            </a>
          ))}
          <button 
            onClick={(e) => scrollToSection(e, 'consultant')} 
            className="text-white font-bold text-lg mt-2 text-left"
          >
            Get ROI Analysis
          </button>
        </div>
      )}
    </nav>
  );
};