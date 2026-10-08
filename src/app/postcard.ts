import { PHONE_WIDTH } from '../scene/phone'
import { artFor, collectibleSvg, type Collectible } from '../scene/collectibles'
import { resolveTokens } from '../scene/palette'
import { shoreSvg } from '../scene/shore'
import { StarField } from '../scene/stars'
import { whaleSvg } from '../scene/visitors'
import { today } from '../store/clock'
import { todayKey, writtenDate } from '../store/dates'
import { dayNumber, last7, lineFor, stageFor, starDays } from '../store/derive'
import type { AppData, PostcardFormat } from '../store/types'
import { voice } from '../voice'
import { BRAND } from './brand'
import { lanternsFor, shownCollectibles } from './sceneData'
import { hash, seeded } from '../scene/random'
import { LEGENDARIES } from '../scene/legendary'
import { islandWhaleSvg, pierSvg, reefSvg, shoreEdgeSvg } from '../scene/dock/scene'
import { shownItems, wornBy } from './dockData'
import { dressedSvg } from '../scene/dock/wear'
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
export type MomentKind = 'whale' | 'unlock' | 'recap' | 'stage' | 'sea' | 'legendary' | 'milestone'

export interface Moment {
  kind: MomentKind
  line: string
  /** A legendary's postcard: which one, and its plaque ("earned on ... · day 30"). */
  legendary?: { id: string; plaque: string }
  /** A milestone's card: day 100, 200 or 365 of whale club. */
  milestone?: number
}

/** Each size in pixels, also the preview's own width and height so it never jumps. */
export const POSTCARD_SIZE: Record<PostcardFormat, readonly [number, number]> = {
  story: [1080, 1920],
  square: [1080, 1080],
}

/** The scene's collectible sizes are for a 390px phone; this is that phone's height for scaling. */
/** Where the dock's layers are in the scene, as fractions of its height (dock.css). */
const ISLAND_TOP = 0.493
const ISLAND_WIDTH = 0.5
const EDGE_TOP = 0.6
const REEF_TOP = 0.686
const SAND_LINE = 0.592
/** The gold frame of a legendary's card, in px of the card. */
const FRAME_INSET = 22
/** The milestone whose card is the year's. */
const YEAR = 365
const FRAME_WIDTH = 12
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
  const [W, H] = POSTCARD_SIZE[format]
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

  // The day-stars: the same constellation path the sky draws, at this size.
  const starCanvas = document.createElement('canvas')
  const stars = new StarField(starCanvas)
  stars.resize(W, horizon, 1)
  const dates = starDays(data)
  stars.setDays(dates)
  ctx.drawImage(starCanvas, 0, 0)

  // The shore, then everything unlocked that was on screen.
  const shoreTop = horizon - H * 0.02
  await drawSvg(ctx, shoreSvg(), 0, shoreTop, W, H * (format === 'story' ? 0.06 : 0.07))
  const scale = Math.min(W / PHONE_WIDTH, H / PHONE_H)
  if ((moment.milestone ?? 0) >= YEAR) paintCove(ctx, data, W, horizon, H)
  await drawDock(ctx, data, W, H, horizon, scale)
  // Where each thing stands now, so the postcard shows the person's own arrangement.
  const visible = new Set(visibleIds)
  const placed = shownCollectibles(data).filter(({ item }) => visible.has(item.id))
  const items = placed.map(({ item }) => item)
  for (const { item, at } of placed) {
    const size = item.size * at.depth * scale
    const y = mapY(at.y, horizon, H)
    const top = at.stand ? y - size : y - size / 2
    await drawFind(ctx, item, at.x * W - size / 2, top, size, size)
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

  // A legendary, large over the horizon: it was earned, and the card says so in gold.
  const legend =
    moment.kind === 'legendary' ? LEGENDARIES.find((l) => l.id === moment.legendary?.id) : undefined
  if (legend) {
    const size = W * 0.42
    await drawSvg(
      ctx,
      collectibleSvg(legend.find),
      (W - size) / 2,
      horizon - size * 0.78,
      size,
      size,
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
  const date = writtenDate(today)
  ctx.fillText(
    legend && moment.legendary
      ? moment.legendary.plaque
      : `${voice.share.caption(moment.milestone ?? dayNumber(data, today))} · ${date}`,
    W / 2,
    H * layout.captionY,
  )
  if (legend) goldFrame(ctx, W, H)
  if (moment.milestone !== undefined) silverFrame(ctx, W, H)

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
    const svg = dressedSvg(
      thing.world,
      lineFor(data, thing),
      stageFor(last7(data, thing.id, today)),
      wornBy(data, thing.id),
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

/**
 * The pier and the extensions things stand on (the island on its whale,
 * the sand edge, the reef), so a thing placed on them is not left in the
 * air. Drawn at the places the scene has them, through the same mapping.
 */
/** A milestone's frame: a fine pale line, quieter than the legendary's gold. */
function silverFrame(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  ctx.strokeStyle = 'rgba(232, 240, 245, 0.7)'
  ctx.lineWidth = 3
  ctx.strokeRect(FRAME_INSET, FRAME_INSET, W - 2 * FRAME_INSET, H - 2 * FRAME_INSET)
}

/**
 * The year's card shows the whole cove: every lantern there is, as the
 * scene had them before older ones merged into a glow. Placed by each
 * lantern's own key, so the same year paints the same cove.
 */
function paintCove(
  ctx: CanvasRenderingContext2D,
  data: AppData,
  W: number,
  horizon: number,
  H: number,
): void {
  for (const lantern of lanternsFor(data)) {
    const random = seeded(hash(`card|${lantern.key}`))
    const x = (0.04 + random() * 0.92) * W
    const y = horizon + (0.03 + Math.pow(random(), 1.5) * 0.16) * (H - horizon)
    const r = (2 + lantern.size) * (W / PHONE_WIDTH)
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3)
    glow.addColorStop(0, lantern.color)
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.globalAlpha = lantern.glow === 'dim' ? 0.35 : lantern.glow === 'soft' ? 0.65 : 0.9
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(x, y, r * 3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/** The legendary card's frame: a gold edge with a fine line inside it, like a plaque. */
function goldFrame(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const gold = ctx.createLinearGradient(0, 0, W, H)
  gold.addColorStop(0, '#fff1c1')
  gold.addColorStop(0.45, '#e2a93b')
  gold.addColorStop(1, '#fff1c1')
  ctx.strokeStyle = gold
  ctx.lineWidth = FRAME_WIDTH
  ctx.strokeRect(FRAME_INSET, FRAME_INSET, W - 2 * FRAME_INSET, H - 2 * FRAME_INSET)
  ctx.lineWidth = 2
  const inner = FRAME_INSET + FRAME_WIDTH
  ctx.strokeRect(inner, inner, W - 2 * inner, H - 2 * inner)
}

async function drawDock(
  ctx: CanvasRenderingContext2D,
  data: AppData,
  W: number,
  H: number,
  horizon: number,
  scale: number,
): Promise<void> {
  if (data.things.length === 0) return
  const owned = new Set(shownItems(data).map((item) => item.id))
  if (owned.has('island')) {
    const width = W * ISLAND_WIDTH
    await drawSvg(ctx, islandWhaleSvg(), 0, mapY(ISLAND_TOP, horizon, H), width, (width * 60) / 176)
  }
  if (owned.has('longer-shore'))
    await drawSvg(ctx, shoreEdgeSvg(), 0, mapY(EDGE_TOP, horizon, H), W, (W * 28) / 1000)
  if (owned.has('reef'))
    await drawSvg(ctx, reefSvg(), 0, mapY(REEF_TOP, horizon, H), W, (W * 84) / 1000)
  const long = owned.has('longer-dock')
  const pierWidth = (long ? 72 : 60) * scale
  const unit = pierWidth / 60
  await drawSvg(
    ctx,
    pierSvg(long, owned.has('dock-lanterns')),
    W / 2 - pierWidth / 2,
    mapY(SAND_LINE, horizon, H) - 10 * unit,
    pierWidth,
    (long ? 64 : 44) * unit,
  )
}

/** A find on the card: its art slot's picture as an image, or its drawing as SVG. */
async function drawFind(
  ctx: CanvasRenderingContext2D,
  item: Collectible,
  x: number,
  y: number,
  width: number,
  height: number,
): Promise<void> {
  const art = artFor(item.id)
  if (!art) {
    await drawSvg(ctx, collectibleSvg(item), x, y, width, height)
    return
  }
  const image = new Image()
  image.src = art
  try {
    await image.decode()
    ctx.drawImage(image, x, y, width, height)
  } catch {
    // A picture that will not load: the drawing stands in, as everywhere else.
    await drawSvg(ctx, collectibleSvg(item), x, y, width, height)
  }
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
