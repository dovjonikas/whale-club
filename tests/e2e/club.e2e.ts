import { expect, test } from '@playwright/test'
import { decodeCode, encodeCode } from '../../src/store/code'
import { emptyData } from '../../src/store/types'
import { dateKey, seed } from './helpers'

/**
 * The club: one buddy, named by you, whose code you paste once. Their
 * scene is drawn from the code alone, read only, with no server. A code
 * that does not decode is refused with a line, not a crash.
 */
async function buddyCode(): Promise<string> {
  const data = emptyData()
  data.things = [
    {
      id: 'x',
      name: 'swim',
      emoji: '🏊',
      mode: 'tap',
      world: 'sea',
      createdAt: dateKey(-12),
      order: 0,
    },
    {
      id: 'y',
      name: 'draw',
      emoji: '✏️',
      mode: 'tap',
      world: 'sky',
      createdAt: dateKey(-12),
      order: 1,
    },
  ]
  for (let i = 1; i <= 9; i++) data.days[dateKey(-i)] = { done: ['x', 'y'], minutes: {} }
  return encodeCode(data)
}

test('the code round-trips', async () => {
  const code = await buddyCode()
  expect(code.startsWith('wc1')).toBe(true)
  const back = await decodeCode(code)
  expect(back.things.map((t) => t.name)).toEqual(['swim', 'draw'])
  expect(Object.keys(back.days)).toHaveLength(9)
})

test('pasting a buddy code shows their scene beside yours, read only', async ({ page }) => {
  await seed(page, {
    things: [{ id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-3), order: 0 }],
    days: { [dateKey(-1)]: { done: ['t1'] } },
  })
  await page.goto('')
  await page.getByRole('button', { name: 'Club' }).click()
  const sheet = page.getByRole('dialog', { name: 'the club' })
  await expect(sheet.getByRole('textbox', { name: 'your code' })).toHaveValue(/^wc1/)

  await sheet.getByRole('textbox', { name: 'who pushes you?' }).fill('Sam')
  await sheet.getByRole('textbox', { name: 'their code' }).fill(await buddyCode())
  await sheet.getByRole('button', { name: 'save' }).click()

  const buddy = sheet.getByRole('region', { name: 'Sam' })
  await expect(buddy).toBeVisible()
  await expect(buddy).toContainText('day 13 of whale club')
  await expect(buddy.locator('.card')).toHaveCount(2)
  await expect(buddy.locator('.card').first()).toContainText('swim')
  await expect(buddy.getByRole('listitem', { name: 'a fish' })).toBeVisible()
  await expect(buddy.getByRole('listitem', { name: 'seven stars' })).toBeVisible()

  await page.keyboard.press('Escape')
  await page.reload()
  await page.getByRole('button', { name: 'Club' }).click()
  await expect(page.getByRole('region', { name: 'Sam' })).toBeVisible()
  await page.getByRole('button', { name: 'remove' }).click()
  await expect(page.getByRole('textbox', { name: 'who pushes you?' })).toBeVisible()
})

test('a code that is not a code is refused', async ({ page }) => {
  await page.goto('')
  await page.getByRole('button', { name: 'Club' }).click()
  const sheet = page.getByRole('dialog', { name: 'the club' })
  await sheet.getByRole('textbox', { name: 'who pushes you?' }).fill('Sam')
  await sheet.getByRole('textbox', { name: 'their code' }).fill('hello')
  await sheet.getByRole('button', { name: 'save' }).click()
  await expect(page.getByRole('button', { name: 'that code did not work.' })).toBeVisible()
  await expect(sheet.getByRole('textbox', { name: 'their code' })).toBeVisible()
})
