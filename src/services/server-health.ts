import { ServerHealthStatus, ServerHealthReason } from "@/types";

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
