import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#141317",
        "surface-dim": "#141317",
        "surface-bright": "#3a383d",
        "surface-container-lowest": "#0f0e12",
        "surface-container-low": "#1c1b1f",
        "surface-container": "#201f23",
        "surface-container-high": "#2b292e",
        "surface-container-highest": "#363438",
        "surface-variant": "#363438",
        "on-surface": "#e6e1e7",
        "on-surface-variant": "#d7c3ae",
        "inverse-surface": "#e6e1e7",
        "inverse-on-surface": "#313034",
        outline: "#9f8e7a",
        "outline-variant": "#524534",
        primary: "#ffc880",
        "on-primary": "#452b00",
        "primary-container": "#f5a623",
        "on-primary-container": "#644000",
        "primary-fixed": "#ffddb4",
        secondary: "#e7b4fa",
        "on-secondary": "#471e59",
        "secondary-container": "#613874",
        "on-secondary-container": "#d8a6eb",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        success: "#7ee0a1",
        "success-container": "rgba(126, 224, 161, 0.15)",
      },
      fontFamily: {
        headline: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "1rem",
        input: "0.75rem",
      },
      boxShadow: {
        amber: "0 0 25px rgba(245, 166, 35, 0.45)",
        "amber-lg": "0 0 35px rgba(245, 166, 35, 0.7)",
        "amber-subtle": "0 0 15px rgba(245, 166, 35, 0.2)",
      },
      spacing: {
        "space-xs": "4px",
        "space-sm": "8px",
        "space-md": "16px",
        "space-lg": "24px",
        "space-xl": "40px",
        gutter: "24px",
        margin: "48px",
      },
    },
  },
  plugins: [],
};

export default config;
