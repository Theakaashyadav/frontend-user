import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 👇 Define useTunnel BEFORE using it
const useTunnel = false; // change to true if you want to use your devtunnel

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5000,
    proxy: {
      "/api": {
        target: useTunnel
          ? "https://r55nc746-4000.inc1.devtunnels.ms/"
          : "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
