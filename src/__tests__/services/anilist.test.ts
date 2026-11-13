import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getTrendingAnime, getAnimeDetail } from "@/services/anilist";

describe("Servicio AniList GraphQL y Fallbacks", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debe retornar animes de respaldo cuando la red falla", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network Error"));

    const animeList = await getTrendingAnime(1);
    expect(animeList.length).toBeGreaterThan(0);
    expect(animeList[0].type).toBe("anime");
    expect(animeList[0]).toHaveProperty("title");
    expect(animeList[0]).toHaveProperty("posterPath");
  });

  it("debe filtrar animes de respaldo por búsqueda", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const filtered = await getTrendingAnime(1, "Shingeki");
    expect(filtered.length).toBeGreaterThanOrEqual(1);
    expect(filtered.some((a) => a.title.includes("Shingeki"))).toBe(true);
  });

  it("debe filtrar animes de respaldo por género", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const accion = await getTrendingAnime(1, undefined, "Acción");
    expect(accion.length).toBeGreaterThan(0);
    accion.forEach((item) => {
      expect(item.genres.some((g) => g.toLowerCase() === "acción")).toBe(true);
    });
  });

  it("debe transformar correctamente una respuesta GraphQL exitosa", async () => {
    const mockGraphQLResponse = {
      data: {
        Page: {
          media: [
            {
              id: 99999,
              title: {
                english: "Mock Anime English",
                romaji: "Mock Anime Romaji",
                native: "モックアニメ",
              },
              description: "<p>Descripción con <b>html</b></p>",
              coverImage: {
                extraLarge: "https://example.com/cover-xl.jpg",
                large: "https://example.com/cover-lg.jpg",
              },
              bannerImage: "https://example.com/banner.jpg",
              averageScore: 85,
              episodes: 24,
              seasonYear: 2024,
              status: "RELEASING",
              genres: ["Sci-Fi", "Action"],
            },
          ],
        },
      },
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockGraphQLResponse,
    } as Response);

    const result = await getTrendingAnime(1);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe(99999);
    expect(result[0].title).toBe("Mock Anime English");
    expect(result[0].overview).toBe("Descripción con html");
    expect(result[0].voteAverage).toBe(8.5);
    expect(result[0].releaseDate).toBe("2024");
  });

  it("debe obtener la ficha de detalle de anime y estructurar temporadas y episodios", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const detail = await getAnimeDetail(16498);
    expect(detail.id).toBe(16498);
    expect(detail.title).toBe("Shingeki no Kyojin");
    expect(detail.type).toBe("anime");
    expect(detail.seasons.length).toBeGreaterThan(0);
    expect(detail.seasons[0].episodes.length).toBe(detail.totalEpisodes);
  });
});
