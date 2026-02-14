import { cn } from '../../lib/utils';

interface CodeBlockProps {
  children: string;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  return (
    <pre
      className={cn(
        'bg-shield-bg border border-shield-border rounded-lg p-4 overflow-auto font-mono text-sm text-slate-300',
        className
      )}
    >
      <code>{children}</code>
    </pre>
  );
}
