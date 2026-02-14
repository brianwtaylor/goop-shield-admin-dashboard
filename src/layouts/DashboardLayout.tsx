import { Link, useRouterState } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Shield,
  Globe,
  FileText,
  Target,
  Bot,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { StatusDot } from '../components/dashboard/StatusDot';
import { useHealth } from '../hooks/useHealth';
import { useWebSocketConnection } from '../contexts/WebSocketContext';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Shield,
  Globe,
  FileText,
  Target,
  Bot,
  TrendingUp,
  Settings,
};

const navItems = [
  { path: '/', label: 'Command Center', icon: 'LayoutDashboard' },
  { path: '/defense-matrix', label: 'Defense Matrix', icon: 'Shield' },
  { path: '/threat-intel', label: 'Threat Intelligence', icon: 'Globe' },
  { path: '/audit-log', label: 'Audit Log', icon: 'FileText' },
  { path: '/red-team', label: 'Red Team', icon: 'Target' },
  { path: '/agent-protection', label: 'Agent Protection', icon: 'Bot' },
  { path: '/brorl', label: 'BroRL Explorer', icon: 'TrendingUp' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
] as const;

export function DashboardLayout({ children }: { children: ReactNode }) {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const { data: health } = useHealth();
  const { isConnected } = useWebSocketConnection();

  return (
    <div className="flex h-screen overflow-hidden bg-shield-bg">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-shield-surface/60 backdrop-blur-sm border-r border-shield-border flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-shield-border">
          <Shield className="text-shield-cyan" size={28} />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">GOOP SHIELD</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Admin Dashboard</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const active = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-5 py-2.5 mx-2 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? 'text-shield-cyan bg-shield-cyan/10 border-l-2 border-shield-cyan shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-shield-border/30 border-l-2 border-transparent'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status footer */}
        <div className="px-5 py-3 border-t border-shield-border">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <StatusDot color={health ? 'green' : 'red'} />
            <span>{health ? `v${health.version}` : 'Disconnected'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-shield-border bg-shield-surface/40 backdrop-blur-sm">
          <div className="text-sm text-slate-400">
            {navItems.find((n) => n.path === currentPath)?.label || 'Dashboard'}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <StatusDot color={isConnected ? 'green' : 'red'} pulse={isConnected} />
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </div>
            {health && (
              <div className="text-xs text-slate-500">{health.defenses_active} defenses active</div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 grid-pattern">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentPath}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.1 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
