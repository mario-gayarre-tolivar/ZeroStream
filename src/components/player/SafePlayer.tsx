"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ServerOption, MediaType } from "@/types";
import { saveWatchProgress } from "@/services/history";
import {
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  X,
} from "lucide-react";
import { PlayerControlBar } from "./ServerSelector";

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
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
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

  const handleNextEpisode = useCallback(() => {
    if (onEpisodeChange && totalEpisodesInSeason && episode < totalEpisodesInSeason) {
      onEpisodeChange(season, episode + 1);
    }
  }, [onEpisodeChange, totalEpisodesInSeason, episode, season]);

  const handlePrevEpisode = useCallback(() => {
    if (onEpisodeChange && episode > 1) {
      onEpisodeChange(season, episode - 1);
    }
  }, [onEpisodeChange, episode, season]);

  const handleReloadServer = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen?.().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleCopyDirectLink = async () => {
    if (typeof window === "undefined") return;
    let url = `${window.location.origin}/ver/${mediaType}/${mediaId}`;
    if (mediaType !== "movie" && season && episode) {
      url += `?s=${season}&e=${episode}`;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(false);
    }
  };

  // Atajos de teclado: F (fullscreen), T (teatro), N (next), P (prev), Esc (salir teatro)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === "f") {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (key === "t") {
        e.preventDefault();
        setIsTheaterMode((prev) => !prev);
      } else if (key === "n" && mediaType !== "movie") {
        e.preventDefault();
        handleNextEpisode();
      } else if (key === "p" && mediaType !== "movie") {
        e.preventDefault();
        handlePrevEpisode();
      } else if (e.key === "Escape" && isTheaterMode) {
        setIsTheaterMode(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextEpisode, handlePrevEpisode, isTheaterMode, mediaType]);

  return (
    <>
      {/* Contenedor en Modo Cine o Modo Normal */}
      <div
        className={
          isTheaterMode
            ? "fixed inset-0 z-[100] flex flex-col justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-md overflow-y-auto"
            : "flex flex-col gap-3 w-full"
        }
      >
        {/* Barra modular de servidores y controles */}
        <PlayerControlBar
          servers={servers}
          activeServerIndex={activeServerIndex}
          onSelectServer={setActiveServerIndex}
          onReload={handleReloadServer}
          isTheaterMode={isTheaterMode}
          onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenShortcuts={() => setShowShortcutsModal(true)}
          copiedLink={copiedLink}
          onCopyLink={handleCopyDirectLink}
        />

        {/* 16:9 Sandboxed Video Player Container */}
        <div
          ref={playerContainerRef}
          className={`relative aspect-video w-full overflow-hidden rounded-poster border border-border bg-black ${
            isTheaterMode ? "max-h-[82vh] my-auto" : ""
          }`}
        >
          {/* Loading Spinner Skeleton */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="mt-3 text-sm text-muted">Conectando con el stream externo...</p>
            </div>
          )}

          {/* Safe Video Player Container */}
          {currentServer && (
            <iframe
              key={`${currentServer.id}-${iframeKey}-${season}-${episode}`}
              src={currentServer.url}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              referrerPolicy="no-referrer-when-downgrade"
              loading="eager"
              onLoad={() => setIsLoading(false)}
              className="h-full w-full border-0"
              title={`Reproductor para ${title}`}
            />
          )}
        </div>

        {/* Episode Controls & Disclaimer Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
          {mediaType !== "movie" && onEpisodeChange ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevEpisode}
                disabled={episode <= 1}
                className="flex items-center gap-1 rounded-poster border border-border-active bg-surface px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-surface"
                title="Episodio Anterior (Tecla P)"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Episodio Anterior
              </button>

              <span className="px-2 font-semibold text-foreground">
                Capítulo {episode} {totalEpisodesInSeason ? `de ${totalEpisodesInSeason}` : ""}
              </span>

              <button
                type="button"
                onClick={handleNextEpisode}
                disabled={Boolean(totalEpisodesInSeason && episode >= totalEpisodesInSeason)}
                className="flex items-center gap-1 rounded-poster border border-border-active bg-surface px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-surface"
                title="Siguiente Episodio (Tecla N)"
              >
                Siguiente Episodio
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div />
          )}

          {/* Safe notice */}
          <div className="flex items-center gap-1.5 text-muted">
            <ShieldAlert className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Streaming seguro y directo. Presiona &apos;T&apos; para modo cine o &apos;F&apos; para pantalla completa.</span>
          </div>
        </div>
      </div>

      {/* Modal de Atajos de Teclado */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-poster border border-border-active bg-surface p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                <Keyboard className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>Atajos de teclado</span>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="text-muted hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-2.5 text-sm text-foreground">
              <div className="flex items-center justify-between">
                <span>Modo Cine / Teatro</span>
                <kbd className="kbd">T</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Pantalla Completa</span>
                <kbd className="kbd">F</kbd>
              </div>
              {mediaType !== "movie" && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Siguiente Capítulo</span>
                    <kbd className="kbd">N</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Capítulo Anterior</span>
                    <kbd className="kbd">P</kbd>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span>Salir de Modo Cine</span>
                <kbd className="kbd">ESC</kbd>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowShortcutsModal(false)}
              className="w-full rounded-poster bg-accent py-2 text-sm font-semibold text-accent-ink hover:bg-accent-hover transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
