import { seedHistory } from '../lab/seed'
import { collectiblesFor } from '../scene/collectibles'
import { beginningSvg, creatureSvg } from '../scene/creatures'
import type { Scene } from '../scene/scene'
import { reducedMotion, ticker, type FrameHandle } from '../scene/ticker'
import { sleeperSvg } from '../scene/visitors'
import { addDays, todayKey } from '../store/dates'
import { last7, reachedOn, stageFor, starDays, streakDays, UNLOCK_DAYS } from '../store/derive'
import type { AppData, DateKey, World } from '../store/types'
import { emptyData } from '../store/types'
import { voice } from '../voice'
import { host } from './host'
import { lanternsFor } from './sceneData'
import type { Sound } from './sound'

/**
 * The first minute, in three beats, on a first open only (and on request).
 * It is paced like a short piece of music, not a slideshow: a quiet
 * opening, a year that speeds up through its middle and slows into its
 * last days, a held moment at the top, and room after every line to read
 * it twice.
 *
 * The promise: the real scene, drawing a seeded year (the lab's, not a
 * forecast of this person's), a day counter from 1 to 365, stars filling
 * the sky, creatures growing, finds opening as flashes, lanterns
 * gathering, and at the end the whale rising before the moon. All of it in
 * silhouette: it shows that the sea fills, not what with.
 *
 * The truth: the empty sea of day one and the author's sentence, a phrase
 * at a time, while a small story plays under it: a little whale asleep
 * under the surface wakes, swims up and blows, and the first star lights
 * above it on the last word.
 *
 * The first step: one button, "start light".
 *
 * "skip" is always there; a tap anywhere goes on to the next beat (and
 * lands the beat it leaves on its end). Under reduced motion the year is
 * three still frames and everything else fades instead of moving.
 */
export type IntroEnd = 'start' | 'skip'
type Beat = 'promise' | 'truth' | 'start'

/** A breath of quiet before the year starts. */
const OPENING_MS = 1100
/** The year: slow first days, fast middle, slow last days (an ease in and out). */
const YEAR_MS = 7000
/** Held at day 365 before the whale rises: the fermata. */
const FERMATA_MS = 600
/** The whale rising, then the line. */
const WHALE_MS = 1500
/** Each word of the promise's line follows the last by this much. */
const WORD_MS = 240
/** The line stays long enough to be read twice, and then some. */
const LINE_HOLD_MS = 3000
const FADE_MS = 700
/** The truth: when each phrase, and each moment of the little story, comes. */
const TRUTH_CUES = {
  phrase1: 400,
  phrase2: 2500,
  wake: 4300,
  phrase3: 5300,
  rise: 5900,
  blow: 7400,
  phrase4: 7600,
  star: 9800,
  start: 11600,
} as const
const STILL_MS = 2200
const STILL_DAYS = [1, 100, 365]
const FPS = 30
const YEAR = 365
/** Where each world's creature stands while the year runs, as a fraction of the width. */
const CREATURE_X: Record<World, number> = { sea: 0.25, sky: 0.5, garden: 0.75 }
const LANTERN_LIGHT = '#ffd98a'
const INTRO_KEY = 'whaleclub:intro'

/** Whether a first open should show the intro: nothing stored yet, and never shown before. */
export function introDue(data: AppData): boolean {
  if (data.things.length > 0 || Object.keys(data.days).length > 0) return false
  try {
    return localStorage.getItem(INTRO_KEY) === null
  } catch {
    return false
  }
}

function markSeen(): void {
  try {
    localStorage.setItem(INTRO_KEY, 'seen')
  } catch {
    // Without storage it shows again next time; that is all.
  }
}

/** Slow, fast, slow: a year that gathers pace and then arrives. */
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** The author's sentence, split into phrases at its own commas; not a word changed. */
function phrases(): string[] {
  return voice.intro.truth.flatMap((paragraph) =>
    paragraph.split(/(?<=,) (?=because |that )/).map((p) => p.trim()),
  )
}

interface Year {
  data: AppData
  start: DateKey
  dates: DateKey[]
  lanterns: ReturnType<typeof lanternsFor>
  finds: { date: DateKey; world: World; x: number; y: number }[]
}

function seededYear(): Year {
  const today = todayKey()
  const data = seedHistory(emptyData(), today, YEAR)
  const finds: Year['finds'] = []
  for (const thing of data.things) {
    for (const tier of UNLOCK_DAYS) {
      const date = reachedOn(data, thing.id, tier)
      const item = collectiblesFor(thing.world, thing.line).find((c) => c.days === tier)
      if (date && item) finds.push({ date, world: thing.world, x: item.x, y: item.y })
    }
  }
  finds.sort((a, b) => a.date.localeCompare(b.date))
  return {
    data,
    start: addDays(today, -YEAR),
    dates: starDays(data),
    // Lights, not colours: every lantern the same warm light.
    lanterns: lanternsFor(data, today).map((l) => ({ ...l, color: LANTERN_LIGHT })),
    finds,
  }
}

export function playIntro(
  scene: Scene,
  options: { hasThings: boolean; sound: Sound; onEnd: (end: IntroEnd) => void },
): void {
  const year = seededYear()
  const lines = phrases()
  const app = document.getElementById('app')
  const overlay = document.createElement('section')
  overlay.className = 'intro'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-label', 'whale club')
  overlay.dataset.calf = 'asleep'
  overlay.innerHTML = `
    <button type="button" class="intro-skip">${voice.intro.skip}</button>
    <div class="intro-day" aria-hidden="true"></div>
    <div class="intro-creatures" aria-hidden="true">
      ${year.data.things.map((t) => `<span class="intro-creature" data-world="${t.world}" style="left:${String(CREATURE_X[t.world] * 100)}%"></span>`).join('')}
    </div>
    <p class="intro-line" aria-live="polite">${voice.intro.promise
      .split(' ')
      .map((w, i) => `<span style="--i:${String(i)}">${w}</span>`)
      .join(' ')}</p>
    <div class="intro-truth">${lines.map((p) => `<p>${p}</p>`).join('')}</div>
    <div class="intro-star" aria-hidden="true"></div>
    <div class="intro-calf" aria-hidden="true">
      <span class="intro-calf-body">${sleeperSvg(false)}</span>
      <span class="intro-spout"><i></i><i></i><i></i></span>
    </div>
    <button type="button" class="button-primary intro-start">${options.hasThings ? voice.intro.back : voice.intro.start}</button>
    <div class="intro-veil" aria-hidden="true"></div>`
  const q = (selector: string): HTMLElement => {
    const element = overlay.querySelector<HTMLElement>(selector)
    if (!element) throw new Error(`intro is missing ${selector}`)
    return element
  }
  const dayLabel = q('.intro-day')
  const veil = q('.intro-veil')
  const calfBody = q('.intro-calf-body')
  const creatures = [...overlay.querySelectorAll<HTMLElement>('.intro-creature')]
  const truthLines = [...overlay.querySelectorAll<HTMLElement>('.intro-truth p')]

  let beat: Beat = 'promise'
  let handle: FrameHandle | null = null
  const timers: number[] = []
  const later = (ms: number, run: () => void): void => {
    timers.push(window.setTimeout(run, ms))
  }
  const stopTimers = (): void => {
    for (const t of timers.splice(0)) clearTimeout(t)
    handle?.remove()
    handle = null
  }

  // --- the promise --------------------------------------------------------------------------
  let shownDay = 0
  let findIndex = 0
  let note = 0
  const drawDay = (day: number, flashes: boolean): void => {
    if (day === shownDay) return
    shownDay = day
    const until = addDays(year.start, day)
    const dates = year.dates.filter((d) => d <= until)
    scene.preview({
      dates,
      streak: streakDays(dates),
      today: until,
      lanterns: year.lanterns.filter((l) => l.date <= until),
    })
    dayLabel.textContent = voice.intro.day(day)
    year.data.things.forEach((thing, i) => {
      const element = creatures[i]
      if (!element) return
      // Day one is the beginning: an egg, a spark, a seed.
      const stage = day < 2 ? null : stageFor(last7(year.data, thing.id, until))
      const key = String(stage)
      if (element.dataset.stage === key) return
      element.dataset.stage = key
      element.innerHTML =
        stage === null ? beginningSvg(thing.world) : creatureSvg(thing.world, thing.line, stage)
    })
    // Every find reached by now opens as a flash and a note, rising through the scale.
    let fired = 0
    while (findIndex < year.finds.length && (year.finds[findIndex]?.date ?? '') <= until) {
      const find = year.finds[findIndex]
      findIndex++
      if (find && flashes && fired < 2) {
        scene.flash(find.x, find.y, find.world)
        options.sound.note(note++)
        fired++
      }
    }
  }

  const promise = (): void => {
    scene.setSilhouette(true)
    scene.setEmpty(false)
    overlay.dataset.beat = 'promise'
    drawDay(1, false)
    if (reducedMotion()) {
      // Three still frames, faded into each other.
      STILL_DAYS.forEach((day, i) => {
        later(i * STILL_MS, () => {
          veil.classList.add('is-on')
          later(300, () => {
            drawDay(day, false)
            veil.classList.remove('is-on')
          })
        })
      })
      later(STILL_DAYS.length * STILL_MS, topOfTheYear)
      return
    }
    later(OPENING_MS, () => {
      const startedAt = performance.now()
      handle = ticker.add((now) => {
        const t = Math.min(1, (now - startedAt) / YEAR_MS)
        drawDay(Math.max(1, Math.round(1 + (YEAR - 1) * easeInOut(t))), true)
        if (t >= 1) {
          handle?.remove()
          handle = null
          later(FERMATA_MS, topOfTheYear)
        }
      }, FPS)
    })
  }

  /** Day 365: the whale rises before the moon, then the line, word by word, and it stays. */
  const topOfTheYear = (): void => {
    drawDay(YEAR, false)
    // The year's creatures step back; the whale has the moment to itself.
    overlay.dataset.top = 'true'
    scene.surfaceWhale(false)
    options.sound.play('whale')
    later(WHALE_MS, () => {
      overlay.dataset.line = 'on'
      const words = voice.intro.promise.split(' ').length
      later(words * WORD_MS + LINE_HOLD_MS, () => {
        overlay.dataset.line = 'off'
        later(FADE_MS, () => {
          go('truth')
        })
      })
    })
  }

  // --- the truth, and the little story under it ---------------------------------------------
  const showPhrase = (i: number): void => {
    truthLines[i]?.classList.add('is-on')
  }
  const wake = (): void => {
    if (overlay.dataset.calf !== 'asleep') return
    overlay.dataset.calf = 'awake'
    calfBody.innerHTML = sleeperSvg(true)
  }
  const truth = (): void => {
    overlay.dataset.beat = 'truth'
    scene.preview(null)
    scene.setSilhouette(false)
    scene.setEmpty(false)
    later(TRUTH_CUES.phrase1, () => {
      showPhrase(0)
    })
    later(TRUTH_CUES.phrase2, () => {
      showPhrase(1)
    })
    later(TRUTH_CUES.wake, wake)
    later(TRUTH_CUES.phrase3, () => {
      showPhrase(2)
    })
    later(TRUTH_CUES.rise, () => {
      overlay.dataset.calf = 'up'
    })
    later(TRUTH_CUES.blow, () => {
      overlay.dataset.calf = 'blow'
    })
    later(TRUTH_CUES.phrase4, () => {
      showPhrase(3)
    })
    later(TRUTH_CUES.star, () => {
      overlay.dataset.star = 'on'
      options.sound.note(7)
    })
    later(TRUTH_CUES.start, () => {
      go('start')
    })
  }

  /** The end of the truth, all at once: every phrase, the whale up, the star lit. */
  const truthAtItsEnd = (): void => {
    truthLines.forEach((_, i) => {
      showPhrase(i)
    })
    wake()
    overlay.dataset.calf = 'blow'
    overlay.dataset.star = 'on'
  }

  const start = (): void => {
    truthAtItsEnd()
    overlay.dataset.beat = 'start'
    q('.intro-start').focus()
  }

  const go = (next: Beat): void => {
    stopTimers()
    if (beat === 'promise') {
      scene.preview(null)
      scene.setSilhouette(false)
      scene.setEmpty(false)
      overlay.dataset.line = 'off'
    }
    beat = next
    if (next === 'truth') truth()
    else start()
  }

  const end = (how: IntroEnd): void => {
    stopTimers()
    scene.preview(null)
    scene.setSilhouette(false)
    scene.setEmpty(!options.hasThings)
    markSeen()
    overlay.remove()
    app?.classList.remove('is-behind-intro')
    app?.removeAttribute('inert')
    options.onEnd(how)
  }

  // skip: on to the first step; from the first step, out.
  q('.intro-skip').addEventListener('click', () => {
    if (beat === 'start') end('skip')
    else go('start')
  })
  q('.intro-start').addEventListener('click', () => {
    end('start')
  })
  overlay.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) return
    if (beat === 'promise') go('truth')
    else if (beat === 'truth') go('start')
  })

  host().append(overlay)
  app?.classList.add('is-behind-intro')
  app?.setAttribute('inert', '')
  promise()
}
