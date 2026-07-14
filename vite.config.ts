import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split the heavy 3D stack into its own long-cached chunk so the app shell
    // and vendor code can update without re-downloading Three.js, and the
    // browser can fetch them in parallel. Three is ~the whole payload here, so
    // this is about cache longevity + parallelism, not shrinking total bytes.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
        },
      },
    },
    // The three chunk legitimately exceeds 500 kB; raise the warn ceiling so CI
    // logs stay clean rather than masking a real regression.
    chunkSizeWarningLimit: 900,
  },
})
