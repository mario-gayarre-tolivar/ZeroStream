import { MediaType, ServerOption } from "@/types";

/**
 * Mapeador de proveedores de embeds de video de terceros (Zero-Storage).
 * Devuelve múltiples servidores alternativos para garantizar redundancia y fallback.
 */
export function getEmbedServers(
  type: MediaType,
  id: string | number,
  season: number = 1,
  episode: number = 1,
  title?: string
): ServerOption[] {
  const tmdbId = String(id);
  const encodedTitle = encodeURIComponent(title || "");

  if (type === "movie") {
    return [
      {
        id: "vidsrc",
        name: "Servidor Principal (VidSrc)",
        quality: "1080p",
        url: `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
      },
      {
        id: "embedsu",
        name: "Servidor Secundario (Embed.su)",
        quality: "1080p Multi",
        url: `https://embed.su/embed/movie/${tmdbId}`,
      },
      {
        id: "superembed",
        name: "Servidor Rápido (SuperEmbed)",
        quality: "HD",
        url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
      },
      {
        id: "vidsrccc",
        name: "Servidor Respaldo (VidSrc.cc)",
        quality: "Auto",
        url: `https://vidsrc.cc/v2/embed/movie/${tmdbId}`,
      },
    ];
  }

  if (type === "tv") {
    return [
      {
        id: "vidsrc",
        name: "Servidor Principal (VidSrc)",
        quality: "1080p",
        url: `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
      },
      {
        id: "embedsu",
        name: "Servidor Secundario (Embed.su)",
        quality: "1080p Multi",
        url: `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
      },
      {
        id: "superembed",
        name: "Servidor Rápido (SuperEmbed)",
        quality: "HD",
        url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
      },
      {
        id: "vidsrccc",
        name: "Servidor Respaldo (VidSrc.cc)",
        quality: "Auto",
        url: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`,
      },
    ];
  }

  // Para Anime: Usar mapeos hacia proveedores de anime o fallback directo
  return [
    {
      id: "anime-vidsrc",
      name: "Servidor Anime Alpha (Multi)",
      quality: "1080p Sub/Dub",
      url: `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
    },
    {
      id: "anime-embedsu",
      name: "Servidor Anime Beta (Embed.su)",
      quality: "1080p",
      url: `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
    },
    {
      id: "anime-super",
      name: "Servidor Anime Gamma (SuperEmbed)",
      quality: "HD",
      url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
    },
    {
      id: "anime-stream",
      name: "Servidor Anime Delta",
      quality: "720p/1080p",
      url: `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`,
    },
  ];
}
