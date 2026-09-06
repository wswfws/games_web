import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "build_cat",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/app/App.tsx",
      },
      shared: {
        react: { requiredVersion: '^19' },
        "react-dom": { requiredVersion: '^19' },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": `${import.meta.dirname}/src`,
    },
  },
  build: {
    target: "esnext",
    modulePreload: false,
    cssCodeSplit: false,
  },
  server: {
    port: 5174,
  },
  preview: {
    port: 4174,
    strictPort: true,
    cors: true,
  },
});
