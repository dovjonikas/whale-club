import { COLLECTIBLES, collectibleSvg, type Collectible } from '../scene/collectibles'
import { creatureSvg } from '../scene/creatures'
import { resolveTokens } from '../scene/palette'
import { shoreSvg } from '../scene/shore'
import { StarField } from '../scene/stars'
import { whaleSvg } from '../scene/visitors'
import { today } from '../store/clock'
import { fromKey, todayKey } from '../store/dates'
import { dayNumber, last7, lineFor, stageFor, starDays, streakDays } from '../store/derive'
import type { AppData, PostcardFormat } from '../store/types'
import { voice } from '../voice'
import { BRAND } from './brand'
import { dayBubble } from './thingMark'

/**
 * The postcard: the scene redrawn from the data at a fixed size, with the
 * moment's line, the day count, the date and a small mark in the corner.
 *
 * It is painted from the data rather than photographed from the screen,
 * so it looks the same whatever phone sent it and whatever was on top of
 * the scene at the time. Two sizes: a story (1080x1920) and a square
 * (1080x1080). The only thing that leaves the phone is this picture.
 */
export type MomentKind = 'whale' | 'unlock' | 'recap' | 'stage' | 'sea'

export interface Moment {
  kind: MomentKind
  line: string
}

const SIZE: Record<PostcardFormat, [number, number]> = {
  story: [1080, 1920],
  square: [1080, 1080],
}

/** The scene's collectible sizes are for a 390px phone; this is that phone's height for scaling. */
const PHONE_W = 390
const PHONE_H = 700
const SCENE_HORIZON = 0.58

interface Layout {
  horizon: number
  lineY: number
  lineSize: number
  captionY: number
  captionSize: number
  creaturesY: number
  creatureSize: number
  nameSize: number
  markSize: number
}

const LAYOUT: Record<PostcardFormat, Layout> = {
  story: {
    horizon: 0.58,
    lineY: 0.79,
    lineSize: 58,
    captionY: 0.835,
    captionSize: 30,
    creaturesY: 0.865,
    creatureSize: 130,
    nameSize: 26,
    markSize: 30,
  },
  square: {
    horizon: 0.56,
    lineY: 0.765,
    lineSize: 42,
    captionY: 0.815,
    captionSize: 22,
    creaturesY: 0.845,
    creatureSize: 84,
    nameSize: 18,
    markSize: 24,
  },
}

export async function renderPostcard(
  data: AppData,
  moment: Moment,
  format: PostcardFormat,
  visibleIds: readonly string[],
  now: Date = today(),
): Promise<Blob> {
  const [W, H] = SIZE[format]
  const layout = LAYOUT[format]
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no canvas')
  const horizon = H * layout.horizon
  const today = todayKey(now)

  // Sky and sea.
  const sky = ctx.createLinearGradient(0, 0, 0, horizon)
  sky.addColorStop(0, '#03070f')
  sky.addColorStop(1, '#0b1a3a')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, horizon)
  const sea = ctx.createLinearGradient(0, horizon, 0, H)
  sea.addColorStop(0, '#0a2447')
  sea.addColorStop(0.3, '#06122b')
  sea.addColorStop(1, '#020409')
  ctx.fillStyle = sea
  ctx.fillRect(0, horizon, W, H - horizon)
  const band = ctx.createLinearGradient(0, horizon, 0, horizon + (H - horizon) * 0.12)
  band.addColorStop(0, 'rgba(62, 242, 224, 0.14)')
  band.addColorStop(1, 'rgba(62, 242, 224, 0)')
  ctx.fillStyle = band
  ctx.fillRect(0, horizon, W, (H - horizon) * 0.12)

  // The day-stars: the same calendar the sky draws, at this size.
  const starCanvas = document.createElement('canvas')
  const stars = new StarField(starCanvas)
  stars.resize(W, horizon, 1)
  const dates = starDays(data)
  stars.setDays(dates, streakDays(dates), today)
  ctx.drawImage(starCanvas, 0, 0)

  // The shore, then everything unlocked that was on screen.
  const shoreTop = horizon - H * 0.02
  await drawSvg(ctx, shoreSvg(), 0, shoreTop, W, H * (format === 'story' ? 0.06 : 0.07))
  const scale = Math.min(W / PHONE_W, H / PHONE_H)
  const items = visibleIds
    .map((id) => COLLECTIBLES.find((c) => c.id === id))
    .filter((c): c is Collectible => c !== undefined)
  for (const item of items) {
    const size = item.size * scale
    const y = mapY(item.y, horizon, H)
    const top = item.world === 'garden' ? y - size : y - size / 2
    await drawSvg(ctx, collectibleSvg(item), item.x * W - size / 2, top, size, size)
  }

  if (moment.kind === 'whale') {
    const width = W * 0.62
    const height = width / 2
    await drawSvg(
      ctx,
      whaleSvg(hasJacket(items)),
      (W - width) / 2,
      horizon - height * 0.6,
      width,
      height,
    )
  }

  await Promise.all([
    document.fonts.load(`700 ${layout.lineSize}px "Fraunces Variable"`),
    document.fonts.load(`700 ${layout.captionSize}px "Atkinson Hyperlegible"`),
  ]).catch(() => undefined)

  // The moment's line, big; the day and the date under it.
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#fff4d6'
  ctx.font = `700 ${layout.lineSize}px "Fraunces Variable", Georgia, serif`
  const lines = wrap(ctx, moment.line, W - 160)
  const lineHeight = layout.lineSize * 1.15
  const firstY = H * layout.lineY - (lines.length - 1) * lineHeight
  lines.forEach((text, i) => ctx.fillText(text, W / 2, firstY + i * lineHeight))

  ctx.font = `700 ${layout.captionSize}px "Atkinson Hyperlegible", system-ui, sans-serif`
  ctx.fillStyle = 'rgba(232, 240, 245, 0.75)'
  const date = fromKey(today).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  ctx.fillText(
    `${voice.share.caption(dayNumber(data, today))} · ${date}`,
    W / 2,
    H * layout.captionY,
  )

  await drawCreatures(ctx, data, today, W, H * layout.creaturesY, layout)

  // The mark, small, in the corner.
  ctx.textAlign = 'right'
  ctx.font = `900 ${layout.markSize}px "Fraunces Variable", Georgia, serif`
  ctx.fillStyle = 'rgba(255, 244, 214, 0.85)'
  ctx.fillText(BRAND.name, W - 40, H - 36)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('toBlob failed'))
    }, 'image/png')
  })
}

/** Scene y (as a share of the scene) to postcard y, keeping sky things in the sky and sea things in the sea. */
function mapY(y: number, horizon: number, H: number): number {
  if (y < SCENE_HORIZON) return (y / SCENE_HORIZON) * horizon
  return horizon + ((y - SCENE_HORIZON) / (1 - SCENE_HORIZON)) * (H - horizon) * 0.7
}

function hasJacket(items: readonly Collectible[]): boolean {
  return items.some((c) => c.id === 'sea-a-jacket')
}

/** A thing's bubble on the postcard, as large as this share of its creature. */
const BUBBLE_SHARE = 0.36

async function drawCreatures(
  ctx: CanvasRenderingContext2D,
  data: AppData,
  today: string,
  W: number,
  top: number,
  layout: Layout,
): Promise<void> {
  const things = [...data.things].sort((a, b) => a.order - b.order)
  if (things.length === 0) return
  const size = layout.creatureSize
  const gap = size * 0.35
  const total = things.length * size + (things.length - 1) * gap
  let x = (W - total) / 2
  ctx.textAlign = 'center'
  ctx.font = `700 ${layout.nameSize}px "Atkinson Hyperlegible", system-ui, sans-serif`
  ctx.fillStyle = '#e8f0f5'
  for (const thing of things) {
    const svg = creatureSvg(
      thing.world,
      lineFor(data, thing),
      stageFor(last7(data, thing.id, today)),
    )
    await drawSvg(ctx, svg, x, top, size, size)
    // Its bubble at the corner, as on its card: filled if it was done that day.
    const bubble = size * BUBBLE_SHARE
    await drawSvg(
      ctx,
      dayBubble(data, thing, today),
      x + size - bubble * 0.8,
      top - bubble * 0.2,
      bubble,
      bubble,
    )
    ctx.fillText(
      fit(ctx, thing.name, size + gap * 0.8),
      x + size / 2,
      top + size + layout.nameSize * 1.2,
    )
    x += size + gap
  }
}

/** A name cut to a width, with an ellipsis, so it never runs into its neighbour's. */
function fit(ctx: CanvasRenderingContext2D, text: string, width: number): string {
  if (ctx.measureText(text).width <= width) return text
  let cut = Array.from(text)
  while (cut.length > 1 && ctx.measureText(`${cut.join('')}…`).width > width) cut = cut.slice(0, -1)
  return `${cut.join('').trimEnd()}…`
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (ctx.measureText(next).width > width && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 3)
}

async function drawSvg(
  ctx: CanvasRenderingContext2D,
  markup: string,
  x: number,
  y: number,
  width: number,
  height: number,
): Promise<void> {
  const sized = resolveTokens(markup).replace(
    /^<svg /,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(1, Math.round(width))}" height="${Math.max(1, Math.round(height))}" `,
  )
  const image = new Image()
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`
  await image.decode()
  ctx.drawImage(image, x, y, width, height)
}
