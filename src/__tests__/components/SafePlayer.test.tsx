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

  describe("Modo Autoselección y Pre-chequeo (enableAutoSelect = true)", () => {
    it("con enableAutoSelect={true}, muestra 'Verificando servidores disponibles...' antes de montar el iframe", async () => {
      let resolveFetch: (val: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      vi.spyOn(global, "fetch").mockImplementation(() => fetchPromise as any);

      const { container } = render(
        <SafePlayer
          servers={mockServers}
          mediaType="movie"
          mediaId={550}
          title="Fight Club"
          posterPath="/poster.jpg"
          enableAutoSelect={true}
        />
      );

      // Debe mostrar el mensaje de verificación sin montar el iframe
      expect(
        screen.getByText("Verificando servidores disponibles...")
      ).toBeInTheDocument();
      expect(container.querySelector("iframe")).toBeNull();

      // Completar la promesa
      resolveFetch!({
        ok: true,
        json: async () => ({
          results: [],
          recommendedServerId: null,
          source: "live",
        }),
      });

      // Tras resolver, el iframe debe montarse y el aviso desaparecer
      await waitFor(() => {
        expect(
          screen.queryByText("Verificando servidores disponibles...")
        ).not.toBeInTheDocument();
        expect(container.querySelector("iframe")).toBeInTheDocument();
      });
    });

    it("tras responder /api/servers/check, monta el iframe del servidor recomendado y oculta los servidores con estado dead en la lista de botones", async () => {
      const mockServersWithDead: ServerOption[] = [
        {
          id: "dead-server",
          name: "Servidor Muerto",
          quality: "1080p",
          url: "https://dead.server/embed/550",
        },
        {
          id: "healthy-server",
          name: "Servidor Sano",
          quality: "1080p Multi",
          url: "https://healthy.server/embed/550",
        },
      ];

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              serverId: "dead-server",
              status: "dead",
              reason: "http_error",
              latencyMs: 120,
              checkedAt: Date.now(),
            },
            {
              serverId: "healthy-server",
              status: "healthy",
              reason: "ok",
              latencyMs: 95,
              checkedAt: Date.now(),
            },
          ],
          recommendedServerId: "healthy-server",
          source: "live",
        }),
      } as any);

      const { container } = render(
        <SafePlayer
          servers={mockServersWithDead}
          mediaType="movie"
          mediaId={550}
          title="Fight Club"
          posterPath="/poster.jpg"
          enableAutoSelect={true}
        />
      );

      // Esperar a que monte el iframe del servidor recomendado
      await waitFor(() => {
        const iframe = container.querySelector("iframe");
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute(
          "src",
          "https://healthy.server/embed/550"
        );
      });

      // Oculta el servidor dead en los botones
      expect(screen.queryByText("Servidor Muerto")).not.toBeInTheDocument();
      expect(screen.getByText("Servidor Sano")).toBeInTheDocument();
    });

    it("en anime, si el primer servidor (anime-zoko-sub) está reportado como dead y el segundo (anime-vidlink-sub) está healthy, autoselecciona anime-vidlink-sub de inmediato", async () => {
      const animeServers: ServerOption[] = [
        {
          id: "anime-zoko-sub",
          name: "Zoko (Sub)",
          quality: "1080p Sub",
          url: "https://zoko.example/embed/1",
          language: "sub",
        },
        {
          id: "anime-vidlink-sub",
          name: "VidLink Anime (Sub)",
          quality: "1080p Sub",
          url: "https://vidlink.pro/anime/1/1/1",
          language: "sub",
        },
        {
          id: "anime-megacloud-dub",
          name: "MegaCloud (Latino)",
          quality: "1080p Latino",
          url: "https://megacloud.example/embed/1",
          language: "dub",
        },
      ];

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              serverId: "anime-zoko-sub",
              status: "dead",
              reason: "html_error_page",
              latencyMs: 80,
              checkedAt: Date.now(),
            },
            {
              serverId: "anime-vidlink-sub",
              status: "healthy",
              reason: "ok",
              latencyMs: 110,
              checkedAt: Date.now(),
            },
            {
              serverId: "anime-megacloud-dub",
              status: "healthy",
              reason: "ok",
              latencyMs: 130,
              checkedAt: Date.now(),
            },
          ],
          recommendedServerId: "anime-vidlink-sub",
          source: "live",
        }),
      } as any);

      const { container } = render(
        <SafePlayer
          servers={animeServers}
          mediaType="anime"
          mediaId="chainsaw-man"
          season={1}
          episode={1}
          title="Chainsaw Man"
          posterPath="/csm.jpg"
          enableAutoSelect={true}
        />
      );

      await waitFor(() => {
        const iframe = container.querySelector("iframe");
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute(
          "src",
          "https://vidlink.pro/anime/1/1/1"
        );
      });

      expect(screen.queryByText("Zoko (Sub)")).not.toBeInTheDocument();
      expect(screen.getByText("VidLink Anime (Sub)")).toBeInTheDocument();
      expect(screen.getByText("MegaCloud (Latino)")).toBeInTheDocument();
    });

    it("si /api/servers/check falla por error de red o error 500, degrada limpiamente y monta el primer servidor disponible", async () => {
      vi.spyOn(global, "fetch").mockRejectedValueOnce(
        new Error("Fallo de red simulado")
      );

      const { container } = render(
        <SafePlayer
          servers={mockServers}
          mediaType="movie"
          mediaId={550}
          title="Fight Club"
          posterPath="/poster.jpg"
          enableAutoSelect={true}
        />
      );

      await waitFor(() => {
        const iframe = container.querySelector("iframe");
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute(
          "src",
          "https://vidsrc.me/embed/movie?tmdb=550"
        );
      });

      // Ambos servidores deben estar presentes en el control bar
      expect(screen.getByText("Servidor Principal")).toBeInTheDocument();
      expect(screen.getByText("Servidor Secundario")).toBeInTheDocument();
    });
  });
});
