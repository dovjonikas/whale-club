# Changelog

All notable changes, newest first. Versions follow `package.json`.

## 1.2.4 - 2026-10-08

- **Rows that look like rows**: in the menu and in settings, the log, how
  it works, settings, back up and restore are a soft group of rows, each
  with a small icon in a circle and a chevron, filled rather than outlined
  so none reads as a field to type in. When the last backup was sits under
  the group; starting over is apart, quiet and in red.
- Tests that answer the check-in no longer depend on the hour (an evening
  run asks for the day's good thing first), and the pause test waits for
  the screen's next second before reading the time it holds.

## 1.2.3 - 2026-10-08

- **"after" says what it does**, in one quiet line under it in the thing's
  sheet: what it comes after in your day; the card says it, and the row
  follows your day's order. No clock hours and no reminders, as before.

## 1.2.2 - 2026-10-08

- **The creature's name has its own place** in the thing's sheet: further
  down, with the creature beside it and the label "the creature’s name",
  where right under the thing's own name it read as the same question twice.

## 1.2.1 - 2026-10-08

- **The red jacket, redrawn.** On the whale it is cut to the body's own
  outline, a short coat with its collar folded back at the front, buttons,
  a pocket, a hem above the white belly and a red sleeve with a cuff on
  the fin, where before it was a red patch lying on top. As a find (and on
  the scarecrow) it is a little jacket seen from the front: sleeves, a
  V-neck with lapels and a shirt under it, buttons and two pockets.
- **"name it?"** says which creature and why: "run grew all the way.",
  where the thing's name alone read like a label.

## 1.2.0 - 2026-10-08

A safe place: five small things so the app feels like somewhere good to
come back to. No new settings, no notifications, no guilt.

- **"not today"**, small, under the check-in's first answer. The sea
  softens (a light rain on the water, a warmer light), one line is said,
  and the row keeps one small thing with "just this one?"; the rest rest
  under the "not today" strip. Such a day is a quiet day, never a missed
  one, and spends none of the week's quiet days. Three in a row, once a
  week at most: "it’s been heavy for a few days. tell someone you trust."
- **Bottles**: the evening's good things come back. On a "not today" day,
  or once a week when five or more were written, a bottle washes up on
  the sand; opened, it says "you wrote this a while ago:" (or "back in
  spring") and the line. One a day at most; the same line not again
  within a month; none written, no bottle. If the check-in came before
  18:00, the evening asks for its one good thing on its own, once.
- **Pet your creature**: each thing's creature lives in its world in the
  scene too. A tap brings it a little closer, it blinks, a few bubbles
  rise, a soft sound. Nothing earned, nothing counted. One asleep on a
  quiet day wakes and waves. Under reduced motion, a blink.
- **Late at night** (23:00 to 05:00, moved by "a day ends at"): the scene
  a little darker and warmer, "late. the sea will be here tomorrow.", and
  a tap on the moon says good night: the whale falls asleep and the app
  rests on a quiet screen until a tap.
- **A name**: when a creature first reaches its last stage, "name it?",
  once, with "not now". The name shows in the thing's sheet, where it can
  change, and now and then a line says it instead of "it".
- **Cleaner cards that ask for a word** ("one good thing today", "name
  it?"): one column, the field the full width, the buttons in a row.

## 1.1.0 - 2026-10-08

A line for the day.

- **After the check-in, the line for the day**, in place of "noted.":
  quieter than the questions, one row on a phone or two, the same all
  day and another tomorrow. Twenty lines the author chose, walked in one
  fixed order as the sea facts are, so none comes back until all have had
  their day. The author's own carry no name; the others carry theirs in
  lowercase, from public-domain translations (docs/LINES.md). An evening
  check-in shows it after the one good thing.
- **"send this"** beside the line: a postcard of the whale with the line,
  and the name under it where there is one.
- **Moments say the author's lines**: a missed day "fall seven times,
  stand up eight."; a quiet week "not perfect. still moving."; days 100
  and 200 "compare day one with today."; day 365 "look back sometimes. you
  came a long way. respect yourself."; a new chapter "one day you might
  not get to try this. let’s do it while we can."; the club line "if you
  get there one day, who do you want next to you?"; and under the timer's
  question, small, "above all, don’t lie to yourself." (dostoevsky). A
  line a moment says that day is not said again by the check-in.
- **"show the time"** on the lock-in screen itself, next to "sea sound":
  the time stays in sight, for this session and the next (the same
  choice as in settings, now where it is needed).
- **The README's "Why it exists"** in the author's own words.

## 1.0.0 - 2026-10-08

The first year, whole, made ready for strangers. No new mechanic.

- **How it works** in the menu answers the questions a friend asks first:
  is it free, does it block other apps, can a lock in pause, music while
  locked in, does it work offline, where is my sea kept, with a friend.
  Its few lines now include krill.
- **The README** for a stranger: install on iPhone and Android, the same
  questions answered, a roadmap (year two comes in updates, and an update
  never takes away what was earned), and its facts brought up to date
  (seventy-eight finds to day 365, a dial from five minutes to ten hours,
  211 scenarios per device, Lighthouse on the live site).
- **The scene's textures are PNG again.** 0.17.0 made them WebP on
  Lighthouse's advice; measured against PNG, interleaved, it made no
  difference to the frames, and Safari makes a PNG anyway, so one format
  everywhere.
- **The frame test holds what the app controls**: the main thread's work
  per frame (about 5 ms at full speed). The frame gaps in headless
  Chromium flip between one and two vsync steps with the machine, so they
  are recorded with a looser bound.
- **Fixed in the review before the tag**:
  - a new chapter is offered on the week's first day as set, not always
    on a Monday, and the day chips start on that day too;
  - a reload during the ten seconds of undo after a restore or a start
    over offers the undo again, as 0.16 promised (it was written, never
    read);
  - data from version 1 gets a kind and a line for every thing, as data
    from versions 2 to 5 already did;
  - a find's entrance lets go when it lands, instead of holding a layer
    for good.
- **Tidied in the same review**: dead methods, a sound never played,
  unused lines and styles removed; comments that had stopped telling the
  truth corrected (the sky as a calendar, Monday as the only first day);
  numbers that answer a person named once (the phone the scene is drawn
  for, a minute, the hours a day can end, the shooting stars, the shore's
  warmth); one download, one date format, one seeded order, one world
  type; the interface's own names moved into voice.ts word for word.
  docs/ARCHITECTURE.md checked file by file against the code.

## 0.17.0 - 2026-10-08

Polish: the details that are felt more than seen.

- **Launch**: iOS startup images for eleven iPhone sizes (`npm run splash`),
  so a launch from the home screen no longer flashes white; a stable
  manifest id; the first screen's three font files preloaded.
- **Type**: reading sizes in rem, so a larger text setting reaches them;
  antialiased light-on-dark text; balanced headings; tabular figures on
  every count.
- **Presses** land at once and let go over 180 ms.
- **Toasts and undo** count only time they can be read: not under a
  resting pointer, not under keyboard focus, not while the app is hidden.
- **Sheets**: the log and the dock change view with a short crossfade
  (a view transition), skipped under reduced motion.
- **Postcards**: "making the postcard…" while one is still painting; the
  preview keeps its size while it loads.
- **Motion**: the first card's hint pulses its glow's opacity, not a
  shadow; "start light" in 500 ms; the water rises in 700 ms; under
  reduced motion a find fades in instead of appearing at once.
- **Keyboard and screen readers**: paging the log keeps the focus on the
  arrow; Escape skips the intro; Space or Enter shows the time in a lock
  in and skips the opening; a find not reached yet keeps its name; field
  ids of their own; the kind's line is read as its description; the icon
  picker's preview is named and its extra chip stays under the finger.
- **Layout**: a legendary's date written as people write it ("9 Nov 2026"),
  so it no longer breaks in its tile; safe areas on every edge of the intro
  and the session; days still to come in the log at 3:1; a long name wraps
  in the collection.
- **Checks**: a contrast test for every pair of colours that carries
  words; frame timing on a CPU slowed four times; Lighthouse on the live
  site (docs/QUALITY.md).

## 0.16.0 - 2026-10-08

Trust and settings: the sea is never lost.

- **Settings**, one sheet from the menu, each choice one row that takes
  effect at once: sounds, the sea in a lock in; a day ends at midnight,
  3:00 or 5:00 (a done at 01:30 then belongs to the evening before); the
  week starts on Monday or Sunday; the seasons follow the north or the
  south; show the time; a new thing's length; the postcard size (moved
  here from the menu); a still sea; and about (how it works, the version,
  where five taps still open the lab, the storage it takes, one line on
  privacy, the licence).
- **A still sea**: the scene's own motion paused, for a quiet screen
  without asking the whole system for reduced motion. Taps still answer.
- **Back up and restore**: the whole sea as one JSON file with its data
  version and a SHA-256 checksum, through the share sheet (an iPhone's
  "Save to Files") or a download. Restoring says what the file holds
  before anything changes, and can be undone for ten seconds. A damaged
  file, a file from a newer version, or a file that is not a backup is
  refused with a clear word, and nothing changes.
- **Start over**, with "back up first" beside it and ten seconds of undo;
  the sea is kept in a key of its own until the undo has passed.
- **A quiet nudge**: once a month, if the last backup is older than thirty
  days, a small dot on the menu button and one line inside. No popup.
- Lasting storage is asked for once, after the first week, where the
  browser can grant it.

## 0.15.0 - 2026-10-08

Gentle mechanics: small, each backed by the research.

- **Quiet days.** Every thing has a little freedom each week, given in
  advance: one day off when it is planned four days or fewer, two from
  five. A planned day missed inside it is a small moon in the week's dots
  and in the log, never an empty dot; it breaks no streak and does not dim
  the sea. Nothing to set.
- **Welcome back.** The first done after a break of two or more planned
  days is a small gift, +20 krill and a flash of light, and not a word
  about the break.
- **Creatures never look sad.** Left alone for two of their planned days
  they sleep, eyes closed, breathing slowly; done again, they wake and
  wave.
- **A new chapter.** After a quiet week (fewer than two stars), the next
  Monday or the first of a month offers one: the week's dots start fresh.
  The sky, the finds and the krill keep everything.
- **After...** In a thing's sheet, if wanted: after waking up, coffee,
  work, dinner, or before bed. The card says so, small, under the name,
  and the row follows the day's order. No clock hours anywhere.
- **The evening's one good thing.** After 18:00 the check-in ends with one
  optional line and tomorrow's things to read; the line is kept for the
  day and shown only in the log.
- **The badge**, on Android: how many of today's things are left, set as
  the app goes to the background, cleared when all is done. It never asks
  for a permission, so there is none on iOS.

## 0.14.0 - 2026-10-08

The first year, and the path to a legendary.

- **Constellations instead of a calendar.** The sky is a path now (the log
  keeps the calendar): every day something was done lights the next star
  of a constellation, drawn in the outline of the legendary at its end,
  the way ahead faint and dotted from the very first day. Paths are 30
  stars, then 60, then 100; finished ones stay in the sky, smaller. The
  day's first done sends its star up from the card to its place (about a
  second; a tap lands it).
- **A rare find half way, a legendary at the end.** Five legendaries of
  our own: the golden whale, the pearl turtle, the comet fox, the crystal
  jellyfish, the moon heron. Bigger than a find, gold or pearl, with a
  shimmer; never sold, and always given a place. Finishing a path plays a
  ceremony: the scene darkens, the constellation lights, a beam comes
  down, and the legendary appears with a plaque ("earned on 2026-11-12 ·
  day 30"); its postcard has a gold frame. The Collection has a legendary
  row, silhouettes until earned.
- **Rarity is earned.** Per-thing finds are common now; a find reached
  before this version keeps the shine its date gave it.
- **The goals in sight**: beside the next find, the legendary's outline and
  "12/30".
- **Finds to day 365**: tiers at 240, 300 and 365, eighteen new finds (a
  sea otter, a seal, a pod of whales, a pufferfish, a coral, an orca, a
  small rocket, a ringed planet, a galaxy, a silver-edged cloud, a
  visitor, the morning sun, a pond, a hedgehog, a cottage, a deer, a
  wishing well, an apple tree).
- **The first week as a set**: seven small silhouettes above the cards,
  one filled each day something is done; the seventh day finishes it with
  the whale's song and +100 krill, and the set is gone for good.
- **The real year**: the season by the date (snow on the sand in winter,
  blossom in spring, a long summer dusk, fallen leaves in autumn);
  meteor showers on their nights, the solstices and equinoxes, World
  Ocean Day and World Whale Day, New Year's night, and the person's own
  anniversary, each said in place of the day's surprise.
- **Days 100, 200 and 365** of whale club are quietly kept, each with a
  card of its own; the 365th's shows the whole cove of lanterns.
- **Less noise**: the last month's lanterns float on their own and older
  ones merge into one glow that grows with them; a year in the lab keeps
  under forty things in the scene.
- **Art slots**: a picture at `public/art/<id>.webp` takes the place of a
  find's drawing everywhere, no code changed; `npm run art:check` and
  docs/ART.md. Pictures there are not MIT.
- The lab: "+1 star" and "finish this path".

## 0.13.0 - 2026-10-08

Krill and the dock, and arranging your sea.

- **Krill**, the one currency: earned, never bought, never lost. Worked
  out from the days like the finds (10 a thing done, a krill a lock-in
  minute up to 120 a session, 25 for everything planned done, 50 for a
  good week); only purchases are stored. A steady person earns about
  1,900 a month and 23,000 a year; the model is in docs/ECONOMY.md.
- **The chip** under the title: a drawn krill and the balance, and the one
  goal being saved for as a thin line ("1,200 to the lighthouse"). A
  small "+10" rises by it after a tap, and after a session's opening.
- **The dock**, a pier in the middle of the shore (the chip opens it too):
  thirty things to look at in four tiers, 150 to 12,000, fixed prices, no
  chance, no boxes, no timers. A silhouette and a price until it is
  yours; get it in one tap; save for one; hide or show anything owned. A
  hat, a scarf or round glasses ask who wears it, and that creature wears
  it on its card, in a lock-in and on the postcard. Some things change
  the whole scene: lanterns on the pier, a longer pier, a glowing tide, a
  small whale that keeps yours company, and after dark aurora nights, the
  cove glowing, Friday's falling stars, a whale in the sky once a night.
  The red jacket is never sold.
- **Places.** Every world has its own: the shore 6, the sea 8, the sky 8.
  Finds and dock things stand in them, a new one in the first good free
  place; a full world sends the next to the chest, and the line says so.
  The scene's weather (the aurora, the milky way, the deep) keeps its own
  spot behind them.
- **Arrange**, one word in the Collection: the scene stops and every place
  shows as a soft ring. Drag a thing to another place of its world and it
  snaps in, or swaps with whoever stands there; or tap it and tap a ring.
  Put away into the chest and put out again; tidy up goes back to the
  automatic places. Nothing is marked or bought while arranging.
- **Three extensions**: a longer shore (+4 places at the water's edge), a
  reef (+6 places on the coral, a layer deeper) and an island on the
  whale (a big whale resting at the horizon with six places on its back).
  Buying a thing to place, or more room, opens arranging at once, with
  the thing in hand.
- The postcard paints your arrangement: the pier, the extensions and
  everything standing on them.
- Fixed on the way: drifting finds no longer jump by half their size; the
  aurora, the deep and the island find no longer draw as hard-edged
  boxes; a stone cracked late no longer pushes a standing find away.
- Data version 8: purchases, the goal, what is hidden or worn, and where
  things stand. Every earlier version opens.

## 0.12.1 - 2026-10-08

The author's motion review (review-animations), answered.

- Reduced motion keeps the fades: movement stops and keyframes land on
  their end, but a sheet, a toast or a leaving card fades instead of
  blinking. Sheets and toasts stay in place and fade.
- Toasts leave faster than they come (180 ms out, 260 in, both on the
  strong ease-out).
- Stopping a lock-in: the deep water goes down in 600 ms on the drawer
  curve, the screen's own things fade first, and the screen is removed when
  the water is down, no longer cut off mid-slide.
- A done card's glow is a layer of its own that only fades; nothing is
  repainted as it comes and goes.
- One feel for every press: 0.97, 140 ms, ease-out (icon buttons were a
  0.92 squash).
- Copy: typographic apostrophes ("it’s", "can’t"); the share error says
  what to do next ("try again in a moment.").
- Findings, and what waits for polish, in docs/QUALITY.md.

## 0.12.0 - 2026-10-08

The brand: every thing wears a bubble, in the app's own sign language.

- **The bubble.** A glass float in the thing's colour, its picture in one
  cream line, a light arc where the glass catches the moon, and the
  signature: one tiny bubble rising off the rim. Done, it fills with its
  colour, the glyph turns dark and the signature pops into three (under
  300 ms; under reduced motion it only fills). A lock-in's rim is its
  timer ring. It sits at each card's corner; a waiting stone rests on its
  edge, so the mark never hides. A done card glows in its thing's colour.
- **48 glyphs of its own** in six groups (body, mind, craft, home,
  people, care), drawn by hand on a 24 grid in strokes of 1.75 with round
  ends, one cream colour, readable at 20 px. A thing's picture is picked
  from its name as it is typed, in English or Lithuanian ("violin",
  "smuikas", "run", "bėgimas"), diacritics or not; a name that fits none
  wears its first letter.
- **The add sheet** has no emoji any more: a live bubble shows how the
  card will look, the twelve most common pictures, the first letter, and
  "more" by group. The thing's sheet has the same field. The starters
  wear their pictures.
- **No emoji anywhere.** Lists show a small bubble before a name: the
  not-today strip, the collection, the log's day, a session. The log's
  legend shows each thing's bubble.
- **Data v7**: a thing keeps its picture. Things from before take the
  glyph their emoji meant, else one from their name, else a monogram; the
  emoji is kept for the record.
- **The interface's own icons** in the same hand: header, sheets, the log,
  the postcard offer.
- **The app icon**: a whale's tail diving, in a sea glass bubble with the
  signature; a favicon that holds at 16 px; full-bleed Apple and maskable
  icons.
- **brand.html**: the look on one page, drawn by the app's own code.
- **The postcard** shows every thing in its bubble at its creature's
  corner, filled if it was done that day; a long name keeps to its column.
- **Motion**: strong curves as tokens, a press on every pressable, sheets
  on the iOS drawer curve that leave faster than they come and can be
  pulled down, hover only on real pointers, nothing growing from zero. A
  closing sheet stops taking taps at once.
- **Smoother intro**: no stall on the first tap (the sound is readied
  behind "tap to begin"), no camera push, no words twitching as their fade
  ends.
- **The interface audit** (docs/QUALITY.md): typed names are escaped
  everywhere, attributes too; a card's week and length reach screen
  readers; toasts, notices and offers are announced; the session screen,
  the intro and every redraw keep the focus; on a phone a sheet opens on its
  title instead of springing the keyboard; an empty name says so by the
  field; fields and chips have edges at 3:1; every target is 44 px; no text
  under 11 px; under reduced motion the whale still comes, as a fade.

## 0.11.3 - 2026-10-07

The intro has a score.

- A first open starts on "tap to begin" over the quiet sea: a browser plays
  no sound before a first touch, and this one tap lets the music start with
  the year. Enter works too; "skip" is still there.
- The year is a music box whose notes run as fast as the days do, its
  chords turning with the seasons (C, A minor, F, G). Day 365 holds on a
  suspended chord, the whale sings as it rises, and "a year of small
  things." is sung a note a word, leaning on F and falling home to E.
- Every word of the truth has its note. The doubt falls softly in A minor
  and stops on an unresolved B; the blink is real silence; the hope opens on
  F with a new low voice; at "compound" the notes double with the stars
  (one, two, four, eight, sixteen); "stay consistent" waits on G with C
  held over it; and the last word, "small.", lands on a wide C chord with
  the F falling to E, high bells, and the whale singing upward, then rings
  out and fades under "start light".
- Felt piano, warm pad, a whale's voice, an echo and a long generated room;
  all synthesised, nothing loaded. Measured offline: no clipping, and a
  climb from the doubt to the peak of about thirteen decibels.
- Sheets: a grabber that has lost its pointer no longer throws.

## 0.11.2 - 2026-10-07

The truth beat, played like a song that climbs.

- The eyes close slowly on the year and flutter open on the empty sea of
  day one, dim and cold, with the little whale asleep. The first half of the
  author's sentence (the doubt) comes word by word.
- Then the eyes blink. Under the closed lids the doubt goes and the light
  warms, and they open on the second half (the hope) as the little whale
  opens its eyes too.
- At "compound" the stars double, one, two, four, eight, sixteen, each wave
  sooner than the last, while the camera leans slowly in. The whale swims up,
  the light warms again, and on the last word it hops and blows, the first
  star blooms with a ring, every star flares once, and the notes climb to a
  bright chord.
- Every cue only adds to the ones before it. Transform and opacity only; under
  reduced motion the lids fade and nothing moves. Still under thirty seconds
  to "start light".

## 0.11.1 - 2026-10-07

The author's first look at 0.11, answered.

- The intro is paced like music: a quiet opening, a year that gathers pace
  and slows into its last days, a held moment at 365, the whale rising, and
  "a year of small things." word by word, staying long enough to read
  twice. The truth comes a phrase at a time while a small story plays
  under it: a little whale asleep under the surface wakes, swims up and
  blows, and the first star lights above it on the last word. Soft notes of
  a pentatonic scale for the finds once sound is on. Under 30 seconds to
  "start light".
- Text over the scene (the line, "edit", the next find, the title, the first
  sentence, "not today") sits on a quiet glass, there but hardly seen, so
  it reads against stars, sand and water alike.
- A lock-in can be any length from five minutes to ten hours: "other" in
  the add sheet and the thing's sheet opens hours and minutes; the dial
  stops every five minutes up to an hour, every quarter up to three, every
  half hour up to ten; lengths read "5 h", "1 h 30 min".

## 0.11.0 - 2026-10-07

Two kinds of thing, clear editing, and the first minute.

- The author's principle at the top of the README.
- Two kinds of thing, chosen with one question in the add sheet and the
  thing's sheet: "tap when done" (a checkbox ring; tap and tap again) and
  "lock in" (its length and a small timer ring on the card; a tap opens
  the dial; 15 minutes to start). A finished lock-in is not undone by a
  stray tap; its sheet can take it back.
- Only the minutes the timer saw count: the screen writes "seen until"
  every five seconds, leaving the app stops the count after fifteen seconds
  and coming back carries on, a reload or a dead phone keeps everything
  seen, and the card offers "12/25 · finish". A lantern is bright in one
  go, softer in parts, faint for a day that ended short.
- "Did it without the timer", in a lock-in's sheet: "the full 15 min, for
  real?", twice a week at most, a small hand on the card, no lantern.
- "edit" over the row: a red "delete" on every card, a tap opens the
  card's sheet; "delete this thing" at the bottom of the sheet; no "are you
  sure", the card swims off and "undo" waits ten seconds; a swipe to the
  left as a shortcut. A deleted thing's stars, finds and lanterns stay.
- The first minute: the promise (a seeded year in silhouette, a day counter
  to 365), the truth (the author's sentence over the empty sea), the first
  step ("start light", with three small things to begin with). Skip always,
  a tap goes on, still frames under reduced motion, "watch the intro" in
  "how it works", "first open again" in the lab.
- The next find always in sight above the row; each mechanic says what it
  is once, the first time it shows; the very first star has a moment.
- The log explains itself: under the calendar, what a star and a lantern
  are, a colour dot and name for each lock-in thing, and what soft and
  faint lanterns mean when the month has them; a day lists what was done,
  the sessions with their minutes and the minutes that did not finish.
- "how it works" in the menu.
- Data version 6: a kind and a line on every thing, deleted things kept as
  retired, sessions with parts, days done without the timer. Things from
  before become lock-ins where most of their done days had minutes.
- Tests: the clarity test (fifteen everyday jobs done through visible
  words only, each within two taps), the two kinds, editing and deleting,
  the intro.

## 0.10.0 - 2026-10-07

Lock in, the opening, the lanterns and the log.

- During a lock-in the world sinks and deep water rises over it, with
  light coming down through it. What stays is the creature, a slow ring
  and the thing's name.
- The time is hidden: a tap anywhere shows it for three seconds. (A
  setting to keep it on comes with settings.)
- The first ten seconds can be undone, without a trace. After that it is
  stop, as before.
- One pause per session, up to five minutes: the creature sleeps, the time
  stands still, and being away inside the pause is not leaving. When it
  runs out the session goes on by itself with one quiet note.
- The end is an opening: the deep water goes back down over about 1.2 s,
  then in order the session's lantern comes down into the cove and lights,
  the creature goes home to its card, today's first star lights (and the
  whale, when the day is all done), the line, and "send the whale". A tap
  anywhere lands on the end at once.
- Lanterns: every lock-in that runs to its end leaves one in the cove under
  the shore for good; its colour is the thing's, its size the minutes; a
  left session's is dim. A year of them (the lab's new "seed 365 days")
  keeps one frame per redraw.
- The log, the one view of what has been done: a month at a time with each
  day's star and lantern dots and the month in one sentence ("19 stars, 11
  lanterns, 6 h 40 min"); the year as twelve small months; a day opened to
  what was done, the sessions with their minutes and the check-in. It opens
  from the menu, from a tap on the open sky, and a star opens its own day.
- Data version 5 keeps sessions one by one; older data gets a lantern for
  every thing done with minutes.

## 0.9.0 - 2026-10-07

Tidying, the first step towards 1.0.

- No other app is named anywhere in the repo any more; the README's
  comparison section is gone.
- One kind of thing: the add sheet asks for a name, an emoji, the days and
  a lock-in length (30 minutes by default). "Tap when done / timer", the
  minutes row and the note about holding a card are gone. Data version 4
  drops `mode`; every thing has a length. Migration tested.
- Leftovers from earlier versions listed in DECISIONS and cleared.
- The big modules split by world or job: collectibles and their drawings
  (scene/collectibles/, scene/art/), the creatures (scene/creatures/), and
  app.ts (lock-in in app/lockIn.ts, the data-to-scene helpers in
  app/sceneData.ts). Nothing behaves differently.
- Lighthouse on the live v0.8.0: mobile 98/100/100/100, desktop 100 in all four.

## 0.8.0 - 2026-10-07

The lab, and lighter pictures.

- **The lab**: a hidden sandbox with a movable clock. Five quick taps on the
  version at the bottom of the menu, or `?lab=1`, open it. The real record
  is copied into the lab's own key and never written while the lab is on;
  a striped bar over every screen, sessions included, shows the offset and
  an exit that throws the sandbox away. Controls: +1 day, +7 days, -1 day,
  back to real time, do everything today, seed 30 days, seed 90 days, clear
  sandbox.
- One clock for the whole app (`src/store/clock.ts`): every "today" and
  "now" goes through it, and a lint rule keeps it that way.
- The version now shows at the bottom of the menu.
- README screenshots are WebP, each under 300 KB (they were up to 1.7 MB
  PNGs); `npm run shots` squeezes them at the end.
- Faster first second: the v0.7 textures were encoded synchronously
  (toDataURL) and the scene read its size before the page was laid out,
  which forced a full layout during startup. The size now comes from the
  ResizeObserver, the textures are drawn in two idle moments and encoded
  with toBlob, and the caustics loop no longer calls Math.hypot. Lighthouse
  performance on a phone went from about 70 back to the high 90s.
- A lock-in test no longer races the sheet for focus.
- Lighthouse measured again on the live URL.

## 0.7.0 - 2026-10-07

A design pass: the same screen, drawn with more care. Nothing about how
the app works has changed.

- A fine film grain over the whole scene, so the night reads like paper.
- The sea has depth: a bright wave along the water line, slanted moonlight
  shafts, a caustic net under the surface, two big whales passing far down
  in silhouette, kelp at the bottom on a tall screen.
- Every creature redrawn with soft shading, rim light, blush and eyes with
  a catchlight; at the last stage each has a small thing of its own.
- The sixty collectibles redrawn in the same hand; the sea's finds sit in
  the water, not on the sand.
- The whale surfacing is shaded and blushing, with a ring of water and
  droplets from its spout.
- Cards are lit glass; a tap squashes and pops; a waiting stone on a card
  is a small shaded pebble.
- Bursts: bubbles with a glint, sparkles in the sky, two-tone petals.
- The empty first screen has a small whale asleep under the surface,
  breathing out bubbles; it leaves when the first thing is added.
- The dial and the session ring use a sea-to-moon gradient; the dial's
  creature is larger.

## 0.6.0 - 2026-10-07

Days: optional planning that adds nothing to the first screen.

- A thing's own sheet (the three dots on its card) holds its name, emoji
  and lock-in length, and one line of seven day chips, Monday first, all
  on by default. The add sheet has the same line.
- The first screen shows only what is planned today. The rest fold into
  one thin strip, "not today"; opened, they are dimmed and cannot be
  marked done there, but each can be added for today only ("also today").
  A planned thing can be taken off today only ("not today") in its sheet.
- The week dots: a full dot for a planned day done, an empty one for a
  planned day not done, a small dash for a day off, which is never a miss.
- Consistency counts planned days only: the creature grows with the last
  seven planned days, so a thing done three times a week can become a
  whale; the streak runs over planned days and a rest day does not break
  it; all done means everything planned today; the weekly recap is days
  with a star out of days with anything planned.
- A day with nothing planned is a rest day: one quiet line, no star, no
  dim, nothing missed, and the check-in still there.
- The third rule is now "you never give up on yourself".
- Data is version 3: every thing gets its weekdays, all on for anything
  made before; a day can carry "also today" and "not today".

## 0.5.0 - 2026-10-07

The crack, the sky, and lock in.

- **The crack.** What a thing earns arrives as a meteor stone: it falls
  into the sea and floats, hangs in the sky as a dark speck with a glow,
  or lies on the shore. It waits, with a small mark on the card, for as
  long as it takes. Three taps (or a one-second hold) crack it: it shakes,
  the glowing cracks open, it bursts, and the find comes out of the light,
  is polished and settles into its place. What is found still follows from
  the total days; its shine (common, rare, legendary) is picked from the
  date it was earned and is cosmetic only.
- **The sky.** A nebula of slow colour behind a deeper star field with
  tinted stars, bright four-point ones and a shooting star now and then;
  the moon in its real phase for the date; the shore glowing warmer as the
  garden fills. The day-stars and constellations are unchanged.
- **One loop.** The star field, the particles and the parallax share one
  requestAnimationFrame loop, which stops while the page is hidden or the
  scene is off screen; under reduced motion it never starts.
- **Lock in.** Every card has a visible "lock in" under it (the long
  press is gone). A dial picks 10 to 120 minutes in fives and remembers
  the last length per thing. The session is the whole screen: the scene
  quiet, the sky turning, the time large and calm, and the thing's
  creature starting as an egg, a spark or a seed and growing as the
  minutes pass, breathing and blinking. The screen is kept awake where the
  browser allows it. A quiet generated sea sound can be switched on.
- **Nothing dies.** Hidden for more than fifteen seconds, the session does
  not fail: the creature waits and the session goes on from where it was.
  A clean session is a full day (a star, a step towards the next stone); a
  session that was left counts as done but earns neither, and the line
  says so plainly. Stop writes the minutes down and nothing else.
- The notices (install, recap, check-in) moved under the header, so the
  water line stays clear for the stones.
- Data is version 2: the stones cracked per thing, and the days shown up
  for with a session that waited. Version 1 migrates with everything it
  had already found kept.
- The moon collectibles became a ring around the real moon and its light
  on the water.
- Fixed: a thing edited since the first render (its lock-in length) could
  be drawn with the other line's creature; bursts were offset on a
  desktop, where the scene sits in a centred frame.

## 0.4.0 - 2026-10-07

Postcards: the club is you and whoever you send your whale to.

- The buddy slot, the share code and the read-only buddy scene are gone,
  with their tests and docs. A settings.buddy left by v0.3 is dropped on load.
- After a moment worth showing (the whale surfacing when all is done, an
  unlock, a creature growing), one button appears: "send the whale", or
  "send this" for an unlock. The weekly recap has "send this" too, and the
  header's share button sends the sea any time.
- A postcard is the scene repainted from the data at 1080x1920 (story) or
  1080x1080 (square), with the moment's line, the day count, the date and
  a small "whale club" mark. Chosen on the first send, remembered, changed
  in the menu. It goes to the share sheet, or downloads where there is none.
- Four header buttons: sound, collection, send the sea, menu. The menu is
  one screen, the club: the three rules and one sentence.
- The install leaf waits for the first thing; the empty first screen is
  for the first sentence. The iPhone leaf's button opens three big steps.
- The app lives in a phone-wide frame on every screen; on a desktop the
  sides are black.
- The recap's buttons sit under its line, so the line keeps one row on a
  320px phone; a test holds every line after a tap to one row there.
- The row of things is a group, not a list without items: Lighthouse
  accessibility had flagged it.
- Lighthouse, live URL, through Edge: mobile 99 / 93 / 100 / 100, desktop
  100 / 93 / 100 / 100 (performance, accessibility, best practices, SEO),
  measured before the fix above.

## 0.3.0 - 2026-10-06

Stage 3: your Tyler.

- The club: one buddy slot. Name the person who pushes you, paste their
  code, and their scene (sky, creatures, collectibles) is drawn beside
  yours, read only, from the code alone. No server.
- Your own share code, gzipped and base64url, with copy and send.
- A fifth header button for the club; the header fits five on a 375px phone.
- Notice buttons are 44px tall; a polish pass on iPhone 13 mini, iPhone 13,
  Pixel 5, 1366x768 and 1920x1080 found no overflow and no small targets.
- The share picture's title is left-aligned again (it was clipped).

## 0.2.0 - 2026-10-06

Stage 2: the growth, the collectibles and the sky.

- 60 collectibles (three worlds, two lines each, ten tiers) drawn into the
  scene as they unlock; locked ones shown as silhouettes with the true
  number of days to go in the Collection sheet. An unlock is a burst, a
  sound and one line.
- Creatures grow with a visible stage-up moment and a line.
- All done: the whale surfaces over the horizon with a sound and a glow;
  from day 90 it wears the red jacket.
- Every day-star is a button: tap it to see what was done that day.
- The daily surprise after the first thing done: a sea fact line, a
  visitor crossing the scene, or a glow, chosen by the date so nothing
  repeats until the pool is spent.
- The check-in: call and response, two taps, once a day.
- The weekly recap: N/7 and one line, on Sunday or the first open of a
  new week, never what was missed.
- The rules sheet, with the day count and a small streak.
- Sound: synthesised tones behind a tap gate, a mute button that remembers.
- Share: the scene as a PNG with the day count, through the share sheet
  where there is one and as a download elsewhere.
- One notice above the row at a time: install leaf, recap, check-in.

## 0.1.0 - 2026-10-06

Stage 1: the row and the scene.

- Up to five things, each with a name, an emoji, tap or timer mode; worlds
  assigned in order (sea, sky, garden, sea, sky).
- Tap marks today, with a jump, a burst in the world's colours and one
  line; a second tap undoes.
- Long press runs a timer (15, 30, 60 or custom); the creature swims, the
  screen goes calm, finishing counts as done, and a reload resumes it.
- Seven week dots under each card.
- The scene: night sky with a star per day laid out as a calendar, a shore,
  a sea with bioluminescent drift; three parallax layers.
- A missed day dims the scene for a day and says so. Nothing is lost.
- PWA: manifest, versioned service worker, offline, an update toast, the
  install leaf for iPhone and Android.
- Playwright tests on iPhone 13, Pixel 5 and desktop.
