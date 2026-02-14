import { memo } from 'react';
import { Card } from '../ui/Card';
import { AnimatedNumber } from './AnimatedNumber';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  format?: (n: number) => string;
  color?: string;
}

export const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
  format,
  color = '#06b6d4',
}: StatCardProps) {
  return (
    <Card hover className="flex items-center gap-4">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg"
        style={{ backgroundColor: color + '15' }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white">
          <AnimatedNumber value={value} format={format} />
        </p>
      </div>
    </Card>
  );
});
