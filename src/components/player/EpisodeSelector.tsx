"use client";

import { useMemo, useState, useEffect } from "react";
import { Season } from "@/types";
import { Play, Layers } from "lucide-react";

interface EpisodeSelectorProps {
  seasons: Season[];
  currentSeason: number;
  currentEpisode: number;
  onSelectEpisode: (season: number, episode: number) => void;
  onSelectSeason: (season: number) => void;
  episodesPerPage?: number;
}

export function EpisodeSelector({
  seasons,
  currentSeason,
  currentEpisode,
  onSelectEpisode,
  onSelectSeason,
  episodesPerPage = 100,
}: EpisodeSelectorProps) {
  const activeSeasonData = useMemo(() => {
    if (!seasons || seasons.length === 0) return null;
    return seasons.find((s) => s.seasonNumber === currentSeason) || seasons[0];
  }, [seasons, currentSeason]);

  const episodes = useMemo(() => {
    return activeSeasonData?.episodes || [];
  }, [activeSeasonData]);

  // Cálculo de páginas / bloques de 100 episodios
  const totalPages = useMemo(() => {
    return Math.ceil(episodes.length / episodesPerPage);
  }, [episodes.length, episodesPerPage]);

  // Página activa inicial basada en el episodio actual
  const [activePageIndex, setActivePageIndex] = useState(() => {
    if (currentEpisode > 0) {
      return Math.floor((currentEpisode - 1) / episodesPerPage);
    }
    return 0;
  });

  // Sincronizar página si el episodio actual cambia externamente a otro bloque
  useEffect(() => {
    if (currentEpisode > 0) {
      const targetPage = Math.floor((currentEpisode - 1) / episodesPerPage);
      if (targetPage >= 0 && targetPage < totalPages) {
        setActivePageIndex(targetPage);
      }
    }
  }, [currentEpisode, episodesPerPage, totalPages]);

  // Episodios que se renderizan en el DOM (rebanada de la página activa)
  const displayedEpisodes = useMemo(() => {
    if (totalPages <= 1) return episodes;
    const start = activePageIndex * episodesPerPage;
    const end = start + episodesPerPage;
    return episodes.slice(start, end);
  }, [episodes, totalPages, activePageIndex, episodesPerPage]);

  if (!seasons || seasons.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
      {/* Header: Temporadas y Selector de Rango */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Lista de Capítulos
          </h3>
          <span className="text-[11px] font-medium text-zinc-500">
            ({episodes.length} {episodes.length === 1 ? "episodio" : "episodios"})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Rango de Episodios (Bloques de 1-100 para animes/series largas) */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 bg-surface-active rounded border border-border px-2 py-1">
              <Layers className="h-3.5 w-3.5 text-accent" />
              <select
                aria-label="Seleccionar rango de episodios"
                value={activePageIndex}
                onChange={(e) => setActivePageIndex(Number(e.target.value))}
                className="bg-transparent text-xs font-medium text-white outline-none cursor-pointer"
              >
                {Array.from({ length: totalPages }, (_, idx) => {
                  const startEp = idx * episodesPerPage + 1;
                  const endEp = Math.min((idx + 1) * episodesPerPage, episodes.length);
                  return (
                    <option key={idx} value={idx} className="bg-surface text-white">
                      Página {idx + 1} (Eps {startEp} - {endEp})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Season Selector */}
          {seasons.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {seasons.map((s) => (
                <button
                  key={s.seasonNumber}
                  type="button"
                  onClick={() => {
                    onSelectSeason(s.seasonNumber);
                    setActivePageIndex(0);
                  }}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                    currentSeason === s.seasonNumber
                      ? "bg-accent text-background font-semibold"
                      : "bg-surface-active text-zinc-300 hover:bg-surface-hover hover:text-white"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Episode Grid / List */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 max-h-[380px] overflow-y-auto pr-1">
        {displayedEpisodes.map((ep) => {
          const isPlaying =
            currentSeason === ep.seasonNumber && currentEpisode === ep.episodeNumber;

          return (
            <button
              key={`${ep.seasonNumber}-${ep.episodeNumber}`}
              type="button"
              onClick={() => onSelectEpisode(ep.seasonNumber, ep.episodeNumber)}
              className={`group flex items-center justify-between rounded border p-2.5 text-left transition-all ${
                isPlaying
                  ? "border-accent bg-accent/10 text-white shadow-sm"
                  : "border-border bg-surface-active text-zinc-300 hover:border-border-active hover:bg-surface-hover hover:text-white"
              }`}
            >
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[11px] font-semibold text-accent">
                  Episodio {ep.episodeNumber}
                </span>
                <span className="truncate text-xs text-zinc-200">
                  {ep.title || `Capítulo ${ep.episodeNumber}`}
                </span>
              </div>

              {isPlaying ? (
                <Play className="h-3.5 w-3.5 shrink-0 fill-accent text-accent" />
              ) : (
                <Play className="h-3.5 w-3.5 shrink-0 text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
