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
export type SoundKind = 'tap' | 'untap' | 'whale' | 'unlock' | 'timer' | 'checkin' | 'grow'

export class Sound {
  private ctx: AudioContext | null = null

  constructor(private muted: boolean) {}

  isMuted(): boolean {
    return this.muted
  }

  setMuted(muted: boolean): void {
    this.muted = muted
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
      case 'timer':
        this.tone(660, 0, 0.18, 0.04, 'sine')
        this.tone(990, 0.2, 0.3, 0.04, 'sine')
        return
      case 'checkin':
        this.tone(740, 0, 0.08, 0.03, 'square')
        return
    }
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
