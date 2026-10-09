import { COLLECTIBLES } from '../../src/scene/collectibles'
import { PLAQUES } from '../../src/scene/collectibles/museum'
import { LEGENDARIES } from '../../src/scene/legendary'
import { writtenDate } from '../../src/store/dates'
import { clearNotices, dateKey, expect, seedPerson, test } from './helpers'

/**
 * The museum: every find has a plaque, one line about itself, and a tap
 * on a found tile opens its case with the line and the day it came.
 */
test.describe('the plaques', () => {
  test.skip(({ isMobile }) => isMobile, 'pure data')

  test('every find, legendary and half way find has a plaque, short enough for its case', () => {
    const ids = [
      ...COLLECTIBLES.map((c) => c.id),
      ...LEGENDARIES.flatMap((l) => [l.find.id, l.rare.id]),
    ]
    const missing = ids.filter((id) => !PLAQUES[id])
    expect(missing).toEqual([])
    const long = Object.entries(PLAQUES).filter(([, line]) => line.length > 64)
    expect(long).toEqual([])
    // No plaque for a find that is not there.
    expect(Object.keys(PLAQUES).filter((id) => !ids.includes(id))).toEqual([])
  })
})

test('a found tile opens its case: the find, its plaque, the day it came; back returns to it', async ({
  page,
}) => {
  await seedPerson(page)
  await page.goto('')
  await clearNotices(page)
  await page.getByRole('button', { name: 'Museum' }).click()
  const museum = page.getByRole('dialog', { name: 'the museum' })
  const open = museum.getByRole('button', { name: 'a fish, open its case' })
  await open.click()
  await expect(museum.getByRole('heading', { name: 'a fish' })).toBeVisible()
  await expect(museum.getByText(PLAQUES['sea-a-fish'] ?? '')).toBeVisible()
  // The seventh day the person ran: forty days ago, then six more.
  await expect(museum.getByText(`came on ${writtenDate(dateKey(-34))} · run, day 7`)).toBeVisible()
  // A locked find has no case to open.
  await museum.getByRole('button', { name: 'back to the museum' }).click()
  await expect(open).toBeFocused()
  await expect(museum.getByRole('button', { name: /^a whale calf, open its case$/ })).toHaveCount(0)
})

test('an earned legendary’s case shows the find half way to it', async ({ page }) => {
  await seedPerson(page)
  await page.goto('')
  await clearNotices(page)
  await page.getByRole('button', { name: 'Museum' }).click()
  const museum = page.getByRole('dialog', { name: 'the museum' })
  await museum.getByRole('button', { name: 'the golden whale, open its case' }).click()
  await expect(museum.getByRole('heading', { name: /the golden whale/ })).toBeVisible()
  await expect(museum.getByText(PLAQUES['legend-whale'] ?? '')).toBeVisible()
  await expect(museum.getByText('a golden scale')).toBeVisible()
  await expect(museum.getByText(PLAQUES['rare-scale'] ?? '')).toBeVisible()
})
