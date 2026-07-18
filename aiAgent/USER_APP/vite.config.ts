import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Fixed port so Lovable can iframe this preview
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
})

