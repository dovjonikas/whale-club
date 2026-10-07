import { COLLECTIBLES, collectiblesFor, type Collectible } from '../scene/collectibles'
import { rarityOf } from '../scene/rarity'
import type { ShownCollectible } from '../scene/scene'
import type { LanternSpec } from '../scene/lanterns'
import type { StoneSpec } from '../scene/stones'
import { fromKey, todayKey } from '../store/dates'
import { foundFor, lineFor, reachedOn, totalDone, waitingTiers } from '../store/derive'
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

/** Everything found, by every thing that ever was: a deleted thing's finds stay in the scene. */
export function shownCollectibles(data: AppData): ShownCollectible[] {
  const shown: ShownCollectible[] = []
  for (const thing of everyThing(data).values()) {
    const found = new Set(foundFor(data, thing, COLLECTIBLES))
    for (const item of COLLECTIBLES) {
      if (!found.has(item.id)) continue
      shown.push({ item, rarity: rarityOf(item.id, reachedOn(data, thing.id, item.days)) })
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

/** The shore glows warmer the more of the garden has been found. */
export function warmthOf(data: AppData): number {
  const garden = [...everyThing(data).values()].filter((t) => t.world === 'garden')
  const found = garden.reduce((n, t) => n + foundFor(data, t, COLLECTIBLES).length, 0)
  return 0.25 + Math.min(found, 6) * 0.125
}

export function hasJacket(data: AppData): boolean {
  return [...everyThing(data).values()].some((t) =>
    foundFor(data, t, COLLECTIBLES).includes(JACKET_ID),
  )
}

/** "Tue 3 Nov: run, read" for a star's label and its tap. */
export function dayLabel(data: AppData, date: DateKey): string {
  const when = fromKey(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
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
