import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base backgrounds
        bg: {
          DEFAULT: "#070710",
          surface: "#0e0e1a",
          elevated: "#151524",
          card: "#1a1a2e",
          overlay: "#1f1f38",
        },
        // Borders
        border: {
          DEFAULT: "#252538",
          strong: "#3a3a5c",
          focus: "#6d28d9",
        },
        // Primary — violet/purple
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          DEFAULT: "#7c3aed",
          hover: "#6d28d9",
          active: "#5b21b6",
          glow: "rgba(124, 58, 237, 0.35)",
          subtle: "rgba(124, 58, 237, 0.12)",
        },
        // Accent — cyan
        accent: {
          DEFAULT: "#06b6d4",
          hover: "#0891b2",
          subtle: "rgba(6, 182, 212, 0.12)",
          glow: "rgba(6, 182, 212, 0.3)",
        },
        // Semantic
        success: {
          DEFAULT: "#10b981",
          subtle: "rgba(16, 185, 129, 0.12)",
        },
        warning: {
          DEFAULT: "#f59e0b",
          subtle: "rgba(245, 158, 11, 0.12)",
        },
        danger: {
          DEFAULT: "#ef4444",
          subtle: "rgba(239, 68, 68, 0.12)",
        },
        // Text
        text: {
          DEFAULT: "#f1f1f8",
          secondary: "#9393b8",
          muted: "#5a5a7a",
          disabled: "#3a3a5c",
          inverse: "#07071010",
        },
      },

      fontFamily: {
        sans: ["InterVariable", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      borderRadius: {
        "4xl": "2rem",
      },

      boxShadow: {
        glow: "0 0 20px rgba(124, 58, 237, 0.4)",
        "glow-sm": "0 0 10px rgba(124, 58, 237, 0.25)",
        "glow-accent": "0 0 20px rgba(6, 182, 212, 0.3)",
        card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.24)",
        "card-hover":
          "0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.15)",
        floating: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(37,37,56,0.8)",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "primary-gradient": "linear-gradient(135deg, #7c3aed, #6d28d9)",
        "surface-gradient":
          "linear-gradient(180deg, #151524 0%, #0e0e1a 100%)",
        "card-gradient": "linear-gradient(135deg, #1a1a2e, #151524)",
        shimmer:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
      },

      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-left": "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 2s infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(124,58,237,0.2)" },
          "50%": { boxShadow: "0 0 25px rgba(124,58,237,0.5)" },
        },
      },

      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
} satisfies Config;
