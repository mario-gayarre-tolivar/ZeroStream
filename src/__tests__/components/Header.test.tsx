import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Header } from "@/components/layout/Header";

vi.mock("next/navigation", () => ({ usePathname: () => "/series" }));
vi.mock("@/client/hooks/useCatalogPrefetch", () => ({
  useCatalogPrefetch: () => ({ prefetchCatalog: vi.fn() }),
}));
vi.mock("@/components/layout/LiveSearch", () => ({
  LiveSearch: () => <div data-testid="live-search" />,
}));

describe("<Header />", () => {
  it("expone la navegación principal con sus destinos", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: /navegación principal/i });
    const hrefs = within(nav)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/", "/peliculas", "/series", "/anime", "/mi-lista"]);
  });

  it("el logo enlaza a la portada", () => {
    render(<Header />);
    const logo = screen.getByRole("link", { name: /zerostream/i });
    expect(logo).toHaveAttribute("href", "/");
  });

  it("el botón del menú alterna aria-expanded y muestra los mismos destinos", () => {
    render(<Header />);
    const toggle = screen.getByRole("button", { name: /menú de navegación/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("link", { name: "Series" })).toHaveLength(2);
  });
});
