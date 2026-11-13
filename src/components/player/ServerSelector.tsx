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
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 rounded-xl border border-border bg-surface p-3 sm:px-4 sm:py-2.5 w-full">
      {/* 1. Título "Servidores": Arriba a la izquierda en móvil, izquierda en desktop */}
      <div className="flex items-center gap-2 shrink-0 order-1">
        <Layers className="h-4 w-4 text-accent shrink-0" />
        <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
          Servidores
        </span>
      </div>

      {/* 2. Botones de acción rápida: Arriba a la derecha en móvil (order-2), derecha en desktop (order-3) */}
      <div className="flex items-center gap-1.5 shrink-0 order-2 sm:order-3">
        {/* Copiar enlace directo */}
        <button
          type="button"
          onClick={onCopyLink}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
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
              <span className="hidden md:inline">Compartir</span>
            </>
          )}
        </button>

        {/* Modo Teatro */}
        <button
          type="button"
          onClick={onToggleTheater}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
            isTheaterMode
              ? "bg-accent text-background font-semibold"
              : "bg-surface-active text-zinc-300 hover:bg-surface-hover hover:text-white"
          }`}
          title="Modo Cine / Teatro (Tecla T)"
        >
          <Tv className="h-3.5 w-3.5" />
          <span className="hidden md:inline">
            {isTheaterMode ? "Salir Cine" : "Modo Cine"}
          </span>
        </button>

        {/* Pantalla completa nativa */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="flex items-center gap-1 rounded-lg bg-surface-active px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-surface-hover hover:text-white transition-colors"
          title="Pantalla Completa (Tecla F)"
        >
          <Maximize className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Pantalla</span>
        </button>

        {/* Atajos de teclado (desktop) */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="hidden md:flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-surface-hover hover:text-white"
          title="Ver atajos de teclado"
        >
          <Keyboard className="h-3.5 w-3.5" />
        </button>

        {/* Recargar */}
        <button
          type="button"
          onClick={onReload}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-surface-hover hover:text-white"
          title="Recargar reproductor"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 3. Carril táctil horizontal de servidores: Fila 2 completa en móvil (order-3 w-full), centro en desktop (order-2) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto sm:flex-1 py-0.5 order-3 sm:order-2">
        {servers.map((server, idx) => {
          const isActive = activeServerIndex === idx;
          return (
            <button
              key={server.id || idx}
              type="button"
              onClick={() => onSelectServer(idx)}
              className={`flex items-center gap-1.5 shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-accent text-background font-bold shadow-md shadow-accent/20 ring-1 ring-accent"
                  : "bg-surface-active text-zinc-300 hover:bg-surface-hover hover:text-white"
              }`}
            >
              <span>{server.name}</span>
              <span
                className={`text-[10px] font-mono px-1 py-0.5 rounded border ${
                  isActive
                    ? "bg-black/20 text-background border-black/20 font-bold"
                    : "bg-surface text-zinc-400 border-border/60"
                }`}
              >
                {server.quality}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
