// file: frontend/vite.config.ts
import { fileURLToPath, resolve } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import reactRefresh from '@vitejs/plugin-react'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { defineConfig } from 'vite'
import { checker } from 'vite-plugin-checker'
import { routeBuilderPlugin } from 'vite-plugin-route-builder'
import tsconfigPaths from 'vite-tsconfig-paths'

import PKG from './package.json'

const ROOT = fileURLToPath(new URL('./', import.meta.url))

// Use environment variable for backend API
const API_TARGET = process.env.VITE_API_URL || 'http://localhost:4000'

export default defineConfig({
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',
      hotKeys: ['altKey'],
    }),
    reactRefresh(),
    tsconfigPaths(),
    checker({
      typescript: true,
      enableBuild: true,
    }),
    tailwindcss(),
    routeBuilderPlugin({
      pagePattern: `${resolve(ROOT, './src/pages')}/**/*.tsx`,
      outputPath: `${resolve(ROOT, './src/generated-routes.ts')}`,
      enableInDev: true,
    }),
  ],
  define: {
    APP_DEV_CWD: JSON.stringify(process.cwd()),
    APP_NAME: JSON.stringify(PKG.name),
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
