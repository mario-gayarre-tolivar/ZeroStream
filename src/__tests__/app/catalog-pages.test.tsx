import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MoviesPage from "@/app/peliculas/page";
import SeriesPage from "@/app/series/page";
import AnimePage from "@/app/anime/page";
import * as catalogService from "@/services/catalog-cache";

vi.mock("@/services/catalog-cache", () => ({
  getCachedCatalog: vi.fn(),
}));

vi.mock("@/components/media/FilterBar", () => ({
  FilterBar: () => <div data-testid="filter-bar" />,
}));

vi.mock("@/components/media/LoadMoreCatalog", () => ({
  LoadMoreCatalog: () => <div data-testid="load-more-catalog" />,
}));

describe("Páginas de Catálogo", () => {
  it("renderiza el catálogo de películas con su encabezado y filtros", async () => {
    vi.mocked(catalogService.getCachedCatalog).mockResolvedValue({
      data: [{ id: 1, title: "Peli", type: "movie", overview: "", posterPath: null, backdropPath: null, releaseDate: "", voteAverage: 7, genres: [] }],
      page: 1,
      totalPages: 1,
    });
    const jsx = await MoviesPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByRole("heading", { level: 1, name: /catálogo de películas/i })).toBeInTheDocument();
    expect(screen.getByTestId("filter-bar")).toBeInTheDocument();
  });

  it("renderiza el catálogo de series con su encabezado y filtros", async () => {
    vi.mocked(catalogService.getCachedCatalog).mockResolvedValue({
      data: [{ id: 2, title: "Serie", type: "tv", overview: "", posterPath: null, backdropPath: null, releaseDate: "", voteAverage: 7, genres: [] }],
      page: 1,
      totalPages: 1,
    });
    const jsx = await SeriesPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByRole("heading", { level: 1, name: /catálogo de series/i })).toBeInTheDocument();
    expect(screen.getByTestId("filter-bar")).toBeInTheDocument();
  });

  it("renderiza el catálogo de anime con su encabezado y filtros", async () => {
    vi.mocked(catalogService.getCachedCatalog).mockResolvedValue({
      data: [{ id: 3, title: "Anime", type: "anime", overview: "", posterPath: null, backdropPath: null, releaseDate: "", voteAverage: 7, genres: [] }],
      page: 1,
      totalPages: 1,
    });
    const jsx = await AnimePage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByRole("heading", { level: 1, name: /catálogo de anime/i })).toBeInTheDocument();
    expect(screen.getByTestId("filter-bar")).toBeInTheDocument();
  });
});
