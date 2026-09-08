import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@supabase') || id.includes('node_modules/tslib')) {
            return 'supabase';
          }
          if (
            id.includes('node_modules/lucide-react')
          ) {
            return 'lucide';
          }
          if (
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/react-router-dom') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/scheduler') ||
            id.includes('node_modules/react/')
          ) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});