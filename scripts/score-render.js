/* global OfflineAudioContext -- it runs in the browser, on the dev server */
/**
 * Renders the intro's whole score offline, every cue at its real time, and
 * measures it: the peak (it must stay under 0 dBFS) and the loudness of each
 * section (the arc). Run in the browser on the dev server:
 *   const { renderScore } = await import('/whale-club/scripts/score-render.js')
 *   await renderScore()
 * The times mirror src/app/intro.ts.
 */
export async function renderScore() {
  const { Score } = await import(`/whale-club/src/app/score.ts?t=${String(Date.now())}`)
  const rate = 24000
  const seconds = 34
  const ctx = new OfflineAudioContext(2, rate * seconds, rate)
  const score = new Score(ctx, ctx.destination)
  const cues = []
  const at = (t, fn) => cues.push([t, fn])

  at(0, () => score.begin())
  // The year: frames at 30 fps from 1.1 s over 7 s, eased in and out.
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  let season = -1
  let stepAt = 0
  let last = 0
  for (let k = 0; k <= 210; k++) {
    const t = k / 30
    const day = Math.max(1, Math.round(1 + 364 * ease(Math.min(1, t / 7))))
    if (day === last) continue
    last = day
    const q = Math.min(3, Math.floor((day - 1) / (365 / 4)))
    const step = Math.floor(day / 14)
    const newSeason = q !== season
    const newStep = step > stepAt
    season = q
    stepAt = step
    if (newSeason || newStep)
      at(1.1 + t, () => {
        if (newSeason) score.season(q)
        if (newStep) score.step(step, q)
      })
  }
  at(8.1, () => score.fermata())
  at(8.7, () => score.whale())
  at(10.2, () => score.line(240, 5))
  at(14.4, () => score.close())
  const T = 15.1
  at(T, () => score.close())
  at(T + 1.0, () => score.doubt())
  at(T + 1.2, () => score.phrase(0, 200))
  at(T + 3.8, () => score.phrase(1, 200))
  at(T + 6.1, () => score.blink())
  at(T + 6.6, () => score.turn())
  at(T + 6.95, () => score.phrase(2, 200))
  ;[0, 0.56, 0.98, 1.28, 1.48].forEach((d, w) => at(T + 7.95 + d, () => score.wave(w)))
  at(T + 10.0, () => {
    score.consistent()
    score.phrase(3, 200)
  })
  at(T + 11.6, () => score.peak())
  at(T + 16.0, () => score.end())

  cues.sort((a, b) => a[0] - b[0])
  const quantum = 128 / rate
  const used = new Set()
  for (const [t, fn] of cues) {
    let q = Math.ceil(t / quantum) * quantum
    while (used.has(q.toFixed(6))) q += quantum
    used.add(q.toFixed(6))
    void ctx.suspend(q).then(() => {
      fn()
      void ctx.resume()
    })
  }
  const buffer = await ctx.startRendering()
  const left = buffer.getChannelData(0)
  const right = buffer.getChannelData(1)
  let peak = 0
  for (let i = 0; i < left.length; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]))
  const db = (from, to) => {
    let sum = 0
    const a = Math.floor(from * rate)
    const b = Math.floor(to * rate)
    for (let i = a; i < b; i++) sum += left[i] * left[i] + right[i] * right[i]
    return Math.round(10 * Math.log10(sum / (2 * (b - a)) || 1e-12))
  }
  const sections = {
    sea: [0.2, 1.1],
    year: [1.1, 8.1],
    held: [8.1, 10.2],
    line: [10.2, 14.4],
    close: [14.6, 16.1],
    doubt: [16.3, 21.2],
    blink: [21.35, 21.7],
    hope: [21.75, 23.0],
    stars: [23.05, 25.0],
    waiting: [25.1, 26.7],
    peak: [26.7, 28.2],
    ring: [28.2, 31.0],
  }
  const arc = Object.fromEntries(Object.entries(sections).map(([k, [a, b]]) => [k, db(a, b)]))
  return { peakDb: Number((20 * Math.log10(peak)).toFixed(1)), arc }
}
