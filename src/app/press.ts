/**
 * Tap or long press on one element, from pointer events alone.
 *
 * A keyboard still works: Enter or Space is a tap and Shift+Enter is the
 * long press, because a timer should not need a finger. Pointer-made
 * `click` events are ignored (the pointer handlers already ran); a
 * keyboard-made click arrives with `detail` 0 and is the tap.
 */
const LONG_PRESS_MS = 500
const MOVE_TOLERANCE_PX = 10

interface PressHandlers {
  onTap: () => void
  onLongPress: () => void
}

export function attachPress(element: HTMLElement, handlers: PressHandlers): void {
  let timer = 0
  let startX = 0
  let startY = 0
  let pressing = false
  let fired = false

  const cancel = (): void => {
    clearTimeout(timer)
    pressing = false
  }

  element.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return
    pressing = true
    fired = false
    startX = event.clientX
    startY = event.clientY
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      if (!pressing) return
      fired = true
      pressing = false
      handlers.onLongPress()
    }, LONG_PRESS_MS)
  })

  element.addEventListener('pointermove', (event) => {
    if (!pressing) return
    if (Math.hypot(event.clientX - startX, event.clientY - startY) > MOVE_TOLERANCE_PX) cancel()
  })

  element.addEventListener('pointerup', () => {
    if (!pressing) return
    cancel()
    if (!fired) handlers.onTap()
  })

  element.addEventListener('pointercancel', cancel)
  element.addEventListener('pointerleave', cancel)
  element.addEventListener('contextmenu', (event) => {
    event.preventDefault()
  })

  element.addEventListener('click', (event) => {
    if (event.detail !== 0) return
    handlers.onTap()
  })

  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      handlers.onLongPress()
    }
  })
}
