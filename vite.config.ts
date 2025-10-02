import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      // '@': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 5169,
  },
  esbuild: {
    target: "es2023",
  },
});
