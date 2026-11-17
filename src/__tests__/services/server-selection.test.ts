import { describe, it, expect } from "vitest";
import { resolveAutoSelectedServers } from "@/services/server-selection";
import { ServerOption, ServerCheckResult } from "@/types";

describe("server-selection — resolveAutoSelectedServers", () => {
  const mockAnimeServers: ServerOption[] = [
    {
      id: "anime-vidsrc-sub",
      name: "VidSrc Anime (Sub)",
      quality: "1080p Sub",
      url: "https://vidsrc.net/embed/anime/21/1/1",
      language: "sub",
    },
    {
      id: "anime-vidlink-sub",
      name: "VidLink Anime (Sub)",
      quality: "1080p Sub",
      url: "https://vidlink.pro/anime/21/1/1?sub=1",
      language: "sub",
    },
    {
      id: "anime-vidsrc-dub",
      name: "VidSrc Anime (Dub)",
      quality: "1080p Dub",
      url: "https://vidsrc.net/embed/anime/21/1/1",
      language: "dub",
    },
    {
      id: "anime-autoembed",
      name: "AutoEmbed TMDB Respaldo",
      quality: "1080p Multi",
      url: "https://player.autoembed.cc/embed/tv/37854/1/1",
    },
  ];

  const mockMovieServers: ServerOption[] = [
    {
      id: "embed-su",
      name: "Embed.su",
      quality: "1080p VIP",
      url: "https://embed.su/embed/movie/550",
    },
    {
      id: "vidsrc-cc",
      name: "VidSrc.cc",
      quality: "1080p HD",
      url: "https://vidsrc.cc/v2/embed/movie/550",
    },
    {
      id: "autoembed",
      name: "AutoEmbed",
      quality: "1080p Multi",
      url: "https://player.autoembed.cc/embed/movie/550",
    },
  ];

  describe("Indexación de salud (healthById)", () => {
    it("debe construir un diccionario asociando serverId -> ServerCheckResult", () => {
      const healthResults: ServerCheckResult[] = [
        {
          serverId: "anime-vidsrc-sub",
          status: "healthy",
          reason: "ok",
          latencyMs: 120,
          checkedAt: 1000,
        },
        {
          serverId: "anime-vidlink-sub",
          status: "dead",
          reason: "http_error",
          httpStatus: 500,
          latencyMs: 300,
          checkedAt: 1000,
        },
      ];

      const state = resolveAutoSelectedServers({
        servers: mockAnimeServers,
        mediaType: "anime",
        healthResults,
        clientFailedIds: [],
      });

      expect(state.healthById["anime-vidsrc-sub"]).toEqual(healthResults[0]);
      expect(state.healthById["anime-vidlink-sub"]).toEqual(healthResults[1]);
      expect(state.healthById["anime-autoembed"]).toBeUndefined();
    });

    it("debe devolver un healthById vacío cuando healthResults es vacío", () => {
      const state = resolveAutoSelectedServers({
        servers: mockMovieServers,
        mediaType: "movie",
        healthResults: [],
        clientFailedIds: [],
      });

      expect(state.healthById).toEqual({});
    });
  });

  describe("Filtrado de candidatos y servidores visibles (visibleServers)", () => {
    it("debe filtrar y excluir servidores con status 'dead'", () => {
      const healthResults: ServerCheckResult[] = [
        {
          serverId: "anime-vidsrc-sub",
          status: "dead",
          reason: "http_error",
          httpStatus: 404,
          latencyMs: 80,
          checkedAt: 1000,
        },
      ];

      const state = resolveAutoSelectedServers({
        servers: mockAnimeServers,
        mediaType: "anime",
        healthResults,
        clientFailedIds: [],
      });

      expect(state.visibleServers.map((s) => s.id)).toEqual([
        "anime-vidlink-sub",
        "anime-vidsrc-dub",
        "anime-autoembed",
      ]);
    });

    it("debe filtrar y excluir servidores presentes en clientFailedIds", () => {
      const state = resolveAutoSelectedServers({
        servers: mockAnimeServers,
        mediaType: "anime",
        healthResults: [],
        clientFailedIds: ["anime-vidsrc-sub", "anime-vidsrc-dub"],
      });

      expect(state.visibleServers.map((s) => s.id)).toEqual([
        "anime-vidlink-sub",
        "anime-autoembed",
      ]);
    });

    it("debe conservar servidores con status 'uncertain' o sin resultado de salud", () => {
      const healthResults: ServerCheckResult[] = [
        {
          serverId: "embed-su",
          status: "uncertain",
          reason: "bot_challenge",
          latencyMs: 250,
          checkedAt: 1000,
        },
      ];

      const state = resolveAutoSelectedServers({
        servers: mockMovieServers,
        mediaType: "movie",
        healthResults,
        clientFailedIds: [],
      });

      // Todos siguen visibles ya que ninguno está dead ni en clientFailedIds
      expect(state.visibleServers.map((s) => s.id)).toEqual([
        "embed-su",
        "vidsrc-cc",
        "autoembed",
      ]);
    });

    it("debe preservar el orden relativo original del array servers en visibleServers", () => {
      const healthResults: ServerCheckResult[] = [
        {
          serverId: "vidsrc-cc",
          status: "dead",
          reason: "timeout",
          latencyMs: 5000,
          checkedAt: 1000,
        },
      ];

      const state = resolveAutoSelectedServers({
        servers: mockMovieServers,
        mediaType: "movie",
        healthResults,
        clientFailedIds: [],
      });

      expect(state.visibleServers.map((s) => s.id)).toEqual([
        "embed-su",
        "autoembed",
      ]);
    });
  });

  describe("Autoselección de servidor (selectedServerId)", () => {
    it("debe autoseleccionar el primer servidor healthy respetando prioridad anime (Sub -> Dub -> TMDB)", () => {
      const healthResults: ServerCheckResult[] = [
        {
          serverId: "anime-vidsrc-sub",
          status: "healthy",
          reason: "ok",
          latencyMs: 100,
          checkedAt: 1000,
        },
        {
          serverId: "anime-vidlink-sub",
          status: "healthy",
          reason: "ok",
          latencyMs: 90,
          checkedAt: 1000,
        },
      ];

      const state = resolveAutoSelectedServers({
        servers: mockAnimeServers,
        mediaType: "anime",
        healthResults,
        clientFailedIds: [],
      });

      // El primer sub en orden de prioridad es anime-vidsrc-sub
      expect(state.selectedServerId).toBe("anime-vidsrc-sub");
      expect(state.allFailed).toBe(false);
    });

    it("si el principal Sub está dead, selecciona automáticamente el siguiente Sub disponible", () => {
      const healthResults: ServerCheckResult[] = [
        {
          serverId: "anime-vidsrc-sub",
          status: "dead",
          reason: "http_error",
          httpStatus: 404,
          latencyMs: 50,
          checkedAt: 1000,
        },
        {
          serverId: "anime-vidlink-sub",
          status: "healthy",
          reason: "ok",
          latencyMs: 120,
          checkedAt: 1000,
        },
      ];

      const state = resolveAutoSelectedServers({
        servers: mockAnimeServers,
        mediaType: "anime",
        healthResults,
        clientFailedIds: [],
      });

      expect(state.selectedServerId).toBe("anime-vidlink-sub");
    });

    it("si todos los Sub y Dub están dead, autoselecciona el respaldo TMDB disponible", () => {
      const healthResults: ServerCheckResult[] = [
        {
          serverId: "anime-vidsrc-sub",
          status: "dead",
          reason: "http_error",
          httpStatus: 502,
          latencyMs: 50,
          checkedAt: 1000,
        },
        {
          serverId: "anime-vidlink-sub",
          status: "dead",
          reason: "http_error",
          httpStatus: 502,
          latencyMs: 50,
          checkedAt: 1000,
        },
        {
          serverId: "anime-vidsrc-dub",
          status: "dead",
          reason: "http_error",
          httpStatus: 502,
          latencyMs: 50,
          checkedAt: 1000,
        },
        {
          serverId: "anime-autoembed",
          status: "healthy",
          reason: "ok",
          latencyMs: 110,
          checkedAt: 1000,
        },
      ];

      const state = resolveAutoSelectedServers({
        servers: mockAnimeServers,
        mediaType: "anime",
        healthResults,
        clientFailedIds: [],
      });

      expect(state.selectedServerId).toBe("anime-autoembed");
      expect(state.allFailed).toBe(false);
    });

    it("si ningún candidato disponible es healthy, selecciona el primer candidato con status uncertain", () => {
      const healthResults: ServerCheckResult[] = [
        {
          serverId: "embed-su",
          status: "uncertain",
          reason: "bot_challenge",
          latencyMs: 150,
          checkedAt: 1000,
        },
        {
          serverId: "vidsrc-cc",
          status: "dead",
          reason: "http_error",
          httpStatus: 404,
          latencyMs: 80,
          checkedAt: 1000,
        },
      ];

      const state = resolveAutoSelectedServers({
        servers: mockMovieServers,
        mediaType: "movie",
        healthResults,
        clientFailedIds: ["autoembed"], // autoembed descartado por cliente
      });

      // Solo queda embed-su (uncertain). Debe seleccionarlo.
      expect(state.selectedServerId).toBe("embed-su");
      expect(state.allFailed).toBe(false);
    });

    it("un servidor sin resultado de salud se asume healthy por defecto y puede ser seleccionado", () => {
      // Sin healthResults: todos los servidores se consideran healthy por defecto
      const state = resolveAutoSelectedServers({
        servers: mockMovieServers,
        mediaType: "movie",
        healthResults: [],
        clientFailedIds: [],
      });

      expect(state.selectedServerId).toBe("embed-su");
      expect(state.allFailed).toBe(false);
    });
  });

  describe("Estado de fallo global (allFailed)", () => {
    it("debe retornar allFailed: true, selectedServerId: null y visibleServers: [] si todos los servidores están dead", () => {
      const healthResults: ServerCheckResult[] = mockMovieServers.map((s) => ({
        serverId: s.id,
        status: "dead" as const,
        reason: "http_error" as const,
        httpStatus: 500,
        latencyMs: 100,
        checkedAt: 1000,
      }));

      const state = resolveAutoSelectedServers({
        servers: mockMovieServers,
        mediaType: "movie",
        healthResults,
        clientFailedIds: [],
      });

      expect(state.allFailed).toBe(true);
      expect(state.selectedServerId).toBeNull();
      expect(state.visibleServers).toEqual([]);
    });

    it("debe retornar allFailed: true, selectedServerId: null y visibleServers: [] si todos están en clientFailedIds", () => {
      const state = resolveAutoSelectedServers({
        servers: mockMovieServers,
        mediaType: "movie",
        healthResults: [],
        clientFailedIds: ["embed-su", "vidsrc-cc", "autoembed"],
      });

      expect(state.allFailed).toBe(true);
      expect(state.selectedServerId).toBeNull();
      expect(state.visibleServers).toEqual([]);
    });

    it("debe retornar allFailed: true y selectedServerId: null para lista de servidores vacía", () => {
      const state = resolveAutoSelectedServers({
        servers: [],
        mediaType: "movie",
        healthResults: [],
        clientFailedIds: [],
      });

      expect(state.allFailed).toBe(true);
      expect(state.selectedServerId).toBeNull();
      expect(state.visibleServers).toEqual([]);
      expect(state.healthById).toEqual({});
    });
  });

  describe("Modo forzado showAllOverride", () => {
    it("con showAllOverride: true y todos dead, visibleServers contiene todos los servidores y selectedServerId no es nulo", () => {
      const healthResults: ServerCheckResult[] = mockAnimeServers.map((s) => ({
        serverId: s.id,
        status: "dead" as const,
        reason: "http_error" as const,
        latencyMs: 50,
        checkedAt: 1000,
      }));

      const state = resolveAutoSelectedServers({
        servers: mockAnimeServers,
        mediaType: "anime",
        healthResults,
        clientFailedIds: [],
        showAllOverride: true,
      });

      expect(state.visibleServers).toHaveLength(mockAnimeServers.length);
      expect(state.visibleServers.map((s) => s.id)).toEqual(
        mockAnimeServers.map((s) => s.id)
      );
      // allFailed sigue siendo true porque no hay candidatos sanos
      expect(state.allFailed).toBe(true);
      // Pero selectedServerId se recupera del primer servidor ordenado por prioridad
      expect(state.selectedServerId).toBe("anime-vidsrc-sub");
    });

    it("con showAllOverride: true y algunos servidores sanos, visibleServers contiene todos pero selectedServerId prefiere el candidato disponible", () => {
      const healthResults: ServerCheckResult[] = [
        {
          serverId: "anime-vidsrc-sub",
          status: "dead",
          reason: "http_error",
          latencyMs: 50,
          checkedAt: 1000,
        },
        {
          serverId: "anime-vidlink-sub",
          status: "healthy",
          reason: "ok",
          latencyMs: 120,
          checkedAt: 1000,
        },
      ];

      const state = resolveAutoSelectedServers({
        servers: mockAnimeServers,
        mediaType: "anime",
        healthResults,
        clientFailedIds: [],
        showAllOverride: true,
      });

      // Todos los servidores visibles
      expect(state.visibleServers).toHaveLength(mockAnimeServers.length);
      // Pero el seleccionado es el primer candidato disponible y sano
      expect(state.selectedServerId).toBe("anime-vidlink-sub");
      expect(state.allFailed).toBe(false);
    });

    it("con showAllOverride: true y servers vacío, visibleServers es [] y selectedServerId es null", () => {
      const state = resolveAutoSelectedServers({
        servers: [],
        mediaType: "movie",
        healthResults: [],
        clientFailedIds: [],
        showAllOverride: true,
      });

      expect(state.visibleServers).toEqual([]);
      expect(state.selectedServerId).toBeNull();
      expect(state.allFailed).toBe(true);
    });
  });

  describe("Inmutabilidad", () => {
    it("no debe mutar el array servers, healthResults o clientFailedIds de entrada", () => {
      const serversCopy = [...mockMovieServers];
      const healthResults: ServerCheckResult[] = [
        {
          serverId: "vidsrc-cc",
          status: "dead",
          reason: "timeout",
          latencyMs: 5000,
          checkedAt: 1000,
        },
      ];
      const healthCopy = [...healthResults];
      const failedIds = ["embed-su"];
      const failedCopy = [...failedIds];

      const state = resolveAutoSelectedServers({
        servers: serversCopy,
        mediaType: "movie",
        healthResults,
        clientFailedIds: failedIds,
      });

      expect(serversCopy).toEqual(mockMovieServers);
      expect(healthResults).toEqual(healthCopy);
      expect(failedIds).toEqual(failedCopy);
      // visibleServers debe ser una nueva instancia de array
      expect(state.visibleServers).not.toBe(serversCopy);
    });
  });
});
