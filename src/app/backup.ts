import { migrate } from '../store/migrate'
import { DATA_VERSION, type AppData, type DateKey } from '../store/types'

/**
 * Backing up the sea: the whole record as one JSON file, with the data
 * version it was written in and a checksum of the data, so a file that
 * was cut short or edited by hand is caught before it can replace
 * anything. A file from a newer version of the app is refused politely:
 * this version cannot know what it holds.
 */
export interface BackupFile {
  app: 'whale-club'
  /** The file's own shape; bumped only if this wrapper changes. */
  format: 1
  /** The data version inside (src/store/types.ts, DATA_VERSION). */
  version: number
  exportedAt: string
  /** SHA-256 of the data as written, hex. */
  checksum: string
  data: unknown
}

export type ReadResult =
  | { ok: true; data: AppData; summary: BackupSummary }
  | { ok: false; reason: 'not-ours' | 'damaged' | 'newer' }

/** What a backup holds, to say before it replaces anything. */
export interface BackupSummary {
  first?: DateKey
  last?: DateKey
  things: string[]
  days: number
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** The file for this sea, and a name to save it under. */
export async function makeBackup(
  data: AppData,
  today: DateKey,
): Promise<{ text: string; name: string }> {
  const json = JSON.stringify(data)
  const file: BackupFile = {
    app: 'whale-club',
    format: 1,
    version: data.version,
    exportedAt: today,
    checksum: await sha256(json),
    data,
  }
  return { text: JSON.stringify(file, null, 1), name: `whale-club-${today}.json` }
}

/** Reads a backup file's text: the data, migrated to now, or why it cannot be used. */
export async function readBackup(text: string): Promise<ReadResult> {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'damaged' }
  }
  if (!isRecord(parsed) || parsed.app !== 'whale-club' || !('data' in parsed))
    return { ok: false, reason: 'not-ours' }
  if (typeof parsed.version === 'number' && parsed.version > DATA_VERSION)
    return { ok: false, reason: 'newer' }
  if (
    typeof parsed.checksum !== 'string' ||
    parsed.checksum !== (await sha256(JSON.stringify(parsed.data)))
  )
    return { ok: false, reason: 'damaged' }
  try {
    const data = migrate(parsed.data)
    return { ok: true, data, summary: summaryOf(data) }
  } catch {
    return { ok: false, reason: 'damaged' }
  }
}

export function summaryOf(data: AppData): BackupSummary {
  const dates = Object.keys(data.days).sort()
  return {
    ...(dates[0] !== undefined ? { first: dates[0] } : {}),
    ...(dates.length > 0 ? { last: dates[dates.length - 1] } : {}),
    things: data.things.map((t) => t.name),
    days: dates.filter((d) => (data.days[d]?.done.length ?? 0) > 0).length,
  }
}

/**
 * Hands the file to the person: the share sheet where it can take files
 * (an iPhone's "Save to Files"), a download everywhere else.
 */
export async function saveBackup(text: string, name: string): Promise<void> {
  const file = new File([text], name, { type: 'application/json' })
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch (error) {
      // Closing the share sheet is a choice, not a failure; anything else falls back to a download.
      if (error instanceof DOMException && error.name === 'AbortError') throw error
    }
  }
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
