/** One line at the top of the screen, one tap. Only one shows at a time. */
import { host } from './host'

/** How long a plain toast stays, counted only while it can be read. */
const TOAST_MS = 4000
/** How long an undo waits, counted the same way. */
const UNDO_MS = 10_000
/** A little longer than --dur-toast-out, so the leaving is never cut short. */
const LEAVE_MS = 300

let current: HTMLButtonElement | null = null
/** Stops the undo on screen without closing it: a newer one is taking its place. */
let dropUndo: (() => void) | null = null
let announcer: HTMLElement | null = null

/**
 * Says a line to a screen reader, politely, through one live region that
 * is always there: a region created with its text already in it is often
 * not read at all.
 */
export function announce(text: string): void {
  if (!announcer?.isConnected) {
    announcer = document.createElement('div')
    announcer.className = 'visually-hidden'
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    host().append(announcer)
  }
  const region = announcer
  // Emptied first, so the same line twice is still said twice.
  region.textContent = ''
  window.setTimeout(() => {
    region.textContent = text
  }, 50)
}

/**
 * Runs `done` after `ms` of time the line could actually be read: the
 * count stops while a pointer rests on it, while a keyboard has its focus,
 * and while the page is hidden, so an undo never runs out behind a finger
 * or another app. Focus handed over after a tap (a deleted card gives its
 * focus to the undo) does not count: on a phone it would never run out.
 * Returns a stop.
 */
function readableTimer(el: HTMLElement, ms: number, done: () => void): () => void {
  let left = ms
  let started = 0
  let timer = 0
  let hovered = false
  let focused = false
  const paused = (): boolean => hovered || focused || document.hidden
  const run = (): void => {
    if (timer || paused()) return
    started = performance.now()
    timer = window.setTimeout(finish, left)
  }
  const pause = (): void => {
    if (!timer) return
    clearTimeout(timer)
    timer = 0
    left = Math.max(0, left - (performance.now() - started))
  }
  const update = (): void => {
    if (paused()) pause()
    else run()
  }
  const on = (event: string, set: () => void): void => {
    el.addEventListener(event, () => {
      set()
      update()
    })
  }
  on('pointerenter', () => (hovered = true))
  on('pointerleave', () => (hovered = false))
  el.addEventListener('focusin', (event) => {
    focused = event.target instanceof Element && event.target.matches(':focus-visible')
    update()
  })
  // Focus moving within the line comes back through focusin at once.
  on('focusout', () => (focused = false))
  document.addEventListener('visibilitychange', update)
  function stop(): void {
    clearTimeout(timer)
    timer = 0
    document.removeEventListener('visibilitychange', update)
  }
  function finish(): void {
    stop()
    done()
  }
  run()
  return stop
}

export function showToast(text: string, onTap?: () => void): void {
  current?.remove()
  const toast = document.createElement('button')
  toast.type = 'button'
  toast.className = 'toast'
  toast.textContent = text
  let stop = (): void => undefined
  toast.addEventListener('click', () => {
    stop()
    hide()
    onTap?.()
  })
  host().append(toast)
  current = toast
  announce(text)
  requestAnimationFrame(() => toast.classList.add('is-open'))
  if (!onTap) stop = readableTimer(toast, TOAST_MS, hide)
}

function hide(): void {
  const toast = current
  if (!toast) return
  current = null
  toast.classList.remove('is-open')
  setTimeout(() => toast.remove(), LEAVE_MS)
}

/**
 * A line at the bottom with an "undo" beside it, for ten readable seconds:
 * the way a delete is taken back, instead of asking first. `onGone` runs
 * once it closes, undone or not.
 */
export function showUndo(
  text: string,
  label: string,
  onUndo: () => void,
  onGone?: () => void,
): void {
  dropUndo?.()
  const toast = document.createElement('div')
  toast.className = 'undo-toast'
  toast.innerHTML =
    '<span class="undo-text"></span><button type="button" class="undo-button"></button>'
  const textEl = toast.querySelector('.undo-text')
  const button = toast.querySelector<HTMLButtonElement>('.undo-button')
  if (textEl) textEl.textContent = text
  if (button) button.textContent = label
  const close = (): void => {
    stop()
    toast.classList.remove('is-open')
    setTimeout(() => {
      toast.remove()
    }, LEAVE_MS)
    onGone?.()
  }
  const stop = readableTimer(toast, UNDO_MS, close)
  dropUndo = (): void => {
    stop()
    toast.remove()
  }
  button?.addEventListener('click', () => {
    close()
    onUndo()
  })
  host().append(toast)
  announce(`${text} ${label}`)
  requestAnimationFrame(() => toast.classList.add('is-open'))
}
