# Economy

Krill is the club's one currency. This page is the model behind its
numbers: what earns it, what a steady person makes in a month and a year,
and what the dock costs. The rules live in
[`src/store/krill.ts`](../src/store/krill.ts), the prices in
[`src/scene/dock/index.ts`](../src/scene/dock/index.ts), and
[`tests/e2e/krill.e2e.ts`](../tests/e2e/krill.e2e.ts) holds the
calibration below as a test.

## The principle

Earned, never bought, never lost. There is no way to pay for krill, no way
to lose it, and nothing that runs out. A missed day earns nothing and takes
nothing.

Nothing earned is stored. Like the finds, krill is worked out from the
days, so it can never disagree with them. Only purchases are kept, each
with the price paid then. The balance is earned minus spent, and never
below nothing: if a done is taken back after something was bought, the
balance stops at zero instead of going into debt.

## What earns it

| What                                                                            | Krill                  |
| ------------------------------------------------------------------------------- | ---------------------- |
| A thing done (and counted) on a day                                             | 10                     |
| Each minute of a lock-in that ran to its end                                    | 1, up to 120 a session |
| A session that was left, before 0.11                                            | half its minutes       |
| Every thing planned that day, done                                              | 25                     |
| A good week: 80 % or more of its planned thing-days done, once the week is over | 50                     |
| The first week’s set: the first seven days with something done, once            | 100                    |
| Welcome back after a break (0.15)                                               | 20                     |

A thing that is not planned on a day (a day off) neither earns nor costs.
"All done" counts only what was planned that day, the same rule the whale
uses.

## The steady person

The brief's calibration: three things, one of them a 30-minute lock-in,
each done four days in five (on different days), aims at about 2,000 a
month and 25,000 a year.

| Person                        |   A month |     A year | Of the year: dones | minutes | all done | good weeks | first week |
| ----------------------------- | --------: | ---------: | -----------------: | ------: | -------: | ---------: | ---------: |
| Every day                     |     2,850 |     33,725 |             10,950 |  10,950 |    9,125 |      2,600 |        100 |
| **Steady, four days in five** | **1,990** | **22,870** |              8,760 |   8,760 |    3,650 |      1,600 |        100 |
| Two days in three             |     1,300 |     14,690 |              7,300 |   7,290 |        0 |          0 |        100 |

The steady person lands a little under the brief's numbers on purpose:
welcome back (0.15) and the occasional all-done day push a real year
toward 25,000, and it is easier to add a reward later than to take one
back. Someone who shows up two days in three still earns more than half as
much: the gap is the all-done and good-week bonuses, which reward finishing
without punishing anyone.

## What the dock costs

| Tier               |  Items | Price range      | All of the tier |
| ------------------ | -----: | ---------------- | --------------: |
| Small              |     10 | 150 to 400       |           2,440 |
| Middling           |     10 | 800 to 2,000     |          13,300 |
| Large              |      8 | 3,000 to 6,000   |          30,200 |
| Legendary          |      2 | 10,000 to 12,000 |          22,000 |
| **The whole dock** | **30** |                  |      **67,940** |

For the steady person that reads as:

- a small thing every few days in the first weeks, so the dock is alive
  from the start;
- a middling thing every week or three;
- a large thing a season;
- the whole dock in about three years.

A first year buys every small and middling thing and two or three large
ones, or saves for one legendary. The brief asked for both "a year of
steady krill" and the four price ranges it named; the two cannot both hold
(the ranges alone add up to about three years), so the ranges were kept,
because they are what the person feels at the dock. The legendary tier is
deliberately far: a goal that still means something in the second year.

## No chance, ever

Every price is fixed and shown. Nothing is random, nothing is in a box,
nothing is "limited" or on a timer, and nothing is sold that changes how
the game plays: the dock only sells things to look at. The red jacket is
never sold; it stays the 90-day find.
