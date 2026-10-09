/**
 * Which version's "what's new" has been seen, kept beside the intro's mark
 * (src/app/intro.ts) rather than in the data: it is about this phone's
 * last look, not about the sea, and a restore should not show it again.
 * Nothing here imports anything, so a test can read the version.
 */
export const NEWS_VERSION = '1.3.0'
export const NEWS_KEY = 'whaleclub:news'

export function newsSeen(): boolean {
  try {
    return localStorage.getItem(NEWS_KEY) === NEWS_VERSION
  } catch {
    // No storage: say it was seen, rather than show it on every open.
    return true
  }
}

export function markNewsSeen(): void {
  try {
    localStorage.setItem(NEWS_KEY, NEWS_VERSION)
  } catch {
    // Without storage it would show again; newsSeen already says it was seen.
  }
}
