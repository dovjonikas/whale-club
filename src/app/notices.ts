/**
 * One notice above the row at a time: the install leaf, the weekly recap,
 * the check-in, the new chapter. Each is offered in that order and the first that applies
 * takes the slot; the next appears when it is dismissed. A screen with
 * three cards stacked above the row is a screen where the row is below
 * the fold.
 */
export type NoticeBuilder = (dismiss: () => void) => HTMLElement | null

export class Notices {
  private builders: NoticeBuilder[] = []

  constructor(private readonly slot: HTMLElement) {}

  /** Replaces the list of candidates and shows the first that applies. */
  offer(builders: NoticeBuilder[]): void {
    this.builders = builders
    this.render()
  }

  /**
   * Shows this one now, in place of whatever card is up (which comes back
   * when it is dismissed, if it still applies).
   */
  lead(build: NoticeBuilder): void {
    this.slot.replaceChildren()
    const element = build(() => {
      element?.remove()
      this.render()
    })
    if (element) this.slot.replaceChildren(element)
    else this.render()
  }

  render(): void {
    if (this.slot.childElementCount > 0) return
    for (const build of this.builders) {
      const element = build(() => {
        element?.remove()
        this.render()
      })
      if (element) {
        this.slot.replaceChildren(element)
        return
      }
    }
  }
}
