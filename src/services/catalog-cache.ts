import { MediaItem, MediaType } from "@/types";
import { getTrendingMedia } from "./tmdb";
import { getTrendingAnime } from "./anilist";
import { BoundedMemoryCache } from "./lru-cache";

// Caché en memoria acotada a 150 consultas (evita consumo descontrolado de RAM en Node.js)
export const catalogMemoryCache = new BoundedMemoryCache<MediaItem[]>(150);
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hora

function buildCacheKey(type: MediaType, page: number, query?: string, genre?: string): string {
  return `${type}:${page}:${(query || "").trim().toLowerCase()}:${(genre || "").trim().toLowerCase()}`;
}

/**
 * Obtiene el catálogo consultando caché LRU en memoria o upstream con timeout controlado y fallback resiliente.
 */
export async function getCachedCatalog(
  type: MediaType,
  page: number = 1,
  query?: string,
  genre?: string
): Promise<{ data: MediaItem[]; source: "cache" | "upstream" | "stale_fallback" }> {
  const cacheKey = buildCacheKey(type, page, query, genre);
  const cachedData = catalogMemoryCache.get(cacheKey);

  // Si está en caché válida, retorno instantáneo (< 2ms)
  if (cachedData) {
    return { data: cachedData, source: "cache" };
  }

  // AbortController con timeout estricto de 3.5 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const freshData =
      type === "anime"
        ? await getTrendingAnime(page, query, genre)
        : await getTrendingMedia(type, page, query, genre);

    clearTimeout(timeoutId);

    if (freshData && freshData.length > 0) {
      catalogMemoryCache.set(cacheKey, freshData, DEFAULT_TTL_MS);
      return { data: freshData, source: "upstream" };
    }

    // Si upstream devuelve lista vacía pero teníamos stale data, preservar stale
    const stale = catalogMemoryCache.getStale(cacheKey);
    if (stale && stale.length > 0) {
      return { data: stale, source: "stale_fallback" };
    }

    return { data: freshData || [], source: "upstream" };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Upstream error o timeout para ${cacheKey}:`, error);

    // Fallback Stale-If-Error: Si falló la llamada remota, entregar stale data si existe
    const stale = catalogMemoryCache.getStale(cacheKey);
    if (stale && stale.length > 0) {
      return { data: stale, source: "stale_fallback" };
    }

    // Último recurso: fallback local seguro protegido contra excepciones secundarias
    try {
      const emergencyData =
        type === "anime"
          ? await getTrendingAnime(page, query, genre)
          : await getTrendingMedia(type, page, query, genre);
      return { data: emergencyData || [], source: "stale_fallback" };
    } catch {
      return { data: [], source: "stale_fallback" };
    }
  }
}
