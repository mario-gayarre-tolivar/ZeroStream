import { MediaType } from "@/types";

export interface StoredFailedEntry {
  serverId: string;
  expiresAt: number;
}

const STORAGE_PREFIX = "zs_failed_servers:";
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutos

// Fallback en memoria resiliente para SSR o entornos sin acceso a sessionStorage
const memoryFallback = new Map<string, StoredFailedEntry[]>();

function getStorageKey(mediaKey: string): string {
  return `${STORAGE_PREFIX}${mediaKey}`;
}

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readEntries(storageKey: string): StoredFailedEntry[] {
  const storage = getSessionStorage();
  if (storage) {
    try {
      const raw = storage.getItem(storageKey);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return [];
      }
    } catch {
      return memoryFallback.get(storageKey) || [];
    }
  }
  return memoryFallback.get(storageKey) || [];
}

function writeEntries(storageKey: string, entries: StoredFailedEntry[]): void {
  const storage = getSessionStorage();
  let wrote = false;

  if (storage) {
    try {
      storage.setItem(storageKey, JSON.stringify(entries));
      wrote = true;
    } catch {
      wrote = false;
    }
  }

  if (!wrote) {
    memoryFallback.set(storageKey, entries);
  } else {
    memoryFallback.delete(storageKey);
  }
}

/**
 * Genera una clave única por contenido o episodio.
 * - Para películas: 'movie:${mediaId}'
 * - Para series y anime: '${mediaType}:${mediaId}:${season}:${episode}' (por defecto season=1, episode=1)
 */
export function buildMediaEpisodeKey(
  mediaType: MediaType,
  mediaId: string | number,
  season?: number,
  episode?: number
): string {
  if (mediaType === "movie") {
    return `movie:${mediaId}`;
  }
  const s = season ?? 1;
  const e = episode ?? 1;
  return `${mediaType}:${mediaId}:${s}:${e}`;
}

/**
 * Obtiene la lista de serverIds fallidos y vigentes para una clave de medio.
 * Purga automáticamente entradas cuyo TTL expiró.
 */
export function getFailedServerIds(mediaKey: string): string[] {
  const storageKey = getStorageKey(mediaKey);
  const entries = readEntries(storageKey);
  if (entries.length === 0) {
    return [];
  }

  const now = Date.now();
  const activeEntries = entries.filter((entry) => entry.expiresAt > now);

  if (activeEntries.length !== entries.length) {
    writeEntries(storageKey, activeEntries);
  }

  return activeEntries.map((entry) => entry.serverId);
}

/**
 * Registra un servidor como fallido con un TTL determinado (por defecto 30 minutos).
 * Si el servidor ya estaba registrado, renueva su fecha de expiración.
 * Retorna la lista actualizada de serverIds fallidos vigentes.
 */
export function markServerFailed(
  mediaKey: string,
  serverId: string,
  ttlMs: number = DEFAULT_TTL_MS
): string[] {
  const storageKey = getStorageKey(mediaKey);
  const entries = readEntries(storageKey);
  const now = Date.now();
  const expiresAt = now + ttlMs;

  const activeEntries = entries.filter((e) => e.expiresAt > now);
  const existingIndex = activeEntries.findIndex((e) => e.serverId === serverId);

  if (existingIndex >= 0) {
    activeEntries[existingIndex].expiresAt = expiresAt;
  } else {
    activeEntries.push({ serverId, expiresAt });
  }

  writeEntries(storageKey, activeEntries);
  return activeEntries.map((e) => e.serverId);
}

/**
 * Elimina todos los registros de servidores fallidos para la clave especificada.
 */
export function clearFailedServers(mediaKey: string): void {
  const storageKey = getStorageKey(mediaKey);
  memoryFallback.delete(storageKey);
  const storage = getSessionStorage();
  if (storage) {
    try {
      storage.removeItem(storageKey);
    } catch {
      // Ignorar fallos de acceso a storage
    }
  }
}
