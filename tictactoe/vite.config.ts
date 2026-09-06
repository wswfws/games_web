import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'tictactoe',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/app/App.tsx',
      },
      shared: {
        react: { requiredVersion: '^19' },
        'react-dom': { requiredVersion: '^19' },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  build: {
    target: 'esnext',
    modulePreload: false,
    cssCodeSplit: false,
  },
  preview: {
    port: 4175,
    strictPort: true,
    cors: true,
  },
})