import { voice } from '../voice'

/**
 * The three rules, as the club and "how it works" both show them: a small
 * mark over them, then the rules at reading size, numbered because they
 * are an order. The words are the author's and stay whole; only the part
 * every rule repeats ("the first rule of whale club is:") is quieter than
 * the rule itself.
 */
export function rulesHtml(): string {
  const rules = voice.rules
    .map((rule) => {
      const cut = rule.indexOf(': ')
      if (cut < 0) return `<li><span>${rule}</span></li>`
      return `<li><span><span class="rule-lead">${rule.slice(0, cut + 1)}</span> ${rule.slice(cut + 2)}</span></li>`
    })
    .join('')
  return `<section class="rules-block"><h3 class="eyebrow">${voice.labels.rules}</h3><ol class="rules">${rules}</ol></section>`
}
