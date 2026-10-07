/**
 * Keeps the screen on during a lock-in, where the browser allows it
 * (Chrome, Edge, Safari 16.4 and later, including an iPhone home-screen
 * app). The phone lies next to the person. A wake lock is
 * dropped whenever the page hides, so it is asked for again on return.
 */
let sentinel: WakeLockSentinel | null = null
let wanted = false

export function keepAwake(): void {
  wanted = true
  void request()
}

export function letSleep(): void {
  wanted = false
  const held = sentinel
  sentinel = null
  void held?.release().catch(() => undefined)
}

document.addEventListener('visibilitychange', () => {
  if (wanted && !document.hidden) void request()
})

async function request(): Promise<void> {
  if (!('wakeLock' in navigator) || document.hidden) return
  try {
    sentinel = await navigator.wakeLock.request('screen')
  } catch {
    // Refused (low battery, a policy): the session runs anyway.
  }
}
