'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
}

export function Button({
  loading,
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white',
    ghost: 'bg-transparent hover:bg-slate-800 text-slate-300',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        w-full font-medium p-2.5 rounded-lg 
        flex items-center justify-center gap-2 
        transition-colors disabled:opacity-50 text-xs
        ${variants[variant]}
        ${className}
      `}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}