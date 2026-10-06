import { expect, test } from '@playwright/test'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join, resolve } from 'node:path'
import { waitForServiceWorker } from './helpers'

/**
 * An installed app gets new versions by itself: a changed service worker
 * is noticed, a toast offers the reload, one tap takes it. This test
 * serves its own copy of the build so it can change the worker under a
 * page that is already open, the way a deploy does.
 */
const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

let dir: string
let server: Server
let origin: string

test.beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), 'whale-club-'))
  cpSync(resolve('dist'), dir, { recursive: true })
  server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    let path = url.pathname.replace(/^\/whale-club\/?/, '')
    if (path === '' || !extname(path)) path = 'index.html'
    try {
      const body = readFileSync(join(dir, path))
      res.writeHead(200, {
        'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream',
        'Cache-Control': 'no-cache',
      })
      res.end(body)
    } catch {
      res.writeHead(404).end()
    }
  })
  await new Promise<void>((done) => server.listen(0, '127.0.0.1', done))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('no port')
  origin = `http://127.0.0.1:${address.port}`
})

test.afterAll(async () => {
  await new Promise<void>((done) => server.close(() => done()))
  rmSync(dir, { recursive: true, force: true })
})

test('a new version shows the toast within ten seconds, and a tap reloads', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'one project is enough for a deploy')
  await page.goto(`${origin}/whale-club/`)
  await waitForServiceWorker(page)

  // The deploy: a byte changes in the worker, so the browser sees a new one.
  const sw = join(dir, 'sw.js')
  writeFileSync(sw, readFileSync(sw, 'utf8') + '\n// deploy 2\n')

  // Coming back to the app is what triggers the check.
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  const toast = page.getByRole('button', { name: 'new version. tap to reload' })
  await expect(toast).toBeVisible({ timeout: 10_000 })

  const reloaded = page.waitForEvent('load')
  await toast.click()
  await reloaded
  await expect(page.getByRole('heading', { name: 'whale club' })).toBeVisible()
  await expect(toast).toBeHidden()
})
