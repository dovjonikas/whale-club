import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { goalOf } from '../../src/app/dockData'
import { DOCK, dockSvg } from '../../src/scene/dock'
import { owns, withGoal, withHidden, withPurchase, withWearer } from '../../src/store/dock'
import { krillBalance, krillEarned } from '../../src/store/krill'
import { emptyData, EVERY_DAY, type AppData } from '../../src/store/types'
import { addDays } from '../../src/store/dates'
import { migrate } from '../../src/store/migrate'

/**
 * The dock: a fixed catalogue of things to look at, bought with krill. No
 * chance anywhere, prices that hold, a balance that never goes below
 * nothing, and one goal at a time.
 */
const START = '2026-01-05'
const TODAY = addDays(START, 29)

/** A month of three things, every one done every day: 1,850 krill. */
function month(): AppData {
  const data = emptyData()
  data.things = ['run', 'read', 'draw'].map((id, order) => ({
    id,
    name: id,
    icon: 'letter',
    kind: 'tap' as const,
    minutes: 15,
    days: [...EVERY_DAY],
    world: (['sea', 'sky', 'garden'] as const)[order] ?? 'sea',
    line: 'a' as const,
    createdAt: START,
    order,
  }))
  for (let i = 0; i < 30; i++)
    data.days[addDays(START, i)] = { done: ['run', 'read', 'draw'], minutes: {} }
  return data
}

test.describe('the catalogue', () => {
  // Pure data: one device is enough.
  test.skip(({ isMobile }) => isMobile, 'pure data')

  test('thirty things in four tiers, each price inside its tier', () => {
    expect(DOCK).toHaveLength(30)
    expect(new Set(DOCK.map((i) => i.id)).size).toBe(30)
    const range = {
      small: [150, 400],
      middling: [800, 2000],
      large: [3000, 6000],
      legendary: [10_000, 15_000],
    }
    for (const item of DOCK) {
      const [min, max] = range[item.tier]
      expect(item.price, item.id).toBeGreaterThanOrEqual(min ?? 0)
      expect(item.price, item.id).toBeLessThanOrEqual(max ?? 0)
      expect(Number.isInteger(item.price)).toBe(true)
    }
    for (const tier of Object.keys(range)) expect(DOCK.some((i) => i.tier === tier)).toBe(true)
  })

  test('only the extensions the brief names, and the red jacket is never sold', () => {
    expect(DOCK.filter((i) => i.kind === 'room').map((i) => i.id)).toEqual([
      'longer-shore',
      'reef',
      'island',
    ])
    const island = DOCK.find((i) => i.id === 'island')
    expect(island?.price).toBe(
      Math.max(...DOCK.filter((i) => i.kind === 'room').map((i) => i.price)),
    )
    expect(DOCK.some((i) => i.id.includes('jacket') || i.name.includes('jacket'))).toBe(false)
  })

  test('every thing is drawn, and drawn the same every time', () => {
    for (const item of DOCK) {
      const svg = dockSvg(item)
      expect(svg, item.id).toMatch(/^<svg viewBox="0 0 100 100"/)
      expect(svg.length, item.id).toBeGreaterThan(200)
      expect(svg, item.id).not.toMatch(/undefined|NaN/)
      // Gradient ids are numbered per drawing, so they are set aside when comparing.
      const shape = (markup: string) => markup.replace(/"g\d+"|#g\d+\)/g, 'g')
      expect(shape(dockSvg(item)), item.id).toBe(shape(svg))
    }
    // A placed thing knows its world, its size and how it moves.
    for (const item of DOCK.filter((i) => i.kind === 'place')) {
      expect(item.world, item.id).toBeDefined()
      expect(item.size, item.id).toBeGreaterThan(0)
      expect(item.motion, item.id).toBeDefined()
    }
  })

  test('no chance anywhere in the dock or in krill', () => {
    for (const file of [
      'src/scene/dock/index.ts',
      'src/scene/dock/art.ts',
      'src/store/krill.ts',
      'src/store/dock.ts',
      'src/app/dockData.ts',
    ]) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/Math\.random|crypto\.getRandom/)
    }
  })
})

test.describe('buying', () => {
  test.skip(({ isMobile }) => isMobile, 'pure data')

  test('a purchase lowers the balance by its price, once', () => {
    const data = month()
    const before = krillBalance(data, TODAY)
    expect(before).toBe(krillEarned(data, TODAY))
    const bought = withPurchase(data, 'lighthouse', 4500, TODAY)
    expect(bought).toBeNull() // 1,850 does not reach 4,500
    const boat = withPurchase(data, 'boat', 1200, TODAY)
    expect(boat).not.toBeNull()
    if (!boat) return
    expect(owns(boat, 'boat')).toBe(true)
    expect(krillBalance(boat, TODAY)).toBe(before - 1200)
    // The same thing cannot be bought twice.
    expect(withPurchase(boat, 'boat', 1200, TODAY)).toBeNull()
  })

  test('the balance is never below nothing', () => {
    const data = month()
    const all = withPurchase(data, 'hammock', 1400, TODAY)
    if (!all) throw new Error('could not buy')
    // A whole month undone after the purchase: the balance stops at zero.
    for (const date of Object.keys(all.days)) all.days[date] = { done: [], minutes: {} }
    expect(krillBalance(all, TODAY)).toBe(0)
    expect(withPurchase(all, 'buoy', 150, TODAY)).toBeNull()
  })

  test('one goal at a time, its distance shown, let go once bought', () => {
    let data = withGoal(month(), 'lighthouse')
    expect(data.goal).toBe('lighthouse')
    expect(goalOf(data, TODAY)?.left).toBe(4500 - krillBalance(data, TODAY))
    data = withGoal(data, 'boat')
    expect(data.goal).toBe('boat')
    expect(goalOf(data, TODAY)?.left).toBe(0)
    const bought = withPurchase(data, 'boat', 1200, TODAY)
    expect(bought?.goal).toBeUndefined()
    expect(bought && goalOf(bought, TODAY)).toBeNull()
    // An owned thing cannot be the goal.
    expect(bought && withGoal(bought, 'boat').goal).toBeUndefined()
  })

  test('hidden and shown, and who wears it', () => {
    let data = month()
    data = withHidden(data, 'buoy', true)
    expect(data.hidden).toEqual(['buoy'])
    data = withHidden(data, 'buoy', false)
    expect(data.hidden).toBeUndefined()
    data = withWearer(data, 'hat', 'run')
    data = withWearer(data, 'hat', 'read')
    expect(data.wears).toEqual({ hat: 'read' })
  })
})

test('what was bought and placed survives a reload, and a malformed part is dropped alone', ({
  isMobile,
}) => {
  test.skip(isMobile, 'pure data')
  const raw = {
    ...month(),
    version: 8,
    bought: [{ item: 'buoy', date: TODAY, price: 150 }, { item: 'boat' }, 'nonsense'],
    goal: 7,
    hidden: ['buoy', 'buoy', 3],
    wears: { hat: 'run', scarf: 4 },
    placement: { buoy: 'sea-2', boat: null },
  }
  const data = migrate(JSON.parse(JSON.stringify(raw)) as unknown)
  expect(data.version).toBe(8)
  expect(data.bought).toEqual([{ item: 'buoy', date: TODAY, price: 150 }])
  expect(data.goal).toBeUndefined()
  expect(data.hidden).toEqual(['buoy'])
  expect(data.wears).toEqual({ hat: 'run' })
  expect(data.placement).toEqual({ buoy: 'sea-2' })
  expect(Object.keys(data.days)).toHaveLength(30)
})
