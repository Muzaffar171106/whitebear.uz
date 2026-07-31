import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    assetsInlineLimit: 2048,
    cssCodeSplit: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "next/image": path.resolve(__dirname, "./src/vite-shims/next-image.tsx"),
      "next/link": path.resolve(__dirname, "./src/vite-shims/next-link.tsx"),
      "next/navigation": path.resolve(__dirname, "./src/vite-shims/next-navigation.tsx"),
    },
  },
})
