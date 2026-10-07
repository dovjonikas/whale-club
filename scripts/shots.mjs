// README screenshots, generated rather than taken: a seeded history under a
// pinned clock, at an iPhone, an Android phone and a desktop size, into
// docs/screenshots/. Running it twice gives the same pictures. The iPhone
// pass also saves the two postcards the app paints, story and square.
// Needs the preview server: `npm run build && npm run preview` first.
/* global window, navigator, FileReader, Buffer */
import { chromium, devices } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
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
  if (i === 0) days[key(i)] = { done: ['run', 'read'], minutes: { read: 30 }, checkin: true }
  else if (done.length) days[key(i)] = { done, minutes: {} }
}

// Every tier earned is cracked, except run's newest, which waits as a stone.
const TIERS = [3, 7, 14, 21, 30, 45, 60, 90, 120, 180]
const cracked = {}
for (const thing of things) {
  const total = Object.values(days).filter((d) => d.done.includes(thing.id)).length
  const earned = TIERS.filter((t) => t <= total)
  const keep = thing.id === 'run' ? earned.slice(0, -1) : earned
  if (keep.length) cracked[thing.id] = keep[keep.length - 1]
}

const data = {
  version: 2,
  things,
  days,
  cracked,
  settings: {
    sound: true,
    installDismissedAt: key(-1),
    // Last week's Monday, so the recap has already been seen.
    lastRecapWeek: key(-9),
    postcardFormat: 'story',
  },
}

const targets = [
  { name: 'iphone', options: { ...devices['iPhone 13'] } },
  { name: 'android', options: { ...devices['Pixel 5'] } },
  { name: 'desktop', options: { viewport: { width: 1366, height: 768 } } },
]

const shot = (page, file) => page.screenshot({ path: resolve(out, file) })

const browser = await chromium.launch()
for (const { name, options } of targets) {
  const context = await browser.newContext(options)
  const page = await context.newPage()
  await page.clock.setFixedTime(NOW)
  await page.addInitScript(
    (json) => localStorage.setItem('whaleclub:data', json),
    JSON.stringify(data),
  )
  // The share sheet records the postcard instead of opening, so its PNG can be saved.
  await page.addInitScript(() => {
    window.__cards = []
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: (shared) =>
        new Promise((done) => {
          const reader = new FileReader()
          reader.onload = () => {
            window.__cards.push(reader.result)
            done()
          }
          reader.readAsDataURL(shared.files[0])
        }),
    })
  })
  await page.goto(base)
  await page.waitForTimeout(1200)
  await shot(page, `${name}-scene.png`)
  await page.getByRole('button', { name: 'practice', exact: true }).click()
  await page.waitForTimeout(1500)
  await shot(page, `${name}-whale.png`)
  await page.getByRole('button', { name: 'send the whale' }).waitFor()
  await page.waitForTimeout(400)
  await shot(page, `${name}-all-done.png`)

  if (name === 'iphone') {
    await page.getByRole('button', { name: 'send the whale' }).click()
    await page.waitForFunction(() => window.__cards.length === 1)
    await page.getByRole('button', { name: 'Menu' }).click()
    await page
      .getByRole('dialog', { name: 'the club' })
      .getByRole('button', { name: 'square' })
      .click()
    await page.waitForTimeout(400)
    await shot(page, 'iphone-menu.png')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: 'send the sea' }).click()
    await page.waitForFunction(() => window.__cards.length === 2)
    const cards = await page.evaluate(() => window.__cards)
    const save = (dataUrl, file) =>
      writeFileSync(resolve(out, file), Buffer.from(dataUrl.split(',')[1], 'base64'))
    save(cards[0], 'postcard-story.png')
    save(cards[1], 'postcard-square.png')
  }

  await page.getByRole('button', { name: 'Collection' }).click()
  await page.waitForTimeout(500)
  await shot(page, `${name}-collection.png`)
  await context.close()
}

// The moments of v0.5 on the iPhone: the stone, its crack, the dial, a session.
{
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()
  await page.clock.install({ time: NOW })
  await page.addInitScript(
    (json) => localStorage.setItem('whaleclub:data', json),
    JSON.stringify(data),
  )
  await page.goto(base)
  await page.clock.runFor(1500)
  await shot(page, 'iphone-stone.png')
  const stone = page.locator('.stone').first()
  await stone.click()
  await page.clock.runFor(300)
  await stone.click()
  await page.clock.runFor(300)
  await shot(page, 'iphone-crack.png')
  await stone.click()
  await page.clock.runFor(1100)
  await shot(page, 'iphone-find.png')
  await page.clock.runFor(3000)
  await page.getByRole('button', { name: 'lock in: read' }).click()
  await page.clock.runFor(500)
  await shot(page, 'iphone-dial.png')
  await page.getByRole('button', { name: 'lock in', exact: true }).click()
  await page.clock.runFor(1500)
  await shot(page, 'iphone-session-start.png')
  await page.clock.fastForward('18:00')
  await page.clock.runFor(3000)
  await shot(page, 'iphone-session.png')
  await context.close()
}
await browser.close()
