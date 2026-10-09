import { voice } from '../voice'
import { menuRow } from './menuRow'
import { rulesHtml } from './rules'
import { openSheet } from './sheet'

/**
 * How it works, for a friend who got the link and nothing else: the few
 * lines that are the whole idea, the three rules, the intro again, and the
 * questions people ask first.
 */
export function openHowItWorks(onWatch: () => void, onNews?: () => void): void {
  openSheet({
    title: voice.howItWorks.title,
    build(body, close) {
      body.innerHTML = `
        <ul class="how-lines">${voice.howItWorks.lines.map((l) => `<li>${l}</li>`).join('')}</ul>
        ${rulesHtml()}
        <div class="row-group how-watch-group">${menuRow('how-watch', voice.intro.watch, 'play')}${
          onNews ? menuRow('how-news', voice.news.title, 'star') : ''
        }</div>
        <h3 class="eyebrow how-faq-title">${voice.howItWorks.questions}</h3>
        <dl class="how-faq">${voice.howItWorks.faq.map(([q, a]) => `<dt>${q}</dt><dd>${a}</dd>`).join('')}</dl>`
      body.querySelector('.how-watch')?.addEventListener('click', () => {
        close()
        onWatch()
      })
      body.querySelector('.how-news')?.addEventListener('click', () => {
        close()
        onNews?.()
      })
    },
  })
}
