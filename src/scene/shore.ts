/**
 * The shore: a thin strip of sand at the horizon with grass on it. The
 * garden's collectibles are planted into the `#garden` group later, in the
 * same coordinate space (1000 wide, 100 tall, the sand's top edge at y 48).
 */
export function shoreSvg(): string {
  // Hand-placed so the grass clumps rather than lines up like a lawn.
  const clumps: [number, number][] = [
    [40, 14],
    [58, 20],
    [150, 10],
    [240, 18],
    [262, 12],
    [410, 16],
    [530, 9],
    [548, 22],
    [700, 14],
    [820, 19],
    [838, 11],
    [960, 15],
  ]
  const tufts = clumps
    .map(
      ([x, h], i) =>
        `<path d="M${x} 50 q 3 ${-h * 0.6} ${i % 2 ? 6 : -4} ${-h} M${x + 5} 50 q 2 ${-h * 0.5} 5 ${-h * 0.7}" stroke="var(--leaf)" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>`,
    )
    .join('')
  return `<svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--sand)" stop-opacity="0.95"/>
        <stop offset="1" stop-color="#6e5a39" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <path d="M0 50 C 200 42, 400 54, 600 46 S 900 40, 1000 48 L1000 70 C 800 76, 600 66, 400 74 S 100 66, 0 72 Z" fill="url(#sand)"/>
    <path d="M0 69 C 200 75, 400 65, 600 73 S 900 65, 1000 70 L1000 80 L0 80 Z" fill="var(--teal)" opacity="0.3"/>
    <g id="garden" vector-effect="non-scaling-stroke">${tufts}</g>
  </svg>`
}
