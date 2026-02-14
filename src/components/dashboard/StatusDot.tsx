import { cn } from '../../lib/utils';

const dotColors = {
  green: 'bg-shield-green',
  red: 'bg-shield-red',
  amber: 'bg-shield-amber',
};

interface StatusDotProps {
  color?: keyof typeof dotColors;
  pulse?: boolean;
  className?: string;
}

export function StatusDot({ color = 'green', pulse = true, className }: StatusDotProps) {
  return (
    <span className={cn('relative flex h-2.5 w-2.5', className)}>
      {pulse && (
        <span
          className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            dotColors[color]
          )}
        />
      )}
      <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', dotColors[color])} />
    </span>
  );
}
