import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  showArrow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  showArrow = true, 
  className = '',
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-all duration-300 rounded-lg group";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]",
    secondary: "bg-nukode-card text-white border border-nukode-border hover:border-white/40",
    outline: "border border-white/20 text-white hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {showArrow && (
        <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
      )}
    </button>
  );
};