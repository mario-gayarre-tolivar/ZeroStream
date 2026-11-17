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
  "11061": "46298", // Hunter x Hunter (2011) - Corregido (antes 42705 que era Hajime no Ippo)
  "21459": "65930", // Boku no Hero Academia
  "1735": "31910", // Naruto Shippuden - Corregido (antes 46298)
  "20605": "61374", // Tokyo Ghoul - Corregido (antes 61663)
  "161645": "220542", // The Apothecary Diaries / Kusuriya no Hitorigoto
  "142838": "209867", // Sousou no Frieren
  "154587": "209867", // Frieren: Beyond Journey's End
  "140960": "120089", // SPY x FAMILY
  "145139": "203737", // Oshi no Ko
  "153518": "119495", // The Eminence in Shadow
  "10087": "45845", // Fate/Zero
};

export function resolveTmdbId(
  type: MediaType,
  id: string | number,
  explicitTmdbId?: string | number
): string {
  if (explicitTmdbId) {
    return String(explicitTmdbId);
  }
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
  title?: string,
  tmdbId?: string | number,
  malId?: string | number
): ServerOption[] {
  const targetId = resolveTmdbId(type, id, tmdbId);
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

  // Para Anime: Servidores nativos por MyAnimeList ID y episodio absoluto
  const targetMalId = malId || id;
  const animeAccentColor = "f0b44c"; // Token de acento Sodio

  return [
    {
      id: "anime-zoko-sub",
      name: "Servidor HiAnime Sub (Zoko)",
      quality: "1080p Subtitulado",
      url: `https://zokoanime.video/stream/mal/${targetMalId}/${episode}/sub?color=${animeAccentColor}`,
      isRecommended: true,
    },
    {
      id: "anime-zoko-dub",
      name: "Servidor HiAnime Dub (Zoko)",
      quality: "1080p Doblado",
      url: `https://zokoanime.video/stream/mal/${targetMalId}/${episode}/dub?color=${animeAccentColor}`,
    },
    {
      id: "anime-vidlink-sub",
      name: "Servidor VidLink Anime Sub",
      quality: "1080p Multi Sub",
      url: `https://vidlink.pro/anime/${targetMalId}/${episode}/sub?fallback=true`,
    },
    {
      id: "anime-vidlink-dub",
      name: "Servidor VidLink Anime Dub",
      quality: "1080p Multi Dub",
      url: `https://vidlink.pro/anime/${targetMalId}/${episode}/dub?fallback=true`,
    },
    // Servidores de respaldo occidentales (TMDB TV)
    {
      id: "anime-embedsu",
      name: "Servidor Anime Respaldo (Embed.su)",
      quality: "1080p Multi",
      url: `https://embed.su/embed/tv/${targetId}/${season}/${episode}`,
    },
    {
      id: "anime-super",
      name: "Servidor Anime Respaldo (SuperEmbed)",
      quality: "HD Multi",
      url: `https://multiembed.mov/?video_id=${targetId}&tmdb=1&s=${season}&e=${episode}`,
    },
    {
      id: "anime-autoembed",
      name: "Servidor Anime Respaldo (AutoEmbed)",
      quality: "HD 1080p",
      url: `https://player.autoembed.cc/embed/tv/${targetId}/${season}/${episode}`,
    },
    {
      id: "anime-smashy",
      name: "Servidor Anime Respaldo (Smashy)",
      quality: "1080p Multi",
      url: `https://player.smashy.stream/tv/${targetId}?s=${season}&e=${episode}`,
    },
  ];
}

function getAnimeServerPriority(server: ServerOption): number {
  if (typeof server.autoPriority === "number") {
    return server.autoPriority;
  }
  if (server.language === "sub") {
    return 1;
  }
  if (server.language === "dub") {
    return 2;
  }
  const id = server.id.toLowerCase();
  if (id.includes("-sub") || id.endsWith("sub")) {
    return 1;
  }
  if (id.includes("-dub") || id.endsWith("dub")) {
    return 2;
  }
  return 3;
}

/**
 * Ordena una copia de los servidores para la lógica de autoselección y fallback.
 * Para anime: da prioridad 1 a Sub nativos, prioridad 2 a Dub nativos, y prioridad 3 a TMDB.
 * Para movie/tv: preserva el orden original configurado de servidores.
 * Garantiza inmutabilidad (no muta el array recibido).
 */
export function orderServersForAutoSelection(
  servers: ServerOption[],
  type: MediaType
): ServerOption[] {
  if (type !== "anime") {
    return [...servers];
  }

  return [...servers].sort((a, b) => {
    return getAnimeServerPriority(a) - getAnimeServerPriority(b);
  });
}
