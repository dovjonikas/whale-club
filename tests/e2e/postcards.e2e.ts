import { expect, test, type Page } from '@playwright/test'
import { addThing, card, dateKey, dismissInstallLeaf, seed } from './helpers'

/**
 * Postcards are the club: after a moment worth showing, one button paints
 * the scene into a PNG and hands it to the share sheet. Nothing else
 * leaves the phone. The share sheet is mocked here and records what it
 * was given, size included; where there is no share sheet, it downloads.
 */
interface Shared {
  name: string
  type: string
  width: number
  height: number
}

async function mockShare(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __shared: unknown[] }
    w.__shared = []
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => {
        const file = data.files?.[0]
        if (!file) throw new Error('no file')
        const bitmap = await createImageBitmap(file)
        w.__shared.push({
          name: file.name,
          type: file.type,
          width: bitmap.width,
          height: bitmap.height,
        })
      },
    })
  })
}

async function shared(page: Page): Promise<Shared[]> {
  return page.evaluate(() => (window as unknown as { __shared: Shared[] }).__shared)
}

test('all done offers to send the whale; the first send asks story or square', async ({ page }) => {
  await mockShare(page)
  await page.goto('')
  await addThing(page, 'run')
  await dismissInstallLeaf(page)
  await card(page, 'run').click()
  const offer = page.getByRole('button', { name: 'send the whale' })
  await expect(offer).toBeVisible({ timeout: 6000 })
  await offer.click()
  const which = page.getByRole('dialog', { name: 'story or square?' })
  await which.getByRole('button', { name: 'story' }).click()
  await expect.poll(() => shared(page)).toHaveLength(1)
  const [first] = await shared(page)
  expect(first).toMatchObject({
    name: 'whale-club-day-1.png',
    type: 'image/png',
    width: 1080,
    height: 1920,
  })
})

test('an unlock offers to send this, in the size chosen before', async ({ page }) => {
  await mockShare(page)
  await seed(page, {
    things: [
      { id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-5), order: 0 },
      { id: 't2', name: 'read', world: 'sky', createdAt: dateKey(-5), order: 1 },
    ],
    days: { [dateKey(-1)]: { done: ['t1'] }, [dateKey(-2)]: { done: ['t1'] } },
    settings: { postcardFormat: 'square', installDismissedAt: dateKey(0) },
  })
  await page.goto('')
  await card(page, 'run').click()
  const offer = page.getByRole('button', { name: 'send this' })
  await expect(offer).toBeVisible({ timeout: 6000 })
  await offer.click()
  await expect.poll(() => shared(page)).toHaveLength(1)
  const [first] = await shared(page)
  expect(first).toMatchObject({ width: 1080, height: 1080 })
})

test('the header sends the sea any time, and the menu changes the size', async ({ page }) => {
  await mockShare(page)
  await seed(page, {
    things: [{ id: 't1', name: 'run', world: 'sea', createdAt: dateKey(-3), order: 0 }],
    days: { [dateKey(-1)]: { done: ['t1'] } },
    settings: { postcardFormat: 'story', installDismissedAt: dateKey(0) },
  })
  await page.goto('')
  await page.getByRole('button', { name: 'send the sea' }).click()
  await expect.poll(() => shared(page)).toHaveLength(1)

  await page.getByRole('button', { name: 'Menu' }).click()
  await page
    .getByRole('dialog', { name: 'the club' })
    .getByRole('button', { name: 'square' })
    .click()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'send the sea' }).click()
  await expect.poll(() => shared(page)).toHaveLength(2)
  const [story, square] = await shared(page)
  expect(story).toMatchObject({ width: 1080, height: 1920 })
  expect(square).toMatchObject({ width: 1080, height: 1080 })
})

test('with no share sheet, the postcard downloads', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true })
  })
  await seed(page, {
    things: [{ id: 't1', name: 'run', world: 'sea', createdAt: dateKey(0), order: 0 }],
    days: {},
    settings: { postcardFormat: 'story', installDismissedAt: dateKey(0) },
  })
  await page.goto('')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'send the sea' }).click()
  expect((await download).suggestedFilename()).toBe('whale-club-day-1.png')
  await expect(page.locator('.line')).toHaveText('picture saved.')
})

test('the buddy is gone: four header buttons, no codes, no names', async ({ page }) => {
  await page.goto('')
  await expect(page.locator('.header-actions button')).toHaveCount(4)
  await expect(page.getByRole('button', { name: 'Club' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Menu' }).click()
  const sheet = page.getByRole('dialog', { name: 'the club' })
  await expect(sheet).not.toContainText(/code|who pushes you/i)
  await expect(sheet.getByRole('textbox')).toHaveCount(0)
})

test('the sound button remembers being switched off', async ({ page }) => {
  await page.goto('')
  const sound = page.getByRole('button', { name: 'Sound' })
  await expect(sound).toHaveAttribute('aria-pressed', 'true')
  await sound.click()
  await expect(sound).toHaveAttribute('aria-pressed', 'false')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Sound' })).toHaveAttribute('aria-pressed', 'false')
})
