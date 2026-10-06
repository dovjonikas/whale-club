# State

## Done

All three stages are built, tested and committed. v0.3.0.

- **Docs**: DESIGN, COLLECTIBLES, DECISIONS, ARCHITECTURE, RESEARCH-SEA (72 sourced facts, 73 one-liners, 25 collectible ideas, a reading list), RESEARCH-DOPAMINE (the mechanisms, 20 recommendations, a ranked top ten, the pitfalls).
- **Scaffold**: Vite + strict TypeScript (no `any`), type-checked ESLint + Prettier + .editorconfig, MIT, CHANGELOG, GitHub Actions (lint + build + e2e on PRs, deploy only on push to main), Playwright on iPhone 13 / Pixel 5 / 1366x768. Repo: github.com/dovjonikas/whale-club with description and topics.
- **Stage 1** (v0.1.0): things, tap, timer, week dots, the three-layer scene with parallax, the sky as a calendar, 24 creature drawings with stages, PWA with a versioned worker, update toast and install leaf, onboarding.
- **Stage 2** (v0.2.0): 60 collectibles drawn into the scene, Collection sheet with silhouettes and true distance, stage-up, the whale on all done (red jacket from day 90), tappable day-stars, daily surprise from a shuffled pool, check-in, weekly recap, rules sheet, sound gate with tones and mute, share PNG, one notice slot.
- **Stage 3** (v0.3.0): the club (buddy slot with a gzipped base64url share code, read-only buddy scene), fifth header button, polish pass on five viewports (no overflow, every control 44px), 87 tests passing.

## Verified

- `npm run lint`, `tsc --noEmit`, `npm run build`: clean.
- `npm test`: 87 passed, 6 skipped (device-specific) on the three projects. Two tests (the Android timer, the iPhone share) have each flaked once under full parallel load and passed on every rerun; CI retries once.
- Polish script (not kept) measured iPhone 13 mini, iPhone 13, Pixel 5, 1366x768 and 1920x1080: no horizontal overflow on any surface, no visible control under 44px.
- Lighthouse could not run on the development machine: chrome-launcher fails to spawn a browser (`spawn UNKNOWN`) and the Playwright headless shell closes the target Lighthouse opens. Run it from Chrome DevTools against the live Pages URL after the first deploy; the build is 312 KiB precached, fonts latin-only, no third-party requests, so performance should be in the nineties.

## Not done, on purpose

- Nothing from the brief is left out. Voice lines are placeholders marked TODO-VOICE.
- The buddy's scene does not refresh itself; a new code has to be pasted (DECISIONS).

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

## For the author to do by hand

1. **GitHub Pages**: repo Settings, Pages, Source: GitHub Actions. The next push to `main` (or a re-run of the Deploy workflow) publishes to https://dovjonikas.github.io/whale-club/. Then replace the "(placeholder until Pages is enabled)" note in README.md.
2. **Voice**: replace every line marked `TODO-VOICE` in `src/voice.ts`. Keys: firstOpen, example, thingAdded, tap (sea / sky / garden lists), untap, timerStart, timerEnd, allDone, missedDay, quietDay, weekGood, weekBad, stageUp, unlock(name), starPlaced, checkin.after, install, shareDone, shareFailed, club (yourTyler, who, copied, bad), rules. Keep each under about 60 characters: the line slot is one row on a phone. Tests assert a few of the current strings (untap, allDone, timerEnd, missedDay, unlock, shareDone, the first rule, the check-in answers); change those tests in the same commit.
3. **Lighthouse** on the live URL (see Verified).
4. **On the phone**: open the live URL in Safari, Share, Add to Home Screen; tap once to open the sound gate.
