import { reducedMotion } from '../scene/ticker'

/** The name the swapping sheet carries, and only for as long as it swaps. */
const NAME = 'sheet-swap'

/**
 * Changes what a sheet shows (a month to a day, the dock's list to a
 * thing's page) inside a view transition where the browser has one: the
 * sheet crossfades and eases to its new height instead of cutting. Only
 * the sheet is named, so its own scroll clips the picture and the scene
 * behind stays live. Under reduced motion, or without the API, the change
 * is immediate.
 */
export function swap(within: HTMLElement, update: () => void): void {
  const sheet = within.closest<HTMLElement>('.sheet')
  // Older Safari and Firefox have no view transitions: the type says they do.
  const supported = 'startViewTransition' in document
  if (!sheet || !supported || reducedMotion()) {
    update()
    return
  }
  // Named on this one sheet only: a sheet still leaving would share the name.
  sheet.style.setProperty('view-transition-name', NAME)
  const done = (): void => {
    sheet.style.removeProperty('view-transition-name')
  }
  try {
    document.startViewTransition(update).finished.then(done, done)
  } catch {
    done()
    update()
  }
}
