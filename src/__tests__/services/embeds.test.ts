import { describe, it, expect } from "vitest";
import { getEmbedServers } from "@/services/embeds";

describe("Servicio de Embeds (Zero-Storage)", () => {
  it("debe generar 4 servidores de respaldo para películas con ID de TMDB", () => {
    const servers = getEmbedServers("movie", 550, 1, 1, "Fight Club");

    expect(servers).toHaveLength(4);

    const [vidsrc, embedsu, superembed, vidsrccc] = servers;

    // Servidor 1: VidSrc
    expect(vidsrc.id).toBe("vidsrc");
    expect(vidsrc.url).toContain("vidsrc.me/embed/movie?tmdb=550");

    // Servidor 2: Embed.su
    expect(embedsu.id).toBe("embedsu");
    expect(embedsu.url).toContain("embed.su/embed/movie/550");

    // Servidor 3: SuperEmbed
    expect(superembed.id).toBe("superembed");
    expect(superembed.url).toContain("multiembed.mov/?video_id=550&tmdb=1");

    // Servidor 4: VidSrc.cc
    expect(vidsrccc.id).toBe("vidsrccc");
    expect(vidsrccc.url).toContain("vidsrc.cc/v2/embed/movie/550");
  });

  it("debe incluir temporada y episodio para series de TV", () => {
    const servers = getEmbedServers("tv", 1399, 2, 5, "Game of Thrones");

    expect(servers).toHaveLength(4);

    const [vidsrc, embedsu, superembed, vidsrccc] = servers;

    expect(vidsrc.url).toContain("tmdb=1399&season=2&episode=5");
    expect(embedsu.url).toContain("/1399/2/5");
    expect(superembed.url).toContain("s=2&e=5");
    expect(vidsrccc.url).toContain("/1399/2/5");
  });

  it("debe proveer servidores dedicados para anime con soporte de episodios", () => {
    const servers = getEmbedServers("anime", 20, 1, 10, "Naruto");

    expect(servers).toHaveLength(4);
    expect(servers[0].id).toBe("anime-vidsrc");
    expect(servers[0].url).toContain("season=1&episode=10");
  });
});
