import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
export default defineConfig({
  plugins: [vue({ template: { transformAssetUrls } }), quasar()],
  server: {
    host: "127.0.0.1",
    port: 9000,
    strictPort: true,
    proxy: { "/api": "http://localhost:5166" },
  },
  preview: {
    host: "127.0.0.1",
    port: 9000,
    strictPort: true,
    proxy: { "/api": "http://localhost:5166" },
  },
});
