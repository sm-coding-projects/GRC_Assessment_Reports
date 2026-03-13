import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "Consolas", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#1B1F23",
          muted: "#57606A",
          subtle: "#8B949E",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F6F8FA",
          inset: "#ECEEF1",
        },
        border: {
          DEFAULT: "#D1D9E0",
          muted: "#E8ECEF",
        },
        accent: {
          DEFAULT: "#0550AE",
          hover: "#033D8B",
          subtle: "#DDE8F8",
        },
        success: {
          DEFAULT: "#1A7F37",
          bg: "#DAFBE1",
        },
        warning: {
          DEFAULT: "#9A6700",
          bg: "#FFF8C5",
        },
        danger: {
          DEFAULT: "#CF222E",
          bg: "#FFEBE9",
        },
        neutral: {
          DEFAULT: "#6E7781",
          bg: "#F3F4F6",
        },
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
      },
      letterSpacing: {
        tight: "-0.03em",
        label: "0.05em",
      },
    },
  },
  plugins: [],
};
export default config;
