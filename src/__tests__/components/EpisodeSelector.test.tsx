import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EpisodeSelector } from "@/components/player/EpisodeSelector";
import { Season } from "@/types";

describe("<EpisodeSelector /> — Selector de Temporadas y Capítulos", () => {
  const mockSeasons: Season[] = [
    {
      seasonNumber: 1,
      name: "Temporada 1",
      episodeCount: 2,
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          title: "Winter Is Coming",
          overview: "Inicio de la serie",
        },
        {
          episodeNumber: 2,
          seasonNumber: 1,
          title: "The Kingsroad",
          overview: "Viaje al sur",
        },
      ],
    },
    {
      seasonNumber: 2,
      name: "Temporada 2",
      episodeCount: 1,
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 2,
          title: "The North Remembers",
          overview: "Comienzo de temporada 2",
        },
      ],
    },
  ];

  it("debe mostrar un banner con el capítulo y título del episodio seleccionado encima del grid", () => {
    render(
      <EpisodeSelector
        seasons={mockSeasons}
        currentSeason={1}
        currentEpisode={1}
        onSelectEpisode={vi.fn()}
        onSelectSeason={vi.fn()}
      />
    );

    expect(screen.getByText(/Winter Is Coming/i)).toBeInTheDocument();
    expect(screen.getByText(/Capítulo 1/i)).toBeInTheDocument();
  });

  it("debe mostrar únicamente el número en cada botón de episodio dentro del grid compacto", () => {
    render(
      <EpisodeSelector
        seasons={mockSeasons}
        currentSeason={1}
        currentEpisode={1}
        onSelectEpisode={vi.fn()}
        onSelectSeason={vi.fn()}
      />
    );

    const epBtn1 = screen.getByRole("button", { name: /^1$/ });
    expect(epBtn1).toBeInTheDocument();
    expect(epBtn1.textContent?.trim()).toBe("1");
  });

  it("debe llamar a onSelectEpisode al pulsar en el botón numérico de un capítulo", () => {
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

    const episodeTwoBtn = screen.getByRole("button", { name: /^2$/ });
    fireEvent.click(episodeTwoBtn);

    expect(handleSelectEpisode).toHaveBeenCalledWith(1, 2);
  });

  it("debe renderizar un desplegable para seleccionar temporada y llamar a onSelectSeason al cambiar", () => {
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

    const seasonTrigger = screen.getByRole("button", { name: /seleccionar temporada/i });
    expect(seasonTrigger).toBeInTheDocument();

    fireEvent.click(seasonTrigger);
    const opt2 = screen.getByRole("option", { name: /temporada 2/i });
    fireEvent.click(opt2);

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
    expect(screen.getByRole("button", { name: /seleccionar rango de episodios/i })).toBeInTheDocument();

    // En la página 1 (1-100), debe aparecer el botón 1 y el botón 100, pero NO el 713
    expect(screen.getByRole("button", { name: /^1$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^100$/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^713$/ })).not.toBeInTheDocument();
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

    const rangeTrigger = screen.getByRole("button", { name: /seleccionar rango de episodios/i });
    fireEvent.click(rangeTrigger);

    // Cambiar a la página 8 (Eps 701 - 800)
    const page8Opt = screen.getByRole("option", { name: /página 8/i });
    fireEvent.click(page8Opt);

    // Ahora el botón del episodio 713 debe estar en pantalla en el grid numérico
    const ep713Btn = screen.getByRole("button", { name: /^713$/ });
    expect(ep713Btn).toBeInTheDocument();

    fireEvent.click(ep713Btn);
    expect(handleSelectEpisode).toHaveBeenCalledWith(1, 713);
  });
});
