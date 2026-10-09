# Ideas

What people love in apps and games near this one, and what of it could
live in the sea. The research (2026-10-09) looked wide on purpose: habit and
focus apps, mood and journaling, breathing and sleep, self-care with a
companion, language learning, running and the gym, cozy games (collections,
museums, letters, calm worlds), and year-in-review stories. It read what
people say in reviews, forums, essays and a few studies, not feature lists.
Every idea is written as a mechanic, in our own words; no other product is
named here (docs/DECISIONS.md, "No other app's name in this repo").

The thread through all of it: **people come back to a place that is glad to
see them and asks nothing**, and they leave the ones that make a missed day
feel like a debt. The moments they quote are small: something grew,
something came back, something said one true thing about them.

Effort is for this codebase: **S** an evening, **M** a long evening or two,
**L** several days. Delight is how strongly the evidence says people feel
it, 1 to 5.

## Built in 1.3.0

| Idea                      | Effort | Delight | Why this one                                                                                             |
| ------------------------- | ------ | ------- | -------------------------------------------------------------------------------------------------------- |
| 1. The month's tide       | M      | 5       | The strongest evidence of anything here; the data, the recap's rules and the postcard painter were there |
| 2. The museum             | M      | 4       | Every find already earned becomes a small story at once; the author's voice gets a hundred new places    |
| 3. Drift                  | S      | 4       | The calmest thing a sea can offer, one word in and one word out                                          |
| 4. The whale's night swim | M      | 5       | A companion that goes away and comes back with a story is the most loved thing in its field              |

## The candidates

### 1. The month's tide (the brief's c), built

- **What it does.** On the first open of a new month, a card offers last
  month "in a few lines". Five to seven cards, one sentence each, by swipe
  and by a worded "next": the days with a star, the lantern minutes, the
  best week, the newest find, one true thing noticed, a playful sea "type"
  for the month, and last a postcard. The log keeps every month's tide to
  watch again.
- **Why people love it.** Year-in-review stories are loved as
  self-understanding told card by card, ending on something to keep. Giving
  everyone a playful type made sharing appealing to everyone, not only the
  people with the biggest numbers. People who keep mood logs quote the
  month's view. The warning: the worst-received year of a famous recap
  showed people things that were not true.
- **In the sea.** The tide comes in over the scene; each card is one line
  on the quiet glass, the month's stars lit behind it.
- **Principles.** Yes, with rules: every sentence exactly true; nothing
  missed is named; a truth is said only when enough days back it, and is
  left out rather than invented. The brief's example ("on days you ran,
  you said good more often") cannot be true here: the check-in's answers
  are fixed and always happy. The truths the data can carry: two things
  that happen on the same days, the weekday most stars fell on, how many
  evenings kept a good thing, the longest lock-in.
- **Effort / delight.** M / 5.

### 2. The museum (the brief's e), built

- **What it does.** Every find gets one silly, warm line about itself. The
  collection becomes a museum: a tap on a find opens its case, the find
  drawn large, its line, the day it came, which thing grew it, and its
  shine. Finds still to come stay silhouettes.
- **Why people love it.** The best-loved curator in cozy games is loved
  because his descriptions carry his personality; players choose to hear
  them. A plaque with the day makes a find yours. Collection screens that
  fill slowly are what collectors praise.
- **In the sea.** Small lit cases under the water; a case opens to a card
  in the app's own type.
- **Principles.** Yes. It adds meaning to what exists and asks nothing.
- **Effort / delight.** M (most of it writing, 88 lines) / 4.

### 3. Drift (the brief's a), built

- **What it does.** A worded "drift" in the club (and a long press on the
  moon) fades the whole interface away. Only the sea stays: the stars, the
  creatures, the whale crossing now and then, the generated surf if sound
  is on. A tap anywhere, or the one quiet word "back", returns.
- **Why people love it.** The zen mode of a sandboarding game (no score,
  no failure, music) is that game's most praised feature; players used it
  as meditation. Watching fish slows the heart in aquarium studies; slow
  water is the textbook "soft fascination". The warning: a toy with no goal
  loses its novelty, so this is a place to visit, not a reason to return.
- **In the sea.** The header, cards and row sink away; the whale crosses;
  the surf is generated, so it never has a loop's seam.
- **Principles.** Yes: one word in, a visible word out, nothing to count.
- **Effort / delight.** S / 4.

### 4. The whale's night swim (from the research), built in place of b

- **What it does.** Each night the whale swims off somewhere real in the
  sea: a glowing bay, a kelp forest, a field of vents. On the first open of
  the next morning it is back, with one line about where it went. Nothing
  piles up: if the app is not opened, only the latest tale waits.
- **Why people love it.** In the most-loved self-care companion app, the
  pet's trips and the stories it brings back are the emotional centre;
  people look forward to its return. A sleep game turned waking up into a
  reveal people loved. Small content paced by the day is what makes a calm
  game something to look forward to.
- **In the sea.** In the morning the whale surfaces with a little wet glow
  and the line: where it went, and one true thing about that place.
- **Principles.** Yes. It never depends on doing anything and never says
  the whale waited.
- **Effort / delight.** M / 5.

### 5. Breathe first (the brief's b), for the author

- **What it does.** Beside "lock in", a small worded "breathe first", off by
  default. Chosen, the whale rises with three slow breaths (in about 4
  seconds, out about 6, some 30 seconds), and the session begins by itself;
  "skip" is always there. The choice is remembered.
- **Why people love it.** A large meditation app opens on one deep breath,
  and it works because it flows straight into the next step. A 2023 trial
  found breathing with long exhales lifted mood more than mindfulness in
  five-minute doses. The warning: anything before the main action can feel
  like a gate.
- **In the sea.** The water lifts as you breathe in; on the long breath out
  the whale spouts a slow fountain of plankton.
- **Principles.** Yes, opt-in and remembered.
- **Effort / delight.** S / 3. Not built tonight: the night swim had more
  evidence of delight; this is a small, safe next step.

### 6. A letter to later (the brief's d), for the author

- **What it does.** From the evening's card or the log, "write to later":
  a short message and when it should come back (a month, 100 days, a year).
  That day it washes up as a bottle of its own: "you wrote this to
  yourself". Opened, it stays in the log; "write back" keeps one line
  beside it.
- **Why people love it.** People cry in coffee shops over year-old letters
  to themselves; a cozy life sim lets you mail your future self. Writing to
  a distant future self raised exercise in the following days in a study,
  and writing back as that self made people feel more connected to it. The
  warning: some found opening it frightening. The answer: ask for something
  kind, never a goal, and let a letter wait or be let go.
- **In the sea.** A bottle with a different glow at the water's edge.
- **Principles.** Yes; it waits instead of notifying.
- **Effort / delight.** S to M (the bottles exist) / 5 on the day it comes,
  but weeks away; tonight's delight would only be the writing.

### 7. The long swim

- **What it does.** Lantern minutes move the whale along a real humpback
  migration on a small map in the log; at waypoints a postcard arrives with
  a true line about the place. It never resets and has no deadline.
- **Why people love it.** Distance challenges on real routes give everyday
  effort a destination and a postcard at each place; lifetime totals are a
  quieter form of the same pleasure.
- **Principles.** Yes. Overlaps with the night swim; one of the two.
- **Effort / delight.** M to L (a map, waypoint writing) / 4.

### 8. Visitors at the dock

- **What it does.** Now and then, picked from the date, a visitor drifts in
  for the day: a seal, a lost buoy, a sleepy turtle. One that has come
  often enough leaves a keepsake. A visit while the app was closed leaves a
  trace, so nothing is missed.
- **Why people love it.** A cat-collecting game is loved for not knowing who
  will be there and for the regulars' keepsakes.
- **Principles.** Yes, with the traces (without them, a fear of missing).
- **Effort / delight.** M to L (each visitor is new art) / 4.

### 9. Sea calendar nights

- **What it does.** A few real sea events get one special night each: the
  coral spawning after a late-spring full moon, a whale migration month.
  The scene shows it; the log notes it. Nothing is only collectable then.
- **Why people love it.** Seasons and holidays are the ritual cozy games
  are loved for; the sea already keeps the solstices and meteor showers.
- **Principles.** Yes, if missing the night costs nothing.
- **Effort / delight.** M / 4.

### 10. The whale's story

- **What it does.** A short serial, one paragraph per star day, read in the
  log; a break skips nothing.
- **Why people love it.** A real-time island game's daily bit of story is
  "something to look forward to", and its days follow the player, not the
  calendar.
- **Principles.** Yes.
- **Effort / delight.** M, nearly all writing (30 to 60 paragraphs) / 4 if
  the writing is good, 2 if not. The author's to write.

### 11. Sleep tide

- **What it does.** On the good night screen, a worded "sea sound" that
  plays the surf and fades it out over fifteen minutes.
- **Why people love it.** Sleep audio is built on exactly this: dull on
  purpose, a sound that outlasts the voice, a slow taper.
- **Principles.** Yes. Built on drift's sound.
- **Effort / delight.** S / 3.

### 12. Whale-sized numbers

- **What it does.** Totals as sea comparisons, only where true: "this
  month's lantern minutes: a humpback's song, forty times over."
- **Why people love it.** Lifters love lifetime totals told as elephants and
  blue whales.
- **Principles.** Yes. One card of the month's tide (built there).
- **Effort / delight.** S / 3.

### 13. Your tide type

- **What it does.** Each month a playful sea type from how it went: an otter
  (mornings), a lanternfish (late nights), a turtle (a little every day), a
  dolphin (in bursts). Every one is warm; none is better.
- **Why people love it.** Types in a year-in-review made it worth sharing
  for everyone, not only the top tenth.
- **Principles.** Yes. One card of the month's tide (built there).
- **Effort / delight.** S / 4.

### 14. A year ago tonight

- **What it does.** On a date with a good thing written a year before, the
  day's bottle is that one: "a year ago tonight". It can be turned off, and
  a line can be told not to come back.
- **Why people love it.** Long-time journal keepers name "on this day" as
  the reason they stay. The warning, from a large social network's own
  research: people need control over what comes back.
- **Principles.** Yes, with the control.
- **Effort / delight.** S (the bottles exist) / 4, from a year on.

### 15. More ways to pet

- **What it does.** Richer reactions: a creature comes closer on a second
  pet, one darts off happily and comes back, a sleepy one leans in.
- **Why people love it.** Players of petting games ask for varied reactions
  and body language to read.
- **Principles.** Yes; petting still marks nothing.
- **Effort / delight.** S to M / 3.

### 16. Still water

- **What it does.** Inside drift, "keep this" saves the sea as it is right
  now as a postcard.
- **Why people love it.** Photo modes are loved for freezing a calm moment
  and keeping it.
- **Principles.** Yes. The postcards exist.
- **Effort / delight.** S / 3.

### 17. More words for today (not recommended)

- **What it does.** A real mood picker in place of the check-in's ritual,
  to power true mood patterns.
- **Why it is listed.** It is the only honest way to get the brief's "you
  said good more often". It would turn a happy ritual into self-measurement;
  the advice is not to chase that truth.
- **Effort / delight.** M / 2.

## Rejected: they break a principle

| Idea               | What it would be                                           | Why not                                                                       |
| ------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Pod swims          | Focus with friends; one leaving sinks everyone's whale     | A server and accounts; social pressure by design                              |
| Tide league        | Weekly leagues, or "you focused more than 80% of people"   | A server and analytics; comparison is what breaks a cozy place                |
| Morning bell       | A notification when the whale is back or a chapter opens   | Notifications and a permission prompt                                         |
| Wilting coral      | Leaving a lock-in early bleaches coral or kills a creature | Guilt; nothing dies here                                                      |
| Streak shield      | Spend krill to protect a streak                            | It says there is a streak to lose; quiet days are already given, free         |
| Real reef          | Spend krill to plant real coral through a partner          | The network, payments, and claims the app cannot check                        |
| Strangers' bottles | Send a letter in a bottle to a stranger, receive one       | A server, moderation, and strangers' heavy letters                            |
| Deep read          | A machine-written summary of the week's notes              | The network; a machine layer restating the data was a recap's most hated part |
| Sleep listener     | The microphone overnight for a morning reveal              | A permission prompt, the battery, and data that is not the app's business     |

## What the author decides

The four built tonight can each be switched off by deleting their files and
a line in `src/app/app.ts`; nothing else depends on them. The open choices,
in the order the research would take them:

1. **A letter to later** (6): the next small build; the bottles are ready.
2. **Breathe first** (5): a small, opt-in touch before a lock-in.
3. **The long swim** (7) or more **night swim** places: one of the two, not
   both.
4. **The whale's story** (10): only if the author wants to write it.
