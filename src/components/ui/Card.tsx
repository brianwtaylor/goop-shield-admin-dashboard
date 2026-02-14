import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  const classes = cn(
    'bg-shield-surface/80 backdrop-blur-sm border border-shield-border rounded-xl p-4',
    className,
  );

  if (hover) {
    return (
      <motion.div
        className={classes}
        whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(6, 182, 212, 0.1)' }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 25 }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={classes}>{children}</div>;
}
