import { creatureSvg } from '../scene/creatures'
import { resolveTokens } from '../scene/palette'
import type { Scene } from '../scene/scene'
import { todayKey } from '../store/dates'
import { dayNumber, last7, lineFor, stageFor } from '../store/derive'
import type { AppData } from '../store/types'
import { voice } from '../voice'
import { BRAND } from './brand'

/**
 * The picture: the scene as it is right now, drawn into a canvas with the
 * date and "day N of whale club", shared where sharing works (iPhone) and
 * downloaded everywhere else. This is the photo somebody sends months in,
 * so it carries the sky, the collectibles and the creatures, not the UI.
 */
const MAX_DPR = 2

export async function shareScene(scene: Scene, data: AppData): Promise<'shared' | 'downloaded'> {
  const blob = await renderScene(scene, data)
  const day = dayNumber(data, todayKey())
  const file = new File([blob], `whale-club-day-${day}.png`, { type: 'image/png' })
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean
  }
  if (typeof nav.canShare === 'function' && nav.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: BRAND.title })
      return 'shared'
    } catch {
      // Cancelled, or the share sheet refused: fall through to a download.
    }
  }
  download(file)
  return 'downloaded'
}

async function renderScene(scene: Scene, data: AppData): Promise<Blob> {
  const root = scene.root
  const width = root.clientWidth
  const height = root.clientHeight
  const dpr = Math.min(devicePixelRatio || 1, MAX_DPR)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no canvas')
  ctx.scale(dpr, dpr)
  const horizon = height * 0.58
  const rootRect = root.getBoundingClientRect()

  const sky = ctx.createLinearGradient(0, 0, 0, horizon)
  sky.addColorStop(0, '#03070f')
  sky.addColorStop(1, '#0b1a3a')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, horizon)
  const sea = ctx.createLinearGradient(0, horizon, 0, height)
  sea.addColorStop(0, '#0a2447')
  sea.addColorStop(0.3, '#06122b')
  sea.addColorStop(1, '#020409')
  ctx.fillStyle = sea
  ctx.fillRect(0, horizon, width, height - horizon)

  drawCanvasAt(ctx, scene.starCanvas, rootRect)
  await drawSvgAt(
    ctx,
    scene.shore.querySelector('svg'),
    scene.shore.getBoundingClientRect(),
    rootRect,
  )
  for (const element of scene.things.querySelectorAll<HTMLElement>('.collectible, .whale')) {
    await drawSvgAt(ctx, element.querySelector('svg'), element.getBoundingClientRect(), rootRect)
  }
  drawCanvasAt(ctx, scene.particleCanvas, rootRect)

  await drawCreatures(ctx, data, width, height)

  await document.fonts.load('900 32px "Fraunces Variable"').catch(() => undefined)
  ctx.fillStyle = '#fff4d6'
  ctx.font = '900 28px "Fraunces Variable", Georgia, serif'
  ctx.textBaseline = 'top'
  ctx.fillText(BRAND.name, 20, 18)
  ctx.font = '700 14px "Atkinson Hyperlegible", system-ui, sans-serif'
  ctx.fillStyle = '#e8f0f5'
  ctx.textAlign = 'right'
  const today = todayKey()
  ctx.fillText(`${voice.share.caption(dayNumber(data, today))} · ${today}`, width - 20, 24)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('toBlob failed'))
    }, 'image/png')
  })
}

async function drawCreatures(
  ctx: CanvasRenderingContext2D,
  data: AppData,
  width: number,
  height: number,
): Promise<void> {
  const things = [...data.things].sort((a, b) => a.order - b.order)
  if (things.length === 0) return
  const today = todayKey()
  const size = Math.min(72, (width - 40) / things.length - 16)
  const gap = 16
  const total = things.length * size + (things.length - 1) * gap
  let x = (width - total) / 2
  const y = height - size - 44
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.font = '700 13px "Atkinson Hyperlegible", system-ui, sans-serif'
  for (const thing of things) {
    const svg = creatureSvg(
      thing.world,
      lineFor(data, thing),
      stageFor(last7(data, thing.id, today)),
    )
    const image = await svgImage(svg, size, size)
    ctx.drawImage(image, x, y, size, size)
    ctx.fillStyle = '#e8f0f5'
    ctx.fillText(thing.name, x + size / 2, y + size + 6)
    x += size + gap
  }
}

function drawCanvasAt(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  root: DOMRect,
): void {
  const rect = source.getBoundingClientRect()
  ctx.drawImage(source, rect.left - root.left, rect.top - root.top, rect.width, rect.height)
}

async function drawSvgAt(
  ctx: CanvasRenderingContext2D,
  svg: SVGElement | null,
  rect: DOMRect,
  root: DOMRect,
): Promise<void> {
  if (!svg || rect.width === 0) return
  const image = await svgImage(svg.outerHTML, rect.width, rect.height)
  ctx.drawImage(image, rect.left - root.left, rect.top - root.top, rect.width, rect.height)
}

async function svgImage(markup: string, width: number, height: number): Promise<HTMLImageElement> {
  const sized = resolveTokens(markup).replace(
    /^<svg /,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(1, Math.round(width))}" height="${Math.max(1, Math.round(height))}" `,
  )
  const image = new Image()
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`
  await image.decode()
  return image
}

function download(file: File): void {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
