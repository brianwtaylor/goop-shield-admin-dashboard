import { useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { SeverityBadge } from '../../components/dashboard/SeverityBadge';
import { GeoMap } from '../../components/charts/GeoMap';
import { useThreatActors } from '../../hooks/useThreatActors';
import { MITRE_TECHNIQUES } from '../../lib/constants';
import type { ThreatActor } from '../../api/schemas';

const columnHelper = createColumnHelper<ThreatActor>();

const columns = [
  columnHelper.accessor('actor_id', { header: 'Actor ID', cell: (info) => info.getValue() }),
  columnHelper.accessor((row) => row.source_ips?.[0] || '-', {
    id: 'source_ip',
    header: 'Source IP',
  }),
  columnHelper.accessor('risk_level', {
    header: 'Risk',
    cell: (info) => <SeverityBadge level={info.getValue()} />,
  }),
  columnHelper.accessor('total_events', { header: 'Events' }),
  columnHelper.accessor('last_seen', {
    header: 'Last Seen',
    cell: (info) => {
      const v = info.getValue();
      return v ? new Date(v).toLocaleString() : '-';
    },
  }),
];

export function ThreatIntel() {
  const { data: actors, isLoading } = useThreatActors();
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: actors || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const mapPoints = useMemo(() => {
    return (actors || [])
      .filter((a) => a.geo?.lat && a.geo?.lon)
      .map((a) => ({
        lat: a.geo!.lat!,
        lon: a.geo!.lon!,
        label: a.actor_id,
        risk: a.risk_level,
        value: Math.min(a.total_events / 10, 5),
      }));
  }, [actors]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* World Map */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Attack Origin Map</h3>
        <div className="overflow-hidden rounded-lg">
          <GeoMap points={mapPoints} width={900} height={400} />
        </div>
      </Card>

      {/* Actor Table */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Threat Actors</h3>
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
              {(actors?.length || 0) === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No threat actors detected yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MITRE ATT&CK Coverage */}
      <Card>
        <h3 className="text-sm font-medium text-slate-300 mb-3">MITRE ATT&CK Coverage</h3>
        <div className="grid grid-cols-4 gap-2">
          {MITRE_TECHNIQUES.map((t) => (
            <div
              key={t.id}
              className={`rounded-lg border px-3 py-2 text-xs ${
                t.covered
                  ? 'bg-shield-green/10 border-shield-green/30 text-shield-green'
                  : 'bg-shield-border/20 border-shield-border text-slate-500'
              }`}
            >
              <span className="font-mono">{t.id}</span>
              <p className="text-[10px] mt-0.5 opacity-80">{t.name}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
