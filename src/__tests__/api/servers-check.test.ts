import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/servers/check/route";
import * as serverHealthModule from "@/services/server-health";
import * as embedsModule from "@/services/embeds";

describe("Route Handler POST /api/servers/check", () => {
  beforeEach(() => {
    serverHealthModule.clearServerHealthCache();
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<div>Player OK</div>", {
        status: 200,
        headers: new Headers({ "content-type": "text/html" }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Validación de Entrada y Manejo de Errores (Zod y JSON)", () => {
    it("debe retornar status 400 si el cuerpo no es JSON o está corrupto", async () => {
      const req = new NextRequest("http://localhost:3000/api/servers/check", {
        method: "POST",
        body: "invalid-json{",
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json).toEqual({ error: "JSON inválido" });
    });

    it("debe retornar status 400 con detalles si falta el campo id", async () => {
      const req = new NextRequest("http://localhost:3000/api/servers/check", {
        method: "POST",
        body: JSON.stringify({ type: "movie" }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Parámetros inválidos");
      expect(json.details).toBeDefined();
      expect(json.details.id).toBeDefined();
    });

    it("debe retornar status 400 si el tipo de medio no es válido", async () => {
      const req = new NextRequest("http://localhost:3000/api/servers/check", {
        method: "POST",
        body: JSON.stringify({ type: "invalid_type", id: 123 }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Parámetros inválidos");
      expect(json.details.type).toBeDefined();
    });

    it("debe retornar status 400 si season o episode son menores a 1", async () => {
      const req = new NextRequest("http://localhost:3000/api/servers/check", {
        method: "POST",
        body: JSON.stringify({ type: "tv", id: 123, season: 0, episode: -1 }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Parámetros inválidos");
      expect(json.details.season).toBeDefined();
      expect(json.details.episode).toBeDefined();
    });
  });

  describe("Anti-SSRF y Generación de Servidores", () => {
    it("debe ignorar cualquier URL inyectada por el cliente y generar servidores únicamente con getEmbedServers", async () => {
      const getEmbedServersSpy = vi.spyOn(embedsModule, "getEmbedServers");

      const mockFetch = vi.fn().mockResolvedValue(
        new Response("<div>Player OK</div>", {
          status: 200,
          headers: new Headers({ "content-type": "text/html" }),
        })
      );
      vi.spyOn(globalThis, "fetch").mockImplementation(mockFetch);

      const maliciousPayload = {
        type: "movie",
        id: 550,
        title: "Fight Club",
        url: "https://malicious-ssrf-target.internal/steal-metadata",
        servers: [{ url: "https://evil.org" }],
      };

      const req = new NextRequest("http://localhost:3000/api/servers/check", {
        method: "POST",
        body: JSON.stringify(maliciousPayload),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);

      expect(res.status).toBe(200);
      expect(getEmbedServersSpy).toHaveBeenCalledWith(
        "movie",
        550,
        1,
        1,
        "Fight Club",
        undefined,
        undefined
      );

      // Verificar que fetch jamás fue llamado con la URL maliciosa
      const fetchedUrls = mockFetch.mock.calls.map((call) => call[0]);
      expect(
        fetchedUrls.some((url: string) =>
          url.includes("malicious-ssrf-target.internal") || url.includes("evil.org")
        )
      ).toBe(false);
    });
  });

  describe("Verificación Exitosa y Respuesta HTTP", () => {
    it("debe retornar status 200 con ServerCheckResponse y cabecera Cache-Control: no-store para movie", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response("<div>Video Player Ready</div>", {
          status: 200,
          headers: new Headers({ "content-type": "text/html" }),
        })
      );
      vi.spyOn(globalThis, "fetch").mockImplementation(mockFetch);

      const req = new NextRequest("http://localhost:3000/api/servers/check", {
        method: "POST",
        body: JSON.stringify({ type: "movie", id: 550, title: "Fight Club" }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);

      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toBe("no-store");

      const json = await res.json();
      expect(json).toHaveProperty("results");
      expect(json).toHaveProperty("recommendedServerId");
      expect(json).toHaveProperty("source");
      expect(Array.isArray(json.results)).toBe(true);
      expect(json.results.length).toBeGreaterThan(0);
      expect(json.results[0]).toHaveProperty("serverId");
      expect(json.results[0]).toHaveProperty("status");
    });

    it("debe verificar servidores nativos de anime con malId correctamente", async () => {
      const mockFetch = vi.fn().mockResolvedValue(
        new Response("<div>Anime Player</div>", {
          status: 200,
          headers: new Headers({ "content-type": "text/html" }),
        })
      );
      vi.spyOn(globalThis, "fetch").mockImplementation(mockFetch);

      const req = new NextRequest("http://localhost:3000/api/servers/check", {
        method: "POST",
        body: JSON.stringify({
          type: "anime",
          id: 11061,
          season: 1,
          episode: 70,
          malId: 11061,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json.results)).toBe(true);
      expect(json.results.length).toBeGreaterThan(0);

      // Verificar que los servidores sondeados incluyan los servidores nativos de anime esperados
      const serverIds = json.results.map((r: { serverId: string }) => r.serverId);
      expect(serverIds).toContain("anime-zoko-sub");
      expect(serverIds).toContain("anime-vidlink-sub");
    });

    it("debe pasar la opción forceRefresh: true a checkServersHealth", async () => {
      const checkSpy = vi.spyOn(serverHealthModule, "checkServersHealth");

      const req = new NextRequest("http://localhost:3000/api/servers/check", {
        method: "POST",
        body: JSON.stringify({
          type: "movie",
          id: 550,
          forceRefresh: true,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);

      expect(res.status).toBe(200);
      expect(checkSpy).toHaveBeenCalledWith(
        expect.any(Array),
        "movie",
        expect.objectContaining({ forceRefresh: true })
      );
    });
  });

  describe("Manejo de Excepciones del Servidor (500)", () => {
    it("debe capturar errores inesperados, registrarlos en consola y responder 500 con error descriptivo", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(serverHealthModule, "checkServersHealth").mockRejectedValueOnce(
        new Error("Unexpected internal crash")
      );

      const req = new NextRequest("http://localhost:3000/api/servers/check", {
        method: "POST",
        body: JSON.stringify({ type: "movie", id: 550 }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await POST(req);

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json).toEqual({ error: "Error al verificar servidores" });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
