// Renders public/icons/icon.svg into the PNG sizes the manifest and iOS
// want. Uses the Playwright Chromium already installed for the tests, so
// there is no image library to add. `npm run icons` after changing the SVG.
import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const dir = resolve('public/icons')
const svg = await readFile(resolve(dir, 'icon.svg'), 'utf8')

const targets = [
  { file: 'icon-192.png', size: 192, pad: 0 },
  { file: 'icon-512.png', size: 512, pad: 0 },
  { file: 'apple-touch-icon.png', size: 180, pad: 0 },
  // Maskable icons keep everything important inside the inner 80%.
  { file: 'icon-maskable-512.png', size: 512, pad: 0.1 },
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const { file, size, pad } of targets) {
  await page.setViewportSize({ width: size, height: size })
  const inset = Math.round(size * pad)
  await page.setContent(`<!doctype html><body style="margin:0;background:#06122b">
    <div style="position:absolute;inset:${inset}px">${svg.replace('<svg ', '<svg style="width:100%;height:100%;display:block" ')}</div>
  </body>`)
  await page.screenshot({ path: resolve(dir, file), omitBackground: false })
}
await browser.close()
