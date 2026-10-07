/**
 * The app's one animation loop. Everything that moves on a canvas or by
 * script (the star field, the particles, the parallax) asks for frames
 * here, at its own rate, instead of running a requestAnimationFrame of
 * its own: one loop is easier on a phone's battery than four.
 *
 * The loop runs only while the page is visible and the scene is on
 * screen, and stops entirely when nothing has asked for frames. Under
 * reduced motion nothing subscribes, so it never starts.
 */
type Frame = (now: number) => void

export interface FrameHandle {
  /** Changes the rate, for a burst that wants 60 frames and a drift that wants 30. */
  setFps(fps: number): void
  remove(): void
}

interface Job {
  frame: Frame
  interval: number
  last: number
}

export class Ticker {
  private readonly jobs = new Set<Job>()
  private raf = 0
  private visible = !document.hidden
  private onScreen = true

  constructor() {
    document.addEventListener('visibilitychange', () => {
      this.visible = !document.hidden
      this.update()
    })
  }

  /** Stops the loop while `element` is off screen. */
  observe(element: Element): void {
    if (typeof IntersectionObserver !== 'function') return
    new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1]
      if (!entry) return
      this.onScreen = entry.isIntersecting
      this.update()
    }).observe(element)
  }

  add(frame: Frame, fps: number): FrameHandle {
    const job: Job = { frame, interval: 1000 / fps, last: 0 }
    this.jobs.add(job)
    this.update()
    return {
      setFps: (next) => {
        job.interval = 1000 / next
      },
      remove: () => {
        this.jobs.delete(job)
        this.update()
      },
    }
  }

  private update(): void {
    const run = this.visible && this.onScreen && this.jobs.size > 0
    if (run && !this.raf) this.raf = requestAnimationFrame(this.loop)
    if (!run && this.raf) {
      cancelAnimationFrame(this.raf)
      this.raf = 0
    }
  }

  private readonly loop = (now: number): void => {
    for (const job of this.jobs) {
      // A frame a millisecond early still counts, or a 60 fps job would skip every other frame.
      if (now - job.last >= job.interval - 1) {
        job.last = now
        job.frame(now)
      }
    }
    this.raf = this.jobs.size > 0 ? requestAnimationFrame(this.loop) : 0
  }
}

export const ticker = new Ticker()

export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches
