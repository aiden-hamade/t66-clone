import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

/* Vite Configuration */
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
