export type MediaType = "movie" | "tv" | "anime";

export interface MediaItem {
  id: string | number;
  title: string;
  originalTitle?: string;
  type: MediaType;
  overview: string;
  posterPath: string;
  backdropPath?: string;
  voteAverage: number;
  releaseDate?: string;
  genres: string[];
  totalEpisodes?: number;
  totalSeasons?: number;
  status?: string;
  duration?: string | number;
  tmdbId?: string | number;
  malId?: string | number;
}

export interface Episode {
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  overview?: string;
  stillPath?: string;
  airDate?: string;
}

export interface Season {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  episodes?: Episode[];
}

export interface MediaDetail extends MediaItem {
  seasons?: Season[];
  trailerYoutubeId?: string;
  tagline?: string;
  duration?: string | number;
}

export type ServerHealthStatus = "healthy" | "uncertain" | "dead";

export type ServerHealthReason =
  | "ok"
  | "bot_challenge"
  | "timeout"
  | "network_error"
  | "http_error"
  | "frame_blocked"
  | "html_error_page";

export interface ServerOption {
  id: string;
  name: string;
  quality: string;
  url: string;
  isRecommended?: boolean;
  requiresAdblock?: boolean;
  hasSpanishAudio?: boolean;
  language?: "sub" | "dub" | "multi";
  autoPriority?: number;
}

export interface ServerCheckResult {
  serverId: string;
  status: ServerHealthStatus;
  reason: ServerHealthReason;
  httpStatus?: number;
  latencyMs: number;
  checkedAt: number;
}

export interface ServerCheckResponse {
  results: ServerCheckResult[];
  recommendedServerId: string | null;
  source: "cache" | "live" | "mixed";
}

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

export interface FilterOptions {
  genre?: string;
  year?: string;
  sortBy?: "popularity" | "vote_average" | "latest";
  searchQuery?: string;
}
