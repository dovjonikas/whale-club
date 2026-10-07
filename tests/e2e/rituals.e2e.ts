import { recapFor } from '../../src/app/recap'
import { emptyData, EVERY_DAY } from '../../src/store/types'
import { expect, test, addThing, dateKey, dismissInstallLeaf, seed } from './helpers'

/**
 * The check-in and the weekly recap: one notice at a time above the row,
 * each asked once, neither ever counting what was missed.
 */
test('the check-in is two taps, then noted, then not asked again today', async ({ page }) => {
  await page.goto('')
  await addThing(page, 'run')
  await dismissInstallLeaf(page)
  const checkin = page.getByRole('complementary', { name: 'check-in' })
  await expect(checkin).toContainText('how are you living?')
  await checkin.getByRole('button', { name: 'good!!!' }).click()
  await expect(checkin).toContainText('how do you feel?')
  await checkin.getByRole('button', { name: 'happy!!!' }).click()
  await expect(checkin).toContainText('noted.')
  await expect(checkin).toBeHidden()
  await page.reload()
  await expect(page.getByRole('complementary', { name: 'check-in' })).toBeHidden()
})

test('the recap says N/7 for the week and never what was missed', async ({ page }) => {
  const things = [
    { id: 't1', name: 'run', world: 'sea' as const, createdAt: dateKey(-21), order: 0 },
  ]
  const days: Record<string, { done: string[] }> = {}
  for (let i = 1; i <= 21; i++) if (i % 3 !== 0) days[dateKey(-i)] = { done: ['t1'] }
  await seed(page, { things, days })

  // The same arithmetic the app runs, on the same seed, so the test knows
  // which week the app will recap whatever day it runs on.
  const data = emptyData()
  data.things = things.map((t) => ({
    ...t,
    icon: 'letter',
    kind: 'tap' as const,
    line: 'a' as const,
    minutes: 30,
    days: [...EVERY_DAY],
  }))
  for (const [k, v] of Object.entries(days)) data.days[k] = { done: v.done, minutes: {} }
  const expected = recapFor(data)
  if (!expected) throw new Error('the seed should always produce a recap')

  await page.goto('')
  await dismissInstallLeaf(page)
  const recap = page.getByRole('complementary', { name: 'weekly recap' })
  await expect(recap).toContainText(`${expected.count}/${expected.planned}.`)
  await expect(recap).not.toContainText(/miss/i)
  await recap.getByRole('button', { name: 'ok' }).click()
  await expect(recap).toBeHidden()
  await page.reload()
  await expect(page.getByRole('complementary', { name: 'weekly recap' })).toBeHidden()
  // With the recap gone, the check-in takes the slot.
  await expect(page.getByRole('complementary', { name: 'check-in' })).toBeVisible()
})

test('the menu is the club: three rules, one sentence, the day count', async ({ page }) => {
  await seed(page, {
    things: [{ id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-4), order: 0 }],
    days: {},
  })
  await page.goto('')
  await page.getByRole('button', { name: 'Menu' }).click()
  const sheet = page.getByRole('dialog', { name: 'the club' })
  await expect(sheet.getByRole('list').first().getByRole('listitem')).toHaveCount(3)
  await expect(sheet).toContainText('the first rule of whale club is: you show up.')
  await expect(sheet).toContainText('whale club is you and whoever you send your whale to.')
  await expect(sheet).toContainText('day 5 of whale club')
})
