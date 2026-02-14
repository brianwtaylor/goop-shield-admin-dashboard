import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { refreshApi } from '../api/client';

interface AuthContextType {
  apiKey: string;
  shieldUrl: string;
  isConfigured: boolean;
  setApiKey: (key: string) => void;
  setShieldUrl: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('shield_api_key') || '');
  const [shieldUrl, setShieldUrlState] = useState(
    () => localStorage.getItem('shield_url') || 'http://192.168.4.66:8787',
  );

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem('shield_api_key', key);
    setApiKeyState(key);
    refreshApi();
  }, []);

  const setShieldUrl = useCallback((url: string) => {
    localStorage.setItem('shield_url', url);
    setShieldUrlState(url);
    refreshApi();
  }, []);

  const isConfigured = shieldUrl.length > 0;

  return (
    <AuthContext.Provider value={{ apiKey, shieldUrl, isConfigured, setApiKey, setShieldUrl }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
