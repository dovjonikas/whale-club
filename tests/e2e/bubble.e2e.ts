import { GLYPHS } from '../../src/brand/glyphs'
import { ICONS } from '../../src/brand/icons'
import { expect, test, card, dateKey, seed } from './helpers'

/**
 * The bubble on screen: every glyph drawn inside its box at 20 px and in a
 * bubble, every state, the icons and the app icon on brand.html; and the
 * moment a thing is done, with and without motion.
 */

test('brand.html draws every glyph inside its box at 20 px and in a bubble, every state and icon', async ({
  page,
}) => {
  await page.goto('brand.html')
  await expect(page.getByRole('heading', { name: 'Whale Club, the look' })).toBeVisible()

  const small = page.locator('.glyph-small svg')
  await expect(small).toHaveCount(GLYPHS.length)
  await expect(page.locator('.glyph-bubble .bubble')).toHaveCount(GLYPHS.length)
  // Every drawing stays on the 24 grid with room to read, at 20 px and at the bubble's size.
  const drawn = await page.evaluate(() =>
    [...document.querySelectorAll<SVGSVGElement>('.glyph-small svg')].map((svg) => {
      const box = svg.getBBox()
      const rect = svg.getBoundingClientRect()
      return { x: box.x, y: box.y, w: box.width, h: box.height, px: rect.width }
    }),
  )
  for (const [i, d] of drawn.entries()) {
    const id = GLYPHS[i]?.id ?? String(i)
    expect(d.px, id).toBe(20)
    expect(d.x, id).toBeGreaterThanOrEqual(1)
    expect(d.y, id).toBeGreaterThanOrEqual(1)
    expect(d.x + d.w, id).toBeLessThanOrEqual(23)
    expect(d.y + d.h, id).toBeLessThanOrEqual(23)
    expect(Math.max(d.w, d.h), id).toBeGreaterThan(12)
  }
  const bubbles = await page.locator('.glyph-bubble').first().boundingBox()
  expect(bubbles?.width).toBe(48)

  // The states: empty, done, a lock-in at 0, half and done, without the timer, a monogram.
  await expect(page.locator('.state')).toHaveCount(7)
  await expect(page.locator('.state .bubble[data-done="true"]')).toHaveCount(3)
  await expect(page.locator('.state .bubble-progress')).toHaveCount(4)
  await expect(page.locator('.state text')).toHaveText(['K', 'K'])
  await expect(page.locator('.ui-icon')).toHaveCount(Object.keys(ICONS).length)
  await expect(page.getByRole('img', { name: /a whale's tail diving/ })).toBeVisible()
})

test('done fills the bubble, turns its glyph dark and pops the signature into three', async ({
  page,
}) => {
  await seed(page, {
    things: [
      { id: 't1', name: 'run', kind: 'tap', world: 'sea', createdAt: dateKey(-2), order: 0 },
    ],
    days: {},
  })
  await page.goto('')
  const bubble = page.locator('.card .bubble')
  await expect(bubble).toHaveAttribute('data-done', 'false')
  // The pop lasts a third of a second: the page notes it, so a slow poll cannot miss it.
  await page.evaluate(() => {
    const target = document.querySelector('.card')
    const seen = window as unknown as { popped?: boolean }
    seen.popped = false
    if (!target) return
    new MutationObserver(() => {
      if (target.classList.contains('is-popping')) seen.popped = true
    }).observe(target, { attributes: true, attributeFilter: ['class'] })
  })
  await card(page, 'run').click()
  await expect(bubble).toHaveAttribute('data-done', 'true')
  const theCard = page.locator('.card', { has: card(page, 'run') })
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { popped?: boolean }).popped))
    .toBe(true)
  await expect(theCard).not.toHaveClass(/is-popping/)
  await expect
    .poll(() => bubble.locator('.bubble-fill').evaluate((e) => getComputedStyle(e).opacity))
    .toBe('1')
  await expect
    .poll(() => bubble.locator('.bubble-mark-dark').evaluate((e) => getComputedStyle(e).opacity))
    .toBe('1')
  // A thing drawn done does not pop again when the screen is drawn again.
  await page.reload()
  await expect(page.locator('.card .bubble')).toHaveAttribute('data-done', 'true')
  await expect(theCard).not.toHaveClass(/is-popping/)
})

test('under reduced motion the bubble only fills: nothing swells, nothing pops', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await seed(page, {
    things: [
      { id: 't1', name: 'run', kind: 'tap', world: 'sea', createdAt: dateKey(-2), order: 0 },
    ],
    days: {},
  })
  await page.goto('')
  await card(page, 'run').click()
  const bubble = page.locator('.card .bubble')
  await expect(bubble).toHaveAttribute('data-done', 'true')
  const still = await bubble.evaluate((svg) => {
    const style = (selector: string): CSSStyleDeclaration | null => {
      const element = svg.querySelector(selector)
      return element ? getComputedStyle(element) : null
    }
    return {
      sign: style('.bubble-sign')?.animationName,
      fill: style('.bubble-fill')?.transform,
      fades: style('.bubble-fill')?.transitionProperty,
    }
  })
  expect(still.sign).toBe('none')
  expect(still.fill).toBe('none')
  expect(still.fades).toBe('opacity')
  await expect
    .poll(() => bubble.locator('.bubble-fill').evaluate((e) => getComputedStyle(e).opacity))
    .toBe('1')
})
