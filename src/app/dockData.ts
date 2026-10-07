import { DOCK, dockItem, type DockItem } from '../scene/dock'
import { isHidden, owns } from '../store/dock'
import { krillBalance } from '../store/krill'
import type { AppData, DateKey } from '../store/types'

/**
 * Data to dock: the goal and its distance, what is owned and shown. The
 * dock sheet, the chip and the scene read these; none of them touch the
 * catalogue and the purchases at once.
 */

export interface Goal {
  item: DockItem
  /** Krill still to earn; 0 when it can be bought now. */
  left: number
}

export function goalOf(data: AppData, today: DateKey): Goal | null {
  if (data.goal === undefined) return null
  const item = dockItem(data.goal)
  if (!item || owns(data, item.id)) return null
  return { item, left: Math.max(0, item.price - krillBalance(data, today)) }
}

/** Every owned dock thing, in the order bought. */
export function ownedItems(data: AppData): DockItem[] {
  return (data.bought ?? []).flatMap((b) => {
    const item = dockItem(b.item)
    return item ? [item] : []
  })
}

/** Owned and not hidden: what the scene draws. */
export function shownItems(data: AppData): DockItem[] {
  return ownedItems(data).filter((item) => !isHidden(data, item.id))
}

/** The extensions owned, which add places to the scene. */
export function rooms(data: AppData): Set<string> {
  return new Set(
    ownedItems(data)
      .filter((i) => i.kind === 'room')
      .map((i) => i.id),
  )
}

/** The catalogue in its tiers, cheapest first within each. */
export function dockByTier(): Map<DockItem['tier'], DockItem[]> {
  const tiers = new Map<DockItem['tier'], DockItem[]>()
  for (const item of DOCK) tiers.set(item.tier, [...(tiers.get(item.tier) ?? []), item])
  for (const list of tiers.values()) list.sort((a, b) => a.price - b.price)
  return tiers
}
