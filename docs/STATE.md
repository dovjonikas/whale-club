# State

## Done

- Docs: DESIGN, COLLECTIBLES, DECISIONS, ARCHITECTURE, RESEARCH-SEA, RESEARCH-DOPAMINE.
- Scaffold: Vite + strict TypeScript, ESLint (type-checked) + Prettier + .editorconfig, MIT, CHANGELOG, GitHub Actions deploy workflow, Playwright with iPhone 13 / Pixel 5 / desktop projects. Repo: github.com/dovjonikas/whale-club, description and topics set.
- **Stage 1, the row and the scene** (v0.1.0): things, tap, timer, week dots, the three-layer scene, the sky as a calendar, creatures with stages, PWA with update toast and install leaf, onboarding, 45 tests.
- **Stage 2, the growth, the collectibles and the sky** (v0.2.0):
  - 60 collectibles drawn into the scene (`scene/collectibles.ts`), unlock burst + sound + line, Collection sheet with silhouettes and "in N days";
  - stage-up line and sound; the whale surfaces on all done (red jacket from day 90);
  - day-stars are buttons: tap shows "Tue 3 Nov: run, read";
  - daily surprise (fact / visitor / glow) from a shuffled pool by date;
  - check-in ritual, weekly recap, rules sheet, one notice slot;
  - sound gate + tones + mute; share PNG (Web Share or download);
  - 78 tests passing; screenshots regenerated (scene, all-done, collection on three devices).

## In progress

Nothing. Stage 2 is committed.

## Next

1. **Stage 3**: buddy slot ("your Tyler"): name + share code (base64url JSON of things, days, settings.buddy.name), a read-only buddy scene beside yours (a second, smaller scene or a sheet with the buddy's creatures, stars and collectibles), no server. Polish on all three devices (check 390x844, 393x851, 1366x768 and 1920x1080 for overflow and 44px targets), Lighthouse PWA + performance pass, README final with the three device screenshots, v0.3.0.
2. After Stage 3: STATE and README final, the author's to-do list (Pages, voice.ts).

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
