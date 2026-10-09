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

## Motion review (review-animations, run by the author, 2026-10-08)

Every motion in the bubble, the intro, the sheets, the session and its
opening, the stone and its find, the presses and the toasts, against the
skill's ten standards. Line numbers as the files stood at the review.

| Before                                                                                                                                                                                                                                                            | After                                                                                                                                                      | Why                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/styles/base.css:309-317` reduced motion cut every transition and animation to 0.01 ms                                                                                                                                                                        | Movement stops, fades stay: `transition-property: opacity !important` instead of a zero duration; keyframes still land on their end                        | Gentler, not zero: a sheet, a toast, a card leaving should still fade, not blink      |
| `src/styles/sheet.css:30-46` the sheet slides under reduced motion as well (then instantly, by the rule above)                                                                                                                                                    | Under reduced motion it stays in place and fades, 200 ms                                                                                                   | Keep opacity, drop movement                                                           |
| `src/styles/sheet.css:190-196` toast in and out alike, 260 ms on `--ease`                                                                                                                                                                                         | In 260 ms, out 180 ms, both `--ease-out`; under reduced motion a fade                                                                                      | A system response leaves faster than it came; no slide without motion                 |
| `src/styles/sheet.css:745-751` undo toast the same                                                                                                                                                                                                                | The same fix                                                                                                                                               | Same reason                                                                           |
| `src/styles/session.css:114-124` and `src/app/sessionScreen.ts` close: the deep water goes down in 0.9 s but the screen is removed at 700 ms, cut mid-slide; the buttons and the creature stay until they vanish                                                  | Stopping goes down in 600 ms on `--ease-drawer`, everything else on the screen fades out in 200 ms first, and the screen is removed when the water is down | A stop is a request to leave: faster than the entrance, and nothing cut off in flight |
| `src/styles/row.css:29-31` and `:85-90` a done card transitions `border-color` and a 28 px `box-shadow`                                                                                                                                                           | The glow is its own layer (`.card::after`) that only fades, `--dur` on `--ease-out`                                                                        | Paint-heavy properties off the animated path; a done tap happens many times a week    |
| `src/styles/base.css:167` icon buttons pressed to `scale(0.92)` on `--dur-fast` / `--ease`; `src/styles/row.css:45-49`, `:471`, `src/styles/sheet.css:151-155`, `:666-673`, `:711`, `src/styles/session.css:389-395` the other presses on `--dur-fast` / `--ease` | Every press `scale(var(--press-scale))` (0.97) on `--dur-press` (140 ms) and `--ease-out`                                                                  | One feel for every press, inside the 0.95 to 0.98 band; 0.92 read as a squash         |

Approved as they are:

- The bubble's fill (`src/styles/bubble.css:19-34`): 200 to 240 ms in, 140 ms
  out, `--ease-out`, from `scale(0.6)` with opacity, a transition so a
  quick second tap retargets it; under reduced motion a 200 ms fade.
- The signature's pop (`bubble.css:75-110`): 300 ms, drops 30 ms apart,
  a one-shot keyframe on a state change that cannot fire mid-flight; off
  under reduced motion.
- The lock-in ring (`bubble.css`, `src/styles/session.css:335-342`): set,
  not animated; it moves once a second at most.
- Sheets (`sheet.css:1-46`): in 480 ms, out 300 ms on the drawer curve,
  dragged by the finger with velocity, damping and capture.
- The intro (`src/styles/intro.css`): explanatory, seen once, so longer
  than UI; words on `--ease-out` with a reading rhythm; lids on
  `--ease-in-out` (moving on screen); every loop stops under reduced
  motion.
- The opening (`session.css:398-436`, `src/app/lockIn.ts:33-37`): a
  ceremony after a finished lock-in, skipped by a tap.
- The stone (`src/styles/stones.css`): the fall's ease-in is gravity, not
  a response to a person; shake 260 ms; the find comes out of the stone.

Can wait for the polish stage:

- `src/styles/row.css:543` the first card's hint pulses a `box-shadow`:
  move it to the glow layer and pulse its opacity.
- `src/styles/stones.css:123` the crack draws by `stroke-dashoffset`: a
  `clip-path` reveal would stay on the GPU.
- `src/styles/row.css:209` dots, and `src/styles/sheet.css:131`, `:626`,
  `:666`, `:853` chips transition `background` and `border-color`: snap
  them, or keep the colour change but only there.
- `src/styles/intro.css:162-175` "start light" fades in over 900 ms: 500 ms
  would hand it over sooner.
- `src/styles/stones.css:354` under reduced motion a find appears at once:
  a 300 ms fade would be gentler.
- `src/styles/session.css:115` the water rises over 0.9 s: try 700 ms with
  fresh eyes.

## 1.2 motion, checked against the same standard before it shipped

| Motion                                       | Values                                                                                                                                                            | Reduced motion                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| A soft day's rain (`safe.css` `.scene-rain`) | eighteen thin drops falling 150 px over 1.3 to 2.2 s, linear (constant motion), six rings on the water, 2.6 s on `--ease-out`; ambient, `transform` and `opacity` | no drops, no rings; the warm light stays                     |
| The warm light, the late dimming             | an overlay's `opacity`, `--dur-slow`                                                                                                                              | the same: a fade                                             |
| A pet (`.pet.is-petted`)                     | comes 35 % closer and back in 1 s on `--ease-out`, three bubbles rising 26 px over 1 s, 120 ms apart; a blink of 260 ms through the Web Animations API            | the blink only, which the stylesheet's rule cannot cut short |
| A creature woken                             | the card's own wave, 900 ms                                                                                                                                       | the blink, eyes open                                         |
| A creature at rest                           | sea 8 s, sky 6 s, a few px, alternate                                                                                                                             | still                                                        |
| The bottle                                   | its drawing bobs 3 px, 3.6 s; the button stays still, so a finger finds it                                                                                        | still                                                        |
| Good night                                   | the quiet screen fades in over `--dur-slow`                                                                                                                       | a fade                                                       |

## 0.13 motion, checked against the same standard before it shipped

Every new motion, its values, and what reduced motion does with it.

| Motion                                                                            | Values                                                                                                                                                               | Reduced motion                              |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| A press on the krill chip, a dock tile, a wearer card, the pier, the tray buttons | `scale(0.97)`, 140 ms, `--ease-out`, one shared press                                                                                                                | the press still shows, without a transition |
| "+10" by the krill (`dock.css` `.krill-rise`)                                     | transitions, not keyframes, so a second one can catch the first: up 14 px over 700 ms on `--ease-out`, faded out over 400 ms; waits for a session screen to go first | fades only                                  |
| A thing settling into a place (`.collectible.is-snapping`)                        | FLIP from where it was to its place, `transform` only, 220 ms `--ease-out`; interruptible                                                                            | lands at once                               |
| A drag                                                                            | follows the finger by `transform` on the wrapper, `scale(1.08)` held, no transition while held                                                                       | the same: a drag is the person's own motion |
| The ring under a drag (`.is-target`)                                              | `scale(1.14)`, 140 ms                                                                                                                                                | no scale                                    |
| New places after an extension (`.is-new`)                                         | three breaths, 1.4 s each: rare, once per purchase                                                                                                                   | none                                        |
| The scene while arranging                                                         | every CSS animation paused, the ticker held                                                                                                                          | (already still)                             |
| The small whale, aurora nights, the glowing tide                                  | ambient, 24 to 38 s, `transform` and `opacity` only                                                                                                                  | still                                       |
| Friday's falling stars                                                            | a 9 s cycle per streak, three staggered by 3 s; `transform` and `opacity`                                                                                            | not shown                                   |
| The sky whale                                                                     | once a night, 70 s across, linear (constant motion)                                                                                                                  | rests in place for a few seconds, then goes |

Why some run longer than 300 ms: none of them answers a tap. The rise is a
notice beside the number, the scene things are weather, and the snap, the
one answer to a person, is 220 ms.

## Polish (0.17.0)

The brief's checklist, item by item: what was done and how it was checked.
The "left for polish" lists above are answered here.

| Item                                                                    | Status                                                                                                                                                                                                      | How verified                                                                |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| iOS startup images                                                      | Eleven iPhone sizes from `npm run splash`, the night colour and the mark, 31 KB each; linked by media query; not precached                                                                                  | `dist/index.html` holds the eleven links; `dist/sw.js` names no splash file |
| Manifest id                                                             | `/whale-club/`                                                                                                                                                                                              | `dist/manifest.webmanifest`                                                 |
| Font preload                                                            | The body at 400 and 700 and the display face, read from the bundle at build time                                                                                                                            | three `rel="preload"` links in `dist/index.html`                            |
| Type in rem                                                             | Reading sizes in rem; shape-sized numbers (wordmark, icon, dial) stay px; the root keeps the browser's size                                                                                                 | every test on three devices (the sizes are equal at the default 16 px)      |
| Antialiased text, balanced headings, tabular figures                    | `base.css`; `text-wrap: balance` on every display line that can wrap, `pretty` on notes; `tabular-nums` on every count                                                                                      | the stylesheets; the shots                                                  |
| Press states                                                            | Down at once, back over 180 ms (`--dur-press`); children keep their own timing                                                                                                                              | `button:active` in `base.css`; the tap, lock-in and editing tests           |
| Toast and undo pause                                                    | Not under a resting pointer, keyboard focus or a hidden page; focus handed over after a tap does not hold it                                                                                                | `tests/e2e/editing.e2e.ts` "undo counts only readable time", three devices  |
| "making the postcard…"                                                  | Said if the picture is not ready 150 ms after the tap; the line comes back after                                                                                                                            | `tests/e2e/postcards.e2e.ts` still sends both sizes                         |
| Preview image size                                                      | `width` and `height` from the format, `height: auto`                                                                                                                                                        | no jump when the share sheet is refused                                     |
| View transitions in the log and the dock                                | The sheet alone crossfades and eases to its height, 220 ms; none under reduced motion or without the API                                                                                                    | the log and dock tests on three devices                                     |
| Hint pulse on the first card                                            | The glow layer's opacity, not a `box-shadow`                                                                                                                                                                | `row.css`                                                                   |
| "start light" 900 → 500 ms, the water 0.9 → 0.7 s                       | `--dur-start`, `--dur-session-in`                                                                                                                                                                           | the intro and lock-in tests                                                 |
| A find under reduced motion                                             | Fades in over 300 ms through the Web Animations API (the stylesheet's rule cuts CSS animations short)                                                                                                       | `scene.ts` `arrive`                                                         |
| Log paging focus, cached formatters                                     | Focus stays on the arrow pressed (or the title at an end); three `Intl.DateTimeFormat`s made once                                                                                                           | the log tests                                                               |
| Dial                                                                    | Its box read once per press; wheel and trackpad deltas gathered, 60 px to a stop                                                                                                                            | the lock-in dial tests                                                      |
| Escape skips the intro; keyboard for the session's time and the opening | Escape is "skip"; Space or Enter on the screen shows the time; Escape, Space or Enter lands the opening                                                                                                     | `intro.ts`, `sessionScreen.ts`, `lockIn.ts`                                 |
| A locked find's name                                                    | "a find still to come, day N"                                                                                                                                                                               | `collectionSheet.ts`                                                        |
| Field ids, the kind's description, the icon picker                      | Ids per field; the kind's line is its `aria-describedby`; the preview is a named image; the extra chip stays under the finger                                                                               | `kindField.ts`, `daysField.ts`, `iconField.ts`; the add and edit tests      |
| Safe areas in the intro and the session                                 | Every edge, either orientation                                                                                                                                                                              | `intro.css`, `session.css`                                                  |
| Future days in the log                                                  | 1.6:1 → 3:1                                                                                                                                                                                                 | `tests/e2e/contrast.e2e.ts`                                                 |
| Collection title at 320 px                                              | The name wraps in its own column; the count keeps its place                                                                                                                                                 | `sheet.css`                                                                 |
| Contrast                                                                | Fourteen pairs that carry words, from the tokens: 4.5:1 for reading, 3:1 for a day to come                                                                                                                  | `tests/e2e/contrast.e2e.ts`                                                 |
| 60 fps with 400 lanterns                                                | 595 lanterns: the main thread about 5 ms a frame; frames one or two vsync steps in headless Chromium, which composites in software. CPU slowed ×4: the main thread 27 to 32 ms a frame, frames at two steps | `tests/e2e/perf.e2e.ts`: main-thread time held, frame gaps recorded         |
| The first visit's long tasks                                            | The intro's first focus after the first frame (startup script 354 → 210 ms at ×4); the score warmed in a task of its own                                                                                    | `long-animation-frame` entries at CPU ×4                                    |
| Parallax                                                                | No style write while it is settled                                                                                                                                                                          | `parallax.ts`                                                               |
| Scene textures                                                          | Kept as PNG. WebP (Lighthouse's "modern image formats") shipped in 0.17.0; measured against PNG, interleaved, three rounds each, it made no difference to the frames, so 1.0 keeps one format everywhere    | `tests/e2e/perf.e2e.ts`, PNG and WebP builds interleaved                    |
| Left as they are                                                        | Chip and dot colour changes; the crack's `stroke-dashoffset` (docs/DECISIONS.md)                                                                                                                            |                                                                             |
| Still the author's                                                      | Copy outside `voice.ts`, "Install" and "Add a thing", the non-breaking spaces: the words are theirs                                                                                                         |                                                                             |

Lighthouse 12.8.2 through Edge, on the live site before this release
(v0.16.0): mobile performance 73 (FCP 2.5 s, LCP 2.5 s, TBT 880 ms, CLS
0); accessibility, best practices and SEO 100; desktop 100 in all four.
On the 0.17 build served locally: mobile performance 86 (TBT 340 ms).

After the release, on the live site (v0.17.0), median of three runs:
mobile performance 85 (runs 86, 85 and 68; FCP 1.7 s, LCP 2.7 s, TBT 437
ms, CLS 0), accessibility, best practices and SEO 100; desktop 100 in all
four (FCP 0.4 s, LCP 0.6 s, TBT 34 ms). What is left on mobile is the
first visit's own work (the scene and the intro built at once, on a CPU
slowed four times); the next step would be building the intro's later
beats on demand.

## The professional pass (1.3.0)

Every surface in every state (docs/audit/SURFACES.md, 54 of them),
pictured at 390 × 844 and 320 × 568 by `scripts/audit.mjs`, before
(`docs/audit/before/`, taken from the v1.2.4 build) and after
(`docs/audit/after/`); the ten pairs that changed most are in
docs/audit/README.md. Checked against the brief's list (cards hug their
content, actions right after the words, one primary, one order, spacing
from the scale, one type scale, one set of corners and shadows, 44 px
targets, focus rings, one grid, 320 px and the safe areas), against the
web interface guidelines (fetched fresh; the 0.12 pass above still holds
for the rest), and by a new test that measures every control's target and
every edge past the screen, at the device's size and at 320 × 568
(`tests/e2e/layout.e2e.ts`; findings 22 and 23 are its own). Places point
at v1.2.4.

| #   | Where (v1.2.4)                                                                              | What was wrong                                                                                                                                                                                        | Why it matters                                                                     | Fix                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/app/checkin.ts:141`, `src/styles/sheet.css:258`, `:286`                                | The line for the day: "send this" and "ok" a row under the words, each a 44 px box with its word in the middle, so 33 px of air between the line and the buttons, and as much under them (the author) | The card looked twice as tall as what it says, and the buttons belonged to nothing | The shared card (`src/app/leaf.ts`): who said it on the footer's left, the actions on its right, a pill for "ok"; the card is the line plus one row                                                             |
| 2   | `src/app/checkin.ts:111`, `src/styles/sheet.css:1027`                                       | The evening's good thing (the bottles' only source): "tomorrow: …" on a row of its own, then the buttons on another (the author)                                                                      | Same as 1                                                                          | "tomorrow" is the footer's note, the buttons beside it; on a 320 px phone the note takes its own line and the buttons stay right                                                                                |
| 3   | `src/app/checkin.ts:52`, `src/styles/sheet.css:226`, `:273`                                 | The check-in: the question in one column, the answer and "not today" stacked in another, the bright answer at the top right                                                                           | The only card with a stacked column; its order was not the others'                 | One order everywhere: quiet words first, a soft pill, the one bright primary at the right edge                                                                                                                  |
| 4   | `src/app/recap.ts:61`, `src/pwa/install.ts:56`, `src/app/chapter.ts:45`                     | The recap, the install card and a new chapter: two columns; at 320 px the install card's title broke into two lines and its lead into three, "not now" centred under "show me how"                    | Two layouts for one kind of card; a ragged column at 320 px                        | All seven notices are one component; the recap ends on "ok" as a soft pill, so every card has one clear end                                                                                                     |
| 5   | `src/styles/sheet.css:232`, `:294`, `:306`, `src/app/nameNotice.ts:31`                      | Three title styles on one kind of card: the display face (check-in), bold sans (install, chapter, "name it?"), a 32 px numeral (recap)                                                                | A title should look like a title the same way everywhere                           | One title style, the display face at 17 px; the week's number at 24 px inside it                                                                                                                                |
| 6   | `src/styles/sheet.css:198`, `:217`                                                          | The card's padding was 12 px top and bottom, 16 px at the sides, and its safe-area padding was written and then overwritten two lines later                                                           | Uneven insets; dead lines; a card under a landscape notch                          | 16 px on every side; the safe areas moved to the card's margins                                                                                                                                                 |
| 7   | `src/app/menuSheet.ts:37`, `src/styles/sheet.css:435`, `:510`                               | The club: the rows, then the three rules in 24 px heavy display type, then the club's line and the day count, nothing between them ("buttons and then random text", the author)                       | No hierarchy: the loudest type on the screen was a footnote's                      | The day count under the title, the rows, air, a small "the rules" over the rules at reading size, numbered, the repeated "the … rule of whale club is:" quieter than the rule, a hairline, the club's line last |
| 8   | `src/app/howItWorks.ts:16`                                                                  | How it works: the same heavy rules, and "watch the intro" a 48 px bright button in the middle of a page for reading                                                                                   | The page's loudest thing was its least needed                                      | The same rules block as the club; "watch the intro" is a row like the menu's, with a play mark                                                                                                                  |
| 9   | `src/styles/sheet.css:1039`                                                                 | Settings: a group's title and the setting's own label both small grey text, told apart by weight alone                                                                                                | The groups did not read as groups                                                  | One small spaced mark for every group in a sheet (`.eyebrow`): settings, the rules, the questions                                                                                                               |
| 10  | `src/styles/log.css:64`                                                                     | "start over": its icon 4 px left of the icons above it                                                                                                                                                | An almost-straight edge reads as a mistake                                         | The same 12 px as the rows above                                                                                                                                                                                |
| 11  | `src/styles/log.css:9`                                                                      | The rows' group clips its corners, and with them the focus ring drawn 2 px outside a row                                                                                                              | No visible focus on the menu's rows with a keyboard                                | The ring is drawn inside a row in a group                                                                                                                                                                       |
| 12  | `src/styles/safe.css:355`                                                                   | The bottle's line sat in a box with a field's border and fill                                                                                                                                         | Words written weeks ago looked like something to type in                           | Set as a quote: a gold rule on its left, 24 px, no box                                                                                                                                                          |
| 13  | `src/app/collectionSheet.ts:124`                                                            | An earned legendary's tile said "earned on 9 Nov 2026 · day 30" in a 60 px column: five lines, and every tile in its row stretched to match, with empty blocks in the other four                      | Empty area in four tiles for a date in one                                         | The tile says "day 30"; the whole plaque stays its label, and its card (the museum, below) shows it                                                                                                             |
| 14  | `src/styles/log.css:131`                                                                    | At 320 px the log's month is 28 px wider than the screen: seven square cells of at least 44 px do not fit in 288 px, so Sunday went past the edge and the sheet scrolled sideways                     | Broken at 320 px                                                                   | A cell may be narrower than tall (38 × 44 px at 320, square from 360)                                                                                                                                           |
| 15  | `src/styles/row.css:458`                                                                    | At 320 px "next find: in 3 days" broke onto two lines inside its 32 px pill and spilled out of it                                                                                                     | Broken at 320 px                                                                   | The words never wrap; under 360 px the shapes are 20 px and the gaps 4 px, so the two goals and "edit" fit in 288 px                                                                                            |
| 16  | `src/styles/safe.css:158`                                                                   | At 320 × 568 the bottle lay under the line's glass, half seen                                                                                                                                         | The one thing on a soft day that has something to give was hardest to see          | The bottom block's height is measured (a ResizeObserver, no forced layout) and the bottle stays above it on a short phone; on 390 × 844 it has not moved                                                        |
| 17  | `src/styles/sheet.css:120`, `:382`, `:617`, `:475`, `:664`, `src/styles/dock.css`           | Seven corner radii on interface shapes (6, 8, 10, 12, 14, 22 px and the pill), 14 px written out where the token is 14 px                                                                             | Corners that are almost the same look like a mistake                               | Three tokens: `--r-sm` 10 (inside something), `--r` 14 (a card), `--r-lg` 22 (a sheet), and the pill; what is left in px is a drawing (a stone, the postcard shapes)                                            |
| 18  | `src/styles/sheet.css:269`, `:637`, `:998`, `src/styles/row.css:325`, `:664`, `dock.css:18` | Spacing off the 4 · 8 · 12 · 16 · 24 · 32 scale: 18, 5, 6, 6, 3 and 3 px                                                                                                                              | The scale is the grid                                                              | On the scale; what is left off it is positioning (half a drawing's size to centre it) and the art                                                                                                               |
| 19  | `src/styles/tokens.css:38`                                                                  | `--t-2xl` was 32 px and `--t-xl` 40 px: the names ran backwards, and 32 px was used once (the recap's number)                                                                                         | A scale whose names lie                                                            | The 32 px step is gone; the scale is 11, 12, 14, 17, 24, 40                                                                                                                                                     |
| 20  | `src/styles/sheet.css:203`, `:805`                                                          | The two floating messages wrote the same shadow out twice                                                                                                                                             | One elevation, one token                                                           | `--shadow-float`                                                                                                                                                                                                |
| 21  | `src/app/checkin.ts:52` and the steps after it                                              | The check-in cut from one question to the next, and to the line or the field, jumping in height                                                                                                       | A card that changes size without moving looks broken                               | The sheets' crossfade (220 ms, the strong ease-out) on the card; none under reduced motion; a quick second tap is not a second answer                                                                           |
| 22  | `src/styles/dock.css:39`                                                                    | The krill chip's 44 px target was 42 px: the target is placed from inside the chip's 1 px border                                                                                                      | A target that promises 44 px in its comment and gives 42                           | One px further each way                                                                                                                                                                                         |
| 23  | `src/styles/sheet.css:260`, `src/styles/legendary.css:169`                                  | At 320 px the collection's rows of five were 13 px wider than the screen: a fifth of 288 px is 51 px, a tile's 44 px picture and its padding are 52                                                   | The sheet scrolled sideways at 320 px                                              | Columns that never grow past a fifth, pictures that fit their column                                                                                                                                            |

Checked and kept:

- **Targets.** Every control in the header, the cards, the sheets and the
  row is 44 px or more to the finger, held by `tests/e2e/layout.e2e.ts`.
  The krill chip (28 px), the goals and "edit" (32 px) look small and
  reach 44 px with a target around them. Two rows of seven are known and
  kept: on a 320 px phone the day chips and the log's days are 38 × 44 px
  (seven of 44 px and their gaps need 332 px; they have 288). WCAG 2.2's
  minimum is 24 px.
- **Line length.** Sheets are at most 398 px of text (the phone frame is
  430 px): about 55 characters at 14 px, 45 at 17 px.
- **Contrast.** The new text is on the tokens `tests/e2e/contrast.e2e.ts`
  already holds: the quiet lead of a rule is `--ink-dim` on the sheet,
  4.5:1 and over.
- **Focus.** Every control has the glow ring; the rows' is now inside them
  (finding 11).
- **Safe areas.** The header, the bottom block, sheets, the intro and the
  session read all four insets; the notices now do too (finding 6).

The motion added in this pass, against the review-animations standards:
the card's swap is 220 ms on `--ease-out` (under 300 ms, entering
content), a crossfade with the card easing to its new height, at most a
few times a day; it is a view transition, so it is not interruptible, and
a guard makes a second tap during it do nothing. The card's buttons give
on press like every other control (down at once, back over 180 ms). The
bottle's lift is a position, not an animation. Approved.

## 1.3 motion, checked against the same standard before it shipped

| Motion                                | Value                                                                  | Against the standard                                                                                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A find's case opening, and back       | The sheets' crossfade and height ease, 220 ms, `--ease-out`            | Under 300 ms, entering content; none under reduced motion                                                                                                                  |
| The tide coming in                    | The water rises 480 ms on the drawer curve, the screen fades in 260 ms | The sheets' own timing; a rare moment (once a month), so the slower rise is allowed. Under reduced motion it is there at once                                              |
| A tide card                           | Opacity and 8 px up, 260 ms, `--ease-out`                              | Under 300 ms; the next card starts where the last one was, so a quick "next" never queues motion. Movement off under reduced motion, the fade stays                        |
| Drift                                 | The interface fades over 900 ms, the way a lock-in's world steps back  | Deliberate and rare, so slower than a UI response on purpose; asymmetric with nothing to hurry. The quiet line fades from 0.9 to 0.35 once, over six seconds, opacity only |
| Visitors and the whale while drifting | The scene's own visitor and whale animations, every 22 s               | Reused, already reviewed; none under reduced motion                                                                                                                        |
| The whale back from its swim          | The scene's surfacing, 900 ms after the card                           | Reused; never during the app's start                                                                                                                                       |
| Press on the new buttons              | The shared press: down at once, back over 180 ms                       | As every other control                                                                                                                                                     |

Approved.
