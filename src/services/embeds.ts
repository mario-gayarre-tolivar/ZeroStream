import { MediaType, ServerOption } from "@/types";

/**
 * Mapeo de animes populares de AniList ID a TMDB ID para garantizar
 * que los servidores de streaming que esperan IDs de TMDB reproduzcan el contenido exacto.
 */
const ANILIST_TO_TMDB_MAP: Record<string, string> = {
  "16498": "1429", // Shingeki no Kyojin
  "113415": "95479", // Jujutsu Kaisen
  "101922": "85937", // Kimetsu no Yaiba
  "127230": "114410", // Chainsaw Man
  "1535": "13916", // Death Note
  "20": "46260", // Naruto
  "21": "37854", // One Piece
  "11061": "42705", // Hunter x Hunter (2011)
  "21459": "65930", // Boku no Hero Academia
  "1735": "46298", // Naruto Shippuden
  "20605": "61663", // Tokyo Ghoul
};

export function resolveTmdbId(type: MediaType, id: string | number): string {
  const strId = String(id);
  if (type === "anime") {
    return ANILIST_TO_TMDB_MAP[strId] || strId;
  }
  return strId;
}

/**
 * Mapeador de proveedores de embeds de video de terceros (Zero-Storage).
 * Provee múltiples servidores alternativos de alta disponibilidad con opciones de respaldo.
 */
export function getEmbedServers(
  type: MediaType,
  id: string | number,
  season: number = 1,
  episode: number = 1,
  title?: string
): ServerOption[] {
  const targetId = resolveTmdbId(type, id);
  const encodedTitle = encodeURIComponent(title || "");

  if (type === "movie") {
    return [
      {
        id: "vidlink",
        name: "Servidor Principal (VidLink Fast)",
        quality: "1080p Ultra",
        url: `https://vidlink.pro/movie/${targetId}`,
        isRecommended: true,
      },
      {
        id: "embedsu",
        name: "Servidor Secundario (Embed.su)",
        quality: "1080p Multi",
        url: `https://embed.su/embed/movie/${targetId}`,
      },
      {
        id: "autoembed",
        name: "Servidor AutoEmbed (Sin Ads)",
        quality: "HD 1080p",
        url: `https://player.autoembed.cc/embed/movie/${targetId}`,
      },
      {
        id: "superembed",
        name: "Servidor Rápido (SuperEmbed)",
        quality: "HD Multi",
        url: `https://multiembed.mov/?video_id=${targetId}&tmdb=1`,
      },
      {
        id: "vidsrc",
        name: "Servidor Respaldo (VidSrc)",
        quality: "1080p",
        url: `https://vidsrc.me/embed/movie?tmdb=${targetId}`,
      },
      {
        id: "smashystream",
        name: "Servidor Smashy (Ultra Fast)",
        quality: "1080p Multi",
        url: `https://player.smashy.stream/movie/${targetId}`,
      },
    ];
  }

  if (type === "tv") {
    return [
      {
        id: "vidlink",
        name: "Servidor Principal (VidLink Fast)",
        quality: "1080p Ultra",
        url: `https://vidlink.pro/tv/${targetId}/${season}/${episode}`,
        isRecommended: true,
      },
      {
        id: "embedsu",
        name: "Servidor Secundario (Embed.su)",
        quality: "1080p Multi",
        url: `https://embed.su/embed/tv/${targetId}/${season}/${episode}`,
      },
      {
        id: "autoembed",
        name: "Servidor AutoEmbed (Sin Ads)",
        quality: "HD 1080p",
        url: `https://player.autoembed.cc/embed/tv/${targetId}/${season}/${episode}`,
      },
      {
        id: "superembed",
        name: "Servidor Rápido (SuperEmbed)",
        quality: "HD Multi",
        url: `https://multiembed.mov/?video_id=${targetId}&tmdb=1&s=${season}&e=${episode}`,
      },
      {
        id: "vidsrc",
        name: "Servidor Respaldo (VidSrc)",
        quality: "1080p",
        url: `https://vidsrc.me/embed/tv?tmdb=${targetId}&season=${season}&episode=${episode}`,
      },
      {
        id: "smashystream",
        name: "Servidor Smashy (Ultra Fast)",
        quality: "1080p Multi",
        url: `https://player.smashy.stream/tv/${targetId}?s=${season}&e=${episode}`,
      },
    ];
  }

  // Para Anime: Utilizar ID resuelto o fallback por título codificado
  return [
    {
      id: "anime-vidlink",
      name: "Servidor Anime Alpha (VidLink)",
      quality: "1080p Sub/Dub",
      url: `https://vidlink.pro/tv/${targetId}/${season}/${episode}`,
      isRecommended: true,
    },
    {
      id: "anime-embedsu",
      name: "Servidor Anime Beta (Embed.su)",
      quality: "1080p Multi",
      url: `https://embed.su/embed/tv/${targetId}/${season}/${episode}`,
    },
    {
      id: "anime-super",
      name: "Servidor Anime Gamma (SuperEmbed)",
      quality: "HD Multi",
      url: title
        ? `https://multiembed.mov/?video_id=${targetId}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${targetId}&tmdb=1&s=${season}&e=${episode}`,
    },
    {
      id: "anime-autoembed",
      name: "Servidor Anime Delta (AutoEmbed)",
      quality: "HD 1080p",
      url: `https://player.autoembed.cc/embed/tv/${targetId}/${season}/${episode}`,
    },
    {
      id: "anime-vidsrc",
      name: "Servidor Anime Respaldo (VidSrc)",
      quality: "1080p",
      url: `https://vidsrc.me/embed/tv?tmdb=${targetId}&season=${season}&episode=${episode}`,
    },
    {
      id: "anime-smashy",
      name: "Servidor Anime Smashy",
      quality: "1080p Multi",
      url: `https://player.smashy.stream/tv/${targetId}?s=${season}&e=${episode}`,
    },
  ];
}
