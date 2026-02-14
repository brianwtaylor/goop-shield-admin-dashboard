import { Component, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { router } from './router';

/**
 * Datadog-style query defaults:
 * - staleTime 30s: data is "fresh" for 30s even if refetchInterval fires,
 *   preventing cascading re-renders when nothing changed.
 * - gcTime 5min: keep old data in cache for instant back-navigation.
 * - refetchOnWindowFocus false: don't thrash on tab switch.
 * - structuralSharing: TanStack's default deep-compare avoids re-renders
 *   when the server returns identical data.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Error Boundary ────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-shield-bg">
          <div className="text-center space-y-4 max-w-md px-6">
            <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
            <p className="text-sm text-slate-400">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-shield-cyan/20 text-shield-cyan rounded-lg hover:bg-shield-cyan/30 transition-colors text-sm"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── App ───────────────────────────────────────────────────────────

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <RouterProvider router={router} />
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
