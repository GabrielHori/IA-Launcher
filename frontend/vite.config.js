import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    tailwindcss(), 
  ],

  // Configuration du serveur pour correspondre à tauri.conf.json
  server: {
    port: 5174,
    strictPort: true,
    host: "127.0.0.1",
  },

  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    
    rollupOptions: {
      // On externalise les plugins Tauri pour éviter les erreurs de build Rolldown/Vite
      external: [
        '@tauri-apps/api',
        '@tauri-apps/plugin-dialog'
      ]
    }
  }
}))