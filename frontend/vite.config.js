import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Allows you to use '@' as a shortcut for your 'src' folder in imports
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '127.0.0.1', // Forces Vite to bind explicitly to your local IPv4 address
    port: 5173,        // Restores your standard project development port
    strictPort: true   // Forces Vite to crash with a clear log if the port is busy instead of silently choosing a random one
  }
})

