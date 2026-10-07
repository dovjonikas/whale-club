import type { World } from '../store/types'

/**
 * A few short synthesised sounds and the mute state.
 *
 * iOS allows audio only after a user gesture, so the context is created
 * and resumed inside the first tap (`unlock`), never before. Setting the
 * audio session to playback keeps the iPhone's silent switch from
 * swallowing it. Everything is an enveloped oscillator: no files to load
 * or cache, and nothing plays before the person has touched the screen.
 */
export type SoundKind =
  'tap' | 'untap' | 'whale' | 'unlock' | 'left' | 'resume' | 'checkin' | 'grow'

export class Sound {
  private ctx: AudioContext | null = null
  private sea: { source: AudioBufferSourceNode; lfo: OscillatorNode; gain: GainNode } | null = null

  constructor(private muted: boolean) {}

  isMuted(): boolean {
    return this.muted
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (muted) this.stopSea()
  }

  /**
   * The quiet sea under a lock-in: brown noise through a low-pass filter,
   * its volume rising and falling every eleven seconds or so, like waves
   * heard from a little way off. Generated, so there is nothing to load.
   * Off unless the person switches it on; the mute button silences it too.
   */
  setSea(on: boolean): void {
    if (!on || this.muted) {
      this.stopSea()
      return
    }
    const ctx = this.ctx
    if (!ctx || this.sea) return
    const seconds = 4
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i++) {
      // Brown noise: each sample a small step from the last, which keeps the hiss low and soft.
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
      data[i] = last * 3.5
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 520
    const gain = ctx.createGain()
    gain.gain.value = 0.035
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.09
    const depth = ctx.createGain()
    depth.gain.value = 0.025
    lfo.connect(depth).connect(gain.gain)
    source.connect(filter).connect(gain).connect(ctx.destination)
    source.start()
    lfo.start()
    this.sea = { source, lfo, gain }
  }

  private stopSea(): void {
    if (!this.sea || !this.ctx) return
    const { source, lfo, gain } = this.sea
    this.sea = null
    gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4)
    source.stop(this.ctx.currentTime + 1.5)
    lfo.stop(this.ctx.currentTime + 1.5)
  }

  /** Call from inside a user gesture. Safe to call many times. */
  unlock(): void {
    try {
      const nav = navigator as Navigator & { audioSession?: { type: string } }
      if (nav.audioSession) nav.audioSession.type = 'playback'
      this.ctx ??= new AudioContext()
      if (this.ctx.state === 'suspended') void this.ctx.resume()
    } catch {
      // Audio is optional; the app is silent and that is fine.
    }
  }

  play(kind: SoundKind, world: World = 'sea'): void {
    if (this.muted || !this.ctx) return
    switch (kind) {
      case 'tap':
        if (world === 'sea') {
          this.tone(330, 0, 0.12, 0.05, 'sine', 520)
          this.tone(880, 0.08, 0.08, 0.02, 'sine', 1320)
        } else if (world === 'sky') {
          this.tone(1320, 0, 0.14, 0.03, 'triangle', 1760)
          this.tone(1980, 0.06, 0.1, 0.015, 'sine')
        } else {
          this.tone(523, 0, 0.16, 0.04, 'triangle', 659)
        }
        return
      case 'untap':
        this.tone(440, 0, 0.1, 0.03, 'sine', 330)
        return
      case 'grow':
        this.tone(392, 0, 0.12, 0.04, 'triangle')
        this.tone(523, 0.1, 0.12, 0.04, 'triangle')
        this.tone(784, 0.2, 0.2, 0.04, 'triangle')
        return
      case 'unlock':
        this.tone(659, 0, 0.1, 0.04, 'sine')
        this.tone(880, 0.1, 0.1, 0.04, 'sine')
        this.tone(1319, 0.2, 0.3, 0.04, 'sine')
        return
      case 'whale':
        this.tone(96, 0, 1.4, 0.07, 'sine', 160)
        this.tone(192, 0.1, 1.2, 0.03, 'sine', 320)
        return
      // The end of a session that was left: two soft notes, no fanfare.
      case 'left':
        this.tone(660, 0, 0.18, 0.04, 'sine')
        this.tone(990, 0.2, 0.3, 0.04, 'sine')
        return
      case 'checkin':
        this.tone(740, 0, 0.08, 0.03, 'square')
        return
      // The pause ran out and the session goes on: one low, quiet note.
      case 'resume':
        this.tone(392, 0, 0.5, 0.025, 'sine')
        return
    }
  }

  /** The audio context for longer music (the intro's score), or none while muted or not yet allowed. */
  context(): AudioContext | null {
    return this.muted ? null : this.ctx
  }

  /** Whether sound can play now: a tap has opened it and nothing has closed it since. */
  isRunning(): boolean {
    return this.ctx?.state === 'running'
  }

  private tone(
    freq: number,
    at: number,
    dur: number,
    gain: number,
    type: OscillatorType,
    glide?: number,
  ): void {
    const ctx = this.ctx
    if (!ctx) return
    const t = ctx.currentTime + at
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t + dur)
    amp.gain.setValueAtTime(0.0001, t)
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.02)
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(amp).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  }
}
