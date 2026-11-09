import { MediaType, WatchHistoryItem } from "@/types";

const HISTORY_KEY = "sz_watch_history_v1";
const FAVORITES_KEY = "sz_favorites_v1";

export function getWatchHistory(): WatchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading watch history:", e);
    return [];
  }
}

export function saveWatchProgress(item: Omit<WatchHistoryItem, "updatedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const current = getWatchHistory();
    const filtered = current.filter(
      (h) => !(String(h.id) === String(item.id) && h.type === item.type)
    );
    const updated: WatchHistoryItem[] = [
      {
        ...item,
        updatedAt: Date.now(),
      },
      ...filtered,
    ].slice(0, 30); // Limitar a los 30 más recientes

    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving watch progress:", e);
  }
}

export function getFavorites(): WatchHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading favorites:", e);
    return [];
  }
}

export function toggleFavorite(item: Omit<WatchHistoryItem, "updatedAt">): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getFavorites();
    const exists = current.some(
      (f) => String(f.id) === String(item.id) && f.type === item.type
    );

    let updated: WatchHistoryItem[];
    if (exists) {
      updated = current.filter(
        (f) => !(String(f.id) === String(item.id) && f.type === item.type)
      );
    } else {
      updated = [{ ...item, updatedAt: Date.now() }, ...current];
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return !exists;
  } catch (e) {
    console.error("Error toggling favorite:", e);
    return false;
  }
}

export function isFavorite(id: string | number, type: MediaType): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getFavorites();
    return current.some((f) => String(f.id) === String(id) && f.type === type);
  } catch {
    return false;
  }
}
