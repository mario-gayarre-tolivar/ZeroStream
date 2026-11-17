import { describe, it, expect } from 'vitest';
import type { MediaType, MediaItem, Episode, Season, MediaDetail, FilterOptions } from '@/types/media';
import type { ServerHealthStatus, ServerHealthReason, ServerOption, ServerCheckResult, ServerCheckResponse } from '@/types/servers';
import type { WatchHistoryItem } from '@/types/storage';
import * as AllTypes from '@/types';

describe('Contracts de Tipos Modulares', () => {
  it('debe permitir instanciar objetos conformes con los contratos de media', () => {
    const item: MediaItem = {
      id: 123,
      title: 'Test Movie',
      type: 'movie',
      overview: 'Overview test',
      posterPath: '/path.jpg',
      voteAverage: 8.5,
      genres: ['Acción'],
    };
    expect(item.id).toBe(123);
    expect(item.type).toBe('movie');
  });

  it('debe permitir instanciar objetos conformes con los contratos de servers', () => {
    const server: ServerOption = {
      id: 'server-1',
      name: 'Server 1',
      quality: '1080p',
      url: 'https://embed.test/1',
      language: 'sub',
    };
    const healthResult: ServerCheckResult = {
      serverId: 'server-1',
      status: 'healthy',
      reason: 'ok',
      latencyMs: 120,
      checkedAt: Date.now(),
    };
    expect(server.id).toBe('server-1');
    expect(healthResult.status).toBe('healthy');
  });

  it('debe permitir instanciar objetos conformes con los contratos de storage', () => {
    const historyItem: WatchHistoryItem = {
      id: 456,
      title: 'Anime Episode 1',
      type: 'anime',
      posterPath: '/anime.jpg',
      episode: 1,
      updatedAt: Date.now(),
    };
    expect(historyItem.type).toBe('anime');
    expect(historyItem.episode).toBe(1);
  });

  it('debe asegurar que el barril index.ts re-exporta los tipos', () => {
    // Verificamos que el módulo index existe y compila sin colisiones
    expect(AllTypes).toBeDefined();
  });
});
