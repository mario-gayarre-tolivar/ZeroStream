import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SafePlayer } from "@/components/player/SafePlayer";
import { ServerOption } from "@/types";

describe("<SafePlayer /> — Reproductor Sandboxed Seguro", () => {
  const mockServers: ServerOption[] = [
    {
      id: "vidsrc",
      name: "Servidor Principal",
      quality: "1080p",
      url: "https://vidsrc.me/embed/movie?tmdb=550",
    },
    {
      id: "embedsu",
      name: "Servidor Secundario",
      quality: "1080p Multi",
      url: "https://embed.su/embed/movie/550",
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("debe renderizar el iframe sin atributo sandbox para compatibilidad total con servidores externos", () => {
    const { container } = render(
      <SafePlayer
        servers={mockServers}
        mediaType="movie"
        mediaId={550}
        title="Fight Club"
        posterPath="/poster.jpg"
      />
    );

    const iframe = container.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://vidsrc.me/embed/movie?tmdb=550");
    // Compatibilidad total: NO debe tener atributo sandbox
    expect(iframe?.getAttribute("sandbox")).toBeNull();
    // Atributos de reproducción requeridos
    expect(iframe).toHaveAttribute("allow", expect.stringContaining("autoplay"));
    expect(iframe).toHaveAttribute("referrerpolicy", "no-referrer-when-downgrade");
  });

  it("debe alternar de servidor al pulsar en Servidor Secundario", () => {
    const { container } = render(
      <SafePlayer
        servers={mockServers}
        mediaType="movie"
        mediaId={550}
        title="Fight Club"
        posterPath="/poster.jpg"
      />
    );

    const secondaryServerBtn = screen.getByText(/Servidor Secundario/i);
    fireEvent.click(secondaryServerBtn);

    const iframe = container.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", "https://embed.su/embed/movie/550");
  });

  it("debe activar y desactivar el Modo Cine", () => {
    render(
      <SafePlayer
        servers={mockServers}
        mediaType="movie"
        mediaId={550}
        title="Fight Club"
        posterPath="/poster.jpg"
      />
    );

    const theaterBtn = screen.getByTitle(/Modo Cine \/ Teatro/i);
    expect(screen.getByText("Modo Cine")).toBeInTheDocument();

    fireEvent.click(theaterBtn);
    expect(screen.getByText("Salir Cine")).toBeInTheDocument();

    fireEvent.click(theaterBtn);
    expect(screen.getByText("Modo Cine")).toBeInTheDocument();
  });

  it("debe copiar el enlace al portapapeles", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <SafePlayer
        servers={mockServers}
        mediaType="movie"
        mediaId={550}
        title="Fight Club"
        posterPath="/poster.jpg"
      />
    );

    const copyBtn = screen.getByTitle(/Copiar enlace directo/i);
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("¡Copiado!")).toBeInTheDocument();
    });
  });

  it("debe renderizar el carril de servidores con nombres legibles y badges de calidad", () => {
    render(
      <SafePlayer
        servers={mockServers}
        mediaType="movie"
        mediaId={550}
        title="Fight Club"
        posterPath="/poster.jpg"
      />
    );

    // Verificar que los botones de servidores tienen nombres completos legibles
    const s1 = screen.getByText("Servidor Principal");
    expect(s1).toBeInTheDocument();
    const s2 = screen.getByText("Servidor Secundario");
    expect(s2).toBeInTheDocument();

    // Badges de calidad
    expect(screen.getByText("1080p")).toBeInTheDocument();
    expect(screen.getByText("1080p Multi")).toBeInTheDocument();
  });
});
