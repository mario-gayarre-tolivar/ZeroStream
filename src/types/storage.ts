import type { MediaType } from "./media";

export interface WatchHistoryItem {
  id: string | number;
  title: string;
  type: MediaType;
  posterPath: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  updatedAt: number;
}

export interface ServerMemoryEntry {
  serverId: string;
  mediaKey: string;
  failedAt: number;
  reason?: string;
}
