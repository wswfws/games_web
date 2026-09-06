import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

const isDev = process.env.NODE_ENV !== 'production'

const REMOTE_PORTS: Record<string, number> = {
  blackblast: 4173,
  build_cat: 4174,
  tictactoe: 4175,
  connect_four: 4176,
  memory: 4177,
}

function remoteEntryUrl(name: string) {
  if (isDev) {
    return `http://localhost:${REMOTE_PORTS[name]}/assets/remoteEntry.js`
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
        tictactoe: remoteEntryUrl('tictactoe'),
        connect_four: remoteEntryUrl('connect_four'),
        memory: remoteEntryUrl('memory'),
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