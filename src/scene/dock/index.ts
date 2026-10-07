import type { Collectible, Motion } from '../collectibles'
import * as art from './art'

/**
 * The dock: a small pier on the shore where krill buys looks, never
 * advantages. Only things to see, at fixed prices: no chance, no boxes, no
 * timers, no "limited". Four tiers, so there is always something close and
 * something far (docs/ECONOMY.md):
 *
 * - small, 150 to 400: a few days;
 * - middling, 800 to 2,000: a week or three;
 * - large, 3,000 to 6,000: a season;
 * - legendary, 10,000 to 15,000: the long goals.
 *
 * Kinds:
 * - "place": stands in a spot of its world, like a find, and can be arranged;
 * - "wear": a creature wears it; buying asks who;
 * - "scene": changes the whole scene (aurora, a glowing tide);
 * - "room": an extension that adds spots (a longer shore, a reef, an island).
 *
 * The red jacket is never sold: it stays a find, earned at 90 days.
 *
 * Names and lines here are placeholders for the author's voice, like the
 * finds' (TODO-VOICE).
 */
export type Tier = 'small' | 'middling' | 'large' | 'legendary'
export type DockKind = 'place' | 'wear' | 'scene' | 'room'
/** The worlds a placed thing can stand in: the shore is the garden's sand. */
export type PlaceWorld = 'sea' | 'sky' | 'garden'

export interface DockItem {
  id: string
  /** Without an article, so it reads in a line: "1,200 to the lighthouse". */
  name: string
  /** One line in the dock: what it is or does. */
  line: string
  tier: Tier
  price: number
  kind: DockKind
  /** For "place": the world it stands in, its size on a 390 px phone, and how it moves. */
  world?: PlaceWorld
  size?: number
  motion?: Motion
  draw: () => string
}

const place = (
  id: string,
  name: string,
  line: string,
  tier: Tier,
  price: number,
  world: PlaceWorld,
  size: number,
  motion: Motion,
  draw: () => string,
): DockItem => ({ id, name, line, tier, price, kind: 'place', world, size, motion, draw })

const other = (
  id: string,
  name: string,
  line: string,
  tier: Tier,
  price: number,
  kind: Exclude<DockKind, 'place'>,
  draw: () => string,
): DockItem => ({ id, name, line, tier, price, kind, draw })

export const DOCK: readonly DockItem[] = [
  // small
  place('buoy', 'buoy', 'with a light on top', 'small', 150, 'sea', 34, 'sway', art.buoy),
  place('shells', 'shells', 'two, on the sand', 'small', 150, 'garden', 34, 'none', art.shells),
  place(
    'starfish',
    'starfish',
    'resting on the shore',
    'small',
    160,
    'garden',
    34,
    'none',
    art.starfish,
  ),
  place(
    'paper-boat',
    'paper boat',
    'folded, afloat',
    'small',
    180,
    'sea',
    38,
    'sway',
    art.paperBoat,
  ),
  place(
    'bottle',
    'bottle with a letter',
    'nobody knows from whom',
    'small',
    220,
    'sea',
    40,
    'sway',
    art.bottle,
  ),
  place('kite', 'kite', 'on a long string', 'small', 250, 'sky', 40, 'drift', art.kite),
  place(
    'sky-lantern',
    'paper lantern',
    'rising, slowly',
    'small',
    280,
    'sky',
    34,
    'drift',
    art.skyLantern,
  ),
  place(
    'sandcastle',
    'sandcastle',
    'with a flag',
    'small',
    300,
    'garden',
    46,
    'none',
    art.sandcastle,
  ),
  other('hat', 'hat', 'for one of yours', 'small', 350, 'wear', art.hat),
  other('scarf', 'scarf', 'for one of yours', 'small', 400, 'wear', art.scarf),
  // middling
  other('glasses', 'round glasses', 'for one of yours', 'middling', 800, 'wear', art.glasses),
  place('birds', 'flock of birds', 'passing over', 'middling', 900, 'sky', 48, 'drift', art.birds),
  other(
    'dock-lanterns',
    'dock lanterns',
    'lit when it gets dark',
    'middling',
    1000,
    'scene',
    art.dockLanterns,
  ),
  place(
    'jelly-lamp',
    'jellyfish lamp',
    'a soft light under water',
    'middling',
    1100,
    'sea',
    42,
    'drift',
    art.jellyLamp,
  ),
  place('boat', 'little boat', 'with a sail', 'middling', 1200, 'sea', 54, 'sway', art.boat),
  place(
    'hammock',
    'hammock',
    'between two sunflowers',
    'middling',
    1400,
    'garden',
    60,
    'none',
    art.hammock,
  ),
  other(
    'longer-shore',
    'longer shore',
    'four more places on the sand',
    'middling',
    1500,
    'room',
    art.longerShore,
  ),
  place(
    'telescope',
    'telescope',
    'pointed at the moon',
    'middling',
    1600,
    'garden',
    44,
    'none',
    art.telescope,
  ),
  place(
    'moon-swing',
    'moon swing',
    'hanging from a small moon',
    'middling',
    1800,
    'sky',
    48,
    'sway',
    art.moonSwing,
  ),
  other(
    'friday-stars',
    'friday stars',
    'falling stars every friday night',
    'middling',
    2000,
    'scene',
    art.fridayStars,
  ),
  // large
  other('longer-dock', 'longer dock', 'out over the water', 'large', 3000, 'scene', art.longerDock),
  other('reef', 'reef', 'six more places, deeper down', 'large', 3000, 'room', art.reef),
  other(
    'glowing-tide',
    'glowing tide',
    'the waves light up',
    'large',
    3000,
    'scene',
    art.glowingTide,
  ),
  place(
    'balloon',
    'hot air balloon',
    'drifting over',
    'large',
    3200,
    'sky',
    56,
    'drift',
    art.balloon,
  ),
  other(
    'second-whale',
    'small whale',
    'that keeps yours company',
    'large',
    3500,
    'scene',
    art.secondWhale,
  ),
  other('aurora', 'aurora', 'green and violet, after dark', 'large', 4000, 'scene', art.aurora),
  place(
    'lighthouse',
    'lighthouse',
    'its light turning',
    'large',
    4500,
    'garden',
    70,
    'none',
    art.lighthouse,
  ),
  other(
    'island',
    'island on the whale',
    'six places on its back',
    'large',
    6000,
    'room',
    art.island,
  ),
  // legendary
  other(
    'glowing-cove',
    'glowing cove',
    'every night',
    'legendary',
    10_000,
    'scene',
    art.glowingCove,
  ),
  other(
    'sky-whale',
    'sky whale',
    'crosses it once a night',
    'legendary',
    12_000,
    'scene',
    art.skyWhale,
  ),
]

const BY_ID = new Map(DOCK.map((item) => [item.id, item]))

export function dockItem(id: string): DockItem | undefined {
  return BY_ID.get(id)
}

export function dockSvg(item: DockItem): string {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${item.draw()}</svg>`
}

/**
 * A placed dock thing in the finds' shape, so the scene, the arrangement
 * and the postcard draw both the same way. Null for the other kinds.
 */
export function dockCollectible(item: DockItem): Collectible | null {
  if (item.kind !== 'place' || !item.world || item.size === undefined || !item.motion) return null
  return {
    id: item.id,
    world: item.world,
    line: 'a',
    days: 0,
    name: item.name,
    hint: item.line,
    x: 0,
    y: 0,
    size: item.size,
    motion: item.motion,
    draw: item.draw,
  }
}
