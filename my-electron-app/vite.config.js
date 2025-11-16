// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: 'electron/main.js',
      },
    ]),
    renderer(),
  ],

  // --- ADD THIS ENTIRE 'server' SECTION ---
  server: {
    proxy: {
      // This rule says: any request starting with "/api"
      // should be sent to your backend server.
      '/api': {
        target: 'http://localhost:5000', // <-- IMPORTANT: Change 8000 if your backend runs on a different port
        changeOrigin: true,
      },
    },
  },
})