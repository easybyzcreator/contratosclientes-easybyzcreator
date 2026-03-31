import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ children, className = '', ...props }) => {
  return (
    <label 
      className={`block text-[9px] font-bold uppercase text-white/40 mb-1 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};
