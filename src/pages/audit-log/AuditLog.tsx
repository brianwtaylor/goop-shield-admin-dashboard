import { useState, useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { DonutChart } from '../../components/charts/DonutChart';
import { AreaChart } from '../../components/charts/AreaChart';
import { useAuditEvents } from '../../hooks/useAuditEvents';
import { truncate } from '../../lib/utils';
import { actionColors } from '../../lib/colors';
import type { AuditEvent } from '../../api/schemas';

const columnHelper = createColumnHelper<AuditEvent>();

const columns = [
  columnHelper.accessor('timestamp', {
    header: 'Time',
    cell: (info) => new Date(info.getValue()).toLocaleString(),
  }),
  columnHelper.accessor('source_ip', {
    header: 'Source IP',
    cell: (info) => info.getValue() || '-',
  }),
  columnHelper.accessor('action', {
    header: 'Action',
    cell: (info) => {
      const v = info.getValue();
      const color = actionColors[v] || '#94a3b8';
      return <span style={{ color }}>{v}</span>;
    },
  }),
  columnHelper.accessor('classification', {
    header: 'Classification',
    cell: (info) => info.getValue() || '-',
  }),
  columnHelper.accessor('prompt_preview', {
    header: 'Prompt',
    cell: (info) => (
      <span className="text-slate-400 font-mono text-xs">
        {truncate(info.getValue() || '', 50)}
      </span>
    ),
  }),
];

export function AuditLog() {
  const [actionFilter, setActionFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const { data: events, isLoading } = useAuditEvents({
    limit: 200,
    action: actionFilter || undefined,
    classification: classFilter || undefined,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const table = useReactTable({
    data: events || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Classification donut
  const classificationData = useMemo(() => {
    const counts: Record<string, number> = {};
    (events || []).forEach((e) => {
      const cls = e.classification || 'unknown';
      counts[cls] = (counts[cls] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [events]);

  // Volume chart
  const volumeData = useMemo(() => {
    const buckets: Record<string, number> = {};
    (events || []).forEach((e) => {
      const d = new Date(e.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.entries(buckets)
      .map(([key, value]) => {
        const [year, month, day, hour] = key.split('-').map(Number);
        return { date: new Date(year, month, day, hour), value };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48 col-span-2" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Classifications</h3>
          {classificationData.length > 0 ? (
            <DonutChart data={classificationData} size={180} />
          ) : (
            <p className="text-slate-500 text-xs">No data</p>
          )}
          <div className="flex flex-wrap gap-1 mt-2 justify-center">
            {classificationData.slice(0, 5).map((d) => (
              <Badge key={d.label} variant="cyan">{d.label}: {d.value}</Badge>
            ))}
          </div>
        </Card>
        <Card className="col-span-2">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Event Volume</h3>
          {volumeData.length > 1 ? (
            <AreaChart data={volumeData} width={550} height={180} />
          ) : (
            <p className="text-slate-500 text-xs text-center py-8">Collecting data...</p>
          )}
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          className="bg-shield-surface border border-shield-border rounded-lg px-3 py-1.5 text-sm text-slate-300"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="">All Actions</option>
          <option value="allow">Allow</option>
          <option value="block">Block</option>
          <option value="sanitize">Sanitize</option>
        </select>
        <select
          className="bg-shield-surface border border-shield-border rounded-lg px-3 py-1.5 text-sm text-slate-300"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="">All Classifications</option>
          {classificationData.map((d) => (
            <option key={d.label} value={d.label}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Event Table */}
      <Card>
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
                  className="border-b border-shield-border/50 hover:bg-shield-border/20 cursor-pointer"
                  onClick={() => setSelectedEvent(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2 px-3 text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {(events?.length || 0) === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    No audit events
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Event Detail Drawer */}
      <Dialog.Root open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed right-0 top-0 bottom-0 w-[480px] bg-shield-surface border-l border-shield-border p-6 overflow-y-auto z-50">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-lg font-medium text-white">Event Details</Dialog.Title>
              <Dialog.Close className="text-slate-400 hover:text-white">
                <X size={18} />
              </Dialog.Close>
            </div>
            {selectedEvent && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Timestamp</p>
                  <p className="text-sm text-slate-300">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Action</p>
                  <p className="text-sm" style={{ color: actionColors[selectedEvent.action] || '#94a3b8' }}>
                    {selectedEvent.action}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Classification</p>
                  <p className="text-sm text-slate-300">{selectedEvent.classification || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Source IP</p>
                  <p className="text-sm text-slate-300 font-mono">{selectedEvent.source_ip || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Confidence</p>
                  <p className="text-sm text-slate-300">{selectedEvent.confidence?.toFixed(3) || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Prompt Preview</p>
                  <p className="text-sm text-slate-300 font-mono bg-shield-bg rounded-lg p-3 mt-1">
                    {selectedEvent.prompt_preview || '-'}
                  </p>
                </div>
                {selectedEvent.defenses_applied.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase mb-2">Defenses Applied</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedEvent.defenses_applied.map((d) => (
                        <Badge key={d} variant="cyan">{d}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
