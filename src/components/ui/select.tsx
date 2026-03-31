import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ children, className = '', ...props }) => {
  return (
    <select 
      className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand-green text-xs transition-all appearance-none ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};
