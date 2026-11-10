import { describe, it, expect } from "vitest";
import { getTrendingMedia, getMediaDetail } from "@/services/tmdb";

describe("Servicio TMDB y Fallbacks Resilientes", () => {
  it("debe retornar catálogo de respaldo cuando no hay llamadas exitosas a TMDB", async () => {
    const movies = await getTrendingMedia("movie", 1);
    expect(movies.length).toBeGreaterThan(0);
    expect(movies[0]).toHaveProperty("title");
    expect(movies[0]).toHaveProperty("posterPath");
    expect(movies[0].type).toBe("movie");
  });

  it("debe filtrar el catálogo de respaldo por búsqueda", async () => {
    const results = await getTrendingMedia("movie", 1, "Inception");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((m) => m.title.includes("Inception"))).toBe(true);
  });

  it("debe filtrar el catálogo de respaldo por género", async () => {
    const sciFi = await getTrendingMedia("movie", 1, undefined, "Ciencia ficción");
    expect(sciFi.length).toBeGreaterThan(0);
    sciFi.forEach((m) => {
      expect(
        m.genres.some((g) => g.toLowerCase() === "ciencia ficción")
      ).toBe(true);
    });
  });

  it("debe retornar ficha de detalle completa desde fallback", async () => {
    const detail = await getMediaDetail("movie", 550);
    expect(detail.id).toBe(550);
    expect(detail.title).toBe("Fight Club");
    expect(detail.type).toBe("movie");
    expect(detail.voteAverage).toBeGreaterThan(8);
  });
});
