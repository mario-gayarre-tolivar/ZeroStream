import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Footer } from "@/components/layout/Footer";

describe("<Footer />", () => {
  it("expone el pie de página con el aviso legal en lenguaje claro", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByText("Aviso legal (DMCA)")).toBeInTheDocument();
    expect(footer).toHaveTextContent(/no aloja ni distribuye vídeo/i);
    expect(footer).toHaveTextContent(/servicios externos independientes/i);
  });

  it("no usa jerga interna de arquitectura", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).not.toHaveTextContent(/zero-storage/i);
  });

  it("enlaza a las secciones del sitio", () => {
    render(<Footer />);
    const hrefs = within(screen.getByRole("contentinfo"))
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/peliculas", "/series", "/anime", "/mi-lista"]);
  });
});
