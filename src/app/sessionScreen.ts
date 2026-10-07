import { beginningSvg, creatureSvg } from '../scene/creatures'
import type { Line, Stage } from '../store/derive'
import type { Thing } from '../store/types'
import { voice } from '../voice'
import { host } from './host'

/**
 * The screen while a lock-in runs: the scene gone quiet behind it, the
 * time in a big calm face, and the thing's creature, small at first (an
 * egg, a spark, a seed) and growing as the minutes pass. It breathes and
 * now and then blinks; it is company. If the person leaves and comes
 * back, it has stopped growing and waited. At the end it is either big
 * and leaves into the scene, or still small, and the line says so plainly.
 */
const BEGINNING = 0.12
const STAGE_SPAN = 0.22

export interface SessionScreen {
  update(progress: number, remainingMs: number, waitedAt: number | null): void
  left(): void
  end(clean: boolean, line: string, onSend: () => void, onBack: () => void): void
  close(): void
}

export function openSessionScreen(
  thing: Thing,
  line: Line,
  options: { sound: boolean; onSound: (on: boolean) => void; onStop: () => void },
): SessionScreen {
  const screen = document.createElement('section')
  screen.className = 'session'
  screen.dataset.world = thing.world
  screen.dataset.state = 'running'
  screen.dataset.broken = 'false'
  screen.setAttribute('role', 'dialog')
  screen.setAttribute('aria-label', `${voice.lockIn.button}: ${thing.name}`)
  screen.innerHTML = `
    <div class="session-top">
      <button type="button" class="chip session-sound" aria-pressed="${String(options.sound)}">${voice.lockIn.seaSound}</button>
    </div>
    <div class="session-creature"><div class="session-breathe"></div></div>
    <div class="session-middle">
      <div class="session-clock" role="timer" aria-live="off"></div>
      <p class="session-line"></p>
      <div class="session-name">${thing.emoji} ${thing.name}</div>
    </div>
    <div class="session-actions">
      <button type="button" class="session-stop">${voice.lockIn.stop}</button>
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
  const actions = q('.session-actions')
  const soundButton = q('.session-sound')

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
          : creatureSvg(thing.world, line, Number(next) as Stage)
    }
    creature.style.setProperty('--grow', (0.55 + 0.6 * progress).toFixed(3))
  }

  soundButton.addEventListener('click', () => {
    const on = soundButton.getAttribute('aria-pressed') !== 'true'
    soundButton.setAttribute('aria-pressed', String(on))
    options.onSound(on)
  })
  q('.session-stop').addEventListener('click', options.onStop)

  said.textContent = voice.timerStart
  grow(0)
  host().append(screen)
  const app = document.getElementById('app')
  app?.classList.add('is-behind-session')
  app?.setAttribute('inert', '')
  requestAnimationFrame(() => screen.classList.add('is-open'))

  return {
    update(progress, remainingMs, waitedAt) {
      clock.textContent = formatClock(remainingMs)
      // A session that was left keeps the creature the size it was when it waited.
      grow(waitedAt ?? progress)
    },
    left() {
      screen.dataset.broken = 'true'
      said.textContent = voice.lockIn.left
    },
    end(clean, line, onSend, onBack) {
      screen.dataset.state = 'ended'
      screen.dataset.clean = String(clean)
      if (clean) grow(1)
      said.textContent = line
      clock.textContent = ''
      actions.innerHTML = `
        <button type="button" class="button-primary session-send">${voice.postcard.sendWhale}</button>
        <button type="button" class="button-quiet session-back">${voice.lockIn.back}</button>`
      actions.querySelector('.session-send')?.addEventListener('click', onSend)
      actions.querySelector('.session-back')?.addEventListener('click', onBack)
      if (clean) setTimeout(() => creature.classList.add('is-leaving'), 1400)
    },
    close() {
      app?.classList.remove('is-behind-session')
      app?.removeAttribute('inert')
      screen.classList.remove('is-open')
      setTimeout(() => screen.remove(), 700)
    },
  }
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m)}:${String(s).padStart(2, '0')}`
}
