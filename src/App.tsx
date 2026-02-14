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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <RouterProvider router={router} />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
