// README screenshots, generated rather than taken: a seeded history under a
// pinned clock, at an iPhone, an Android phone and a desktop size, into
// docs/screenshots/. Running it twice gives the same pictures.
// Needs the preview server: `npm run build && npm run preview` first.
import { chromium, devices } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const base = 'http://localhost:4173/whale-club/'
const out = resolve('docs/screenshots')
mkdirSync(out, { recursive: true })

// A Wednesday evening, five weeks in.
const NOW = new Date(2026, 10, 11, 21, 30)

function key(offset) {
  const d = new Date(NOW)
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const things = [
  { id: 'run', name: 'run', emoji: '🏃', mode: 'tap', world: 'sea', createdAt: key(-34), order: 0 },
  {
    id: 'read',
    name: 'read',
    emoji: '📚',
    mode: 'timer',
    minutes: 30,
    world: 'sky',
    createdAt: key(-34),
    order: 1,
  },
  {
    id: 'practice',
    name: 'practice',
    emoji: '🎹',
    mode: 'timer',
    minutes: 20,
    world: 'garden',
    createdAt: key(-30),
    order: 2,
  },
]

// A believable five weeks: most days, not all, and a stronger last week.
const days = {}
for (let i = -34; i <= 0; i++) {
  const done = []
  const miss = i === -20 || i === -13 || i === -27
  if (!miss) {
    if ((i * 7) % 5 !== 1) done.push('run')
    if (i % 3 !== 0 || i > -7) done.push('read')
    if (i >= -30 && (i % 4 !== 2 || i > -7)) done.push('practice')
  }
  if (i === 0) days[key(i)] = { done: ['run', 'read'], minutes: { read: 30 } }
  else if (done.length) days[key(i)] = { done, minutes: {} }
}

const data = { version: 1, things, days, settings: { sound: true, installDismissedAt: key(-1) } }

const targets = [
  { name: 'iphone', options: { ...devices['iPhone 13'] } },
  { name: 'android', options: { ...devices['Pixel 5'] } },
  { name: 'desktop', options: { viewport: { width: 1366, height: 768 } } },
]

const browser = await chromium.launch()
for (const { name, options } of targets) {
  const context = await browser.newContext(options)
  const page = await context.newPage()
  await page.clock.setFixedTime(NOW)
  await page.addInitScript(
    (json) => localStorage.setItem('whaleclub:data', json),
    JSON.stringify(data),
  )
  await page.goto(base)
  await page.waitForTimeout(1200)
  await page.screenshot({ path: resolve(out, `${name}-scene.png`) })
  await page.getByRole('button', { name: 'practice', exact: true }).click()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: resolve(out, `${name}-all-done.png`) })
  await page.waitForTimeout(1600)
  await page.getByRole('button', { name: 'Collection' }).click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: resolve(out, `${name}-collection.png`) })
  await context.close()
}
await browser.close()
