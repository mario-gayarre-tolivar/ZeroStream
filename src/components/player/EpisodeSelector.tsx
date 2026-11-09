"use client";

import { Season, Episode } from "@/types";
import { Play, CheckCircle2 } from "lucide-react";

interface EpisodeSelectorProps {
  seasons: Season[];
  currentSeason: number;
  currentEpisode: number;
  onSelectEpisode: (season: number, episode: number) => void;
  onSelectSeason: (season: number) => void;
}

export function EpisodeSelector({
  seasons,
  currentSeason,
  currentEpisode,
  onSelectEpisode,
  onSelectSeason,
}: EpisodeSelectorProps) {
  if (!seasons || seasons.length === 0) return null;

  const activeSeasonData =
    seasons.find((s) => s.seasonNumber === currentSeason) || seasons[0];
  const episodes = activeSeasonData.episodes || [];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
      {/* Season Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Lista de Capítulos
        </h3>

        {/* Season Selector */}
        {seasons.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {seasons.map((s) => (
              <button
                key={s.seasonNumber}
                onClick={() => onSelectSeason(s.seasonNumber)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  currentSeason === s.seasonNumber
                    ? "bg-accent text-white"
                    : "bg-surface-active text-slate-300 hover:bg-surface-hover hover:text-white"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Episode Grid / List */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 max-h-[380px] overflow-y-auto pr-1">
        {episodes.map((ep) => {
          const isPlaying =
            currentSeason === ep.seasonNumber && currentEpisode === ep.episodeNumber;

          return (
            <button
              key={`${ep.seasonNumber}-${ep.episodeNumber}`}
              onClick={() => onSelectEpisode(ep.seasonNumber, ep.episodeNumber)}
              className={`group flex items-center justify-between rounded-lg border p-2.5 text-left transition-all ${
                isPlaying
                  ? "border-accent bg-accent/15 text-white shadow-sm"
                  : "border-border bg-surface-active text-slate-300 hover:border-border-active hover:bg-surface-hover hover:text-white"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-accent">
                  Episodio {ep.episodeNumber}
                </span>
                <span className="line-clamp-1 text-xs text-slate-200">
                  {ep.title || `Capítulo ${ep.episodeNumber}`}
                </span>
              </div>

              {isPlaying ? (
                <Play className="h-3.5 w-3.5 shrink-0 fill-accent text-accent" />
              ) : (
                <Play className="h-3.5 w-3.5 shrink-0 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
