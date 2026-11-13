import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FilterBar } from "@/components/media/FilterBar";
import { Pagination } from "@/components/media/Pagination";
import { MediaGrid } from "@/components/media/MediaGrid";
import { LoadMoreCatalog } from "@/components/media/LoadMoreCatalog";
import { MediaItem } from "@/types";

const push = vi.fn();
let search = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/peliculas",
  useSearchParams: () => new URLSearchParams(search),
}));

function makeItem(id: number): MediaItem {
  return {
    id,
    title: `Título ${id}`,
    type: "movie",
    overview: "",
    posterPath: null,
    backdropPath: null,
    releaseDate: "2020-01-01",
    voteAverage: 7,
    genres: [],
  } as unknown as MediaItem;
}

beforeEach(() => {
  push.mockClear();
  search = "";
});

describe("<FilterBar />", () => {
  it("lista los géneros como botones y aplica el filtro por URL", () => {
    render(<FilterBar genres={["Acción", "Drama"]} />);
    expect(screen.getByRole("button", { name: "Todos" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Drama" }));

    expect(push).toHaveBeenCalledWith("/peliculas?genre=Drama");
  });

  it("muestra la búsqueda activa y permite quitarla", () => {
    search = "q=batman";
    render(<FilterBar genres={[]} />);
    expect(screen.getByText(/batman/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /quitar búsqueda/i }));

    expect(push).toHaveBeenCalledWith("/peliculas?");
  });
});

describe("<Pagination />", () => {
  it("marca la página actual con aria-current", () => {
    render(<Pagination currentPage={3} />);
    expect(screen.getByRole("navigation", { name: /paginación de catálogo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toHaveAttribute("aria-current", "page");
  });

  it("deshabilita Anterior en la primera página y Siguiente sin más resultados", () => {
    render(<Pagination currentPage={1} hasMore={false} />);
    expect(screen.getByRole("button", { name: /página anterior/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /página siguiente/i })).toBeDisabled();
  });

  it("navega a la página elegida", () => {
    render(<Pagination currentPage={1} />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(push).toHaveBeenCalledWith("/peliculas?page=2");
  });
});

describe("<MediaGrid />", () => {
  it("muestra título y subtítulo y una tarjeta por elemento", () => {
    render(<MediaGrid items={[makeItem(1), makeItem(2)]} title="Populares" subtitle="Esta semana" />);
    expect(screen.getByRole("heading", { name: "Populares" })).toBeInTheDocument();
    expect(screen.getByText("Esta semana")).toBeInTheDocument();
    expect(screen.getByText("Título 1")).toBeInTheDocument();
    expect(screen.getByText("Título 2")).toBeInTheDocument();
  });

  it("muestra el mensaje vacío cuando no hay elementos", () => {
    render(<MediaGrid items={[]} emptyMessage="Nada por aquí" />);
    expect(screen.getByText("Nada por aquí")).toBeInTheDocument();
  });
});

describe("<LoadMoreCatalog />", () => {
  it("ofrece cargar más cuando la página llega completa", () => {
    const items = [1, 2, 3, 4, 5, 6].map(makeItem);
    render(<LoadMoreCatalog initialItems={items} type="movie" currentPage={1} />);
    expect(screen.getByRole("button", { name: /cargar más títulos/i })).toBeEnabled();
  });

  it("no ofrece cargar más con una página incompleta", () => {
    render(<LoadMoreCatalog initialItems={[makeItem(1)]} type="movie" currentPage={1} />);
    expect(screen.queryByRole("button", { name: /cargar más títulos/i })).not.toBeInTheDocument();
  });
});
