"use client";

import { useMemo, useState, useEffect } from "react";
import { Season } from "@/types";
import { Layers, Tv } from "lucide-react";

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

  // Episodio actualmente seleccionado y su título
  const activeEpisodeData = useMemo(() => {
    return episodes.find((e) => e.episodeNumber === currentEpisode);
  }, [episodes, currentEpisode]);

  const activeEpisodeTitle = activeEpisodeData?.title || `Capítulo ${currentEpisode}`;

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
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:p-5 w-full overflow-hidden">
      {/* Header: Título y Controles Desplegables de Temporada y Rango */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Lista de Capítulos
          </h3>
          <span className="text-[11px] font-medium text-zinc-500">
            ({episodes.length} {episodes.length === 1 ? "episodio" : "episodios"})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 max-w-full">
          {/* Selector de Temporadas en Desplegable Contenido (Cero Desbordamiento) */}
          {seasons.length > 1 && (
            <div className="flex items-center gap-1.5 bg-surface-active rounded border border-border px-2.5 py-1">
              <Tv className="h-3.5 w-3.5 text-accent shrink-0" />
              <select
                aria-label="Seleccionar temporada"
                value={currentSeason}
                onChange={(e) => {
                  onSelectSeason(Number(e.target.value));
                  setActivePageIndex(0);
                }}
                className="bg-transparent text-xs font-medium text-white outline-none cursor-pointer max-w-[140px] truncate"
              >
                {seasons.map((s) => (
                  <option key={s.seasonNumber} value={s.seasonNumber} className="bg-surface text-white">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selector de Rango de Episodios (Bloques de 100) */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 bg-surface-active rounded border border-border px-2.5 py-1">
              <Layers className="h-3.5 w-3.5 text-accent shrink-0" />
              <select
                aria-label="Seleccionar rango de episodios"
                value={activePageIndex}
                onChange={(e) => setActivePageIndex(Number(e.target.value))}
                className="bg-transparent text-xs font-medium text-white outline-none cursor-pointer max-w-[150px] truncate"
              >
                {Array.from({ length: totalPages }, (_, idx) => {
                  const startEp = idx * episodesPerPage + 1;
                  const endEp = Math.min((idx + 1) * episodesPerPage, episodes.length);
                  return (
                    <option key={idx} value={idx} className="bg-surface text-white">
                      Página {idx + 1} ({startEp}-{endEp})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Banner Informativo del Capítulo Seleccionado */}
      <div className="flex items-center gap-2 rounded-lg bg-surface-active/80 border border-border/60 px-3 py-2 text-xs">
        <span className="font-bold text-accent shrink-0">
          Capítulo {currentEpisode}:
        </span>
        <span className="truncate text-zinc-200 font-medium">
          {activeEpisodeTitle}
        </span>
      </div>

      {/* Dense Numeric Episode Grid: Celdas compactas con solo el número */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
        {displayedEpisodes.map((ep) => {
          const isPlaying =
            currentSeason === ep.seasonNumber && currentEpisode === ep.episodeNumber;

          return (
            <button
              key={`${ep.seasonNumber}-${ep.episodeNumber}`}
              type="button"
              onClick={() => onSelectEpisode(ep.seasonNumber, ep.episodeNumber)}
              aria-label={`${ep.episodeNumber}`}
              className={`h-9 w-full flex items-center justify-center rounded font-mono text-xs font-bold transition-all ${
                isPlaying
                  ? "border border-accent bg-accent text-background shadow-sm ring-1 ring-accent"
                  : "border border-border bg-surface-active text-zinc-300 hover:border-accent/60 hover:bg-surface-hover hover:text-white"
              }`}
            >
              {ep.episodeNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
