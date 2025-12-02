import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  //seção para rotear as requisições e facilitar contornar problemas de CORS
  server: {
    proxy: {
      // Proxy para o n8n
      "/webhook": {
        target: process.env.VITE_N8N_BASE_URL || "http://n8n:5678",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/webhook/, "/webhook"),
      },

      // Proxi para o strapi
      "/api": {
        target: process.env.VITE_STRAPI_BASE_URL || "http://strapi:1337",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "api"),
      },
      "/uploads": {
        //rodas de imagens do strapi
        target: process.env.VITE_STRAPI_BASE_URL || "http://strapi:1337",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uploads/, "/uploads"),
      },
    },

    // host necessário para Docker mapear a porta corretamente
    host: "0.0.0.0",
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
});
