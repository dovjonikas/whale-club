import { icon } from '../brand/icons'
import { host } from './host'

/**
 * A bottom sheet over the scene. One at a time, modal, closed by its own
 * button, the scrim or Escape. Focus goes in on open and back to whatever
 * opened it on close; everything behind it is `inert` while it is open.
 */
export interface SheetHandle {
  readonly body: HTMLElement
  close(): void
}

interface SheetOptions {
  title: string
  /** Fills the sheet. `close` is handed in so a form can close itself. */
  build: (body: HTMLElement, close: () => void) => void
  onClose?: () => void
}

let openHandle: SheetHandle | null = null
/** Each sheet title gets its own id, for aria-labelledby. */
let sheetCount = 0

/** How long a sheet takes to go down: --dur-sheet-out in tokens.css. */
const SHEET_OUT_MS = 300
/** A flick this fast, in px per ms, closes the sheet however short the pull. */
const FLICK_SPEED = 0.11
/** A pull past this share of the sheet's height closes it. */
const CLOSE_SHARE = 0.3
/** Pulled up past the top, the sheet gives a little, less and less: the square root of the pull, times this. */
const OVERPULL = 2

/**
 * Pull the sheet down by its grabber to close it. It follows the finger
 * exactly, closes on a flick or a long enough pull, and otherwise springs
 * back from wherever it was let go. Caught while it is still moving, it is
 * held where it is, not where it was going. A second finger is ignored.
 */
function pullToClose(sheet: HTMLElement, grabber: HTMLElement, close: () => void): void {
  let pull: { id: number; y: number; at: number } | null = null
  let dy = 0
  grabber.addEventListener('pointerdown', (event) => {
    if (pull || event.button !== 0) return
    // Where the sheet is right now, even half way through a transition.
    const now = new DOMMatrixReadOnly(getComputedStyle(sheet).transform).m42
    pull = { id: event.pointerId, y: event.clientY - now, at: event.timeStamp }
    dy = 0
    try {
      // Keeps the pull going if the finger slides off the strip.
      grabber.setPointerCapture(event.pointerId)
    } catch {
      // The pointer is already gone (or never was a real one); the pull still works where it is.
    }
    sheet.classList.add('is-dragging')
  })
  grabber.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pull?.id) return
    const raw = event.clientY - pull.y
    dy = raw >= 0 ? raw : -Math.sqrt(-raw) * OVERPULL
    sheet.style.transform = `translate3d(0, ${String(dy)}px, 0)`
  })
  const release = (event: PointerEvent): void => {
    if (event.pointerId !== pull?.id) return
    const speed = dy / Math.max(1, event.timeStamp - pull.at)
    pull = null
    // Back to the stylesheet's transitions, from wherever the finger left it.
    sheet.classList.remove('is-dragging')
    sheet.style.transform = ''
    if (dy > sheet.offsetHeight * CLOSE_SHARE || speed > FLICK_SPEED) close()
  }
  grabber.addEventListener('pointerup', release)
  grabber.addEventListener('pointercancel', release)
}

export function openSheet(options: SheetOptions): SheetHandle {
  openHandle?.close()
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const app = document.getElementById('app')

  const scrim = document.createElement('div')
  scrim.className = 'sheet-scrim'

  const sheet = document.createElement('section')
  sheet.className = 'sheet'
  sheet.setAttribute('role', 'dialog')
  sheet.setAttribute('aria-modal', 'true')
  const titleId = `sheet-title-${String(++sheetCount)}`
  sheet.setAttribute('aria-labelledby', titleId)
  sheet.innerHTML = `
    <div class="sheet-grabber" aria-hidden="true"></div>
    <h2 class="sheet-title" id="${titleId}"></h2>
    <button class="icon-button sheet-close" type="button" aria-label="Close">
      ${icon('close')}
    </button>
    <div class="sheet-body"></div>`
  const title = sheet.querySelector('.sheet-title')
  if (title) title.textContent = options.title
  const body = sheet.querySelector<HTMLElement>('.sheet-body')
  if (!body) throw new Error('sheet without body')

  let closed = false
  const close = (): void => {
    if (closed) return
    closed = true
    openHandle = null
    // Leaving: out of reach and out of the accessibility tree at once, not when the slide ends,
    sheet.inert = true
    sheet.setAttribute('aria-hidden', 'true')
    // and the fading scrim no longer catches a tap meant for the scene.
    scrim.style.pointerEvents = 'none'
    sheet.style.pointerEvents = 'none'
    document.removeEventListener('keydown', onKey)
    app?.removeAttribute('inert')
    scrim.classList.remove('is-open')
    sheet.classList.remove('is-open')
    setTimeout(() => {
      scrim.remove()
      sheet.remove()
    }, SHEET_OUT_MS)
    opener?.focus()
    options.onClose?.()
  }

  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') close()
  }

  options.build(body, close)
  sheet.querySelector('.sheet-close')?.addEventListener('click', close)
  const grabber = sheet.querySelector<HTMLElement>('.sheet-grabber')
  if (grabber) pullToClose(sheet, grabber, close)
  scrim.addEventListener('click', close)
  document.addEventListener('keydown', onKey)

  host().append(scrim, sheet)
  app?.setAttribute('inert', '')
  requestAnimationFrame(() => {
    scrim.classList.add('is-open')
    sheet.classList.add('is-open')
    const first = sheet.querySelector<HTMLElement>('input, button:not(.sheet-close)')
    first?.focus()
  })

  const handle: SheetHandle = { body, close }
  openHandle = handle
  return handle
}
