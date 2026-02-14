import { cn } from '../../lib/utils';

const variants: Record<string, string> = {
  cyan: 'bg-shield-cyan/10 text-shield-cyan border-shield-cyan/30',
  green: 'bg-shield-green/10 text-shield-green border-shield-green/30',
  red: 'bg-shield-red/10 text-shield-red border-shield-red/30',
  amber: 'bg-shield-amber/10 text-shield-amber border-shield-amber/30',
  purple: 'bg-shield-purple/10 text-shield-purple border-shield-purple/30',
  default: 'bg-shield-border/50 text-slate-300 border-shield-border',
};

interface BadgeProps {
  variant?: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        variants[variant] || variants.default,
        className,
      )}
    >
      {children}
    </span>
  );
}
