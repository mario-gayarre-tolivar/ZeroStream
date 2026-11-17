"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { MediaDetail, MediaType, ServerOption } from "@/types";
import { SafePlayer } from "@/components/player/SafePlayer";
import { EpisodeSelector } from "@/components/player/EpisodeSelector";
import { getEmbedServers } from "@/services/embeds";
import { toggleFavorite, isFavorite } from "@/services/history";
import { Bookmark, Star, Clock, Calendar, Film, Tv, Clapperboard, Video } from "lucide-react";

interface PlayerViewClientProps {
  media: MediaDetail;
  initialSeason: number;
  initialEpisode: number;
}

export function PlayerViewClient({
  media,
  initialSeason,
  initialEpisode,
}: PlayerViewClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [favorite, setFavorite] = useState(() => isFavorite(media.id, media.type));
  const [showTrailer, setShowTrailer] = useState(false);

  // Genera los servidores de streaming basados en el tipo, ID y capítulo actual
  const servers: ServerOption[] = getEmbedServers(
    media.type,
    media.id,
    currentSeason,
    currentEpisode,
    media.title,
    media.tmdbId,
    media.malId
  );

  const activeSeasonData = media.seasons?.find((s) => s.seasonNumber === currentSeason);
  const totalEpisodesInSeason = activeSeasonData?.episodeCount || activeSeasonData?.episodes?.length;

  const handleEpisodeChange = (season: number, episode: number) => {
    setCurrentSeason(season);
    setCurrentEpisode(episode);
    // Actualizar URL para permitir compartir enlaces directos al capítulo
    router.replace(`/ver/${media.type}/${media.id}?s=${season}&e=${episode}`, {
      scroll: false,
    });
  };

  const handleToggleFavorite = () => {
    const newState = toggleFavorite({
      id: media.id,
      title: media.title,
      type: media.type,
      posterPath: media.posterPath,
    });
    setFavorite(newState);
  };

  const typeIcons = {
    movie: Film,
    tv: Tv,
    anime: Clapperboard,
  };
  const TypeIcon = typeIcons[media.type] || Film;

  return (
    <div className="flex flex-col gap-8">
      {/* Safe Streaming Player */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-poster bg-accent text-accent-ink">
              <TypeIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {media.title}{" "}
              {media.type !== "movie" && (
                <span className="text-muted font-normal">
                  — T{currentSeason}:E{currentEpisode}
                </span>
              )}
            </h1>
          </div>
        </div>

        <SafePlayer
          servers={servers}
          mediaType={media.type}
          mediaId={media.id}
          title={media.title}
          posterPath={media.posterPath}
          season={currentSeason}
          episode={currentEpisode}
          totalEpisodesInSeason={totalEpisodesInSeason}
          onEpisodeChange={media.type !== "movie" ? handleEpisodeChange : undefined}
          enableAutoSelect={true}
          tmdbId={media.tmdbId}
          malId={media.malId}
        />
      </section>

      {/* Episode Selector for Series and Anime */}
      {media.type !== "movie" && media.seasons && media.seasons.length > 0 && (
        <section>
          <EpisodeSelector
            seasons={media.seasons}
            currentSeason={currentSeason}
            currentEpisode={currentEpisode}
            onSelectSeason={(season) => setCurrentSeason(season)}
            onSelectEpisode={handleEpisodeChange}
          />
        </section>
      )}

      {/* Content Details & Technical Overview */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 rounded-poster border border-border bg-surface p-6 sm:p-8">
        {/* Left Column: Poster & Quick Actions */}
        <div className="flex flex-col items-center sm:items-start gap-4">
          <div className="relative aspect-[2/3] w-48 sm:w-full overflow-hidden rounded-poster border border-border">
            {media.posterPath ? (
              <Image
                src={media.posterPath}
                alt={media.title}
                fill
                sizes="(max-width: 768px) 192px, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-faint">
                Sin imagen
              </div>
            )}
          </div>

          <button
            onClick={handleToggleFavorite}
            className={`w-full flex items-center justify-center gap-2 rounded-poster border py-2.5 text-sm font-medium transition-colors ${
              favorite
                ? "bg-accent text-accent-ink border-accent"
                : "border-border-active bg-surface-active text-foreground hover:bg-surface-hover"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${favorite ? "fill-accent-ink" : ""}`} aria-hidden="true" />
            {favorite ? "En mi lista" : "Guardar en mi lista"}
          </button>

          {media.trailerYoutubeId && (
            <button
              onClick={() => setShowTrailer(!showTrailer)}
              className="w-full flex items-center justify-center gap-2 rounded-poster border border-border-active bg-surface-active py-2.5 text-sm font-medium text-accent-danger-text hover:bg-surface-hover transition-colors"
            >
              <Video className="h-4 w-4" aria-hidden="true" />
              {showTrailer ? "Ocultar tráiler" : "Ver tráiler"}
            </button>
          )}
        </div>

        {/* Right Column: Metadata & Overview */}
        <div className="md:col-span-3 flex flex-col gap-5">
          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {media.title}
            </h2>
            {media.originalTitle && (
              <p className="text-xs font-medium text-muted">
                Título original: <span className="text-foreground">{media.originalTitle}</span>
              </p>
            )}
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {media.voteAverage > 0 && (
              <div className="flex items-center gap-1 rounded-poster bg-accent/15 px-2.5 py-1 font-medium text-accent border border-accent/20 tabular-nums">
                <Star className="h-3.5 w-3.5 fill-accent" aria-hidden="true" />
                <span>{media.voteAverage} / 10</span>
              </div>
            )}

            {media.releaseDate && (
              <div className="flex items-center gap-1 rounded-poster bg-surface-active px-2.5 py-1 text-foreground border border-border tabular-nums">
                <Calendar className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                <span>{media.releaseDate.slice(0, 4)}</span>
              </div>
            )}

            {media.duration && (
              <div className="flex items-center gap-1 rounded-poster bg-surface-active px-2.5 py-1 text-foreground border border-border tabular-nums">
                <Clock className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
                <span>{media.duration}</span>
              </div>
            )}

            {media.status && (
              <div className="rounded-poster bg-emerald-500/10 px-2.5 py-1 text-emerald-400 font-medium border border-emerald-500/20">
                {media.status}
              </div>
            )}
          </div>

          {/* Genres */}
          {media.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {media.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-chip border border-border bg-surface-active px-3 py-0.5 text-xs text-muted"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <div className="space-y-2 border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground">
              Sinopsis
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              {media.overview}
            </p>
          </div>

          {/* Trailer view if toggled */}
          {showTrailer && media.trailerYoutubeId && (
            <div className="mt-4 flex flex-col gap-2 rounded-poster border border-border bg-black p-3">
              <span className="text-xs font-semibold text-muted">Tráiler oficial (YouTube)</span>
              <div className="relative aspect-video w-full overflow-hidden rounded-poster">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${media.trailerYoutubeId}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
