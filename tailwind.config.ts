import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      colors: {
        ink: "#152238",
        teal: "#2E6F6A",
        mist: "#F4F6F8",
        coral: "#D76C5E",
        gold: "#C89B3C",
        group: {
          concept: "#5F7ADB",
          heart: "#E67E6B",
          craft: "#52A98F",
          action: "#D4A547",
        },
      },
      borderRadius: {
        card: "1rem",
      },
      boxShadow: {
        card: "0 2px 12px rgba(21, 34, 56, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
