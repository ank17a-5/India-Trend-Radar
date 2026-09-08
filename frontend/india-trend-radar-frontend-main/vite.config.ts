import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  let targetUrl = env.VITE_API_BASE_URL || env.VITE_API_URL || 'https://india-trend-radar-dvhs.onrender.com';

  // Ensure targetUrl is a valid absolute HTTP/HTTPS URL for Vite dev proxy
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'http://localhost:8000';
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
