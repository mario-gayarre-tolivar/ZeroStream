import { describe, it, expect } from "vitest";
import config from "../../../tailwind.config";
import { contrastRatio } from "../helpers/contrast";

type ColorTree = Record<string, string | Record<string, string>>;

const colors = config.theme?.extend?.colors as ColorTree;

function token(path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], colors);
  if (typeof value !== "string") {
    throw new Error(`Token de color inexistente: ${path}`);
  }
  return value;
}

const AA_TEXT = 4.5;
const AA_CONTROL_BORDER = 3;

describe("Tokens de diseño — contraste WCAG AA", () => {
  const textPairs: Array<[string, string]> = [
    ["foreground", "background"],
    ["foreground", "surface.DEFAULT"],
    ["foreground", "surface.active"],
    ["muted", "background"],
    ["muted", "surface.DEFAULT"],
    ["muted", "surface.hover"],
    ["faint", "background"],
    ["faint", "surface.DEFAULT"],
    ["faint", "surface.hover"],
    ["accent.DEFAULT", "background"],
    ["accent.DEFAULT", "surface.DEFAULT"],
    ["accent.ink", "accent.DEFAULT"],
    ["accent.ink", "accent.hover"],
    ["foreground", "accent.seat"],
    ["accent.danger-text", "background"],
    ["accent.danger-text", "surface.DEFAULT"],
  ];

  it.each(textPairs)("texto %s sobre %s alcanza 4.5:1", (fg, bg) => {
    expect(contrastRatio(token(fg), token(bg))).toBeGreaterThanOrEqual(AA_TEXT);
  });

  const borderPairs: Array<[string, string]> = [
    ["border.active", "background"],
    ["border.active", "surface.DEFAULT"],
    ["border.active", "surface.hover"],
  ];

  it.each(borderPairs)("borde de control %s sobre %s alcanza 3:1", (fg, bg) => {
    expect(contrastRatio(token(fg), token(bg))).toBeGreaterThanOrEqual(AA_CONTROL_BORDER);
  });

  it("define radios poster y chip sin sobrescribir los de Tailwind", () => {
    const radii = config.theme?.extend?.borderRadius as Record<string, string>;
    expect(radii.poster).toBe("4px");
    expect(radii.chip).toBe("9999px");
  });
});
