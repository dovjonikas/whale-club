import { expect, type Locator, type Page } from '@playwright/test'

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
    }
  >
  /** Per thing, the highest tier already cracked. Absent: every earned stone is still waiting. */
  cracked?: Record<string, number>
  settings?: Record<string, unknown>
}

export async function seed(page: Page, data: SeedData): Promise<void> {
  const payload = {
    version: 3,
    things: data.things.map((t) => ({ emoji: '•', ...t })),
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
  options: { emoji?: string; minutes?: number } = {},
): Promise<void> {
  await page.getByRole('button', { name: 'Add a thing' }).click()
  await page.getByRole('textbox', { name: 'name' }).fill(name)
  if (options.emoji) await page.getByRole('button', { name: options.emoji }).click()
  if (options.minutes) {
    await page.getByRole('button', { name: `${String(options.minutes)} min`, exact: true }).click()
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
