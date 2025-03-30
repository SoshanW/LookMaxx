import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on mode (development, production, etc)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Use loaded env variables
  const apiUrl = env.VITE_API_URL || 'http://127.0.0.1:5000';
  
  console.log(`API URL configured as: ${apiUrl}`);
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/auth': {
          target: apiUrl,
          changeOrigin: true, 
          secure: false,
          rewrite: (path) => path,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response:', proxyRes.statusCode, req.url);
            });
          }
        },
        '/ffr': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error:', err);
            });
          }
        },
        '/casting': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        },
        '/payments': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    }
  }
});
