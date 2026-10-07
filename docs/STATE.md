# State

## Done

v0.4.0, live at https://dovjonikas.github.io/whale-club/ after the push.

- **Docs**: DESIGN, COLLECTIBLES, DECISIONS, ARCHITECTURE, RESEARCH-SEA, RESEARCH-DOPAMINE.
- **Scaffold**: Vite + strict TypeScript, type-checked ESLint + Prettier, MIT, CHANGELOG, GitHub Actions (lint + build + e2e, deploy only on push to main), Playwright on iPhone 13 / Pixel 5 / 1366x768. GitHub Pages enabled with the Actions source.
- **v0.1.0**: things, tap, timer, week dots, the scene, the sky as a calendar, creatures, PWA, update toast.
- **v0.2.0**: 60 collectibles, Collection, the whale on all done, tappable stars, daily surprise, check-in, recap, sound, share.
- **v0.3.0**: a buddy slot with share codes (removed in v0.4.0).
- **v0.4.0**:
  - postcards replace the buddy: "send the whale" / "send this" after all done, unlock, stage up and the recap; "send the sea" in the header; story 1080x1920 or square 1080x1080, chosen on the first send, changed in the menu; share sheet or download;
  - four header buttons; the menu is the club (three rules, one sentence, postcard size);
  - the app lives in a phone-wide frame, black sides on a desktop;
  - the install leaf waits for the first thing; iPhone gets three big steps;
  - every line after a tap fits one row at 320px (tested); sea facts may wrap (DECISIONS);
  - Lighthouse through Edge on the live URL: mobile 99 / 93 / 100 / 100, desktop 100 / 93 / 100 / 100; the one accessibility finding (a list without items) is fixed.

## Verified

- `npm run lint`, `tsc --noEmit`, `npm run build`: clean.
- `npm test`: 92 passed, 10 skipped (device-specific), on three projects.
- Screenshots regenerated: scene, whale, all done with the postcard button, collection, menu, and both postcards.

## Next

v0.5.0 (the author's brief of 2026-10-07): the crack (collectibles arrive as stones to break), the deeper sky, and lock in as the heart of the app.

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

1. **Voice**: replace every line marked `TODO-VOICE` in `src/voice.ts`. Keep each under about 40 characters so it fits one row on a 320px phone; `tests/e2e/lines.e2e.ts` checks that. Tests assert a few of the current strings (untap, allDone, timerEnd, missedDay, unlock, shareDone, the first rule, the check-in answers, the club sentence); change those tests in the same commit.
2. **On the phone**: open the live URL in Safari, add a thing, tap "show me how" and follow the three steps.
