import { COLLECTIBLES } from '../scene/collectibles'
import { rarityOf } from '../scene/rarity'
import type { ShownCollectible } from '../scene/scene'
import type { StoneSpec } from '../scene/stones'
import { fromKey } from '../store/dates'
import { foundFor, reachedOn, waitingTiers } from '../store/derive'
import type { AppData, DateKey, World } from '../store/types'
import { voice } from '../voice'

/** The bridge from the data to what the scene draws: plain functions of AppData. */

const JACKET_ID = 'sea-a-jacket'

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
