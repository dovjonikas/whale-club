# Good morning

You went to sleep after a night shift; the sea had one too. Here is what
happened while you were away, in plain words.

## What changed

**It looks calmer and more finished.** I went through every screen and
every card the app has (54 of them, on a big phone and a small one),
pictured each one, and fixed what looked loose: the line for the day and
the "one good thing" card are no taller than their words now, with "ok"
and "send this" right under them. Every card above the row is built the
same way and keeps its buttons in the same order. The club menu is quiet
now: the rules are at reading size, numbered, with the club's line at the
end like a signature. On a small phone nothing runs off the edge any more.
The before and after pictures are in [docs/audit](audit/README.md).

**Four new things.** I looked at what people love in many kinds of apps
and games (habit trackers, journals, sleep and breathing apps, pet
companions, running apps, cozy games, year-in-review stories) and picked
the four that fit the sea best:

- **The museum.** Your collection is a museum now. Tap any find and it
  opens in its own case, large, with a line about itself (silly and warm),
  the day it came and whose day it was.
- **The month's tide.** At the start of a month, last month comes back in
  a few short cards: the days with a star, the lanterns, the best week, the
  newest find, one true thing about the month, and which sea creature you
  were. The log keeps every month's tide to watch again.
- **Drift.** A new word in the club. Everything fades away and only the sea
  stays, with its creatures and visitors and, if sound is on, the quiet
  surf. Tap anywhere to come back. For the evenings you just want to be
  there.
- **The night swim.** Each night the whale swims somewhere real: a bay that
  glows, a kelp forest, the deepest trench. The first time you open the app
  in the morning, after the check-in, it tells you where it went and one
  true thing about the place.

## Try these first

1. **Open the app this morning.** "What's new" opens once, with a "try it"
   for each new thing. After the check-in, the whale tells you where it
   swam last night.
2. **Tap a find in the museum** (the star at the top). Read a few plaques.
3. **The club, then "drift".** Put the phone down for a minute.
4. **The log: watch a month's tide.** It works for this month so far, too;
   on the 1st of November, October's will be offered by itself.

## What waits for you

- **The words.** Every new line is a draft in your voice's place, marked
  for you to change: the 88 museum plaques
  (`src/scene/collectibles/museum.ts`), and the tide, drift, the swim and
  what's new (`src/voice.ts`). The places the whale swims to are real, and
  each line about them is true; keep them true if you change them.
- **The next ideas.** [docs/IDEAS.md](IDEAS.md) has seventeen candidates,
  each written as what it does and why people love it. The ones I would
  build next, in order: a letter to your future self that comes back in a
  bottle; "breathe first" before a lock-in; a long swim along a real whale
  migration; a short story of the whale, one paragraph per star day, if you
  would like to write it. They are yours to choose.
- **One thing I changed from your list.** You suggested "breathe first";
  the research said the whale coming back with a story would delight more,
  so I built that instead and left "breathe first" at the top of the list
  for you. And your example for the tide ("on days you ran, you said
  good!!! more often") cannot be true, because the check-in's answers are
  always the same happy ones. The tide only says things the days prove.

Everything is tested on three phones' worth of screens, and it is live at
the usual address.
