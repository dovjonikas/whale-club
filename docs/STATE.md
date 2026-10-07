# State

## Done

v0.11.3, live at https://dovjonikas.github.io/whale-club/ after the push.

- **v0.1.0 to v0.3.0**: the row, the scene, the sky as a calendar, creatures, PWA, collectibles, the whale, rituals, sound, share; a buddy slot (since removed).
- **v0.4.0**: postcards instead of a buddy; the phone-wide frame; the install leaf after the first thing; Lighthouse through Edge.
- **v0.5.0**:
  - **the crack**: earned tiers fall in as stones (sea floats, sky hangs, garden lies on the shore), a mark on the card, three taps or a one-second hold, shake, cracks, burst, the find polished and settling; rarity (common, rare, legendary) from the date, cosmetic only;
  - **the sky**: nebula, tinted star field with sparkles and a shooting star, the moon in its real phase, the shore's warm light; one requestAnimationFrame loop for the whole app, stopped while hidden or off screen, never started under reduced motion;
  - **lock in**: a visible button on every card, the dial (10 to 120, step 5, remembered per thing), the whole-screen session with the creature growing from an egg, spark or seed, breathing and blinking, the sky turning, wake lock, an optional generated sea sound; leaving for more than 15 s marks the session and the creature waits; a clean end is a full day, a left one counts as done without a star or a step towards a stone; stop writes the minutes only;
  - notices moved under the header; data version 2 with a migration from 1;
  - the third rule is now the author's: "you never give up on yourself".
- **v0.6.0**: days. A thing's sheet (three dots on its card) with seven day chips, all on by default, and today's exception ("not today" / "also today"); the add sheet has the same line; the first screen shows only today's things, the rest in a "not today" strip; week dots with a dash for a day off; last7, streak, all done, missed yesterday and the recap count planned days only; a rest day is one quiet line, no star, no dim; data version 3.
- **v0.7.0**: a design pass, nothing functional. Film grain; the sea's depth (water line, moonlight shafts, caustics, deep whales, kelp); creatures and all sixty collectibles redrawn with shading, faces and rim light; the whale surfacing redrawn; lit glass cards with a squash on tap; a pebble for a waiting stone; richer bursts; a sleeping whale on the empty first screen.
- **v0.8.0**: the lab (five taps on the version in the menu, or `?lab=1`): a sandbox copy of the sea with a clock that moves by days, a striped bar on every screen with exit, one-tap controls (+1 day, +7 days, -1 day, back to real time, do everything today, seed 30 / 90 days, clear sandbox); one clock module for every "today" and "now", held by a lint rule; screenshots as WebP under 300 KB; the startup no longer forces a layout or encodes the textures synchronously (Lighthouse performance back from 70).
- **v0.9.0**: tidying (no other app's name, one kind of thing, leftovers cleared, big modules split).
- **v0.10.0**: lock in in deep water with the time hidden, undo, one pause; the opening; lanterns in the cove; the log; data v5.
- **v0.11.0**: two kinds of thing (tap when done, lock in); only the minutes the timer saw count, parts add up, "12/25 · finish"; did it without the timer; "edit" with delete and undo, retired things keep their history; the first minute (promise, truth, start light); the next find in sight; one-line explanations; the log's legend; how it works; data v6; the clarity test.
- **v0.11.1**: the author's first look answered: the intro paced like music with a small story in the truth beat; a quiet glass under text over the scene; lengths up to ten hours ("other", a stepped dial).
- **v0.11.2**: the truth beat as a song that climbs: the eyes open on day one, blink at the turn, the stars double at "compound", the first star blooms on the last word with a chord.
- **v0.11.3**: the intro has a score: "tap to begin" so sound may play, a music box year, a note for every word of the truth, silence at the blink, the notes doubling at "compound", the last word resolving on the peak.

## The road to 1.0 (the author's briefs of 2026-10-07)

The first brief is in the author's journal (consistency-game/prompt-6-product.md),
with two additions sent the same day: a settings sheet (trust) and art
slots for collectibles (the first year). Two evening additions put new
stages straight after 0.10.0 (two kinds and the first minute) and after
0.11.0 (the brand and the UI) and moved every later stage up; 1.0.0 stays
last. Product principles win over any item; where the evening
addition and the first brief disagree, the evening addition wins.

- [x] **0.9.0 tidying**: no other app's name; one kind of thing (data v4,
      no mode, one lock-in length; undone again in 0.11.0); leftovers listed
      in DECISIONS; big modules split (collectibles, art, creatures, app.ts).
- [x] **0.10.0 lock in, the opening, the log**: the world sinks during a
      session; the time hidden (a tap shows it 3 s); undo in the first 10 s;
      one pause up to 5 min; the end is an opening in order, a tap skips;
      lanterns in the cove (dim when left), 490 from "seed 365" at one frame
      per redraw; the log (month, year, day); data v5 with sessions.
- [x] **0.11.0 two kinds, clear editing, the first minute** (the evening
      addition, its addendum on interruptions, and the log's legend): done.
- [ ] **0.12.0 the brand and the UI** (the second evening addition), with
      the skills in order (frontend-design, ui-ux-pro-max, emil-design-eng,
      review-animations, web-design-guidelines) and what came from each in
      DECISIONS:
  - docs/brand/BRAND.md first (colour tokens, type, the mark, glyph rules),
    then its critique against the brief;
  - the bubble: every thing gets a round glass badge in its lantern colour,
    a cream line glyph inside, a light arc top left, and the signature: one
    tiny bubble rising from the top right edge (on every badge, the app
    icon and the favicon); done fills it with colour, darkens the glyph and
    pops the small bubble into three (under 300 ms; reduced motion: only the
    fill); a lock-in's rim is its timer ring ("12/25") and fills during a
    session; the log's legend and dots use the same bubbles and colours;
  - about 48 glyphs of our own (body, mind, craft, home, people, care), one
    SVG sprite, 24 grid, 1.75 line, round caps, one cream colour, readable
    at 20 px; the UI icons redrawn in the same hand (add, edit, close,
    arrows, menu, settings, share, lock in, star, lantern, krill, stone,
    hand, undo, sound); the app icon, maskable icons and favicon: a whale's
    tail in the same line inside a bubble with the signature;
  - the add sheet loses the emoji: the glyph is picked from the name by
    keywords in English and Lithuanian, 12 common ones and "more" with the
    groups, a monogram when nothing fits; starters with glyphs;
    `Thing.icon` (glyph id or "letter"), the emoji kept for migration (a
    table from emoji to glyph, unknown to a monogram); no emoji left in the
    UI;
  - brand.html in the build: every glyph, the bubbles in every state, the
    colours, the type, the app icon; README "the look" and a link to the
    icon set;
  - the important audit findings fixed now (contrast, focus, tap targets,
    curves, press states, the type scale, spacing from tokens); the rest to
    polish;
  - tests: every glyph at 20 and 40 px, keywords (en and lt), the emoji
    migration, the monogram, the done animation and reduced motion, glyph
    contrast in the bubble at least 3:1, the clarity test, the postcard
    shows bubbles; screenshots of the first screen with bubbles, the add
    sheet with glyphs, the log with its legend, brand.html.
- [ ] **0.13.0 krill and the dock, and arranging your sea** (the third
      evening addition joins it): krill derived from history, purchases
      stored as {itemId, date}; docs/ECONOMY.md; the chip, "+10"; about 30
      cosmetic items in four tiers, "save for this", "who wears it?". And:
  - principle: what you earn you may arrange as you like, but nobody has
    to; who never arranges still has a beautiful scene;
  - spots, not free dragging: shore 6, sea 8, sky 8; finds and dock items
    stand in spots; a new one takes a good free spot by itself;
  - "arrange" (a visible word in the Collection sheet): the scene stops,
    the spots show as soft rings, drag a thing to another spot and it
    snaps, an occupied spot swaps; only within its own world; "done" and
    "tidy up" (back to the automatic layout) at the top; nothing is marked
    or bought in arrange mode;
  - the chest: "put away" and "put out" (a word and an icon); when the spots
    are full a new find goes to the chest with one line (TODO-VOICE);
  - three extensions in the dock: "a longer shore" (+4 shore spots), "a
    reef" (+6 sea spots, a new layer of depth), "an island on the whale"
    (the big whale carries a small island with 6 spots; the dearest, a few
    months of krill); after buying an item or an extension, arrange opens
    with it in hand;
  - not: rotating, resizing, recolouring, free coordinates, layers; the
    creatures and the lanterns never move;
  - the postcard shows the arrangement; data `placement {itemId: spotId}`,
    "chest" as a spot, extensions add spot sets, no records means automatic;
  - tests: new items take a spot, drag and swap, own world only, put away
    and put out, full spots go to the chest, tidy up, an extension adds
    spots, arrange opens after a purchase, reduced motion, the clarity
    test's new job "move a find"; screenshots of arrange mode and the island
    on the whale.
- [ ] **0.14.0 the first year, the path to legendary, less noise** (the
      fourth evening addition joins it):
  - tiers to 365 (240, 300, 365) with new finds; the first-week set;
    seasons, sky events, special days; days 100, 200, 365; art slots
    (public/art/<id>.webp, silhouettes from alpha, docs/ART.md, npm run
    art:check);
  - constellations instead of the sky calendar (the log is the calendar
    now): every day with something done lights one star of the current
    constellation, shown ahead as faint stars and dotted lines in the shape
    of its legendary; paths of 30, 60, then 100 stars (about four
    legendaries a year for a steady person); a brighter star and a rare
    find half way, the legendary at the end; after the first done of a day
    a star rises from the card, flies to its place and its line joins (about
    1 s, a tap skips); a missed day takes nothing, rest days do not count; a
    finished constellation stays bright for good and the next path's faint
    outline appears; the "next" bar shows both goals (the next find "in 2
    days", the legendary's silhouette "12/30"); the per-thing stones stay;
  - rarity earned, not drawn: per-thing finds are common, rare comes from
    half way, legendary only from a path's end; the date-based rarity goes
    (finds already found keep theirs); four or five legendaries of our own
    for the first year (a golden whale, say), each with an art slot;
  - a legendary stands apart: its own drawing with movement (a light
    shimmer, gold or pearl), bigger, its own sound; a ceremony (the scene
    darkens, the whole constellation lights, a beam comes down, the find
    appears; about 3 s, a tap skips; reduced motion: a calm appearance); a
    plaque with its name and "earned on 2026-11-12 · day 30"; a "legendary"
    row in the Collection (silhouettes until earned); a gold frame and the
    plaque on its postcard; never sold in the dock;
  - less noise: the sky only constellations and atmosphere, no 365-dot
    grid; the cove's last 30 days of lanterns apart and bright, older ones
    merged into a soft glow that grows over the months (the log still shows
    every one); the visible items limited to the spots of 0.13, the rest in
    the chest; the daily surprise stays; a test: after the lab's seed 365 no
    more than 40 separate objects in the scene (background aside), and a "a
    year, readable" screenshot;
  - the lab: "seed 365" shows about four finished constellations; "+1 star"
    and "finish this path";
  - tests: a star for each day done, a missed day takes nothing, rest days
    do not count; path lengths 30, 60, 100; rare half way, legendary at the
    end; the "next" bar with both goals; the ceremony and reduced motion;
    the plaque with its date; the gold postcard frame; the migration (old
    rarity stays, the date rarity is not used for new finds); the object
    limit after seed 365; the clarity test's new job "see how far the
    legendary is"; screenshots of a constellation half way, the ceremony,
    a year's scene after seed 365. DECISIONS: why rarity is earned, why the
    sky is no longer a calendar.
- [ ] **0.15.0 gentle mechanics**: quiet days (moons in the dots and in the
      log), welcome back +20, sleeping creatures that wave, new chapter,
      "after...", the evening line (shown in the log's day), the Android badge.
- [ ] **0.16.0 trust**: back up and restore with a checksum and undo, the
      monthly backup dot, storage.persist; the settings sheet (sound, a day
      ends at, week start, seasons, show the time, default length, postcards,
      your sea, about).
- [ ] **0.17.0 polish**: docs/QUALITY.md from the checklist, iOS startup
      images, sheet physics, press states, tokens, 60 fps with 400 lanterns,
      Lighthouse.
- [ ] **1.0.0**: README rewritten for strangers, "how it works" filled with
      the FAQ, tag and GitHub release, a senior review pass.

## How the timer worked before v0.5 (the audit asked for)

- It counted from a timestamp: `{ thingId, startedAt, minutes }` in `whaleclub:timer`; the time left was always `startedAt + minutes - now`, never a count of ticks.
- A reload or reopening resumed it from that key; if the time had already run out, it finished at once and counted as done.
- Closing the app did nothing at the time; nothing ran in the background. Coming back worked the end out from the timestamp.
- If the time ran out in the background, the tick (a 1 s interval, throttled or suspended while hidden) noticed on return and finished it then; no sound, no notification.
- There was no wake lock, and nothing noticed leaving. The only way in was a long press on the card, which is why it was hard to tell whether it worked.

## Verified

- `npm run lint`, `tsc --noEmit`, `npm run build`: clean.
- `npm test`: 282 passed, 14 skipped (device-specific), on iPhone 13, Pixel 5 and desktop, then the perf project alone. New in v0.11: the clarity test (fifteen jobs by visible words, two taps each), the two kinds, kept minutes and a dead phone, editing and deleting, the intro.
- Screenshots regenerated for v0.8 and squeezed to WebP (20 to 60 KB each), with a new one of the lab; earlier: the empty first screen, the not-today strip, the thing's sheet with the day chips, a rest day.
- Known: on a 320px phone the day chips are 37px wide (44px tall); everything from 375px up is 44px both ways.

## Next

Nothing queued. Ideas the author has mentioned and not asked for yet: the author's own voice lines (src/voice.ts). The lab's strings are in voice.ts too, under `lab`; they are tool labels, not the game's voice.

## How to run

```
npm install
npx playwright install chromium
npm run dev        # http://localhost:5173/whale-club/
npm test           # builds, previews, runs Playwright on three devices
npm run lint
npm run build && npm run preview   # then: npm run shots (README screenshots, squeezed to WebP)
npm run icons      # after changing public/icons/icon.svg
```

Lighthouse, on Windows:

```
set CHROME_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
npx lighthouse https://dovjonikas.github.io/whale-club/ --chrome-flags="--headless=new"
```

To try the app across days on a phone: open the menu, tap the version five times (or open `?lab=1`). Exit throws the sandbox away.

## For the author to do by hand

1. **Voice**: replace every line marked `TODO-VOICE` in `src/voice.ts`. New in v0.5: `lockIn.broken`, `lockIn.stopped`, `stones.fell`, `stones.waiting`; in v0.6: `restDay`. Keep each under about 40 characters so it fits one row on a 320px phone; `tests/e2e/lines.e2e.ts` checks that. A few tests assert the current strings; change them in the same commit.
2. **On the phone**: add it to the home screen, start a lock-in and lock the phone for a minute, to see "you left. it waited." with your own eyes.
