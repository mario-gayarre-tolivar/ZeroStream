import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PlayerViewClient } from "@/app/ver/[type]/[id]/PlayerViewClient";
import { MediaDetail } from "@/types";

const mockReplace = vi.fn();
let currentSearch = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

describe("<PlayerViewClient /> — Integración con SafePlayer y Autoselección", () => {
  const mockTvMedia: MediaDetail = {
    id: "1399",
    title: "Juego de Tronos",
    type: "tv",
    overview: "Siete reinos luchan por el trono de hierro.",
    posterPath: "/got.jpg",
    voteAverage: 8.4,
    genres: ["Drama", "Fantasía"],
    tmdbId: 1399,
    seasons: [
      {
        seasonNumber: 1,
        name: "Temporada 1",
        episodeCount: 10,
        episodes: [
          { episodeNumber: 1, seasonNumber: 1, title: "Se acerca el invierno" },
          { episodeNumber: 2, seasonNumber: 1, title: "El camino real" },
        ],
      },
    ],
  };

  const mockAnimeMedia: MediaDetail = {
    id: "21",
    title: "One Piece",
    type: "anime",
    overview: "Monkey D. Luffy navega en busca del tesoro.",
    posterPath: "/onepiece.jpg",
    voteAverage: 8.9,
    genres: ["Animación", "Aventura"],
    malId: 21,
    tmdbId: 37854,
    seasons: [
      {
        seasonNumber: 1,
        name: "East Blue",
        episodeCount: 61,
        episodes: [
          { episodeNumber: 1, seasonNumber: 1, title: "¡Yo soy Luffy!" },
          { episodeNumber: 2, seasonNumber: 1, title: "¡El gran espadachín!" },
        ],
      },
    ],
  };

  const mockMovieMedia: MediaDetail = {
    id: "550",
    title: "El club de la lucha",
    type: "movie",
    overview: "Un empleado de oficina hastiado...",
    posterPath: "/poster.jpg",
    voteAverage: 8.4,
    genres: ["Drama"],
    tmdbId: 550,
  };

  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    mockReplace.mockClear();
    currentSearch = "";
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("debe inicializar SafePlayer con autoselección activa y pasar tmdbId al endpoint /api/servers/check", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { serverId: "vidlink", status: "healthy", latencyMs: 120 },
          { serverId: "embedsu", status: "dead", reason: "http_error", latencyMs: 450 },
        ],
      }),
    });
    global.fetch = fetchMock;

    render(
      <PlayerViewClient
        media={mockTvMedia}
        initialSeason={1}
        initialEpisode={1}
      />
    );

    // Debe mostrar la verificación de servidores activa inmediatamente
    expect(screen.getByText("Verificando servidores disponibles...")).toBeInTheDocument();

    // Debe invocar /api/servers/check con los parámetros de la serie incluyendo tmdbId
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/servers/check",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "tv",
            id: "1399",
            season: 1,
            episode: 1,
            title: "Juego de Tronos",
            tmdbId: 1399,
            malId: undefined,
            forceRefresh: false,
          }),
        })
      );
    });

    // Tras resolver la verificación, el reproductor debe cargar el servidor saludable seleccionado
    await waitFor(() => {
      const iframe = screen.getByTitle("Reproductor para Juego de Tronos");
      expect(iframe).toHaveAttribute(
        "src",
        expect.stringContaining("https://vidlink.pro/tv/1399/1/1")
      );
    });
  });

  it("para anime con malId, debe enviar malId al backend y autoseleccionar el servidor de anime", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { serverId: "anime-zoko-sub", status: "healthy", latencyMs: 95 },
        ],
      }),
    });
    global.fetch = fetchMock;

    render(
      <PlayerViewClient
        media={mockAnimeMedia}
        initialSeason={1}
        initialEpisode={1}
      />
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/servers/check",
        expect.objectContaining({
          body: JSON.stringify({
            type: "anime",
            id: "21",
            season: 1,
            episode: 1,
            title: "One Piece",
            tmdbId: 37854,
            malId: 21,
            forceRefresh: false,
          }),
        })
      );
    });

    await waitFor(() => {
      const iframe = screen.getByTitle("Reproductor para One Piece");
      expect(iframe).toHaveAttribute("src", expect.stringContaining("zokoanime.video/stream/mal/21/1/sub"));
    });
  });

  it("debe reiniciar la verificación y actualizar la URL al cambiar de episodio", async () => {
    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        ok: true,
        json: async () => ({
          results: [
            { serverId: "vidlink", status: "healthy", latencyMs: 100 },
          ],
        }),
      };
    });
    global.fetch = fetchMock;

    render(
      <PlayerViewClient
        media={mockTvMedia}
        initialSeason={1}
        initialEpisode={1}
      />
    );

    // Esperar a que se complete la verificación del episodio 1
    await waitFor(() => {
      expect(screen.getByTitle("Reproductor para Juego de Tronos")).toBeInTheDocument();
    });
    expect(callCount).toBe(1);

    // Cambiar al episodio siguiente usando el botón del reproductor
    const nextButton = screen.getByRole("button", { name: /siguiente episodio/i });
    fireEvent.click(nextButton);

    // Debe actualizar la URL con router.replace
    expect(mockReplace).toHaveBeenCalledWith("/ver/tv/1399?s=1&e=2", { scroll: false });

    // El encabezado debe reflejar el nuevo capítulo
    expect(screen.getByText(/— T1:E2/)).toBeInTheDocument();

    // Debe relanzar la verificación de servidores para el episodio 2
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/servers/check",
        expect.objectContaining({
          body: JSON.stringify({
            type: "tv",
            id: "1399",
            season: 1,
            episode: 2,
            title: "Juego de Tronos",
            tmdbId: 1399,
            malId: undefined,
            forceRefresh: false,
          }),
        })
      );
    });
    expect(callCount).toBe(2);
  });

  it("para películas no debe ofrecer cambio de episodio y debe autoseleccionar servidores de película", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { serverId: "vidlink", status: "healthy", latencyMs: 150 },
        ],
      }),
    });
    global.fetch = fetchMock;

    render(
      <PlayerViewClient
        media={mockMovieMedia}
        initialSeason={1}
        initialEpisode={1}
      />
    );

    // No debe haber botón de Siguiente Episodio
    expect(screen.queryByRole("button", { name: /siguiente episodio/i })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/servers/check",
        expect.objectContaining({
          body: JSON.stringify({
            type: "movie",
            id: "550",
            season: 1,
            episode: 1,
            title: "El club de la lucha",
            tmdbId: 550,
            malId: undefined,
            forceRefresh: false,
          }),
        })
      );
    });
  });
});
