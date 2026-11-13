import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0e1417",
        foreground: "#ece6da",
        muted: "#aab4b8",
        faint: "#8d9a9f",
        surface: {
          DEFAULT: "#19232a",
          hover: "#212e36",
          active: "#2a3942",
        },
        border: {
          DEFAULT: "#2b3a43",
          subtle: "#1f2b32",
          active: "#6a808c",
        },
        accent: {
          DEFAULT: "#f0b44c",
          hover: "#f7c46a",
          subtle: "rgba(240, 180, 76, 0.12)",
          crimson: "#e11d48",
          ink: "#0e1417",
          seat: "#b8372f",
          "danger-text": "#ff8f84",
        },
      },
      borderRadius: {
        poster: "4px",
        chip: "9999px",
      },
      keyframes: {
        pop: {
          "0%": { opacity: "0", transform: "translateY(-4px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        pop: "pop 150ms ease-out",
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
