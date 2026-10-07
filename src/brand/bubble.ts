import { glyph, LETTER } from './glyphs'
import { ICONS, LINE } from './icons'

/**
 * The bubble: every thing's mark (docs/brand/BRAND.md, "The mark").
 *
 * A round glass float in the thing's colour: a dark inside tinted with the
 * colour, a rim of it, a light arc where the glass catches the moon, the
 * thing's cream glyph (or the first letter of its name), and the
 * signature, one tiny bubble rising off the top right. Done, it fills with
 * the colour and the glyph turns dark. A lock-in's rim is its timer ring.
 *
 * Drawn with plain attributes for the state it is drawn in, so it is right
 * on its own (the postcard paints it as an image); in the app the
 * stylesheet animates between the states from `data-done`.
 */

export const CREAM = '#fff4d6'
/** The night inside an empty bubble, before its colour is mixed in. */
export const DEEP = '#06122b'
/** A done glyph: dark enough on all five colours (9.3:1 and up). */
export const INK = '#0a1630'
/** How much of the thing's colour tints an empty bubble's inside. */
const TINT = 0.22

/** The drawing box, in its own units, and the parts placed in it. */
const BOX = 40
const CENTRE = { x: 20, y: 21 }
const R = 16
const RIM = 1.5
const RING_WIDTH = 2.4
export const RING = 2 * Math.PI * R
/** The glyph spans this much of the bubble's diameter. */
const GLYPH_SHARE = 0.62
const SIGN = { x: 35, y: 5.6, r: 2.4 }
/** The three drops the signature breaks into when a thing is done: where each flies, in box units. */
const DROPS = [
  [-4.2, -3.6],
  [3.6, -4.4],
  [0.4, -6.6],
] as const
/** The drops leave one after another, this far apart: a ripple, not a burst. */
const DROP_STAGGER_MS = 30
const HAND = { x: 31.5, y: 31.5, r: 6 }

export interface BubbleThing {
  icon: string
  name: string
  color: string
  kind: 'tap' | 'lockIn'
}

export interface BubbleState {
  done?: boolean
  /** A lock-in's part seen today, 0 to 1. */
  progress?: number
  /** Done without the timer: a small hand on the bubble. */
  manual?: boolean
}

/** A monogram: the first letter of a name, as a capital. */
export function monogram(name: string): string {
  const first = Array.from(name.trim())[0] ?? '·'
  return first.toLocaleUpperCase()
}

/** Two colours mixed, `share` of the second: for the tinted inside of an empty bubble. */
export function mix(base: string, color: string, share: number): string {
  const channels = (hex: string): number[] =>
    [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16))
  const a = channels(base)
  const b = channels(color)
  return `#${a
    .map((v, i) =>
      Math.round(v + ((b[i] ?? v) - v) * share)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

/** The inside of an empty bubble of this colour. */
export function inside(color: string): string {
  return mix(DEEP, color, TINT)
}

/** The thing's mark in one ink: its glyph scaled into the bubble, or its monogram. */
function mark(thing: BubbleThing, ink: string, className: string, opacity: number): string {
  const found = thing.icon === LETTER ? undefined : glyph(thing.icon)
  if (!found) {
    return `<text class="${className}" x="${String(CENTRE.x)}" y="${String(CENTRE.y)}" fill="${ink}" opacity="${String(opacity)}" font-family="'Atkinson Hyperlegible', system-ui, sans-serif" font-weight="700" font-size="${String(R * 1.05)}" text-anchor="middle" dominant-baseline="central">${monogram(thing.name)}</text>`
  }
  const side = 2 * R * GLYPH_SHARE
  const scale = side / 24
  const x = CENTRE.x - side / 2
  const y = CENTRE.y - side / 2
  return `<g class="${className}" opacity="${String(opacity)}" color="${ink}" stroke="currentColor" fill="none" stroke-width="${String(LINE)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(4)})">${found.svg}</g>`
}

/**
 * The bubble as inline SVG. `label` gives it an accessible name where it
 * stands alone; beside a name it is decorative.
 */
export function bubbleSvg(
  thing: BubbleThing,
  state: BubbleState = {},
  options: { className?: string; label?: string } = {},
): string {
  const done = state.done === true
  const lockIn = thing.kind === 'lockIn'
  const progress = done ? 1 : Math.min(1, Math.max(0, state.progress ?? 0))
  const a11y = options.label
    ? `role="img" aria-label="${options.label.replace(/"/g, '&quot;')}"`
    : 'aria-hidden="true" focusable="false"'
  const { x, y } = CENTRE
  const rim = lockIn
    ? `<circle class="bubble-track" cx="${String(x)}" cy="${String(y)}" r="${String(R)}" fill="none" stroke="${thing.color}" stroke-opacity="0.32" stroke-width="${String(RING_WIDTH)}"/>
       <circle class="bubble-progress" cx="${String(x)}" cy="${String(y)}" r="${String(R)}" fill="none" stroke="${thing.color}" stroke-width="${String(RING_WIDTH)}" stroke-linecap="round" stroke-dasharray="${RING.toFixed(2)}" stroke-dashoffset="${(RING * (1 - progress)).toFixed(2)}" transform="rotate(-90 ${String(x)} ${String(y)})"/>`
    : `<circle class="bubble-rim" cx="${String(x)}" cy="${String(y)}" r="${String(R)}" fill="none" stroke="${thing.color}" stroke-width="${String(RIM)}"/>`
  const drops = DROPS.map(
    ([dx, dy], i) =>
      `<circle class="bubble-drop" cx="${String(SIGN.x)}" cy="${String(SIGN.y)}" r="0.9" fill="${CREAM}" opacity="0" style="--dx:${String(dx)}px;--dy:${String(dy)}px;--d:${String(i * DROP_STAGGER_MS)}ms"/>`,
  ).join('')
  const handScale = (HAND.r * 1.5) / 24
  return `<svg class="${options.className ?? 'bubble'}" viewBox="0 0 ${String(BOX)} ${String(BOX)}" data-kind="${thing.kind}" data-done="${String(done)}" data-manual="${String(state.manual === true)}" ${a11y}>
    <circle class="bubble-inside" cx="${String(x)}" cy="${String(y)}" r="${String(R)}" fill="${inside(thing.color)}"/>
    <circle class="bubble-fill" cx="${String(x)}" cy="${String(y)}" r="${String(R)}" fill="${thing.color}" opacity="${done ? '1' : '0'}"/>
    ${rim}
    <path class="bubble-light" d="M ${String(x - R * 0.72)} ${String(y - R * 0.18)} A ${String(R * 0.74)} ${String(R * 0.74)} 0 0 1 ${String(x - R * 0.2)} ${String(y - R * 0.7)}" fill="none" stroke="${CREAM}" stroke-opacity="0.55" stroke-width="1.6" stroke-linecap="round"/>
    ${mark(thing, CREAM, 'bubble-mark bubble-mark-light', done ? 0 : 1)}
    ${mark(thing, INK, 'bubble-mark bubble-mark-dark', done ? 1 : 0)}
    <circle class="bubble-sign" cx="${String(SIGN.x)}" cy="${String(SIGN.y)}" r="${String(SIGN.r)}" fill="none" stroke="${CREAM}" stroke-opacity="0.8" stroke-width="1.2"/>
    ${drops}
    <g class="bubble-hand" opacity="${state.manual === true ? '1' : '0'}">
      <circle cx="${String(HAND.x)}" cy="${String(HAND.y)}" r="${String(HAND.r)}" fill="${CREAM}"/>
      <g transform="translate(${(HAND.x - HAND.r * 0.75).toFixed(2)} ${(HAND.y - HAND.r * 0.75).toFixed(2)}) scale(${handScale.toFixed(4)})" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS.hand}</g>
    </g>
  </svg>`
}
