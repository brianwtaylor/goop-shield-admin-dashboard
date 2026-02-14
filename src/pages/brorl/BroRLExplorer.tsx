import { useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { BetaCurve } from '../../components/charts/BetaCurve';
import { useBroRL } from '../../hooks/useBroRL';

export function BroRLExplorer() {
  const { data: brorl, isLoading } = useBroRL();

  const curves = useMemo(() => {
    if (!brorl?.parameters) return [];
    return Object.entries(brorl.parameters).map(([name, params]) => ({
      name,
      alpha: (params as { alpha: number; beta: number; weight: number }).alpha,
      beta: (params as { alpha: number; beta: number; weight: number }).beta,
    }));
  }, [brorl]);

  const weights = useMemo(() => {
    if (!brorl?.weights) return [];
    return Object.entries(brorl.weights)
      .map(([name, weight]) => ({ name, weight: weight as number }))
      .sort((a, b) => b.weight - a.weight);
  }, [brorl]);

  const maxWeight = weights[0]?.weight || 1;

  // Exploration vs exploitation estimation
  const totalAlpha = curves.reduce((s, c) => s + c.alpha, 0);
  const totalBeta = curves.reduce((s, c) => s + c.beta, 0);
  const totalSamples = totalAlpha + totalBeta;
  const explorationRate = totalSamples > 0 ? totalBeta / totalSamples : 0.5;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exploration Balance */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Exploration vs Exploitation</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Exploitation</span>
              <span>Exploration</span>
            </div>
            <div className="h-3 bg-shield-border rounded-full overflow-hidden flex">
              <div
                className="h-full bg-shield-cyan transition-all duration-700"
                style={{ width: `${(1 - explorationRate) * 100}%` }}
              />
              <div
                className="h-full bg-shield-purple transition-all duration-700"
                style={{ width: `${explorationRate * 100}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-slate-400 w-32 text-right">
            <span className="text-shield-cyan">{((1 - explorationRate) * 100).toFixed(1)}%</span>
            {' / '}
            <span className="text-shield-purple">{(explorationRate * 100).toFixed(1)}%</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Based on {totalSamples.toFixed(0)} total samples across {curves.length} defenses
        </p>
      </Card>

      {/* Beta Curves */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Beta Distribution Curves</h3>
        {curves.length > 0 ? (
          <div className="overflow-x-auto">
            <BetaCurve curves={curves.slice(0, 8)} width={800} height={300} />
          </div>
        ) : (
          <p className="text-slate-500 text-xs text-center py-8">No BroRL parameters available</p>
        )}
        {curves.length > 8 && (
          <div className="mt-4 overflow-x-auto">
            <BetaCurve curves={curves.slice(8, 16)} width={800} height={300} />
          </div>
        )}
      </Card>

      {/* Weight Table */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Defense Weights</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-shield-border">
                <th className="text-left py-2 px-3 text-xs text-slate-500 uppercase tracking-wider">Defense</th>
                <th className="text-left py-2 px-3 text-xs text-slate-500 uppercase tracking-wider">Weight</th>
                <th className="text-left py-2 px-3 text-xs text-slate-500 uppercase tracking-wider w-1/2">Distribution</th>
                <th className="text-left py-2 px-3 text-xs text-slate-500 uppercase tracking-wider">Alpha</th>
                <th className="text-left py-2 px-3 text-xs text-slate-500 uppercase tracking-wider">Beta</th>
              </tr>
            </thead>
            <tbody>
              {weights.map((w) => {
                const p = brorl?.parameters?.[w.name] as { alpha: number; beta: number } | undefined;
                return (
                  <tr key={w.name} className="border-b border-shield-border/50 hover:bg-shield-border/20">
                    <td className="py-2 px-3 text-slate-300 font-mono text-xs">{w.name}</td>
                    <td className="py-2 px-3 text-shield-cyan font-mono">{w.weight.toFixed(4)}</td>
                    <td className="py-2 px-3">
                      <div className="h-2 bg-shield-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-shield-cyan rounded-full transition-all duration-500"
                          style={{ width: `${(w.weight / maxWeight) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-400 font-mono text-xs">{p?.alpha.toFixed(2) ?? '-'}</td>
                    <td className="py-2 px-3 text-slate-400 font-mono text-xs">{p?.beta.toFixed(2) ?? '-'}</td>
                  </tr>
                );
              })}
              {weights.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No BroRL weights available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
