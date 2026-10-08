/**
 * The shore's dress for each season, one layer on the sand: snow along
 * its top in winter, blossom in the grass in spring, fallen leaves in
 * autumn. Summer has none here: its long dusk is a light over the horizon
 * (scene.css). The scene shows the one its data-season names.
 */
export function seasonShoreSvg(): string {
  const scatter = (
    count: number,
    seed: number,
    draw: (x: number, y: number, i: number) => string,
  ): string =>
    Array.from({ length: count }, (_, i) => {
      // A fixed scatter: the same shore every year.
      const x = ((i * 137 + seed) % 1000) / 1000
      const y = ((i * 71 + seed * 3) % 100) / 100
      return draw(20 + x * 960, 30 + y * 14, i)
    }).join('')
  return `<svg viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
    <g class="season-winter">
      <path d="M0 34 C 120 28, 260 36, 400 31 S 700 27, 860 32 S 960 30, 1000 33 L 1000 38 C 860 36, 700 33, 560 36 S 220 38, 0 39 Z" fill="#f4f8ff" opacity="0.92"/>
      ${scatter(26, 11, (x, y) => `<circle cx="${x.toFixed(0)}" cy="${(y - 14).toFixed(1)}" r="1.6" fill="#f4f8ff" opacity="0.8"/>`)}
    </g>
    <g class="season-spring">
      ${scatter(34, 23, (x, y, i) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(1)}" r="2.4" fill="${i % 3 === 0 ? '#fff4d6' : '#ffb7c9'}"/>`)}
    </g>
    <g class="season-autumn">
      ${scatter(30, 37, (x, y, i) => `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(1)}" rx="3.4" ry="1.8" fill="${i % 2 === 0 ? '#e0892e' : '#c4553f'}" transform="rotate(${String((i * 47) % 180)} ${x.toFixed(0)} ${y.toFixed(1)})"/>`)}
    </g>
  </svg>`
}
