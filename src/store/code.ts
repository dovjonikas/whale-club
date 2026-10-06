import type { AppData, DateKey, Thing, World } from './types'

/**
 * The share code: a person's things and days as one string, so a buddy
 * can paste it and see their scene. No server: the code is the data.
 *
 * Shape before encoding, kept small on purpose (ids become indexes, a day
 * is a list of indexes): `{ v: 1, t: [[name, emoji, world, createdAt]],
 * d: { "2026-10-06": [0, 2] } }`. Gzipped where the browser can, then
 * base64url. The prefix says which: `wc1.` is plain, `wc1z.` is gzipped.
 * Anything that does not decode cleanly is rejected whole.
 */
const PLAIN = 'wc1.'
const ZIPPED = 'wc1z.'
const CODE_VERSION = 1

interface Wire {
  v: number
  t: [string, string, World, DateKey][]
  d: Record<DateKey, number[]>
}

/** A buddy's data in the app's own shape, with synthetic ids. */
export interface BuddyData {
  things: Thing[]
  days: AppData['days']
}

export async function encodeCode(data: AppData): Promise<string> {
  const things = [...data.things].sort((a, b) => a.order - b.order)
  const index = new Map(things.map((t, i) => [t.id, i]))
  const wire: Wire = {
    v: CODE_VERSION,
    t: things.map((t) => [t.name, t.emoji, t.world, t.createdAt]),
    d: {},
  }
  for (const [date, day] of Object.entries(data.days)) {
    const done = day.done.map((id) => index.get(id)).filter((i): i is number => i !== undefined)
    if (done.length > 0) wire.d[date] = done
  }
  const json = JSON.stringify(wire)
  if (typeof CompressionStream === 'function') {
    const bytes = await gzip(new TextEncoder().encode(json))
    return ZIPPED + toBase64Url(bytes)
  }
  return PLAIN + toBase64Url(new TextEncoder().encode(json))
}

export async function decodeCode(code: string): Promise<BuddyData> {
  const text = code.trim()
  let json: string
  if (text.startsWith(ZIPPED)) {
    if (typeof DecompressionStream !== 'function') throw new Error('cannot unzip here')
    json = new TextDecoder().decode(await gunzip(fromBase64Url(text.slice(ZIPPED.length))))
  } else if (text.startsWith(PLAIN)) {
    json = new TextDecoder().decode(fromBase64Url(text.slice(PLAIN.length)))
  } else {
    throw new Error('not a whale club code')
  }
  return fromWire(JSON.parse(json))
}

function fromWire(raw: unknown): BuddyData {
  if (typeof raw !== 'object' || raw === null) throw new Error('bad code')
  const wire = raw as Record<string, unknown>
  if (wire.v !== CODE_VERSION || !Array.isArray(wire.t) || typeof wire.d !== 'object' || !wire.d)
    throw new Error('bad code')
  const things: Thing[] = (wire.t as unknown[]).map((entry, i) => {
    if (!Array.isArray(entry) || entry.length < 4) throw new Error('bad thing')
    const [name, emoji, world, createdAt] = entry as unknown[]
    if (typeof name !== 'string' || typeof emoji !== 'string' || typeof createdAt !== 'string')
      throw new Error('bad thing')
    if (world !== 'sea' && world !== 'sky' && world !== 'garden') throw new Error('bad world')
    return { id: `buddy-${i}`, name, emoji, mode: 'tap', world, createdAt, order: i }
  })
  const days: AppData['days'] = {}
  for (const [date, done] of Object.entries(wire.d as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(done)) throw new Error('bad day')
    const ids = (done as unknown[])
      .filter((i): i is number => typeof i === 'number' && i >= 0 && i < things.length)
      .map((i) => `buddy-${i}`)
    days[date] = { done: [...new Set(ids)], minutes: {} }
  }
  return { things, days }
}

async function gzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([new Uint8Array(bytes).buffer])
    .stream()
    .pipeThrough(new CompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([new Uint8Array(bytes).buffer])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
