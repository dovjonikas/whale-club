# State

## Done

v0.7.0, live at https://dovjonikas.github.io/whale-club/ after the push.

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

## How the timer worked before v0.5 (the audit asked for)

- It counted from a timestamp: `{ thingId, startedAt, minutes }` in `whaleclub:timer`; the time left was always `startedAt + minutes - now`, never a count of ticks.
- A reload or reopening resumed it from that key; if the time had already run out, it finished at once and counted as done.
- Closing the app did nothing at the time; nothing ran in the background. Coming back worked the end out from the timestamp.
- If the time ran out in the background, the tick (a 1 s interval, throttled or suspended while hidden) noticed on return and finished it then; no sound, no notification.
- There was no wake lock, and nothing noticed leaving. The only way in was a long press on the card, which is why it was hard to tell whether it worked.

## Verified

- `npm run lint`, `tsc --noEmit`, `npm run build`: clean.
- `npm test`: 151 passed, 14 skipped (device-specific), on iPhone 13, Pixel 5 and desktop. New: days (the strip on a Saturday, also today for one day, not today, the seven chips, a new thing's days, three a week reaching the whale, the dots, a streak across a weekend, all done with a thing off, a rest day, the migration from version 2).
- Screenshots regenerated after the v0.7 pass, with a new one of the empty first screen; earlier: the not-today strip, the thing's sheet with the day chips, and a rest day.
- Known: on a 320px phone the day chips are 37px wide (44px tall); everything from 375px up is 44px both ways.

## Next

Nothing queued. Ideas the author has mentioned and not asked for yet: the author's own voice lines (src/voice.ts).

## How to run

```
npm install
npx playwright install chromium
npm run dev        # http://localhost:5173/whale-club/
npm test           # builds, previews, runs Playwright on three devices
npm run lint
npm run build && npm run preview   # then: npm run shots (README screenshots)
npm run icons      # after changing public/icons/icon.svg
```

Lighthouse, on Windows:

```
set CHROME_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
npx lighthouse https://dovjonikas.github.io/whale-club/ --chrome-flags="--headless=new"
```

## For the author to do by hand

1. **Voice**: replace every line marked `TODO-VOICE` in `src/voice.ts`. New in v0.5: `lockIn.broken`, `lockIn.stopped`, `stones.fell`, `stones.waiting`; in v0.6: `restDay`. Keep each under about 40 characters so it fits one row on a 320px phone; `tests/e2e/lines.e2e.ts` checks that. A few tests assert the current strings; change them in the same commit.
2. **On the phone**: add it to the home screen, start a lock-in and lock the phone for a minute, to see "you left. it waited." with your own eyes.
