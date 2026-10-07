# Changelog

All notable changes, newest first. Versions follow `package.json`.

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
