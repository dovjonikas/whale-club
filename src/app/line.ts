/**
 * The one row of text the app speaks through. A new line fades the old
 * one out first, so two lines never fight for the same slot.
 */
/** The old line fades out over this before the new one is set (the .line transition, --dur, is longer: the new words fade in while it finishes). */
const SWAP_MS = 180

export class Line {
  private pending = 0
  private text = ''

  constructor(private readonly element: HTMLElement) {
    element.setAttribute('aria-live', 'polite')
  }

  say(text: string, options: { quiet?: boolean } = {}): void {
    clearTimeout(this.pending)
    this.text = text
    this.element.classList.add('is-fading')
    this.pending = window.setTimeout(() => {
      this.element.textContent = text
      this.element.classList.toggle('is-quiet', options.quiet === true)
      this.element.classList.remove('is-fading')
    }, SWAP_MS)
  }

  /** What the line says now, or is about to. */
  current(): string {
    return this.text
  }
}
