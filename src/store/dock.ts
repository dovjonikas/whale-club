import { krillBalance } from './krill'
import type { AppData, DateKey } from './types'

/**
 * What the dock changes in the data, as plain functions from one record to
 * the next: the store saves what they return, the tests call them
 * directly. Prices come from the catalogue (src/scene/dock), never from
 * here, so the store cannot be talked into a price of its own.
 */

export function owns(data: AppData, item: string): boolean {
  return (data.bought ?? []).some((b) => b.item === item)
}

/**
 * Buys one thing, if it is not owned yet and the balance covers it. The
 * goal is let go once it is bought. Returns null when nothing changes.
 */
export function withPurchase(
  data: AppData,
  item: string,
  price: number,
  date: DateKey,
): AppData | null {
  if (owns(data, item) || krillBalance(data, date) < price) return null
  const next: AppData = { ...data, bought: [...(data.bought ?? []), { item, date, price }] }
  if (next.goal === item) delete next.goal
  return next
}

/** Pins one thing to save for, or lets the goal go (null). One at a time. */
export function withGoal(data: AppData, item: string | null): AppData {
  const next: AppData = { ...data }
  if (item === null || owns(data, item)) delete next.goal
  else next.goal = item
  return next
}

/** Takes an owned thing out of the scene, or puts it back. */
export function withHidden(data: AppData, item: string, hidden: boolean): AppData {
  const rest = (data.hidden ?? []).filter((id) => id !== item)
  const list = hidden ? [...rest, item] : rest
  const next: AppData = { ...data }
  if (list.length > 0) next.hidden = list
  else delete next.hidden
  return next
}

export function isHidden(data: AppData, item: string): boolean {
  return (data.hidden ?? []).includes(item)
}

/** Who wears a worn thing; one creature each, changeable any time. */
export function withWearer(data: AppData, item: string, thing: string): AppData {
  return { ...data, wears: { ...data.wears, [item]: thing } }
}
