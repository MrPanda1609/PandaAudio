import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/panda.svg'],
      manifest: {
        name: 'PandaAudio',
        short_name: 'PandaAudio',
        description: 'Nghe truyện audio cá nhân — phát dưới nền, nhớ vị trí nghe',
        lang: 'vi',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0a0a0f',
        theme_color: '#0a0a0f',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/panda.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // Không precache file audio (nặng) — chỉ cache app shell.
        globPatterns: ['**/*.{js,css,html,png,svg,json,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Cache file audio để nghe offline + tua mượt, hỗ trợ Range request.
            urlPattern: ({ url }) => url.pathname.startsWith('/audio/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'panda-audio-files',
              rangeRequests: true,
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
          {
            // library.json luôn thử mạng trước để thấy truyện mới thêm.
            urlPattern: ({ url }) => url.pathname.endsWith('/data/library.json'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'panda-library',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
})
