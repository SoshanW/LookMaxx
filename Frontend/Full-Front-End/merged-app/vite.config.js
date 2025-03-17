// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/ffr': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      // Add any other API endpoints you need to proxy
    }
  }
});