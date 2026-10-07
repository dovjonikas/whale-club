import { expect, test } from '@playwright/test'
import { INK, CREAM, inside, monogram } from '../../src/brand/bubble'
import { COMMON, GLYPHS, GROUPS, LETTER } from '../../src/brand/glyphs'
import { fold, glyphFor } from '../../src/brand/match'
import { LANTERN_COLORS } from '../../src/app/sceneData'

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
