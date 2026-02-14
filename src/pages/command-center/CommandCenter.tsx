import { Activity, ShieldOff, ShieldCheck, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatCard } from '../../components/dashboard/StatCard';
import { Heatmap } from '../../components/charts/Heatmap';
import { useHealth } from '../../hooks/useHealth';
import { useDefenseStats } from '../../hooks/useDefenseStats';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { formatDuration, truncate } from '../../lib/utils';
import { actionColors, shieldColors } from '../../lib/colors';

export function CommandCenter() {
  const { data: health, isLoading: healthLoading } = useHealth();
  const { data: stats } = useDefenseStats();
  const { events } = useWebSocket();

  if (healthLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Build heatmap data from stats
  const heatmapRows = stats?.map((s) => s.name).slice(0, 10) || [];
  const heatmapCols = ['blocks', 'block_rate', 'invocations'];
  const heatmapData = stats?.slice(0, 10).flatMap((s) => [
    { row: s.name, col: 'blocks', value: s.blocks },
    { row: s.name, col: 'block_rate', value: Math.round(s.block_rate * 100) },
    { row: s.name, col: 'invocations', value: s.invocations },
  ]) || [];

  // Top attack classifications from events
  const classificationCounts: Record<string, number> = {};
  events.forEach((e) => {
    if (e.classification) {
      classificationCounts[e.classification] = (classificationCounts[e.classification] || 0) + 1;
    }
  });
  const topAttacks = Object.entries(classificationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxAttackCount = topAttacks[0]?.[1] || 1;

  // Top defenses
  const topDefenses = [...(stats || [])]
    .sort((a, b) => b.invocations - a.invocations)
    .slice(0, 5);
  const maxDefenseInvocations = topDefenses[0]?.invocations || 1;

  return (
    <div className="space-y-6">
      {/* Health + Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total Requests"
          value={health?.total_requests || 0}
        />
        <StatCard
          icon={ShieldOff}
          label="Blocked"
          value={health?.blocked || 0}
          color={shieldColors.red}
        />
        <StatCard
          icon={ShieldCheck}
          label="Allowed"
          value={health?.allowed || 0}
          color={shieldColors.green}
        />
        <StatCard
          icon={BarChart3}
          label="Block Rate"
          value={Math.round((health?.block_rate || 0) * 100)}
          format={(n) => n + '%'}
          color={shieldColors.amber}
        />
      </div>

      {/* Uptime + Version */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Uptime</p>
          <p className="text-lg font-mono text-white">{formatDuration(health?.uptime_seconds || 0)}</p>
        </Card>
        <Card className="col-span-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Version</p>
          <p className="text-lg font-mono text-shield-cyan">{health?.version || '-'}</p>
        </Card>
        <Card className="col-span-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Defenses</p>
          <p className="text-lg font-mono text-shield-green">{health?.defenses_active || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Live Event Feed */}
        <Card className="col-span-2">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Live Event Feed</h3>
          <div className="h-72 overflow-y-auto space-y-1 font-mono text-xs">
            {events.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Waiting for events...</p>
            ) : (
              events.slice(0, 50).map((event, i) => (
                <motion.div
                  key={`${event.timestamp}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-shield-border/30"
                >
                  <span className="text-slate-600 w-20 flex-shrink-0">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="w-28 flex-shrink-0 text-slate-500">
                    {truncate(event.source_ip || '-', 15)}
                  </span>
                  <span
                    className="w-16 flex-shrink-0 font-medium"
                    style={{ color: actionColors[event.action] || shieldColors.text }}
                  >
                    {event.action}
                  </span>
                  <span className="text-slate-400 truncate">
                    {event.classification || '-'}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        {/* Top Attack Types + Top Defenses */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Top Attack Types</h3>
            <div className="space-y-2">
              {topAttacks.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">No data yet</p>
              ) : (
                topAttacks.map(([name, count]) => (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{name}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="h-1.5 bg-shield-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-shield-red rounded-full transition-all duration-500"
                        style={{ width: `${(count / maxAttackCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Top Defenses</h3>
            <div className="space-y-2">
              {topDefenses.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">No data yet</p>
              ) : (
                topDefenses.map((d) => (
                  <div key={d.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{d.name}</span>
                      <span className="text-slate-500">{d.invocations}</span>
                    </div>
                    <div className="h-1.5 bg-shield-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-shield-cyan rounded-full transition-all duration-500"
                        style={{ width: `${(d.invocations / maxDefenseInvocations) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Mini Heatmap */}
      {heatmapData.length > 0 && (
        <Card>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Defense Activity Heatmap</h3>
          <div className="overflow-x-auto">
            <Heatmap data={heatmapData} rows={heatmapRows} cols={heatmapCols} width={800} height={300} />
          </div>
        </Card>
      )}
    </div>
  );
}
