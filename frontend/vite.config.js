import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Base configuration
  base: '/',
  
  // Server configuration
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  
  // Path aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
  
  // Environment variables prefix
  envPrefix: 'VITE_',
  
  // Define global constants
  define: {
    global: 'globalThis',
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['ethers', 'react', 'react-dom'],
    exclude: [],
  },
})
