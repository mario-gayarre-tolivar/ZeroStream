import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaItem } from "@/types";

describe("<MediaCard /> — Tarjeta de Contenido", () => {
  const mockItem: MediaItem = {
    id: 550,
    title: "El Club de la Lucha",
    type: "movie",
    overview: "Un oficinista desencantado...",
    posterPath: "https://image.tmdb.org/t/p/w500/poster.jpg",
    backdropPath: "/backdrop.jpg",
    releaseDate: "1999-10-15",
    voteAverage: 8.8,
    genres: ["Drama"],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it("debe mostrar el título, año y etiqueta del tipo de contenido", () => {
    render(<MediaCard item={mockItem} />);

    expect(screen.getByText("El Club de la Lucha")).toBeInTheDocument();
    expect(screen.getByText("1999")).toBeInTheDocument();
    expect(screen.getByText("Película")).toBeInTheDocument();
    expect(screen.getByText("8.8")).toBeInTheDocument();
  });

  it("debe enlazar a la ruta de detalle y reproducción correcta", () => {
    render(<MediaCard item={mockItem} />);

    const link = screen.getAllByRole("link")[0];
    expect(link).toHaveAttribute("href", "/ver/movie/550");
  });
});
