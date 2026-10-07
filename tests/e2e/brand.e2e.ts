import { expect, test } from '@playwright/test'
import { INK, CREAM, inside, monogram } from '../../src/brand/bubble'
import { COMMON, GLYPHS, GROUPS, LETTER } from '../../src/brand/glyphs'
import { fold, glyphFor } from '../../src/brand/match'
import { dayBubble } from '../../src/app/thingMark'
import { LANTERN_COLORS } from '../../src/app/sceneData'
import { migrate } from '../../src/store/migrate'

/**
 * The brand's own sign language: the glyphs, the names they are picked
 * from, the monogram when nothing fits, and the contrast of a glyph in its
 * bubble. Pure functions, so these run without a page.
 */

test('a name picks its glyph, in English', () => {
  const cases: [string, string][] = [
    ['run', 'run'],
    ['morning run', 'run'],
    ['violin', 'violin'],
    ['practice violin', 'violin'],
    ['read 2 pages', 'read'],
    ['a glass of water', 'water'],
    ['10 push-ups', 'pushups'],
    ['walk the dog', 'dog'],
    ['water the plants', 'plants'],
    ['cold shower', 'shower'],
    ['call mom', 'call'],
    ['study spanish', 'language'],
    ['write in my journal', 'journal'],
    ['calligraphy', 'write'],
    ['no phone after 10', 'nophone'],
    ['10k steps', 'steps'],
    ['cook pasta', 'cook'],
  ]
  for (const [name, glyph] of cases) expect(glyphFor(name), name).toBe(glyph)
})

test('a name picks its glyph, in Lithuanian, with or without its letters', () => {
  const cases: [string, string][] = [
    ['smuikas', 'violin'],
    ['groti smuiku', 'violin'],
    ['bėgimas', 'run'],
    ['begimas', 'run'],
    ['bėgioti', 'run'],
    ['skaityti knygą', 'read'],
    ['gerti vandenį', 'water'],
    ['anglų kalba', 'language'],
    ['vedžioti šunį', 'dog'],
    ['paskambinti mamai', 'call'],
    ['meditacija', 'meditate'],
    ['šaltas dušas', 'shower'],
    ['tempimo pratimai', 'stretch'],
    ['laistyti gėles', 'plants'],
    ['taupyti pinigus', 'save'],
    ['dienoraštis', 'journal'],
  ]
  for (const [name, glyph] of cases) expect(glyphFor(name), name).toBe(glyph)
})

test('short words never pass for a stem, and nothing fits makes a monogram', () => {
  // "su" (with) and "mintis" (a thought) must not pick the dog or the bike.
  expect(glyphFor('su draugais')).toBe('friend')
  expect(glyphFor('mintis')).toBe(LETTER)
  expect(glyphFor('kintsugi')).toBe(LETTER)
  expect(glyphFor('')).toBe(LETTER)
  expect(monogram('kintsugi')).toBe('K')
  expect(monogram('  ąžuolas')).toBe('Ą')
  expect(monogram('')).toBe('·')
})

test('folding drops case, diacritics and punctuation', () => {
  expect(fold('Bėgimas! Ą Č Ę Ė Į Š Ų Ū Ž')).toBe('begimas a c e e i s u u z')
  expect(fold('10 push-ups')).toBe('10 push ups')
})

test('every glyph is whole: an id, a group, a label, words, and a drawing on the grid', () => {
  const ids = new Set<string>()
  for (const g of GLYPHS) {
    expect(ids.has(g.id), g.id).toBe(false)
    ids.add(g.id)
    expect(
      GROUPS.some((group) => group.id === g.group),
      g.id,
    ).toBe(true)
    expect(g.label.length, g.id).toBeGreaterThan(0)
    expect(g.words.length, g.id).toBeGreaterThan(2)
    expect(g.svg, g.id).toMatch(/^<(path|circle|ellipse)/)
    // Every coordinate stays on the 24 grid.
    for (const n of g.svg.match(/-?\d+(\.\d+)?/g) ?? [])
      expect(Math.abs(Number(n)), g.id).toBeLessThanOrEqual(24)
  }
  expect(GLYPHS.length).toBeGreaterThanOrEqual(48)
  for (const id of COMMON) expect(ids.has(id), id).toBe(true)
  expect(COMMON).toHaveLength(12)
})

/** WCAG relative luminance and contrast ratio, from hex. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0)
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05)
}

test('a glyph stands out in its bubble at 3:1 or more, empty and done, in every colour', () => {
  for (const color of LANTERN_COLORS) {
    expect(contrast(CREAM, inside(color)), `cream on ${color} tint`).toBeGreaterThanOrEqual(3)
    expect(contrast(INK, color), `ink on ${color}`).toBeGreaterThanOrEqual(3)
  }
})

test('things from before 0.12 trade their emoji for its glyph, or their name for one, or a monogram', () => {
  const thing = (id: string, name: string, emoji: string, order: number) => ({
    id,
    name,
    emoji,
    kind: 'tap',
    line: 'a',
    minutes: 15,
    world: 'sea',
    createdAt: '2026-09-01',
    order,
  })
  const data = migrate({
    version: 6,
    things: [
      thing('a', 'practice', '🎻', 0),
      thing('b', 'smuikas', '•', 1),
      thing('c', 'kintsugi', '🏺', 2),
      thing('d', 'x', '🏃‍♀️', 3),
      thing('e', 'run', '🎹', 4),
    ],
    days: {},
    cracked: {},
    settings: { sound: true },
  })
  expect(data.version).toBe(7)
  // What a person chose (the emoji) wins over a guess at their words.
  expect(data.things.map((t) => t.icon)).toEqual(['violin', 'violin', LETTER, 'run', 'piano'])
  // The emoji is kept for the record.
  expect(data.things[0]?.emoji).toBe('🎻')

  // A glyph already chosen is kept; one that does not exist falls back to the name.
  const later = migrate({
    version: 7,
    things: [
      { ...thing('a', 'read', '•', 0), icon: 'violin' },
      { ...thing('b', 'read', '•', 1), icon: 'no-such-glyph' },
    ],
    days: {},
    cracked: {},
    settings: { sound: true },
  })
  expect(later.things.map((t) => t.icon)).toEqual(['violin', 'read'])
})

test('the postcard shows every thing in its bubble, filled if it was done that day', () => {
  const data = migrate({
    version: 7,
    things: [
      {
        id: 'a',
        name: 'run',
        icon: 'run',
        kind: 'tap',
        line: 'a',
        minutes: 15,
        world: 'sea',
        createdAt: '2026-09-01',
        order: 0,
      },
      {
        id: 'b',
        name: 'violin',
        icon: 'violin',
        kind: 'lockIn',
        line: 'a',
        minutes: 30,
        world: 'sky',
        createdAt: '2026-09-01',
        order: 1,
      },
    ],
    days: { '2026-10-08': { done: ['a'], minutes: { b: 15 } } },
    cracked: {},
    settings: { sound: true },
  })
  const [run, violin] = data.things
  if (!run || !violin) throw new Error('things missing')
  const done = dayBubble(data, run, '2026-10-08')
  expect(done).toContain('data-done="true"')
  expect(done).toContain(`fill="${LANTERN_COLORS[0]}"`)
  const half = dayBubble(data, violin, '2026-10-08')
  expect(half).toContain('data-done="false"')
  expect(half).toContain('bubble-progress')
  // Half of the ring drawn: the dash offset is half its length.
  const offset = Number(/bubble-progress[^>]*stroke-dashoffset="([\d.]+)"/.exec(half)?.[1])
  const ring = Number(/bubble-progress[^>]*stroke-dasharray="([\d.]+)"/.exec(half)?.[1])
  expect(offset / ring).toBeCloseTo(0.5, 2)
})
