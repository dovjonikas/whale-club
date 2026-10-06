import type { Locator, Page } from '@playwright/test'

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
  mode?: 'tap' | 'timer'
  minutes?: number
  world: 'sea' | 'sky' | 'garden'
  createdAt: string
  order: number
}

export interface SeedData {
  things: SeedThing[]
  days: Record<string, { done: string[]; minutes?: Record<string, number>; checkin?: boolean }>
  settings?: Record<string, unknown>
}

export async function seed(page: Page, data: SeedData): Promise<void> {
  const payload = {
    version: 1,
    things: data.things.map((t) => ({ emoji: '•', mode: 'tap', ...t })),
    days: Object.fromEntries(Object.entries(data.days).map(([k, v]) => [k, { minutes: {}, ...v }])),
    settings: { sound: true, ...data.settings },
  }
  await page.addInitScript(
    ([key, json]) => {
      localStorage.setItem(key, json)
    },
    [STORAGE_KEY, JSON.stringify(payload)] as const,
  )
}

export async function addThing(
  page: Page,
  name: string,
  options: { emoji?: string; timer?: number } = {},
): Promise<void> {
  await page.getByRole('button', { name: 'Add a thing' }).click()
  await page.getByRole('textbox', { name: 'name' }).fill(name)
  if (options.emoji) await page.getByRole('button', { name: options.emoji }).click()
  if (options.timer) {
    await page.getByRole('button', { name: 'timer' }).click()
    await page.getByRole('button', { name: String(options.timer), exact: true }).click()
  }
  await page.getByRole('button', { name: 'add', exact: true }).click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
}

export function card(page: Page, name: string): Locator {
  return page.getByRole('button', { name, exact: true })
}

/** Holds the pointer down for longer than the long-press threshold. */
export async function longPress(page: Page, target: Locator): Promise<void> {
  const box = await target.boundingBox()
  if (!box) throw new Error('target has no box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(700)
  await page.mouse.up()
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
