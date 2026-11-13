import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EpisodeSelector } from "@/components/player/EpisodeSelector";
import { Season } from "@/types";

describe("<EpisodeSelector /> — Selector de Temporadas y Capítulos", () => {
  const mockSeasons: Season[] = [
    {
      id: 1,
      seasonNumber: 1,
      name: "Temporada 1",
      episodeCount: 2,
      episodes: [
        {
          id: 101,
          episodeNumber: 1,
          seasonNumber: 1,
          title: "Winter Is Coming",
          overview: "Inicio de la serie",
        },
        {
          id: 102,
          episodeNumber: 2,
          seasonNumber: 1,
          title: "The Kingsroad",
          overview: "Viaje al sur",
        },
      ],
    },
    {
      id: 2,
      seasonNumber: 2,
      name: "Temporada 2",
      episodeCount: 1,
      episodes: [
        {
          id: 201,
          episodeNumber: 1,
          seasonNumber: 2,
          title: "The North Remembers",
          overview: "Comienzo de temporada 2",
        },
      ],
    },
  ];

  it("debe renderizar los episodios de la temporada activa", () => {
    render(
      <EpisodeSelector
        seasons={mockSeasons}
        currentSeason={1}
        currentEpisode={1}
        onSelectEpisode={vi.fn()}
        onSelectSeason={vi.fn()}
      />
    );

    expect(screen.getByText("Winter Is Coming")).toBeInTheDocument();
    expect(screen.getByText("The Kingsroad")).toBeInTheDocument();
  });

  it("debe llamar a onSelectEpisode al pulsar en un capítulo", () => {
    const handleSelectEpisode = vi.fn();

    render(
      <EpisodeSelector
        seasons={mockSeasons}
        currentSeason={1}
        currentEpisode={1}
        onSelectEpisode={handleSelectEpisode}
        onSelectSeason={vi.fn()}
      />
    );

    const episodeTwo = screen.getByText("The Kingsroad");
    fireEvent.click(episodeTwo);

    expect(handleSelectEpisode).toHaveBeenCalledWith(1, 2);
  });

  it("debe llamar a onSelectSeason al cambiar de temporada", () => {
    const handleSelectSeason = vi.fn();

    render(
      <EpisodeSelector
        seasons={mockSeasons}
        currentSeason={1}
        currentEpisode={1}
        onSelectEpisode={vi.fn()}
        onSelectSeason={handleSelectSeason}
      />
    );

    const seasonTwoBtn = screen.getByText("Temporada 2");
    fireEvent.click(seasonTwoBtn);

    expect(handleSelectSeason).toHaveBeenCalledWith(2);
  });

  it("debe paginar temporadas masivas (>100 episodios) en rangos de 100 con selector de página", () => {
    // Simular One Piece con 1124 episodios
    const massiveEpisodes = Array.from({ length: 1124 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      seasonNumber: 1,
      title: `Episodio ${i + 1}`,
      overview: `Sinopsis del episodio ${i + 1}`,
    }));

    const massiveSeasons: Season[] = [
      {
        id: 1,
        seasonNumber: 1,
        name: "Temporada 1",
        episodeCount: 1124,
        episodes: massiveEpisodes,
      },
    ];

    render(
      <EpisodeSelector
        seasons={massiveSeasons}
        currentSeason={1}
        currentEpisode={1}
        onSelectEpisode={vi.fn()}
        onSelectSeason={vi.fn()}
      />
    );

    // Debe mostrar selector de rango/página
    expect(screen.getByRole("combobox", { name: /seleccionar rango de episodios/i })).toBeInTheDocument();

    // En la página 1 (1-100), debe aparecer el episodio 1 y episodio 100, pero NO el 713
    expect(screen.getAllByText(/Episodio 1\b/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Episodio 100\b/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Episodio 713\b/)).not.toBeInTheDocument();
  });

  it("debe permitir saltar directamente al rango 701-800 y seleccionar el episodio 713", () => {
    const massiveEpisodes = Array.from({ length: 1124 }, (_, i) => ({
      id: i + 1,
      episodeNumber: i + 1,
      seasonNumber: 1,
      title: `Episodio ${i + 1}`,
      overview: `Sinopsis del episodio ${i + 1}`,
    }));

    const massiveSeasons: Season[] = [
      {
        id: 1,
        seasonNumber: 1,
        name: "Temporada 1",
        episodeCount: 1124,
        episodes: massiveEpisodes,
      },
    ];

    const handleSelectEpisode = vi.fn();

    render(
      <EpisodeSelector
        seasons={massiveSeasons}
        currentSeason={1}
        currentEpisode={1}
        onSelectEpisode={handleSelectEpisode}
        onSelectSeason={vi.fn()}
      />
    );

    const select = screen.getByRole("combobox", { name: /seleccionar rango de episodios/i });
    // Cambiar a la página 8 (Eps 701 - 800)
    fireEvent.change(select, { target: { value: "7" } }); // index 7 = page 8 (701-800)

    // Ahora el botón del episodio 713 debe estar en pantalla
    const ep713Btn = screen.getByRole("button", { name: /episodio 713/i });
    expect(ep713Btn).toBeInTheDocument();

    fireEvent.click(ep713Btn);
    expect(handleSelectEpisode).toHaveBeenCalledWith(1, 713);
  });
});
