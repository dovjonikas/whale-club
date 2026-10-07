import { dressedSvg } from '../scene/dock/wear'
import type { Line, Stage } from '../store/derive'
import { LENGTH_STOPS, MAX_MINUTES, MIN_MINUTES, nearestStop, type Thing } from '../store/types'
import { voice } from '../voice'
import { openSheet } from './sheet'

/**
 * The lock-in dial: how long, chosen by turning a ring with a finger (or
 * dragging round it, or the arrow keys, or a mouse wheel), from five
 * minutes to ten hours, and one big button. The ring is spread over the
 * stops (LENGTH_STOPS), not the minutes, so the short lengths people pick
 * most have the most room. It opens on the last length chosen.
 */
/** The ring leaves a gap at the top so the ends do not meet. */
const SWEEP_DEG = 330
const R = 96
const C = 120

export function openDial(
  thing: Thing,
  look: { line: Line; stage: Stage; worn?: readonly string[] },
  onStart: (minutes: number) => void,
): void {
  openSheet({
    title: thing.name,
    build(body, close) {
      let minutes = nearestStop(thing.minutes)
      body.innerHTML = `
        <div class="dial" role="slider" tabindex="0" aria-label="${voice.lockIn.minutes}"
          aria-valuemin="${String(MIN_MINUTES)}" aria-valuemax="${String(MAX_MINUTES)}">
          <svg viewBox="0 0 240 240" aria-hidden="true">
            <defs>
              <linearGradient id="dial-light" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stop-color="#3ef2e0"/><stop offset="1" stop-color="#ffd98a"/>
              </linearGradient>
            </defs>
            <path class="dial-track" d="${arc(SWEEP_DEG)}"/>
            ${ticks()}
            <path class="dial-fill" d=""/>
            <circle class="dial-knob" r="13"/>
          </svg>
          <div class="dial-centre">
            <span class="dial-creature">${dressedSvg(thing.world, look.line, look.stage, look.worn ?? [])}</span>
            <span class="dial-minutes"></span>
            <span class="dial-unit">min</span>
          </div>
        </div>
        <button type="button" class="button-primary lock-in-start">${voice.lockIn.button}</button>`

      const dial = body.querySelector<HTMLElement>('.dial')
      const fill = body.querySelector('.dial-fill')
      const knob = body.querySelector('.dial-knob')
      const label = body.querySelector('.dial-minutes')
      const unit = body.querySelector<HTMLElement>('.dial-unit')
      if (!dial || !fill || !knob || !label || !unit) return

      const show = (): void => {
        const deg = (LENGTH_STOPS.indexOf(minutes) / (LENGTH_STOPS.length - 1)) * SWEEP_DEG
        fill.setAttribute('d', arc(Math.max(deg, 0.01)))
        const [x, y] = point(deg)
        knob.setAttribute('cx', x.toFixed(1))
        knob.setAttribute('cy', y.toFixed(1))
        label.textContent = minutes < 60 ? String(minutes) : voice.card.length(minutes)
        unit.hidden = minutes >= 60
        dial.setAttribute('aria-valuenow', String(minutes))
        dial.setAttribute('aria-valuetext', voice.card.length(minutes))
      }
      const set = (next: number): void => {
        minutes = nearestStop(next)
        show()
      }
      /** Moves along the stops, not the minutes: one key press is one stop. */
      const step = (by: number): void => {
        const i = LENGTH_STOPS.indexOf(minutes) + by
        set(LENGTH_STOPS[Math.max(0, Math.min(LENGTH_STOPS.length - 1, i))] ?? minutes)
      }

      const fromPointer = (event: PointerEvent): void => {
        const rect = dial.getBoundingClientRect()
        const dx = event.clientX - (rect.left + rect.width / 2)
        const dy = event.clientY - (rect.top + rect.height / 2)
        // 0 degrees at the top, clockwise; the gap at the top snaps to the nearer end.
        let deg = (Math.atan2(dx, -dy) * 180) / Math.PI
        if (deg < 0) deg += 360
        const start = (360 - SWEEP_DEG) / 2
        const along = deg - start
        const fraction = along < 0 ? 0 : along > SWEEP_DEG ? (deg > 180 ? 1 : 0) : along / SWEEP_DEG
        set(LENGTH_STOPS[Math.round(fraction * (LENGTH_STOPS.length - 1))] ?? minutes)
      }
      dial.addEventListener('pointerdown', (event) => {
        dial.setPointerCapture(event.pointerId)
        fromPointer(event)
      })
      dial.addEventListener('pointermove', (event) => {
        if (dial.hasPointerCapture(event.pointerId)) fromPointer(event)
      })
      dial.addEventListener(
        'wheel',
        (event) => {
          event.preventDefault()
          step(event.deltaY < 0 ? 1 : -1)
        },
        { passive: false },
      )
      dial.addEventListener('keydown', (event) => {
        const moves: Record<string, number> = {
          ArrowUp: 1,
          ArrowRight: 1,
          ArrowDown: -1,
          ArrowLeft: -1,
          PageUp: 3,
          PageDown: -3,
        }
        if (event.key === 'Home') set(MIN_MINUTES)
        else if (event.key === 'End') set(MAX_MINUTES)
        else if (moves[event.key] !== undefined) step(moves[event.key] ?? 0)
        else return
        event.preventDefault()
      })
      body.querySelector('.lock-in-start')?.addEventListener('click', () => {
        close()
        onStart(minutes)
      })
      show()
    },
  })
}

/** Landmarks on the ring (a quarter, half and three quarters of an hour, then hours), so it reads without the number. */
const TICKS = [15, 30, 45, 60, 120, 180, 300, 480]

function ticks(): string {
  const marks: string[] = []
  for (const m of TICKS) {
    const deg = (LENGTH_STOPS.indexOf(m) / (LENGTH_STOPS.length - 1)) * SWEEP_DEG
    const start = (360 - SWEEP_DEG) / 2
    const a = ((start + deg - 90) * Math.PI) / 180
    const inner = R - 16
    const x0 = C + inner * Math.cos(a)
    const y0 = C + inner * Math.sin(a)
    const x1 = C + (inner - 5) * Math.cos(a)
    const y1 = C + (inner - 5) * Math.sin(a)
    marks.push(
      `<path class="dial-tick" d="M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}"/>`,
    )
  }
  return marks.join('')
}

/** A point on the ring, `deg` degrees along the sweep from its start. */
function point(deg: number): [number, number] {
  const start = (360 - SWEEP_DEG) / 2
  const a = ((start + deg - 90) * Math.PI) / 180
  return [C + R * Math.cos(a), C + R * Math.sin(a)]
}

function arc(deg: number): string {
  const [x0, y0] = point(0)
  const [x1, y1] = point(deg)
  const large = deg > 180 ? 1 : 0
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${String(R)} ${String(R)} 0 ${String(large)} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
}
