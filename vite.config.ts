import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'מעקב תינוק',
        short_name: 'מעקב',
        description: 'יומן משותף לאוכל, צואה ושתן',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        lang: 'he',
        dir: 'rtl',
      },
    }),
  ],
})
