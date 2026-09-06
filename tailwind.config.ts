import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        bangla: ["var(--font-noto-bengali)", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ecff",
          200: "#bcdcff",
          300: "#8ec4ff",
          400: "#59a3ff",
          500: "#3182f6",
          600: "#1f63e0",
          700: "#1a4fb5",
          800: "#1b4291",
          900: "#1b3972",
          950: "#142450"
        },
        accent: {
          500: "#f5a623",
          600: "#dd8f10"
        }
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem"
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16, 24, 40, 0.06), 0 1px 3px 0 rgba(16, 24, 40, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
