import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        secure: false
      },
      '/ffr': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        secure: false
      },
      '/casting': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        secure: false,
      },
      '/payments': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        secure: false
      }
    }
  }
})