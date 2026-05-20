import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      // Tell Vite exactly where @zinko/shared lives in the monorepo
      '@zinko/shared': path.resolve(__dirname, '../packages/shared/src/index.js'),
    },
  },

  server: {
    port: 5173,
    strictPort: true,
  },

  // ── SSR config ───────────────────────────────────────────────────────────────
  // Bundle these packages into the SSR build — required because they are ESM
  // and would otherwise fail as external require() calls in Node.js SSR context.
  ssr: {
    noExternal: ['framer-motion', '@zinko/shared'],
  },

  // ── Pre-bundle these for faster dev startup ─────────────────────────────────
  optimizeDeps: {
    include: ['@clerk/clerk-react', 'lucide-react', 'framer-motion', 'react-router-dom'],
  },

  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // ── Manual vendor splitting (function form — required for Vite 8 / Rolldown)
        // Object form was Rollup-only. Rolldown requires a function that returns chunk name.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@clerk/clerk-react'))      return 'vendor-clerk';
          if (id.includes('framer-motion'))           return 'vendor-motion';
          if (id.includes('lucide-react'))            return 'vendor-ui';
          if (
            id.includes('react-dom') ||
            id.includes('react-router-dom') ||
            id.includes('/react/')
          ) return 'vendor-react';
        },
      },
    },
  },
})
