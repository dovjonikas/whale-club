import { creatureSvg } from '../scene/creatures'
import type { Line, Stage } from '../store/derive'
import type { Thing } from '../store/types'
import { voice } from '../voice'
import { openSheet } from './sheet'

/**
 * The lock-in dial: how long, chosen by turning a ring with a finger (or
 * dragging round it, or the arrow keys, or a mouse wheel), from 10 to 120
 * minutes in steps of 5, and one big button. It opens on the last length
 * chosen for this thing.
 */
export const MIN_MINUTES = 10
export const MAX_MINUTES = 120
const STEP = 5
/** The ring leaves a gap at the top so the ends do not meet. */
const SWEEP_DEG = 330
const R = 96
const C = 120

export function openDial(
  thing: Thing,
  look: { line: Line; stage: Stage },
  onStart: (minutes: number) => void,
): void {
  openSheet({
    title: `${thing.emoji} ${thing.name}`,
    build(body, close) {
      let minutes = clamp(thing.minutes ?? 25)
      body.innerHTML = `
        <div class="dial" role="slider" tabindex="0" aria-label="${voice.lockIn.minutes}"
          aria-valuemin="${String(MIN_MINUTES)}" aria-valuemax="${String(MAX_MINUTES)}">
          <svg viewBox="0 0 240 240" aria-hidden="true">
            <path class="dial-track" d="${arc(SWEEP_DEG)}"/>
            <path class="dial-fill" d=""/>
            <circle class="dial-knob" r="13"/>
          </svg>
          <div class="dial-centre">
            <span class="dial-creature">${creatureSvg(thing.world, look.line, look.stage)}</span>
            <span class="dial-minutes"></span>
            <span class="dial-unit">min</span>
          </div>
        </div>
        <button type="button" class="button-primary lock-in-start">${voice.lockIn.button}</button>`

      const dial = body.querySelector<HTMLElement>('.dial')
      const fill = body.querySelector('.dial-fill')
      const knob = body.querySelector('.dial-knob')
      const label = body.querySelector('.dial-minutes')
      if (!dial || !fill || !knob || !label) return

      const show = (): void => {
        const deg = ((minutes - MIN_MINUTES) / (MAX_MINUTES - MIN_MINUTES)) * SWEEP_DEG
        fill.setAttribute('d', arc(Math.max(deg, 0.01)))
        const [x, y] = point(deg)
        knob.setAttribute('cx', x.toFixed(1))
        knob.setAttribute('cy', y.toFixed(1))
        label.textContent = String(minutes)
        dial.setAttribute('aria-valuenow', String(minutes))
        dial.setAttribute('aria-valuetext', `${String(minutes)} minutes`)
      }
      const set = (next: number): void => {
        minutes = clamp(next)
        show()
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
        set(MIN_MINUTES + fraction * (MAX_MINUTES - MIN_MINUTES))
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
          set(minutes + (event.deltaY < 0 ? STEP : -STEP))
        },
        { passive: false },
      )
      dial.addEventListener('keydown', (event) => {
        const moves: Record<string, number> = {
          ArrowUp: STEP,
          ArrowRight: STEP,
          ArrowDown: -STEP,
          ArrowLeft: -STEP,
          PageUp: 15,
          PageDown: -15,
        }
        if (event.key === 'Home') set(MIN_MINUTES)
        else if (event.key === 'End') set(MAX_MINUTES)
        else if (moves[event.key] !== undefined) set(minutes + (moves[event.key] ?? 0))
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

function clamp(minutes: number): number {
  const stepped = Math.round(minutes / STEP) * STEP
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, stepped))
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
