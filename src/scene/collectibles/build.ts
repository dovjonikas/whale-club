import type { Line } from '../../store/derive'
import type { World } from '../../store/types'

export type Motion = 'none' | 'drift' | 'swim' | 'sway' | 'twinkle' | 'sweep'

export interface Collectible {
  id: string
  world: World
  line: Line
  days: number
  name: string
  /** One short line for the Collection sheet. */
  hint: string
  /** Where it sits in the scene, as fractions of width and height. */
  x: number
  y: number
  /** Width in px on a 390px-wide phone; scaled with the viewport. */
  size: number
  motion: Motion
  /** Only out after dark (21:00 to 05:00 on the local clock). */
  night?: boolean
  draw: () => string
}

export const sea = (
  line: Line,
  days: number,
  id: string,
  name: string,
  hint: string,
  x: number,
  y: number,
  size: number,
  motion: Motion,
  draw: () => string,
  night?: boolean,
): Collectible => ({
  id,
  world: 'sea',
  line,
  days,
  name,
  hint,
  x,
  y,
  size,
  motion,
  draw,
  ...(night ? { night } : {}),
})

export const sky = (
  line: Line,
  days: number,
  id: string,
  name: string,
  hint: string,
  x: number,
  y: number,
  size: number,
  motion: Motion,
  draw: () => string,
): Collectible => ({ id, world: 'sky', line, days, name, hint, x, y, size, motion, draw })

export const garden = (
  line: Line,
  days: number,
  id: string,
  name: string,
  hint: string,
  x: number,
  size: number,
  motion: Motion,
  draw: () => string,
  night?: boolean,
): Collectible => ({
  id,
  world: 'garden',
  line,
  days,
  name,
  hint,
  x,
  y: 0.592,
  size,
  motion,
  draw,
  ...(night ? { night } : {}),
})
