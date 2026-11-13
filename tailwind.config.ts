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
        background: "#090a0d",
        surface: {
          DEFAULT: "#111318",
          hover: "#181b22",
          active: "#20242e",
        },
        border: {
          DEFAULT: "#1f232d",
          subtle: "#151820",
          active: "#323846",
        },
        accent: {
          DEFAULT: "#e5a93c",
          hover: "#d49428",
          subtle: "rgba(229, 169, 60, 0.12)",
          crimson: "#e11d48",
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
