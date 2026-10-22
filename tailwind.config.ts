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
        forest: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        earth: {
          50: "#fbf8f3",
          100: "#f5eee4",
          200: "#e9dac5",
          300: "#d9bfa0",
          400: "#c49f78",
          500: "#ad8054",
          600: "#8c5e37",
          700: "#70482c",
          800: "#5d3c26",
          900: "#4e3322",
        },
        harvest: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        cream: {
          50: "#ffffff",
          100: "#faf8f5",
          200: "#f6f2ec",
          300: "#ede5d8",
          400: "#dfd2be",
          500: "#c7b499",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(22, 101, 52, 0.08)",
        card: "0 2px 12px -1px rgba(0, 0, 0, 0.06), 0 1px 3px 0 rgba(0, 0, 0, 0.04)",
        elevated: "0 10px 30px -5px rgba(22, 101, 52, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
