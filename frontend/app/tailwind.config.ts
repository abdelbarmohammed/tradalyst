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
        // Theme-adaptive surfaces (mapped to CSS vars)
        base:    "var(--bg)",
        surface: "var(--surface)",
        elevated:"var(--elevated)",

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

        // Text — theme-adaptive (mapped to CSS vars)
        primary:   "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted:     "var(--text-muted)",
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

      // ── Typography plugin — wire to CSS variable tokens ───────────────────
      typography: {
        DEFAULT: {
          css: {
            color: "var(--text-secondary)",
            maxWidth: "none",
            "h1, h2, h3, h4, h5, h6": {
              color: "var(--text-primary)",
              fontFamily: "var(--font-ibm-plex-sans)",
              fontWeight: "600",
            },
            strong: { color: "var(--text-primary)" },
            a: { color: "#2fac66", textDecoration: "none", "&:hover": { textDecoration: "underline" } },
            code: {
              color: "var(--text-secondary)",
              fontFamily: "var(--font-ibm-plex-mono)",
              fontSize: "0.85em",
              backgroundColor: "var(--elevated)",
              padding: "0.1em 0.35em",
              borderRadius: "2px",
            },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
            pre: { backgroundColor: "var(--elevated)", color: "var(--text-secondary)" },
            blockquote: {
              color: "var(--text-muted)",
              borderLeftColor: "var(--border)",
            },
            hr: { borderColor: "var(--border-subtle)" },
            th: { color: "var(--text-primary)" },
            td: { color: "var(--text-secondary)" },
            "thead th": { color: "var(--text-primary)" },
            "thead": { borderBottomColor: "var(--border)" },
            "tbody tr": { borderBottomColor: "var(--border-subtle)" },
            li: { color: "var(--text-secondary)" },
            "li::marker": { color: "var(--text-muted)" },
            p: { color: "var(--text-secondary)" },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
