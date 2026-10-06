/**
 * Three layers move a few pixels against each other: with the pointer on a
 * desktop, and on their own, very slowly, on a phone. iOS asks for a
 * permission dialog before it hands out device orientation, and a dialog
 * on the first screen is not worth six pixels of drift, so touch devices
 * get the slow idle sway instead.
 */
const MAX_SHIFT = 8

export function startParallax(layers: readonly HTMLElement[]): () => void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => undefined
  const depths = layers.map((layer) => Number(layer.dataset.depth ?? 0.5))
  let targetX = 0
  let targetY = 0
  let currentX = 0
  let currentY = 0
  let raf = 0
  let stopped = false
  const finePointer = matchMedia('(pointer: fine)').matches

  const apply = (): void => {
    layers.forEach((layer, i) => {
      const depth = depths[i] ?? 0.5
      layer.style.transform = `translate3d(${(currentX * depth).toFixed(2)}px, ${(currentY * depth).toFixed(2)}px, 0)`
    })
  }

  const frame = (now: number): void => {
    if (stopped) return
    if (!finePointer) {
      targetX = Math.sin(now / 9000) * MAX_SHIFT
      targetY = Math.cos(now / 13000) * MAX_SHIFT * 0.5
    }
    currentX += (targetX - currentX) * 0.04
    currentY += (targetY - currentY) * 0.04
    apply()
    raf = requestAnimationFrame(frame)
  }

  const onMove = (event: PointerEvent): void => {
    targetX = ((event.clientX / innerWidth) * 2 - 1) * MAX_SHIFT
    targetY = ((event.clientY / innerHeight) * 2 - 1) * MAX_SHIFT
  }

  if (finePointer) addEventListener('pointermove', onMove, { passive: true })
  raf = requestAnimationFrame(frame)
  return () => {
    stopped = true
    cancelAnimationFrame(raf)
    removeEventListener('pointermove', onMove)
  }
}
