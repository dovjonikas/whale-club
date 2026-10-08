import { collectibleSvg } from '../scene/collectibles'
import { sampleShape } from '../scene/constellations'
import type { Legendary } from '../scene/legendary'
import type { Scene } from '../scene/scene'
import { voice } from '../voice'
import { host } from './host'
import { escapeHtml } from './thingMark'
import { announce } from './toast'

/** The ceremony's steps, in ms from its start: dark, the constellation lit, the beam, the find, the plaque. */
const STEPS = { lit: 300, beam: 900, find: 1500, plaque: 2300 } as const

export interface CeremonyOptions {
  legendary: Legendary
  /** How many stars its constellation has. */
  stars: number
  /** "earned on 2026-11-12 · day 30". */
  plaque: string
  onSend: () => void
  onClose: () => void
}

/**
 * A legendary arrives, unlike anything else: the scene goes dark, the
 * whole constellation lights, a beam of light comes down, and the
 * legendary appears in it, its name and the day it was earned on a plaque
 * under it. About three seconds; a tap anywhere goes straight to the end.
 * Under reduced motion it all simply fades in. "send this" makes its
 * postcard, in a gold frame.
 */
export function playCeremony(scene: Scene, options: CeremonyOptions): void {
  const { legendary } = options
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const app = document.getElementById('app')
  const root = document.createElement('section')
  root.className = 'ceremony'
  root.setAttribute('role', 'dialog')
  root.setAttribute('aria-modal', 'true')
  root.setAttribute('aria-labelledby', 'ceremony-name')
  root.innerHTML = `
    <div class="ceremony-dim" aria-hidden="true"></div>
    <svg class="ceremony-stars" viewBox="-4 -4 108 68" aria-hidden="true">${constellationSvg(legendary, options.stars)}</svg>
    <div class="ceremony-beam" aria-hidden="true"></div>
    <div class="ceremony-find" aria-hidden="true">${collectibleSvg(legendary.find)}<span class="legend-sparkle"></span><span class="legend-sparkle"></span><span class="legend-sparkle"></span></div>
    <div class="ceremony-plaque">
      <p class="ceremony-kind">${voice.legend.title}</p>
      <h2 class="ceremony-name" id="ceremony-name" tabindex="-1">${escapeHtml(legendary.name)}</h2>
      <p class="ceremony-date">${escapeHtml(options.plaque)}</p>
      <div class="ceremony-actions">
        <button type="button" class="button-quiet ceremony-send">${voice.postcard.sendThis}</button>
        <button type="button" class="button-primary ceremony-ok">${voice.legend.ok}</button>
      </div>
    </div>`
  host().append(root)
  app?.setAttribute('inert', '')
  scene.root.dataset.ceremony = 'true'

  const timers: number[] = []
  const step = (name: string): void => {
    root.classList.add(`is-${name}`)
  }
  const finish = (): void => {
    for (const timer of timers) clearTimeout(timer)
    for (const name of ['dark', 'lit', 'beam', 'find', 'plaque']) step(name)
    root.querySelector<HTMLElement>('.ceremony-ok')?.focus({ preventScroll: true })
  }
  // Two frames, so the dark starts from the scene as it was.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      step('dark')
      timers.push(
        window.setTimeout(() => step('lit'), STEPS.lit),
        window.setTimeout(() => step('beam'), STEPS.beam),
        window.setTimeout(() => step('find'), STEPS.find),
        window.setTimeout(finish, STEPS.plaque),
      )
    })
  })
  announce(voice.legend.earned(legendary.name))

  const close = (): void => {
    for (const timer of timers) clearTimeout(timer)
    document.removeEventListener('keydown', onKey)
    root.remove()
    delete scene.root.dataset.ceremony
    app?.removeAttribute('inert')
    if (opener?.isConnected) opener.focus({ preventScroll: true })
    options.onClose()
  }
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') close()
  }
  document.addEventListener('keydown', onKey)
  root.addEventListener('click', (event) => {
    const target = event.target as Element
    if (target.closest('.ceremony-ok')) close()
    else if (target.closest('.ceremony-send')) {
      close()
      options.onSend()
    } else if (!root.classList.contains('is-plaque')) finish()
  })
}

/** The whole constellation, lit: every star and every line of its shape. */
function constellationSvg(legendary: Legendary, count: number): string {
  const stars = sampleShape(legendary.shape, count)
  const lines = stars
    .map((star, i) => {
      const next = stars[i + 1]
      return next?.stroke === star.stroke
        ? `<line x1="${star.x.toFixed(1)}" y1="${star.y.toFixed(1)}" x2="${next.x.toFixed(1)}" y2="${next.y.toFixed(1)}"/>`
        : ''
    })
    .join('')
  const dots = stars
    .map((star) => `<circle cx="${star.x.toFixed(1)}" cy="${star.y.toFixed(1)}" r="0.9"/>`)
    .join('')
  return `<g class="ceremony-lines">${lines}</g><g class="ceremony-dots">${dots}</g>`
}
