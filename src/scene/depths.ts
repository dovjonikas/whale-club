/**
 * What lies under and along the water, as markup: the bright line where
 * the sea meets the shore, the moonlight shafts, the caustic net near the
 * surface, two whales passing far down, and kelp at the very bottom. All
 * of it moves by CSS transforms only (styles/depths.css).
 */

/** A wave line twice the width of the scene, so drifting by half of it loops without a seam. */
export function surfaceSvg(): string {
  const waves = 16
  const step = 2000 / waves
  let d = 'M0 10'
  for (let i = 0; i < waves; i++) {
    const x = i * step
    d += ` Q ${x + step / 4} 4, ${x + step / 2} 10 T ${x + step} 10`
  }
  return `<svg viewBox="0 0 2000 20" preserveAspectRatio="none" aria-hidden="true">
    <path d="${d}" fill="none" stroke="rgba(232, 240, 245, 0.55)" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
    <path d="${d}" fill="none" stroke="rgba(62, 242, 224, 0.35)" stroke-width="5" vector-effect="non-scaling-stroke" opacity="0.5"/>
  </svg>`
}

export function shaftsHtml(): string {
  return `<div class="shafts">${'<i></i>'.repeat(5)}</div>`
}

/** A big whale in silhouette, far below: only its shape and one soft highlight along its back. */
function deepWhale(): string {
  return `<svg viewBox="0 0 200 80" aria-hidden="true">
    <path d="M6 38 L24 26 L28 38 L24 50 Z M24 40 C 26 20, 120 8, 176 30 C 196 38, 196 48, 176 54 C 130 70, 60 66, 30 50 Z" fill="currentColor"/>
    <path d="M60 22 C 100 12, 150 16, 176 30" stroke="rgba(120, 200, 230, 0.12)" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`
}

export function deepHtml(): string {
  return `<div class="deep">
    <span class="deep-whale is-far">${deepWhale()}</span>
    <span class="deep-whale is-near">${deepWhale()}</span>
  </div>`
}

export function kelpHtml(): string {
  const strands = [
    [4, 70, 0],
    [9, 92, -1.6],
    [14, 60, -3],
    [86, 84, -0.8],
    [92, 66, -2.2],
    [96, 96, -4],
  ] as const
  return `<div class="kelp">${strands
    .map(
      ([x, h, delay]) => `<span style="left:${x}%;height:${h}px;animation-delay:${delay}s">
        <svg viewBox="0 0 20 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M10 100 C 2 80, 18 60, 10 40 C 4 24, 14 10, 10 0" stroke="#0e3a3a" stroke-width="5" fill="none" stroke-linecap="round"/>
          <path d="M10 70 q 8 -6 7 -14 M10 46 q -8 -6 -7 -14 M10 24 q 7 -5 6 -12" stroke="#124a45" stroke-width="3" fill="none" stroke-linecap="round"/>
        </svg>
      </span>`,
    )
    .join('')}</div>`
}
