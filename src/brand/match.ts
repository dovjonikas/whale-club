import { GLYPHS, LETTER } from './glyphs'

/**
 * A thing's glyph, picked from its name, in English or Lithuanian.
 *
 * The name is folded first: lower case, diacritics off (so "bėgimas" is
 * "begimas" and "šuo" is "suo"), anything that is not a letter or a digit
 * read as a space. Then every glyph's keywords are tried, and the strongest
 * hit wins:
 *
 * 1. a phrase of several words, whole ("walk the dog", "cold shower");
 * 2. a whole word ("violin", "run");
 * 3. a stem of four letters or more starting a word ("smuik" in
 *    "smuikas", "begi" in "begimas"); shorter keywords never match this
 *    way, so "su" ("with") cannot pass for a dog.
 *
 * A weak keyword (marked `~` in glyphs.ts) only qualifies another word
 * ("morning run", "groti smuiku"), so any strong hit beats every weak one.
 * Among hits of one kind the longer keyword wins (it says more: "plant"
 * beats "plan" in "plants", "spanish" beats "study"), then the glyph that
 * comes first. No hit at all is a monogram, the name's first letter.
 */
const STEM_MIN = 4
const PHRASE = 3
const WORD = 2
const STEM = 1
/** A strong hit of any kind ranks above every weak one. */
const STRONG = 3

/** Lower case, no diacritics, letters and digits only, single spaces. */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

interface Keyword {
  glyph: string
  text: string
  weak: boolean
  words: number
  order: number
}

const KEYWORDS: readonly Keyword[] = GLYPHS.flatMap((g, order) =>
  g.words.map((word) => {
    const weak = word.startsWith('~')
    const text = fold(weak ? word.slice(1) : word)
    return { glyph: g.id, text, weak, words: text.split(' ').length, order }
  }),
)

/** How strongly one keyword hits a folded name: 0 for no hit. */
function hit(keyword: Keyword, name: string, words: readonly string[]): number {
  if (keyword.words > 1) return ` ${name} `.includes(` ${keyword.text} `) ? PHRASE : 0
  if (words.includes(keyword.text)) return WORD
  if (keyword.text.length >= STEM_MIN && words.some((w) => w.startsWith(keyword.text))) return STEM
  return 0
}

/** The glyph id for a name, or LETTER when nothing fits. */
export function glyphFor(name: string): string {
  const folded = fold(name)
  if (!folded) return LETTER
  const words = folded.split(' ')
  let best: { kind: number; length: number; order: number; glyph: string } | null = null
  for (const keyword of KEYWORDS) {
    const tier = hit(keyword, folded, words)
    if (tier === 0) continue
    const kind = keyword.weak ? tier : tier + STRONG
    const better =
      !best ||
      kind > best.kind ||
      (kind === best.kind && keyword.text.length > best.length) ||
      (kind === best.kind && keyword.text.length === best.length && keyword.order < best.order)
    if (better)
      best = { kind, length: keyword.text.length, order: keyword.order, glyph: keyword.glyph }
  }
  return best?.glyph ?? LETTER
}
