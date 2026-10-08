import { seeded } from './random'

/**
 * A bottle washed up at the water's edge, a rolled note inside: what comes
 * back of a good thing written on an evening. Drawn in the scene's soft
 * hand, glass catching the moon on one side.
 */
export function bottleSvg(): string {
  return `<svg viewBox="0 0 64 40" aria-hidden="true">
    <g transform="rotate(-14 32 20)">
      <path d="M10 14c0-4 3-6 7-6h22c4 0 7 2 7 6v12c0 4-3 6-7 6H17c-4 0-7-2-7-6z"
        fill="rgba(160, 232, 214, 0.32)" stroke="rgba(214, 252, 240, 0.75)" stroke-width="1.6"/>
      <path d="M46 15h6c2 0 3 1 3 3v4c0 2-1 3-3 3h-6z"
        fill="rgba(160, 232, 214, 0.32)" stroke="rgba(214, 252, 240, 0.75)" stroke-width="1.6"/>
      <rect x="55" y="16.5" width="5" height="7" rx="1.6" fill="#b98a5a"/>
      <rect x="19" y="13" width="20" height="14" rx="3" fill="#fff4d6" opacity="0.9"/>
      <path d="M22 17h14M22 20.5h11M22 24h13" stroke="#c9a86a" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M14 12.5c3-2 8-2.5 12-2" stroke="rgba(255,255,255,0.8)" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    </g>
  </svg>`
}

/** Drops for a soft day's rain, the same every time: a light rain on the water, never a storm. */
export function rainHtml(): string {
  const random = seeded(1202)
  const drops = Array.from({ length: 18 }, () => {
    const x = (4 + random() * 92).toFixed(1)
    const delay = (random() * 2.4).toFixed(2)
    const length = (1.3 + random() * 0.9).toFixed(2)
    return `<i style="--x: ${x}%; --d: ${delay}s; --t: ${length}s"></i>`
  }).join('')
  const rings = Array.from({ length: 6 }, (_, i) => {
    const x = (10 + i * 15 + random() * 8).toFixed(1)
    const delay = (random() * 3).toFixed(2)
    return `<b style="--x: ${x}%; --d: ${delay}s"></b>`
  }).join('')
  return drops + rings
}
