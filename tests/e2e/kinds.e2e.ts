import type { Page } from '@playwright/test'
import { expect, test, addThing, card, dateKey, dismissInstallLeaf, seed, stored } from './helpers'
import { DATA_VERSION } from '../../src/store/types'

/**
 * Two kinds of thing. A tap thing is a list: a tap marks it, a tap takes
 * it back. A lock-in counts only when its timer has seen the whole length;
 * "did it without the timer" lives in its sheet, twice a week at most, and
 * counts with a hand and no lantern.
 */
const cardOf = (page: Page, name: string) => page.locator('.card', { has: card(page, name) })

test('a tap thing has an empty ring, a tap marks it, a second takes it back', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'vitamins')
  await dismissInstallLeaf(page)
  await expect(cardOf(page, 'vitamins')).toHaveAttribute('data-kind', 'tap')
  await expect(cardOf(page, 'vitamins').locator('.card-length')).toHaveText('')
  await card(page, 'vitamins').click()
  await expect(card(page, 'vitamins')).toHaveAttribute('aria-pressed', 'true')
  await card(page, 'vitamins').click()
  await expect(card(page, 'vitamins')).toHaveAttribute('aria-pressed', 'false')
})

test('changing the kind in the sheet applies from today', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'read')
  await dismissInstallLeaf(page)
  await page.getByRole('button', { name: 'edit read' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'lock in', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: '25 min' }).click()
  await page.getByRole('button', { name: 'save' }).click()
  await expect(cardOf(page, 'read')).toHaveAttribute('data-kind', 'lockIn')
  await expect(cardOf(page, 'read')).toContainText('25 min')
  await card(page, 'read').click()
  await expect(page.getByRole('slider', { name: 'minutes' })).toHaveAttribute('aria-valuenow', '25')
})

test('data from before 0.11 gets a kind: lock in where most done days had minutes', async ({
  page,
}) => {
  await seed(page, {
    version: 5,
    things: [
      { id: 't1', name: 'study', world: 'sea', createdAt: dateKey(-5), order: 0, minutes: 25 },
      { id: 't2', name: 'water', world: 'sky', createdAt: dateKey(-5), order: 1 },
    ],
    days: {
      [dateKey(-3)]: { done: ['t1', 't2'], minutes: { t1: 25 } },
      [dateKey(-2)]: { done: ['t1', 't2'], minutes: { t1: 25, t2: 10 } },
      [dateKey(-1)]: { done: ['t1', 't2'] },
    },
  })
  await page.goto('')
  await dismissInstallLeaf(page)
  // A tap writes the migrated record back.
  await card(page, 'water').click()
  const data = (await stored(page)) as unknown as {
    version: number
    things: { kind: string; minutes: number }[]
  }
  expect(data.version).toBe(DATA_VERSION)
  expect(data.things.map((t) => t.kind)).toEqual(['lockIn', 'tap'])
  expect(data.things[0]?.minutes).toBe(25)
  await expect(cardOf(page, 'study')).toContainText('25 min')
})

test('did it without the timer: yes counts, with a hand and no lantern', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'study', { lockIn: true })
  await dismissInstallLeaf(page)
  await page.getByRole('button', { name: 'edit study' }).click()
  await page.getByRole('button', { name: 'did it without the timer' }).click()
  await expect(page.getByText('the full 15 min, for real?')).toBeVisible()
  await page.getByRole('button', { name: 'yes', exact: true }).click()
  await expect(cardOf(page, 'study')).toHaveAttribute('data-done', 'true')
  await expect(cardOf(page, 'study')).toHaveAttribute('data-manual', 'true')
  await expect(page.locator('canvas.lanterns')).toHaveAttribute('data-count', '0')
  await expect(page.getByRole('group', { name: 'your days' }).getByRole('button')).toHaveCount(1)
  const data = (await stored(page)) as unknown as {
    days: Record<string, { manual?: string[]; sessions?: unknown[] }>
  }
  expect(data.days[dateKey(0)]?.manual).toHaveLength(1)
  expect(data.days[dateKey(0)]?.sessions).toBeUndefined()
})

test('not really changes nothing, and says one line', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'study', { lockIn: true })
  await dismissInstallLeaf(page)
  await page.getByRole('button', { name: 'edit study' }).click()
  await page.getByRole('button', { name: 'did it without the timer' }).click()
  await page.getByRole('button', { name: 'not really' }).click()
  await expect(page.locator('.line')).toHaveText('okay. the timer is waiting.')
  await expect(cardOf(page, 'study')).toHaveAttribute('data-done', 'false')
})

test('twice a week at most, for all things together', async ({ page }) => {
  const t = (id: string, name: string, order: number) => ({
    id,
    name,
    kind: 'lockIn' as const,
    world: (['sea', 'sky', 'garden'] as const)[order] ?? 'sea',
    createdAt: dateKey(-3),
    order,
  })
  await seed(page, {
    things: [t('t1', 'study', 0), t('t2', 'practice', 1), t('t3', 'read', 2)],
    days: { [dateKey(0)]: { done: ['t1', 't2'], manual: ['t1', 't2'] } },
  })
  await page.goto('')
  await dismissInstallLeaf(page)
  await page.getByRole('button', { name: 'edit read' }).click()
  await expect(page.getByRole('button', { name: 'did it without the timer' })).toBeDisabled()
  await expect(page.getByText('used both this week.')).toBeVisible()
})

test('the lab: do everything today finishes the lock-ins as whole sessions', async ({ page }) => {
  await seed(page, {
    things: [
      { id: 't1', name: 'water', world: 'sea', createdAt: dateKey(-3), order: 0 },
      {
        id: 't2',
        name: 'study',
        kind: 'lockIn',
        minutes: 20,
        world: 'sky',
        createdAt: dateKey(-3),
        order: 1,
      },
    ],
    days: {},
  })
  await page.goto('?lab=1')
  await page
    .getByRole('dialog', { name: 'the lab' })
    .getByRole('button', { name: 'do everything today' })
    .click()
  await expect(cardOf(page, 'study')).toHaveAttribute('data-done', 'true')
  await expect(cardOf(page, 'water')).toHaveAttribute('data-done', 'true')
  const sessions = await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('whaleclub:lab') ?? '{}') as {
      days: Record<string, { sessions?: { thing: string; minutes: number }[] }>
    }
    return Object.values(raw.days).flatMap((d) => d.sessions ?? [])
  })
  expect(sessions).toEqual([{ thing: 't2', minutes: 20 }])
})

test('a lock-in can be any length up to ten hours: other, in hours and minutes', async ({
  page,
}) => {
  await page.goto('')
  await page.getByRole('button', { name: 'Add a thing' }).click()
  await page.getByRole('textbox', { name: 'name' }).fill('deep work')
  await page.getByRole('dialog').getByRole('button', { name: 'lock in', exact: true }).click()
  await page.getByRole('button', { name: 'other' }).click()
  await page.getByRole('spinbutton', { name: 'h' }).fill('5')
  await page.getByRole('spinbutton', { name: 'min' }).fill('0')
  await page.getByRole('button', { name: 'add', exact: true }).click()
  await dismissInstallLeaf(page)
  await expect(cardOf(page, 'deep work')).toContainText('5 h')
  await card(page, 'deep work').click()
  const dial = page.getByRole('slider', { name: 'minutes' })
  await expect(dial).toHaveAttribute('aria-valuenow', '300')
  await expect(dial).toHaveAttribute('aria-valuetext', '5 h')
  // One key press is one stop: half an hour at this length.
  await dial.focus()
  await page.keyboard.press('ArrowRight')
  await expect(dial).toHaveAttribute('aria-valuenow', '330')
})
