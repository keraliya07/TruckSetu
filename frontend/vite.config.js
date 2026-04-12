import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true';
const watchInterval = Number(process.env.CHOKIDAR_INTERVAL ?? 300);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling,
      interval: watchInterval,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (
            id.includes('react-dom') ||
            id.includes('react/') ||
            id.includes('scheduler')
          ) {
            return 'react-core';
          }

          if (id.includes('react-router')) {
            return 'router';
          }

          if (
            id.includes('@tanstack/react-query') ||
            id.includes('axios') ||
            id.includes('zustand')
          ) {
            return 'data-client';
          }

          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }

          if (id.includes('react-leaflet') || id.includes('leaflet')) {
            return 'maps';
          }

          if (id.includes('lucide-react')) {
            return 'icons';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
