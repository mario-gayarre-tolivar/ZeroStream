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
        background: "#0b0c10",
        surface: {
          DEFAULT: "#13151b",
          hover: "#1a1d26",
          active: "#212530",
        },
        border: {
          DEFAULT: "#20232e",
          subtle: "#171a23",
          active: "#373d4d",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          cyan: "#06b6d4",
          crimson: "#f43f5e",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
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
