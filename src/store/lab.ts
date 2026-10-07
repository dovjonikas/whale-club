import { setOffsetDays } from './clock'

/**
 * The lab: a sandbox with a movable clock, for trying the app out across
 * days and weeks without touching the real sea.
 *
 * Entering copies the real record, byte for byte, into its own key, and
 * from then on every read and write of the app's data and of a lock-in
 * session goes to the lab's keys. The clock's offset lives in the lab's
 * meta and nowhere else. Leaving deletes the lab's keys; the real record
 * was never opened for writing, so it is exactly what it was.
 *
 * The lab is on exactly when its meta is in storage, so a reload stays in
 * the lab and a closed tab comes back to it.
 */
export const REAL_DATA_KEY = 'whaleclub:data'
const REAL_SESSION_KEY = 'whaleclub:session'
export const LAB_DATA_KEY = 'whaleclub:lab'
const LAB_META_KEY = 'whaleclub:lab.meta'
const LAB_SESSION_KEY = 'whaleclub:lab.session'
/** The URL parameter that opens the lab: ?lab=1. */
export const LAB_PARAM = 'lab'

interface Meta {
  offsetDays: number
}

let on = false
let offsetDays = 0

/**
 * Reads the lab's state once, before the app starts. `?lab=1` enters it
 * if it is not on already. Returns whether the lab was entered just now,
 * so the app can open the lab's sheet.
 */
export function startLab(search: string): boolean {
  let entered = false
  const meta = readMeta()
  if (meta) {
    on = true
    offsetDays = meta.offsetDays
  } else if (new URLSearchParams(search).get(LAB_PARAM) === '1') {
    entered = enterLab()
  }
  setOffsetDays(offsetDays)
  return entered
}

export function labOn(): boolean {
  return on
}

export function labOffset(): number {
  return offsetDays
}

/** Where the app's data is read and written: the real key, or the lab's copy. */
export function dataKey(): string {
  return on ? LAB_DATA_KEY : REAL_DATA_KEY
}

/** Where a running lock-in session is kept. */
export function sessionKey(): string {
  return on ? LAB_SESSION_KEY : REAL_SESSION_KEY
}

/** Copies the real record into the lab and switches to it. False if storage refused. */
export function enterLab(): boolean {
  try {
    const real = localStorage.getItem(REAL_DATA_KEY)
    if (real === null) localStorage.removeItem(LAB_DATA_KEY)
    else localStorage.setItem(LAB_DATA_KEY, real)
    localStorage.removeItem(LAB_SESSION_KEY)
    writeMeta({ offsetDays: 0 })
  } catch {
    return false
  }
  on = true
  offsetDays = 0
  setOffsetDays(0)
  return true
}

/** Throws the lab away. The real record is untouched; it was never written. */
export function leaveLab(): void {
  try {
    localStorage.removeItem(LAB_DATA_KEY)
    localStorage.removeItem(LAB_META_KEY)
    localStorage.removeItem(LAB_SESSION_KEY)
  } catch {
    // Nothing to do: if storage refuses, the lab was never stored either.
  }
  on = false
  offsetDays = 0
  setOffsetDays(0)
}

/** Moves the lab's clock. Ignored outside the lab. */
export function setLabOffset(days: number): void {
  if (!on) return
  offsetDays = Math.trunc(days)
  writeMeta({ offsetDays })
  setOffsetDays(offsetDays)
}

function readMeta(): Meta | null {
  try {
    const text = localStorage.getItem(LAB_META_KEY)
    if (text === null) return null
    const raw: unknown = JSON.parse(text)
    if (typeof raw !== 'object' || raw === null) return null
    const value = (raw as Record<string, unknown>).offsetDays
    return { offsetDays: typeof value === 'number' && Number.isFinite(value) ? value : 0 }
  } catch {
    return null
  }
}

function writeMeta(meta: Meta): void {
  try {
    localStorage.setItem(LAB_META_KEY, JSON.stringify(meta))
  } catch {
    // The offset still holds for this page.
  }
}
