import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: Replace '/te-ardhura-shpenzime/' with your repo name when deploying to GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/te-ardhura-shpenzime/'
})
