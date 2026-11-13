"use client";

import { ServerOption } from "@/types";
import {
  Layers,
  RotateCcw,
  Share2,
  Check,
  Tv,
  Maximize,
  Keyboard,
} from "lucide-react";

interface PlayerControlBarProps {
  servers: ServerOption[];
  activeServerIndex: number;
  onSelectServer: (index: number) => void;
  onReload: () => void;
  isTheaterMode: boolean;
  onToggleTheater: () => void;
  onToggleFullscreen: () => void;
  onOpenShortcuts: () => void;
  copiedLink: boolean;
  onCopyLink: () => void;
}

export function PlayerControlBar({
  servers,
  activeServerIndex,
  onSelectServer,
  onReload,
  isTheaterMode,
  onToggleTheater,
  onToggleFullscreen,
  onOpenShortcuts,
  copiedLink,
  onCopyLink,
}: PlayerControlBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-accent" />
        <span className="text-xs font-semibold text-zinc-300">Servidores:</span>
      </div>

      {/* Servidores tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {servers.map((server, idx) => (
          <button
            key={server.id || idx}
            type="button"
            onClick={() => onSelectServer(idx)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
              activeServerIndex === idx
                ? "bg-accent text-background font-semibold shadow-sm"
                : "bg-surface-active text-zinc-300 hover:bg-surface-hover hover:text-white"
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
          type="button"
          onClick={onCopyLink}
          className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
            copiedLink
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-surface-active text-zinc-300 hover:bg-surface-hover hover:text-white"
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
          type="button"
          onClick={onToggleTheater}
          className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
            isTheaterMode
              ? "bg-accent text-background font-semibold"
              : "bg-surface-active text-zinc-300 hover:bg-surface-hover hover:text-white"
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
          type="button"
          onClick={onToggleFullscreen}
          className="flex items-center gap-1 rounded bg-surface-active px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-surface-hover hover:text-white transition-colors"
          title="Pantalla Completa (Tecla F)"
        >
          <Maximize className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Pantalla</span>
        </button>

        {/* Atajos de teclado */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-400 hover:bg-surface-hover hover:text-white"
          title="Ver atajos de teclado"
        >
          <Keyboard className="h-3.5 w-3.5" />
        </button>

        {/* Recargar */}
        <button
          type="button"
          onClick={onReload}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-400 hover:bg-surface-hover hover:text-white"
          title="Recargar reproductor"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
