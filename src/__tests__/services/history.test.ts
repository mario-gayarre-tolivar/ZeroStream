import { describe, it, expect, beforeEach } from "vitest";
import {
  getWatchHistory,
  saveWatchProgress,
  getFavorites,
  toggleFavorite,
} from "@/services/history";

describe("Persistencia en Cliente (localStorage) — Historial y Favoritos", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getWatchHistory debe retornar lista vacía inicialmente", () => {
    expect(getWatchHistory()).toEqual([]);
  });

  it("saveWatchProgress debe almacenar y actualizar el progreso de visualización", () => {
    saveWatchProgress({
      id: 550,
      title: "Fight Club",
      type: "movie",
      posterPath: "/poster.jpg",
    });

    const history = getWatchHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe(550);
    expect(history[0].title).toBe("Fight Club");
    expect(history[0].updatedAt).toBeTypeOf("number");
  });

  it("saveWatchProgress no debe duplicar items del mismo ID y tipo", () => {
    saveWatchProgress({
      id: 1399,
      title: "Game of Thrones",
      type: "tv",
      posterPath: "/got.jpg",
      season: 1,
      episode: 1,
    });

    saveWatchProgress({
      id: 1399,
      title: "Game of Thrones",
      type: "tv",
      posterPath: "/got.jpg",
      season: 1,
      episode: 2,
    });

    const history = getWatchHistory();
    expect(history).toHaveLength(1);
    expect(history[0].episode).toBe(2);
  });

  it("toggleFavorite debe añadir y retirar items correctamente", () => {
    const movie = {
      id: 99,
      title: "Película Favorita",
      type: "movie" as const,
      posterPath: "/fav.jpg",
    };

    // Añadir
    const added = toggleFavorite(movie);
    expect(added).toBe(true);
    expect(getFavorites()).toHaveLength(1);
    expect(getFavorites()[0].title).toBe("Película Favorita");

    // Quitar
    const removed = toggleFavorite(movie);
    expect(removed).toBe(false);
    expect(getFavorites()).toHaveLength(0);
  });
});
