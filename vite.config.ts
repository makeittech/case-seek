import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        // precache = app shell only; the art library (~280 MB of webp) is
        // cached lazily as scenes are visited so first load stays light
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        globIgnores: [
          'assets/scenes/**',
          'assets/props/**',
          'assets/story/**',
          'assets/ui/**',
          'assets/fx/**',
          'assets/characters/**',
          'assets/clues/**',
          'assets/paintings/**',
        ],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'case-seek-art',
              expiration: { maxEntries: 1200, purgeOnQuotaError: true },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Case & Seek — The Hollow Frame',
        short_name: 'Case & Seek',
        description: 'A hidden-object detective game for language learning. Marlowe Bay, 1927.',
        theme_color: '#1d1a16',
        background_color: '#1d1a16',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
