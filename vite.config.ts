import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000, // Aumentar límite a 1 MB (componentes pesados como MapView, Leaflet)
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar Leaflet (muy pesado) en su propio chunk
          'leaflet-vendor': ['leaflet', 'react-leaflet'],
          // Separar axios en su propio chunk
          'axios-vendor': ['axios'],
        },
      },
    },
  },
})
