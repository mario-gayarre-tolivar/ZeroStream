import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContinueWatching } from "@/components/home/ContinueWatching";
import * as historyService from "@/services/history";
import { WatchHistoryItem } from "@/types";

vi.mock("@/services/history", () => ({
  getWatchHistory: vi.fn(),
}));

describe("<ContinueWatching />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no renderiza nada si el historial está vacío", () => {
    vi.mocked(historyService.getWatchHistory).mockReturnValue([]);
    const { container } = render(<ContinueWatching />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza lista de reproducciones pendientes con enlace al reproductor", () => {
    const mockItem: WatchHistoryItem = {
      id: 101,
      title: "Breaking Bad",
      type: "tv",
      posterPath: "/poster.jpg",
      season: 1,
      episode: 3,
      episodeTitle: "Capítulo 3",
      timestamp: Date.now(),
    };
    vi.mocked(historyService.getWatchHistory).mockReturnValue([mockItem]);

    render(<ContinueWatching />);
    expect(screen.getByText("Breaking Bad")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /breaking bad/i })).toHaveAttribute(
      "href",
      "/ver/tv/101?s=1&e=3"
    );
  });
});
