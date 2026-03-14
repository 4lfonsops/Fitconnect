import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    strictPort: false,
    open: true,
    cors: true,
  },

  preview: {
    port: 4173,
    strictPort: false,
  },

  build: {
    target: 'ES2020',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendors'
            }
            if (id.includes('supabase')) {
              return 'supabase-vendor'
            }
            return 'vendors'
          }
        },
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
    sourcemap: 'hidden',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      'zustand',
      'clsx',
    ],
  },
})
