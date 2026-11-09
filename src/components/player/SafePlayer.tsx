"use client";

import { useState, useEffect } from "react";
import { ServerOption, MediaType } from "@/types";
import { saveWatchProgress } from "@/services/history";
import {
  RotateCcw,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
} from "lucide-react";

interface SafePlayerProps {
  servers: ServerOption[];
  mediaType: MediaType;
  mediaId: string | number;
  title: string;
  posterPath: string;
  season?: number;
  episode?: number;
  totalEpisodesInSeason?: number;
  onEpisodeChange?: (season: number, episode: number) => void;
}

export function SafePlayer({
  servers,
  mediaType,
  mediaId,
  title,
  posterPath,
  season = 1,
  episode = 1,
  totalEpisodesInSeason,
  onEpisodeChange,
}: SafePlayerProps) {
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const currentServer = servers[activeServerIndex] || servers[0];

  // Guardar en historial de reproducción automáticamente al cargar el reproductor
  useEffect(() => {
    saveWatchProgress({
      id: mediaId,
      title,
      type: mediaType,
      posterPath,
      season: mediaType !== "movie" ? season : undefined,
      episode: mediaType !== "movie" ? episode : undefined,
      episodeTitle:
        mediaType !== "movie"
          ? `T${season} : E${episode}`
          : undefined,
    });
  }, [mediaId, mediaType, title, posterPath, season, episode]);

  // Reset loading when changing server or episode
  useEffect(() => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  }, [activeServerIndex, season, episode]);

  const handleNextEpisode = () => {
    if (onEpisodeChange && totalEpisodesInSeason && episode < totalEpisodesInSeason) {
      onEpisodeChange(season, episode + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (onEpisodeChange && episode > 1) {
      onEpisodeChange(season, episode - 1);
    }
  };

  const handleReloadServer = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Player Header & Server Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold text-slate-200">Servidores de Reproducción:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {servers.map((server, idx) => (
            <button
              key={server.id}
              onClick={() => setActiveServerIndex(idx)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                activeServerIndex === idx
                  ? "bg-accent text-white shadow-sm"
                  : "bg-surface-active text-slate-300 hover:bg-surface-hover hover:text-white"
              }`}
            >
              {server.name} ({server.quality})
            </button>
          ))}
        </div>

        {/* Reload button */}
        <button
          onClick={handleReloadServer}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-surface-hover hover:text-white"
          title="Recargar reproductor"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Recargar</span>
        </button>
      </div>

      {/* 16:9 Sandboxed Video Player Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-2xl">
        {/* Loading Spinner Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-accent border-t-transparent" />
            <p className="mt-3 text-xs text-slate-400">Conectando con el stream externo...</p>
          </div>
        )}

        {/* Sandboxed Safe Iframe */}
        {currentServer && (
          <iframe
            key={`${currentServer.id}-${iframeKey}-${season}-${episode}`}
            src={currentServer.url}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
            loading="eager"
            onLoad={() => setIsLoading(false)}
            className="h-full w-full border-0"
            title={`Reproductor para ${title}`}
          />
        )}
      </div>

      {/* Episode Controls & Disclaimer Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        {/* Previous / Next Episode buttons if TV or Anime */}
        {mediaType !== "movie" && onEpisodeChange ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevEpisode}
              disabled={episode <= 1}
              className="flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 font-medium text-slate-200 transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-surface"
            >
              <ChevronLeft className="h-4 w-4" />
              Episodio Anterior
            </button>

            <span className="px-2 font-semibold text-white">
              Capítulo {episode} {totalEpisodesInSeason ? `de ${totalEpisodesInSeason}` : ""}
            </span>

            <button
              onClick={handleNextEpisode}
              disabled={Boolean(totalEpisodesInSeason && episode >= totalEpisodesInSeason)}
              className="flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 font-medium text-slate-200 transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-surface"
            >
              Siguiente Episodio
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div />
        )}

        {/* Safe notice */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500/80" />
          <span>Iframe protegido con sandbox. Si el video no responde, cambia de servidor arriba.</span>
        </div>
      </div>
    </div>
  );
}
