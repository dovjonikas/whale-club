import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

/**
 * Every pair of colours that carries words, measured from the tokens
 * themselves (src/styles/tokens.css), so a change of colour that would make
 * a line hard to read fails here before anyone squints at it. Reading text
 * needs 4.5:1 (WCAG AA); a day still to come in the log, 3:1.
 */
test.skip(({ isMobile }) => isMobile, 'pure data')

const css = readFileSync('src/styles/tokens.css', 'utf8')
const token = (name: string): string => {
  const found = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1]
  if (!found) throw new Error(`no colour token --${name}`)
  return found
}

type Rgb = readonly [number, number, number]
const rgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]
/** `top` at `alpha` over `under`, as the screen mixes them. */
const over = (top: Rgb, alpha: number, under: Rgb): Rgb =>
  [0, 1, 2].map((i) =>
    Math.round((top[i] ?? 0) * alpha + (under[i] ?? 0) * (1 - alpha)),
  ) as unknown as Rgb
const luminance = (c: Rgb): number => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: Rgb, b: Rgb): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** The sheet's two grounds (sheet.css): its lighter top and its darker body. */
const SHEET_TOP = rgb('#0d2042')
const SHEET = rgb('#081530')
const READ = 4.5

const pairs: [string, Rgb, Rgb, number][] = [
  ['ink on the abyss', rgb(token('ink')), rgb(token('abyss')), READ],
  ['ink on a sheet', rgb(token('ink')), SHEET_TOP, READ],
  ['dim ink on the abyss', rgb(token('ink-dim')), rgb(token('abyss')), READ],
  ['dim ink on a sheet', rgb(token('ink-dim')), SHEET_TOP, READ],
  ['dim ink on the deep', rgb(token('ink-dim')), rgb(token('deep')), READ],
  ['dim ink on the night', rgb(token('ink-dim')), rgb(token('night')), READ],
  ['pale star on a sheet', rgb(token('star-pale')), SHEET_TOP, READ],
  ['glow on a sheet', rgb(token('glow')), SHEET_TOP, READ],
  ['krill on the abyss', rgb(token('krill')), rgb(token('abyss')), READ],
  ['the primary button', rgb(token('abyss')), rgb(token('glow')), READ],
  ['a toast', rgb(token('abyss')), rgb(token('star-pale')), READ],
  ['the danger word', rgb('#ff7a72'), SHEET_TOP, READ],
  ['a pressed chip', rgb(token('star-pale')), over(rgb(token('glow')), 0.16, SHEET_TOP), READ],
  ['a day still to come', over(rgb(token('ink-dim')), 0.65, SHEET), SHEET, 3],
]

for (const [what, fg, bg, least] of pairs) {
  test(`${what}: at least ${String(least)}:1`, () => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(least)
  })
}
