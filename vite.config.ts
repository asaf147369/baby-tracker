import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "מעקב על אלה",
        short_name: "מעקב",
        description: "יומן משותף לאוכל, קקי ופיפי",
        theme_color: "#1a1a2e",
        background_color: "#1a1a2e",
        display: "standalone",
        lang: "he",
        dir: "rtl",
      },
    }),
  ],
});
