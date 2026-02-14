import { cn } from '../../lib/utils';
import type { ButtonHTMLAttributes } from 'react';

const variants = {
  primary: 'bg-shield-cyan text-black hover:bg-shield-cyan/80 font-medium',
  danger: 'bg-shield-red text-white hover:bg-shield-red/80 font-medium',
  ghost: 'bg-transparent text-slate-300 hover:bg-shield-border/50 border border-shield-border',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
