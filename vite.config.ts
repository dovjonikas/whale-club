import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Served from GitHub Pages under /whale-club/, so every asset path carries
 * that base. Vite hashes every built file name, which is what lets the
 * service worker cache them forever: a new build is a new set of names, and
 * index.html (never hashed) is precached with a revision instead.
 */
export default defineConfig({
  base: '/whale-club/',
  build: {
    target: 'es2022',
    sourcemap: false,
  },
  plugins: [
    VitePWA({
      // 'prompt' rather than 'autoUpdate': the new worker waits until the
      // person taps the toast, so a reload never happens mid-tap. If they
      // never tap, the next open starts on the new worker anyway.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Whale Club',
        short_name: 'Whale Club',
        description: 'A habit game where nothing dies.',
        start_url: '/whale-club/',
        scope: '/whale-club/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#020409',
        theme_color: '#020409',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        clientsClaim: true,
        skipWaiting: false,
        navigateFallback: '/whale-club/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: { port: 5173 },
  preview: { port: 4173 },
})
