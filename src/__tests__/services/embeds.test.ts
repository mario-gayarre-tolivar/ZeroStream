import { describe, it, expect } from "vitest";
import { getEmbedServers, resolveTmdbId } from "@/services/embeds";

describe("Servicio de Embeds (Zero-Storage)", () => {
  it("debe resolver IDs de AniList a TMDB para animes populares", () => {
    expect(resolveTmdbId("anime", 16498)).toBe("1429"); // Attack on Titan
    expect(resolveTmdbId("anime", 20)).toBe("46260"); // Naruto
    expect(resolveTmdbId("movie", 550)).toBe("550"); // Movie ID intact
  });

  it("debe generar servidores de alta disponibilidad para películas con VidLink y Embed.su", () => {
    const servers = getEmbedServers("movie", 550, 1, 1, "Fight Club");

    expect(servers.length).toBeGreaterThanOrEqual(4);

    const vidlink = servers.find((s) => s.id === "vidlink");
    expect(vidlink).toBeDefined();
    expect(vidlink?.url).toContain("vidlink.pro/movie/550");
    expect(vidlink?.isRecommended).toBe(true);

    const embedsu = servers.find((s) => s.id === "embedsu");
    expect(embedsu).toBeDefined();
    expect(embedsu?.url).toContain("embed.su/embed/movie/550");

    const superembed = servers.find((s) => s.id === "superembed");
    expect(superembed).toBeDefined();
    expect(superembed?.url).toContain("multiembed.mov/?video_id=550&tmdb=1");
  });

  it("debe incluir temporada y episodio para series de TV", () => {
    const servers = getEmbedServers("tv", 1399, 2, 5, "Game of Thrones");

    const vidlink = servers.find((s) => s.id === "vidlink");
    expect(vidlink?.url).toContain("vidlink.pro/tv/1399/2/5");

    const embedsu = servers.find((s) => s.id === "embedsu");
    expect(embedsu?.url).toContain("embed.su/embed/tv/1399/2/5");

    const superembed = servers.find((s) => s.id === "superembed");
    expect(superembed?.url).toContain("s=2&e=5");
  });

  it("debe proveer servidores dedicados para anime con resolución de ID a TMDB", () => {
    const servers = getEmbedServers("anime", 16498, 1, 5, "Shingeki no Kyojin");

    const vidlink = servers.find((s) => s.id === "anime-vidlink");
    expect(vidlink).toBeDefined();
    // 16498 de AniList debe resolverse a 1429 de TMDB
    expect(vidlink?.url).toContain("vidlink.pro/tv/1429/1/5");

    const embedsu = servers.find((s) => s.id === "anime-embedsu");
    expect(embedsu?.url).toContain("embed.su/embed/tv/1429/1/5");
  });
});
