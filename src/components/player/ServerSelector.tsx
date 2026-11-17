"use client";

import { ServerOption, ServerCheckResult } from "@/types";
import {
  Layers,
  RotateCcw,
  Share2,
  Check,
  Tv,
  Maximize,
  Keyboard,
} from "lucide-react";

export interface PlayerControlBarProps {
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
  healthById?: Record<string, ServerCheckResult>;
  onTryNextServer?: () => void;
  canTryNextServer?: boolean;
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
  healthById,
  onTryNextServer,
  canTryNextServer,
}: PlayerControlBarProps) {
  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 rounded-poster border border-border bg-surface p-3 sm:px-4 sm:py-2.5 w-full">
      {/* 1. Título "Servidores": Arriba a la izquierda en móvil, izquierda en desktop */}
      <div className="flex items-center gap-2 shrink-0 order-1">
        <Layers className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">
          Servidores
        </span>
      </div>

      {/* 2. Botones de acción rápida: Arriba a la derecha en móvil (order-2), derecha en desktop (order-3) */}
      <div className="flex items-center gap-1.5 shrink-0 order-2 sm:order-3">
        {/* Probar siguiente servidor (si está habilitado) */}
        {canTryNextServer && onTryNextServer && (
          <button
            type="button"
            onClick={onTryNextServer}
            className="flex items-center gap-1 rounded-poster bg-accent/20 border border-accent/40 text-accent px-2.5 py-1 text-xs font-medium hover:bg-accent/30 transition-colors"
            title="Probar siguiente servidor"
          >
            <span>Probar siguiente</span>
          </button>
        )}

        {/* Copiar enlace directo */}
        <button
          type="button"
          onClick={onCopyLink}
          className={`flex items-center gap-1.5 rounded-poster px-2.5 py-1 text-xs font-medium transition-colors ${
            copiedLink
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-surface-active text-foreground hover:bg-surface-hover"
          }`}
          title="Copiar enlace directo a este capítulo"
        >
          {copiedLink ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>¡Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Compartir</span>
            </>
          )}
        </button>

        {/* Modo Teatro */}
        <button
          type="button"
          onClick={onToggleTheater}
          className={`flex items-center gap-1 rounded-poster px-2.5 py-1 text-xs font-medium transition-colors ${
            isTheaterMode
              ? "bg-accent text-accent-ink font-semibold"
              : "bg-surface-active text-foreground hover:bg-surface-hover"
          }`}
          title="Modo Cine / Teatro (Tecla T)"
        >
          <Tv className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden md:inline">
            {isTheaterMode ? "Salir Cine" : "Modo Cine"}
          </span>
        </button>

        {/* Pantalla completa nativa */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="flex items-center gap-1 rounded-poster bg-surface-active px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-hover transition-colors"
          title="Pantalla Completa (Tecla F)"
        >
          <Maximize className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden md:inline">Pantalla</span>
        </button>

        {/* Atajos de teclado (desktop) */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="hidden md:flex items-center gap-1 rounded-poster px-2 py-1 text-xs text-muted hover:bg-surface-hover hover:text-foreground"
          title="Ver atajos de teclado"
        >
          <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        {/* Recargar */}
        <button
          type="button"
          onClick={onReload}
          className="flex items-center gap-1 rounded-poster px-2 py-1 text-xs text-muted hover:bg-surface-hover hover:text-foreground"
          title="Recargar reproductor"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* 3. Carril táctil horizontal de servidores */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto sm:flex-1 py-0.5 order-3 sm:order-2">
        {servers.map((server, idx) => {
          const isActive = activeServerIndex === idx;
          return (
            <button
              key={server.id || idx}
              type="button"
              onClick={() => onSelectServer(idx)}
              className={`flex items-center gap-1.5 shrink-0 whitespace-nowrap rounded-poster px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-accent text-accent-ink font-semibold"
                  : "bg-surface-active text-foreground hover:bg-surface-hover"
              }`}
            >
              <span>{server.name}</span>
              <span
                className={`text-xs font-mono px-1.5 py-0.5 rounded-poster border ${
                  isActive
                    ? "bg-accent-ink/20 text-accent-ink border-accent-ink/20 font-bold"
                    : "bg-surface text-muted border-border"
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
