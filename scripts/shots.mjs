// README screenshots, generated rather than taken: a seeded history under a
// pinned clock, at an iPhone, an Android phone and a desktop size, into
// docs/screenshots/. Running it twice gives the same pictures. The iPhone
// pass also saves the two postcards the app paints, story and square.
// `npm run shots` then runs squeeze.mjs, which turns them into WebP under 300 KB.
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
  {
    id: 'run',
    name: 'run',
    emoji: '🏃',
    kind: 'tap',
    minutes: 15,
    days: [true, true, true, true, true, true, true],
    world: 'sea',
    line: 'a',
    createdAt: key(-34),
    order: 0,
  },
  {
    id: 'read',
    name: 'read',
    emoji: '📚',
    kind: 'lockIn',
    minutes: 30,
    days: [true, true, true, true, true, true, true],
    world: 'sky',
    line: 'a',
    createdAt: key(-34),
    order: 1,
  },
  {
    id: 'practice',
    name: 'practice',
    emoji: '🎹',
    kind: 'tap',
    minutes: 20,
    days: [true, true, true, true, true, true, true],
    world: 'garden',
    line: 'a',
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
  // Reading is a lock-in: every day it was done, its timer ran thirty minutes, a lantern each;
  // now and then it took two sittings, a softer lantern.
  const minutes = {}
  const sessions = []
  if (done.includes('read')) {
    minutes.read = 30
    sessions.push(
      i % 5 === 0 ? { thing: 'read', minutes: 30, parts: 2 } : { thing: 'read', minutes: 30 },
    )
  }
  if (i === 0)
    days[key(i)] = {
      done: ['run', 'read'],
      minutes: { read: 30 },
      sessions: [{ thing: 'read', minutes: 30 }],
      checkin: true,
    }
  else if (done.length)
    days[key(i)] = sessions.length ? { done, minutes, sessions } : { done, minutes }
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
  version: 6,
  things,
  days,
  cracked,
  settings: {
    sound: true,
    installDismissedAt: key(-1),
    // Last week's Monday, so the recap has already been seen.
    lastRecapWeek: key(-9),
    postcardFormat: 'story',
    // The things have explained themselves already: the pictures show the usual lines.
    explained: ['yours', 'firstStar', 'stone', 'lantern', 'kept'],
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
  await page.getByRole('button', { name: 'read', exact: true }).click()
  await page.clock.runFor(500)
  await shot(page, 'iphone-dial.png')
  await page.getByRole('button', { name: 'lock in', exact: true }).click()
  await page.clock.runFor(1500)
  await shot(page, 'iphone-session-start.png')
  await page.clock.fastForward('18:00')
  await page.clock.runFor(3000)
  await shot(page, 'iphone-session.png')
  // The end: the deep water goes down, the lantern comes into the cove, the creature goes home.
  await page.clock.fastForward('12:00')
  await page.clock.runFor(2300)
  await page.waitForTimeout(900)
  await shot(page, 'iphone-opening.png')
  await page.clock.runFor(4000)
  await page.waitForTimeout(1200)
  await shot(page, 'iphone-cove.png')
  await page.getByRole('button', { name: 'Menu' }).click()
  await page.getByRole('button', { name: 'the log' }).click()
  await page.clock.runFor(600)
  await page.waitForTimeout(500)
  await shot(page, 'iphone-log.png')
  await context.close()
}

// Days on the iPhone: practice is off on Wednesdays, then every thing is.
for (const [file, off] of [
  ['days', ['practice']],
  ['rest', ['run', 'read', 'practice']],
]) {
  const week = (id) => (off.includes(id) ? [true, true, false, true, true, true, true] : undefined)
  const dayData = {
    ...data,
    things: things.map((t) => (week(t.id) ? { ...t, days: week(t.id) } : t)),
  }
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()
  await page.clock.setFixedTime(NOW)
  await page.addInitScript(
    (json) => localStorage.setItem('whaleclub:data', json),
    JSON.stringify(dayData),
  )
  await page.goto(base)
  await page.waitForTimeout(1200)
  if (file === 'days') {
    await page.locator('.not-today-toggle').click()
    await page.waitForTimeout(300)
    await shot(page, 'iphone-not-today.png')
    await page.getByRole('button', { name: 'edit read' }).click()
    await page.waitForTimeout(500)
    await shot(page, 'iphone-days.png')
  } else {
    await shot(page, 'iphone-rest.png')
  }
  await context.close()
}
// The first minute: the promise half way through its year, then the truth at its peak.
{
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()
  await page.goto(base)
  await page.getByRole('dialog', { name: 'whale club' }).waitFor()
  await page.waitForTimeout(1200)
  await page.screenshot({ path: resolve(out, 'iphone-begin.png') })
  await page.getByRole('button', { name: /tap to begin/ }).click()
  await page.waitForTimeout(4300)
  await page.screenshot({ path: resolve(out, 'iphone-promise.png') })
  await page.getByRole('dialog', { name: 'whale club' }).click({ position: { x: 60, y: 300 } })
  await page.waitForTimeout(11800)
  await page.screenshot({ path: resolve(out, 'iphone-truth.png') })
  await context.close()
}

// The add sheet with its picture and its two kinds, and edit mode, on the five weeks.
{
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()
  await page.clock.setFixedTime(NOW)
  await page.addInitScript(
    (json) => localStorage.setItem('whaleclub:data', json),
    JSON.stringify(data),
  )
  await page.goto(base)
  await page.waitForTimeout(1200)
  await page.getByRole('button', { name: 'edit', exact: true }).click()
  await page.waitForTimeout(400)
  await shot(page, 'iphone-edit.png')
  await page.getByRole('button', { name: 'done', exact: true }).click()
  await page.getByRole('button', { name: 'Add a thing' }).click()
  // A name picks its picture as it is typed: the violin shows first, chosen.
  await page.getByRole('textbox', { name: 'name' }).fill('violin')
  await page.getByRole('dialog').getByRole('button', { name: 'lock in', exact: true }).click()
  await page.waitForTimeout(500)
  await shot(page, 'iphone-add.png')
  await context.close()
}

// The very first screen after the intro: nothing added yet, the whale asleep under the surface.
{
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()
  await page.clock.install({ time: NOW })
  await page.addInitScript(() => localStorage.setItem('whaleclub:intro', 'seen'))
  await page.goto(base)
  await page.waitForTimeout(1800)
  await page.screenshot({ path: resolve(out, 'iphone-first.png') })
  await context.close()
}

// The lab, opened by ?lab=1 on the same five weeks: the bar and its sheet.
{
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()
  await page.clock.install({ time: NOW })
  await page.addInitScript(
    (json) => localStorage.setItem('whaleclub:data', json),
    JSON.stringify(data),
  )
  await page.goto(`${base}?lab=1`)
  await page.getByRole('dialog', { name: 'the lab' }).waitFor()
  await page.waitForTimeout(900)
  await page.screenshot({ path: resolve(out, 'iphone-lab.png') })
  await context.close()
}

// brand.html: the bubble in every state, then the glyphs, at a desktop width.
{
  const context = await browser.newContext({ viewport: { width: 1100, height: 860 } })
  const page = await context.newPage()
  await page.goto(`${base}brand.html`)
  await page.getByRole('heading', { name: 'Whale Club, the look' }).waitFor()
  await page.waitForTimeout(600)
  await page.screenshot({ path: resolve(out, 'brand-states.png') })
  // The glyphs section at the top of the window.
  await page.locator('#h-glyphs').evaluate((heading) => heading.scrollIntoView())
  await page.waitForTimeout(300)
  await page.screenshot({ path: resolve(out, 'brand-glyphs.png') })
  await context.close()
}

await browser.close()
