import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Nécessaire pour Tailwind v4
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Active Tailwind v4 sans avoir besoin de tailwind.config.js
  ],

  // Configuration du serveur pour correspondre à ton tauri.conf.json
  server: {
    port: 5174,
    strictPort: true,
    host: true, // Recommandé pour Tauri
  },

  // Configuration pour la compilation Tauri
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
  
  build: {
    // Tauri supporte les navigateurs modernes
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // Ne pas minifier pour le debug
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Produire des sourcemaps pour le debug
    sourcemap: !!process.env.TAURI_DEBUG,
  }
})