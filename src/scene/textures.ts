import { seeded } from './random'

/**
 * Two textures, each drawn once into a small tile and used as a CSS
 * background, so nothing about them costs a frame afterwards.
 *
 * The grain is a fine monochrome noise laid over the whole scene, which
 * makes the night read like a printed illustration rather than a flat
 * screen. The caustics are the net of light that moonlight makes through
 * moving water: a cellular (Worley) pattern, the distance to the nearest
 * cell point subtracted from the second nearest, so the bright lines run
 * along the cell borders; the cells are wobbled with a periodic warp and
 * the tile wraps, so it can drift forever without a seam.
 */
const GRAIN = 160
const CAUSTICS = 256

export function grainUrl(): string {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = GRAIN
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const image = ctx.createImageData(GRAIN, GRAIN)
  const random = seeded(31)
  for (let i = 0; i < image.data.length; i += 4) {
    const v = random() * 255
    image.data[i] = v
    image.data[i + 1] = v
    image.data[i + 2] = v
    image.data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  return canvas.toDataURL('image/png')
}

export function causticsUrl(): string {
  // Computed at half size and scaled up, which keeps the light soft and the work small.
  const n = CAUSTICS / 2
  const period = (Math.PI * 2) / n
  const random = seeded(17)
  const points = Array.from({ length: 11 }, () => [random() * n, random() * n] as const)
  const source = document.createElement('canvas')
  source.width = source.height = n
  const sctx = source.getContext('2d')
  if (!sctx) return ''
  const image = sctx.createImageData(n, n)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const wx = x + 4 * Math.sin(y * period * 2)
      const wy = y + 4 * Math.sin(x * period * 3)
      let f1 = Infinity
      let f2 = Infinity
      for (const [px, py] of points) {
        let dx = Math.abs(wx - px) % n
        let dy = Math.abs(wy - py) % n
        if (dx > n / 2) dx = n - dx
        if (dy > n / 2) dy = n - dy
        const d = Math.hypot(dx, dy)
        if (d < f1) {
          f2 = f1
          f1 = d
        } else if (d < f2) f2 = d
      }
      const light = Math.pow(1 - Math.min(1, (f2 - f1) / 6), 3)
      const i = (y * n + x) * 4
      image.data[i] = 190
      image.data[i + 1] = 245
      image.data[i + 2] = 255
      image.data[i + 3] = Math.round(light * 200)
    }
  }
  sctx.putImageData(image, 0, 0)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = CAUSTICS
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, CAUSTICS, CAUSTICS)
  return canvas.toDataURL('image/png')
}
