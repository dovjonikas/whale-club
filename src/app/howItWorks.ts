import { voice } from '../voice'
import { openSheet } from './sheet'

/**
 * How it works, for a friend who got the link and nothing else: the few
 * lines that are the whole idea, the three rules, and the intro again.
 */
export function openHowItWorks(onWatch: () => void): void {
  openSheet({
    title: voice.howItWorks.title,
    build(body, close) {
      body.innerHTML = `
        <ul class="how-lines">${voice.howItWorks.lines.map((l) => `<li>${l}</li>`).join('')}</ul>
        <ol class="rules how-rules">${voice.rules.map((rule) => `<li>${rule}</li>`).join('')}</ol>
        <button type="button" class="button-primary how-watch">${voice.intro.watch}</button>`
      body.querySelector('.how-watch')?.addEventListener('click', () => {
        close()
        onWatch()
      })
    },
  })
}
