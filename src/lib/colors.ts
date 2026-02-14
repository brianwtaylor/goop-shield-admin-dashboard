export const shieldColors = {
  bg: '#0a0e17',
  surface: '#111827',
  border: '#1e293b',
  cyan: '#06b6d4',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  purple: '#8b5cf6',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
} as const;

export const actionColors: Record<string, string> = {
  allow: shieldColors.green,
  block: shieldColors.red,
  sanitize: shieldColors.amber,
  monitor: shieldColors.cyan,
};

export const riskColors: Record<string, string> = {
  critical: shieldColors.red,
  high: shieldColors.amber,
  medium: shieldColors.cyan,
  low: shieldColors.green,
};

export const chartColorScale = [
  shieldColors.cyan,
  shieldColors.green,
  shieldColors.amber,
  shieldColors.red,
  shieldColors.purple,
  '#3b82f6',
  '#ec4899',
  '#14b8a6',
];
