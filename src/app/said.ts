import { todayKey } from '../store/dates'
import type { DateKey } from '../store/types'

/**
 * What the moments of a day have already said (a missed day, the recap's
 * word, a milestone, a new chapter, the club line, the timer's question),
 * so the check-in's line for the day never says the same words again. Kept
 * for the day only, outside the sea's data: it is a courtesy, not history.
 */
const KEY = 'whaleclub:said'

interface Said {
  date: DateKey
  texts: string[]
}

function read(): Said | null {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Said> | null
    if (raw && typeof raw.date === 'string' && Array.isArray(raw.texts))
      return { date: raw.date, texts: raw.texts.filter((t) => typeof t === 'string') }
  } catch {
    // Unreadable: as if nothing was said.
  }
  return null
}

/** Remembers that a line was said today. */
export function noteSaid(text: string, today: DateKey = todayKey()): void {
  const said = read()
  const texts = said?.date === today ? said.texts : []
  if (texts.includes(text)) return
  try {
    localStorage.setItem(KEY, JSON.stringify({ date: today, texts: [...texts, text] }))
  } catch {
    // No room: the line may be said twice today, and nothing else is lost.
  }
}

/** Everything said today so far. */
export function saidToday(today: DateKey = todayKey()): Set<string> {
  const said = read()
  return new Set(said?.date === today ? said.texts : [])
}
