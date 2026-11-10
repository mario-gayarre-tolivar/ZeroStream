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
});
