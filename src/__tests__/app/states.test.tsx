import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ErrorBoundary from "@/app/error";
import NotFound from "@/app/not-found";
import MyListPage from "@/app/mi-lista/page";

vi.mock("@/client/history", () => ({
  getFavorites: () => [],
  getWatchHistory: () => [],
}));

describe("Vistas de estado y resiliencia", () => {
  it("ErrorBoundary ofrece reintentar y expone el mensaje útil de error", () => {
    const reset = vi.fn();
    render(<ErrorBoundary error={new Error("Fallo de red")} reset={reset} />);

    expect(screen.getByRole("heading", { name: "Error al cargar la página" })).toBeInTheDocument();
    expect(
      screen.getByText("No se pudo cargar esta página. Comprueba tu conexión e inténtalo de nuevo.")
    ).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /reintentar/i });
    fireEvent.click(retryBtn);
    expect(reset).toHaveBeenCalled();
  });

  it("NotFound ofrece enlace de regreso al inicio", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: /no encontrado/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inicio/i })).toHaveAttribute("href", "/");
  });

  it("Mi Lista vacía muestra invitación a explorar", () => {
    render(<MyListPage />);
    expect(screen.getByRole("link", { name: /explorar catálogo/i })).toHaveAttribute("href", "/");
  });
});
