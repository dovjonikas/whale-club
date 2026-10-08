import { voice } from '../voice'
import { openSheet } from './sheet'

/**
 * How it works, for a friend who got the link and nothing else: the few
 * lines that are the whole idea, the three rules, the intro again, and the
 * questions people ask first.
 */
export function openHowItWorks(onWatch: () => void): void {
  openSheet({
    title: voice.howItWorks.title,
    build(body, close) {
      body.innerHTML = `
        <ul class="how-lines">${voice.howItWorks.lines.map((l) => `<li>${l}</li>`).join('')}</ul>
        <ol class="rules how-rules">${voice.rules.map((rule) => `<li>${rule}</li>`).join('')}</ol>
        <button type="button" class="button-primary how-watch">${voice.intro.watch}</button>
        <h3 class="settings-title how-faq-title">${voice.howItWorks.questions}</h3>
        <dl class="how-faq">${voice.howItWorks.faq.map(([q, a]) => `<dt>${q}</dt><dd>${a}</dd>`).join('')}</dl>`
      body.querySelector('.how-watch')?.addEventListener('click', () => {
        close()
        onWatch()
      })
    },
  })
}
