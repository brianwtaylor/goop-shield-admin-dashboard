import { lazy, Suspense } from 'react';
import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Skeleton } from './components/ui/Skeleton';

const CommandCenter = lazy(() =>
  import('./pages/command-center/CommandCenter').then((m) => ({ default: m.CommandCenter })),
);
const DefenseMatrix = lazy(() =>
  import('./pages/defense-matrix/DefenseMatrix').then((m) => ({ default: m.DefenseMatrix })),
);
const ThreatIntel = lazy(() =>
  import('./pages/threat-intel/ThreatIntel').then((m) => ({ default: m.ThreatIntel })),
);
const AuditLog = lazy(() =>
  import('./pages/audit-log/AuditLog').then((m) => ({ default: m.AuditLog })),
);
const RedTeam = lazy(() =>
  import('./pages/red-team/RedTeam').then((m) => ({ default: m.RedTeam })),
);
const AgentProtection = lazy(() =>
  import('./pages/agent-protection/AgentProtection').then((m) => ({ default: m.AgentProtection })),
);
const BroRLExplorer = lazy(() =>
  import('./pages/brorl/BroRLExplorer').then((m) => ({ default: m.BroRLExplorer })),
);
const SettingsPage = lazy(() =>
  import('./pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

function PageFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24" />
      <Skeleton className="h-64" />
    </div>
  );
}

function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Component />
    </Suspense>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <p className="text-4xl font-bold text-slate-300 mb-2">404</p>
      <p className="text-sm">Page not found</p>
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <LazyPage Component={CommandCenter} />,
});

const defenseMatrixRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/defense-matrix',
  component: () => <LazyPage Component={DefenseMatrix} />,
});

const threatIntelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/threat-intel',
  component: () => <LazyPage Component={ThreatIntel} />,
});

const auditLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/audit-log',
  component: () => <LazyPage Component={AuditLog} />,
});

const redTeamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/red-team',
  component: () => <LazyPage Component={RedTeam} />,
});

const agentProtectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent-protection',
  component: () => <LazyPage Component={AgentProtection} />,
});

const brorlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/brorl',
  component: () => <LazyPage Component={BroRLExplorer} />,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => <LazyPage Component={SettingsPage} />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  defenseMatrixRoute,
  threatIntelRoute,
  auditLogRoute,
  redTeamRoute,
  agentProtectionRoute,
  brorlRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
