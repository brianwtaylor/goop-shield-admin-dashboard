import { z } from 'zod';

// ── Health ─────────────────────────────────────────────────────────
// Matches GET /api/v1/health actual response
export const HealthRawSchema = z.object({
  status: z.string(),
  version: z.string(),
  uptime_seconds: z.number(),
  defenses_loaded: z.number(),
  scanners_loaded: z.number(),
  brorl_ready: z.boolean(),
  total_requests: z.number(),
  total_blocked: z.number(),
  active_defenses: z.array(z.string()),
  active_scanners: z.array(z.string()),
  audit_events_total: z.number(),
});

/** Dashboard-friendly health shape (transformed from raw) */
export interface Health {
  status: string;
  version: string;
  uptime_seconds: number;
  defenses_active: number;
  scanners_active: number;
  brorl_ready: boolean;
  total_requests: number;
  blocked: number;
  allowed: number;
  block_rate: number;
  active_defenses: string[];
  active_scanners: string[];
  audit_events_total: number;
}

// ── Defend ─────────────────────────────────────────────────────────
export const VerdictSchema = z.object({
  defense_name: z.string(),
  action: z.string(),
  confidence: z.number(),
  details: z.string().optional(),
  latency_ms: z.number().optional(),
});
export type Verdict = z.infer<typeof VerdictSchema>;

export const DefendResponseSchema = z.object({
  allow: z.boolean(),
  action: z.string(),
  filtered_prompt: z.string(),
  confidence: z.number(),
  verdicts: z.array(VerdictSchema),
  latency_ms: z.number(),
});
export type DefendResponse = z.infer<typeof DefendResponseSchema>;

export interface DefendRequest {
  prompt: string;
  session_id?: string;
  source_ip?: string;
  context?: Record<string, unknown>;
}

// ── Audit Events ───────────────────────────────────────────────────
// Matches GET /api/v1/audit/events actual response
export const AuditEventRawSchema = z.object({
  id: z.number(),
  request_id: z.string(),
  timestamp: z.number(),
  source_ip: z.string().optional(),
  endpoint: z.string().optional(),
  prompt_hash: z.string().optional(),
  prompt_preview: z.string().optional(),
  shield_action: z.string(),
  confidence: z.number().optional(),
  latency_ms: z.number().optional(),
  defenses_applied: z.array(z.string()).optional(),
  classification: z.string().optional(),
  session_id: z.string().optional(),
  actor_id: z.string().optional(),
  geo: z
    .object({
      country: z.string().optional(),
      city: z.string().optional(),
      lat: z.number().optional(),
      lon: z.number().optional(),
    })
    .optional(),
});

/** Dashboard-friendly audit event */
export interface AuditEvent {
  id: number;
  request_id: string;
  timestamp: string; // ISO string for display
  timestamp_raw: number; // epoch for sorting/charts
  source_ip: string;
  action: string;
  classification: string;
  prompt_preview: string;
  confidence: number;
  latency_ms: number;
  defenses_applied: string[];
  session_id: string;
  actor_id?: string;
  geo?: {
    country?: string;
    city?: string;
    lat?: number;
    lon?: number;
  };
}

// ── Defense Stats ──────────────────────────────────────────────────
// Matches GET /api/v1/defender/stats actual response
export const DefenseStatsRawSchema = z.object({
  total_requests: z.number(),
  total_blocked: z.number(),
  defense_stats: z.record(
    z.string(),
    z.object({
      invocations: z.number(),
      blocks: z.number(),
    }),
  ),
  ranking: z
    .object({
      backend: z.string(),
      priorities: z.record(z.string(), z.number()),
      default_priority: z.number(),
    })
    .optional(),
  ranking_stats: z
    .object({
      backend: z.string(),
      num_defenses: z.number(),
      default_priority: z.number(),
    })
    .optional(),
});

/** Dashboard-friendly defense stat */
export interface DefenseStats {
  name: string;
  invocations: number;
  blocks: number;
  block_rate: number;
  brorl_weight: number;
}

// ── Red Team ───────────────────────────────────────────────────────
export const ProbeResultSchema = z.object({
  probe_name: z.string(),
  target_defense: z.string(),
  payload_blocked: z.boolean(),
  expected_blocked: z.boolean(),
  defense_bypassed: z.boolean(),
  target_missed: z.boolean(),
  caught_by: z.string().nullable(),
  confidence: z.number(),
  latency_ms: z.number(),
});
export type ProbeResult = z.infer<typeof ProbeResultSchema>;

export const RedTeamReportSchema = z.object({
  total_probes: z.number(),
  defenses_bypassed: z.number(),
  target_misses: z.number(),
  bypass_rate: z.number(),
  target_miss_rate: z.number(),
  results: z.array(ProbeResultSchema),
  alignment_results: z.array(ProbeResultSchema).optional(),
  timestamp: z.number(),
  latency_ms: z.number(),
});
export type RedTeamReport = z.infer<typeof RedTeamReportSchema>;

// ── BroRL ──────────────────────────────────────────────────────────
// Matches GET /api/v1/brorl/weights actual response
export const BroRLWeightsSchema = z.object({
  weights: z.record(z.string(), z.number()),
  parameters: z
    .record(
      z.string(),
      z.object({
        alpha: z.number(),
        beta: z.number(),
      }),
    )
    .optional(),
});
export type BroRLWeights = z.infer<typeof BroRLWeightsSchema>;

// ── Threat Intel ───────────────────────────────────────────────────
export const ThreatActorSchema = z.object({
  actor_id: z.string(),
  fingerprint: z.string().optional(),
  source_ips: z.array(z.string()).optional(),
  risk_level: z.string(),
  total_events: z.number(),
  first_seen: z.string().optional(),
  last_seen: z.string().optional(),
  classifications: z.array(z.string()).optional(),
  geo: z
    .object({
      country: z.string().optional(),
      city: z.string().optional(),
      lat: z.number().optional(),
      lon: z.number().optional(),
    })
    .optional(),
});
export type ThreatActor = z.infer<typeof ThreatActorSchema>;

// ── Drift Detection ────────────────────────────────────────────────
export const DriftAlertSchema = z.object({
  defense_name: z.string(),
  current_rate: z.number(),
  baseline_rate: z.number(),
  z_score: z.number(),
  direction: z.string(),
  severity: z.string(),
});
export type DriftAlert = z.infer<typeof DriftAlertSchema>;

export const DriftReportSchema = z.object({
  alerts: z.array(DriftAlertSchema),
  defenses_analyzed: z.number(),
  timestamp: z.number().optional(),
});
export type DriftReport = z.infer<typeof DriftReportSchema>;

// ── Supply Chain ───────────────────────────────────────────────────
export const SupplyChainArtifactSchema = z.object({
  path: z.string(),
  valid: z.boolean(),
  actual_sha256: z.string().optional(),
  expected_sha256: z.string().optional(),
  reason: z.string().optional(),
});
export type SupplyChainArtifact = z.infer<typeof SupplyChainArtifactSchema>;

export const SupplyChainDependencySchema = z.object({
  package: z.string(),
  expected_version: z.string().optional(),
  actual_version: z.string().optional(),
  valid: z.boolean(),
  reason: z.string().optional(),
});
export type SupplyChainDependency = z.infer<typeof SupplyChainDependencySchema>;

export const SupplyChainReportSchema = z.object({
  artifacts: z.array(SupplyChainArtifactSchema),
  dependencies: z.array(SupplyChainDependencySchema),
  valid: z.boolean(),
  summary: z.string().optional(),
});
export type SupplyChainReport = z.infer<typeof SupplyChainReportSchema>;
