import {
  MediaType,
  ServerOption,
  ServerCheckResult,
  ServerCheckResponse,
  ServerHealthStatus,
  ServerHealthReason,
} from "@/types";
import { BoundedMemoryCache } from "./lru-cache";
import { orderServersForAutoSelection } from "./embeds";

export interface ProbeOptions {
  timeoutMs?: number; // Default: 2800
  forceRefresh?: boolean; // Default: false
  fetchFn?: typeof fetch; // Inyectable para pruebas deterministas
}

export const serverHealthMemoryCache = new BoundedMemoryCache<ServerCheckResult>(150);

const TTL_BY_STATUS: Record<ServerHealthStatus, number> = {
  healthy: 10 * 60 * 1000,
  dead: 3 * 60 * 1000,
  uncertain: 2 * 60 * 1000,
};

export async function probeServerUrl(
  server: ServerOption,
  options?: ProbeOptions
): Promise<ServerCheckResult> {
  if (options?.forceRefresh !== true) {
    const cached = serverHealthMemoryCache.get(server.url);
    if (cached) {
      return { ...cached, serverId: server.id };
    }
  }

  const fetchImpl = options?.fetchFn || fetch;
  const timeoutMs = options?.timeoutMs ?? 2800;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const start = Date.now();

  try {
    const res = await fetchImpl(server.url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    let htmlSnippet = "";
    try {
      if (res.body && typeof res.body.getReader === "function") {
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8", { fatal: false });
        let bytesRead = 0;
        let snippet = "";
        try {
          while (bytesRead < 16384) {
            const { done, value } = await reader.read();
            if (done || !value) break;
            const remaining = 16384 - bytesRead;
            const chunk =
              value.byteLength > remaining ? value.subarray(0, remaining) : value;
            bytesRead += chunk.byteLength;
            snippet += decoder.decode(chunk, { stream: bytesRead < 16384 });
            if (bytesRead >= 16384) {
              await reader.cancel().catch(() => {});
              break;
            }
          }
          htmlSnippet = snippet;
        } catch (streamErr) {
          await reader.cancel().catch(() => {});
          throw streamErr;
        }
      } else {
        const text = await res.text();
        htmlSnippet = text.slice(0, 16384);
      }
    } catch (textErr) {
      if (controller.signal.aborted) {
        throw textErr;
      }
      htmlSnippet = "";
    }

    const latencyMs = Date.now() - start;
    const classification = classifyServerResponse({
      status: res.status,
      headers: res.headers,
      htmlSnippet,
    });

    const result: ServerCheckResult = {
      serverId: server.id,
      status: classification.status,
      reason: classification.reason,
      httpStatus: res.status,
      latencyMs,
      checkedAt: Date.now(),
    };

    serverHealthMemoryCache.set(
      server.url,
      result,
      TTL_BY_STATUS[result.status]
    );
    return result;
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    const isTimeout =
      err?.name === "AbortError" ||
      controller.signal.aborted ||
      err?.code === "ETIMEDOUT";

    const result: ServerCheckResult = {
      serverId: server.id,
      status: "dead",
      reason: isTimeout ? "timeout" : "network_error",
      latencyMs,
      checkedAt: Date.now(),
    };

    serverHealthMemoryCache.set(
      server.url,
      result,
      TTL_BY_STATUS[result.status]
    );
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkServersHealth(
  servers: ServerOption[],
  type: MediaType,
  options?: ProbeOptions
): Promise<ServerCheckResponse> {
  let cachedCount = 0;
  let liveCount = 0;

  for (const s of servers) {
    if (
      options?.forceRefresh !== true &&
      serverHealthMemoryCache.get(s.url) !== undefined
    ) {
      cachedCount++;
    } else {
      liveCount++;
    }
  }

  const results = await Promise.all(
    servers.map((server) => probeServerUrl(server, options))
  );

  let source: "cache" | "live" | "mixed" = "live";
  if (cachedCount > 0 && liveCount > 0) {
    source = "mixed";
  } else if (cachedCount > 0 && liveCount === 0) {
    source = "cache";
  } else {
    source = "live";
  }

  const ordered = orderServersForAutoSelection(servers, type);
  const resultMap = new Map<string, ServerCheckResult>();
  for (const res of results) {
    resultMap.set(res.serverId, res);
  }

  let recommendedServerId: string | null = null;

  // 1. Primer servidor sano (healthy)
  for (const s of ordered) {
    const res = resultMap.get(s.id);
    if (res?.status === "healthy") {
      recommendedServerId = s.id;
      break;
    }
  }

  // 2. Si ninguno es sano, primer servidor incierto (uncertain)
  if (!recommendedServerId) {
    for (const s of ordered) {
      const res = resultMap.get(s.id);
      if (res?.status === "uncertain") {
        recommendedServerId = s.id;
        break;
      }
    }
  }

  return {
    results,
    recommendedServerId,
    source,
  };
}

export function clearServerHealthCache(): void {
  serverHealthMemoryCache.clear();
}

const BOT_CHALLENGE_SIGNATURES = [
  "cloudflare",
  "cf-browser-verification",
  "just a moment...",
  "challenge-running",
  "turnstile",
  "attention required! | cloudflare",
];

const HTML_ERROR_PHRASES = [
  "video not found",
  "video deleted",
  "media unavailable",
  "file not found",
  "video has been removed",
  "no video source found",
  "404 not found",
  "episode not found",
  "embed not found",
];

export function classifyServerResponse(input: {
  status: number;
  headers: Headers;
  htmlSnippet: string;
}): { status: ServerHealthStatus; reason: ServerHealthReason } {
  const { status, headers, htmlSnippet } = input;

  // 1. Bloqueo de Frame (frame_blocked -> dead)
  const xfo = headers.get("x-frame-options")?.toLowerCase().trim();
  if (
    xfo &&
    (xfo === "deny" ||
      xfo === "sameorigin" ||
      xfo.includes("deny") ||
      xfo.includes("sameorigin"))
  ) {
    return { status: "dead", reason: "frame_blocked" };
  }

  const csp = headers.get("content-security-policy")?.toLowerCase();
  if (
    csp &&
    (csp.includes("frame-ancestors 'none'") ||
      csp.includes("frame-ancestors 'self'") ||
      /frame-ancestors\s+['"]?(none|self)['"]?/.test(csp))
  ) {
    return { status: "dead", reason: "frame_blocked" };
  }

  const lowerHtml = (htmlSnippet || "").toLowerCase();

  // 2. Retos Anti-Bot / Cloudflare (bot_challenge -> uncertain)
  if (status === 403 || status === 503) {
    const isBotChallenge = BOT_CHALLENGE_SIGNATURES.some((sig) =>
      lowerHtml.includes(sig)
    );
    if (isBotChallenge) {
      return { status: "uncertain", reason: "bot_challenge" };
    }
  }

  // 3. Errores HTTP (http_error -> dead)
  if (status >= 400 || status < 200) {
    return { status: "dead", reason: "http_error" };
  }

  // 4. Páginas de Error en HTML (html_error_page -> dead)
  const isHtmlError = HTML_ERROR_PHRASES.some((phrase) =>
    lowerHtml.includes(phrase)
  );
  if (isHtmlError) {
    return { status: "dead", reason: "html_error_page" };
  }

  // 5. Servidor Sano (ok -> healthy)
  return { status: "healthy", reason: "ok" };
}
