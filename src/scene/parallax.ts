import { reducedMotion, ticker } from './ticker'

/**
 * Three layers move a few pixels against each other: with the pointer on a
 * desktop, and on their own, very slowly, on a phone. iOS asks for a
 * permission dialog before it hands out device orientation, and a dialog
 * on the first screen is not worth six pixels of drift, so touch devices
 * get the slow idle sway instead. Frames come from the app's one loop.
 */
const MAX_SHIFT = 8
const FPS = 30
/** Below this a move is not seen, so the layers are not touched: a still pointer costs nothing. */
const SETTLED_PX = 0.02

export function startParallax(layers: readonly HTMLElement[]): () => void {
  if (reducedMotion()) return () => undefined
  const depths = layers.map((layer) => Number(layer.dataset.depth ?? 0.5))
  let targetX = 0
  let targetY = 0
  let currentX = 0
  let currentY = 0
  let drawnX = 0
  let drawnY = 0
  const finePointer = matchMedia('(pointer: fine)').matches

  const handle = ticker.add((now) => {
    if (!finePointer) {
      targetX = Math.sin(now / 9000) * MAX_SHIFT
      targetY = Math.cos(now / 13000) * MAX_SHIFT * 0.5
    }
    currentX += (targetX - currentX) * 0.08
    currentY += (targetY - currentY) * 0.08
    if (Math.abs(currentX - drawnX) < SETTLED_PX && Math.abs(currentY - drawnY) < SETTLED_PX) return
    drawnX = currentX
    drawnY = currentY
    layers.forEach((layer, i) => {
      const depth = depths[i] ?? 0.5
      layer.style.transform = `translate3d(${(currentX * depth).toFixed(2)}px, ${(currentY * depth).toFixed(2)}px, 0)`
    })
  }, FPS)

  const onMove = (event: PointerEvent): void => {
    targetX = ((event.clientX / innerWidth) * 2 - 1) * MAX_SHIFT
    targetY = ((event.clientY / innerHeight) * 2 - 1) * MAX_SHIFT
  }
  if (finePointer) addEventListener('pointermove', onMove, { passive: true })

  return () => {
    handle.remove()
    removeEventListener('pointermove', onMove)
  }
}
