import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-green text-xs transition-all ${className}`}
      {...props}
    />
  );
};
