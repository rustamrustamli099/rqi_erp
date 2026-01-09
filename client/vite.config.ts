/// <reference types="vitest" />
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/components/ui": path.resolve(__dirname, "./src/shared/components/ui"),
      "@/shared/ui": path.resolve(__dirname, "./src/shared/components/ui"), // Legacy/Internal alias fix
      "@/lib": path.resolve(__dirname, "./src/shared/lib"),
      "@": path.resolve(__dirname, "./src"),
      "@app": path.resolve(__dirname, "./src/app"),
      "@shell": path.resolve(__dirname, "./src/shell"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@domains": path.resolve(__dirname, "./src/domains"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // @ts-expect-error Vitest config extension
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
