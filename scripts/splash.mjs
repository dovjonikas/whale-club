// iOS startup images: iOS makes none of its own for a web app, so without
// these a launch from the home screen flashes white. One per current
// iPhone size, drawn from the app's dark first frame (the night colour, the mark
// small in the middle), into public/splash/. index.html links each with
// its media query; regenerate with `npm run splash` if the mark changes.
import { chromium } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

/** Portrait CSS size and pixel ratio of each iPhone family still in use. */
const DEVICES = [
  [375, 667, 2], // SE (2nd and 3rd), 8
  [414, 736, 3], // 8 Plus
  [375, 812, 3], // X, XS, 11 Pro, 12 mini, 13 mini
  [414, 896, 2], // XR, 11
  [414, 896, 3], // XS Max, 11 Pro Max
  [390, 844, 3], // 12, 12 Pro, 13, 13 Pro, 14, 16e
  [428, 926, 3], // 12 Pro Max, 13 Pro Max, 14 Plus
  [393, 852, 3], // 14 Pro, 15, 15 Pro, 16
  [430, 932, 3], // 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  [402, 874, 3], // 16 Pro, 17, 17 Pro
  [440, 956, 3], // 16 Pro Max, 17 Pro Max
]

const out = resolve('public/splash')
mkdirSync(out, { recursive: true })
const mark = readFileSync(resolve('public/icons/icon.svg'), 'utf8').replace(
  '<svg ',
  '<svg width="96" height="96" ',
)

const browser = await chromium.launch()
for (const [w, h, dpr] of DEVICES) {
  // Drawn at the phone's own pixel ratio, so the mark is sharp on it.
  const context = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: dpr,
  })
  const page = await context.newPage()
  await page.setContent(
    `<!doctype html><html><body style="margin:0;width:${w}px;height:${h}px;display:grid;place-items:center;background:#020409"><div style="width:96px;height:96px">${mark}</div></body></html>`,
  )
  const png = await page.screenshot({ type: 'png' })
  await context.close()
  const name = `iphone-${w}x${h}@${dpr}.png`
  // The night colour and a small mark: a palette PNG keeps each one light.
  const light = await sharp(png).png({ compressionLevel: 9, palette: true }).toBuffer()
  writeFileSync(resolve(out, name), light)
  process.stdout.write(`${name} ${String(Math.round(light.length / 1024))} KB\n`)
}
await browser.close()
