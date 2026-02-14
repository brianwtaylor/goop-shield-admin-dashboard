import { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from 'react';
import type { AuditEvent } from '../api/schemas';

interface WebSocketContextType {
  events: AuditEvent[];
  isConnected: boolean;
  latestEvent: AuditEvent | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  events: [],
  isConnected: false,
  latestEvent: null,
});

const MAX_EVENTS = 200;

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState<AuditEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(() => {
    const shieldUrl = localStorage.getItem('shield_url') || 'http://192.168.4.66:8787';
    const apiKey = localStorage.getItem('shield_api_key');
    let wsUrl = shieldUrl.replace(/^http/, 'ws') + '/api/v1/shield/events/stream';
    if (apiKey) {
      wsUrl += `?token=${encodeURIComponent(apiKey)}`;
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

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
        reconnectRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      reconnectRef.current = setTimeout(connect, 5000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ events, isConnected, latestEvent }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
