import localFont from "next/font/local";

export const displayFont = localFont({
  src: "./fonts/BricolageGrotesque-latin.woff2",
  weight: "500 800",
  variable: "--font-display",
  display: "swap",
});

export const sansFont = localFont({
  src: "./fonts/InstrumentSans-latin.woff2",
  weight: "400 700",
  variable: "--font-sans",
  display: "swap",
});
