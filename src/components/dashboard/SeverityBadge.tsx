import { Badge } from '../ui/Badge';

const riskVariants: Record<string, 'red' | 'amber' | 'cyan' | 'green' | 'default'> = {
  critical: 'red',
  high: 'amber',
  medium: 'cyan',
  low: 'green',
};

interface SeverityBadgeProps {
  level: string;
}

export function SeverityBadge({ level }: SeverityBadgeProps) {
  return (
    <Badge variant={riskVariants[level.toLowerCase()] || 'default'}>
      {level}
    </Badge>
  );
}
