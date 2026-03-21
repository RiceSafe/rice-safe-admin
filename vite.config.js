import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    port: 3000,
  },
})
