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

  // ── Pre-bundle these for faster dev startup ─────────────────────────────────
  optimizeDeps: {
    include: ['@clerk/clerk-react', 'lucide-react', 'framer-motion', 'react-router-dom'],
  },

  build: {
    // ── Increase chunk warning threshold (monorepo shared pkg is small) ────────
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // ── Manual vendor splitting ─────────────────────────────────────────────
        manualChunks: {
          'vendor-react':  ['react', 'react-dom', 'react-router-dom'],
          'vendor-clerk':  ['@clerk/clerk-react'],
          'vendor-motion': ['framer-motion'],
          'vendor-ui':     ['lucide-react'],
        },
      },
    },
  },
})
