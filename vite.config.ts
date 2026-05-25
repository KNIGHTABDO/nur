import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/hadith-proxy': {
        target: 'https://hadithapi.pages.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hadith-proxy/, ''),
        headers: {
          Referer: 'https://hadithapi.pages.dev',
        }
      }
    }
  }
})
