import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

// v2 portfolio: every page is its own static folder (/home2/, /blog2/ ...) so it works on
// GitHub Pages without a SPA fallback. All of them boot the same bundle (src/v2/main.jsx).
const V2_PAGES = ['home2', 'projects2', 'skills2', 'github2', 'blog2']

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: `${root}index.html`,
        ...Object.fromEntries(V2_PAGES.map((p) => [p, `${root}${p}/index.html`])),
      },
    },
  },
})
