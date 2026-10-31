import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { rollupOptions: { output: { manualChunks(id) {
    if (id.includes('/node_modules/three/')) return 'vendor-three'
    if (id.includes('/node_modules/@react-three/fiber/')) return 'vendor-r3f'
    if (id.includes('/node_modules/gsap/')) return 'vendor-gsap'
  } } } },
})
