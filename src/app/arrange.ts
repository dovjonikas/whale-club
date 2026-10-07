import { icon } from '../brand/icons'
import { collectibleSvg } from '../scene/collectibles'
import type { Scene } from '../scene/scene'
import { CHEST, freeSpot, moveTo, type Spot } from '../scene/spots'
import type { Store } from '../store/store'
import { voice } from '../voice'
import { host } from './host'
import { arrangementOf, type Arrangement } from './sceneData'
import { escapeHtml } from './thingMark'
import { announce } from './toast'

/** A press that travels this far, in px, is a drag; less is a tap. */
const DRAG_START_PX = 6
/** A thing let go this close to a place, in px at a 390 px phone, goes into it. */
const SNAP_RADIUS = 56
/** The ring a place shows, in px at a 390 px phone. */
const RING = 48

export interface ArrangeOptions {
  /** A thing to start with in hand: something just bought. */
  held?: string
  /** An extension just bought: its new places glow. */
  room?: string
  /** A line in place of the usual hint: what just arrived. */
  note?: string
  onClose: () => void
}

/**
 * Arranging the scene. The scene stops and every place shows as a soft
 * ring; a thing is dragged to another place of its own world and snaps
 * in, and if someone stands there the two change places. A tap picks a
 * thing up and a tap on a ring puts it down, so it works without
 * dragging and from a keyboard. Things can be put away into the chest
 * and put out again. "tidy up" goes back to the automatic arrangement,
 * "done" leaves. Nothing is marked or bought from here: the row and the
 * dock are out of reach until it closes.
 */
export function openArrange(store: Store, scene: Scene, options: ArrangeOptions): () => void {
  const app = document.getElementById('app')
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  let held: string | null = options.held ?? null
  let chestOpen = false
  let closed = false

  scene.setArranging(true)
  app?.setAttribute('inert', '')
  document.body.dataset.arranging = 'true'

  const rings = document.createElement('div')
  rings.className = 'arrange-rings'
  scene.root.append(rings)

  const ui = document.createElement('section')
  ui.className = 'arrange-ui'
  ui.setAttribute('role', 'dialog')
  ui.setAttribute('aria-labelledby', 'arrange-title')
  ui.innerHTML = `
    <div class="arrange-top">
      <div class="arrange-heading">
        <h2 class="arrange-title" id="arrange-title" tabindex="-1">${voice.arrange.title}</h2>
        <p class="arrange-hint"></p>
      </div>
      <button type="button" class="button-quiet arrange-tidy">${voice.arrange.tidy}</button>
      <button type="button" class="button-primary arrange-done">${voice.arrange.done}</button>
    </div>
    <div class="arrange-bottom">
      <div class="arrange-chest-list" hidden></div>
      <div class="arrange-tray">
        <button type="button" class="arrange-away" hidden>${icon('chest')}<span>${voice.arrange.putAway}</span></button>
        <button type="button" class="arrange-chest" aria-expanded="false">${icon('chest')}<span class="arrange-chest-label"></span></button>
      </div>
    </div>`
  host().append(ui)

  const query = (selector: string): HTMLElement => {
    const element = ui.querySelector<HTMLElement>(selector)
    if (!element) throw new Error(`arrange without ${selector}`)
    return element
  }
  const away = query('.arrange-away')
  const chestButton = query('.arrange-chest')
  const chestLabel = query('.arrange-chest-label')
  const chestList = query('.arrange-chest-list')
  query('.arrange-hint').textContent = options.note
    ? `${options.note} ${voice.arrange.hint}`
    : voice.arrange.hint

  /** Moves a thing to a place (or the chest) and keeps the whole arrangement as records. */
  const move = (item: string, target: string): boolean => {
    const now = arrangementOf(store.get())
    const records = moveTo(now.where, now.things, item, target, now.rooms)
    if (!records) {
      announce(voice.arrange.noRoom)
      return false
    }
    const moving = [
      item,
      ...now.things
        .map((t) => t.id)
        .filter((id) => records[id] !== now.where.get(id) && id !== item),
    ]
    const before = measure(scene, moving)
    store.setPlacement(records)
    snap(before)
    return true
  }

  const render = (): void => {
    const now = arrangementOf(store.get())
    if (held !== null && !now.where.has(held)) held = null
    rings.innerHTML = ringsHtml(now, held, options.room)
    rings.dataset.holding =
      held === null ? '' : (now.things.find((t) => t.id === held)?.world ?? '')
    for (const element of scene.root.querySelectorAll<HTMLElement>('.collectible.is-held')) {
      element.classList.remove('is-held')
    }
    if (held !== null) scene.collectibleElement(held)?.classList.add('is-held')
    const inChest = now.things.filter((t) => now.where.get(t.id) === CHEST)
    chestLabel.textContent = `${voice.arrange.chest} · ${String(inChest.length)}`
    away.hidden = held === null || now.where.get(held) === CHEST
    chestButton.setAttribute('aria-expanded', String(chestOpen))
    chestList.hidden = !chestOpen
    chestList.innerHTML =
      inChest.length === 0
        ? `<p class="sheet-note">${voice.arrange.chestEmpty}</p>`
        : `<ul class="arrange-chest-items">${inChest
            .map(
              (t) => `<li>
                <span class="arrange-chest-art">${collectibleSvg(t.item)}</span>
                <span class="arrange-chest-name">${escapeHtml(t.item.name)}</span>
                <button type="button" class="button-quiet arrange-out" data-item="${t.id}">${voice.arrange.putOut}</button>
              </li>`,
            )
            .join('')}</ul>`
  }

  // --- Taps: pick up, put down --------------------------------------------------------------

  const tapRing = (spot: string, holder: string | null): void => {
    if (held === null) {
      if (holder !== null) held = holder
    } else if (holder === held) held = null
    else if (move(held, spot)) held = null
    render()
    rings.querySelector<HTMLElement>(`[data-spot="${spot}"]`)?.focus({ preventScroll: true })
  }

  // --- Drags: follow the finger, snap to the nearest place of its world ----------------------

  let drag: {
    id: number
    item: string
    spot: string
    x: number
    y: number
    element: HTMLElement | null
    moved: boolean
  } | null = null
  /** A drag just ended; the click the browser sends after it is ignored. */
  let dragged = false

  rings.addEventListener('pointerdown', (event) => {
    // A touch drag sends no click after it, so the flag is cleared by the next press.
    dragged = false
    const ring = (event.target as Element).closest<HTMLElement>('.arrange-spot')
    if (drag || !ring || event.button !== 0) return
    const holder = ring.dataset.holder ?? ''
    if (!holder) return
    drag = {
      id: event.pointerId,
      item: holder,
      spot: ring.dataset.spot ?? '',
      x: event.clientX,
      y: event.clientY,
      element: scene.collectibleElement(holder),
      moved: false,
    }
    try {
      ring.setPointerCapture(event.pointerId)
    } catch {
      // Already gone; the drag still works from where it is.
    }
  })
  rings.addEventListener('pointermove', (event) => {
    if (event.pointerId !== drag?.id) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_START_PX) return
    if (!drag.moved) {
      drag.moved = true
      held = drag.item
      render()
    }
    if (drag.element) {
      drag.element.classList.add('is-dragging')
      drag.element.style.transform = `translate(-50%, var(--anchor-y)) translate3d(${String(dx)}px, ${String(dy)}px, 0) scale(1.08)`
    }
    const target = nearest(rings, event.clientX, event.clientY)
    for (const ring of rings.querySelectorAll('.arrange-spot.is-target'))
      ring.classList.remove('is-target')
    target?.classList.add('is-target')
  })
  const release = (event: PointerEvent): void => {
    if (event.pointerId !== drag?.id) return
    const { item, spot, element, moved } = drag
    drag = null
    // A press that did not travel is a tap: the click that follows handles it.
    if (!moved) return
    dragged = true
    const target = nearest(rings, event.clientX, event.clientY)
    element?.classList.remove('is-dragging')
    if (target && target.dataset.spot !== spot && move(item, target.dataset.spot ?? '')) {
      held = null
    } else if (element) {
      // Back where it was, from where it was let go.
      const before = measure(scene, [item])
      element.style.transform = ''
      snap(before)
    }
    render()
  }
  rings.addEventListener('pointerup', release)
  rings.addEventListener('pointercancel', release)
  rings.addEventListener('click', (event) => {
    // The click a drag ends with is not a tap.
    if (dragged) {
      dragged = false
      return
    }
    const ring = (event.target as Element).closest<HTMLElement>('.arrange-spot')
    if (ring) tapRing(ring.dataset.spot ?? '', ring.dataset.holder ?? null)
  })

  // --- The tray, the chest, tidy up, done ----------------------------------------------------

  away.addEventListener('click', () => {
    if (held !== null && move(held, CHEST)) held = null
    render()
    chestButton.focus()
  })
  chestButton.addEventListener('click', () => {
    chestOpen = !chestOpen
    render()
  })
  chestList.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLElement>('.arrange-out')
    const item = button?.dataset.item
    if (!item) return
    const now = arrangementOf(store.get())
    const world = now.things.find((t) => t.id === item)?.world
    const free = world ? freeSpot(now.where, world, now.rooms) : null
    const records = free ? moveTo(now.where, now.things, item, free.id, now.rooms) : null
    if (!free || !records) {
      announce(voice.arrange.noRoom)
      return
    }
    store.setPlacement(records)
    held = item
    render()
    rings.querySelector<HTMLElement>(`[data-spot="${free.id}"]`)?.focus({ preventScroll: true })
  })
  query('.arrange-tidy').addEventListener('click', () => {
    const now = arrangementOf(store.get())
    const before = measure(
      scene,
      now.things.map((t) => t.id),
    )
    store.setPlacement(null)
    snap(before)
    held = null
    render()
  })

  // Every redraw of the data redraws the rings, so they never disagree with the scene.
  const unsubscribe = store.subscribe(() => {
    if (!closed) render()
  })

  const close = (): void => {
    if (closed) return
    closed = true
    unsubscribe()
    document.removeEventListener('keydown', onKey)
    for (const element of scene.root.querySelectorAll<HTMLElement>('.collectible.is-held')) {
      element.classList.remove('is-held')
    }
    rings.remove()
    ui.remove()
    scene.setArranging(false)
    app?.removeAttribute('inert')
    delete document.body.dataset.arranging
    if (opener?.isConnected) opener.focus({ preventScroll: true })
    options.onClose()
  }
  query('.arrange-done').addEventListener('click', close)
  const onKey = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return
    if (held !== null) {
      held = null
      render()
    } else close()
  }
  document.addEventListener('keydown', onKey)

  render()
  query('.arrange-title').focus({ preventScroll: true })
  return close
}

/** One ring per place: where it is, who stands there, and whether the held thing could go there. */
function ringsHtml(now: Arrangement, held: string | null, room: string | undefined): string {
  const holderOf = new Map<string, string>()
  for (const [item, at] of now.where) if (at !== CHEST) holderOf.set(at, item)
  const names = new Map(now.things.map((t) => [t.id, t.item.name]))
  const heldWorld = now.things.find((t) => t.id === held)?.world
  const counts: Record<string, number> = {}
  return now.spots
    .map((spot: Spot) => {
      counts[spot.world] = (counts[spot.world] ?? 0) + 1
      const n = counts[spot.world] ?? 0
      const holder = holderOf.get(spot.id) ?? ''
      const name = holder ? (names.get(holder) ?? '') : ''
      const label = holder ? voice.arrange.place(name, n) : voice.arrange.empty(n)
      const state = [
        holder ? 'is-taken' : 'is-free',
        holder !== '' && holder === held ? 'is-held' : '',
        heldWorld !== undefined && heldWorld !== spot.world ? 'is-other' : '',
        room !== undefined && spot.room === room ? 'is-new' : '',
      ].join(' ')
      // A thing that stands on its place has its middle above it, so the ring rises to meet it.
      const top = spot.stand
        ? `calc(${(spot.y * 100).toFixed(2)}% - ${String(Math.round((RING / 2) * spot.depth))}px * var(--scene-scale, 1))`
        : `${(spot.y * 100).toFixed(2)}%`
      return `<button type="button" class="arrange-spot ${state}" data-spot="${spot.id}" data-world="${spot.world}" data-holder="${holder}" aria-label="${escapeHtml(label)}" aria-pressed="${String(holder !== '' && holder === held)}" style="left: ${(spot.x * 100).toFixed(2)}%; top: ${top}; --depth: ${String(spot.depth)}"></button>`
    })
    .join('')
}

/** The ring of the held thing's world nearest a point, if one is close enough. */
function nearest(rings: HTMLElement, x: number, y: number): HTMLElement | null {
  const world = rings.dataset.holding
  const scale = rings.getBoundingClientRect().width / 390
  let best: HTMLElement | null = null
  let distance = SNAP_RADIUS * Math.max(1, scale)
  for (const ring of rings.querySelectorAll<HTMLElement>('.arrange-spot')) {
    if (ring.dataset.world !== world) continue
    const rect = ring.getBoundingClientRect()
    const d = Math.hypot(rect.left + rect.width / 2 - x, rect.top + rect.height / 2 - y)
    if (d < distance) {
      distance = d
      best = ring
    }
  }
  return best
}

/** Where some shown things are on screen now, before a move. */
function measure(scene: Scene, ids: readonly string[]): Map<HTMLElement, DOMRect> {
  const rects = new Map<HTMLElement, DOMRect>()
  for (const id of ids) {
    const element = scene.collectibleElement(id)
    if (element) rects.set(element, element.getBoundingClientRect())
  }
  return rects
}

/**
 * After a move: each thing jumps to its new place, is put back where it
 * was by a transform, and slides home from there. Transform only, so it
 * stays smooth; reduced motion lands it at once.
 */
function snap(before: ReadonlyMap<HTMLElement, DOMRect>): void {
  for (const [element, was] of before) {
    if (!element.isConnected) continue
    element.style.transform = ''
    const now = element.getBoundingClientRect()
    const dx = was.left - now.left
    const dy = was.top - now.top
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue
    element.classList.remove('is-snapping')
    element.style.transform = `translate(-50%, var(--anchor-y)) translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`
    requestAnimationFrame(() => {
      element.classList.add('is-snapping')
      element.style.transform = ''
      element.addEventListener(
        'transitionend',
        () => {
          element.classList.remove('is-snapping')
        },
        { once: true },
      )
    })
  }
}
