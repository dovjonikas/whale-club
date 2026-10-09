// The interface audit's pictures: every surface of the app in each of its
// states, at two phone sizes (390 × 844 and 320 × 568), into
// docs/audit/<set>/ as WebP. `node scripts/audit.mjs before` before a pass,
// `node scripts/audit.mjs after` once it is done; docs/audit/README.md pairs
// them. A third argument keeps only the surfaces whose name contains it.
// docs/audit/SURFACES.md lists what each picture is and how it is reached.
// Needs the preview server: `npm run build && npm run preview` first.
/* global document, window, navigator, DOMException */
import { chromium, devices } from '@playwright/test'
import sharp from 'sharp'
import { mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'

// AUDIT_BASE points at another build (the 'before' set was taken from v1.2.4 served on its own port).
const base = process.env.AUDIT_BASE ?? 'http://localhost:4173/whale-club/'
const set = process.argv[2] ?? 'after'
const only = process.argv[3]
const out = resolve('docs/audit', set)
mkdirSync(out, { recursive: true })

/** The pictures are kept at one and a half times the phone's width: sharp enough to read, light enough to keep. */
const SCALE = 1.5
const PHONES = [
  // The app on the home screen: the whole 390 × 844, no browser bars.
  {
    tag: '390',
    options: {
      ...devices['iPhone 13'],
      viewport: { width: 390, height: 844 },
      screen: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    },
  },
  { tag: '320', options: { ...devices['iPhone SE'], deviceScaleFactor: 2 } },
]

// A Wednesday, five weeks in: the evening, and the same day at noon.
const NOW = new Date(2026, 10, 11, 21, 30)
const NOON = new Date(2026, 10, 11, 12, 0)
const LATE = new Date(2026, 10, 11, 23, 40)
// The Monday of that week, for the new chapter.
const MONDAY = new Date(2026, 10, 9, 12, 0)

function key(offset, from = NOW) {
  const d = new Date(from)
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const clone = (value) => JSON.parse(JSON.stringify(value))

const things = [
  ['run', 'tap', 'sea', 0],
  ['read', 'lockIn', 'sky', 1],
  ['practice', 'tap', 'garden', 2],
].map(([id, kind, world, order]) => ({
  id,
  name: id,
  kind,
  minutes: id === 'read' ? 30 : 15,
  days: [true, true, true, true, true, true, true],
  world,
  line: 'a',
  createdAt: key(-34),
  order,
  nameAsked: true,
}))

// The same five weeks as the README's pictures (scripts/shots.mjs).
const days = {}
for (let i = -34; i <= 0; i++) {
  const done = []
  const miss = i === -20 || i === -13 || i === -27
  if (!miss) {
    if ((i * 7) % 5 !== 1) done.push('run')
    if (i % 3 !== 0 || i > -7) done.push('read')
    if (i >= -30 && (i % 4 !== 2 || i > -7)) done.push('practice')
  }
  const minutes = {}
  const sessions = []
  if (done.includes('read')) {
    minutes.read = 30
    sessions.push({ thing: 'read', minutes: 30 })
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
const TIERS = [3, 7, 14, 21, 30, 45, 60, 90, 120, 180]
const cracked = {}
for (const thing of things) {
  const total = Object.values(days).filter((d) => d.done.includes(thing.id)).length
  const earned = TIERS.filter((t) => t <= total)
  const keep = thing.id === 'run' ? earned.slice(0, -1) : earned
  if (keep.length) cracked[thing.id] = keep[keep.length - 1]
}
const FIVE_WEEKS = {
  version: 8,
  things,
  days,
  cracked,
  settings: {
    sound: true,
    installDismissedAt: key(-1),
    lastRecapWeek: key(-9),
    postcardFormat: 'story',
    explained: ['yours', 'firstStar', 'stone', 'lantern', 'kept'],
    goodAskedOn: key(0),
    // The whale's swim told already today, and November's tide offered: no card over the sky.
    swimOn: key(0),
    tideOffered: '2026-11',
  },
}

/** The five weeks with today's check-in still to come. */
function unchecked() {
  const data = clone(FIVE_WEEKS)
  delete data.days[key(0)].checkin
  return data
}

/** A thing off on Wednesdays. */
const offToday = (data, ids) => {
  for (const t of data.things)
    if (ids.includes(t.id)) t.days = [true, true, false, true, true, true, true]
  return data
}

/** Three good things written weeks ago, and nothing done today: a bottle can come back. */
function withGoods() {
  const data = clone(FIVE_WEEKS)
  const goods = {
    [key(-12)]: 'the sea was calm',
    [key(-26)]: 'a long walk by the water',
    [key(-33)]: 'tea with a friend',
  }
  for (const [date, good] of Object.entries(goods))
    data.days[date] = { ...(data.days[date] ?? { done: [], minutes: {} }), good }
  data.days[key(0)] = { done: [], minutes: {} }
  return data
}

/** The same three things over 160 days, most of a season's krill spent at the dock. */
function dockData() {
  const longDays = {}
  for (let i = -160; i < 0; i++) {
    const done = ['run', 'read', 'practice'].filter((id, k) => (i * 3 + k) % 7 !== 0)
    if (done.length)
      longDays[key(i)] = done.includes('read')
        ? { done, minutes: { read: 30 }, sessions: [{ thing: 'read', minutes: 30 }] }
        : { done, minutes: {} }
  }
  longDays[key(0)] = { done: ['run'], minutes: {}, checkin: true }
  const bought = [
    ['buoy', -140, 150],
    ['shells', -130, 150],
    ['hat', -120, 350],
    ['dock-lanterns', -100, 1000],
    ['boat', -80, 1200],
    ['sandcastle', -60, 300],
    ['island', -20, 6000],
  ].map(([item, day, price]) => ({ item, date: key(day), price }))
  return {
    ...clone(FIVE_WEEKS),
    things: things.map((t) => ({ ...t, createdAt: key(-160) })),
    days: longDays,
    cracked: { run: 120, read: 120, practice: 120 },
    bought,
    wears: { hat: 'run' },
    goal: 'lighthouse',
    placement: { sandcastle: 'island-1', shells: 'island-2' },
  }
}

/** Every day for `count` days: 29 and one tap finishes the first constellation. */
function pathData(count) {
  const pathDays = {}
  for (let i = -count; i < 0; i++)
    pathDays[key(i)] = { done: ['run', 'read', 'practice'], minutes: {} }
  pathDays[key(0)] = { done: [], minutes: {}, checkin: true }
  return {
    ...clone(FIVE_WEEKS),
    things: things.map((t) => ({ ...t, kind: 'tap', createdAt: key(-count) })),
    days: pathDays,
    cracked: { run: 60, read: 60, practice: 60 },
  }
}

/** A quiet last week on a Monday: the new chapter is offered. */
function chapterData() {
  const data = clone(FIVE_WEEKS)
  data.days = {}
  for (let i = -30; i <= -9; i++)
    data.days[key(i, MONDAY)] = { done: ['run', 'read', 'practice'], minutes: {} }
  data.days[key(-3, MONDAY)] = { done: ['run'], minutes: {} }
  data.days[key(0, MONDAY)] = { done: [], minutes: {}, checkin: true }
  // Last week's recap seen already, so the chapter has the slot.
  data.settings.lastRecapWeek = key(-7, MONDAY)
  data.settings.goodAskedOn = key(0, MONDAY)
  data.settings.swimOn = key(0, MONDAY)
  return data
}

const role = (page, name, kind = 'button') => page.getByRole(kind, { name, exact: true })
const pause = (page, ms) => page.waitForTimeout(ms)
const scrollSheet = (page, to) =>
  page.locator('.sheet.is-open').evaluate((sheet, end) => {
    sheet.scrollTo(0, end === 'end' ? sheet.scrollHeight : 0)
  }, to)

/**
 * The surfaces, in the order of docs/audit/SURFACES.md. Each opens a page
 * on its own data and time, does its steps, and is pictured at the end;
 * `snap(suffix)` pictures a step on the way.
 */
const SURFACES = [
  // The first screen.
  { name: '01-first-empty', data: null, wait: 1800 },
  { name: '02-first-things', data: FIVE_WEEKS },
  {
    name: '03-all-done',
    data: FIVE_WEEKS,
    async steps(page) {
      await role(page, 'practice').click()
      await role(page, 'send the whale').waitFor()
      await pause(page, 500)
    },
  },
  { name: '04-rest-day', data: offToday(clone(FIVE_WEEKS), ['run', 'read', 'practice']) },
  {
    name: '05-quiet-day',
    data: (() => {
      const data = clone(FIVE_WEEKS)
      delete data.days[key(-1)]
      data.days[key(0)] = { done: [], minutes: {}, checkin: true }
      return data
    })(),
  },
  {
    name: '06-not-today-strip',
    data: offToday(clone(FIVE_WEEKS), ['practice']),
    async steps(page) {
      await page.locator('.not-today-toggle').click()
      await pause(page, 400)
    },
  },
  {
    name: '07-soft-day',
    data: withGoods(),
    async steps(page) {
      await page
        .getByRole('complementary', { name: 'check-in' })
        .getByRole('button', { name: 'not today' })
        .click()
      await pause(page, 1800)
    },
  },
  { name: '08-late', data: FIVE_WEEKS, at: LATE },
  // The cards over the sky.
  { name: '10-checkin-first', data: unchecked(), at: NOON },
  {
    name: '11-checkin-second',
    data: unchecked(),
    at: NOON,
    async steps(page) {
      await role(page, 'good!!!').click()
      await pause(page, 300)
    },
  },
  {
    name: '12-day-line',
    data: unchecked(),
    at: NOON,
    async steps(page) {
      await role(page, 'good!!!').click()
      await role(page, 'happy!!!').click()
      await page.locator('.day-line').waitFor()
      await pause(page, 500)
    },
  },
  {
    name: '13-evening-good',
    data: unchecked(),
    async steps(page) {
      await role(page, 'good!!!').click()
      await role(page, 'happy!!!').click()
      await page.locator('.good-input').waitFor()
      await pause(page, 300)
    },
  },
  {
    name: '14-good-alone',
    data: (() => {
      const data = clone(FIVE_WEEKS)
      delete data.settings.goodAskedOn
      return data
    })(),
  },
  {
    name: '15-recap',
    data: (() => {
      const data = clone(FIVE_WEEKS)
      delete data.settings.lastRecapWeek
      return data
    })(),
  },
  { name: '16-chapter', data: chapterData(), at: MONDAY },
  {
    name: '17-name-it',
    data: (() => {
      const data = clone(FIVE_WEEKS)
      for (const t of data.things) t.nameAsked = false
      return data
    })(),
  },
  {
    name: '18-install-leaf',
    data: (() => {
      const data = clone(FIVE_WEEKS)
      delete data.settings.installDismissedAt
      return data
    })(),
  },
  // Sheets and dialogs.
  {
    name: '20-bottle',
    data: withGoods(),
    async steps(page) {
      await page
        .getByRole('complementary', { name: 'check-in' })
        .getByRole('button', { name: 'not today' })
        .click()
      await pause(page, 1200)
      // Clicked by its own event: on a small phone it can sit under the row's tools.
      await page.locator('.bottle').dispatchEvent('click')
      await page.getByRole('dialog', { name: 'a bottle' }).waitFor()
      await pause(page, 600)
    },
  },
  {
    name: '21-good-night',
    data: FIVE_WEEKS,
    at: LATE,
    async steps(page) {
      await page.locator('.moon-hit').click()
      await pause(page, 900)
    },
  },
  {
    name: '22-add',
    data: FIVE_WEEKS,
    async steps(page, snap) {
      await role(page, 'Add a thing').click()
      await pause(page, 600)
      await snap('-empty')
      await page.getByRole('textbox', { name: 'name' }).fill('violin')
      await page.getByRole('dialog').getByRole('button', { name: 'lock in', exact: true }).click()
      await pause(page, 500)
    },
  },
  {
    name: '23-thing-sheet',
    data: FIVE_WEEKS,
    async steps(page, snap) {
      await role(page, 'edit read').click()
      await pause(page, 600)
      await snap('')
      await scrollSheet(page, 'end')
      await pause(page, 300)
      await snap('-end')
      return 'done'
    },
  },
  {
    name: '24-edit-mode',
    data: FIVE_WEEKS,
    async steps(page) {
      await role(page, 'edit').click()
      await pause(page, 500)
    },
  },
  // Lock in, from the dial to the cove.
  {
    name: '25-dial',
    data: FIVE_WEEKS,
    clock: true,
    async steps(page, snap) {
      await page.clock.runFor(1500)
      await role(page, 'read').click()
      await page.clock.runFor(600)
      await snap('')
      await role(page, 'lock in').click()
      await page.clock.runFor(1500)
      await snap('-session-start')
      await page.clock.fastForward('18:00')
      await page.clock.runFor(3000)
      await snap('-session')
      await page.mouse.click(100, 300)
      await page.clock.runFor(400)
      await snap('-session-time')
      await page.clock.fastForward('12:00')
      await page.clock.runFor(2300)
      await pause(page, 900)
      await snap('-opening')
      return 'done'
    },
  },
  // The crack.
  {
    name: '26-stone',
    data: FIVE_WEEKS,
    clock: true,
    async steps(page, snap) {
      await page.clock.runFor(1500)
      await snap('')
      const stone = page.locator('.stone').first()
      await stone.click()
      await page.clock.runFor(300)
      await stone.click()
      await page.clock.runFor(300)
      await snap('-crack')
      await stone.click()
      await page.clock.runFor(1100)
      await snap('-find')
      return 'done'
    },
  },
  {
    name: '27-ceremony',
    data: pathData(29),
    async steps(page) {
      await role(page, 'run').click()
      await page.getByRole('dialog', { name: 'the golden whale' }).waitFor()
      await pause(page, 3200)
    },
  },
  {
    name: '28-collection',
    data: FIVE_WEEKS,
    async steps(page) {
      await role(page, 'Museum').click()
      await pause(page, 600)
    },
  },
  {
    name: '29-log',
    data: (() => {
      const data = withGoods()
      data.days[key(-2)] = { ...data.days[key(-2)], good: 'the sea was calm', checkin: true }
      return data
    })(),
    async steps(page, snap) {
      await role(page, 'Menu').click()
      await role(page, 'the log').click()
      await pause(page, 700)
      await snap('-month')
      await page.locator(`.log-cell[data-date="${key(-2)}"]`).click()
      await pause(page, 600)
      await snap('-day')
      await role(page, 'back to the month').click()
      await pause(page, 400)
      await page.locator('button.log-title').click()
      await pause(page, 600)
      await snap('-year')
      return 'done'
    },
  },
  {
    name: '30-dock',
    data: dockData(),
    async steps(page, snap) {
      await snap('-island')
      await page.locator('.krill-chip').click()
      await page.getByRole('dialog', { name: 'the dock' }).waitFor()
      await pause(page, 600)
      await snap('')
      await page.keyboard.press('Escape')
      await pause(page, 400)
      await role(page, 'Museum').click()
      await role(page, 'arrange').click()
      await page.getByRole('button', { name: /^sandcastle, place \d$/ }).click()
      await pause(page, 500)
      await snap('-arrange')
      return 'done'
    },
  },
  {
    name: '31-menu',
    data: FIVE_WEEKS,
    async steps(page, snap) {
      await role(page, 'Menu').click()
      await pause(page, 600)
      await snap('')
      await scrollSheet(page, 'end')
      await pause(page, 300)
      await snap('-end')
      return 'done'
    },
  },
  {
    name: '32-settings',
    data: FIVE_WEEKS,
    async steps(page, snap) {
      await role(page, 'Menu').click()
      await role(page, 'settings').click()
      await pause(page, 600)
      await snap('')
      await scrollSheet(page, 'end')
      await pause(page, 300)
      await snap('-end')
      return 'done'
    },
  },
  {
    name: '33-how-it-works',
    data: FIVE_WEEKS,
    async steps(page, snap) {
      await role(page, 'Menu').click()
      await role(page, 'how it works').click()
      await pause(page, 600)
      await snap('')
      await scrollSheet(page, 'end')
      await pause(page, 300)
      await snap('-end')
      return 'done'
    },
  },
  {
    name: '34-intro',
    data: null,
    intro: true,
    async steps(page, snap) {
      await page.getByRole('dialog', { name: 'whale club' }).waitFor()
      await pause(page, 1200)
      await snap('-begin')
      await page.getByRole('button', { name: /tap to begin/ }).click()
      await pause(page, 4300)
      await snap('-promise')
      await page.getByRole('dialog', { name: 'whale club' }).click({ position: { x: 60, y: 300 } })
      await pause(page, 11800)
      await snap('-truth')
      return 'done'
    },
  },
  {
    name: '35-install-sheet',
    data: (() => {
      const data = clone(FIVE_WEEKS)
      delete data.settings.installDismissedAt
      return data
    })(),
    async steps(page) {
      await role(page, 'show me how').click()
      await pause(page, 600)
    },
  },
  {
    name: '36-postcard',
    // The share sheet says no, as a browser without file sharing does: the preview opens.
    init: () => {
      Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true })
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: () => Promise.reject(new DOMException('no', 'NotAllowedError')),
      })
    },
    data: (() => {
      const data = clone(FIVE_WEEKS)
      delete data.settings.postcardFormat
      return data
    })(),
    async steps(page, snap) {
      await role(page, 'send the sea').click()
      await pause(page, 600)
      await snap('-format')
      await role(page, 'story').click()
      await page.getByRole('dialog', { name: 'your postcard' }).waitFor()
      await pause(page, 600)
      await snap('-preview')
      return 'done'
    },
  },
  {
    name: '37-toast-undo',
    data: FIVE_WEEKS,
    async steps(page) {
      await role(page, 'edit practice').click()
      await pause(page, 400)
      await page.locator('.sheet.is-open .button-danger').click()
      await pause(page, 900)
    },
  },
  // 1.3.0: the museum's cases, the month's tide, drift, the night swim, what's new.
  {
    name: '40-museum-case',
    data: FIVE_WEEKS,
    async steps(page, snap) {
      await role(page, 'Museum').click()
      await pause(page, 500)
      await role(page, 'a fish, open its case').click()
      await pause(page, 600)
      await snap('')
      await role(page, 'back to the museum').click()
      await pause(page, 400)
      await role(page, 'the golden whale, open its case')
        .click()
        .catch(() => undefined)
      await pause(page, 600)
      await snap('-legendary')
      return 'done'
    },
  },
  {
    name: '41-tide',
    data: FIVE_WEEKS,
    async steps(page, snap) {
      await role(page, 'Menu').click()
      await role(page, 'the log').click()
      await pause(page, 500)
      await role(page, 'previous month').click()
      await pause(page, 500)
      await page.getByRole('button', { name: /^watch .+’s tide$/ }).click()
      for (let card = 0; card < 9; card++) {
        await pause(page, 700)
        await snap(`-${String(card)}`)
        const next = role(page, 'next')
        if (!(await next.isVisible())) break
        await next.click()
      }
      return 'done'
    },
  },
  {
    name: '42-drift',
    data: FIVE_WEEKS,
    async steps(page) {
      await role(page, 'Menu').click()
      await role(page, 'drift').click()
      await pause(page, 2500)
    },
  },
  {
    name: '43-night-swim',
    data: (() => {
      const data = clone(FIVE_WEEKS)
      delete data.settings.swimOn
      return data
    })(),
    at: new Date(2026, 10, 11, 9, 0),
    async steps(page) {
      await pause(page, 2600)
    },
  },
  {
    name: '44-whats-new',
    data: FIVE_WEEKS,
    news: false,
    async steps(page) {
      await page.getByRole('dialog', { name: 'what’s new' }).waitFor()
      await pause(page, 700)
    },
  },
  {
    name: '38-toast-update',
    data: FIVE_WEEKS,
    async steps(page) {
      // The update toast needs a new deploy under an open page (tests/e2e/update.e2e.ts does
      // that); here it is drawn with the app's own markup and styles.
      await page.evaluate(() => {
        const toast = document.createElement('button')
        toast.type = 'button'
        toast.className = 'toast'
        toast.textContent = 'new version. tap to reload'
        document.getElementById('frame')?.append(toast)
        window.requestAnimationFrame(() => toast.classList.add('is-open'))
      })
      await pause(page, 600)
    },
  },
]

async function convert(png, phoneWidth) {
  const webp = png.replace(/\.png$/, '.webp')
  await sharp(png)
    .resize({ width: Math.round(phoneWidth * SCALE) })
    .webp({ quality: 72, effort: 6 })
    .toFile(webp)
  unlinkSync(png)
}

const browser = await chromium.launch()
for (const surface of SURFACES) {
  if (only && !surface.name.includes(only)) continue
  for (const phone of PHONES) {
    const context = await browser.newContext(phone.options)
    const page = await context.newPage()
    const at = surface.at ?? NOW
    if (surface.clock) await page.clock.install({ time: at })
    else await page.clock.setFixedTime(at)
    if (surface.init) await page.addInitScript(surface.init)
    if (!surface.intro)
      await page.addInitScript((news) => {
        localStorage.setItem('whaleclub:intro', 'seen')
        // This version's "what's new" seen, except where it is the picture.
        if (news) localStorage.setItem('whaleclub:news', '1.3.0')
      }, surface.news !== false)
    if (surface.data)
      await page.addInitScript(
        (json) => localStorage.setItem('whaleclub:data', json),
        JSON.stringify(surface.data),
      )
    const width = phone.options.viewport.width
    const snap = async (suffix) => {
      const file = resolve(out, `${surface.name}${suffix}-${phone.tag}.png`)
      await page.screenshot({ path: file })
      await convert(file, width)
    }
    await page.goto(base)
    if (!surface.clock) await pause(page, surface.wait ?? 1400)
    try {
      const result = surface.steps ? await surface.steps(page, snap) : undefined
      if (result !== 'done') await snap('')
      process.stdout.write(`${surface.name} ${phone.tag}\n`)
    } catch (error) {
      process.stdout.write(`${surface.name} ${phone.tag} FAILED: ${String(error).split('\n')[0]}\n`)
      if (process.env.AUDIT_DEBUG)
        await page.screenshot({
          path: resolve(process.env.AUDIT_DEBUG, `${surface.name}-${phone.tag}.png`),
        })
    }
    await context.close()
  }
}
await browser.close()
process.stdout.write(`${String(readdirSync(out).length)} pictures in ${out}\n`)
