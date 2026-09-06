import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

const isDev = process.env.NODE_ENV !== 'production'

function remoteEntryUrl(name) {
  if (isDev) {
    const port = name === 'blackblast' ? 4173 : 4174
    return `http://localhost:${port}/assets/remoteEntry.js`
  }
  return `/_remotes/${name}/assets/remoteEntry.js`
}

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      filename: 'remoteEntry.js',
      remotes: {
        blackblast: remoteEntryUrl('blackblast'),
        build_cat: remoteEntryUrl('build_cat'),
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
  },
  server: {
    port: 3000,
    strictPort: true,
  },
})