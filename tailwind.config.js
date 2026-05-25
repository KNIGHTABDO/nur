/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "#0d0e0f",
        "tertiary-fixed": "#dae2ff",
        "divine-ivory": "#F9F9F9",
        "on-tertiary-fixed-variant": "#3e465e",
        "error": "#ffb4ab",
        "inverse-on-surface": "#303032",
        "on-error-container": "#ffdad6",
        "on-secondary-container": "#86c5b3",
        "midnight-glass": "#111827",
        "primary-fixed": "#ffe088",
        "on-background": "#e3e2e3",
        "outline-variant": "#4d4635",
        "error-container": "#93000a",
        "outline": "#99907c",
        "inverse-surface": "#e3e2e3",
        "surface-container": "#1f2021",
        "primary-fixed-dim": "#e9c349",
        "background": "#121315",
        "secondary-fixed-dim": "#94d3c1",
        "surface-container-highest": "#343536",
        "surface-tint": "#e9c349",
        "on-surface-variant": "#d0c5af",
        "on-secondary": "#00382e",
        "secondary-container": "#0b5345",
        "on-primary-fixed-variant": "#574500",
        "tertiary-fixed-dim": "#bec6e3",
        "tertiary": "#c6cdeb",
        "on-tertiary": "#283046",
        "secondary": "#94d3c1",
        "surface-dim": "#121315",
        "tertiary-container": "#aab2ce",
        "sacred-emerald": "#004D40",
        "surface-container-high": "#292a2b",
        "on-primary-container": "#554300",
        "surface-container-low": "#1b1c1d",
        "surface-variant": "#343536",
        "on-tertiary-container": "#3c445c",
        "surface": "#121315",
        "on-secondary-fixed": "#00201a",
        "surface-bright": "#38393a",
        "obsidian-base": "#08090A",
        "on-tertiary-fixed": "#131b30",
        "primary": "#f2ca50",
        "on-error": "#690005",
        "inverse-primary": "#735c00",
        "spiritual-gold": "#D4AF37",
        "on-secondary-fixed-variant": "#065043",
        "on-surface": "#e3e2e3",
        "on-primary": "#3c2f00",
        "primary-container": "#d4af37",
        "gold-shimmer": "#FFD700",
        "secondary-fixed": "#afefdd",
        "on-primary-fixed": "#241a00"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "24px",
        "margin-safe": "32px",
        "unit": "8px",
        "stack-depth": "12px",
        "container-max": "1200px"
      },
      fontFamily: {
        "headline-md": ["Playfair Display", "serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "display-lg": ["Playfair Display", "serif"],
        "display-lg-mobile": ["Playfair Display", "serif"],
        "label-md": ["Inter", "sans-serif"],
        "headline-lg": ["Playfair Display", "serif"],
        "arabic-quote": ["Noto Serif", "serif"]
      },
      animation: {
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "particle-rise": "particle-rise 15s linear infinite",
        "shimmer": "shimmer 3s linear infinite",
        "breath": "breath 8s ease-in-out infinite",
        "wave": "wave 1.5s ease-in-out infinite alternate"
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212,175,55,0.1), inset 0 0 10px rgba(212,175,55,0.05)", borderColor: "rgba(212,175,55,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(212,175,55,0.3), inset 0 0 20px rgba(212,175,55,0.15)", borderColor: "rgba(212,175,55,0.5)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "particle-rise": {
          "0%": { transform: "translateY(100vh) scale(0)", opacity: "0" },
          "50%": { opacity: "0.5" },
          "100%": { transform: "translateY(-100px) scale(1)", opacity: "0" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        },
        "breath": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1) translate(-50%, -50%)" },
          "50%": { opacity: "0.8", transform: "scale(1.1) translate(-45%, -45%)" }
        },
        "wave": {
          "0%": { height: "10%" },
          "100%": { height: "100%" }
        }
      }
    },
  },
  plugins: [],
}
