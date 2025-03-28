import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://capp-lookmaxx.happywave-d54ff16c.southeastasia.azurecontainerapps.io' || 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      },
      '/ffr': {
        target: 'https://capp-lookmaxx.happywave-d54ff16c.southeastasia.azurecontainerapps.io' || 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      },
      '/casting': {
        target: 'https://capp-lookmaxx.happywave-d54ff16c.southeastasia.azurecontainerapps.io' || 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '/payments': {
        target: 'https://capp-lookmaxx.happywave-d54ff16c.southeastasia.azurecontainerapps.io' || 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
