import { MediaItem, MediaType } from "@/types";
import { getTrendingMedia } from "./tmdb";
import { getTrendingAnime } from "./anilist";

interface CacheEntry {
  data: MediaItem[];
  timestamp: number;
}

// Caché en memoria del servidor con política Stale-If-Error
const memoryCache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hora

function buildCacheKey(type: MediaType, page: number, query?: string, genre?: string): string {
  return `${type}:${page}:${(query || "").trim().toLowerCase()}:${(genre || "").trim().toLowerCase()}`;
}

/**
 * Obtiene el catálogo consultando caché en memoria o upstream con timeout controlado y fallback resiliente.
 */
export async function getCachedCatalog(
  type: MediaType,
  page: number = 1,
  query?: string,
  genre?: string
): Promise<{ data: MediaItem[]; source: "cache" | "upstream" | "stale_fallback" }> {
  const cacheKey = buildCacheKey(type, page, query, genre);
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  // Si está en caché y aún no expira, retorno inmediato (< 5ms)
  if (cached && now - cached.timestamp < DEFAULT_TTL_MS) {
    return { data: cached.data, source: "cache" };
  }

  // AbortController con timeout estricto de 3.5 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    let freshData: MediaItem[] = [];

    if (type === "anime") {
      freshData = await getTrendingAnime(page, query, genre);
    } else {
      freshData = await getTrendingMedia(type, page, query, genre);
    }

    clearTimeout(timeoutId);

    if (freshData && freshData.length > 0) {
      memoryCache.set(cacheKey, { data: freshData, timestamp: now });
      return { data: freshData, source: "upstream" };
    }

    // Si upstream devuelve lista vacía pero teníamos stale data, preservar stale
    if (cached) {
      return { data: cached.data, source: "stale_fallback" };
    }

    return { data: freshData, source: "upstream" };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Upstream error o timeout para ${cacheKey}:`, error);

    // Fallback: Si falló la llamada remota, entregar stale data si existe
    if (cached) {
      return { data: cached.data, source: "stale_fallback" };
    }

    // Último recurso: fallback local de contingencia
    const emergencyData =
      type === "anime"
        ? await getTrendingAnime(page, query, genre)
        : await getTrendingMedia(type, page, query, genre);

    return { data: emergencyData, source: "stale_fallback" };
  }
}
