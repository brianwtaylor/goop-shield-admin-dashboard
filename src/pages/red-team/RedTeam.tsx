import { useState, useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { Play, Loader2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { StatCard } from '../../components/dashboard/StatCard';
import { GaugeChart } from '../../components/charts/GaugeChart';
import { useRedTeamResults, useRedTeamProbe } from '../../hooks/useRedTeam';
import { shieldColors } from '../../lib/colors';
import type { ProbeResult } from '../../api/schemas';

const columnHelper = createColumnHelper<ProbeResult>();

const columns = [
  columnHelper.accessor('probe_name', { header: 'Probe' }),
  columnHelper.accessor('target_defense', { header: 'Target Defense' }),
  columnHelper.display({
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const r = row.original;
      if (r.defense_bypassed) return <Badge variant="red">BYPASS</Badge>;
      if (r.target_missed) return <Badge variant="amber">MISS</Badge>;
      if (r.payload_blocked) return <Badge variant="green">BLOCKED</Badge>;
      return <Badge variant="cyan">PASS</Badge>;
    },
  }),
  columnHelper.accessor('caught_by', {
    header: 'Caught By',
    cell: (info) => info.getValue() || '-',
  }),
  columnHelper.accessor('confidence', {
    header: 'Confidence',
    cell: (info) => info.getValue()?.toFixed(3) || '-',
  }),
  columnHelper.accessor('latency_ms', {
    header: 'Latency',
    cell: (info) => {
      const v = info.getValue();
      return v != null ? `${v.toFixed(1)}ms` : '-';
    },
  }),
];

export function RedTeam() {
  const { data: report, isLoading } = useRedTeamResults();
  const probe = useRedTeamProbe();
  const [sorting, setSorting] = useState<SortingState>([]);

  const results = report?.results || [];

  const table = useReactTable({
    data: results,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const defenseGroups = useMemo(() => {
    const groups: Record<string, { total: number; bypassed: number }> = {};
    results.forEach((r) => {
      if (!groups[r.target_defense]) {
        groups[r.target_defense] = { total: 0, bypassed: 0 };
      }
      groups[r.target_defense].total++;
      if (r.defense_bypassed) groups[r.target_defense].bypassed++;
    });
    return groups;
  }, [results]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary + Trigger */}
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-4 flex-1 mr-4">
          <StatCard
            icon={Play}
            label="Total Probes"
            value={report?.total_probes || 0}
            color={shieldColors.cyan}
          />
          <StatCard
            icon={Play}
            label="Bypassed"
            value={report?.defenses_bypassed || 0}
            color={shieldColors.red}
          />
          <StatCard
            icon={Play}
            label="Bypass Rate"
            value={Math.round((report?.bypass_rate || 0) * 100)}
            format={(n) => n + '%'}
            color={shieldColors.amber}
          />
        </div>
        <Button
          onClick={() => probe.mutate(undefined)}
          disabled={probe.isPending}
          className="flex items-center gap-2"
        >
          {probe.isPending ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          Run Probes
        </Button>
      </div>

      {/* Bypass Gauges */}
      {Object.keys(defenseGroups).length > 0 && (
        <Card>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Defense Bypass Rates</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(defenseGroups).map(([defense, { total, bypassed }]) => (
              <div key={defense} className="text-center">
                <GaugeChart
                  value={total > 0 ? bypassed / total : 0}
                  size={100}
                  color={bypassed > 0 ? shieldColors.red : shieldColors.green}
                  label={defense}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Probe Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-shield-border">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left py-2 px-3 text-xs text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? ''}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-shield-border/50 hover:bg-shield-border/20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2 px-3 text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No probe results. Click "Run Probes" to start.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Vulnerability Report Cards */}
      {Object.keys(defenseGroups).length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Vulnerability Report</h3>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(defenseGroups).map(([defense, { total, bypassed }]) => (
              <Card key={defense} hover>
                <h4 className="text-sm font-medium text-white mb-2">{defense}</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500">Probes</p>
                    <p className="text-white font-mono">{total}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Blocked</p>
                    <p className="text-shield-green font-mono">{total - bypassed}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Bypassed</p>
                    <p className="text-shield-red font-mono">{bypassed}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
