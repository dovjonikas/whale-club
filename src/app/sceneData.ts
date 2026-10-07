import { COLLECTIBLES } from '../scene/collectibles'
import { rarityOf } from '../scene/rarity'
import type { ShownCollectible } from '../scene/scene'
import type { LanternSpec } from '../scene/lanterns'
import type { StoneSpec } from '../scene/stones'
import { fromKey } from '../store/dates'
import { foundFor, reachedOn, waitingTiers } from '../store/derive'
import type { AppData, DateKey, World } from '../store/types'
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

/**
 * Every lantern in the cove: one per session that ran to its end, oldest
 * first. A thing that has since been deleted keeps its lanterns, in the
 * first colour; history is not rewritten.
 */
export function lanternsFor(data: AppData): LanternSpec[] {
  const order = new Map(data.things.map((t) => [t.id, t.order]))
  const specs: LanternSpec[] = []
  for (const date of Object.keys(data.days).sort()) {
    data.days[date]?.sessions?.forEach((session, index) => {
      const minutes = session.minutes
      specs.push({
        key: lanternKey(date, index),
        date,
        color: LANTERN_COLORS[(order.get(session.thing) ?? 0) % LANTERN_COLORS.length] ?? '#ffd98a',
        size: minutes >= LANTERN_LARGE_MINUTES ? 2 : minutes >= LANTERN_MIDDLE_MINUTES ? 1 : 0,
        dim: session.left === true,
      })
    })
  }
  return specs
}

export function shownCollectibles(data: AppData): ShownCollectible[] {
  const shown: ShownCollectible[] = []
  for (const thing of data.things) {
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
  const garden = data.things.filter((t) => t.world === 'garden')
  const found = garden.reduce((n, t) => n + foundFor(data, t, COLLECTIBLES).length, 0)
  return 0.25 + Math.min(found, 6) * 0.125
}

export function hasJacket(data: AppData): boolean {
  return data.things.some((t) => foundFor(data, t, COLLECTIBLES).includes(JACKET_ID))
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
