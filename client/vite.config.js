import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import packageJson from './package.json' // Import package.json to get the version number

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Define a global constant called __APP_VERSION__ that holds the version from package.json
    '__APP_VERSION__': JSON.stringify(packageJson.version)
  },
  server: {
    host: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      'quill': 'quill/dist/quill.js',
    }
  }
})
