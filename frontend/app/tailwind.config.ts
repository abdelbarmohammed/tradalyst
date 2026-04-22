import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Colours ───────────────────────────────────────────────────────────
      colors: {
        // Dark theme base surfaces
        base:    "#1e1e1e",
        surface: "#272727",
        elevated:"#303030",

        // Light theme base surfaces
        light:   "#eceee8",
        "light-surface": "#f5f6f2",

        // Accent
        green: {
          DEFAULT: "#2fac66",
          hover:   "#26894e",
        },

        // P&L
        profit: "#2fac66",
        loss: {
          DEFAULT: "#f06060",  // dark-bg variant
          light:   "#d94040",  // light-bg variant
        },

        // Text — dark theme
        primary:   "#e8ebe8",
        secondary: "#9ca3af",
        muted:     "#6b7280",

        // Text — light theme
        "text-dark":           "#0f1110",
        "text-dark-secondary": "#4b5563",
        "text-dark-muted":     "#9ca3af",

        // Borders
        "border-dark":  "rgba(255,255,255,0.08)",
        "border-light": "rgba(0,0,0,0.08)",
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },

      // ── Border radius (brand: max 6px) ────────────────────────────────────
      borderRadius: {
        DEFAULT: "2px",
        sm:      "2px",
        md:      "4px",
        lg:      "6px",
        full:    "9999px",
      },

      // ── Letter spacing ────────────────────────────────────────────────────
      letterSpacing: {
        eyebrow: "0.12em",
        mono:    "0.05em",
      },

      // ── Animations ────────────────────────────────────────────────────────
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up":        "fade-up 0.35s ease forwards",
        "fade-in":        "fade-in 0.25s ease forwards",
        "slide-in-right": "slide-in-right 0.3s ease forwards",
        "pulse-slow":     "pulse 2s ease-in-out infinite",
        shimmer:          "shimmer 1.5s linear infinite",
      },

      // ── Sidebar width ─────────────────────────────────────────────────────
      width: {
        sidebar: "220px",
      },
    },
  },
  plugins: [],
};

export default config;
