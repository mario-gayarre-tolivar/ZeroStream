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

  it("debe calcular el número total de episodios emitidos a partir de nextAiringEpisode cuando episodes es null (animes continuos como One Piece)", async () => {
    const mockOnePieceResponse = {
      data: {
        Media: {
          id: 21,
          title: {
            romaji: "ONE PIECE",
            english: "ONE PIECE",
            native: "ワンピース",
          },
          description: "Gol D. Roger fue conocido como el 'Rey de los Piratas'...",
          coverImage: {
            extraLarge: "https://example.com/onepiece.jpg",
            large: "https://example.com/onepiece.jpg",
          },
          bannerImage: "https://example.com/op-banner.jpg",
          averageScore: 88,
          episodes: null, // Null en AniList para series continuas
          seasonYear: 1999,
          status: "RELEASING",
          genres: ["Action", "Adventure", "Comedy"],
          duration: 24,
          nextAiringEpisode: {
            episode: 1125, // El próximo capítulo en emitirse es el 1125
          },
          trailer: null,
        },
      },
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockOnePieceResponse,
    } as Response);

    const detail = await getAnimeDetail(21);
    expect(detail.id).toBe(21);
    // Debe calcular 1125 - 1 = 1124 episodios emitidos, no caer en el falso límite de 12
    expect(detail.totalEpisodes).toBe(1124);
    expect(detail.seasons[0].episodeCount).toBe(1124);
    expect(detail.seasons[0].episodes.length).toBe(1124);
    expect(detail.seasons[0].episodes[1123].episodeNumber).toBe(1124);
  });
});
