# Whale Club - design plan

Written before the first line of code. Every colour and font in the app is
derived from this file; a value that is not here is a defect.

## The one-line brief

One screen, one scene, split by a horizon. Night sky above, dark sea below,
a narrow shore with a garden at the line between them. The things a person
does every day live in a row at the bottom, each as a creature with a face.
Nothing dies. The scene fills up because you showed up.

## Colours

| Token         | Hex                     | Used for                                                          |
| ------------- | ----------------------- | ----------------------------------------------------------------- |
| `--abyss`     | `#020409`               | The bottom of the sea, the page background                        |
| `--deep`      | `#06122B`               | The sea's body (gradient from `--deep` down to `--abyss`)         |
| `--night`     | `#0B1A3A`               | The sky just above the horizon                                    |
| `--zenith`    | `#03070F`               | The sky at the top                                                |
| `--glow`      | `#3EF2E0`               | Bioluminescent dots, bubbles, tap feedback in the sea, focus ring |
| `--teal`      | `#0FB5A8`               | Secondary sea light, creature bodies, the water line              |
| `--star`      | `#FFD98A`               | Stars, star dust, sky-world accents                               |
| `--star-pale` | `#FFF4D6`               | The brightest stars, the moon                                     |
| `--leaf`      | `#5FBF4A`               | Garden greens, the shore's grass                                  |
| `--sun`       | `#F2C94C`               | Sunflowers, petals, garden-world accents                          |
| `--sand`      | `#C9A86A`               | The shore strip                                                   |
| `--jacket`    | `#E63946`               | The red jacket. The only red in the app, used nowhere else        |
| `--ink`       | `#E8F0F5`               | Body text                                                         |
| `--ink-dim`   | `#7F93A6`               | Secondary text, locked silhouettes, the quiet-day line            |
| `--card`      | `rgba(6, 18, 43, 0.72)` | A thing's card over the water                                     |

Quiet day (a day with nothing done yet, or a missed day): the whole scene
gets a `filter: brightness(0.6)` on the scene root and the dots stop
pulsing. Nothing is removed. Done through one class on the root, animated
by opacity of an overlay rather than a filter on phones where filter is
expensive (`.scene-dim` overlay at `opacity: 0.4`).

## Type

| Role    | Face                                                  | Why                                                                                                    |
| ------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Display | **Fraunces**, weight 900, optical size 144, `WONK` on | Soft, heavy, a bit silly: a whale with a face, not a bank. Used only for the title and the three rules |
| Body    | **Atkinson Hyperlegible**                             | Clean, clearly not Inter, reads at 13px on a phone                                                     |

Both self-hosted as woff2 under `public/fonts/` (the app works offline, so
no Google Fonts request at runtime). Sizes: `--t-xs` 12px (week dots'
labels, captions), `--t-sm` 14px (cards, lines), `--t-md` 17px (sheets),
`--t-lg` 24px (a rule), `--t-xl` 40px (the title). Four sizes on any one
screen at most.

## Layout (iPhone 390x844, portrait)

```
+------------------------------------------+
| whale club                   [♪] [☆] [≡] |  <- title in Fraunces, three quiet buttons
|  .   *        .      *    .        .     |
|      .    *      .     *       .   *     |  SKY: one star per day done,
|  *      .    .      *       .     .      |  constellations drawn on streaks
|          .      (  moon  )        *      |
|~~~~~~~~~ garden on the shore ~~~~~~~~~~~ |  <- horizon ~58% down, sand strip,
| ·   ·     ·       ·    ·      ·     ·    |     sunflowers and the scarecrow
|      ~ (fish)      ~      ~      (jelly) |  SEA: creatures swim here, bubbles,
|  ·        ·     ~~~~   ·      ·      ·   |  bioluminescent dots drift
|                                          |
|  "one short line lives here"             |  <- the voice line, one row, fades
| +--------+ +--------+ +--------+  (+)    |
| |  (o o) | |   *    | |  🌱    |         |  <- the row: up to 5 cards, h-scroll
| |  run   | |  read  | |practice|         |     creature, name, mode glyph
| | ●●●○○○○| | ●●●●○○○| | ●○○○○○○|         |     7 week dots (last 7 days)
| +--------+ +--------+ +--------+         |
+------------------------------------------+   safe-area-inset-bottom padded
```

Desktop (1366 and wider): the same scene fills the window; the row centres
and its cards grow to 160px wide. No sidebar, no second column. The scene
is the app.

Tap a card: the creature jumps (transform), the world's particles burst
(bubbles / star dust / petals, canvas), the line changes. Second tap undoes.
Long press (500ms): the timer sheet (15 / 30 / 60 / custom).

Sheets (add a thing, timer, collection, rules, buddy) slide up from the
bottom, `role="dialog"`, scrim over the scene, never a second page.

## Motion

Only `transform` and `opacity`. Particles on one `<canvas>` at
`devicePixelRatio` capped at 2, paused when the tab is hidden, at most 80
live particles, 30fps for ambient drift, 60fps only during a burst. Three
parallax layers (far stars, near stars + moon, water line) move by at most
6px on device tilt or pointer, via `transform: translate3d`. Under
`prefers-reduced-motion` every ambient loop stops and bursts become a single
fade.

## The signature moment

**The whale surfaces.** When every thing is done for the day, the water
line lifts, the sea goes brighter for two seconds, and a whale rises across
the horizon with the day's star appearing above it. Everything else in the
app is quiet so that this one moment is loud. From day 90 the whale wears
the red jacket, the only red pixel in the whole scene.

The second signature, the one that makes the share PNG: the sky is the
calendar. A month of showing up is a sky full of stars, and a person reads
their own consistency without a single number.

## What this is not

Not the warm-cream-and-serif template, not the black-and-acid-green
template. Bioluminescence is the light source, warm stars the counterpoint,
one red accent earned, not given. Cards are the only rectangles on screen.

## v0.7 pass: depth and charm (2026-10-07)

The brief was "draw beautiful things" in the spirit of an earlier page of
the author's: soft illustration with warmth, never glossy. Only the
technique carries over; every drawing here is new.

- **Grain.** A fine film grain over the whole scene, rendered once into a
  tile, so the night reads like paper, not like a screen. Static.
- **The water line.** A thin bright wave along the horizon, drifting
  sideways very slowly, with moonlight glints.
- **Under the water.** Faint slanted moonlight shafts that sway; a
  moonlit caustic net in the top band of the sea, generated once and
  drifting; far down, the silhouettes of two big whales passing very slowly.
  On a tall screen, kelp at the bottom, swaying.
- **Creatures.** Redrawn with soft shading (lighter top, darker belly),
  rim light, blush on the cheeks, eyes with catchlights, and at the last
  stage a small thing of their own (the whale's spout, the star's twinkle,
  the sunflower's bee). Gradient ids are unique per drawing.
- **The whale surfacing.** Shaded, blushing, a ring of water where it
  breaks the surface, droplets from the spout.
- **Cards.** Glass with a lit top edge; the creature on a soft pool of its
  world's light; done fills the bottom edge with the world's colour and
  puts a small glowing check in the corner; a tap squashes and pops.
- **Bursts.** Bubbles with a glint, four-point sparkles in the sky, two-tone
  petals in the garden.
- **Collectibles.** All sixty redrawn in the same hand (shading, a face
  where it fits, a soft rim). The sea's finds sit in the band just under
  the surface, so nothing of the sea lies on the sand.
- **A stone on a card.** A small shaded pebble with a warm glow that rocks
  very slightly, instead of a ring.
- **The empty first screen.** A small whale asleep at the water line,
  breathing out tiny bubbles, under the first sentence.

Motion stays transform and opacity; nothing new runs a loop of its own.
