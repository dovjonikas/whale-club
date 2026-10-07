import { expect, test } from '@playwright/test'

/**
 * The install leaf: an iPhone in Safari gets the two steps, a desktop gets
 * nothing, and closing it is remembered for seven days.
 */
test('an iPhone is offered the home screen, with three steps on request', async ({ page }) => {
  test.skip(test.info().project.name !== 'iphone', 'the iPhone leaf')
  await page.goto('')
  await expect(page.getByText('simple things. add one.')).toBeVisible()
  const leaf = page.getByRole('complementary', { name: 'install' })
  await expect(leaf).toBeVisible()
  await expect(leaf).toContainText('put it on your home screen')
  await leaf.getByRole('button', { name: 'show me how' }).click()
  const how = page.getByRole('dialog', { name: 'put it on your home screen' })
  await expect(how.getByRole('listitem')).toHaveCount(3)
  await expect(how).toContainText('Add to Home Screen')
  await page.keyboard.press('Escape')
  await leaf.getByRole('button', { name: 'not now' }).click()
  await expect(leaf).toBeHidden()
  await page.reload()
  await expect(page.getByRole('complementary', { name: 'install' })).toBeHidden()
})

test('a desktop is not asked to install', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'the desktop')
  await page.goto('')
  await expect(page.getByText('simple things. add one.')).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'install' })).toBeHidden()
})
