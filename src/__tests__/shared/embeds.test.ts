import { describe, it, expect } from "vitest";
import { getEmbedServers, resolveTmdbId, orderServersForAutoSelection } from "@/shared/embeds";
import { ServerOption } from "@/types";

describe("Servicio de Embeds (Shared / Isomórfico)", () => {
  it("debe resolver IDs de AniList a TMDB para animes populares y corregir asignaciones erróneas", () => {
    expect(resolveTmdbId("anime", 16498)).toBe("1429"); // Attack on Titan
    expect(resolveTmdbId("anime", 20)).toBe("46260"); // Naruto
    expect(resolveTmdbId("movie", 550)).toBe("550"); // Movie ID intact

    // Casos reportados corregidos
    expect(resolveTmdbId("anime", 11061)).toBe("46298"); // Hunter x Hunter (2011), no 42705 (Hajime no Ippo)
    expect(resolveTmdbId("anime", 161645)).toBe("220542"); // The Apothecary Diaries / Kusuriya no Hitorigoto
    expect(resolveTmdbId("anime", 1735)).toBe("31910"); // Naruto Shippuden, no 46298
    expect(resolveTmdbId("anime", 20605)).toBe("61374"); // Tokyo Ghoul, no 61663
  });

  it("debe priorizar explicitTmdbId sobre el mapeo estático cuando se proporciona", () => {
    expect(resolveTmdbId("anime", 999999, "88888")).toBe("88888");
    expect(resolveTmdbId("anime", 11061, "99999")).toBe("99999");
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

    const smashy = servers.find((s) => s.id === "smashystream");
    expect(smashy).toBeDefined();
    expect(smashy?.url).toContain("player.smashy.stream/movie/550");
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

  it("debe proveer servidores dedicados para anime nativos (Zoko/HiAnime y VidLink Anime) con MAL ID y episodio absoluto", () => {
    const servers = getEmbedServers("anime", 11061, 1, 70, "Hunter x Hunter", "46298", 11061);

    const zokoSub = servers.find((s) => s.id === "anime-zoko-sub");
    expect(zokoSub).toBeDefined();
    expect(zokoSub?.url).toContain("zokoanime.video/stream/mal/11061/70/sub?color=f0b44c");
    expect(zokoSub?.isRecommended).toBe(true);

    const zokoDub = servers.find((s) => s.id === "anime-zoko-dub");
    expect(zokoDub).toBeDefined();
    expect(zokoDub?.url).toContain("zokoanime.video/stream/mal/11061/70/dub?color=f0b44c");

    const vidlinkSub = servers.find((s) => s.id === "anime-vidlink-sub");
    expect(vidlinkSub).toBeDefined();
    expect(vidlinkSub?.url).toContain("vidlink.pro/anime/11061/70/sub?fallback=true");

    const vidlinkDub = servers.find((s) => s.id === "anime-vidlink-dub");
    expect(vidlinkDub).toBeDefined();
    expect(vidlinkDub?.url).toContain("vidlink.pro/anime/11061/70/dub?fallback=true");
  });

  it("debe usar AniList ID como fallback si no se proporciona malId para servidores nativos", () => {
    const servers = getEmbedServers("anime", 16498, 1, 5, "Shingeki no Kyojin");

    const zokoSub = servers.find((s) => s.id === "anime-zoko-sub");
    expect(zokoSub?.url).toContain("zokoanime.video/stream/mal/16498/5/sub");

    const vidlinkSub = servers.find((s) => s.id === "anime-vidlink-sub");
    expect(vidlinkSub?.url).toContain("vidlink.pro/anime/16498/5/sub");
  });

  it("debe mantener servidores TMDB de respaldo al final de la lista para anime", () => {
    const servers = getEmbedServers(
      "anime",
      161645,
      1,
      1,
      "The Apothecary Diaries",
      "220542",
      54492
    );

    expect(servers[0].id).toBe("anime-zoko-sub");
    expect(servers[0].url).toContain("zokoanime.video/stream/mal/54492/1/sub");

    const embedsu = servers.find((s) => s.id === "anime-embedsu");
    expect(embedsu).toBeDefined();
    expect(embedsu?.url).toContain("embed.su/embed/tv/220542/1/1");

    const superembed = servers.find((s) => s.id === "anime-super");
    expect(superembed).toBeDefined();
    expect(superembed?.url).toContain("multiembed.mov/?video_id=220542&tmdb=1&s=1&e=1");
  });

  describe("orderServersForAutoSelection", () => {
    it("debe ordenar servidores de anime priorizando Sub -> Dub -> TMDB sin mutar el array original", () => {
      const originalServers = getEmbedServers(
        "anime",
        11061,
        1,
        70,
        "Hunter x Hunter",
        "46298",
        11061
      );
      const originalIds = originalServers.map((s) => s.id);

      expect(originalIds).toEqual([
        "anime-zoko-sub",
        "anime-zoko-dub",
        "anime-vidlink-sub",
        "anime-vidlink-dub",
        "anime-embedsu",
        "anime-super",
        "anime-autoembed",
        "anime-smashy",
      ]);

      const ordered = orderServersForAutoSelection(originalServers, "anime");

      expect(ordered).not.toBe(originalServers);
      expect(originalServers.map((s) => s.id)).toEqual(originalIds);

      expect(ordered.map((s) => s.id)).toEqual([
        "anime-zoko-sub",
        "anime-vidlink-sub",
        "anime-zoko-dub",
        "anime-vidlink-dub",
        "anime-embedsu",
        "anime-super",
        "anime-autoembed",
        "anime-smashy",
      ]);
    });

    it("debe conservar el orden original para películas y series de TV retornando una copia superficial", () => {
      const movieServers = getEmbedServers("movie", 550, 1, 1, "Fight Club");
      const orderedMovies = orderServersForAutoSelection(movieServers, "movie");

      expect(orderedMovies).not.toBe(movieServers);
      expect(orderedMovies).toEqual(movieServers);

      const tvServers = getEmbedServers("tv", 1399, 1, 1, "Game of Thrones");
      const orderedTv = orderServersForAutoSelection(tvServers, "tv");

      expect(orderedTv).not.toBe(tvServers);
      expect(orderedTv).toEqual(tvServers);
    });

    it("debe clasificar servidores con autoPriority o language explícito correctamente", () => {
      const customServers: ServerOption[] = [
        { id: "custom-3", name: "Backup", quality: "1080p", url: "https://example.com/3" },
        { id: "custom-dub", name: "Dubbed", quality: "1080p", url: "https://example.com/dub", language: "dub" },
        { id: "custom-sub", name: "Subbed", quality: "1080p", url: "https://example.com/sub", language: "sub" },
        { id: "custom-p0", name: "Top Priority", quality: "1080p", url: "https://example.com/top", autoPriority: 0 },
      ];

      const ordered = orderServersForAutoSelection(customServers, "anime");
      expect(ordered.map((s) => s.id)).toEqual([
        "custom-p0",
        "custom-sub",
        "custom-dub",
        "custom-3",
      ]);
    });
  });
});
