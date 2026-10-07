# Whale Club: the brand

The brief (the author, 2026-10-07): things wear plain system emoji, which
look different on every phone and say nothing about Whale Club. The app
needs a sign language of its own, so that one card is enough to know it is
Whale Club, and the whole interface lifted to a professional finish.

This is the plan written before drawing (the frontend-design skill's first
pass), then its critique against the brief, then what changed.

## Subject, audience, job

- **Subject:** a night sea seen from a shore, kept by a person who does a
  few small things each day. Its materials are water, glass floats,
  lanterns, starlight, sand, paper boats.
- **Audience:** a tired person at the end of a day, on a phone, one hand,
  five seconds.
- **The interface's single job:** show what is left today and take the tap.

## Plan (first pass)

### Colour, as tokens

The scene's palette stays (it is the app). The brand adds the colours of
the things and one cream for every line.

| token           | hex       | role                                                       |
| --------------- | --------- | ---------------------------------------------------------- |
| `--abyss`       | `#020409` | the frame, the deepest water                               |
| `--deep`        | `#06122b` | cards, sheets, the inside of an empty bubble               |
| `--cream`       | `#fff4d6` | every glyph and UI line; the one colour for drawing        |
| `--ink`         | `#e8f0f5` | body text                                                  |
| `--ink-dim`     | `#7f93a6` | secondary text: 5.9:1 on `--deep`, 5.4:1 on `--night`      |
| `--glow`        | `#3ef2e0` | the sea's light: focus, the primary action                 |
| `--lantern-1…5` | see below | a thing's colour, the same in its bubble, lanterns and log |
| `--danger`      | `#ff7a72` | delete, on dark; `#d9423c` as a fill with white text       |

The five lantern colours, one per place in the row, chosen to sit on the
night without fighting it and to stay apart for colour-blind eyes by
lightness as well as hue:

| token         | hex       | name      |
| ------------- | --------- | --------- |
| `--lantern-1` | `#ffd98a` | amber     |
| `--lantern-2` | `#ff9fb2` | rose      |
| `--lantern-3` | `#8ef0e4` | sea glass |
| `--lantern-4` | `#c8b6ff` | lilac     |
| `--lantern-5` | `#ffb27a` | peach     |

### Type

- **Display:** Fraunces (variable, soft and wonky axes on): the title, the
  sheet titles, the rules, the intro's sentence. Used with restraint: never
  for a label, never below 17 px.
- **Body and UI:** Atkinson Hyperlegible, 400 and 700: everything a person
  reads to act. Chosen for legibility at small sizes on a dark ground.
- **Numbers:** Atkinson with `tabular-nums` (minutes, "12/25", day counts);
  no third face.
- **Scale (px):** 12, 14, 17, 24, 40 (tokens `--t-xs` to `--t-xl`); sheets
  in `rem` so the system text size carries.

### The mark: the bubble

Every thing is a bubble: a round glass float of its colour.

```
        o   <- the signature: one tiny bubble, rising from the top right
     .-"""-.
   /  ,--.   \   <- a light arc, top left, where the glass catches the moon
  |  ( ✎  )   |  <- a cream line glyph, centred, 55% of the diameter
   \         /
     '-...-'     <- the rim: its colour; for a lock-in, its timer ring
```

- **Empty:** the inside is `--deep` tinted 22% with the thing's colour; a
  1.5 px rim of the colour; the glyph cream.
- **Done:** filled with the colour; the glyph turns dark (`#0a1630`); the
  signature bubble rises and pops into three smaller ones (under 300 ms).
  Reduced motion: it only fills. This is "done. bubbles." as motion.
- **Lock-in:** the rim is the timer ring: a faint full ring and the part
  seen today drawn over it in the colour ("12/25"); it fills during a
  session.
- **Monogram:** when no glyph fits a name, its first letter in Atkinson 700,
  cream, the same size as a glyph: a monogram, not an error.
- **The signature** (one tiny bubble rising off the top right of the rim)
  is on every bubble, the app icon and the favicon. It is how a Whale Club
  thing is recognised at a glance.

### Glyph rules

- A 24 grid with a 2 px safe margin; strokes 1.75; round caps and joins;
  corners at least 1.5 radius (softer than geometric icon sets); no fills
  except dots of 1.25 radius or more.
- One colour: cream. Never two weights in one glyph.
- Readable at 20 px: one idea per glyph, at most about seven strokes.
- Drawn by hand as SVG paths in one sprite (`src/brand/glyphs.ts`); an icon
  library is a reference for what reads, never a source.
- The UI's own icons in the same hand: add, edit, close, arrows, menu,
  settings, share, lock in, star, lantern, krill, stone, hand, undo, sound.

### The app icon

A whale's tail, in the glyph line, inside a bubble with the signature, on
the deep. The same drawing at 16 px (the favicon) and 1024 px (the store
size); the maskable icon keeps the bubble inside the safe circle.

## Critique against the brief

- **Generic?** A coloured circle with a white line icon is how half the
  habit apps draw a habit. What keeps ours from that default is the glass
  (a lit arc, a tinted inside, the rim as the timer) and, above all, the
  signature bubble: without it the plan was a template. Kept, and made the
  one thing the brand is remembered by.
- **Too much?** A first draft had a second, smaller signature bubble and a
  wave line under the glyph. Both went: one accessory removed, and a
  second bubble at 20 px became noise.
- **Colour:** the first draft used the world colours (sea teal, sky gold,
  garden yellow) for bubbles. Two things in one world would then share a
  colour, and the log could not tell them apart. Changed to one colour per
  place in the row, the lanterns' colours, so a thing has one colour
  everywhere: its bubble, its lanterns and its dots in the log.
- **Contrast:** the glyph on an empty bubble is cream on a dark tint (well
  over 3:1); on a done bubble it is dark on the colour (also over 3:1 for
  all five). A test holds this.
- **Type:** Fraunces and Atkinson are already the app's voice; replacing
  them would cost the familiarity of the earlier versions for nothing the
  brief asks. Kept, with stricter rules on where the display face is used.
- **Measured, not assumed:** `--ink-dim` is 5.9:1 on `--deep`, so it stays;
  a done glyph (`#0a1630`) is between 9.3:1 (rose) and 13.4:1 (sea glass)
  on the five colours.
