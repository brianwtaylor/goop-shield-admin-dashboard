import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-router': ['@tanstack/react-router'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-motion': ['framer-motion'],
          'vendor-d3': [
            'd3-selection',
            'd3-scale',
            'd3-shape',
            'd3-array',
            'd3-axis',
            'd3-geo',
            'd3-interpolate',
          ],
        },
      },
    },
  },
})
