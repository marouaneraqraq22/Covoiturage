import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // N'oublie pas de garder le plugin React !
  server: {
    port: 5173,
    strictPort: true,
  },
})