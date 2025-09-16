import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    devSourcemap: true
  },
  server: {
    proxy: {
      '/api/voltage': {
        target: 'https://voltageapi.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/voltage/, ''),
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    }
  }
})
