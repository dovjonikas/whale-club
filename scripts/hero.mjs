// The README's banner: the mark, the name, one sentence, and three phones
// from the screenshots `npm run shots` has just made. Composed as a page and
// photographed, so it is drawn with the app's own fonts and colours and
// stays in step with the screenshots it shows. 2:1, so the same picture
// also fits GitHub's social preview. Writes docs/screenshots/hero.png;
// squeeze.mjs turns it into WebP afterwards.
/* global document */
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const shots = resolve('docs/screenshots')
const W = 1600
const H = 800

const dataUrl = (path, type) => `data:${type};base64,${readFileSync(path).toString('base64')}`
const font = (path) => dataUrl(resolve('node_modules', path), 'font/woff2')
const shot = (name) => dataUrl(resolve(shots, name), 'image/webp')
const icon = dataUrl(resolve('public/icons/icon.svg'), 'image/svg+xml')

// The same small stars every run: a fixed sequence, not Math.random.
let seed = 7
const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const stars = Array.from({ length: 90 }, () => {
  const x = next() * W
  const y = next() * H * 0.82
  const r = 0.6 + next() * 1.4
  const o = 0.25 + next() * 0.6
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" opacity="${o.toFixed(2)}"/>`
}).join('')

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Fraunces'; font-weight: 100 900;
  src: url(${font('@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2')}) format('woff2-variations'); }
@font-face { font-family: 'Atkinson'; font-weight: 400;
  src: url(${font('@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2')}) format('woff2'); }
@font-face { font-family: 'Atkinson'; font-weight: 700;
  src: url(${font('@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2')}) format('woff2'); }
* { box-sizing: border-box; margin: 0; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
body {
  position: relative;
  background:
    radial-gradient(900px 520px at 78% 108%, rgba(62, 242, 224, 0.16), transparent 70%),
    radial-gradient(700px 500px at 12% 0%, rgba(78, 60, 160, 0.28), transparent 70%),
    linear-gradient(180deg, #03070f 0%, #0b1a3a 64%, #06122b 100%);
  color: #e8f0f5;
  font-family: 'Atkinson', system-ui, sans-serif;
}
.stars { position: absolute; inset: 0; fill: #fff4d6; }
.horizon {
  position: absolute; left: 0; right: 0; top: ${H * 0.86}px; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(62, 242, 224, 0.5) 30%, rgba(62, 242, 224, 0.5) 70%, transparent);
  box-shadow: 0 0 24px rgba(62, 242, 224, 0.5);
}
.sea { position: absolute; left: 0; right: 0; top: ${H * 0.86}px; bottom: 0;
  background: linear-gradient(180deg, rgba(10, 36, 71, 0.9), #020409); }
.text { position: absolute; left: 104px; top: 140px; width: 660px; }
.mark { width: 112px; height: 112px; border-radius: 26px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(142, 240, 228, 0.18); }
h1 {
  margin-top: 36px;
  font-family: 'Fraunces', Georgia, serif; font-weight: 900;
  font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
  font-size: 112px; line-height: 0.95; letter-spacing: -0.02em; color: #fff4d6;
  text-shadow: 0 0 40px rgba(255, 217, 138, 0.25);
}
.line {
  margin-top: 26px;
  font-family: 'Fraunces', Georgia, serif; font-weight: 400;
  font-variation-settings: 'opsz' 72, 'SOFT' 50;
  font-size: 38px; line-height: 1.2; color: #e8f0f5;
}
.facts { margin-top: 30px; display: flex; gap: 12px; }
.facts span {
  padding: 9px 18px; border-radius: 999px; font-size: 19px; font-weight: 700; letter-spacing: 0.01em;
  color: #9fb4c6; background: rgba(3, 8, 20, 0.5); border: 1px solid rgba(62, 242, 224, 0.22);
}
.phone {
  /* The screenshots' own shape (390 by 664) plus the bezel, so nothing is cropped. */
  position: absolute; width: 294px; height: 490px; padding: 9px; border-radius: 44px;
  background: #070b16; border: 1px solid rgba(232, 240, 245, 0.12);
  box-shadow: 0 50px 90px rgba(0, 0, 0, 0.6), 0 0 60px rgba(62, 242, 224, 0.10);
}
.phone img { width: 100%; height: 100%; border-radius: 35px; display: block; }
.p1 { left: 846px; top: 176px; transform: rotate(-7deg); }
.p3 { left: 1262px; top: 176px; transform: rotate(7deg); }
.p2 { left: 1040px; top: 128px; width: 336px; height: 562px; border-radius: 50px; z-index: 2;
  box-shadow: 0 60px 110px rgba(0, 0, 0, 0.7), 0 0 90px rgba(62, 242, 224, 0.16); }
</style></head><body>
<svg class="stars" viewBox="0 0 ${W} ${H}" aria-hidden="true">${stars}</svg>
<div class="sea"></div><div class="horizon"></div>
<div class="text">
  <img class="mark" src="${icon}" alt="">
  <h1>whale club</h1>
  <p class="line">A habit game about small things<br>that add up.</p>
  <div class="facts"><span>offline PWA</span><span>no account</span><span>no server</span></div>
</div>
<div class="phone p1"><img src="${shot('iphone-session.webp')}" alt=""></div>
<div class="phone p3"><img src="${shot('iphone-collection.webp')}" alt=""></div>
<div class="phone p2"><img src="${shot('iphone-all-done.webp')}" alt=""></div>
</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
await page.setContent(html, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: resolve(shots, 'hero.png') })
await browser.close()
process.stdout.write('hero.png\n')
