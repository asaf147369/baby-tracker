/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#1a1a2e",
        surface: "#252540",
        "surface-hover": "#2a2a45",
        border: "#3a3a5c",
        muted: "#aaa",
        accent: "#7eb8da",
        danger: "#5c2a2a",
        "danger-hover": "#7a3a3a",
        "chart-fill": "#4a7c59",
        "chart-track": "#333",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
