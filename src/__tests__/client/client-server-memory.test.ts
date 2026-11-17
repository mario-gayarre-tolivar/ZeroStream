import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  buildMediaEpisodeKey,
  getFailedServerIds,
  markServerFailed,
  clearFailedServers,
  StoredFailedEntry,
} from "@/client/client-server-memory";

describe("client-server-memory — Memoria temporal de servidores fallidos", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("buildMediaEpisodeKey", () => {
    it("debe generar 'movie:${mediaId}' para películas ignorando season y episode", () => {
      expect(buildMediaEpisodeKey("movie", 550)).toBe("movie:550");
      expect(buildMediaEpisodeKey("movie", "tt123456")).toBe("movie:tt123456");
      // Ignora season y episode si se proporcionan para movie
      expect(buildMediaEpisodeKey("movie", 550, 1, 2)).toBe("movie:550");
    });

    it("debe generar 'tv:${mediaId}:${season}:${episode}' para series", () => {
      expect(buildMediaEpisodeKey("tv", 1399, 2, 5)).toBe("tv:1399:2:5");
      expect(buildMediaEpisodeKey("tv", "breaking-bad", 1, 1)).toBe("tv:breaking-bad:1:1");
    });

    it("debe usar season=1 y episode=1 por defecto para series si no se definen", () => {
      expect(buildMediaEpisodeKey("tv", 1399)).toBe("tv:1399:1:1");
      expect(buildMediaEpisodeKey("tv", 1399, 3)).toBe("tv:1399:3:1");
    });

    it("debe generar 'anime:${mediaId}:${season}:${episode}' para anime", () => {
      expect(buildMediaEpisodeKey("anime", 21, 1, 10)).toBe("anime:21:1:10");
      expect(buildMediaEpisodeKey("anime", 21)).toBe("anime:21:1:1");
    });
  });

  describe("getFailedServerIds", () => {
    it("debe retornar un array vacío si no hay servidores registrados para la clave", () => {
      expect(getFailedServerIds("movie:999")).toEqual([]);
    });

    it("debe retornar los IDs activos guardados en sessionStorage", () => {
      const mediaKey = "movie:100";
      const entries: StoredFailedEntry[] = [
        { serverId: "vidlink", expiresAt: Date.now() + 60000 },
        { serverId: "vidsrc", expiresAt: Date.now() + 120000 },
      ];
      sessionStorage.setItem(`zs_failed_servers:${mediaKey}`, JSON.stringify(entries));

      const failed = getFailedServerIds(mediaKey);
      expect(failed).toEqual(["vidlink", "vidsrc"]);
    });

    it("debe purgar automáticamente entradas cuyo TTL expiró y actualizar el storage", () => {
      const mediaKey = "tv:200:1:1";
      const now = 1700000000000;
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const entries: StoredFailedEntry[] = [
        { serverId: "expired-server", expiresAt: now - 1000 },
        { serverId: "active-server", expiresAt: now + 50000 },
      ];
      sessionStorage.setItem(`zs_failed_servers:${mediaKey}`, JSON.stringify(entries));

      const active = getFailedServerIds(mediaKey);
      expect(active).toEqual(["active-server"]);

      // Verificar que el storage fue actualizado limpiando la entrada expirada
      const rawStored = sessionStorage.getItem(`zs_failed_servers:${mediaKey}`);
      expect(rawStored).toBeTruthy();
      const updatedEntries: StoredFailedEntry[] = JSON.parse(rawStored!);
      expect(updatedEntries).toEqual([{ serverId: "active-server", expiresAt: now + 50000 }]);
    });

    it("debe purgar todo si todas las entradas expiraron", () => {
      const mediaKey = "anime:300:1:1";
      const now = 1700000000000;
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const entries: StoredFailedEntry[] = [
        { serverId: "expired-1", expiresAt: now - 5000 },
        { serverId: "expired-2", expiresAt: now - 1000 },
      ];
      sessionStorage.setItem(`zs_failed_servers:${mediaKey}`, JSON.stringify(entries));

      const active = getFailedServerIds(mediaKey);
      expect(active).toEqual([]);
    });

    it("debe manejar JSON corrupto en sessionStorage sin lanzar error retornando []", () => {
      const mediaKey = "movie:corrupt";
      sessionStorage.setItem(`zs_failed_servers:${mediaKey}`, "invalid-json{{");

      expect(() => getFailedServerIds(mediaKey)).not.toThrow();
      expect(getFailedServerIds(mediaKey)).toEqual([]);
    });
  });

  describe("markServerFailed", () => {
    it("debe agregar un servidor fallido con TTL por defecto (30 min) y retornar la lista", () => {
      const mediaKey = "movie:550";
      const now = 1700000000000;
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const result = markServerFailed(mediaKey, "vidlink");
      expect(result).toEqual(["vidlink"]);

      const raw = sessionStorage.getItem(`zs_failed_servers:${mediaKey}`);
      expect(raw).toBeTruthy();
      const stored: StoredFailedEntry[] = JSON.parse(raw!);
      expect(stored).toEqual([
        {
          serverId: "vidlink",
          expiresAt: now + 30 * 60 * 1000,
        },
      ]);
    });

    it("debe soportar TTL personalizado", () => {
      const mediaKey = "movie:550";
      const now = 1700000000000;
      vi.useFakeTimers();
      vi.setSystemTime(now);

      const customTtl = 5000;
      markServerFailed(mediaKey, "embedsu", customTtl);

      const raw = sessionStorage.getItem(`zs_failed_servers:${mediaKey}`);
      const stored: StoredFailedEntry[] = JSON.parse(raw!);
      expect(stored[0].expiresAt).toBe(now + customTtl);
    });

    it("debe acumular múltiples servidores fallidos para la misma clave", () => {
      const mediaKey = "tv:500:2:3";

      markServerFailed(mediaKey, "server1");
      const result = markServerFailed(mediaKey, "server2");

      expect(result).toContain("server1");
      expect(result).toContain("server2");
      expect(result).toHaveLength(2);
    });

    it("debe actualizar expiresAt si un servidor ya estaba marcado como fallido", () => {
      const mediaKey = "movie:550";
      const now = 1700000000000;
      vi.useFakeTimers();
      vi.setSystemTime(now);

      markServerFailed(mediaKey, "server1", 10000);

      // Avanzamos 5 segundos y volvemos a marcarlo con 30 minutos
      vi.advanceTimersByTime(5000);
      const updatedTime = Date.now();
      markServerFailed(mediaKey, "server1", 1800000);

      const raw = sessionStorage.getItem(`zs_failed_servers:${mediaKey}`);
      const stored: StoredFailedEntry[] = JSON.parse(raw!);
      expect(stored).toHaveLength(1);
      expect(stored[0].serverId).toBe("server1");
      expect(stored[0].expiresAt).toBe(updatedTime + 1800000);
    });

    it("debe aislar los servidores fallidos entre diferentes mediaKeys", () => {
      markServerFailed("movie:1", "serverA");
      markServerFailed("movie:2", "serverB");

      expect(getFailedServerIds("movie:1")).toEqual(["serverA"]);
      expect(getFailedServerIds("movie:2")).toEqual(["serverB"]);
    });
  });

  describe("clearFailedServers", () => {
    it("debe eliminar del storage todos los servidores fallidos de la clave indicada", () => {
      const mediaKey = "tv:100:1:1";
      markServerFailed(mediaKey, "srv1");
      markServerFailed(mediaKey, "srv2");
      expect(getFailedServerIds(mediaKey)).toHaveLength(2);

      clearFailedServers(mediaKey);

      expect(getFailedServerIds(mediaKey)).toEqual([]);
      expect(sessionStorage.getItem(`zs_failed_servers:${mediaKey}`)).toBeNull();
    });

    it("no debe afectar a otras mediaKeys al borrar una", () => {
      markServerFailed("movie:A", "server1");
      markServerFailed("movie:B", "server2");

      clearFailedServers("movie:A");

      expect(getFailedServerIds("movie:A")).toEqual([]);
      expect(getFailedServerIds("movie:B")).toEqual(["server2"]);
    });
  });

  describe("Resiliencia SSR y Fallback en Memoria", () => {
    it("debe degradar a memoria si sessionStorage.getItem lanza excepción", () => {
      const mediaKey = "movie:fallback-read";
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new DOMException("The operation is insecure.", "SecurityError");
      });

      expect(() => getFailedServerIds(mediaKey)).not.toThrow();
      expect(getFailedServerIds(mediaKey)).toEqual([]);
    });

    it("debe guardar y leer de memoria si sessionStorage lanza excepción en setItem", () => {
      const mediaKey = "movie:fallback-write";
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      });

      // No debe lanzar error y debe persistir en memoria fallback
      expect(() => markServerFailed(mediaKey, "srvFallback")).not.toThrow();
      const failed = getFailedServerIds(mediaKey);
      expect(failed).toEqual(["srvFallback"]);

      // Y clearFailedServers debe limpiar la memoria fallback
      clearFailedServers(mediaKey);
      expect(getFailedServerIds(mediaKey)).toEqual([]);
    });

    it("debe respetar TTL en memoria fallback", () => {
      const mediaKey = "movie:fallback-ttl";
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage unavailable");
      });
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage unavailable");
      });

      const now = 1700000000000;
      vi.useFakeTimers();
      vi.setSystemTime(now);

      markServerFailed(mediaKey, "srvExpiring", 5000);
      expect(getFailedServerIds(mediaKey)).toEqual(["srvExpiring"]);

      // Avanzar el tiempo más allá del TTL
      vi.advanceTimersByTime(6000);
      expect(getFailedServerIds(mediaKey)).toEqual([]);
    });
  });
});
