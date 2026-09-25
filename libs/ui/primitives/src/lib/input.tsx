import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="text-slate-300 font-medium block mb-1 text-xs">{label}</label>
        )}
        <input
          ref={ref}
          {...props}
          className={`
            w-full bg-slate-950 border border-slate-800 
            rounded-lg p-2.5 text-white placeholder-slate-600 
            focus:outline-none focus:border-blue-500 
            transition-colors text-xs
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';