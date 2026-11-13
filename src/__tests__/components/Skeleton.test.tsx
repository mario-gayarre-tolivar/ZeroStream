import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton } from "@/components/ui/Skeleton";

describe("<Skeleton />", () => {
  it("reenvía props nativas al elemento", () => {
    render(<Skeleton data-testid="sk" aria-hidden="true" />);
    expect(screen.getByTestId("sk")).toHaveAttribute("aria-hidden", "true");
  });

  it("renderiza hijos sin alterarlos", () => {
    render(
      <Skeleton data-testid="sk">
        <span>contenido</span>
      </Skeleton>,
    );
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });
});
