import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCachedCatalog } from "@/services/catalog-cache";
import * as tmdb from "@/services/tmdb";

describe("Caché en Memoria del Servidor (catalog-cache)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
});
