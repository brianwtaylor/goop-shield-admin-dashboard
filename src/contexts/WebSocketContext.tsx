import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import type { AuditEvent } from '../api/schemas';

// ── Connection context (isConnected only) ─────────────────────────
interface WebSocketConnectionContextType {
  isConnected: boolean;
}

const WebSocketConnectionContext = createContext<WebSocketConnectionContextType>({
  isConnected: false,
});

// ── Events context (events + latestEvent) ─────────────────────────
interface WebSocketEventsContextType {
  events: AuditEvent[];
  latestEvent: AuditEvent | null;
}

const WebSocketEventsContext = createContext<WebSocketEventsContextType>({
  events: [],
  latestEvent: null,
});

const MAX_EVENTS = 200;

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState<AuditEvent | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      const shieldUrl = localStorage.getItem('shield_url') || 'http://192.168.4.66:8787';
      const apiKey = localStorage.getItem('shield_api_key');
      let wsUrl = shieldUrl.replace(/^http/, 'ws') + '/api/v1/shield/events/stream';
      if (apiKey) {
        wsUrl += `?token=${encodeURIComponent(apiKey)}`;
      }

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => setIsConnected(true);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as AuditEvent;
            setLatestEvent(data);
            setEvents((prev) => {
              const next = [data, ...prev];
              return next.slice(0, MAX_EVENTS);
            });
          } catch {
            // ignore parse errors
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimer = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
        reconnectTimer = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      ws?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  const connectionValue = useMemo(() => ({ isConnected }), [isConnected]);
  const eventsValue = useMemo(() => ({ events, latestEvent }), [events, latestEvent]);

  return (
    <WebSocketConnectionContext.Provider value={connectionValue}>
      <WebSocketEventsContext.Provider value={eventsValue}>
        {children}
      </WebSocketEventsContext.Provider>
    </WebSocketConnectionContext.Provider>
  );
}

/** Subscribe to connection status only — no re-renders on new events */
export function useWebSocketConnection() {
  return useContext(WebSocketConnectionContext);
}

/** Subscribe to events + latestEvent (re-renders on every WS message) */
export function useWebSocketEvents() {
  return useContext(WebSocketEventsContext);
}

/** Subscribe to both connection + events (legacy compat) */
export function useWebSocket() {
  const { isConnected } = useContext(WebSocketConnectionContext);
  const { events, latestEvent } = useContext(WebSocketEventsContext);
  return { isConnected, events, latestEvent };
}
