/** One line at the top of the screen, one tap. Only one shows at a time. */
import { host } from './host'

let current: HTMLButtonElement | null = null
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

export function showToast(text: string, onTap?: () => void): void {
  current?.remove()
  const toast = document.createElement('button')
  toast.type = 'button'
  toast.className = 'toast'
  toast.textContent = text
  toast.addEventListener('click', () => {
    hide()
    onTap?.()
  })
  host().append(toast)
  current = toast
  announce(text)
  requestAnimationFrame(() => toast.classList.add('is-open'))
  if (!onTap) setTimeout(hide, 4000)
}

function hide(): void {
  const toast = current
  if (!toast) return
  current = null
  toast.classList.remove('is-open')
  setTimeout(() => toast.remove(), 300)
}

/** How long an undo waits. */
const UNDO_MS = 10_000

/**
 * A line at the bottom with an "undo" beside it, for ten seconds: the way
 * a delete is taken back, instead of asking first.
 */
export function showUndo(text: string, label: string, onUndo: () => void): void {
  document.querySelector('.undo-toast')?.remove()
  const toast = document.createElement('div')
  toast.className = 'undo-toast'
  toast.innerHTML =
    '<span class="undo-text"></span><button type="button" class="undo-button"></button>'
  const textEl = toast.querySelector('.undo-text')
  const button = toast.querySelector<HTMLButtonElement>('.undo-button')
  if (textEl) textEl.textContent = text
  if (button) button.textContent = label
  const close = (): void => {
    clearTimeout(timer)
    toast.classList.remove('is-open')
    setTimeout(() => {
      toast.remove()
    }, 300)
  }
  const timer = window.setTimeout(close, UNDO_MS)
  button?.addEventListener('click', () => {
    close()
    onUndo()
  })
  host().append(toast)
  announce(`${text} ${label}`)
  requestAnimationFrame(() => toast.classList.add('is-open'))
}
