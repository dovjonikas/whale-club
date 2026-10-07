// Makes the README screenshots light: every PNG in docs/screenshots becomes
// a WebP at most 300 KB, and the PNG is removed. Runs at the end of
// `npm run shots`. GitHub renders WebP in a README like any other image.
//
// The README shows a phone at 200 to 280 px wide, so 2x that is all a
// sharp screen needs: wider pictures are scaled down to MAX_WIDTH first.
// The quality steps down until the file fits; the film grain in the scene
// is what costs the most, and it survives at these settings.
import sharp from 'sharp'
import { readdirSync, statSync, unlinkSync } from 'node:fs'
import { join, resolve } from 'node:path'

const dir = resolve('docs/screenshots')
const MAX_BYTES = 300 * 1024
const MAX_WIDTH = 780
/** The desktop pictures are wide by nature; they keep more width. */
const MAX_WIDTH_WIDE = 1366
/** The banner spans the README's whole width, so it keeps the most, and may weigh a little more. */
const MAX_WIDTH_HERO = 1800
const MAX_BYTES_HERO = 450 * 1024

const pngs = readdirSync(dir).filter((name) => name.endsWith('.png'))
for (const name of pngs) {
  const from = join(dir, name)
  const to = from.replace(/\.png$/, '.webp')
  const meta = await sharp(from).metadata()
  const wide = (meta.width ?? 0) > (meta.height ?? 0)
  const hero = name.startsWith('hero')
  const cap = hero ? MAX_WIDTH_HERO : wide ? MAX_WIDTH_WIDE : MAX_WIDTH
  const width = Math.min(meta.width ?? MAX_WIDTH, cap)
  const limit = hero ? MAX_BYTES_HERO : MAX_BYTES
  let quality = 82
  for (;;) {
    await sharp(from).resize({ width }).webp({ quality, effort: 6 }).toFile(to)
    if (statSync(to).size <= limit || quality <= 40) break
    quality -= 6
  }
  unlinkSync(from)
  const kb = Math.round(statSync(to).size / 1024)
  process.stdout.write(
    `${name} -> ${name.replace(/\.png$/, '.webp')} ${String(kb)} KB (q${String(quality)})\n`,
  )
}
