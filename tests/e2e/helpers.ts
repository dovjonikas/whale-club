import { test as base, expect, type Locator, type Page } from '@playwright/test'

export { expect }

/**
 * The tests' own `test`: a page that has seen the intro already, so a
 * test about anything else starts on the first screen. The intro's own
 * tests use Playwright's `test` directly.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem('whaleclub:intro', 'seen')
      } catch {
        // No storage: the intro would show; nothing here can help that.
      }
    })
    await use(page)
  },
})

/**
 * Shared steps for the browser tests. Everything goes through the real UI
 * except `seed`, which writes a history into storage before the page loads,
 * because a test about day 30 cannot wait thirty days.
 */

export const STORAGE_KEY = 'whaleclub:data'

export interface SeedThing {
  id: string
  name: string
  emoji?: string
  /** Data from before 0.9 had a mode; seeds without it are the current shape. */
  mode?: 'tap' | 'timer'
  minutes?: number
  world: 'sea' | 'sky' | 'garden'
  createdAt: string
  order: number
  /** Monday first; absent means every day. */
  days?: boolean[]
  kind?: 'tap' | 'lockIn'
}

export interface SeedData {
  things: SeedThing[]
  days: Record<
    string,
    {
      done: string[]
      minutes?: Record<string, number>
      checkin?: boolean
      waited?: string[]
      extra?: string[]
      skip?: string[]
      sessions?: { thing: string; minutes: number; left?: true; parts?: number }[]
      manual?: string[]
    }
  >
  /** Per thing, the highest tier already cracked. Absent: every earned stone is still waiting. */
  cracked?: Record<string, number>
  settings?: Record<string, unknown>
  /**
   * The stored version. Seeds default to 3, so every test also runs the
   * migrations; a seed with sessions says 5, because before 5 lanterns
   * were worked out from the minutes.
   */
  version?: number
}

export async function seed(page: Page, data: SeedData): Promise<void> {
  // A seed that names a kind is the current shape; one that does not runs every migration.
  const current = data.things.some((t) => t.kind !== undefined)
  const lines = new Map<string, number>()
  const payload = {
    version: data.version ?? (current ? 7 : 3),
    things: data.things.map((t) => {
      const n = lines.get(t.world) ?? 0
      lines.set(t.world, n + 1)
      return { emoji: '•', kind: 'tap', minutes: 15, line: n === 0 ? 'a' : 'b', ...t }
    }),
    days: Object.fromEntries(Object.entries(data.days).map(([k, v]) => [k, { minutes: {}, ...v }])),
    cracked: data.cracked ?? {},
    settings: { sound: true, ...data.settings },
  }
  await page.addInitScript(
    ([key, json]) => {
      // Init scripts run on every navigation; a reload must keep what the app saved.
      if (localStorage.getItem(key) === null) localStorage.setItem(key, json)
    },
    [STORAGE_KEY, JSON.stringify(payload)] as const,
  )
}

export async function addThing(
  page: Page,
  name: string,
  /** `picture`: a glyph by its label, chosen under "more" (otherwise the name picks it). */
  options: { picture?: string; lockIn?: boolean; minutes?: number } = {},
): Promise<void> {
  await page.getByRole('button', { name: 'Add a thing' }).click()
  await page.getByRole('textbox', { name: 'name' }).fill(name)
  if (options.picture) {
    const sheet = page.getByRole('dialog')
    await sheet.getByRole('button', { name: 'more', exact: true }).click()
    await sheet
      .locator('.icon-more')
      .getByRole('button', { name: options.picture, exact: true })
      .click()
  }
  if (options.lockIn) {
    await page.getByRole('button', { name: 'lock in', exact: true }).click()
    if (options.minutes)
      await page
        .getByRole('button', { name: `${String(options.minutes)} min`, exact: true })
        .click()
  }
  await page.getByRole('button', { name: 'add', exact: true }).click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
}

export function card(page: Page, name: string): Locator {
  return page.getByRole('button', { name, exact: true })
}

/** Pretends the page went to the background (or came back), the way a locked phone does. */
export async function setHidden(page: Page, hidden: boolean): Promise<void> {
  await page.evaluate((h) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => h })
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => (h ? 'hidden' : 'visible'),
    })
    document.dispatchEvent(new Event('visibilitychange'))
  }, hidden)
}

/** What the app has stored, read back from the page. */
export async function stored(page: Page): Promise<{
  days: Record<string, { done: string[]; minutes: Record<string, number>; waited?: string[] }>
  things: { id: string; name: string; minutes?: number }[]
  cracked: Record<string, number>
  settings: Record<string, unknown>
}> {
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? '{}') as Awaited<ReturnType<typeof stored>>,
    STORAGE_KEY,
  )
}

export function dateKey(offsetDays = 0, from = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + offsetDays)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Waits until a service worker controls the page. */
export async function waitForServiceWorker(page: Page): Promise<void> {
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, {
    timeout: 20_000,
  })
}

/** Closes the install leaf if this device shows one, so the notice slot is free. */
export async function dismissInstallLeaf(page: Page): Promise<void> {
  const leaf = page.getByRole('complementary', { name: 'install' })
  if (await leaf.isVisible()) await leaf.getByRole('button', { name: 'not now' }).click()
}

/** Clears the notices over the sky (install, recap, check-in), so what is under them can be reached. */
export async function clearNotices(page: Page): Promise<void> {
  await dismissInstallLeaf(page)
  const recap = page.getByRole('complementary', { name: 'weekly recap' })
  if (await recap.isVisible()) await recap.getByRole('button', { name: 'ok' }).click()
  const checkin = page.getByRole('complementary', { name: 'check-in' })
  if (await checkin.isVisible()) {
    await checkin.getByRole('button', { name: 'good!!!' }).click()
    await checkin.getByRole('button', { name: 'happy!!!' }).click()
    await expect(checkin).toBeHidden()
  }
}

/**
 * A person some weeks in, at the current data version, with nothing
 * migrated: the dock and arranging need finds, krill and the v8 fields.
 */
export interface Person {
  /** Sea line a, sky line a, garden line a; `swim` adds sea line b. */
  swim?: boolean
  /** The tier cracked per thing; sea line b's own, when there is one. */
  cracked?: number
  swimCracked?: number
  days?: number
  extra?: Record<string, unknown>
}

/** A person forty days in, every thing done every day, finds cracked to day 30. */
export async function seedPerson(page: Page, person: Person = {}): Promise<void> {
  const days = person.days ?? 40
  const lines: [string, string, string][] = [
    ['run', 'sea', 'a'],
    ['read', 'sky', 'a'],
    ['draw', 'garden', 'a'],
  ]
  if (person.swim) lines.push(['swim', 'sea', 'b'])
  const things = lines.map(([id, world, line], order) => ({
    id,
    name: id,
    icon: 'letter',
    kind: 'tap',
    minutes: 15,
    days: [true, true, true, true, true, true, true],
    world,
    line,
    createdAt: dateKey(-days),
    order,
  }))
  const history: Record<string, { done: string[]; minutes: Record<string, number> }> = {}
  for (let i = -days; i < 0; i++)
    history[dateKey(i)] = { done: lines.map(([id]) => id), minutes: {} }
  const cracked = Object.fromEntries(
    lines.map(([id]) => [id, id === 'swim' ? (person.swimCracked ?? 30) : (person.cracked ?? 30)]),
  )
  const data = {
    version: 8,
    things,
    days: history,
    cracked,
    settings: {
      sound: false,
      installDismissedAt: dateKey(-1),
      lastRecapWeek: dateKey(-1),
      explained: ['yours', 'firstStar', 'stone', 'lantern', 'kept'],
    },
    ...person.extra,
  }
  await page.addInitScript(
    ([key, json]) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, json)
    },
    [STORAGE_KEY, JSON.stringify(data)] as const,
  )
}

/**
 * Midday today, for a test whose clock runs on through a lock-in: started
 * at the real time, a fifteen-minute session begun at 23:55 would end on
 * tomorrow, and "today" would change under the test.
 */
export function middayToday(): Date {
  const noon = new Date()
  noon.setHours(12, 0, 0, 0)
  return noon
}
