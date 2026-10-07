import type { Line, Stage } from '../store/derive'
import type { World } from '../store/types'

/**
 * The creatures: one per thing, drawn as inline SVG in a 64x64 box. Each
 * world has two lines of four stages (docs/COLLECTIBLES.md), and every
 * stage has a face, because a speck with eyes is already somebody.
 *
 * Colours come from the CSS tokens so the creature matches its world
 * wherever it is drawn: the card, the timer screen, the share image.
 */
/**
 * What a lock-in starts from, before the creature has a shape: an egg in
 * the sea, a spark in the sky, a seed in the garden. It already has eyes.
 */
export function beginningSvg(world: World): string {
  const body =
    world === 'sea'
      ? `${glow('var(--glow)', 16)}<ellipse cx="32" cy="34" rx="11" ry="13" fill="#d8f6f1"/><ellipse cx="28" cy="29" rx="3" ry="4" fill="#fff" opacity="0.7"/>${face(32, 35, 0.55, 0)}`
      : world === 'sky'
        ? `${glow('var(--star)', 16)}<path d="M32 18 l 4 10 l 10 4 l -10 4 l -4 10 l -4 -10 l -10 -4 l 10 -4 z" fill="var(--star-pale)"/>${face(32, 32, 0.5, 0)}`
        : `${glow('var(--sun)', 14)}<ellipse cx="32" cy="36" rx="8" ry="10" fill="#a8743f" transform="rotate(-18 32 36)"/><path d="M30 28 q 2 -4 5 -5" stroke="#6b4a2b" stroke-width="1.4" fill="none"/>${face(32, 37, 0.5, 0)}`
  return `<svg viewBox="0 0 64 64" aria-hidden="true">${body}</svg>`
}

export function creatureSvg(world: World, line: Line, stage: Stage): string {
  const body = DRAWINGS[world][line][stage]
  return `<svg viewBox="0 0 64 64" aria-hidden="true">${body}</svg>`
}

/** Two eyes and a mouth. `mood` 1 is a smile, 0 is flat, -1 is a small o. */
function face(cx: number, cy: number, scale: number, mood = 1, ink = '#061020'): string {
  const eye = 1.8 * scale
  const gap = 5 * scale
  const mouth =
    mood > 0
      ? `<path d="M${String(cx - 3 * scale)} ${String(cy + 4 * scale)} q ${String(3 * scale)} ${String(3 * scale)} ${String(6 * scale)} 0" stroke="${ink}" stroke-width="${String(1.2 * scale)}" fill="none" stroke-linecap="round"/>`
      : mood < 0
        ? `<circle cx="${String(cx)}" cy="${String(cy + 5 * scale)}" r="${String(1.5 * scale)}" fill="${ink}"/>`
        : `<path d="M${String(cx - 2.5 * scale)} ${String(cy + 4.5 * scale)} h ${String(5 * scale)}" stroke="${ink}" stroke-width="${String(1.2 * scale)}" stroke-linecap="round"/>`
  // The eyes are one group, so a blink can close them both.
  return `<g class="eyes"><circle cx="${String(cx - gap / 2)}" cy="${String(cy)}" r="${String(eye)}" fill="${ink}"/>
  <circle cx="${String(cx + gap / 2)}" cy="${String(cy)}" r="${String(eye)}" fill="${ink}"/>
  <circle cx="${String(cx - gap / 2 + 0.6 * scale)}" cy="${String(cy - 0.6 * scale)}" r="${String(0.6 * scale)}" fill="#fff"/>
  <circle cx="${String(cx + gap / 2 + 0.6 * scale)}" cy="${String(cy - 0.6 * scale)}" r="${String(0.6 * scale)}" fill="#fff"/></g>
  ${mouth}`
}

const glow = (color: string, r: number, cx = 32, cy = 32) =>
  `<circle cx="${String(cx)}" cy="${String(cy)}" r="${String(r)}" fill="${color}" opacity="0.18"/>`

const SEA_A: Record<Stage, string> = {
  0: `${glow('var(--glow)', 14)}<circle cx="32" cy="34" r="6" fill="var(--glow)"/>${face(32, 33, 0.5, 0)}`,
  1: `${glow('var(--glow)', 18)}<path d="M14 34 l 8 -6 v 12 z" fill="var(--teal)"/><ellipse cx="34" cy="34" rx="14" ry="9" fill="var(--teal)"/><ellipse cx="38" cy="32" rx="9" ry="5" fill="var(--glow)" opacity="0.5"/>${face(40, 33, 0.8)}`,
  2: `${glow('var(--glow)', 22)}<path d="M8 34 l 11 -9 v 18 z" fill="var(--teal)"/><ellipse cx="34" cy="34" rx="20" ry="13" fill="var(--teal)"/><path d="M30 22 q 6 -8 12 0" fill="var(--glow)" opacity="0.6"/><ellipse cx="38" cy="32" rx="12" ry="6" fill="var(--glow)" opacity="0.4"/>${face(43, 32, 1)}`,
  3: `${glow('var(--glow)', 28)}<path d="M6 30 l 9 -8 l 2 8 l -2 8 z" fill="#1d6f8a"/><path d="M12 32 C 12 18, 56 16, 58 30 C 58 42, 40 48, 22 44 C 14 42, 12 38, 12 32 Z" fill="#1d6f8a"/><path d="M22 44 C 36 50, 54 46, 58 32 C 52 42, 36 46, 22 44 Z" fill="#9ff7ee" opacity="0.5"/><path d="M44 14 q -2 -8 2 -11 M44 14 q 2 -8 6 -9" stroke="var(--glow)" stroke-width="1.6" fill="none" stroke-linecap="round"/>${face(47, 28, 1.1)}`,
}

const SEA_B: Record<Stage, string> = {
  0: `${glow('var(--glow)', 14)}<circle cx="32" cy="34" r="8" fill="none" stroke="var(--glow)" stroke-width="1.5"/><circle cx="28" cy="30" r="2" fill="#fff" opacity="0.7"/>${face(32, 34, 0.5, 0)}`,
  1: `${glow('var(--glow)', 18)}<path d="M34 16 c 10 0 12 10 6 14 c 6 6 2 18 -6 18 c -4 0 -4 -4 -2 -6 c -6 -2 -8 -10 -2 -14 c -4 -4 -2 -12 4 -12 z" fill="var(--teal)"/><path d="M30 24 q -6 2 -8 8" stroke="var(--glow)" stroke-width="2" fill="none" stroke-linecap="round"/>${face(36, 22, 0.7)}`,
  2: `${glow('var(--glow)', 22)}<ellipse cx="32" cy="36" rx="18" ry="12" fill="#2b7a5b"/><path d="M18 36 q 14 -12 28 0 q -14 10 -28 0 z" fill="var(--leaf)" opacity="0.5"/><circle cx="50" cy="34" r="7" fill="#3fa37a"/><ellipse cx="16" cy="42" rx="6" ry="3" fill="#3fa37a"/><ellipse cx="46" cy="46" rx="6" ry="3" fill="#3fa37a"/>${face(51, 33, 0.8)}`,
  3: `${glow('var(--glow)', 28)}<path d="M6 32 l 10 -8 l 1 16 z" fill="#0b0f1a"/><path d="M14 32 C 14 18, 56 16, 58 30 C 58 42, 40 48, 22 44 C 14 42, 14 38, 14 32 Z" fill="#0b0f1a"/><path d="M30 22 l 4 -12 l 6 12 z" fill="#0b0f1a"/><path d="M22 44 C 36 50, 54 46, 58 32 C 52 42, 36 46, 22 44 Z" fill="#fff" opacity="0.85"/><ellipse cx="48" cy="26" rx="4" ry="2.5" fill="#fff"/>${face(46, 30, 1, 1, '#fff')}`,
}

const SKY_A: Record<Stage, string> = {
  0: `${glow('var(--star)', 12)}<path d="M32 24 l 2 6 l 6 2 l -6 2 l -2 6 l -2 -6 l -6 -2 l 6 -2 z" fill="var(--star)"/>${face(32, 32, 0.45, 0)}`,
  1: `${glow('var(--star)', 18)}<path d="M32 14 l 5 12 l 13 1 l -10 8 l 4 13 l -12 -7 l -12 7 l 4 -13 l -10 -8 l 13 -1 z" fill="var(--star)"/>${face(32, 32, 0.8)}`,
  2: `${glow('var(--star)', 24)}<g stroke="var(--star)" stroke-width="1.4" stroke-linecap="round" opacity="0.7"><path d="M32 4 v 6 M32 54 v 6 M4 32 h 6 M54 32 h 6 M12 12 l 4 4 M48 48 l 4 4 M52 12 l -4 4 M12 52 l 4 -4"/></g><path d="M32 12 l 6 14 l 15 1 l -12 10 l 5 15 l -14 -8 l -14 8 l 5 -15 l -12 -10 l 15 -1 z" fill="var(--star)"/>${face(32, 32, 1)}`,
  3: `${glow('var(--star)', 30)}<circle cx="32" cy="32" r="22" fill="var(--star-pale)"/><circle cx="32" cy="32" r="22" fill="var(--star)" opacity="0.5"/><circle cx="22" cy="24" r="3" fill="var(--star)" opacity="0.6"/><circle cx="40" cy="42" r="4" fill="var(--star)" opacity="0.5"/>${face(32, 32, 1.2)}`,
}

const SKY_B: Record<Stage, string> = {
  0: `${glow('var(--star)', 12)}<circle cx="26" cy="36" r="2" fill="var(--star-pale)"/><circle cx="34" cy="30" r="2.5" fill="var(--star-pale)"/><circle cx="40" cy="38" r="1.8" fill="var(--star-pale)"/>${face(34, 30, 0.4, 0)}`,
  1: `${glow('var(--star)', 18)}<path d="M18 40 a 8 8 0 0 1 4 -15 a 10 10 0 0 1 19 -2 a 8 8 0 0 1 7 17 z" fill="#cfd8e3"/>${face(32, 32, 0.8)}`,
  2: `${glow('var(--star)', 22)}<path d="M12 44 a 10 10 0 0 1 5 -19 a 13 13 0 0 1 25 -3 a 10 10 0 0 1 10 22 z" fill="#dde5ee"/>${face(32, 32, 1)}`,
  3: `${glow('var(--star)', 30)}<path d="M8 46 a 12 12 0 0 1 6 -22 a 15 15 0 0 1 29 -4 a 12 12 0 0 1 13 26 z" fill="#e8eef5"/><path d="M28 46 l -4 10 l 7 -4 l -2 8" stroke="var(--star)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>${face(32, 30, 1.2)}`,
}

const GARDEN_A: Record<Stage, string> = {
  0: `${glow('var(--sun)', 12)}<ellipse cx="32" cy="36" rx="7" ry="5" fill="#8b5e34"/>${face(32, 35, 0.45, 0)}`,
  1: `${glow('var(--sun)', 16)}<path d="M32 48 v -16" stroke="var(--leaf)" stroke-width="2.5" stroke-linecap="round"/><path d="M32 38 q -10 -6 -8 -14 q 10 2 8 14 z M32 34 q 10 -6 8 -14 q -10 2 -8 14 z" fill="var(--leaf)"/>${face(32, 44, 0.6)}`,
  2: `${glow('var(--sun)', 20)}<path d="M32 52 v -22" stroke="var(--leaf)" stroke-width="3" stroke-linecap="round"/><path d="M32 42 q -10 -4 -10 -12 q 8 0 10 12 z" fill="var(--leaf)"/><ellipse cx="32" cy="24" rx="8" ry="11" fill="var(--sun)"/><path d="M32 13 q 8 6 0 22 q -8 -16 0 -22 z" fill="var(--leaf)" opacity="0.7"/>${face(32, 26, 0.7)}`,
  3: `${glow('var(--sun)', 28)}<path d="M32 60 v -22" stroke="var(--leaf)" stroke-width="3" stroke-linecap="round"/><path d="M32 50 q -12 -4 -12 -14 q 10 0 12 14 z" fill="var(--leaf)"/>${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => `<ellipse cx="32" cy="12" rx="4.5" ry="10" fill="var(--sun)" transform="rotate(${String(a)} 32 28)"/>`).join('')}<circle cx="32" cy="28" r="10" fill="#5a3a1e"/>${face(32, 27, 0.9, 1, '#f2c94c')}`,
}

const GARDEN_B: Record<Stage, string> = {
  0: `${glow('var(--sun)', 12)}<path d="M24 40 q 2 -10 10 -9 q 8 1 7 9 z" fill="#8f98a3"/>${face(33, 36, 0.45, 0)}`,
  1: `${glow('var(--sun)', 16)}<path d="M30 48 v -12 h 4 v 12 z" fill="#e8dcc8"/><path d="M18 36 q 14 -22 28 0 z" fill="var(--jacket)" opacity="0.9"/><circle cx="26" cy="30" r="2" fill="#fff" opacity="0.8"/><circle cx="36" cy="27" r="2.5" fill="#fff" opacity="0.8"/>${face(32, 42, 0.6)}`,
  2: `${glow('var(--sun)', 20)}<path d="M32 54 v -30" stroke="var(--leaf)" stroke-width="2.5" stroke-linecap="round"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M32 ${String(48 - i * 6)} q -${String(10 - i)} -4 -${String(12 - i)} -2 M32 ${String(46 - i * 6)} q ${String(10 - i)} -4 ${String(12 - i)} -2" stroke="var(--leaf)" stroke-width="2" fill="none" stroke-linecap="round"/>`).join('')}${face(32, 50, 0.6)}`,
  3: `${glow('var(--sun)', 28)}<path d="M30 60 v -18 h 5 v 18 z" fill="#6b4a2b"/><circle cx="32" cy="30" r="17" fill="#3f8f3a"/><circle cx="22" cy="34" r="10" fill="#4fa64a"/><circle cx="43" cy="33" r="11" fill="#4fa64a"/><circle cx="32" cy="22" r="10" fill="#5fbf4a"/>${face(32, 32, 1)}`,
}

const DRAWINGS: Record<World, Record<Line, Record<Stage, string>>> = {
  sea: { a: SEA_A, b: SEA_B },
  sky: { a: SKY_A, b: SKY_B },
  garden: { a: GARDEN_A, b: GARDEN_B },
}
