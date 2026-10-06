/**
 * The design tokens as hex, for the one place CSS variables cannot reach:
 * an SVG serialised into an image for the share picture. The stylesheet
 * (`styles/tokens.css`) is the source; this copy must match it.
 */
export const PALETTE: Record<string, string> = {
  abyss: '#020409',
  deep: '#06122b',
  night: '#0b1a3a',
  zenith: '#03070f',
  glow: '#3ef2e0',
  teal: '#0fb5a8',
  star: '#ffd98a',
  'star-pale': '#fff4d6',
  leaf: '#5fbf4a',
  sun: '#f2c94c',
  sand: '#c9a86a',
  jacket: '#e63946',
  ink: '#e8f0f5',
  'ink-dim': '#7f93a6',
}

/** Replaces every `var(--token)` in an SVG string with its hex value. */
export function resolveTokens(svg: string): string {
  return svg.replace(/var\(--([a-z-]+)\)/g, (match, name: string) => PALETTE[name] ?? match)
}
