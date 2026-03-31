import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50";
  
  const variants = {
    primary: "bg-brand-green text-brand-dark hover:brightness-110 shadow-lg shadow-brand-green/20",
    secondary: "bg-brand-blue text-white hover:brightness-110 shadow-lg shadow-brand-blue/20",
    outline: "border border-white/10 text-white hover:bg-white/5",
    ghost: "text-white/50 hover:bg-white/5 hover:text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px]",
    md: "px-6 py-3 text-xs",
    lg: "px-8 py-4 text-sm"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
