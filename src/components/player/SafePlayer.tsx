"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ServerOption, MediaType } from "@/types";
import { saveWatchProgress } from "@/services/history";
import {
  RotateCcw,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Layers,
  Maximize,
  Minimize,
  Share2,
  Check,
  Keyboard,
  X,
  Tv,
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
      // Fallback
      setCopiedLink(false);
    }
  };

  // Atajos de teclado: F (fullscreen), T (teatro), N (next), P (prev), Esc (salir teatro)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignorar si el usuario está enfocado en un campo de texto
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
        {/* Barra superior de servidores y acciones de control */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-slate-200">Servidores:</span>
          </div>

          {/* Servidores tabs */}
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

          {/* Botones de acción derecha */}
          <div className="flex items-center gap-1.5">
            {/* Copiar enlace directo */}
            <button
              onClick={handleCopyDirectLink}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                copiedLink
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-surface-active text-slate-300 hover:bg-surface-hover hover:text-white"
              }`}
              title="Copiar enlace directo a este capítulo"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Compartir</span>
                </>
              )}
            </button>

            {/* Modo Teatro */}
            <button
              onClick={() => setIsTheaterMode(!isTheaterMode)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                isTheaterMode
                  ? "bg-accent text-white"
                  : "bg-surface-active text-slate-300 hover:bg-surface-hover hover:text-white"
              }`}
              title="Modo Cine / Teatro (Tecla T)"
            >
              <Tv className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isTheaterMode ? "Salir Cine" : "Modo Cine"}
              </span>
            </button>

            {/* Pantalla completa nativa */}
            <button
              onClick={handleToggleFullscreen}
              className="flex items-center gap-1 rounded-md bg-surface-active px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-surface-hover hover:text-white transition-colors"
              title="Pantalla Completa (Tecla F)"
            >
              <Maximize className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Pantalla</span>
            </button>

            {/* Atajos de teclado */}
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-surface-hover hover:text-white"
              title="Ver atajos de teclado"
            >
              <Keyboard className="h-3.5 w-3.5" />
            </button>

            {/* Recargar */}
            <button
              onClick={handleReloadServer}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-surface-hover hover:text-white"
              title="Recargar reproductor"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Cerrar Modo Teatro si está activo */}
            {isTheaterMode && (
              <button
                onClick={() => setIsTheaterMode(false)}
                className="flex items-center justify-center rounded-md bg-rose-500/20 text-rose-400 p-1 hover:bg-rose-500/30 ml-2"
                title="Cerrar Modo Cine (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* 16:9 Sandboxed Video Player Container */}
        <div
          ref={playerContainerRef}
          className={`relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-2xl ${
            isTheaterMode ? "max-h-[82vh] my-auto" : ""
          }`}
        >
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
                title="Episodio Anterior (Tecla P)"
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
                title="Siguiente Episodio (Tecla N)"
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
            <span>Iframe sandboxed. Presiona 'T' para modo cine o 'F' para pantalla completa.</span>
          </div>
        </div>
      </div>

      {/* Modal de Atajos de Teclado */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-semibold text-white text-sm">
                <Keyboard className="h-4 w-4 text-accent" />
                <span>Atajos de Teclado</span>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>Modo Cine / Teatro</span>
                <kbd className="rounded border border-border bg-surface-active px-2 py-0.5 font-mono text-[11px] text-accent">
                  T
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Pantalla Completa</span>
                <kbd className="rounded border border-border bg-surface-active px-2 py-0.5 font-mono text-[11px] text-accent">
                  F
                </kbd>
              </div>
              {mediaType !== "movie" && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Siguiente Capítulo</span>
                    <kbd className="rounded border border-border bg-surface-active px-2 py-0.5 font-mono text-[11px] text-accent">
                      N
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Capítulo Anterior</span>
                    <kbd className="rounded border border-border bg-surface-active px-2 py-0.5 font-mono text-[11px] text-accent">
                      P
                    </kbd>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span>Salir de Modo Cine</span>
                <kbd className="rounded border border-border bg-surface-active px-2 py-0.5 font-mono text-[11px] text-accent">
                  ESC
                </kbd>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full rounded-xl bg-accent py-2 text-xs font-semibold text-white hover:bg-accent-hover transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
