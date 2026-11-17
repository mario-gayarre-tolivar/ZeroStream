export type ServerHealthStatus = "healthy" | "uncertain" | "dead";

export type ServerHealthReason =
  | "ok"
  | "bot_challenge"
  | "timeout"
  | "network_error"
  | "http_error"
  | "frame_blocked"
  | "html_error_page";

export interface ServerOption {
  id: string;
  name: string;
  quality: string;
  url: string;
  isRecommended?: boolean;
  requiresAdblock?: boolean;
  hasSpanishAudio?: boolean;
  language?: "sub" | "dub" | "multi";
  autoPriority?: number;
}

export interface ServerCheckResult {
  serverId: string;
  status: ServerHealthStatus;
  reason: ServerHealthReason;
  httpStatus?: number;
  latencyMs: number;
  checkedAt: number;
}

export interface ServerCheckResponse {
  results: ServerCheckResult[];
  recommendedServerId: string | null;
  source: "cache" | "live" | "mixed";
}
