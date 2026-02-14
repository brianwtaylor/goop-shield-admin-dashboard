import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { JsonTree } from '../../components/ui/JsonTree';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../hooks/useConfig';
import { getHealth } from '../../api/endpoints';

export function SettingsPage() {
  const { apiKey, shieldUrl, setApiKey, setShieldUrl } = useAuth();
  const { data: config, isLoading: configLoading } = useConfig();
  const [testResult, setTestResult] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [urlInput, setUrlInput] = useState(shieldUrl);
  const [keyInput, setKeyInput] = useState(apiKey);

  const handleSave = () => {
    setShieldUrl(urlInput);
    setApiKey(keyInput);
    setTestResult('idle');
  };

  const handleTest = async () => {
    setTestResult('loading');
    try {
      await getHealth();
      setTestResult('success');
    } catch {
      setTestResult('error');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* API Configuration */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-4">API Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Shield URL</label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-shield-bg border border-shield-border rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-shield-cyan"
              placeholder="http://192.168.4.66:8787"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-wider mb-1">API Key</label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full bg-shield-bg border border-shield-border rounded-lg px-3 py-2 text-sm text-slate-300 font-mono focus:outline-none focus:border-shield-cyan"
              placeholder="Enter API key..."
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave}>Save Configuration</Button>
            <Button variant="ghost" onClick={handleTest}>
              {testResult === 'loading' && <Loader2 size={14} className="animate-spin mr-2" />}
              Test Connection
            </Button>
          </div>

          {/* Test Result */}
          {testResult === 'success' && (
            <div className="flex items-center gap-2 text-shield-green text-sm">
              <CheckCircle size={16} />
              <span>Connection successful</span>
            </div>
          )}
          {testResult === 'error' && (
            <div className="flex items-center gap-2 text-shield-red text-sm">
              <XCircle size={16} />
              <span>Connection failed. Check URL and API key.</span>
            </div>
          )}
        </div>
      </Card>

      {/* Config Viewer */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-4">Shield Configuration</h3>
        {configLoading ? (
          <div className="text-slate-500 text-sm">Loading configuration...</div>
        ) : config ? (
          <div className="bg-shield-bg rounded-lg p-4 max-h-96 overflow-y-auto">
            <JsonTree data={config} />
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Could not load configuration. Verify connection settings.</p>
        )}
      </Card>
    </div>
  );
}
