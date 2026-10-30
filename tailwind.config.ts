import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050810",
        navy: {
          900: "#0a0f1e",
          800: "#1a2235",
        },
        gold: {
          500: "#FFD700",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

