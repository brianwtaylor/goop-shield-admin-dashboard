/**
 * API endpoint wrappers with data transformation.
 *
 * Raw API responses are transformed into dashboard-friendly shapes
 * so components never deal with backend schema quirks.
 */
import { api } from './client';
import type {
  Health,
  DefendRequest,
  DefendResponse,
  AuditEvent,
  DefenseStats,
  RedTeamReport,
  BroRLWeights,
  ThreatActor,
  DriftReport,
  SupplyChainReport,
} from './schemas';

// ── Health ─────────────────────────────────────────────────────────

interface HealthRaw {
  status: string;
  version: string;
  uptime_seconds: number;
  defenses_loaded: number;
  scanners_loaded: number;
  brorl_ready: boolean;
  total_requests: number;
  total_blocked: number;
  active_defenses: string[];
  active_scanners: string[];
  audit_events_total: number;
}

export async function getHealth(): Promise<Health> {
  const raw = await api.get('api/v1/health').json<HealthRaw>();
  const allowed = raw.total_requests - raw.total_blocked;
  return {
    status: raw.status,
    version: raw.version,
    uptime_seconds: raw.uptime_seconds,
    defenses_active: raw.active_defenses.length,
    scanners_active: raw.active_scanners.length,
    brorl_ready: raw.brorl_ready,
    total_requests: raw.total_requests,
    blocked: raw.total_blocked,
    allowed: Math.max(allowed, 0),
    block_rate: raw.total_requests > 0 ? raw.total_blocked / raw.total_requests : 0,
    active_defenses: raw.active_defenses,
    active_scanners: raw.active_scanners,
    audit_events_total: raw.audit_events_total,
  };
}

// ── Defend ─────────────────────────────────────────────────────────

export async function postDefend(req: DefendRequest): Promise<DefendResponse> {
  return api.post('api/v1/defend', { json: req }).json<DefendResponse>();
}

// ── Audit Events ───────────────────────────────────────────────────

interface AuditEventsRaw {
  events: Array<{
    id: number;
    request_id: string;
    timestamp: number;
    source_ip?: string;
    endpoint?: string;
    prompt_preview?: string;
    shield_action: string;
    confidence?: number;
    latency_ms?: number;
    defenses_applied?: string[];
    classification?: string;
    session_id?: string;
    actor_id?: string;
    geo?: { country?: string; city?: string; lat?: number; lon?: number };
  }>;
  total?: number;
}

export async function getAuditEvents(params?: {
  limit?: number;
  offset?: number;
  action?: string;
  classification?: string;
}): Promise<AuditEvent[]> {
  const searchParams: Record<string, string> = {};
  if (params?.limit) searchParams.limit = String(params.limit);
  if (params?.offset) searchParams.offset = String(params.offset);
  if (params?.action) searchParams.action = params.action;
  if (params?.classification) searchParams.classification = params.classification;

  const raw = await api.get('api/v1/audit/events', { searchParams }).json<AuditEventsRaw>();
  return (raw.events || []).map((e) => ({
    id: e.id,
    request_id: e.request_id,
    timestamp: new Date(e.timestamp * 1000).toISOString(),
    timestamp_raw: e.timestamp,
    source_ip: e.source_ip || '',
    action: e.shield_action,
    classification: e.classification || 'unknown',
    prompt_preview: e.prompt_preview || '',
    confidence: e.confidence ?? 0,
    latency_ms: e.latency_ms ?? 0,
    defenses_applied: e.defenses_applied || [],
    session_id: e.session_id || '',
    actor_id: e.actor_id,
    geo: e.geo,
  }));
}

// ── Defense Stats ──────────────────────────────────────────────────

interface DefenseStatsRaw {
  total_requests: number;
  total_blocked: number;
  defense_stats: Record<string, { invocations: number; blocks: number }>;
  ranking_weights?: Record<string, number>;
  ranking_stats?: {
    backend: string;
    num_defenses: number;
    default_priority: number;
  };
}

export async function getDefenseStats(): Promise<DefenseStats[]> {
  const raw = await api.get('api/v1/defender/stats').json<DefenseStatsRaw>();
  const weights = raw.ranking_weights || {};
  const defaultWeight = raw.ranking_stats?.default_priority ?? 50;
  return Object.entries(raw.defense_stats).map(([name, stat]) => ({
    name,
    invocations: stat.invocations,
    blocks: stat.blocks,
    block_rate: stat.invocations > 0 ? stat.blocks / stat.invocations : 0,
    brorl_weight: weights[name] ?? defaultWeight,
  }));
}

// ── Red Team ───────────────────────────────────────────────────────

export async function postRedTeamProbe(names?: string[]): Promise<RedTeamReport> {
  const body = names ? { probe_names: names } : {};
  return api.post('api/v1/redteam/probe', { json: body }).json<RedTeamReport>();
}

export async function getRedTeamResults(): Promise<RedTeamReport> {
  return api.get('api/v1/redteam/results').json<RedTeamReport>();
}

// ── BroRL ──────────────────────────────────────────────────────────

export async function getBroRLWeights(): Promise<BroRLWeights> {
  return api.get('api/v1/brorl/weights').json<BroRLWeights>();
}

// ── Threat Intel ───────────────────────────────────────────────────

interface ThreatActorsRaw {
  actors: ThreatActor[];
  total?: number;
}

export async function getThreatActors(): Promise<ThreatActor[]> {
  const raw = await api.get('api/v1/intel/actors').json<ThreatActorsRaw>();
  return raw.actors || [];
}

// ── Drift ──────────────────────────────────────────────────────────

export async function getDriftReport(): Promise<DriftReport> {
  return api.get('api/v1/drift/report').json<DriftReport>();
}

// ── Supply Chain ───────────────────────────────────────────────────

export async function getSupplyChainReport(): Promise<SupplyChainReport> {
  return api.get('api/v1/supply-chain/report').json<SupplyChainReport>();
}

// ── Config ─────────────────────────────────────────────────────────

export async function getConfig(): Promise<Record<string, unknown>> {
  return api.get('api/v1/config').json<Record<string, unknown>>();
}
