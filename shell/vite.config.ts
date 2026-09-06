import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  const remoteUrl = (base: string, rootPath: string) =>
    isDev
      ? `${base}/assets/remoteEntry.js`
      : `/_remotes/${rootPath}/assets/remoteEntry.js`

  return {
    plugins: [
      react(),
      federation({
        name: 'shell',
        filename: 'remoteEntry.js',
        remotes: {
          blackblast: remoteUrl('http://localhost:4173', 'blackblast'),
          build_cat: remoteUrl('http://localhost:4174', 'build_cat'),
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
  }
})
