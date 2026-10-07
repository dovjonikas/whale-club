# Quality

How the interface was checked against the craft it claims, and what changed
because of it. Each pass names its source. Findings point at `file:line` as
the code stood when the pass ran.

## Motion (0.12.0, emil-design-eng)

The rules applied: strong custom curves (`--ease-out`, `--ease-in-out`,
`--ease-drawer` in `src/styles/tokens.css`), never ease-in for anything that
answers a person, nothing grows out of nothing, every pressable gives under a
finger, hover only on real pointers, sheets on the iOS sheet curve leaving
faster than they came, and drag that follows the finger, can be caught
mid-flight and closes on a flick.

| Before                                                                                                    | After                                                                                                                                                                                | Why                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sheet `transition: transform var(--dur) var(--ease)` (260 ms, both ways)                                  | Up in `--dur-sheet-in` 480 ms, down in `--dur-sheet-out` 300 ms, both on `--ease-drawer`                                                                                             | A sheet is a drawer: the iOS curve settles it without a bounce, and leaving faster than arriving keeps closing out of the way                                                                            |
| No way to pull a sheet down                                                                               | A grabber strip along the top: follows the finger, closes past 30 % of the height or on a flick over 0.11 px/ms, springs back otherwise, gives with a square-root drag above the top | A quick flick should be enough, and hitting an invisible wall feels broken; the close button stays the visible way out                                                                                   |
| Grabbing a sheet while it still moved jumped it to the finger's start                                     | The pull starts from the sheet's live position (`getComputedStyle(...).transform`)                                                                                                   | Interruptible: caught mid-flight it is held where it is, not where it was going                                                                                                                          |
| Scrim `transition: opacity var(--dur)`                                                                    | Scrim on the same in and out durations as the sheet                                                                                                                                  | The two move as one thing                                                                                                                                                                                |
| Chips, quiet buttons, menu rows, log cells, "edit", "+", the next find, the offer, "skip": no press state | One shared rule: `scale: var(--press-scale)` (0.97) on `:active`, `--dur-press` 140 ms on `--ease-out`                                                                               | Every pressable must answer a press, inside both sources' windows (80 to 150 ms and 100 to 160 ms); the individual `scale` property composes with transforms some of them already use for their entrance |
| `.icon-button:hover`, `.card-add:hover`, `.card-edit:hover`, `.button-quiet:hover` always on              | Inside `@media (hover: hover) and (pointer: fine)`                                                                                                                                   | On a phone a tap leaves hover stuck on                                                                                                                                                                   |
| `@keyframes unlock` and `unlock-garden` from `scale(0)`                                                   | From `scale(0.5)` with opacity 0                                                                                                                                                     | Nothing appears from nothing; a find still pops, from a visible seed                                                                                                                                     |
| `.intro-star` from `scale(0.2)`                                                                           | From `scale(0.6)` with opacity 0                                                                                                                                                     | Same rule, and the star now blooms with a ring instead of growing from a dot                                                                                                                             |
| Only `--ease` and `--ease-bounce`                                                                         | Adds `--ease-out`, `--ease-in-out`, `--ease-drawer`                                                                                                                                  | The built-in curves are too weak to read as intentional                                                                                                                                                  |

Kept on purpose:

| Kept                                                                                       | Why                                                                                                            |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `scene-flash` from `scale(0.2)` (`src/styles/scene.css`)                                   | It is light, not an object: a burst growing from a point and fading is what light does                         |
| `found-garden` from `scale(0.2)` (`src/styles/stones.css`)                                 | The find comes out of a cracked stone, so it has somewhere to come from                                        |
| `sleeper-bubble` on `ease-in` (`src/styles/scene.css`)                                     | Ambient, not an answer to anyone: a bubble leaving the whale gathers speed as it rises                         |
| The global reduced-motion rule (`src/styles/base.css`) cutting every duration to near zero | Stronger than fading: under reduced motion nothing moves and nothing lingers, and every state is still reached |

## The new motion of 0.12, against the review-animations standards

Checked by hand against the skill's ten standards and its STANDARDS.md
(the skill itself only runs when the author starts it). Frequency first:
a thing is done a few times a day, so its moment may delight; a press
happens all the time, so it only gives.

| Before                                                                                     | After                                                                                                              | Why                                                                                                                                                  |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Done: a ring's dash filled (`stroke-dashoffset`, not on the GPU)                           | The bubble's colour swells in from `scale(0.6)` with opacity, 200 to 240 ms on `--ease-out`; emptying takes 140 ms | Transform and opacity only, starts from a visible seed, a deliberate done slower than its undo, and a transition, so a quick second tap retargets it |
| Glyph colour changed by the fill                                                           | Two inks crossfading, 160 ms, the dark one 60 ms late                                                              | No colour transition; the late start hides the moment both inks show                                                                                 |
| None                                                                                       | The signature pops into three drops within 300 ms, the drops 30 ms apart                                           | Rare enough to delight; keyframes are fine for a one-shot that is not retriggered mid-flight, and the fill under it stays interruptible              |
| Reduced motion cut everything to nothing                                                   | Under reduced motion the bubble fades its colour in (200 ms opacity) and nothing swells or pops                    | Gentler, not zero: the state change is still seen                                                                                                    |
| The whale's `forwards` keyframes jumped to their invisible last frame under reduced motion | Under reduced motion it fades in where it would surface, stays, and fades (`surface-still`)                        | The day's reward was never seen by people who asked for less motion                                                                                  |
| Session ring: `stroke-dashoffset` transition every tick under a drop shadow                | Set once a second, no transition                                                                                   | It moved a fraction of a percent each second; the transition only repainted                                                                          |
| `begin` bubble on the intro's first screen                                                 | Breathes and lets its signature rise, loops, on that one screen only                                               | Decorative, seen once; the global reduced-motion rule stops both loops                                                                               |

Left as they are, for 0.17: `.card` transitions `border-color` and
`box-shadow` when it is done (`src/styles/row.css:29`) and `card-pulse`
animates `box-shadow` (`row.css:529`): a repaint of one card a few times
a day, best moved to a glow layer that only fades.

## Interface audit (0.12.0, web-design-guidelines)

The Web Interface Guidelines (vercel-labs, fetched fresh) applied to every
file of the interface by three read-only reviewers in parallel: the HTML
and styles, and the app's markup in two halves with the brand modules and
the copy. Line numbers are as the files stood at the audit.

### Fixed now

| Finding                                                                                                                                                                                                                       | Fix                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `src/app/logSheet.ts:105` and `src/app/row.ts:204-205`: a thing's typed name went into an `aria-label` unescaped; a 24-letter name could close the attribute and run script when the log opened                               | Escaped, like every other name; every interpolated attribute was checked, the rest carry only the app's own words      |
| `src/brand/bubble.ts:91`: a monogram went into SVG text unescaped (harmless in the page, broken when painted as an image)                                                                                                     | Escaped, and the accessible label with it                                                                              |
| `src/app/card.ts:87`: `aria-label` hid the card's week, length and stones from screen readers                                                                                                                                 | The name stays the name; the rest is its description (`aria-describedby`)                                              |
| `src/app/toast.ts:8`: toasts, the share error among them, were never announced; the undo's `role=status` was set on text already there                                                                                        | One polite live region that is always there, for every toast and undo                                                  |
| `src/app/app.ts:71`: notices and the postcard offer came and went unannounced                                                                                                                                                 | Both slots are polite live regions                                                                                     |
| `src/app/sessionScreen.ts:146` and `:186`, `src/app/lockIn.ts:139` and `:171`: the session screen never took the focus or gave it back; the pause, undo and stop buttons dropped it when they hid                             | A real modal: focus in on open, back to the card on close, handed on when a button goes                                |
| `src/app/sheet.ts:141`: the first input took the focus on open, popping a phone's keyboard over the sheet; a disabled button (the log's first month) or nothing at all (the collection) got it; the dial's slider was skipped | On a fine pointer the first usable control, the slider included; on a phone, and when there is none, the sheet's title |
| `src/app/sheet.ts:121`: focus went back to an opener that might be gone                                                                                                                                                       | Back to the opener if it is there, else to the row                                                                     |
| `src/app/row.ts:210`, `src/app/checkin.ts:22`, `src/app/app.ts:160`, `src/app/intro.ts:563` and `:600`: redraws, a delete and the intro's end dropped the focus to the page                                                   | The new control, the undo, or the row takes it                                                                         |
| `src/app/addSheet.ts:91`: an empty name only put the focus back                                                                                                                                                               | "give it a name first." under the field, `aria-invalid` on it                                                          |
| `src/styles/tokens.css:18`: inputs and chips were told from the sheet only by an edge at 1.6:1                                                                                                                                | Their own edge token at 3:1 (`--control-edge`)                                                                         |
| `src/styles/sheet.css:23`: a sheet's scroll ran on into the page                                                                                                                                                              | `overscroll-behavior: contain`                                                                                         |
| `src/styles/base.css:42`: fields inherited `user-select: none`                                                                                                                                                                | Fields can be selected                                                                                                 |
| `src/styles/row.css:447`, `:549`, `:574`, `src/styles/scene.css:129`, `src/styles/sheet.css:239`, `:753`: delete, edit, the next find, a day's star, the leaf's button and undo were 28 to 40 px                              | 44 px targets, by size or by a target around the drawing                                                               |
| `src/styles/sheet.css:594`, `src/styles/log.css:137`, `src/styles/row.css:72`: counts and tags at 8 to 10 px                                                                                                                  | 11 px, a token for exactly these                                                                                       |
| `src/styles/lab.css:86`: the version line at about 2.8:1                                                                                                                                                                      | Full `--ink-dim`                                                                                                       |
| `src/styles/row.css:44`: a pinch that started on a card did not zoom                                                                                                                                                          | `pan-y pinch-zoom`                                                                                                     |
| `src/app/postcard.ts:225`: a long name ran into its neighbour on the postcard                                                                                                                                                 | Cut to its column with an ellipsis                                                                                     |

### Left for polish (0.17), or for the author

- Copy is the author's and existing lines are not touched (the project's
  rule), so these wait for them: `src/voice.ts:35` the share error has no
  next step; straight apostrophes at `:103` and `:146`; non-breaking
  spaces in "20 min", "6 h 40 min", "10 push-ups" (`:13`, `:73`, `:279`);
  "Install" and "Add a thing" break the lowercase voice (`:60`, `:110`);
  hardcoded copy outside voice.ts in `src/app/card.ts:165`,
  `src/app/checkin.ts:20`, `src/app/header.ts:20`, `src/app/app.ts:77`,
  `src/app/collectionSheet.ts:21` and `:53-72`, `src/app/menuSheet.ts:34`,
  `src/app/recap.ts:45` and `:53`.
- The always-moving scene (`src/styles/depths.css:23`, `src/styles/sky.css:16`)
  has no pause of its own; only the system's reduced-motion stops it.
  Planned for 0.16's settings, as a still sea.
- `src/app/toast.ts:55`, `:19`: the undo and the toast do not pause while
  focused or hovered.
- `src/app/postcards.ts:99`: no "making the postcard…" while it paints;
  `:166` the preview image has no size until it loads.
- `src/app/logSheet.ts:56`: paging months moves the focus to the title
  rather than keeping it on the arrow pressed; `:146`, `:242`, `:246`
  date formatters are made per call (cache `Intl.DateTimeFormat`).
- `src/app/dial.ts:79`: the dial reads its box on every move (cache it on
  press); `:97` a trackpad's inertia sweeps the length (accumulate the
  wheel).
- `src/app/kindField.ts:79`: the line under each kind is not its
  description; `:28` and `src/app/daysField.ts:16` use fixed ids.
- `src/app/iconField.ts:95`: picking the extra chip redraws it under the
  finger; `:106` a picture that changes with the name is not announced.
- `src/app/intro.ts:221`: no Escape to skip; `:253` the live line never
  changes.
- `src/app/collectionSheet.ts:60`: a locked tile's accessible name gives
  the find away.
- `src/app/menuSheet.ts:42`: the two formats would be a radio group.
- `src/app/sessionScreen.ts:122`, `src/app/opening.ts:40`: showing the time
  and skipping the opening are pointer only.
- Hover states on the touch-first controls (`src/styles/sheet.css:121`),
  `text-wrap: balance` on display headings (`sheet.css:70`, `:383`,
  `brand-page.css:20`), `tabular-nums` on counts (`sheet.css:263`, `:308`),
  safe-area insets in the intro and session (`intro.css:13`,
  `session.css:99`), `.collection-title` overflow at 320 px
  (`sheet.css:286`), future days in the log at 1.6:1 (`log.css:84`), and
  a font preload in `index.html:17`.
