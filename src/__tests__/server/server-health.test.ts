import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  classifyServerResponse,
  probeServerUrl,
  checkServersHealth,
  clearServerHealthCache,
  serverHealthMemoryCache,
} from "@/server/server-health";
import { ServerOption } from "@/types";

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

describe("probeServerUrl", () => {
  beforeEach(() => {
    clearServerHealthCache();
  });

  const dummyServer: ServerOption = {
    id: "vidsrc",
    name: "VidSrc",
    quality: "HD",
    url: "https://vidsrc.test/embed/movie/123",
  };

  it("debe retornar healthy/ok cuando fetchFn responde 200 con HTML válido", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response("<html><body><div id='player'></div></body></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      })
    );

    const result = await probeServerUrl(dummyServer, { fetchFn: mockFetch as any });

    expect(result.serverId).toBe("vidsrc");
    expect(result.status).toBe("healthy");
    expect(result.reason).toBe("ok");
    expect(result.httpStatus).toBe(200);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.checkedAt).toBeGreaterThan(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [calledUrl, calledInit] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe("https://vidsrc.test/embed/movie/123");
    expect(calledInit.headers["User-Agent"]).toContain("Mozilla/5.0");
    expect(calledInit.headers["Accept"]).toBeDefined();
    expect(calledInit.signal).toBeDefined();
  });

  it("debe retornar dead/timeout cuando la petición aborta por timeout", async () => {
    const mockFetch = vi.fn().mockImplementation((_url, init) => {
      return new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => {
          const err = new Error("The operation was aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    });

    const result = await probeServerUrl(dummyServer, {
      fetchFn: mockFetch as any,
      timeoutMs: 30,
    });

    expect(result.serverId).toBe("vidsrc");
    expect(result.status).toBe("dead");
    expect(result.reason).toBe("timeout");
    expect(result.httpStatus).toBeUndefined();
    expect(result.latencyMs).toBeGreaterThanOrEqual(25);
  });

  it("debe retornar dead/network_error ante errores de conexión o DNS", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));

    const result = await probeServerUrl(dummyServer, {
      fetchFn: mockFetch as any,
    });

    expect(result.serverId).toBe("vidsrc");
    expect(result.status).toBe("dead");
    expect(result.reason).toBe("network_error");
    expect(result.httpStatus).toBeUndefined();
  });

  it("debe clasificar respuestas HTTP de bloqueo y retos bot", async () => {
    // 403 con cloudflare
    const mockFetchCf = vi.fn().mockResolvedValue(
      new Response("<html><head><title>Just a moment...</title></head></html>", {
        status: 403,
      })
    );
    const cfResult = await probeServerUrl(dummyServer, {
      fetchFn: mockFetchCf as any,
      forceRefresh: true,
    });
    expect(cfResult.status).toBe("uncertain");
    expect(cfResult.reason).toBe("bot_challenge");
    expect(cfResult.httpStatus).toBe(403);

    // 200 con frame_blocked (X-Frame-Options)
    const mockFetchBlocked = vi.fn().mockResolvedValue(
      new Response("<html><div>ok</div></html>", {
        status: 200,
        headers: { "x-frame-options": "DENY" },
      })
    );
    const blockedResult = await probeServerUrl(dummyServer, {
      fetchFn: mockFetchBlocked as any,
      forceRefresh: true,
    });
    expect(blockedResult.status).toBe("dead");
    expect(blockedResult.reason).toBe("frame_blocked");

    // 200 con html_error_page ("video not found")
    const mockFetchNotFound = vi.fn().mockResolvedValue(
      new Response("<div>Error: Video Not Found</div>", {
        status: 200,
      })
    );
    const notFoundResult = await probeServerUrl(dummyServer, {
      fetchFn: mockFetchNotFound as any,
      forceRefresh: true,
    });
    expect(notFoundResult.status).toBe("dead");
    expect(notFoundResult.reason).toBe("html_error_page");
  });

  it("debe limitar la lectura de HTML a los primeros 16384 caracteres", async () => {
    const hugeHtml = "a".repeat(30000) + "video not found";
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(hugeHtml, {
        status: 200,
      })
    );

    // Al truncar en 16384, la frase 'video not found' que está al final no debe ser vista
    const result = await probeServerUrl(dummyServer, {
      fetchFn: mockFetch as any,
      forceRefresh: true,
    });
    expect(result.status).toBe("healthy");
    expect(result.reason).toBe("ok");
  });

  it("debe leer incrementalmente de res.body.getReader() y llamar a cancel() tras 16384 bytes", async () => {
    const cancelSpy = vi.fn().mockResolvedValue(undefined);
    // Dos chunks de 8192 bytes = 16384 bytes exactos
    const chunk1 = new Uint8Array(8192).fill(65); // 'A'
    const chunk2 = new Uint8Array(8192).fill(66); // 'B'
    const chunk3 = new Uint8Array(8192).fill(67); // 'C'

    let readCount = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(async () => {
        readCount++;
        if (readCount === 1) return { done: false, value: chunk1 };
        if (readCount === 2) return { done: false, value: chunk2 };
        return { done: false, value: chunk3 };
      }),
      cancel: cancelSpy,
    };

    const mockResponse = {
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
      body: {
        getReader: () => mockReader,
      },
      text: vi.fn(),
    };

    const mockFetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await probeServerUrl(dummyServer, {
      fetchFn: mockFetch as any,
      forceRefresh: true,
    });

    expect(mockReader.read).toHaveBeenCalledTimes(2);
    expect(cancelSpy).toHaveBeenCalled();
    expect(result.status).toBe("healthy");
    expect(result.reason).toBe("ok");
    expect(mockResponse.text).not.toHaveBeenCalled();
  });

  it("debe almacenar en caché LRU y no volver a llamar a fetchFn salvo forceRefresh: true", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response("<html><body>Player</body></html>", { status: 200 })
    );

    // 1ra llamada: sondeo live
    const res1 = await probeServerUrl(dummyServer, { fetchFn: mockFetch as any });
    expect(res1.status).toBe("healthy");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 2da llamada: desde caché, mockFetch NO debe ser llamado
    const res2 = await probeServerUrl(dummyServer, { fetchFn: mockFetch as any });
    expect(res2.status).toBe("healthy");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // 3ra llamada con forceRefresh: true -> vuelve a llamar
    const res3 = await probeServerUrl(dummyServer, {
      fetchFn: mockFetch as any,
      forceRefresh: true,
    });
    expect(res3.status).toBe("healthy");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe("clearServerHealthCache", () => {
  it("debe vaciar la caché en memoria", async () => {
    const server: ServerOption = {
      id: "srv1",
      name: "Srv 1",
      quality: "HD",
      url: "https://srv1.test",
    };
    const mockFetch = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));

    await probeServerUrl(server, { fetchFn: mockFetch as any });
    expect(serverHealthMemoryCache.get(server.url)).toBeDefined();

    clearServerHealthCache();
    expect(serverHealthMemoryCache.get(server.url)).toBeUndefined();
  });
});

describe("checkServersHealth", () => {
  beforeEach(() => {
    clearServerHealthCache();
  });

  const servers: ServerOption[] = [
    { id: "s1", name: "Server 1", quality: "1080p", url: "https://s1.test" },
    { id: "s2", name: "Server 2", quality: "720p", url: "https://s2.test" },
    { id: "s3", name: "Server 3", quality: "480p", url: "https://s3.test" },
  ];

  it("debe sondear servidores en paralelo y retornar source: 'live' cuando ninguno está en caché", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      return Promise.resolve(new Response(`Player for ${url}`, { status: 200 }));
    });

    const response = await checkServersHealth(servers, "movie", {
      fetchFn: mockFetch as any,
    });

    expect(response.source).toBe("live");
    expect(response.results).toHaveLength(3);
    expect(response.results.map((r) => r.serverId)).toEqual(["s1", "s2", "s3"]);
    expect(response.recommendedServerId).toBe("s1");
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("debe retornar source: 'cache' cuando todos los servidores están en caché", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      return Promise.resolve(new Response(`Player for ${url}`, { status: 200 }));
    });

    // Llenar caché primero
    await checkServersHealth(servers, "movie", { fetchFn: mockFetch as any });
    expect(mockFetch).toHaveBeenCalledTimes(3);

    // Segunda llamada
    const response = await checkServersHealth(servers, "movie", {
      fetchFn: mockFetch as any,
    });
    expect(response.source).toBe("cache");
    expect(response.results).toHaveLength(3);
    expect(mockFetch).toHaveBeenCalledTimes(3); // No se realizaron más llamadas
  });

  it("debe retornar source: 'mixed' cuando parte está en caché y parte es nuevo", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      return Promise.resolve(new Response(`Player for ${url}`, { status: 200 }));
    });

    // Cachear solo s1
    await probeServerUrl(servers[0], { fetchFn: mockFetch as any });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const response = await checkServersHealth(servers, "movie", {
      fetchFn: mockFetch as any,
    });
    expect(response.source).toBe("mixed");
    expect(response.results).toHaveLength(3);
    expect(mockFetch).toHaveBeenCalledTimes(3); // +2 nuevos
  });

  it("debe saltar el servidor de mayor prioridad si está dead y recomendar el primero healthy", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("s1")) {
        // s1 está muerto (500)
        return Promise.resolve(new Response("Error 500", { status: 500 }));
      }
      return Promise.resolve(new Response("<div>Player OK</div>", { status: 200 }));
    });

    const response = await checkServersHealth(servers, "movie", {
      fetchFn: mockFetch as any,
    });

    expect(response.recommendedServerId).toBe("s2");
    expect(response.results.find((r) => r.serverId === "s1")?.status).toBe("dead");
    expect(response.results.find((r) => r.serverId === "s2")?.status).toBe("healthy");
  });

  it("para anime, debe priorizar servidores sub sobre dub según orderServersForAutoSelection", async () => {
    const animeServers: ServerOption[] = [
      {
        id: "anime-tmdb",
        name: "Servidor TMDB",
        quality: "HD",
        url: "https://tmdb.test",
        autoPriority: 3,
      },
      {
        id: "anime-sub",
        name: "Servidor Sub",
        quality: "HD",
        url: "https://sub.test",
        language: "sub",
        autoPriority: 1,
      },
      {
        id: "anime-dub",
        name: "Servidor Dub",
        quality: "HD",
        url: "https://dub.test",
        language: "dub",
        autoPriority: 2,
      },
    ];

    const mockFetch = vi.fn().mockResolvedValue(
      new Response("<div>Video Player</div>", { status: 200 })
    );

    const response = await checkServersHealth(animeServers, "anime", {
      fetchFn: mockFetch as any,
    });

    // Aunque anime-tmdb estaba primero en el array, anime-sub tiene mayor prioridad
    expect(response.recommendedServerId).toBe("anime-sub");
  });

  it("debe recomendar un servidor uncertain si ninguno es healthy", async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("s1")) {
        // dead
        return Promise.resolve(new Response("Not found", { status: 404 }));
      }
      if (url.includes("s2")) {
        // uncertain (bot challenge)
        return Promise.resolve(
          new Response("Just a moment...", { status: 403 })
        );
      }
      // dead
      return Promise.resolve(new Response("500 Error", { status: 500 }));
    });

    const response = await checkServersHealth(servers, "movie", {
      fetchFn: mockFetch as any,
    });

    expect(response.recommendedServerId).toBe("s2");
  });

  it("debe retornar recommendedServerId: null si todos los servidores están dead", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response("404 not found", { status: 404 })
    );

    const response = await checkServersHealth(servers, "movie", {
      fetchFn: mockFetch as any,
    });

    expect(response.recommendedServerId).toBeNull();
    expect(response.results.every((r) => r.status === "dead")).toBe(true);
  });
});
