import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Move the API key from the client to the proxy
            const apiKey = req.headers['x-api-key-proxy'];
            if (apiKey) {
              proxyReq.setHeader('x-api-key', apiKey);
              proxyReq.removeHeader('x-api-key-proxy');
            }
          });
        }
      }
    }
  }
})
