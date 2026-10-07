// Renders public/icons/icon.svg into the PNG sizes the manifest and iOS
// want. Uses the Playwright Chromium already installed for the tests, so
// there is no image library to add. `npm run icons` after changing the SVG.
import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const dir = resolve('public/icons')
const svg = await readFile(resolve(dir, 'icon.svg'), 'utf8')

/**
 * The "any" icons keep the drawing's rounded corners. The Apple and
 * maskable ones are full-bleed squares, because the phone cuts its own
 * shape; the maskable one also draws the mark at 80 %, inside the circle a
 * launcher may crop to.
 */
const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180, flat: true },
  { file: 'icon-maskable-512.png', size: 512, flat: true, safe: 0.8 },
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const { file, size, flat, safe } of targets) {
  await page.setViewportSize({ width: size, height: size })
  let drawing = flat ? svg.replace('rx="112"', 'rx="0"') : svg
  if (safe) {
    const inset = (512 * (1 - safe)) / 2
    drawing = drawing.replace(
      '<g id="mark">',
      `<g id="mark" transform="translate(${String(inset)} ${String(inset)}) scale(${String(safe)})">`,
    )
  }
  await page.setContent(`<!doctype html><body style="margin:0;background:#06122b">
    ${drawing.replace('<svg ', '<svg style="width:100%;height:100%;display:block" ')}
  </body>`)
  await page.screenshot({ path: resolve(dir, file), omitBackground: false })
}
await browser.close()
