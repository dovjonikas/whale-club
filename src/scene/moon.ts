/**
 * The moon, in its real phase for the date. The phase is the age of the
 * moon in synodic months since a known new moon; the lit shape is the
 * limb (a half circle on the lit side) closed by the terminator, an
 * ellipse whose width follows the phase.
 */
const SYNODIC_DAYS = 29.530588853
/** A new moon: 6 January 2000, 18:14 UTC. */
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14)

/** 0 is a new moon, 0.5 a full one, back to 1. */
export function moonPhase(date: Date): number {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86_400_000
  const phase = (days / SYNODIC_DAYS) % 1
  return phase < 0 ? phase + 1 : phase
}

/** The lit part of a moon of radius r centred on (c, c), as an SVG path. */
export function litPath(phase: number, r: number, c: number): string {
  const waxing = phase < 0.5
  const k = Math.cos(phase * Math.PI * 2)
  const rx = Math.abs(k) * r
  // The limb runs top to bottom on the lit side: clockwise when the right side is lit.
  const limb = waxing ? 1 : 0
  // The terminator comes back bottom to top, bulging towards the limb for a
  // crescent and away from it for a gibbous moon.
  const terminator = k > 0 === waxing ? 0 : 1
  const top = c - r
  const bottom = c + r
  return `M${c} ${top} A${r} ${r} 0 0 ${limb} ${c} ${bottom} A${rx.toFixed(2)} ${r} 0 0 ${terminator} ${c} ${top} Z`
}

export function moonSvg(phase: number): string {
  const r = 20
  const c = 32
  return `<svg viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <radialGradient id="moon-lit" cx="40%" cy="36%" r="70%">
        <stop offset="0" stop-color="#fffdf2"/>
        <stop offset="0.6" stop-color="#fff4d6"/>
        <stop offset="1" stop-color="#e9d8b2"/>
      </radialGradient>
      <radialGradient id="moon-halo" r="50%">
        <stop offset="0.45" stop-color="#fff4d6" stop-opacity="0.32"/>
        <stop offset="0.7" stop-color="#fff4d6" stop-opacity="0.08"/>
        <stop offset="1" stop-color="#fff4d6" stop-opacity="0"/>
      </radialGradient>
      <clipPath id="moon-clip"><path d="${litPath(phase, r, c)}"/></clipPath>
    </defs>
    <circle cx="${c}" cy="${c}" r="31" fill="url(#moon-halo)" opacity="${(0.25 + 0.75 * litShare(phase)).toFixed(2)}"/>
    <circle cx="${c}" cy="${c}" r="${r}" fill="#fff4d6" opacity="0.06"/>
    <g clip-path="url(#moon-clip)">
      <circle cx="${c}" cy="${c}" r="${r}" fill="url(#moon-lit)"/>
      <circle cx="${c + 6}" cy="${c - 5}" r="3.4" fill="#b8a27a" opacity="0.28"/>
      <circle cx="${c - 6}" cy="${c + 7}" r="5" fill="#b8a27a" opacity="0.22"/>
      <circle cx="${c + 8}" cy="${c + 8}" r="2.4" fill="#b8a27a" opacity="0.2"/>
    </g>
  </svg>`
}

/** How much of the disc is lit, 0 to 1. */
export function litShare(phase: number): number {
  return (1 - Math.cos(phase * Math.PI * 2)) / 2
}
