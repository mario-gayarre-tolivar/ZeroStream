import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LiveSearch } from "@/components/layout/LiveSearch";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("<LiveSearch /> — Buscador en Vivo con Debounce", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("debe renderizar el input de búsqueda con su placeholder", () => {
    render(<LiveSearch />);
    expect(
      screen.getByPlaceholderText(/Buscar anime, película, serie/i)
    ).toBeInTheDocument();
  });

  it("no debe disparar búsqueda si el texto tiene menos de 2 caracteres", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    render(<LiveSearch />);
    const input = screen.getByPlaceholderText(/Buscar anime, película, serie/i);

    fireEvent.change(input, { target: { value: "a" } });

    await new Promise((r) => setTimeout(r, 350));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("debe disparar búsqueda tras el debounce de 300ms al escribir 2 o más caracteres", async () => {
    const mockResponse = {
      query: "sp",
      totalResults: 1,
      movies: [
        {
          id: 550,
          title: "Spider-Man",
          type: "movie",
          posterPath: "/poster.jpg",
          releaseDate: "2002",
          voteAverage: 7.4,
          genres: ["Acción"],
        },
      ],
      series: [],
      anime: [],
    };

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(<LiveSearch />);
    const input = screen.getByPlaceholderText(/Buscar anime, película, serie/i);

    fireEvent.change(input, { target: { value: "sp" } });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("/api/search?q=sp");
    });

    await waitFor(() => {
      expect(screen.getByText("Spider-Man")).toBeInTheDocument();
    });
  });

  it("debe cerrar los resultados al presionar la tecla Escape", async () => {
    const mockResponse = {
      query: "batman",
      totalResults: 1,
      movies: [
        {
          id: 155,
          title: "The Dark Knight",
          type: "movie",
          posterPath: "/poster.jpg",
          releaseDate: "2008",
          voteAverage: 9.0,
          genres: ["Acción"],
        },
      ],
      series: [],
      anime: [],
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    render(<LiveSearch />);
    const input = screen.getByPlaceholderText(/Buscar anime, película, serie/i);

    fireEvent.change(input, { target: { value: "batman" } });

    await waitFor(() => {
      expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
    });

    // Presionar Escape
    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByText("The Dark Knight")).not.toBeInTheDocument();
    });
  });
});
