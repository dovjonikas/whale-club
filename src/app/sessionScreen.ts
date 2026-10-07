import { escapeHtml, thingMark } from './thingMark'
import { dressedSvg } from '../scene/dock/wear'
import { beginningSvg } from '../scene/creatures'
import type { Line, Stage } from '../store/derive'
import type { Thing } from '../store/types'
import { voice } from '../voice'
import { host } from './host'

/**
 * The screen while a lock-in runs. The world sinks out of sight and deep
 * water rises over it; what stays is the thing's creature, small at first
 * (an egg, a spark, a seed) and growing as the minutes pass, a slow ring
 * around it, and the thing's name. It breathes and now and then blinks;
 * it is company.
 *
 * The time is hidden unless the person asks for it in settings: a tap
 * anywhere shows it for SHOW_TIME_MS. A countdown watched is a countdown
 * that becomes the thing, and the session is the point.
 *
 * In the first seconds the session can be undone; after that it can be
 * stopped. Once per session it can pause, and the creature sleeps.
 */
const BEGINNING = 0.12
const STAGE_SPAN = 0.22
const SHOW_TIME_MS = 3000

export interface SessionOptions {
  /** What the creature wears from the dock. */
  worn?: readonly string[]
  sound: boolean
  showTime: boolean
  onSound: (on: boolean) => void
  onStop: () => void
  onUndo: () => void
  onPause: () => void
  onGoOn: () => void
}

export interface SessionScreen {
  readonly element: HTMLElement
  update(progress: number, remainingMs: number): void
  /** Back after longer than the grace: the count stopped meanwhile and goes on now. */
  away(): void
  paused(on: boolean, used: boolean): void
  undoable(on: boolean): void
  /** The session is over: the screen freezes in its last state, ready for the opening. */
  ended(): void
  /** Where the creature is on screen, for its way home. */
  creature(): HTMLElement
  close(): void
}

/** How long the screen takes to go when a session is stopped: --dur-session-out in tokens.css. */
const SESSION_OUT_MS = 600

export function openSessionScreen(
  thing: Thing,
  line: Line,
  options: SessionOptions,
): SessionScreen {
  const screen = document.createElement('section')
  screen.className = 'session'
  screen.dataset.world = thing.world
  screen.dataset.state = 'running'
  screen.dataset.away = 'false'
  screen.dataset.time = options.showTime ? 'shown' : 'hidden'
  screen.setAttribute('role', 'dialog')
  screen.setAttribute('aria-modal', 'true')
  screen.setAttribute('aria-label', `${voice.lockIn.button}: ${thing.name}`)
  screen.tabIndex = -1
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  screen.innerHTML = `
    <div class="session-deep" aria-hidden="true"><i></i><i></i><i></i><b></b><b></b><b></b><b></b></div>
    <div class="session-top">
      <button type="button" class="chip session-sound" aria-pressed="${String(options.sound)}">${voice.lockIn.seaSound}</button>
    </div>
    <div class="session-centre">
      <div class="session-creature">
        <svg class="session-ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" pathLength="100"/>
          <circle class="session-ring-fill" cx="50" cy="50" r="46" pathLength="100"/>
        </svg>
        <div class="session-breathe"></div>
      </div>
      <div class="session-clock" role="timer" aria-live="off"></div>
      <p class="session-line" aria-live="polite"></p>
      <div class="session-name"></div>
    </div>
    <div class="session-actions">
      <button type="button" class="session-quiet session-undo">${voice.lockIn.undo}</button>
      <button type="button" class="session-quiet session-stop" hidden>${voice.lockIn.stop}</button>
      <button type="button" class="session-quiet session-pause">${voice.lockIn.pause}</button>
    </div>`
  const q = (selector: string): HTMLElement => {
    const element = screen.querySelector<HTMLElement>(selector)
    if (!element) throw new Error(`session is missing ${selector}`)
    return element
  }
  const creature = q('.session-creature')
  const breathe = q('.session-breathe')
  const clock = q('.session-clock')
  const said = q('.session-line')
  const soundButton = q('.session-sound')
  const undoButton = q('.session-undo')
  const stopButton = q('.session-stop')
  const pauseButton = q('.session-pause')
  q('.session-name').innerHTML = `${thingMark(thing)}${escapeHtml(thing.name)}`

  let form = ''
  const grow = (progress: number): void => {
    const next =
      progress < BEGINNING
        ? 'beginning'
        : String(Math.min(3, Math.floor((progress - BEGINNING) / STAGE_SPAN)))
    if (next !== form) {
      form = next
      breathe.innerHTML =
        next === 'beginning'
          ? beginningSvg(thing.world)
          : dressedSvg(thing.world, line, Number(next) as Stage, options.worn ?? [])
    }
    creature.style.setProperty('--grow', (0.55 + 0.6 * progress).toFixed(3))
  }
  const ring = screen.querySelector<SVGCircleElement>('.session-ring-fill')
  const fill = (progress: number): void => {
    ring?.style.setProperty('stroke-dashoffset', (100 - Math.min(1, progress) * 100).toFixed(2))
  }

  // A tap anywhere that is not a button shows the time for a moment.
  let timeTimer = 0
  screen.addEventListener('click', (event) => {
    if (options.showTime || screen.dataset.state === 'ended') return
    if (event.target instanceof Element && event.target.closest('button')) return
    screen.dataset.time = 'shown'
    clearTimeout(timeTimer)
    timeTimer = window.setTimeout(() => {
      screen.dataset.time = 'hidden'
    }, SHOW_TIME_MS)
  })

  soundButton.addEventListener('click', () => {
    const on = soundButton.getAttribute('aria-pressed') !== 'true'
    soundButton.setAttribute('aria-pressed', String(on))
    options.onSound(on)
  })
  undoButton.addEventListener('click', options.onUndo)
  stopButton.addEventListener('click', options.onStop)
  pauseButton.addEventListener('click', () => {
    if (screen.dataset.state === 'paused') options.onGoOn()
    else options.onPause()
  })

  said.textContent = voice.timerStart
  grow(0)
  host().append(screen)
  const app = document.getElementById('app')
  app?.classList.add('is-behind-session')
  app?.setAttribute('inert', '')
  requestAnimationFrame(() => {
    screen.classList.add('is-open')
    screen.focus({ preventScroll: true })
  })

  /** A button that goes while it has the focus hands it on, never to the page. */
  const keepFocus = (leaving: HTMLElement, to: HTMLElement): void => {
    if (document.activeElement === leaving) (to.hidden ? screen : to).focus({ preventScroll: true })
  }

  return {
    element: screen,
    update(progress, remainingMs) {
      clock.textContent = formatClock(remainingMs)
      // The creature is the size of everything seen today: it waited, and grows on.
      grow(progress)
      fill(progress)
    },
    away() {
      screen.dataset.away = 'true'
      said.textContent = voice.lockIn.left
    },
    paused(on, used) {
      screen.dataset.state = on ? 'paused' : 'running'
      creature.classList.toggle('is-asleep', on)
      pauseButton.textContent = on ? voice.lockIn.goOn : voice.lockIn.pause
      // One pause per session: once it is over, the button goes.
      pauseButton.hidden = used && !on
      if (pauseButton.hidden) keepFocus(pauseButton, stopButton)
      said.textContent = on ? voice.lockIn.paused : used ? voice.lockIn.goingOn : said.textContent
    },
    undoable(on) {
      undoButton.hidden = !on
      stopButton.hidden = on
      if (on) keepFocus(stopButton, undoButton)
      else keepFocus(undoButton, stopButton)
    },
    ended() {
      clearTimeout(timeTimer)
      screen.dataset.state = 'ended'
      creature.classList.remove('is-asleep')
      fill(1)
      grow(1)
    },
    creature() {
      return creature
    },
    close() {
      clearTimeout(timeTimer)
      app?.classList.remove('is-behind-session')
      app?.removeAttribute('inert')
      const back = opener?.isConnected
        ? opener
        : app?.querySelector<HTMLElement>('.card-main, .card-add')
      back?.focus({ preventScroll: true })
      screen.classList.remove('is-open')
      // Removed when the water is down (--dur-session-out), not in the middle of it.
      setTimeout(() => {
        screen.remove()
      }, SESSION_OUT_MS)
    },
  }
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${String(h)}:${String(m).padStart(2, '0')}:${ss}` : `${String(m)}:${ss}`
}
