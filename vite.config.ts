import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          router: ['react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  server: {
    port: 3000,
    host: true
  }
})
