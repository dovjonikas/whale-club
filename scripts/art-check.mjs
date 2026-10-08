// npm run art:check: which finds have a picture in public/art, which are
// missing one, which pictures are the wrong size, and which files match no
// find. Only a report; the app draws every find in code when it has no
// picture. docs/ART.md has the rules.
import sharp from 'sharp'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SIZE = 512
const dir = resolve('public/art')
// The ids, read from the catalogues: per-thing finds and the path finds.
const sources = [
  'src/scene/collectibles/sea.ts',
  'src/scene/collectibles/sky.ts',
  'src/scene/collectibles/garden.ts',
  'src/scene/legendary.ts',
]
const ids = new Set()
for (const file of sources) {
  const text = readFileSync(resolve(file), 'utf8')
  for (const match of text.matchAll(
    /'((?:sea|sky|garden)-[ab]-[a-z0-9-]+|legend-[a-z]+|rare-[a-z]+)'/g,
  ))
    ids.add(match[1])
}
const files = existsSync(dir) ? readdirSync(dir).filter((name) => /\.(webp|png)$/.test(name)) : []
const have = new Map(files.map((name) => [name.replace(/\.(webp|png)$/, ''), name]))
let wrong = 0
for (const [id, name] of have) {
  if (!ids.has(id)) {
    process.stdout.write(`no such find: ${name}\n`)
    continue
  }
  const meta = await sharp(resolve(dir, name)).metadata()
  if (meta.width !== SIZE || meta.height !== SIZE || !meta.hasAlpha) {
    wrong++
    process.stdout.write(
      `wrong: ${name} is ${String(meta.width)}x${String(meta.height)}${meta.hasAlpha ? '' : ', no transparency'} (wants ${String(SIZE)}x${String(SIZE)}, transparent)\n`,
    )
  }
}
const missing = [...ids].filter((id) => !have.has(id)).sort()
process.stdout.write(
  `${String(have.size)} of ${String(ids.size)} finds have a picture; ${String(missing.length)} drawn in code; ${String(wrong)} to fix.\n`,
)
if (missing.length > 0 && process.argv.includes('--missing'))
  process.stdout.write(missing.map((id) => `  ${id}\n`).join(''))
