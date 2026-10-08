import { todayKey } from '../store/dates'
import { allDoneToday, plannedThings } from '../store/derive'
import type { Store } from '../store/store'

/**
 * The home-screen badge, where it needs no permission (Android's Chrome):
 * how many of today's things are left, set as the app goes to the
 * background, cleared once everything is done. Nothing ever asks for
 * notifications; where a badge would need that (iOS), there is no badge.
 */
export function watchBadge(store: Store): void {
  if (!('setAppBadge' in navigator) || /iPhone|iPad|iPod/.test(navigator.userAgent)) return
  const clear = (): void => {
    navigator.clearAppBadge().catch(() => undefined)
  }
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return
    const data = store.get()
    const today = todayKey()
    const left = plannedThings(data, today).filter(
      (t) => !data.days[today]?.done.includes(t.id),
    ).length
    if (left === 0) clear()
    else navigator.setAppBadge(left).catch(() => undefined)
  })
  store.subscribe((data) => {
    if (allDoneToday(data, todayKey())) clear()
  })
}
