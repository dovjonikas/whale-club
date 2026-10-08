import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { existsSync, readdirSync } from 'node:fs'
import { version } from './package.json'

/**
 * Served from GitHub Pages under /whale-club/, so every asset path carries
 * that base. Vite hashes every built file name, which is what lets the
 * service worker cache them forever: a new build is a new set of names, and
 * index.html (never hashed) is precached with a revision instead.
 */
/**
 * Art slots: a picture in public/art/<id>.webp (or .png) takes the place of
 * that find's drawing, with no code changed (docs/ART.md). The list of what
 * is there is read once at build time, so the app never asks the network
 * for a picture that does not exist.
 */
const ART = existsSync('public/art')
  ? readdirSync('public/art').filter((name) => /\.(webp|png)$/.test(name))
  : []

/**
 * The three faces the first screen draws with (the body at 400 and 700, the
 * display face), preloaded so the words do not arrive in a fallback and
 * jump. Their built names carry a hash, so they are read from the bundle.
 */
const FIRST_FONTS =
  /(atkinson-hyperlegible-latin-(400|700)-normal|fraunces-latin-full-normal)-.*\.woff2$/

function preloadFonts(base: string): Plugin {
  return {
    name: 'whale-club:preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        return Object.keys(ctx.bundle ?? {})
          .filter((name) => FIRST_FONTS.test(name))
          .map((name) => ({
            tag: 'link',
            attrs: {
              rel: 'preload',
              as: 'font',
              type: 'font/woff2',
              href: base + name,
              crossorigin: '',
            },
            injectTo: 'head' as const,
          }))
      },
    },
  }
}

const BASE = '/whale-club/'

export default defineConfig({
  base: BASE,
  // The version shows at the bottom of the menu; five taps on it open the lab.
  define: { __APP_VERSION__: JSON.stringify(version), __ART__: JSON.stringify(ART) },
  build: {
    target: 'es2022',
    sourcemap: false,
    // Two pages: the app, and brand.html, the look drawn by the app's own code.
    rollupOptions: {
      input: { main: 'index.html', brand: 'brand.html' },
    },
  },
  plugins: [
    preloadFonts(BASE),
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
        description: 'A habit game about small things that add up.',
        // A stable identity, so a later change of start_url never makes the
        // installed app a stranger to the browser.
        id: '/whale-club/',
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
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,webp}'],
        // iOS fetches its startup image itself, once, at install: precaching
        // eleven of them would only slow every first visit.
        globIgnores: ['splash/**'],
        clientsClaim: true,
        skipWaiting: false,
        navigateFallback: '/whale-club/index.html',
        // brand.html is its own page, not the app.
        navigateFallbackDenylist: [/brand\.html$/],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: { port: 5173 },
  preview: { port: 4173 },
})
