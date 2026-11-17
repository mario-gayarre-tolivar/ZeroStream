import { describe, it, expect } from "vitest";
import { classifyServerResponse } from "@/services/server-health";

describe("classifyServerResponse", () => {
  describe("Regla 1: Bloqueo de Frame (frame_blocked -> dead)", () => {
    it("debe marcar dead por X-Frame-Options: DENY (mayúsculas o minúsculas)", () => {
      const headersDeny = new Headers({ "x-frame-options": "DENY" });
      expect(
        classifyServerResponse({
          status: 200,
          headers: headersDeny,
          htmlSnippet: "<div>Player OK</div>",
        })
      ).toEqual({ status: "dead", reason: "frame_blocked" });

      const headersLower = new Headers({ "x-frame-options": "deny" });
      expect(
        classifyServerResponse({
          status: 200,
          headers: headersLower,
          htmlSnippet: "<div>Player OK</div>",
        })
      ).toEqual({ status: "dead", reason: "frame_blocked" });
    });

    it("debe marcar dead por X-Frame-Options: SAMEORIGIN", () => {
      const headers = new Headers({ "x-frame-options": "SAMEORIGIN" });
      expect(
        classifyServerResponse({
          status: 200,
          headers,
          htmlSnippet: "<div>Player OK</div>",
        })
      ).toEqual({ status: "dead", reason: "frame_blocked" });

      const headersMixed = new Headers({ "x-frame-options": "SameOrigin" });
      expect(
        classifyServerResponse({
          status: 200,
          headers: headersMixed,
          htmlSnippet: "<div>Player OK</div>",
        })
      ).toEqual({ status: "dead", reason: "frame_blocked" });
    });

    it("debe marcar dead por Content-Security-Policy frame-ancestors 'none'", () => {
      const headers = new Headers({
        "content-security-policy": "default-src 'self'; frame-ancestors 'none'",
      });
      expect(
        classifyServerResponse({
          status: 200,
          headers,
          htmlSnippet: "<div>Player OK</div>",
        })
      ).toEqual({ status: "dead", reason: "frame_blocked" });
    });

    it("debe marcar dead por Content-Security-Policy frame-ancestors 'self'", () => {
      const headers = new Headers({
        "content-security-policy": "frame-ancestors 'self'",
      });
      expect(
        classifyServerResponse({
          status: 200,
          headers,
          htmlSnippet: "<div>Player OK</div>",
        })
      ).toEqual({ status: "dead", reason: "frame_blocked" });
    });
  });

  describe("Regla 2: Retos Anti-Bot / Cloudflare (bot_challenge -> uncertain)", () => {
    it("debe marcar uncertain por 403 con 'Just a moment...'", () => {
      const headers = new Headers();
      expect(
        classifyServerResponse({
          status: 403,
          headers,
          htmlSnippet: "<title>Just a moment...</title><p>Please wait</p>",
        })
      ).toEqual({ status: "uncertain", reason: "bot_challenge" });
    });

    it("debe marcar uncertain por 403 o 503 con firmas Cloudflare conocidas", () => {
      const signatures = [
        "cloudflare",
        "cf-browser-verification",
        "challenge-running",
        "turnstile",
        "Attention Required! | Cloudflare",
      ];

      for (const sig of signatures) {
        expect(
          classifyServerResponse({
            status: 403,
            headers: new Headers(),
            htmlSnippet: `<div>${sig}</div>`,
          })
        ).toEqual({ status: "uncertain", reason: "bot_challenge" });

        expect(
          classifyServerResponse({
            status: 503,
            headers: new Headers(),
            htmlSnippet: `<div>${sig.toUpperCase()}</div>`,
          })
        ).toEqual({ status: "uncertain", reason: "bot_challenge" });
      }
    });

    it("NO debe marcar bot_challenge si status no es 403 ni 503 aun si contiene la palabra cloudflare", () => {
      expect(
        classifyServerResponse({
          status: 200,
          headers: new Headers(),
          htmlSnippet: "<div>Hosted on cloudflare cdn</div>",
        })
      ).toEqual({ status: "healthy", reason: "ok" });
    });
  });

  describe("Regla 3: Errores HTTP (http_error -> dead)", () => {
    it("debe marcar dead por 404 Not Found", () => {
      expect(
        classifyServerResponse({
          status: 404,
          headers: new Headers(),
          htmlSnippet: "<html><body>Not Found</body></html>",
        })
      ).toEqual({ status: "dead", reason: "http_error" });
    });

    it("debe marcar dead por errores 500 y 502", () => {
      expect(
        classifyServerResponse({
          status: 500,
          headers: new Headers(),
          htmlSnippet: "Internal Server Error",
        })
      ).toEqual({ status: "dead", reason: "http_error" });

      expect(
        classifyServerResponse({
          status: 502,
          headers: new Headers(),
          htmlSnippet: "Bad Gateway",
        })
      ).toEqual({ status: "dead", reason: "http_error" });
    });

    it("debe marcar dead por 403 o 503 sin firmas de reto anti-bot", () => {
      expect(
        classifyServerResponse({
          status: 403,
          headers: new Headers(),
          htmlSnippet: "Access Forbidden: IP blacklisted",
        })
      ).toEqual({ status: "dead", reason: "http_error" });

      expect(
        classifyServerResponse({
          status: 503,
          headers: new Headers(),
          htmlSnippet: "Service Temporarily Unavailable",
        })
      ).toEqual({ status: "dead", reason: "http_error" });
    });
  });

  describe("Regla 4: Páginas de Error en HTML con status 200 (html_error_page -> dead)", () => {
    const errorPhrases = [
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

    for (const phrase of errorPhrases) {
      it(`debe marcar dead por contenido con '${phrase}'`, () => {
        expect(
          classifyServerResponse({
            status: 200,
            headers: new Headers(),
            htmlSnippet: `<html><body><div class="msg">${phrase.toUpperCase()}</div></body></html>`,
          })
        ).toEqual({ status: "dead", reason: "html_error_page" });
      });
    }
  });

  describe("Regla 5: Servidor Sano (ok -> healthy)", () => {
    it("debe marcar healthy para reproductor o SPA limpia con status 200", () => {
      expect(
        classifyServerResponse({
          status: 200,
          headers: new Headers(),
          htmlSnippet:
            '<!DOCTYPE html><html><head><title>Player</title></head><body><div id="player"></div><script src="bundle.js"></script></body></html>',
        })
      ).toEqual({ status: "healthy", reason: "ok" });

      expect(
        classifyServerResponse({
          status: 200,
          headers: new Headers(),
          htmlSnippet: '<div id="root"></div>',
        })
      ).toEqual({ status: "healthy", reason: "ok" });
    });

    it("debe marcar healthy para respuestas 204 o 302 sin bloqueos", () => {
      expect(
        classifyServerResponse({
          status: 204,
          headers: new Headers(),
          htmlSnippet: "",
        })
      ).toEqual({ status: "healthy", reason: "ok" });

      expect(
        classifyServerResponse({
          status: 302,
          headers: new Headers({ location: "https://player.cdn.com/embed" }),
          htmlSnippet: "",
        })
      ).toEqual({ status: "healthy", reason: "ok" });
    });
  });
});
