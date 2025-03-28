import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production, etc)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Use loaded env variables
  const apiUrl = env.VITE_API_URL || 'http://127.0.0.1:5000';
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/auth': {
          target: apiUrl,
          changeOrigin: true, 
          secure: false
        },
        '/ffr': {
          target: apiUrl,
          changeOrigin: true,
          secure: false
        },
        '/casting': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/payments': {
          target: apiUrl,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
});
