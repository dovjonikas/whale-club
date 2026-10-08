import {
  ATMOSPHERE,
  COLLECTIBLES,
  COMPANIONS,
  collectiblesFor,
  type Collectible,
} from '../scene/collectibles'
import { DOCK, dockCollectible } from '../scene/dock'
import { rarityOf, type Rarity } from '../scene/rarity'
import type { ShownCollectible, Standing } from '../scene/scene'
import { CHEST, placeAll, spotsFor, type Spot, type SpotWorld } from '../scene/spots'
import { rooms } from './dockData'
import { legendaryFor } from '../scene/legendary'
import { reachesOf } from '../store/paths'
import type { LanternSpec } from '../scene/lanterns'
import type { StoneSpec } from '../scene/stones'
import { shortDate, todayKey } from '../store/dates'
import { foundFor, lineFor, reachedOn, totalDone, waitingTiers, starDays } from '../store/derive'
import type { AppData, DateKey, Thing, World } from '../store/types'
import { voice } from '../voice'

/** The bridge from the data to what the scene draws: plain functions of AppData. */

const JACKET_ID = 'sea-a-jacket'

/** A lantern's colour by the thing's place in the row: five things, five lights. */
export const LANTERN_COLORS = ['#ffd98a', '#ff9fb2', '#8ef0e4', '#c8b6ff', '#ffb27a'] as const
/** Sessions this long or longer get the middling lantern, and the large one. */
const LANTERN_MIDDLE_MINUTES = 25
const LANTERN_LARGE_MINUTES = 50

/** The key of the lantern a day's session number `index` leaves. */
export function lanternKey(date: DateKey, index: number): string {
  return `${date}:${String(index)}`
}

/** Every thing that ever was, current and deleted, by id: for colours and names. */
export function everyThing(data: AppData): Map<string, Thing> {
  return new Map([...(data.retired ?? []), ...data.things].map((t) => [t.id, t]))
}

/** The colour of a place in the row: a thing's colour everywhere, by the place it was added at. */
export function colorAt(order: number): string {
  return LANTERN_COLORS[order % LANTERN_COLORS.length] ?? LANTERN_COLORS[0]
}

/** A thing's lantern colour, by its place in the row when it was added. */
export function lanternColor(thing: Thing | undefined): string {
  return colorAt(thing?.order ?? 0)
}

function sizeFor(minutes: number): 0 | 1 | 2 {
  return minutes >= LANTERN_LARGE_MINUTES ? 2 : minutes >= LANTERN_MIDDLE_MINUTES ? 1 : 0
}

/**
 * Every lantern in the cove, oldest first: one per lock-in that ran to its
 * end (bright in one go, soft in parts), and one dim for each day that
 * ended with minutes and no done. A thing deleted since keeps its lanterns;
 * history is not rewritten.
 */
export function lanternsFor(data: AppData, today: DateKey = todayKey()): LanternSpec[] {
  const things = everyThing(data)
  const specs: LanternSpec[] = []
  for (const date of Object.keys(data.days).sort()) {
    const day = data.days[date]
    if (!day) continue
    day.sessions?.forEach((session, index) => {
      specs.push({
        key: lanternKey(date, index),
        date,
        color: lanternColor(things.get(session.thing)),
        size: sizeFor(session.minutes),
        glow: session.left ? 'dim' : (session.parts ?? 1) > 1 ? 'soft' : 'bright',
      })
    })
    // A day over, with minutes the timer saw and the length never reached.
    if (date >= today) continue
    for (const [id, minutes] of Object.entries(day.minutes)) {
      if (minutes <= 0 || day.done.includes(id)) continue
      specs.push({
        key: `${date}:unfinished:${id}`,
        date,
        color: lanternColor(things.get(id)),
        size: sizeFor(minutes),
        glow: 'dim',
      })
    }
  }
  return specs
}

/** Something that stands in a place: a find, or a thing from the dock. */
export interface PlacedThing {
  id: string
  world: SpotWorld
  item: Collectible
  rarity: Rarity
  /** When it was got: the day its find was reached, or the day it was bought. */
  since: DateKey
  /** A find, a dock thing, or earned on a path (rare half way, legendary at the end). */
  from: 'find' | 'dock' | 'path'
  /** A legendary: placed before anything else. */
  first?: boolean
}

/** The whole arrangement: what stands where, the places there are, and the chest. */
export interface Arrangement {
  things: PlacedThing[]
  /** Thing id to place id, or "chest". */
  where: Map<string, string>
  spots: Spot[]
  rooms: Set<string>
}

/** Every find found, by every thing that ever was (a deleted thing's finds stay), with its shine. */
function finds(data: AppData): { item: Collectible; rarity: Rarity; since: DateKey }[] {
  const found: { item: Collectible; rarity: Rarity; since: DateKey }[] = []
  for (const thing of everyThing(data).values()) {
    const ids = new Set(foundFor(data, thing, COLLECTIBLES))
    for (const item of COLLECTIBLES) {
      if (!ids.has(item.id)) continue
      const since = reachedOn(data, thing.id, item.days) ?? thing.createdAt
      found.push({ item, rarity: rarityOf(item.id, reachedOn(data, thing.id, item.days)), since })
    }
  }
  return found
}

/**
 * Everything that stands in a place, in the order it was got: the finds
 * that are things (not the scene's weather, not a companion) and the
 * dock's placed things. Same day, finds first; then the catalogues' order.
 */
export function placedThings(data: AppData): PlacedThing[] {
  const fromFinds: PlacedThing[] = finds(data)
    .filter(({ item }) => !ATMOSPHERE.has(item.id) && !(item.id in COMPANIONS))
    .map(({ item, rarity, since }) => ({
      id: item.id,
      world: item.world,
      item,
      rarity,
      since,
      from: 'find',
    }))
  const fromDock: PlacedThing[] = (data.bought ?? []).flatMap((b) => {
    const entry = DOCK.find((d) => d.id === b.item)
    const item = entry ? dockCollectible(entry) : null
    return item
      ? [
          {
            id: item.id,
            world: item.world,
            item,
            rarity: 'common' as const,
            since: b.date,
            from: 'dock' as const,
          },
        ]
      : []
  })
  const order = (t: PlacedThing): number =>
    t.from === 'find'
      ? COLLECTIBLES.indexOf(t.item)
      : t.from === 'dock'
        ? COLLECTIBLES.length + DOCK.findIndex((d) => d.id === t.id)
        : COLLECTIBLES.length + DOCK.length
  return [...fromFinds, ...fromDock, ...pathFinds(data)].sort(
    (a, b) => a.since.localeCompare(b.since) || order(a) - order(b),
  )
}

/**
 * What the path to a legendary has given: a rare find for each halfway
 * star reached, the legendary for each constellation finished. After the
 * fifth the paths go round again; a legendary already earned is not
 * earned twice.
 */
export function pathFinds(data: AppData): PlacedThing[] {
  const earned = new Map<string, PlacedThing>()
  for (const reach of reachesOf(starDays(data))) {
    const legend = legendaryFor(reach.path)
    if (reach.half && !earned.has(legend.rare.id))
      earned.set(legend.rare.id, {
        id: legend.rare.id,
        world: legend.rare.world,
        item: legend.rare,
        rarity: 'rare',
        since: reach.half,
        from: 'path',
      })
    if (reach.end && !earned.has(legend.find.id))
      earned.set(legend.find.id, {
        id: legend.find.id,
        world: legend.find.world,
        item: legend.find,
        rarity: 'legendary',
        since: reach.end,
        from: 'path',
        first: true,
      })
  }
  return [...earned.values()]
}

export function arrangementOf(data: AppData): Arrangement {
  const owned = rooms(data)
  const things = placedThings(data)
  return {
    things,
    where: placeAll(things, data.placement, owned),
    spots: spotsFor(owned),
    rooms: owned,
  }
}

/**
 * What the scene draws and where: each placed thing at its place (the
 * chest's stay out), a companion beside its host, and the scene's weather
 * where it was drawn.
 */
export function shownCollectibles(data: AppData): ShownCollectible[] {
  const { things, where, spots } = arrangementOf(data)
  const byId = new Map(spots.map((spot) => [spot.id, spot]))
  const shown: ShownCollectible[] = []
  const standing = new Map<string, Standing>()
  for (const thing of things) {
    const spot = byId.get(where.get(thing.id) ?? CHEST)
    if (!spot) continue
    const at = { x: spot.x, y: spot.y, stand: spot.stand, depth: spot.depth }
    standing.set(thing.id, at)
    shown.push({ item: thing.item, rarity: thing.rarity, at })
  }
  for (const { item, rarity } of finds(data)) {
    if (ATMOSPHERE.has(item.id)) {
      shown.push({
        item,
        rarity,
        at: { x: item.x, y: item.y, stand: item.world === 'garden', depth: 1 },
        weather: true,
      })
      continue
    }
    const companion = COMPANIONS[item.id]
    const host = companion && standing.get(companion.host)
    if (companion && host) {
      shown.push({
        item,
        rarity,
        at: { ...host, x: host.x + companion.dx, y: host.y + companion.dy },
      })
    }
  }
  return shown
}

/**
 * Where each waiting stone lies: sea stones float at the water line, sky
 * stones hang in the lower sky, garden stones lie on the sand. Spread by
 * the thing's place in the row so two things' stones do not overlap.
 */
export function stonesFor(data: AppData): StoneSpec[] {
  const specs: StoneSpec[] = []
  const Y: Record<World, number> = { sea: 0.605, sky: 0.4, garden: 0.585 }
  for (const thing of data.things) {
    waitingTiers(data, thing.id).forEach((tier, i) => {
      specs.push({
        key: `${thing.id}:${String(tier)}`,
        world: thing.world,
        x: 0.12 + ((thing.order * 0.21 + i * 0.12) % 0.78),
        y: Y[thing.world] - (thing.world === 'sky' ? i * 0.05 : 0),
        label: voice.stones.label(thing.name),
      })
    })
  }
  return specs
}

/** The shore's light with nothing found in the garden yet, and the finds that bring it to full. */
const WARMTH_BASE = 0.25
const WARMTH_FULL_AT = 6

/** The shore glows warmer the more of the garden has been found. */
export function warmthOf(data: AppData): number {
  const garden = [...everyThing(data).values()].filter((t) => t.world === 'garden')
  const found = garden.reduce((n, t) => n + foundFor(data, t, COLLECTIBLES).length, 0)
  return WARMTH_BASE + (Math.min(found, WARMTH_FULL_AT) / WARMTH_FULL_AT) * (1 - WARMTH_BASE)
}

export function hasJacket(data: AppData): boolean {
  return [...everyThing(data).values()].some((t) =>
    foundFor(data, t, COLLECTIBLES).includes(JACKET_ID),
  )
}

/** "Tue 3 Nov: run, read" for a star's label and its tap. */
export function dayLabel(data: AppData, date: DateKey): string {
  const when = shortDate(date)
  const names = (data.days[date]?.done ?? [])
    .map((id) => data.things.find((t) => t.id === id)?.name)
    .filter((name): name is string => typeof name === 'string')
  return names.length > 0 ? `${when}: ${names.join(', ')}` : when
}

/**
 * The goal always in sight: of every thing's next find, the nearest, and
 * how many more days of showing up it takes (the Collection's count).
 */
export function nextFind(data: AppData): { item: Collectible; days: number } | null {
  let best: { item: Collectible; days: number } | null = null
  for (const thing of data.things) {
    const total = totalDone(data, thing.id)
    const item = collectiblesFor(thing.world, lineFor(data, thing)).find((c) => c.days > total)
    if (!item) continue
    const days = item.days - total
    if (!best || days < best.days) best = { item, days }
  }
  return best
}
