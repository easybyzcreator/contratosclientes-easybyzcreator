import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
  return (
    <textarea 
      className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white/70 outline-none focus:border-brand-green resize-none custom-scrollbar transition-all ${className}`}
      {...props}
    />
  );
};
