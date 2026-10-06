# State

## Done

- Docs: DESIGN, COLLECTIBLES, DECISIONS, ARCHITECTURE, RESEARCH-SEA, RESEARCH-DOPAMINE.
- Scaffold: Vite + strict TypeScript, ESLint (type-checked) + Prettier + .editorconfig, MIT, CHANGELOG, GitHub Actions deploy workflow, Playwright with iPhone 13 / Pixel 5 / desktop projects.
- **Stage 1, the row and the scene** (v0.1.0):
  - add up to five things (name, emoji, tap or timer, minutes); worlds assigned sea, sky, garden, sea, sky;
  - tap = done today with a jump, a world-coloured burst and a line; second tap undoes;
  - long press = timer sheet (15 / 30 / 60 / custom), calm running screen with the creature swimming, finishing counts as done, a reload resumes it, stop counts nothing;
  - seven week dots under each card;
  - the scene: sky (background stars + a star per day laid out by week and weekday, streaks joined into constellations), sea with bioluminescent drift, shore with grass; three parallax layers; quiet-day dimming;
  - creatures: all 24 drawings (3 worlds x 2 lines x 4 stages) with faces, stage from last 7 days;
  - PWA: manifest, generateSW with hashed assets, update toast ("new version. tap to reload") with a reliable reload, update checks on open / foreground / hourly, offline; install leaf (iPhone two steps, Android install button, desktop nothing, closed for 7 days);
  - onboarding: one sentence plus "e.g. run. read. practice 20 min.";
  - 45 e2e tests passing (things, tap, timer, offline, update toast within 10 s, install leaf);
  - screenshots in docs/screenshots (iphone, android, desktop; scene and all-done).

## In progress

Nothing. Stage 1 is committed.

## Next

1. **Stage 2**: collectibles (`scene/collectibles.ts`, silhouettes, unlock scene and line, Collection sheet), whale surfaces when all done, tap a star to see its day, daily surprise from the date (new fish, jellyfish at night, a sea fact line from RESEARCH-SEA, a glow), check-in (call and response, `days[date].checkin`), weekly recap on Sunday or the first open of a new week ("5/7." and a line), Rules sheet, sound gate + tap / bubble / whale tones + mute button, share PNG (canvas, "day N of whale club", Web Share on iPhone, download elsewhere), header buttons (sound, collection, rules, share). Tests for each. Screenshots. v0.2.0.
2. **Stage 3**: buddy slot (name + base64url share code, read-only scene beside yours), polish on all three devices, Lighthouse PWA and performance, README final. v0.3.0.

## How to run

```
npm install
npx playwright install chromium
npm run dev        # http://localhost:5173/whale-club/
npm test           # builds, previews, runs Playwright on three devices
npm run lint
npm run shots      # README screenshots (needs npm run preview running)
```

## For the author to do by hand

- Enable GitHub Pages on the repo (Settings, Pages, Source: GitHub Actions).
- Replace every TODO-VOICE line in `src/voice.ts` with your own.
