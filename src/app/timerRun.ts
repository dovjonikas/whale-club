import { creatureSvg } from '../scene/creatures'
import type { Line, Stage } from '../store/derive'
import type { Thing } from '../store/types'
import { formatRemaining } from './timer'

export interface TimerRunHandle {
  update(remainingMs: number): void
  close(): void
}

/**
 * The screen while a timer runs: the creature swimming, the time left,
 * and one quiet way out. The scene behind it goes calm.
 */
export function showTimerRun(
  thing: Thing,
  look: { line: Line; stage: Stage },
  remainingMs: number,
  onStop: () => void,
): TimerRunHandle {
  const overlay = document.createElement('section')
  overlay.className = 'timer-run'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-label', `timer for ${thing.name}`)
  overlay.innerHTML = `
    <div></div>
    <div class="timer-creature">${creatureSvg(thing.world, look.line, look.stage)}</div>
    <div>
      <div class="timer-clock" role="timer" aria-live="off">${formatRemaining(remainingMs)}</div>
      <div class="timer-name">${thing.emoji} ${thing.name}</div>
    </div>
    <button type="button" class="timer-stop">stop</button>`
  const clock = overlay.querySelector('.timer-clock')
  overlay.querySelector('.timer-stop')?.addEventListener('click', onStop)
  document.body.append(overlay)
  requestAnimationFrame(() => overlay.classList.add('is-open'))

  return {
    update(ms) {
      if (clock) clock.textContent = formatRemaining(ms)
    },
    close() {
      overlay.classList.remove('is-open')
      setTimeout(() => overlay.remove(), 900)
    },
  }
}
