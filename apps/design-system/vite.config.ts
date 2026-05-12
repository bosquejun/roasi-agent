import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 5174
  },
  resolve: {
    alias: {
      "@roaster/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
})
