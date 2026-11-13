import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { HeroBanner } from "@/components/home/HeroBanner";
import { MediaItem } from "@/types";

const item = {
  id: 603,
  title: "Matrix",
  type: "movie",
  overview: "Un hacker descubre la verdad.",
  posterPath: null,
  backdropPath: null,
  releaseDate: "1999-03-31",
  voteAverage: 8.2,
  genres: ["Acción", "Ciencia ficción"],
} as unknown as MediaItem;

describe("<HeroBanner />", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("muestra el título como encabezado principal", () => {
    render(<HeroBanner item={item} />);
    expect(screen.getByRole("heading", { level: 1, name: "Matrix" })).toBeInTheDocument();
  });

  it("el enlace de reproducción apunta a la página del título", () => {
    render(<HeroBanner item={item} />);
    expect(screen.getByRole("link", { name: /ver ahora/i })).toHaveAttribute("href", "/ver/movie/603");
  });

  it("el botón de lista alterna entre guardar y quitar", () => {
    render(<HeroBanner item={item} />);
    const button = screen.getByRole("button", { name: /guardar en mi lista/i });

    fireEvent.click(button);

    expect(screen.getByRole("button", { name: /^en mi lista$/i })).toBeInTheDocument();
  });

  it("rotula el destacado con lenguaje de cartelera", () => {
    render(<HeroBanner item={item} />);
    expect(screen.getByText("En cartelera hoy")).toBeInTheDocument();
    expect(screen.queryByText(/destacado hoy/i)).not.toBeInTheDocument();
  });
});
