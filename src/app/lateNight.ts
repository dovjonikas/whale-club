import { sleeperSvg } from '../scene/visitors'
import { voice } from '../voice'
import { host } from './host'

/**
 * Late at night, by the person's own day: from 23:00 to 05:00, both moved
 * by "a day ends at", so for someone whose day ends at 5:00 the late hours
 * are 04:00 to 10:00. The scene darkens a little and warms, one line is
 * said, and the moon says good night: the whale falls asleep and the app
 * rests on a quiet screen. No rules, and no numbers about sleep.
 */
const LATE_FROM = 23
const LATE_UNTIL = 5
const HOURS = 24

export function isLate(now: Date, dayEndsAt: number): boolean {
  const hour = (now.getHours() - dayEndsAt + HOURS) % HOURS
  return hour >= LATE_FROM || hour < LATE_UNTIL
}

/**
 * The quiet screen: dark, the whale asleep, "good night". A tap, a key or
 * coming back to the app later lifts it; nothing is lost behind it.
 */
export function openGoodNight(): void {
  if (document.querySelector('.goodnight')) return
  const app = document.getElementById('app')
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const screen = document.createElement('section')
  screen.className = 'goodnight'
  screen.setAttribute('role', 'dialog')
  screen.setAttribute('aria-modal', 'true')
  screen.setAttribute('aria-label', voice.late.goodNight)
  screen.tabIndex = -1
  screen.innerHTML = `
    <div class="goodnight-whale" aria-hidden="true">${sleeperSvg()}</div>
    <p class="goodnight-line">${voice.late.goodNight}</p>
    <p class="goodnight-wake">${voice.late.wake}</p>`
  const close = (): void => {
    screen.remove()
    app?.removeAttribute('inert')
    opener?.focus({ preventScroll: true })
  }
  screen.addEventListener('click', close)
  screen.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      close()
    }
  })
  host().append(screen)
  app?.setAttribute('inert', '')
  requestAnimationFrame(() => {
    screen.classList.add('is-open')
    screen.focus({ preventScroll: true })
  })
}
