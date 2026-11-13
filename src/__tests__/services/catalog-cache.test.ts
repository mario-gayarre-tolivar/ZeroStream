import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCachedCatalog, catalogMemoryCache } from "@/services/catalog-cache";
import { BoundedMemoryCache } from "@/services/lru-cache";
import * as tmdb from "@/services/tmdb";

describe("Caché en Memoria del Servidor (catalog-cache y BoundedMemoryCache)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    catalogMemoryCache.clear();
  });

  it("BoundedMemoryCache debe desalojar la clave más antigua al superar maxSize (LRU)", () => {
    const lru = new BoundedMemoryCache<string>(3);
    lru.set("k1", "v1", 10000);
    lru.set("k2", "v2", 10000);
    lru.set("k3", "v3", 10000);

    expect(lru.size).toBe(3);
    expect(lru.get("k1")).toBe("v1"); // k1 ahora es recientemente usada; k2 pasa a ser la más antigua

    lru.set("k4", "v4", 10000); // Supera el límite de 3 -> desaloja k2
    expect(lru.size).toBe(3);
    expect(lru.get("k2")).toBeUndefined();
    expect(lru.get("k1")).toBe("v1");
    expect(lru.get("k3")).toBe("v3");
    expect(lru.get("k4")).toBe("v4");
  });

  it("BoundedMemoryCache debe respetar TTL de expiración", () => {
    const lru = new BoundedMemoryCache<string>(5);
    lru.set("expiring", "value", -1); // Expirado de inmediato

    expect(lru.get("expiring")).toBeUndefined();
    expect(lru.getStale("expiring")).toBe("value");
  });

  it("debe consultar upstream y luego servir desde caché en la segunda llamada", async () => {
    const mockMedia = [
      {
        id: 101,
        title: "Test Movie",
        type: "movie" as const,
        overview: "Sinopsis de prueba",
        posterPath: "/poster.jpg",
        backdropPath: "/backdrop.jpg",
        releaseDate: "2024",
        voteAverage: 8.5,
        genres: ["Acción"],
      },
    ];

    const spy = vi
      .spyOn(tmdb, "getTrendingMedia")
      .mockResolvedValueOnce(mockMedia);

    // Primera llamada: upstream
    const firstCall = await getCachedCatalog("movie", 999);
    expect(firstCall.source).toBe("upstream");
    expect(firstCall.data).toEqual(mockMedia);
    expect(spy).toHaveBeenCalledTimes(1);

    // Segunda llamada con mismos parámetros: servir desde memoria (cache)
    const secondCall = await getCachedCatalog("movie", 999);
    expect(secondCall.source).toBe("cache");
    expect(secondCall.data).toEqual(mockMedia);
    expect(spy).toHaveBeenCalledTimes(1); // No vuelve a llamar upstream
  });

  it("debe entregar stale data cuando upstream lanza error", async () => {
    const mockMedia = [
      {
        id: 202,
        title: "Stale Movie",
        type: "movie" as const,
        overview: "Sinopsis",
        posterPath: "/stale.jpg",
        backdropPath: "/stale.jpg",
        releaseDate: "2023",
        voteAverage: 7.0,
        genres: ["Drama"],
      },
    ];

    // Cargar previamente stale data
    catalogMemoryCache.set("movie:1::", mockMedia, -1);

    // Upstream falla
    vi.spyOn(tmdb, "getTrendingMedia").mockRejectedValueOnce(new Error("TMDB 500"));

    const res = await getCachedCatalog("movie", 1);
    expect(res.source).toBe("stale_fallback");
    expect(res.data).toEqual(mockMedia);
  });
});
