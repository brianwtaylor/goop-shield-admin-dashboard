import { useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Heatmap } from '../../components/charts/Heatmap';
import { Sparkline } from '../../components/charts/Sparkline';
import { useDefenseStats } from '../../hooks/useDefenseStats';
import { useBroRL } from '../../hooks/useBroRL';
import { formatPercent } from '../../lib/utils';
import { shieldColors } from '../../lib/colors';

export function DefenseMatrix() {
  const { data: stats, isLoading } = useDefenseStats();
  const { data: brorl } = useBroRL();

  const defenses = useMemo(() => stats || [], [stats]);

  const heatmapData = useMemo(
    () =>
      defenses.flatMap((d) => [
        { row: d.name, col: 'blocks', value: d.blocks },
        { row: d.name, col: 'block_rate', value: Math.round(d.block_rate * 100) },
        { row: d.name, col: 'invocations', value: d.invocations },
      ]),
    [defenses],
  );

  const { preprocessors, outputScanners, inlineDefenses } = useMemo(() => {
    const pre = defenses.filter((d) =>
      ['prompt_normalizer', 'invisible_chars', 'unicode_confusables'].includes(d.name),
    );
    const out = defenses.filter((d) =>
      ['secret_leak', 'canary_leak', 'harmful_content'].includes(d.name),
    );
    const inline = defenses.filter((d) => !pre.includes(d) && !out.includes(d));
    return { preprocessors: pre, outputScanners: out, inlineDefenses: inline };
  }, [defenses]);

  // Stable sparkline data — only regenerates when stats change
  const sparklineMap = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const d of defenses) {
      // Seed a deterministic-ish series from invocations so it's stable across renders
      const data = Array.from({ length: 10 }, (_, i) => {
        const seed = d.invocations * (i + 1);
        const pseudo = ((seed * 9301 + 49297) % 233280) / 233280;
        return Math.max(0, (d.invocations * (0.5 + pseudo * 0.5)) / (10 - i));
      });
      map.set(d.name, data);
    }
    return map;
  }, [defenses]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-80" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  const classifications = ['blocks', 'block_rate', 'invocations'];

  return (
    <div className="space-y-6">
      {/* Full Heatmap */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Defense x Metric Heatmap</h3>
        {heatmapData.length > 0 ? (
          <div className="overflow-x-auto">
            <Heatmap
              data={heatmapData}
              rows={defenses.map((d) => d.name)}
              cols={classifications}
              width={900}
              height={Math.max(400, defenses.length * 25 + 100)}
            />
          </div>
        ) : (
          <p className="text-slate-500 text-xs text-center py-8">No defense data available</p>
        )}
      </Card>

      {/* Pipeline Flow */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-4">Defense Pipeline</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {/* Preprocessors */}
          <div className="flex-shrink-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 text-center">
              Preprocessors
            </p>
            <div className="flex flex-col gap-1">
              {preprocessors.map((d) => (
                <div
                  key={d.name}
                  className="bg-shield-purple/10 border border-shield-purple/30 rounded-lg px-3 py-1.5 text-xs text-shield-purple"
                >
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 text-slate-600 text-2xl px-2">&#8594;</div>

          {/* BroRL-ranked defenses */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 text-center">
              BroRL-Ranked Defenses
            </p>
            <div className="flex flex-wrap gap-1">
              {inlineDefenses.map((d) => (
                <div
                  key={d.name}
                  className="bg-shield-cyan/10 border border-shield-cyan/30 rounded-lg px-3 py-1.5 text-xs text-shield-cyan"
                >
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 text-slate-600 text-2xl px-2">&#8594;</div>

          {/* Output Scanners */}
          <div className="flex-shrink-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 text-center">
              Output Scanners
            </p>
            <div className="flex flex-col gap-1">
              {outputScanners.map((d) => (
                <div
                  key={d.name}
                  className="bg-shield-amber/10 border border-shield-amber/30 rounded-lg px-3 py-1.5 text-xs text-shield-amber"
                >
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Defense Cards Grid */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3">All Defenses</h3>
        <div className="grid grid-cols-3 gap-4">
          {defenses.map((d) => {
            const weight = (brorl?.weights as Record<string, number> | undefined)?.[d.name];
            const sparkData = sparklineMap.get(d.name) || [];
            return (
              <Card key={d.name} hover>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">{d.name}</h4>
                  <Sparkline data={sparkData} width={60} height={20} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                  <div>
                    <p className="text-slate-500">Invocations</p>
                    <p className="text-white font-mono">{d.invocations.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Block Rate</p>
                    <p
                      className="font-mono"
                      style={{ color: d.block_rate > 0.5 ? shieldColors.red : shieldColors.green }}
                    >
                      {formatPercent(d.block_rate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">BroRL</p>
                    <p className="text-shield-cyan font-mono">
                      {weight !== undefined ? weight.toFixed(3) : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  {d.blocks > 0 && <Badge variant="red">{d.blocks} blocks</Badge>}
                  {d.block_rate > 0 && (
                    <Badge variant="amber">{formatPercent(d.block_rate)} rate</Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
