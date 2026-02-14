import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface JsonTreeProps {
  data: unknown;
  name?: string;
  level?: number;
}

export function JsonTree({ data, name, level = 0 }: JsonTreeProps) {
  const [expanded, setExpanded] = useState(level < 2);

  if (data === null || data === undefined) {
    return (
      <div
        className="flex items-center gap-1 font-mono text-sm"
        style={{ paddingLeft: level * 16 }}
      >
        {name && <span className="text-shield-purple">{name}: </span>}
        <span className="text-slate-500">null</span>
      </div>
    );
  }

  if (typeof data === 'boolean') {
    return (
      <div
        className="flex items-center gap-1 font-mono text-sm"
        style={{ paddingLeft: level * 16 }}
      >
        {name && <span className="text-shield-purple">{name}: </span>}
        <span className="text-shield-amber">{String(data)}</span>
      </div>
    );
  }

  if (typeof data === 'number') {
    return (
      <div
        className="flex items-center gap-1 font-mono text-sm"
        style={{ paddingLeft: level * 16 }}
      >
        {name && <span className="text-shield-purple">{name}: </span>}
        <span className="text-shield-cyan">{data}</span>
      </div>
    );
  }

  if (typeof data === 'string') {
    return (
      <div
        className="flex items-center gap-1 font-mono text-sm"
        style={{ paddingLeft: level * 16 }}
      >
        {name && <span className="text-shield-purple">{name}: </span>}
        <span className="text-shield-green">"{data}"</span>
      </div>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 font-mono text-sm text-slate-300 hover:text-white"
          style={{ paddingLeft: level * 16 }}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {name && <span className="text-shield-purple">{name}: </span>}
          <span className="text-slate-500">[{data.length}]</span>
        </button>
        {expanded &&
          data.map((item, i) => (
            <JsonTree key={i} data={item} name={String(i)} level={level + 1} />
          ))}
      </div>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 font-mono text-sm text-slate-300 hover:text-white"
          style={{ paddingLeft: level * 16 }}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {name && <span className="text-shield-purple">{name}: </span>}
          <span className="text-slate-500">{`{${entries.length}}`}</span>
        </button>
        {expanded &&
          entries.map(([key, value]) => (
            <JsonTree key={key} data={value} name={key} level={level + 1} />
          ))}
      </div>
    );
  }

  return null;
}
