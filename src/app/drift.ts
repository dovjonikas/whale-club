import type { Scene } from '../scene/scene'
import { reducedMotion } from '../scene/ticker'
import type { VisitorKind } from '../scene/visitors'
import { voice } from '../voice'
import { host } from './host'
import type { Sound } from './sound'
import { keepAwake, letSleep } from './wakeLock'

/**
 * Drift: only the sea. The whole interface fades away and the scene stays,
 * with its own life: the stars, the creatures, a visitor passing now and
 * then, the whale coming up once in a while, and the quiet sea sound if
 * sound is on. The screen stays awake. A tap anywhere, Escape, or coming
 * back to the app after leaving it brings everything back; the one quiet
 * line at the bottom says so. Nothing is counted while drifting.
 */

/** A visitor passes this often, and the whale comes up every fourth time. */
const PASS_MS = 22_000
const WHALE_EVERY = 4
const PASSERS: readonly VisitorKind[] = ['fish', 'jelly', 'turtle', 'meteor', 'fish', 'firefly']

export interface DriftOptions {
  scene: Scene
  sound: Sound
  /** The whale wears its jacket from day 90. */
  jacket: () => boolean
}

export function startDrift({ scene, sound, jacket }: DriftOptions): void {
  if (document.querySelector('.drift-veil')) return
  const app = document.getElementById('app')
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const sea = !sound.isMuted()

  const veil = document.createElement('button')
  veil.type = 'button'
  veil.className = 'drift-veil'
  veil.setAttribute('aria-label', voice.drift.back)
  veil.innerHTML = `<span class="drift-hint" aria-hidden="true">${voice.drift.back}</span>`

  let passed = 0
  const pass = (): void => {
    passed++
    if (passed % WHALE_EVERY === 0) scene.surfaceWhale(jacket())
    else scene.visit(PASSERS[passed % PASSERS.length] ?? 'fish')
  }
  // Under reduced motion the sea stays still: nothing passes through it.
  const timer = reducedMotion() ? 0 : window.setInterval(pass, PASS_MS)
  // The first one sooner, so the sea shows it is alive.
  const first = reducedMotion() ? 0 : window.setTimeout(pass, PASS_MS / 3)

  const end = (): void => {
    window.clearInterval(timer)
    window.clearTimeout(first)
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('visibilitychange', onHide)
    if (sea) sound.setSea(false)
    letSleep()
    app?.classList.remove('is-drifting')
    app?.removeAttribute('inert')
    veil.remove()
    opener?.focus({ preventScroll: true })
  }
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') end()
  }
  // Coming back to the app after leaving it is coming back to the app.
  const onHide = (): void => {
    if (document.hidden) end()
  }

  veil.addEventListener('click', end)
  document.addEventListener('keydown', onKey)
  document.addEventListener('visibilitychange', onHide)
  host().append(veil)
  app?.classList.add('is-drifting')
  app?.setAttribute('inert', '')
  if (sea) sound.setSea(true)
  keepAwake()
  veil.focus({ preventScroll: true })
}
