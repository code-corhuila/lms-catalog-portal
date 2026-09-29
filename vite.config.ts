import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
//
// Exposes ./routes so lms-front's shell can lazy-load this portal's routes
// as a remote (rules/2-anexos/H-front.md). react/react-dom/react-router-dom
// are shared with the shell, not bundled twice.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'catalog_portal',
      filename: 'remoteEntry.js',
      exposes: {
        './routes': './src/routes.tsx',
      },
      // 'shell/apiClient' and 'shell/session' (src/shell.d.ts) resolve
      // against this — lms-front's own federation({ exposes }) is what
      // actually serves them.
      remotes: {
        shell: {
          type: 'module',
          name: 'shell',
          entry: 'http://localhost:3000/remoteEntry.js',
        },
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  server: {
    port: 3002,
  },
  build: {
    target: 'esnext',
  },
})
