import { registerSW } from 'virtual:pwa-register'

const CHECK_EVERY_MS = 60 * 60 * 1000

/**
 * Registers the service worker and keeps looking for a newer one: on
 * every open, every time the app comes back to the front, and hourly
 * while it stays open. When one is waiting, `onNeedRefresh` gets a
 * function that activates it and reloads; the app shows a toast with it.
 * Left untapped, the new worker takes over on the next open.
 *
 * The reload is done here rather than left to the plugin: the plugin only
 * reloads when the page already had a controller when it loaded, and a
 * person who installed the app a minute before a deploy would tap the
 * toast and see nothing happen. The flag keeps the first-ever install
 * (which also changes the controller, through clientsClaim) from reloading.
 */
export function setupUpdates(onNeedRefresh: (reload: () => void) => void): void {
  if (!('serviceWorker' in navigator)) return
  let reloadWanted = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadWanted) window.location.reload()
  })
  const update = registerSW({
    immediate: true,
    onNeedRefresh() {
      onNeedRefresh(() => {
        reloadWanted = true
        void update(true)
      })
    },
    onRegisteredSW(_url, registration) {
      if (!registration) return
      const check = (): void => {
        registration.update().catch(() => undefined)
      }
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) check()
      })
      setInterval(check, CHECK_EVERY_MS)
    },
  })
}
