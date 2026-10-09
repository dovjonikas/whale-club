import { reducedMotion } from '../scene/ticker'

/**
 * Changes what a sheet or a card shows (a month to a day, the dock's list
 * to a thing's page, the check-in's question to the next one) inside a
 * view transition where the browser has one: the box crossfades and eases
 * to its new height instead of cutting. Only that box is named, and only
 * while it swaps, so the scene behind stays live. Under reduced motion, or
 * without the API, the change is immediate; so is a box not on the page.
 */
export function swap(within: HTMLElement, update: () => void): void {
  const box = within.closest<HTMLElement>('.sheet, .leaf')
  // Older Safari and Firefox have no view transitions: the type says they do.
  const supported = 'startViewTransition' in document
  if (!box?.isConnected || !supported || reducedMotion()) {
    update()
    return
  }
  // Named on this one box only: a sheet still leaving would share the name.
  const name = box.classList.contains('leaf') ? 'leaf-swap' : 'sheet-swap'
  box.style.setProperty('view-transition-name', name)
  const done = (): void => {
    box.style.removeProperty('view-transition-name')
  }
  try {
    document.startViewTransition(update).finished.then(done, done)
  } catch {
    done()
    update()
  }
}
