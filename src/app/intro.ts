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
import { Score } from './score'
import type { Sound } from './sound'

/**
 * The first minute, in three beats, on a first open only (and on request),
 * with music under it (src/app/score.ts). A browser plays no sound before
 * a first touch, so when sound is on and not yet allowed, the intro opens
 * on "tap to begin" over the quiet sea; that tap starts the music and the
 * year together.
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
 * The truth is built like a song that climbs. Every cue only adds to the
 * ones before it, so the scene keeps getting warmer and never steps back.
 * The eyes close on the year and flutter open on the empty sea of day
 * one, dim and cold, with a little whale asleep under the surface. The
 * first half of the sentence (the doubt) comes word by word. Then the eyes
 * blink: under the closed lids the doubt goes and the light warms, and they
 * open on the second half (the hope) as the little whale opens its eyes too.
 * At "compound" the stars double, one, two, four, eight, sixteen, faster
 * each time, and the camera leans in. The little whale swims up, the light
 * warms again, and on the last word it blows, the first star blooms, and
 * the notes land on a bright chord.
 *
 * The first step: one button, "start light".
 *
 * "skip" is always there; a tap anywhere goes on to the next beat (and
 * lands the beat it leaves on its end). Under reduced motion the year is
 * three still frames and everything else fades instead of moving.
 */
export type IntroEnd = 'start' | 'skip'
type Beat = 'gate' | 'promise' | 'truth' | 'start'

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
/**
 * The truth's timing: when each phrase and each moment of the little story
 * comes, in ms from the start of the beat. Two moments follow from the
 * words themselves: the stars start on "compound", and the peak lands on
 * the last word.
 */
const TRUTH = {
  /** Under the lids the year gives way to day one. */
  dayOne: 300,
  /** The lids part a little, close again, and open: waking up. */
  peek: 450,
  flutter: 750,
  open: 1000,
  phrase1: 1200,
  phrase2: 3800,
  /** The turn: the lids close on the doubt, the light warms under them, and they open on the hope. */
  blink: 6100,
  turn: 6450,
  reopen: 6600,
  wake: 6900,
  phrase3: 6950,
  rise: 8700,
  phrase4: 10000,
} as const
/** Each word of the truth follows the last by this much, slow enough that its note is heard as a melody. */
const TRUTH_WORD_MS = 200
/** The word the stars start doubling on. */
const COMPOUND = 'compound'
/** After the last word lands, the peak rings this long before "start light". */
const PEAK_HOLD_MS = 1300
/** How often the year's music box plays a note, in days: its rhythm follows the year's own pace. */
const STEP_DAYS = 14

/** The stars of the truth come in doubling waves, each sooner than the last: an accelerando. */
const WAVES = [1, 2, 4, 8, 16]
const WAVE_AT = [0, 560, 980, 1280, 1480]
/** A wave's stars sparkle in over this much, not all at once. */
const WAVE_SPREAD_MS = 160
const STILL_MS = 2200
const STILL_DAYS = [1, 100, 365]
const FPS = 30
const YEAR = 365
/** The year's four seasons, each with its chord. */
const SEASON_DAYS = YEAR / 4
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

/** The author's sentence, each half split into phrases at its own commas; not a word changed. */
function halves(): string[][] {
  return voice.intro.truth.map((paragraph) =>
    paragraph.split(/(?<=,) (?=because |that )/).map((p) => p.trim()),
  )
}

/** Words as spans, so a phrase arrives word by word like a line of a tune. */
function wordsOf(text: string): string {
  return text
    .split(' ')
    .map((w, i) => `<span style="--i:${String(i)}">${w}</span>`)
    .join(' ')
}

/**
 * Where the truth's stars sit: the R2 sequence (steps of the plastic
 * number's powers), which spreads points evenly over a plane without a
 * grid's order or a line's, and lands the same every time.
 */
const R2 = [0.7548776662, 0.569840291]
const SKY = { left: 6, width: 88, top: 5, height: 46 }

function skyStars(): { x: number; y: number; wave: number; delay: number }[] {
  const [ax = 0, ay = 0] = R2
  let n = 0
  return WAVES.flatMap((count, wave) =>
    Array.from({ length: count }, () => {
      n++
      return {
        x: SKY.left + ((0.5 + n * ax) % 1) * SKY.width,
        y: SKY.top + ((0.5 + n * ay) % 1) * SKY.height,
        wave,
        delay: Math.round(((n * ax * ay * 7) % 1) * WAVE_SPREAD_MS),
      }
    }),
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
  const sentence = halves()
  const stars = skyStars()
  const app = document.getElementById('app')
  const overlay = document.createElement('section')
  overlay.className = 'intro'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-label', 'whale club')
  overlay.dataset.calf = 'asleep'
  overlay.dataset.lids = 'open'
  overlay.innerHTML = `
    <button type="button" class="intro-skip">${voice.intro.skip}</button>
    <button type="button" class="intro-begin">
      <span class="intro-begin-bubble" aria-hidden="true"></span>
      <span class="intro-begin-title">${voice.intro.begin}</span>
      <span class="intro-begin-line">${voice.intro.beginLine}</span>
    </button>
    <div class="intro-day" aria-hidden="true"></div>
    <div class="intro-creatures" aria-hidden="true">
      ${year.data.things.map((t) => `<span class="intro-creature" data-world="${t.world}" style="left:${String(CREATURE_X[t.world] * 100)}%"></span>`).join('')}
    </div>
    <div class="intro-stage" aria-hidden="true">
      <i class="intro-light" data-light="cold"></i>
      <i class="intro-light" data-light="dawn"></i>
      <i class="intro-light" data-light="warm"></i>
      <i class="intro-light" data-light="gold"></i>
      <div class="intro-sky">${stars
        .map(
          (s) =>
            `<i data-wave="${String(s.wave)}" style="left:${s.x.toFixed(1)}%;top:${s.y.toFixed(1)}%;--d:${String(s.delay)}ms"></i>`,
        )
        .join('')}</div>
      <div class="intro-star"><i></i></div>
      <div class="intro-calf">
        <span class="intro-calf-body">${sleeperSvg(false)}</span>
        <span class="intro-spout"><i></i><i></i><i></i></span>
      </div>
    </div>
    <p class="intro-line" aria-live="polite" style="--word-ms:${String(WORD_MS)}ms">${wordsOf(voice.intro.promise)}</p>
    <div class="intro-truth" data-half="1" style="--word-ms:${String(TRUTH_WORD_MS)}ms">${sentence
      .map(
        (half) =>
          `<div class="intro-half">${half.map((p) => `<p>${wordsOf(p)}</p>`).join('')}</div>`,
      )
      .join('')}</div>
    <button type="button" class="button-primary intro-start">${options.hasThings ? voice.intro.back : voice.intro.start}</button>
    <div class="intro-lids" aria-hidden="true"><i></i><i></i></div>
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
  const truthBox = q('.intro-truth')
  const skyDots = [...overlay.querySelectorAll<HTMLElement>('.intro-sky i')]
  /** The phrases of the first half; the second half's come after them. */
  const firstHalf = sentence[0]?.length ?? 0
  const wordsIn = (phrase: string | undefined): string[] => (phrase ?? '').split(' ')
  const hope = sentence[1] ?? []
  /** The stars start on "compound", and the peak lands on the last word. */
  const compoundAt = Math.max(
    0,
    wordsIn(hope[0]).findIndex((w) => w.startsWith(COMPOUND)),
  )
  const starsAt = TRUTH.phrase3 + compoundAt * TRUTH_WORD_MS
  const peakAt = TRUTH.phrase4 + (wordsIn(hope[1]).length - 1) * TRUTH_WORD_MS

  /** The music: none while sound is off, or until a tap allows it. */
  let score: Score | null = null
  const gated = !options.sound.isMuted() && !options.sound.isRunning()
  let beat: Beat = gated ? 'gate' : 'promise'
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
  let stepAt = 0
  let season = -1
  const drawDay = (day: number, flashes: boolean): void => {
    if (day === shownDay) return
    shownDay = day
    const quarter = Math.min(3, Math.floor((day - 1) / SEASON_DAYS))
    if (quarter !== season) {
      season = quarter
      score?.season(quarter)
    }
    // The music box keeps the year's pace: slow, rushing, slow.
    const step = Math.floor(day / STEP_DAYS)
    if (flashes && step > stepAt) score?.step(step, quarter)
    stepAt = step
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
    // Every find reached by now opens as a flash and a high, quiet bell.
    let fired = 0
    while (findIndex < year.finds.length && (year.finds[findIndex]?.date ?? '') <= until) {
      const find = year.finds[findIndex]
      findIndex++
      if (find && flashes && fired < 2) {
        scene.flash(find.x, find.y, find.world)
        score?.sparkle(quarter, findIndex)
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
      later(STILL_DAYS.length * STILL_MS, () => {
        score?.fermata()
        topOfTheYear()
      })
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
          score?.fermata()
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
    score?.whale()
    later(WHALE_MS, () => {
      overlay.dataset.line = 'on'
      const words = voice.intro.promise.split(' ').length
      score?.line(WORD_MS, words)
      later(words * WORD_MS + LINE_HOLD_MS, () => {
        // The line goes as the eyes close slowly on the year, and the music with it.
        overlay.dataset.line = 'off'
        overlay.dataset.lids = 'sleep'
        score?.close()
        later(FADE_MS, () => {
          go('truth')
        })
      })
    })
  }

  // --- the truth, and the little story under it ---------------------------------------------
  /** The year gives way to the empty sea of day one. */
  const dayOne = (): void => {
    scene.preview(null)
    scene.setSilhouette(false)
    scene.setEmpty(false)
    overlay.dataset.line = 'off'
  }
  const showPhrase = (i: number): void => {
    truthLines[i]?.classList.add('is-on')
  }
  /** The eyes: open, shut, a peek between, or closing slowly on the year. */
  const lids = (state: 'open' | 'peek' | 'shut' | 'sleep') => (): void => {
    overlay.dataset.lids = state
  }
  /** The light only ever warms: cold, dawn, warm, gold. */
  const light = (step: 'cold' | 'dawn' | 'warm' | 'gold'): void => {
    overlay.dataset.light = step
  }
  /** The second half takes the first one's place. */
  const turn = (): void => {
    truthBox.dataset.half = '2'
    light('dawn')
  }
  const wake = (): void => {
    if (overlay.dataset.calf !== 'asleep') return
    overlay.dataset.calf = 'awake'
    calfBody.innerHTML = sleeperSvg(true)
  }
  const lightWave = (wave: number): void => {
    for (const dot of skyDots) if (dot.dataset.wave === String(wave)) dot.classList.add('is-on')
  }
  const peak = (): void => {
    light('gold')
    overlay.dataset.calf = 'blow'
    overlay.dataset.star = 'on'
    score?.peak()
  }
  /** A phrase appears word by word, and its melody under it, a note a word. */
  const sing = (i: number): void => {
    showPhrase(i)
    score?.phrase(i, TRUTH_WORD_MS)
  }

  const truth = (): void => {
    overlay.dataset.beat = 'truth'
    overlay.dataset.lids = 'shut'
    light('cold')
    score?.close()
    later(TRUTH.dayOne, dayOne)
    later(TRUTH.peek, lids('peek'))
    later(TRUTH.flutter, lids('shut'))
    later(TRUTH.open, () => {
      lids('open')()
      score?.doubt()
    })
    later(TRUTH.phrase1, () => {
      sing(0)
    })
    later(TRUTH.phrase2, () => {
      sing(1)
    })
    later(TRUTH.blink, () => {
      lids('shut')()
      score?.blink()
    })
    later(TRUTH.turn, turn)
    later(TRUTH.reopen, () => {
      lids('open')()
      score?.turn()
    })
    later(TRUTH.wake, wake)
    later(TRUTH.phrase3, () => {
      sing(firstHalf)
    })
    later(starsAt, () => {
      scene.setPush(true)
      overlay.dataset.push = 'true'
    })
    WAVES.forEach((_, wave) => {
      later(starsAt + (WAVE_AT[wave] ?? 0), () => {
        lightWave(wave)
        score?.wave(wave)
      })
    })
    later(TRUTH.rise, () => {
      overlay.dataset.calf = 'up'
    })
    later(TRUTH.phrase4, () => {
      light('warm')
      score?.consistent()
      sing(firstHalf + 1)
    })
    later(peakAt, peak)
    later(peakAt + PEAK_HOLD_MS, () => {
      // The natural end: the peak rings on under "start light".
      stopTimers()
      beat = 'start'
      start()
    })
  }

  /** The end of the truth, all at once: the second half, every star, the whale up, the light gold. */
  const truthAtItsEnd = (): void => {
    dayOne()
    overlay.dataset.lids = 'open'
    truthLines.forEach((_, i) => {
      showPhrase(i)
    })
    truthBox.dataset.half = '2'
    WAVES.forEach((_, wave) => {
      lightWave(wave)
    })
    wake()
    scene.setPush(true)
    overlay.dataset.push = 'true'
    light('gold')
    overlay.dataset.calf = 'blow'
    overlay.dataset.star = 'on'
  }

  const start = (): void => {
    truthAtItsEnd()
    overlay.dataset.beat = 'start'
    q('.intro-start').focus()
  }

  /** On by a tap or "skip": to the truth, or straight to the end with the music settling home. */
  const go = (next: Beat): void => {
    stopTimers()
    beat = next
    if (next === 'truth') {
      truth()
      return
    }
    score?.settle()
    start()
  }

  /** The first tap: the music is allowed now, and it starts with the year. */
  const begin = (): void => {
    if (beat !== 'gate') return
    options.sound.unlock()
    score = Score.for(options.sound)
    score?.begin()
    beat = 'promise'
    promise()
  }

  const end = (how: IntroEnd): void => {
    stopTimers()
    score?.end()
    scene.setPush(false)
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
  q('.intro-begin').addEventListener('click', begin)
  overlay.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('button')) return
    if (beat === 'gate') begin()
    else if (beat === 'promise') go('truth')
    else if (beat === 'truth') go('start')
  })

  host().append(overlay)
  app?.classList.add('is-behind-intro')
  app?.setAttribute('inert', '')
  if (gated) {
    // The quiet sea, and one tap to begin with sound.
    overlay.dataset.beat = 'gate'
    scene.setEmpty(false)
    q('.intro-begin').focus()
    return
  }
  score = Score.for(options.sound)
  score?.begin()
  promise()
}
