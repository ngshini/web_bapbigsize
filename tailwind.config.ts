import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f6",
          100: "#ffe4ee",
          300: "#ffa7c8",
          500: "#ec4f88",
          700: "#be185d",
          900: "#831843"
        },
        gold: "#f8d477"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(190, 24, 93, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
