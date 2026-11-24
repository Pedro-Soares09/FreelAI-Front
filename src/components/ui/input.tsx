import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-zinc-300">{label}</label>}
      <input
        className={`px-3 py-2 rounded-lg bg-zinc-900 border text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${
          error ? 'border-red-500 focus:ring-red-500/20' : 'border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
};
