import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HomePage from "@/app/page";
import * as catalogService from "@/services/catalog-cache";
import { MediaItem } from "@/types";

vi.mock("@/services/catalog-cache", () => ({
  getCachedCatalog: vi.fn(),
}));

vi.mock("@/components/home/HeroBanner", () => ({
  HeroBanner: () => <div data-testid="hero-banner" />,
}));
vi.mock("@/components/home/ContinueWatching", () => ({
  ContinueWatching: () => <div data-testid="continue-watching" />,
}));
vi.mock("@/components/media/MediaGrid", () => ({
  MediaGrid: () => <div data-testid="media-grid" />,
}));

function mockItem(id: number, type: "movie" | "tv" | "anime"): MediaItem {
  return {
    id,
    title: `Item ${id}`,
    type,
    overview: "Sinopsis",
    posterPath: "/poster.jpg",
    backdropPath: "/backdrop.jpg",
    releaseDate: "2024-01-01",
    voteAverage: 8,
    genres: ["Drama"],
  };
}

describe("<HomePage />", () => {
  it("renderiza las tres secciones del catálogo y sus enlaces normalizados 'Ver todo'", async () => {
    vi.mocked(catalogService.getCachedCatalog).mockResolvedValue({
      data: [mockItem(1, "movie")],
      page: 1,
      totalPages: 10,
    } as any);

    const jsx = await HomePage();
    render(jsx);

    expect(screen.getByRole("heading", { level: 2, name: /películas populares/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /series destacadas/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /anime en emisión/i })).toBeInTheDocument();

    const links = screen.getAllByRole("link", { name: /^ver todo$/i });
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/peliculas",
      "/series",
      "/anime",
    ]);
  });
});
