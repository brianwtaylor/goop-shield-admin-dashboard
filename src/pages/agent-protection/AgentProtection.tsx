import { useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { SeverityBadge } from '../../components/dashboard/SeverityBadge';
import { AreaChart } from '../../components/charts/AreaChart';
import { useDefenseStats } from '../../hooks/useDefenseStats';
import { useDrift } from '../../hooks/useDrift';
import { useSupplyChain } from '../../hooks/useSupplyChain';
import { shieldColors } from '../../lib/colors';

// Actual defense names as registered in the Shield API
const AGENT_DEFENSES = [
  { key: 'indirect_injection', label: 'Tool Output Firewall' },
  { key: 'memory_write_guard', label: 'Memory Write Guard' },
  { key: 'social_engineering', label: 'Social Engineering' },
  { key: 'sub_agent_guard', label: 'Sub-Agent Guard' },
];

export function AgentProtection() {
  const { data: stats, isLoading: statsLoading } = useDefenseStats();
  const { data: drift } = useDrift();
  const { data: supplyChain } = useSupplyChain();

  const driftAlerts = useMemo(() => drift?.alerts || [], [drift?.alerts]);
  const driftData = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity -- Date.now() needed for synthetic time axis
    const now = Date.now();
    return driftAlerts.map((a, i) => ({
      date: new Date(now - (driftAlerts.length - i) * 60_000),
      value: a.current_rate,
    }));
  }, [driftAlerts]);

  if (statsLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards — one per agent defense */}
      <div className="grid grid-cols-4 gap-3">
        {AGENT_DEFENSES.map(({ key, label }) => {
          const stat = (stats || []).find((s) => s.name === key);
          return (
            <Card key={key} hover>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="text-xl font-bold text-white mt-1">{stat?.invocations ?? 0}</p>
              <div className="flex gap-1 mt-1">
                {(stat?.blocks ?? 0) > 0 && <Badge variant="red">{stat!.blocks} blocked</Badge>}
                {stat && stat.invocations > 0 && (
                  <Badge variant="cyan">{Math.round(stat.block_rate * 100)}%</Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Tool Output Firewall Panel */}
        <Card>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Tool Output Firewall</h3>
          <p className="text-xs text-slate-500 mb-3">
            Scans tool/RAG/API outputs for injected prompts before they reach the agent.
          </p>
          {(() => {
            const stat = (stats || []).find((s) => s.name === 'indirect_injection');
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-shield-bg rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-shield-cyan">{stat?.invocations ?? 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Scanned</p>
                  </div>
                  <div className="bg-shield-bg rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-shield-red">{stat?.blocks ?? 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Blocked</p>
                  </div>
                  <div className="bg-shield-bg rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-shield-green">
                      {stat && stat.invocations > 0 ? Math.round((1 - stat.block_rate) * 100) : 100}
                      %
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">Pass Rate</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>

        {/* Memory Write Guard Panel */}
        <Card>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Memory Write Guard</h3>
          <p className="text-xs text-slate-500 mb-3">
            Protects agent memory files (SOUL.md, MEMORY.md, etc.) from poisoning attacks.
          </p>
          {(() => {
            const stat = (stats || []).find((s) => s.name === 'memory_write_guard');
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${(stat?.blocks ?? 0) > 0 ? 'bg-shield-red' : 'bg-shield-green'}`}
                  />
                  <span className="text-sm text-slate-300">
                    {(stat?.blocks ?? 0) > 0
                      ? `${stat!.blocks} poisoning attempts blocked`
                      : 'All memory writes verified'}
                  </span>
                </div>
                <div className="bg-shield-bg rounded-lg p-3 text-xs font-mono text-slate-400">
                  <p>Checked: {stat?.invocations ?? 0} writes</p>
                  <p>Blocked: {stat?.blocks ?? 0}</p>
                  <p>Block rate: {stat ? Math.round(stat.block_rate * 100) : 0}%</p>
                </div>
              </div>
            );
          })()}
        </Card>

        {/* Social Engineering Panel */}
        <Card>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Social Engineering Detection</h3>
          <p className="text-xs text-slate-500 mb-3">
            Detects authority impersonation, threats, urgency, and other manipulation patterns.
          </p>
          {(() => {
            const stat = (stats || []).find((s) => s.name === 'social_engineering');
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-shield-bg rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-shield-purple">
                      {stat?.invocations ?? 0}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">Scanned</p>
                  </div>
                  <div className="bg-shield-bg rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-shield-red">{stat?.blocks ?? 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Manipulation Blocked</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>

        {/* Sub-Agent Guard Panel */}
        <Card>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Sub-Agent Guard</h3>
          <p className="text-xs text-slate-500 mb-3">
            Controls agent delegation depth and blocks privilege escalation attempts.
          </p>
          {(() => {
            const stat = (stats || []).find((s) => s.name === 'sub_agent_guard');
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-shield-bg rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-shield-cyan">{stat?.invocations ?? 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Delegations Checked</p>
                  </div>
                  <div className="bg-shield-bg rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-shield-red">{stat?.blocks ?? 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Escalations Blocked</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>

        {/* Drift Detection Panel */}
        <Card>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Drift Detection</h3>
          <p className="text-xs text-slate-500 mb-3">
            Monitors defense block rates for anomalous changes using EMA tracking.
          </p>
          {driftAlerts.length > 0 ? (
            <div className="space-y-2">
              {driftData.length > 1 && (
                <AreaChart data={driftData} width={380} height={120} color={shieldColors.amber} />
              )}
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {driftAlerts.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-xs px-2 py-1">
                    <span className="text-slate-400">{a.defense_name}</span>
                    <SeverityBadge level={a.severity} />
                    <span className="text-slate-500">z={a.z_score.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-shield-green" />
              <span className="text-slate-300">
                No drift detected ({drift?.defenses_analyzed ?? 0} defenses analyzed)
              </span>
            </div>
          )}
        </Card>

        {/* Supply Chain Panel */}
        <Card>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Supply Chain Validation</h3>
          <p className="text-xs text-slate-500 mb-3">
            Verifies artifact checksums and dependency versions.
          </p>
          {supplyChain ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${supplyChain.valid ? 'bg-shield-green' : 'bg-shield-red'}`}
                />
                <span className="text-sm text-slate-300">
                  {supplyChain.valid ? 'All validations passed' : 'Validation issues found'}
                </span>
              </div>
              {supplyChain.artifacts.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {supplyChain.artifacts.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-xs px-2 py-1">
                      <span className="text-slate-400 font-mono truncate max-w-[200px]">
                        {a.path}
                      </span>
                      <Badge variant={a.valid ? 'green' : 'red'}>
                        {a.valid ? 'valid' : 'invalid'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              {supplyChain.dependencies.length > 0 && (
                <>
                  <p className="text-xs text-slate-500 mt-2">Dependencies</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {supplyChain.dependencies.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs px-2 py-1">
                        <span className="text-slate-400">
                          {d.package} {d.actual_version && `@${d.actual_version}`}
                        </span>
                        <Badge variant={d.valid ? 'green' : 'red'}>
                          {d.valid ? 'ok' : 'mismatch'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-xs text-center py-4">Loading supply chain data...</p>
          )}
        </Card>
      </div>
    </div>
  );
}
