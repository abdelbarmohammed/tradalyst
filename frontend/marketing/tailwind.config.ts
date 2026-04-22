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
        // Base backgrounds
        light: "#eceee8",
        surface: "#f5f6f2",
        dark: "#1e1e1e",
        dark2: "#272727",
        dark3: "#303030",
        // Brand accent
        green: {
          DEFAULT: "#2fac66",
          hover: "#26894e",
        },
        // Semantic
        loss: "#d94040",
        // Text
        text: {
          DEFAULT: "#0f1110",
          secondary: "#4b5563",
          muted: "#9ca3af",
          "dark-primary": "#e8ebe8",
          "dark-secondary": "#9ca3af",
        },
      },
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      borderRadius: {
        // Brand spec: never > 6px. All interactive elements use 2px.
        DEFAULT: "2px",
        sm: "2px",
        md: "4px",
        lg: "6px",
        full: "9999px",
      },
      borderColor: {
        DEFAULT: "rgba(0,0,0,0.08)",
        dark: "rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        // Used for subtle grid overlays on dark sections
        "grid-dark":
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      letterSpacing: {
        eyebrow: "0.2em",
      },
      fontSize: {
        "2xs": ["9px", { lineHeight: "1.4" }],
        xs: ["10px", { lineHeight: "1.5" }],
      },
      keyframes: {
        "count-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(32px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        scroll: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease forwards",
        "slide-up": "slide-up 0.6s ease forwards",
        scroll: "scroll 28s linear infinite",
        "pulse-slow": "pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
