import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // Service worker from src/sw.ts (injectManifest); manifest.json stays in public/.
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: false,
      manifest: false,
      injectManifest: { globPatterns: ['**/*.{js,css,html,png,svg,woff2}'], maximumFileSizeToCacheInBytes: 3 * 1024 * 1024 },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5050,
    strictPort: true,
    // Same-origin in development so the httpOnly refresh cookie just works
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/safety': {
        // SAFETY_PORT matches scripts/run-safety.mjs (default 8000)
        target: `http://127.0.0.1:${process.env.SAFETY_PORT || '8000'}`,
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/safety/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
