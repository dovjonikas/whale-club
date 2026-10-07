import { expect, test } from '@playwright/test'
import { arrangementOf, shownCollectibles } from '../../src/app/sceneData'
import { ATMOSPHERE, COMPANIONS } from '../../src/scene/collectibles'
import { CHEST, freeSpot, moveTo, placeAll, spotsFor, type Placeable } from '../../src/scene/spots'
import { addDays } from '../../src/store/dates'
import { emptyData, EVERY_DAY, type AppData } from '../../src/store/types'

/**
 * Places: every find and dock thing stands in a place of its own world or
 * waits in the chest. Pure data, so one device is enough.
 */
test.skip(({ isMobile }) => isMobile, 'pure data')

const NONE = new Set<string>()
const sea = (n: number): Placeable[] =>
  Array.from({ length: n }, (_, i) => ({ id: `fish-${String(i)}`, world: 'sea' as const }))

test('each world has its places: the shore 6, the sea 8, the sky 8', () => {
  const spots = spotsFor(NONE)
  const count = (world: string) => spots.filter((s) => s.world === world).length
  expect([count('garden'), count('sea'), count('sky')]).toEqual([6, 8, 8])
  expect(new Set(spots.map((s) => s.id)).size).toBe(spots.length)
  for (const s of spots) {
    expect(s.x).toBeGreaterThan(0)
    expect(s.x).toBeLessThan(1)
  }
})

test('new things take a free place of their own world by themselves', () => {
  const items: Placeable[] = [
    ...sea(3),
    { id: 'kite', world: 'sky' },
    { id: 'shell', world: 'garden' },
  ]
  const where = placeAll(items, undefined, NONE)
  const spots = new Map(spotsFor(NONE).map((s) => [s.id, s]))
  for (const item of items) expect(spots.get(where.get(item.id) ?? '')?.world).toBe(item.world)
  expect(new Set(where.values()).size).toBe(items.length)
  // The same things always land in the same places.
  expect(placeAll(items, undefined, NONE)).toEqual(where)
})

test('a full world sends the next thing to the chest', () => {
  const where = placeAll(sea(9), undefined, NONE)
  expect([...where.values()].filter((w) => w === CHEST)).toHaveLength(1)
  expect(where.get('fish-8')).toBe(CHEST)
})

test('dragging onto a taken place swaps the two; another world refuses', () => {
  const items = [...sea(2), { id: 'kite', world: 'sky' as const }]
  const where = placeAll(items, undefined, NONE)
  const a = where.get('fish-0') ?? ''
  const b = where.get('fish-1') ?? ''
  const swapped = moveTo(where, items, 'fish-0', b, NONE)
  expect(swapped).toMatchObject({ 'fish-0': b, 'fish-1': a })
  // Records keep it there, and nothing else moves.
  const after = placeAll(items, swapped ?? undefined, NONE)
  expect(after.get('fish-0')).toBe(b)
  expect(after.get('fish-1')).toBe(a)
  expect(after.get('kite')).toBe(where.get('kite'))
  // A sea thing never goes into the sky, by a drag or by an old record.
  expect(moveTo(where, items, 'fish-0', where.get('kite') ?? '', NONE)).toBeNull()
  expect(placeAll(items, { 'fish-0': 'sky-1' }, NONE).get('fish-0')).not.toBe('sky-1')
})

test('put away goes to the chest, put out takes a free place', () => {
  const items = sea(8)
  const where = placeAll(items, undefined, NONE)
  expect(freeSpot(where, 'sea', NONE)).toBeNull()
  const away = moveTo(where, items, 'fish-3', CHEST, NONE)
  const after = placeAll(items, away ?? undefined, NONE)
  expect(after.get('fish-3')).toBe(CHEST)
  const free = freeSpot(after, 'sea', NONE)
  expect(free?.id).toBe(where.get('fish-3'))
  const out = moveTo(after, items, 'fish-3', free?.id ?? '', NONE)
  expect(placeAll(items, out ?? undefined, NONE).get('fish-3')).toBe(free?.id)
})

test('tidy up forgets the records and the places are automatic again', () => {
  const items = sea(4)
  const auto = placeAll(items, undefined, NONE)
  const moved = moveTo(auto, items, 'fish-0', 'sea-8', NONE)
  expect(placeAll(items, moved ?? undefined, NONE)).not.toEqual(auto)
  expect(placeAll(items, {}, NONE)).toEqual(auto)
})

test('an extension adds its places, in its own world', () => {
  expect(spotsFor(new Set(['longer-shore'])).filter((s) => s.world === 'garden')).toHaveLength(10)
  expect(spotsFor(new Set(['reef'])).filter((s) => s.world === 'sea')).toHaveLength(14)
  const island = spotsFor(new Set(['island'])).filter((s) => s.room === 'island')
  expect(island).toHaveLength(6)
  for (const s of island) expect(s.world).toBe('garden')
  // The ninth sea thing, in the chest before the reef, gets a place with it.
  expect(placeAll(sea(9), undefined, new Set(['reef'])).get('fish-8')).not.toBe(CHEST)
})

/** A long-time person: every world and line, two hundred days. */
function longTime(): AppData {
  const data = emptyData()
  const start = '2026-01-01'
  const lines = [
    ['run', 'sea', 'a'],
    ['read', 'sky', 'a'],
    ['draw', 'garden', 'a'],
    ['swim', 'sea', 'b'],
    ['write', 'sky', 'b'],
  ] as const
  data.things = lines.map(([id, world, line], order) => ({
    id,
    name: id,
    icon: 'letter',
    kind: 'tap',
    minutes: 15,
    days: [...EVERY_DAY],
    world,
    line,
    createdAt: start,
    order,
  }))
  for (let i = 0; i < 200; i++)
    data.days[addDays(start, i)] = { done: data.things.map((t) => t.id), minutes: {} }
  data.cracked = Object.fromEntries(data.things.map((t) => [t.id, 180]))
  return data
}

test('a long-time scene: every thing in a place of its world or the chest, never two in one', () => {
  const data = longTime()
  const { things, where, spots } = arrangementOf(data)
  const byId = new Map(spots.map((s) => [s.id, s]))
  const taken = [...where.values()].filter((w) => w !== CHEST)
  expect(new Set(taken).size).toBe(taken.length)
  for (const thing of things) {
    const at = where.get(thing.id)
    expect(at).toBeDefined()
    if (at !== CHEST) expect(byId.get(at ?? '')?.world).toBe(thing.world)
    expect(ATMOSPHERE.has(thing.id)).toBe(false)
    expect(thing.id in COMPANIONS).toBe(false)
  }
  // Two sea lines hold more things than the sea has places: the rest wait in the chest.
  expect(taken.filter((id) => byId.get(id)?.world === 'sea')).toHaveLength(8)
  expect([...where.values()].filter((w) => w === CHEST).length).toBeGreaterThan(0)
  // A companion stands by its host, and goes away with it.
  const shown = shownCollectibles(data)
  const bees = shown.find((s) => s.item.id === 'garden-a-bees')
  const sunflower = shown.find((s) => s.item.id === 'garden-a-sunflower')
  expect(bees && sunflower && bees.at.x - sunflower.at.x).toBeCloseTo(0.04)
  data.placement = { 'garden-a-sunflower': CHEST }
  const without = shownCollectibles(data).map((s) => s.item.id)
  expect(without).not.toContain('garden-a-sunflower')
  expect(without).not.toContain('garden-a-bees')
})
