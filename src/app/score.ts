import type { Sound } from './sound'

/**
 * The intro's music: a short score for a felt piano, a pad, a low voice for
 * the whale and a long room, played in step with the pictures and the
 * words. Everything is synthesised; nothing is loaded.
 *
 * It is built on what makes music catch in the chest (docs/DECISIONS.md,
 * "The intro has a score"): a melody that leans on a note outside the chord
 * and then resolves (an appoggiatura), harmony that turns where it was not
 * expected, a sudden swell after silence, a new voice entering at the top,
 * and the range opening wide at the climax. The harmony walks the oldest
 * road from tender to bright: A minor (the doubt), F (the hope), G with its
 * fourth held over (the waiting), C (the arrival). Every word of the
 * sentence has its note, so the text sings as it appears.
 *
 * Notes are named ('C4') and the voicings written out, so the score reads
 * like one. The room is a generated impulse response: noise that darkens
 * as it dies, about three seconds long, under a soft echo.
 */

const PITCH: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const A4_HZ = 440
const A4_MIDI = 69

/** 'C4' is middle C. Sharps as 'F#4'. */
function hz(name: string): number {
  const match = /^([A-G])(#?)(\d)$/.exec(name)
  const letter = match?.[1]
  if (!match || letter === undefined) throw new Error(`not a note: ${name}`)
  const midi = 12 * (Number(match[3]) + 1) + (PITCH[letter] ?? 0) + (match[2] ? 1 : 0)
  return A4_HZ * 2 ** ((midi - A4_MIDI) / 12)
}

/** The same note, octaves up. */
function up(name: string, octaves: number): string {
  return name.replace(/\d$/, (octave) => String(Number(octave) + octaves))
}

// --- the score --------------------------------------------------------------------------------

/** The year's harmony, one chord a season: C, A minor, F, G. */
const SEASONS = [
  ['C3', 'G3', 'E4'],
  ['A2', 'E3', 'C4'],
  ['F2', 'C3', 'A3'],
  ['G2', 'D3', 'B3'],
]
/** The music box of the year: up and down each season's chord, two octaves. */
const ARPEGGIOS = [
  ['C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'E5', 'C5', 'G4', 'E4'],
  ['A3', 'C4', 'E4', 'A4', 'C5', 'E5', 'C5', 'A4', 'E4', 'C4'],
  ['F3', 'A3', 'C4', 'F4', 'A4', 'C5', 'A4', 'F4', 'C4', 'A3'],
  ['G3', 'B3', 'D4', 'G4', 'B4', 'D5', 'B4', 'G4', 'D4', 'B3'],
]
const SEA = ['C2', 'G2']
/** Day 365, held: G with the fourth (C) over it instead of the third. */
const HELD = ['G2', 'C3', 'D3', 'G3', 'C4']
/** The promise's line walks up, leans on F over the C chord, and falls to E on the last word. */
const PROMISE_LINE = ['G4', 'C5', 'D5', 'F5', 'E5']
const HOME = ['C2', 'G2', 'E3', 'C4', 'G4']
const DOUBT = ['A2', 'E3', 'A3', 'C4']
/**
 * The truth, a note for every word (null: the word passes in silence). The
 * doubt falls in A minor and ends unresolved on B; the hope climbs in F and
 * hands over to the stars at "compound"; the last phrase climbs over the
 * held G and lands its last word, "small.", on F over C, which the peak
 * resolves to E.
 */
const TRUTH_LINES: readonly (readonly (string | null)[])[] = [
  ['A4', 'C5', 'B4', 'A4', 'G4', 'A4', 'C5', 'B4', 'A4', 'E4'],
  ['E4', 'G4', 'A4', 'C5', 'B4', 'A4', 'B4'],
  ['C5', 'A4', 'C5', 'D5', 'C5', 'F5', null, null],
  ['G4', 'A4', 'C5', 'D5', 'E5', 'D5', 'E5', 'G5', 'F5'],
]
const HOPE = ['F2', 'C3', 'F3', 'A3', 'C4', 'G4']
const HOPE_STRUM = ['F3', 'A3', 'C4', 'F4']
/** The stars' notes: F major pentatonic, climbing as the waves double. */
const STARS = ['F4', 'G4', 'A4', 'C5', 'D5', 'F5', 'G5', 'A5', 'C6', 'D6', 'F6', 'G6', 'A6', 'C7']
/** How long each wave's notes take to ripple out, s: shorter as they come faster, the last a long run. */
const WAVE_SPAN = [0, 0.4, 0.34, 0.26, 0.62]
/** Waiting: G with C held over it and the seventh, F, on top. */
const WAITING = ['G2', 'D3', 'G3', 'C4', 'D4', 'F4']
/** The arrival: C, wide open from the bass to the sky. */
const ARRIVAL = ['C2', 'G2', 'C3', 'G3', 'E4', 'G4', 'C5']
const ARRIVAL_STRUM = ['C3', 'G3', 'E4', 'C5']
const BELLS = ['G6', 'C7', 'E7', 'G7']
/** The last word's F falls to E this long after the chord lands, s. */
const LEAN_S = 0.45

/**
 * Loudness, as gains. The arc lives in these numbers: the sea far off, the
 * year a music box, the doubt some ten decibels under the peak, the stars
 * climbing between, the blink a silence, the arrival the loudest moment.
 * Pads are given as their own loudness whatever the number of notes in them.
 */
const LEVEL = {
  master: 0.62,
  /** The blink: the whole score drops to this share and comes back with the hope. */
  hush: 0.03,
  pad: {
    sea: 0.04,
    season: 0.05,
    held: 0.08,
    home: 0.08,
    doubt: 0.035,
    hope: 0.09,
    waiting: 0.08,
    arrival: 0.42,
    settle: 0.07,
  },
  felt: {
    step: 0.03,
    sparkle: 0.012,
    line: 0.06,
    doubt: 0.03,
    hope: 0.06,
    last: 0.055,
    strum: 0.035,
    arrival: 0.09,
    lean: 0.09,
    bell: 0.015,
    waveFrom: 0.025,
    waveBy: 0.01,
  },
  voice: { call: 0.05, song: 0.07 },
} as const

// --- the instruments ---------------------------------------------------------------------------

/** A felt piano's overtones: a strong fundamental, a few soft partials, nothing bright. */
const FELT_PARTIALS = [0, 1, 0.5, 0.22, 0.1, 0.05, 0.025, 0.012]
/** The room: how long until it is near silence, s, and its first reflection, s. */
const ROOM_S = 3.2
const ROOM_PREDELAY_S = 0.02
/** The echo: a little over a third of a second, each repeat a third as loud and darker. */
const ECHO_S = 0.36
const ECHO_FEEDBACK = 0.33
const ECHO_TONE_HZ = 2200
const END_FADE_S = 1.6
/** How a last chord rings out, s: a while at full, sinking to a share, then gone some seconds later. */
const RING = { after: 1.2, share: 0.3, sink: 7, gone: 14, fade: 9 }

interface Mix {
  gain: number
  room: number
  echo: number
}

interface PadShape {
  /** Seconds to swell in. */
  attack: number
  gain: number
  /** The low-pass cutoff, Hz: lower is darker. */
  cutoff: number
  /** A last chord rings out: it sinks to a quiet share, then away, instead of droning on. */
  ringsOut?: boolean
}

interface Held {
  out: GainNode
  tone: BiquadFilterNode
  sources: OscillatorNode[]
}

/**
 * A room as an impulse response: stereo noise, smoothed more as it fades,
 * so it darkens like a real one. The fade is one multiplication a sample
 * rather than an exponential, and a context's room is built once and kept:
 * the intro builds it while "tap to begin" waits (Score.warm), so the tap
 * itself never stalls a frame.
 */
const rooms = new WeakMap<BaseAudioContext, AudioBuffer>()

function roomImpulse(ctx: BaseAudioContext): AudioBuffer {
  const kept = rooms.get(ctx)
  if (kept) return kept
  const rate = ctx.sampleRate
  const length = Math.floor(rate * ROOM_S)
  const buffer = ctx.createBuffer(2, length, rate)
  // Down 60 dB over the room's length.
  const fade = Math.exp(-Math.log(1000) / (ROOM_S * rate))
  const darkening = 0.75 / length
  const predelay = Math.floor(rate * ROOM_PREDELAY_S)
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel)
    let smooth = 0
    let level = fade ** predelay
    let darken = 0.2 + darkening * predelay
    for (let i = predelay; i < length; i++) {
      smooth = smooth * darken + (Math.random() * 2 - 1) * (1 - darken)
      data[i] = smooth * level
      level *= fade
      darken += darkening
    }
  }
  rooms.set(ctx, buffer)
  return buffer
}

export class Score {
  private readonly master: GainNode
  private readonly dry: GainNode
  private readonly room: GainNode
  private readonly echo: GainNode
  private readonly felt: PeriodicWave
  private pad: Held | null = null
  /** Every note scheduled, so a skip can silence the ones still to come. */
  private sources: { node: AudioScheduledSourceNode; at: number }[] = []

  /** The score for this intro, or none when the sound is off or not yet allowed. */
  static for(sound: Sound): Score | null {
    const ctx = sound.context()
    return ctx ? new Score(ctx, ctx.destination) : null
  }

  /** Builds the room ahead of the first note, while nothing moves. */
  static warm(sound: Sound): void {
    const ctx = sound.context()
    if (ctx) roomImpulse(ctx)
  }

  constructor(
    private readonly ctx: BaseAudioContext,
    destination: AudioNode,
  ) {
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -10
    limiter.knee.value = 10
    limiter.ratio.value = 4
    limiter.attack.value = 0.01
    limiter.release.value = 0.4
    this.master = ctx.createGain()
    this.master.gain.value = LEVEL.master
    this.master.connect(limiter).connect(destination)

    this.dry = ctx.createGain()
    this.dry.connect(this.master)

    const convolver = ctx.createConvolver()
    convolver.buffer = roomImpulse(ctx)
    this.room = ctx.createGain()
    this.room.connect(convolver).connect(this.master)

    const delay = ctx.createDelay(1)
    delay.delayTime.value = ECHO_S
    const darker = ctx.createBiquadFilter()
    darker.type = 'lowpass'
    darker.frequency.value = ECHO_TONE_HZ
    const feedback = ctx.createGain()
    feedback.gain.value = ECHO_FEEDBACK
    this.echo = ctx.createGain()
    this.echo.connect(delay).connect(darker).connect(feedback).connect(delay)
    // The echoes sound in the room too.
    darker.connect(this.master)
    darker.connect(this.room)

    const imag = new Float32Array(FELT_PARTIALS)
    this.felt = ctx.createPeriodicWave(new Float32Array(imag.length), imag)
  }

  private get now(): number {
    return this.ctx.currentTime
  }

  /** Into the dry path, the room and the echo, each by its own amount. */
  private route(node: AudioNode, mix: Mix): void {
    node.connect(this.dry)
    const room = this.ctx.createGain()
    room.gain.value = mix.room
    node.connect(room).connect(this.room)
    const echo = this.ctx.createGain()
    echo.gain.value = mix.echo
    node.connect(echo).connect(this.echo)
  }

  private track(node: AudioScheduledSourceNode, at: number): void {
    this.sources.push({ node, at })
    node.addEventListener('ended', () => {
      this.sources = this.sources.filter((s) => s.node !== node)
    })
  }

  /** One felt-piano note: a soft hammer, a bright moment that mellows, a long fall. */
  private note(name: string, delay: number, mix: Mix): void {
    const f = hz(name)
    const at = this.now + delay
    // Low strings ring longer.
    const tau = Math.min(1.8, Math.max(0.6, 2.4 - Math.log2(f / 130) * 0.45))
    const amp = this.ctx.createGain()
    amp.gain.setValueAtTime(0, at)
    amp.gain.linearRampToValueAtTime(mix.gain, at + 0.008)
    amp.gain.setTargetAtTime(0, at + 0.008, tau)
    const tone = this.ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.setValueAtTime(Math.min(9000, f * 9), at)
    tone.frequency.setTargetAtTime(f * 2.6, at + 0.01, 0.35)
    for (const cents of [-4, 4]) {
      const osc = this.ctx.createOscillator()
      osc.setPeriodicWave(this.felt)
      osc.frequency.value = f
      osc.detune.value = cents
      osc.connect(tone)
      osc.start(at)
      osc.stop(at + tau * 7)
      this.track(osc, at)
    }
    tone.connect(amp)
    this.route(amp, mix)
  }

  private strum(names: string[], delay: number, gain: number, gap = 0.028): void {
    names.forEach((name, i) => {
      this.note(name, delay + i * gap, { gain, room: 0.6, echo: 0.15 })
    })
  }

  /** A pad: two slightly apart saws a note, warm under a low-pass, swelling in. */
  private held(names: string[], o: PadShape, delay: number): Held {
    const at = this.now + delay
    // As loud with seven notes as with two: the saws add up as their square root.
    const level = o.gain / Math.sqrt(names.length * 2)
    const out = this.ctx.createGain()
    out.gain.setValueAtTime(0, at)
    out.gain.linearRampToValueAtTime(level, at + o.attack)
    if (o.ringsOut) {
      out.gain.setTargetAtTime(level * RING.share, at + o.attack + RING.after, RING.sink / 3)
      out.gain.setTargetAtTime(0, at + RING.gone, RING.fade / 3)
    }
    const tone = this.ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = o.cutoff
    tone.Q.value = 0.6
    const sources: OscillatorNode[] = []
    for (const name of names) {
      for (const cents of [-7, 7]) {
        const osc = this.ctx.createOscillator()
        osc.type = 'sawtooth'
        osc.frequency.value = hz(name)
        osc.detune.value = cents
        osc.connect(tone)
        osc.start(at)
        sources.push(osc)
      }
    }
    tone.connect(out)
    this.route(out, { gain: 1, room: 0.7, echo: 0 })
    return { out, tone, sources }
  }

  /**
   * Lets a pad go. Its oscillators stop on a schedule too, so a pad let go
   * while it is still swelling in falls silent all the same.
   */
  private release(pad: Held | null, seconds: number, delay = 0): void {
    if (!pad) return
    const at = this.now + delay
    pad.out.gain.setTargetAtTime(0, at, seconds / 3)
    for (const osc of pad.sources) osc.stop(at + seconds * 2)
  }

  /** The pad moves to a new chord: the old one fades as the new one swells. */
  private padTo(names: string[], o: PadShape, delay = 0): void {
    this.release(this.pad, o.attack, delay)
    this.pad = this.held(names, o, delay)
  }

  /** Opens the pad's tone over a few seconds: the sound brightens with the light. */
  private brighten(cutoff: number, seconds: number): void {
    this.pad?.tone.frequency.setTargetAtTime(cutoff, this.now, seconds / 3)
  }

  /** The whale's voice: a low sine that glides between two notes, with a slow vibrato. */
  private voice(from: string, to: string, delay: number, seconds: number, gain: number): void {
    const at = this.now + delay
    const osc = this.ctx.createOscillator()
    osc.frequency.setValueAtTime(hz(from), at)
    osc.frequency.exponentialRampToValueAtTime(hz(to), at + seconds * 0.6)
    const vibrato = this.ctx.createOscillator()
    vibrato.frequency.value = 5
    const depth = this.ctx.createGain()
    depth.gain.value = hz(to) * 0.006
    vibrato.connect(depth).connect(osc.frequency)
    const amp = this.ctx.createGain()
    amp.gain.setValueAtTime(0, at)
    amp.gain.linearRampToValueAtTime(gain, at + 0.35)
    amp.gain.setTargetAtTime(0, at + seconds * 0.7, seconds * 0.25)
    const tone = this.ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 900
    osc.connect(tone).connect(amp)
    this.route(amp, { gain: 1, room: 1, echo: 0.3 })
    for (const source of [osc, vibrato]) {
      source.start(at)
      source.stop(at + seconds * 2)
      this.track(source, at)
    }
  }

  /** Silences every note still to come; what is sounding rings out. */
  private cutAhead(): void {
    const soon = this.now + 0.02
    for (const { node, at } of this.sources) if (at > soon) node.stop(soon)
  }

  // --- the cues, in the order the intro plays them --------------------------------------------

  /** The first tap: the sea, two low notes far off. */
  begin(): void {
    this.padTo(SEA, { attack: 2.5, gain: LEVEL.pad.sea, cutoff: 380 })
  }

  /** A new season of the year: its chord. */
  season(quarter: number): void {
    const chord = SEASONS[quarter]
    if (chord) this.padTo(chord, { attack: 1.2, gain: LEVEL.pad.season, cutoff: 700 })
  }

  /** One step of the year's music box; it runs as fast as the days do. */
  step(beat: number, quarter: number): void {
    const notes = ARPEGGIOS[quarter] ?? []
    const name = notes[beat % notes.length]
    if (name) this.note(name, 0, { gain: LEVEL.felt.step, room: 0.5, echo: 0.2 })
  }

  /** A find opening: a high, quiet bell on the season's chord. */
  sparkle(quarter: number, k: number): void {
    const notes = ARPEGGIOS[quarter] ?? []
    const name = notes[(k * 3) % notes.length]
    if (name) this.note(up(name, 2), 0, { gain: LEVEL.felt.sparkle, room: 1, echo: 0.3 })
  }

  /** Day 365, held: the music waits on a suspended chord. */
  fermata(): void {
    this.padTo(HELD, { attack: 0.6, gain: LEVEL.pad.held, cutoff: 900 })
  }

  /** The whale rises: its call, a slow glide up. */
  whale(): void {
    this.voice('G2', 'C3', 0, 1.8, LEVEL.voice.call)
  }

  /**
   * The promise's line, a note a word: it walks up, and on the word before
   * the last the chord turns home under an F that leans on it and falls to E
   * on the last word. Any number of words fits the same shape.
   */
  line(wordMs: number, words: number): void {
    const step = wordMs / 1000
    const walk = PROMISE_LINE.slice(0, -2)
    const lean = PROMISE_LINE.at(-2) ?? 'F5'
    const rest = PROMISE_LINE.at(-1) ?? 'E5'
    for (let i = 0; i < words; i++) {
      const name =
        i === words - 1
          ? rest
          : i === words - 2
            ? lean
            : (walk[Math.min(i, walk.length - 1)] ?? rest)
      this.note(name, i * step, { gain: LEVEL.felt.line, room: 0.6, echo: 0.3 })
    }
    this.padTo(
      HOME,
      { attack: 0.8, gain: LEVEL.pad.home, cutoff: 1100 },
      Math.max(0, words - 2) * step,
    )
  }

  /** The eyes close on the year: everything fades to a breath. */
  close(): void {
    this.cutAhead()
    this.release(this.pad, 1.4)
    this.pad = null
  }

  /** Day one, the doubt: A minor, low and dark. */
  doubt(): void {
    this.padTo(DOUBT, { attack: 2.2, gain: LEVEL.pad.doubt, cutoff: 520 })
  }

  /** The melody under a phrase of the truth, a note a word: quiet in the doubt, fuller in the hope. */
  phrase(i: number, wordMs: number): void {
    const step = wordMs / 1000
    const gain = i < 2 ? LEVEL.felt.doubt : i === 2 ? LEVEL.felt.hope : LEVEL.felt.last
    TRUTH_LINES[i]?.forEach((name, k) => {
      if (name) this.note(name, k * step, { gain, room: 0.65, echo: 0.35 })
    })
  }

  /** The blink: silence, even the echoes, so what comes next is heard. */
  blink(): void {
    this.cutAhead()
    this.release(this.pad, 0.3)
    this.pad = null
    this.master.gain.setTargetAtTime(LEVEL.master * LEVEL.hush, this.now, 0.06)
  }

  /** The eyes open on the hope: F, a bass that was not there before, a soft chord struck. */
  turn(): void {
    this.master.gain.setTargetAtTime(LEVEL.master, this.now, 0.02)
    this.padTo(HOPE, { attack: 0.5, gain: LEVEL.pad.hope, cutoff: 800 })
    this.strum(HOPE_STRUM, 0.05, LEVEL.felt.strum)
    this.brighten(1600, 3)
  }

  /** A wave of stars: twice the notes of the last, higher, quicker, louder. */
  wave(w: number): void {
    const count = 2 ** w
    const span = WAVE_SPAN[w] ?? 0
    const top = STARS.length - 1
    const gain = LEVEL.felt.waveFrom + LEVEL.felt.waveBy * w
    for (let k = 0; k < count; k++) {
      // Up the scale, and back down when it runs out of sky.
      const index = w + k
      const name = STARS[index <= top ? index : 2 * top - index]
      if (name) this.note(name, (span * k) / count, { gain, room: 0.8, echo: 0.25 })
    }
    this.brighten(1000 + 450 * w, 1)
  }

  /** "that you stay consistent": the music waits on G with C held over it, and swells. */
  consistent(): void {
    this.padTo(WAITING, { attack: 1.4, gain: LEVEL.pad.waiting, cutoff: 1500 })
  }

  /** The last word: home, wide open, the F falling to E, bells, and the whale singing up. */
  peak(): void {
    this.padTo(ARRIVAL, { attack: 0.25, gain: LEVEL.pad.arrival, cutoff: 2400, ringsOut: true })
    this.strum(ARRIVAL_STRUM, 0, LEVEL.felt.arrival)
    this.note('E5', LEAN_S, { gain: LEVEL.felt.lean, room: 0.7, echo: 0.4 })
    BELLS.forEach((name, i) => {
      this.note(name, 0.15 + i * 0.2, { gain: LEVEL.felt.bell, room: 1, echo: 0.4 })
    })
    this.voice('C3', 'G3', 0.2, 2.2, LEVEL.voice.song)
  }

  /** Skipped to the end: home, softly, without the climb. */
  settle(): void {
    this.cutAhead()
    this.master.gain.setTargetAtTime(LEVEL.master, this.now, 0.02)
    this.padTo(HOME, { attack: 1.5, gain: LEVEL.pad.settle, cutoff: 1100, ringsOut: true })
    this.strum(ARRIVAL_STRUM, 0.1, LEVEL.felt.strum)
  }

  /** The intro is over: everything fades, stops, and is let go. */
  end(): void {
    const at = this.now
    this.master.gain.setTargetAtTime(0, at, END_FADE_S / 3)
    for (const { node } of this.sources) node.stop(at + END_FADE_S * 2)
    this.release(this.pad, END_FADE_S)
    this.pad = null
    window.setTimeout(() => {
      this.master.disconnect()
    }, END_FADE_S * 2000)
  }
}
