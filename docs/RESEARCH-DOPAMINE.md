# Whale Club - Dopamine, motivation and retention research

Research notes for the design of Whale Club, a one-screen habit game (night sea, night sky, garden; up to five daily "homework" items; a star per day, creatures from the last 7 days, collectibles at 3/7/14/21/30/45/60/90/120/180 total days, a whale when everything is done, a daily surprise, a silly check-in, a weekly "5/7" recap; a missed day is never punished, the scene only goes quiet).

Conventions used in this document:

- Each claim carries a source. Where a claim is a popular book, a company blog post, an unpublished study or plain folk wisdom rather than peer-reviewed evidence, it is labelled as such.
- "Evidence" means a peer-reviewed paper or meta-analysis. "Book" means a trade book that synthesises evidence but should not be cited as primary. "Practice" means a design heuristic widely used but not formally tested. "Inference" means a recommendation derived from several findings rather than directly tested.
- Nothing in this file is medical advice. Dopamine findings mostly come from animal electrophysiology and human fMRI; applying them to an app is an extrapolation and is marked as such where it matters.

---

## 1. What actually drives dopamine and motivation in habit loops

### 1.1 Reward prediction error (Schultz)

Midbrain dopamine neurons do not fire for reward as such. They fire for reward that is better than predicted, stay flat for reward that is exactly as predicted, and dip below baseline when a predicted reward fails to arrive. Once a cue reliably predicts a reward, the burst moves from the reward to the cue. This is the reward prediction error (RPE) signal, and it is the biological counterpart of temporal-difference learning.

- Evidence: Schultz, Dayan, Montague (1997), "A neural substrate of prediction and reward", Science 275:1593-1599. https://www.gatsby.ucl.ac.uk/~dayan/papers/sdm97.html (summary) and https://www.cs.rochester.edu/~tetreaul/pen5.html
- Consequence for an app: a reward that is fully predictable stops producing a dopamine burst at delivery. The burst moves to the moment the person sees the cue (opening the app, seeing the undone item). A reward that is reliably there but slightly unpredictable in content keeps generating positive prediction errors.

### 1.2 Anticipation versus reward

Two different dopamine modes matter here:

- Phasic bursts at cues and at better-than-expected outcomes (above).
- A slower ramp that rises as an animal gets closer to a known reward. Howe, Tierney, Sandberg, Phillips and Graybiel (2013) measured striatal dopamine in rats running mazes; dopamine ramped up as the animal approached the goal, scaling with both distance and size of the reward. The authors suggest this sustained signal provides motivational drive toward distant goals.
- Evidence: Howe et al. (2013), "Prolonged dopamine signalling in striatum signals proximity and value of distant rewards", Nature 500:575-579. https://www.nature.com/articles/nature12475
- Fiorillo, Tobler and Schultz (2003) also found a sustained dopamine activity that grew from cue to reward time and peaked when reward probability was 50 percent, that is, when uncertainty was highest.
- Evidence: Fiorillo, Tobler, Schultz (2003), "Discrete coding of reward probability and uncertainty by dopamine neurons", Science 299:1898-1902. https://pubmed.ncbi.nlm.nih.gov/12649484/
- Consequence: making progress toward the next unlock visible ("3 more days") taps the ramp; keeping the exact content of a reward uncertain taps the uncertainty signal. Both are extrapolations from animal work.

### 1.3 Variable-ratio reinforcement

Ferster and Skinner (1957) catalogued reinforcement schedules. Variable-ratio schedules (reward after an unpredictable number of responses) produce high, steady response rates with few pauses and are the most resistant to extinction. This is the schedule of slot machines and of pull-to-refresh feeds.

- Evidence: Ferster and Skinner (1957), Schedules of Reinforcement. Full text from the B. F. Skinner Foundation: https://www.bfskinner.org/wp-content/uploads/2015/05/Schedules_of_Reinforcement_PDF.pdf
- Caveat for a habit app: the behaviour we want (do the homework, once a day) is itself fixed-ratio by nature. Variable reinforcement should apply to the content of the reward (what the surprise is), not to whether the person gets credit for showing up. Credit must be certain; the garnish may vary.

### 1.4 Near miss

Clark, Lawrence, Astley-Jones and Gray (2009) showed in a slot-machine fMRI task that near misses were rated less pleasant than full misses yet increased the desire to keep playing, and recruited the same striatal and insula circuitry as wins. The effect only appeared when the person felt personal control over the gamble.

- Evidence: Clark et al. (2009), "Gambling near-misses enhance motivation to gamble and recruit win-related brain circuitry", Neuron 61:481-490. https://pmc.ncbi.nlm.nih.gov/articles/PMC2658737/
- Ethical note: this is a gambling mechanic that works by exploiting an anomaly. Whale Club should not manufacture near misses (for example, "you were 1 minute from a bonus"). The honest cousin of the near miss is simply showing true remaining distance to the next unlock (section 1.2), which motivates without misrepresenting.

### 1.5 Novelty

Bunzeck and Duzel (2006) found that the human substantia nigra / ventral tegmental area (the dopamine source) responds to stimulus novelty itself, scaled by absolute novelty rather than by rarity, emotional valence or task relevance, and that novelty enhanced learning of familiar items presented in the same context.

- Evidence: Bunzeck and Duzel (2006), "Absolute coding of stimulus novelty in the human substantia nigra/VTA", Neuron 51:369-379. https://www.sciencedaily.com/releases/2006/08/060826180547.htm (summary) and https://pmc.ncbi.nlm.nih.gov/articles/PMC2911206 (related work by the same group)
- Consequence: a genuinely new fish or a new sea-fact line each day is a cheap, honest source of dopamine. Recycled surprises lose this.

### 1.6 Effort-based dopamine

Salamone and Correa have shown across many rodent studies that mesolimbic dopamine is needed for the willingness to work for a reward (effort-related choice) rather than for the pleasure of consuming it. Animals with reduced dopamine still like the food; they just stop climbing barriers to get it.

- Evidence: Salamone and Correa (2012), "The mysterious motivational functions of mesolimbic dopamine", Neuron 76:470-485. Related open-access review: https://pmc.ncbi.nlm.nih.gov/articles/PMC5876251
- Inzlicht, Shenhav and Olivola (2018) review the "effort paradox": effort is costly, but outcomes obtained with more effort are valued more, and people sometimes choose options because they are effortful.
- Evidence: Inzlicht, Shenhav, Olivola (2018), "The Effort Paradox: Effort Is Both Costly and Valued", Trends in Cognitive Sciences 22:337-349. https://pmc.ncbi.nlm.nih.gov/articles/6172040/
- Consequence: a 25-minute timer session is a bigger investment than a tap; the reward can be slightly bigger without inflating the economy (section 2, item 9).

### 1.7 "Wanting" versus "liking" (Berridge)

Berridge and Robinson distinguish "wanting" (incentive salience, driven by mesolimbic dopamine, triggered by cues) from "liking" (hedonic impact, mediated by small opioid "hotspots", not dopamine-dependent). Raising dopamine quadrupled rats' wanting of food without changing how much they liked it. The two can come apart: addiction is high wanting with low liking.

- Evidence: Berridge and Robinson (2016), "Liking, wanting, and the incentive-sensitization theory of addiction", American Psychologist 71:670-679. https://pmc.ncbi.nlm.nih.gov/articles/PMC5171207/
- Consequence: a habit app can easily build "wanting" (cue-driven urge to open the app) without "liking" (enjoying the scene). That is what feels compulsive and what people eventually delete. Whale Club's bet is to aim for liking first (a scene that is pleasant to look at and funny to read) and let wanting follow from honest cues, not from streak dread.

### 1.8 Cue -> routine -> reward

Wood and Neal (2007) model habits as associations between a response and the features of the context in which it has repeatedly been performed. Once formed, the context cue triggers the response directly, without a goal having to be active. Habits accrue slowly and do not shift much with one-off counter-habitual acts.

- Evidence: Wood and Neal (2007), "A new look at habits and the habit-goal interface", Psychological Review 114:843-863. https://dornsife.usc.edu/wendy-wood/wp-content/uploads/sites/183/2023/10/wood.neal_.2007psychrev_a_new_look_at_habits_and_the_interface_between_habits_and_goals.pdf
- Gardner, Lally and Wardle (2012) give the practical summary for clinicians: repeat a simple action in a consistent context and the context comes to trigger it. https://pmc.ncbi.nlm.nih.gov/articles/PMC3505409/
- Book: Duhigg, The Power of Habit (2012), popularised "cue, routine, reward". It is a synthesis, not primary evidence.

### 1.9 Implementation intentions

"If situation X, then I do Y" plans. Gollwitzer and Sheeran's meta-analysis of 94 tests found an average effect of d = 0.65 on goal attainment, with benefits for getting started, staying on track and not getting derailed.

- Evidence: Gollwitzer and Sheeran (2006), "Implementation intentions and goal achievement: a meta-analysis of effects and processes", Advances in Experimental Social Psychology 38:69-119. https://kops.uni-konstanz.de/entities/publication/2e749bfb-8533-437c-8203-7e788c910c5f
- Directly relevant HCI evidence: Stawarz, Cox and Blandford (2015) ran a 4-week study and reviewed 115 habit apps. Reminders supported repetition but hindered automaticity; event-based cues ("after breakfast") increased automaticity; positive reinforcement on its own was ineffective. Existing apps focus on self-tracking and reminders and do not support event-based cues.
- Evidence: Stawarz, Cox, Blandford (2015), "Beyond self-tracking and reminders: designing smartphone apps that support habit formation", CHI 2015, pp. 2653-2662. https://discovery.ucl.ac.uk/id/eprint/1468224/
- Consequence: when a person adds a homework item, offering an optional "when" field ("after dinner") is more valuable than a push notification.

### 1.10 The Hook model (Nir Eyal)

Trigger -> Action -> Variable reward -> Investment. The book argues products become habitual when an internal trigger (an emotion) leads to the simplest possible action, followed by a reward that varies, and then an investment by the user that loads the next trigger.

- Book: Eyal, Hooked: How to Build Habit-Forming Products (2014). Summary: https://concepts.dsebastien.net/concept/hook-model/
- Status: a practitioner framework assembled from the evidence above (Skinner, Schultz, Berridge), not itself tested. Its "investment" step maps well to Whale Club (the scene the person has built is the investment); its "variable reward" step should be read with the caveat in 1.3.

### 1.11 Fogg's Tiny Habits

Fogg's Behavior Model: behaviour happens when Motivation, Ability and a Prompt converge (B = MAP). The Tiny Habits recipe is Anchor (an existing routine) -> tiny Behaviour -> immediate Celebration. Fogg argues that making a behaviour easier beats trying to raise motivation, and that an immediate felt celebration is what wires the habit.

- Book: Fogg, Tiny Habits (2019). Model summary: https://www.thebehavioralscientist.com/?p=3058
- Status: Fogg's model is widely used; the "celebration" claim is consistent with the immediacy evidence (Woolley and Fishbach, below) but has not been separately tested at scale in published work as far as this research found.

### 1.12 The fresh start effect

People are more likely to start goal-directed behaviour right after temporal landmarks: a new week, month, year, semester, a birthday. Dai, Milkman and Riis showed this in Google searches for "diet", gym visits and commitment-contract sign-ups.

- Evidence: Dai, Milkman, Riis (2014), "The Fresh Start Effect: Temporal Landmarks Motivate Aspirational Behavior", Management Science 60:2563-2582. https://faculty.wharton.upenn.edu/wp-content/uploads/2014/06/Dai_Fresh_Start_2014_Mgmt_Sci.pdf
- Consequence: a weekly recap that lands on the boundary of a new week is a natural fresh start; so is the first day after a quiet stretch. Frame a return as a new chapter, not as damage control.

### 1.13 Streaks and "don't break the chain"

- Folk origin: "Don't break the chain" is attributed to Jerry Seinfeld in a 2007 Lifehacker post; Seinfeld has since said he did not invent it. It is folk wisdom, not research.
- Evidence that intact streaks motivate: Silverman and Barasch (2023), seven studies. When a log highlighted an intact streak, people engaged more in the behaviour than when the log highlighted a broken streak. People treated keeping the streak as a goal in itself. The negative effect of a broken streak was larger when the person blamed themselves, and was reduced when the streak could be repaired.
- Evidence: Silverman and Barasch (2023), "On or Off Track: How (Broken) Streaks Affect Consumer Decisions", Journal of Consumer Research 49:1095-1117. https://doi.org/10.1093/jcr/ucac029 and https://udspace.udel.edu/handle/19716/34160
- Loss aversion: losses loom roughly twice as large as equivalent gains (Kahneman and Tversky 1979, "Prospect Theory", Econometrica 47:263-291, https://doi.org/10.2307/1914185). A streak counter turns each day into a potential loss, which is why it works and why it hurts.
- Industry data: Duolingo reports that users who reach a 10-day streak are less likely to churn and that streak features (streak freeze, repair, calendar views) were among their most effective retention levers. This is a company blog, not peer review, and Duolingo's business model rewards engagement, not necessarily wellbeing. https://blog.duolingo.com/duolingo-streak-research/
- Downside (practice, widely reported, not well quantified in peer review): "streak anxiety", compulsive checking, and quitting entirely after one miss. Several blog posts cite a "2020 CHI study" with a "63 percent more likely to quit" figure; this research could not locate that paper and the figure should be treated as unverified.
- Key fact: Lally et al. (2010) found that missing a single opportunity did not materially affect habit formation, whether the miss was early or late. https://www.ucl.ac.uk/news/2009/aug/how-long-does-it-take-form-habit
- Consequence: the streak's psychology is real but double-edged. Silverman and Barasch's own data say repairability blunts the damage, and Lally says a miss does not matter to the habit. The design answer is a streak that is visible but small, cannot "die", and whose break is attributed to nothing (the scene goes quiet; no reason is demanded).

### 1.14 The what-the-hell effect and gentle recovery

Polivy and Herman's dieting work showed that the perception of having broken a rule (even when the actual violation was manipulated to be zero) triggers further overeating. It is the belief that one has failed, not the objective lapse, that produces the collapse. In addiction research the same thing is called the abstinence violation effect (Marlatt).

- Evidence summary: https://more.efpsa.org/rpblog/?p=1172 and https://www.spring.org.uk/?p=13881 (both summarise Polivy and Herman's 1985 Psychological Bulletin review "Dieting and binging: a causal analysis" and later experiments)
- Consequence: a punishing visual (a dead tree, a zeroed counter, a red "0") is exactly the "I have failed" signal that triggers the what-the-hell spiral. A quiet sea does not tell the person they failed; it tells them nothing happened.

### 1.15 Self-compassion and resumption

- Adams and Leary (2007): inducing self-compassion in restrained eaters after an unhealthy preload reduced distress and reduced subsequent overeating, that is, it switched off the what-the-hell effect in the lab.
- Evidence: Adams and Leary (2007), "Promoting self-compassionate attitudes toward eating among restrictive and guilty eaters", Journal of Social and Clinical Psychology 26:1120-1144. https://self-compassion.org/wp-content/uploads/publications/breineseatingdisorder.pdf (related) and summary at https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4249830/
- Breines and Chen (2012): across four experiments, a self-compassion induction (versus self-esteem or no treatment) increased the belief that a weakness can be changed, increased motivation to make amends, and increased time spent studying after a failed test.
- Evidence: Breines and Chen (2012), "Self-compassion increases self-improvement motivation", Personality and Social Psychology Bulletin 38:1133-1143. https://pubmed.ncbi.nlm.nih.gov/22645164/
- Consequence: the tone after a missed day should be neutral or kind, never a coach. Deadpan is fine ("The sea was quiet yesterday. It is still here."); scolding is the one thing the evidence says not to do.

### 1.16 The Zeigarnik effect

Zeigarnik (1927) reported that interrupted tasks were remembered about twice as well as completed ones. A 2025 meta-analysis of 37 later studies found no memory advantage for unfinished tasks (ratio 0.99) but did find a reliable tendency to resume interrupted tasks (the Ovsiankina effect).

- Evidence: Ghibellini and Meier (2025), meta-analysis in Humanities and Social Sciences Communications. https://ideas.repec.org/a/pal/palcom/v12y2025i1d10.1057_s41599-025-05000-w.html; overview at https://en.wikipedia.org/wiki/Zeigarnik_effect
- Consequence: the memory claim is folk-level. The resumption tendency is real: an obviously unfinished day (four of five items done, the whale has not surfaced) pulls the person back. Use the Ovsiankina framing, not the Zeigarnik one.

### 1.17 The progress principle (Amabile)

From roughly 12,000 diary entries by 238 knowledge workers, Amabile and Kramer found that the single strongest predictor of a good day at work was making progress in meaningful work, even small progress, and that setbacks hurt more than progress helped.

- Book based on peer-reviewed diary research: Amabile and Kramer, The Progress Principle (2011), Harvard Business Review Press. https://www.goodreads.com/book/show/14596646 (overview); the underlying study is Amabile and Kramer (2007), "Inner work life", Harvard Business Review.
- Consequence: make progress visible every single day, at the smallest grain (one star, one creature). Small wins are the mechanism, not a decoration.

### 1.18 The endowed progress effect

Nunes and Dreze (2006) gave car-wash customers either an 8-stamp card with no stamps or a 10-stamp card with 2 stamps already on it (same 8 washes needed). The pre-stamped group redeemed 34 percent versus 19 percent, and washed more often. Perceived progress toward a goal increases effort.

- Evidence: Nunes and Dreze (2006), "The endowed progress effect: how artificial advancement increases effort", Journal of Consumer Research 32:504-512. Summary: https://www.coglode.com/nuggets/endowed-progress-effect
- Consequence: on day one, the sky should not be empty. One star for signing up and naming the first item is honest endowed progress (they did do something). Likewise, the first collectible at day 3 is close enough to feel already underway.

### 1.19 Collection and completion drives

Barasz, John, Keenan and Norton (2017) showed that merely framing items as a "set" motivates people to complete the set, even with no reward, even at a cost, and even after being told the grouping is arbitrary. The authors explain it through Gestalt perception of incompleteness.

- Evidence: Barasz et al. (2017), "Pseudo-set framing", Journal of Experimental Psychology: General 146:1460-1477. https://chibe.upenn.edu/publications/pseudo-set-framing/
- Consequence: the ten collectibles are a set; the five homework items are a set; the 7 days of the week are a set. Showing the empty slots (silhouettes) is what makes the set feel incomplete.

### 1.20 The IKEA effect

Norton, Mochon and Ariely (2012): people value things they assembled themselves more than identical things assembled by others, and expect others to share the valuation. The effect only holds when the build is completed; destroying or failing to finish it removes the effect.

- Evidence: Norton, Mochon, Ariely (2012), "The IKEA effect: when labor leads to love", Journal of Consumer Psychology 22:453-460. https://dash.harvard.edu/handle/1/12136084
- Consequence: the scene the person has built (their sky, their garden) becomes something they value disproportionately. This is the retention engine of Whale Club and also why destroying it (Forest's dead tree) is so costly: the evidence says the valuation dissipates when the build is destroyed.

### 1.21 Social accountability (buddy)

- Matthews (Dominican University of California): 149 completers randomly assigned to five conditions. Writing goals helped; sharing commitments with a friend helped more; sending weekly progress reports to a friend helped most (more than 70 percent achieved versus 35 percent for unwritten goals). This study was published as a university research summary, not in a peer-reviewed journal; treat the exact percentages as indicative.
- Source: https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf
- Self-determination theory lists relatedness as one of three basic needs alongside autonomy and competence (Ryan and Deci 2000, American Psychologist 55:68-78). https://en.wikipedia.org/wiki/Self-determination_theory
- Caution: Zuckerman and Gal-Oz (2014) found that adding virtual rewards and social comparison to a step-counting app made it no more effective than the plain quantified version. Social comparison is not free motivation.
- Evidence: Zuckerman and Gal-Oz (2014), "Deconstructing gamification", Personal and Ubiquitous Computing 18:1705-1719. https://runi.ac.il/media/whrh3e33/deconstructing-gamification.pdf
- Consequence: an optional buddy who sees your "5/7" recap (not a leaderboard) is the evidence-compatible version. See section 4 for the comparison pitfall.

### 1.22 Identity-based habits (Clear)

Clear argues that durable habits come from identity ("I am a person who shows up") rather than outcomes, and that "every action is a vote for the type of person you wish to become".

- Book: Clear, Atomic Habits (2018). https://en.wikiquote.org/wiki/James_Clear
- Status: a synthesis; the closest evidence is self-perception theory (Bem 1972) and work on identity and health behaviour. Label as book-level.
- Consequence: Whale Club's name is an identity ("you are in the club"). The club has no ranks.

### 1.23 Temptation bundling

Milkman, Minson and Volpp (2014) let people listen to tempting audiobooks only at the gym. Gym visits rose 51 percent (full restriction) and 29 percent (encouraged restriction) versus control, though the effect faded over the term; 61 percent were willing to pay for the restriction device.

- Evidence: Milkman, Minson, Volpp (2014), "Holding the Hunger Games hostage at the gym: an evaluation of temptation bundling", Management Science 60:283-299. https://repository.upenn.edu/oid_papers/150
- Consequence: the daily surprise and the check-in are small bundled pleasures that only exist after the homework. Keep them behind the tap, never before it.

### 1.24 How long a habit takes to form

Lally, van Jaarsveld, Potts and Wardle (2010) had 96 volunteers repeat a chosen behaviour daily in the same context for 12 weeks and fit automaticity curves. Median time to the automaticity plateau was 66 days; the range across people was 18 to 254 days. Simpler behaviours (drinking a glass of water) plateaued faster than exercise. Missing a single day did not matter; being very inconsistent did.

- Evidence: Lally et al. (2010), "How are habits formed: Modelling habit formation in the real world", European Journal of Social Psychology 40:998-1009. https://openresearch.surrey.ac.uk/esploro/outputs/99783513802346; plain summary at https://www.thebehavioralscientist.com/articles/how-long-to-form-a-habit
- The "21 days" figure is folklore traced to a plastic surgeon's remark (Maltz, 1960) and has no data behind it.
- Consequence: the unlock ladder (3, 7, 14, 21, 30, 45, 60, 90, 120, 180) brackets the 18-254 range. The 60-day tier sits near the median and deserves to be the "big" one in the scene. Nothing in the app should imply the habit is "done" at 21 or 30.

### 1.25 Immediate rewards beat delayed ones

Woolley and Fishbach (2017), five studies: the presence of immediate rewards (enjoyment in the moment) predicted persistence at New Year's resolutions, studying and exercising; delayed rewards did not, even though people said they were pursuing the activity for the delayed reward.

- Evidence: Woolley and Fishbach (2017), "Immediate rewards predict adherence to long-term goals", Personality and Social Psychology Bulletin 43:151-162. https://www.chicagobooth.edu/media-relations-and-communications/press-releases/implement-immediate-rewards-as-you-pursue-that-long-term-goal
- This is the evidence behind "the reward arrives within a second of the tap".

### 1.26 Rituals

Brooks and colleagues (2016) found that performing a short sequence of actions labelled as a "ritual" before a stressful task reduced anxiety and improved performance, and that the same actions described as "random behaviours" did not help as much. Belief that it is a ritual matters.

- Evidence: Brooks, Schroeder, Risen, Gino, Galinsky, Norton, Schweitzer (2016), "Don't stop believing: rituals improve performance by decreasing anxiety", Organizational Behavior and Human Decision Processes 137:71-85. https://ideas.repec.org/a/eee/jobhdp/v137y2016icp71-85.html
- This supports the silly daily check-in as a ritual (section 2, item 12).

---

## 2. Design recommendations for Whale Club

Each item: the recommendation, then the rationale and source.

1. Make the reward arrive within one second of the tap, and the first visible response within 100 ms.
   Rationale: 0.1 s is the limit for feeling the system reacted instantly; 1 s is the limit for keeping the flow of thought (Nielsen 1993, drawing on Miller 1968 and Card et al. 1991, https://nngroup.com/articles/response-times-3-important-limits). Immediate rewards predict persistence where delayed ones do not (Woolley and Fishbach 2017). Fogg's "celebrate immediately" is the same idea at book level.

2. The tap must feel physically responsive: a sound and a motion start within 100 ms, before any network or save completes.
   Rationale: Nielsen's 100 ms threshold (above). Practice, not separately tested for habit apps: optimistic UI (update the scene first, persist after) is the standard technique. Keep the sound short and the motion under about 300 ms so five taps in a row do not feel laggy.

3. Credit for showing up is always certain; only the garnish varies.
   Rationale: variable-ratio schedules produce the highest, most extinction-resistant responding (Ferster and Skinner 1957), but a daily habit must not be gambled. Put the variability into the surprise (which fish, which fact) and keep the star deterministic. This also respects RPE: a star that is always there carries no burst, so the surprise is what delivers the positive prediction error (Schultz 1997).

4. Vary the daily surprise and never repeat one until the pool is exhausted; prefer content that is genuinely new to the person.
   Rationale: the dopamine midbrain codes absolute novelty, not relative rarity (Bunzeck and Duzel 2006). A recycled fish is not novel. A sea fact the person has not read is.

5. Show the next locked collectible as a silhouette with the true number of days remaining.
   Rationale: endowed progress (Nunes and Dreze 2006) and pseudo-set completion (Barasz et al. 2017) both rely on seeing the empty slot. The proximity ramp (Howe et al. 2013) depends on the distance being perceptible. Show real distance, never a fabricated near miss (Clark et al. 2009 is a warning, not a recipe).

6. Space unlock tiers so that from any point there is one within roughly two weeks.
   Rationale: the ladder 3, 7, 14, 21, 30, 45, 60, 90, 120, 180 has gaps of 4, 7, 7, 9, 15, 15, 30, 30, 60 days. The gaps up to day 60 fit the two-week rule. Beyond 60 the gaps widen to 30 and 60 days; the intermediate motivation there should come from the 7-day creature cycle and the weekly recap rather than from new tiers. Rationale for a near horizon: the dopamine ramp scales with proximity (Howe 2013); goal-gradient behaviour (Nunes and Dreze 2006) accelerates near a goal. Inference: if long-tail retention is weak between 60 and 180, consider a 75 and a 150 tier, or a non-tier reward (a rare fish) at those points.

7. Recap weekly as "5/7", never as "you missed 2".
   Rationale: the what-the-hell effect is triggered by the belief of having failed, not by the objective lapse (Polivy and Herman). Self-compassion inductions restore motivation after a lapse where self-criticism does not (Breines and Chen 2012; Adams and Leary 2007). "5/7" is a count of what happened; "missed 2" is an accusation. A new week is also a fresh start landmark (Dai, Milkman, Riis 2014), so the recap should read as the opening of a chapter.

8. Keep a streak visible but small, and let it be repairable or at least non-fatal.
   Rationale: intact streaks motivate (Silverman and Barasch 2023), but the same paper shows the damage from a break is reduced when the streak can be repaired and amplified when the person blames themselves. One miss does not affect habit formation (Lally 2010). So: show the run of consecutive days in small type in a corner of the sky; never show it as the headline number; let the total-days count (which cannot go down) be the number that drives unlocks. Loss aversion (Kahneman and Tversky 1979) is a reason to keep the streak small, not to delete it.

9. Give timer sessions a slightly bigger reward than a tap (for example, a rarer fish or a brighter star), but not a different currency.
   Rationale: effort adds value to the outcome and dopamine supports effort-related choice (Salamone and Correa 2012; Inzlicht et al. 2018). The IKEA effect requires completed labour (Norton et al. 2012), and a finished timer is completed labour. Keep it slight: a large difference would turn taps into "lesser" check-ins and pressure people toward timers they do not need.

10. Nothing dies. A missed day makes the sea quiet for a day; nothing is removed.
    Rationale: Forest's mechanic (the tree withers if you leave the app) uses loss aversion deliberately (https://en.wikipedia.org/wiki/Forest_(application)). Loss aversion works for a single 25-minute session, which is Forest's use case. For a months-long habit the evidence points the other way: a visible failure signal starts the what-the-hell spiral (Polivy and Herman), destroying a built thing removes the IKEA valuation (Norton et al. 2012, the "destroyed creation" condition), a self-attributed break reduces subsequent engagement (Silverman and Barasch 2023), and a single miss is irrelevant to habit formation anyway (Lally 2010). Inference: long-term retention is better served by preserving the person's investment than by threatening it. This has not been tested head-to-head in a published study; it is the most defensible reading of the evidence.

11. Resuming after a quiet day must be the easiest action on screen.
    Rationale: Fogg's model says raise ability rather than motivation (book); Stawarz et al. (2015) found that cue support beats reminders. Concretely: on return, the homework list is already open, the first item is one tap away, there is no "welcome back" modal, no "what happened?" prompt and no summary of what was missed. The self-compassion evidence (Breines and Chen 2012) says a neutral re-entry restores motivation; an interrogation does not.

12. Keep the silly check-in as a fixed call-and-response ritual, two to five seconds, every day, with the same shape and varying content.
    Rationale: actions framed as a ritual reduce anxiety and improve performance versus the same actions framed as random (Brooks et al. 2016). The ritual also serves as the "anchor" in Fogg's recipe and as the cue in Wood and Neal's context model: the same shape every day is what lets it become automatic. Deadpan content keeps "liking" high (Berridge) without coaching.

13. Use the scene as the calendar: a star per day in the sky, creatures from the last 7 days, no bar chart.
    Rationale: progress must be visible at the smallest grain (Amabile and Kramer) and the person must perceive distance to the next goal (Howe 2013; Nunes and Dreze 2006). The scene is also the person's own build, which the IKEA effect makes them value (Norton et al. 2012). Inference: a graph reports; a scene belongs to someone. The last-7-days creature window gives a rolling, forgiving measure where a quiet day thins the water rather than zeroing anything.

14. Make the whale conditional on all items for the day, and let it surface with a sound.
    Rationale: the five items are a pseudo-set (Barasz et al. 2017); the whale is the completion marker, and the resumption tendency (Ovsiankina, confirmed by Ghibellini and Meier 2025) pulls people back for the fourth and fifth tap. Keep the whale rare enough to be a positive prediction error on incomplete days and certain on complete ones.

15. Offer an optional "when" for each item ("after dinner") instead of a push notification.
    Rationale: implementation intentions d = 0.65 (Gollwitzer and Sheeran 2006); event-based cues increased automaticity while reminders hindered it (Stawarz et al. 2015).

16. Endow a little progress on day one: the first star appears when the first item is named.
    Rationale: Nunes and Dreze (2006). It is honest (they did do something) and it makes the day-3 collectible feel already underway.

17. Start the ladder at day 3 and make day 7 a visible landmark.
    Rationale: Duolingo reports a 10-day streak as a churn inflection (company blog, not peer review); the first week is the usual drop-off window in habit apps (practice). An early unlock gives the first completion-point before interest fades.

18. Keep the weekly recap private by default; if a buddy is added, they see only "5/7" and the whale count, never a comparison.
    Rationale: accountability to a friend raised goal achievement in Matthews' study (university summary, not peer-reviewed); social comparison added nothing over plain measurement in Zuckerman and Gal-Oz (2014) and leaderboards reduced motivation in Hanus and Fox (2015). Relatedness without ranking.

19. Ethics line: no dark patterns, no nagging notifications, no fake scarcity, no manufactured near misses, no "your whale will leave".
    Rationale: Gray et al. (2018) taxonomy of dark patterns (nagging, obstruction, sneaking, interface interference, forced action), https://www.deceptive.design/articles/the-dark-patterns-side-of-ux-design. Pielot et al. (2014) found about 63 notifications per day already and that more notifications correlated with more negative emotion (https://ic.unicamp.br/~oliveira/doc/MHCI2014_An-in-situ-study-of-mobile-phone-notifications.pdf). The wanting/liking split (Berridge) is the mechanism by which dark patterns produce compulsive use people do not enjoy; a public, small habit game should not be in that business. If notifications exist at all, they are opt-in, one per day at most, at the person's chosen "when", and they stop after a quiet week rather than escalate.

20. Say "66 days, give or take a lot" nowhere in the UI, but design for it.
    Rationale: the Lally range is 18 to 254 days. The app should not promise a date; the 60-day collectible should simply be the one the scene makes a fuss over.

---

## 3. Ten highest-leverage mechanics, ranked

1. Instant, certain, tiny reward on every tap (star, sound, motion under 100 ms). Immediate reward is the strongest predictor of persistence (Woolley and Fishbach 2017); credit must never be gambled (Skinner; Schultz).
2. Nothing dies; a quiet day instead of a failure signal. Removes the what-the-hell trigger (Polivy and Herman) and preserves the IKEA valuation (Norton et al. 2012); a single miss is irrelevant to habit formation (Lally 2010).
3. The scene as the person's own build (sky, creatures, garden). The IKEA effect makes self-made things disproportionately valued and is the retention engine.
4. Next collectible shown as a silhouette with true distance. Pseudo-set completion (Barasz 2017), endowed progress (Nunes and Dreze 2006) and the dopamine proximity ramp (Howe 2013) in one widget.
5. Daily novel surprise behind the tap. Absolute novelty drives the dopamine midbrain (Bunzeck and Duzel 2006); variable content keeps positive prediction errors alive (Schultz 1997); temptation bundling keeps it behind the homework (Milkman 2014).
6. The whale as a daily set-completion marker. The resumption tendency (Ovsiankina, Ghibellini and Meier 2025) pulls people back for the last item.
7. Weekly "5/7" recap at the week boundary. A fresh-start landmark (Dai, Milkman, Riis 2014) framed without blame (Breines and Chen 2012).
8. The silly fixed-shape check-in ritual. Rituals reduce anxiety and improve performance (Brooks et al. 2016) and act as the context cue (Wood and Neal 2007).
9. Optional "when" (implementation intention) per item instead of reminders. d = 0.65 (Gollwitzer and Sheeran 2006); event cues beat reminders for automaticity (Stawarz 2015).
10. Small, non-fatal streak plus an un-droppable total-days count. Intact streaks motivate (Silverman and Barasch 2023); keeping it small and repairable limits loss-aversion damage.

Not in the top ten on purpose: leaderboards, push notifications, points or coins, and any mechanic that reduces what the person already has.

---

## 4. Pitfalls to avoid

### 4.1 Reward inflation

If every day gets a bigger reward than the last, or if rewards are handed out for opening the app, the prediction error goes to zero (Schultz 1997) and the economy has to keep escalating to produce any burst. Keep the star constant, the surprise novel, and the collectibles rare. Do not add a second currency.

- Evidence: Schultz, Dayan, Montague (1997), above. Practice: this is the well-known "reward treadmill" of free-to-play games.

### 4.2 Extrinsic rewards crowding out intrinsic motivation (overjustification)

Deci, Koestner and Ryan's meta-analysis of 128 experiments found that expected, tangible, contingent rewards significantly reduced free-choice intrinsic motivation (d about -0.28 to -0.40 depending on contingency). Gneezy and Rustichini (2000) found that paying a small amount for a task people were doing for free reduced effort ("pay enough or don't pay at all"). Hanus and Fox (2015) found that adding badges and a leaderboard to an already interesting course lowered motivation, satisfaction and exam scores over a semester, with the authors describing the mechanics as feeling "controlling".

- Evidence: Deci, Koestner, Ryan (1999), Psychological Bulletin 125:627-668. https://www.selfdeterminationtheory.org/SDT/documents/2001_DeciKoestnerRyan.pdf (2001 follow-up with the same authors and data)
- Evidence: Gneezy and Rustichini (2000), Quarterly Journal of Economics 115:791-810. https://www.gwern.net/doc/economics/2000-gneezy.pdf
- Evidence: Hanus and Fox (2015), "Assessing the effects of gamification in the classroom", Computers & Education 80:152-161. https://www.smhp.psych.ucla.edu/pdfdocs/gamil.pdf
- Counterweight: Sailer and Homner's meta-analysis (2020) finds small positive effects of gamification on cognitive (g = 0.49), motivational (g = 0.36) and behavioural (g = 0.25) outcomes, with the motivational and behavioural effects less stable under rigorous designs. https://link.springer.com/article/10.1007/S10648-019-09498-W
- For Whale Club: the homework items are chores the person has already decided to do; the risk of crowding out is lower than for an intrinsically interesting activity. Even so, keep rewards informational (the scene reflects what happened) rather than controlling (you must do X to get Y). Verbal and informational feedback did not undermine intrinsic motivation in the Deci meta-analysis; tangible controlling rewards did.

### 4.3 Streak anxiety

Intact streaks help, broken ones hurt, and self-blame makes the hurt worse (Silverman and Barasch 2023). Loss aversion means the counter's threat outweighs its promise (Kahneman and Tversky 1979). Apple's rings and Snapchat's streaks are the usual examples of streaks that produce guilt and compulsive checking; that is widely reported in the press but not well quantified in peer review. Mitigation: the total-days count never drops; the streak is small; a quiet day is not called a break; a return is a fresh start.

### 4.4 Notification fatigue

People already receive about 63 notifications a day, view them within minutes regardless of silent mode, and more notifications correlated with more negative emotion (Pielot et al. 2014). Reminders supported repetition but hindered automaticity (Stawarz et al. 2015). Nagging is a named dark pattern (Gray et al. 2018). Mitigation: no notifications by default; if opted in, one per day at the person's chosen time; silence after a quiet week; never "your streak is about to die".

### 4.5 Discouraging social comparison

Leaderboards lowered motivation over a semester (Hanus and Fox 2015). Social comparison added nothing over plain measurement in a fitness app (Zuckerman and Gal-Oz 2014). Festinger's social comparison theory (1954) predicts that upward comparison on a dimension where one is behind is demotivating. Mitigation: no ranks, no "friends did 7/7", only an optional buddy who sees your own recap.

### 4.6 Building wanting without liking

The compulsive-but-joyless pattern is the signature of incentive sensitisation (Berridge and Robinson 2016). It is also what gets apps deleted. If people open Whale Club out of dread, the design has failed even if retention looks fine for a quarter. Mitigation: the scene must be worth looking at on a day with nothing to do; the deadpan tone must be funny, not coaching.

### 4.7 Promising a date

"21 days" has no data behind it; the real range is 18 to 254 days (Lally 2010). Any UI copy that implies the habit is formed at a tier is a setup for a what-the-hell lapse at day 22.

### 4.8 Manufactured near misses and fake scarcity

Near misses recruit win circuitry and increase play despite being unpleasant (Clark et al. 2009); that is a gambling exploit. Fake scarcity ("only today!") is "sneaking" in the dark-patterns taxonomy (Gray et al. 2018). Neither belongs in a habit game for homework.

---

## 5. Source index

Peer-reviewed (alphabetical):

- Adams and Leary (2007), J Social and Clinical Psychology 26:1120-1144.
- Barasz, John, Keenan, Norton (2017), J Experimental Psychology: General 146:1460-1477. https://chibe.upenn.edu/publications/pseudo-set-framing/
- Berridge and Robinson (2016), American Psychologist 71:670-679. https://pmc.ncbi.nlm.nih.gov/articles/PMC5171207/
- Breines and Chen (2012), Personality and Social Psychology Bulletin 38:1133-1143. https://pubmed.ncbi.nlm.nih.gov/22645164/
- Brooks et al. (2016), Organizational Behavior and Human Decision Processes 137:71-85. https://ideas.repec.org/a/eee/jobhdp/v137y2016icp71-85.html
- Bunzeck and Duzel (2006), Neuron 51:369-379. https://www.sciencedaily.com/releases/2006/08/060826180547.htm
- Clark, Lawrence, Astley-Jones, Gray (2009), Neuron 61:481-490. https://pmc.ncbi.nlm.nih.gov/articles/PMC2658737/
- Dai, Milkman, Riis (2014), Management Science 60:2563-2582. https://faculty.wharton.upenn.edu/wp-content/uploads/2014/06/Dai_Fresh_Start_2014_Mgmt_Sci.pdf
- Deci, Koestner, Ryan (1999), Psychological Bulletin 125:627-668. https://www.selfdeterminationtheory.org/SDT/documents/2001_DeciKoestnerRyan.pdf
- Fiorillo, Tobler, Schultz (2003), Science 299:1898-1902. https://pubmed.ncbi.nlm.nih.gov/12649484/
- Gardner, Lally, Wardle (2012), British J General Practice 62:664-666. https://pmc.ncbi.nlm.nih.gov/articles/PMC3505409/
- Ghibellini and Meier (2025), Humanities and Social Sciences Communications. https://ideas.repec.org/a/pal/palcom/v12y2025i1d10.1057_s41599-025-05000-w.html
- Gneezy and Rustichini (2000), Quarterly J Economics 115:791-810. https://www.gwern.net/doc/economics/2000-gneezy.pdf
- Gollwitzer and Sheeran (2006), Advances in Experimental Social Psychology 38:69-119. https://kops.uni-konstanz.de/entities/publication/2e749bfb-8533-437c-8203-7e788c910c5f
- Gray, Kou, Battles, Hoggatt, Toombs (2018), CHI 2018 paper 534. https://www.deceptive.design/articles/the-dark-patterns-side-of-ux-design
- Hanus and Fox (2015), Computers & Education 80:152-161. https://www.smhp.psych.ucla.edu/pdfdocs/gamil.pdf
- Howe, Tierney, Sandberg, Phillips, Graybiel (2013), Nature 500:575-579. https://www.nature.com/articles/nature12475
- Inzlicht, Shenhav, Olivola (2018), Trends in Cognitive Sciences 22:337-349. https://pmc.ncbi.nlm.nih.gov/articles/6172040/
- Kahneman and Tversky (1979), Econometrica 47:263-291. https://doi.org/10.2307/1914185
- Lally, van Jaarsveld, Potts, Wardle (2010), European J Social Psychology 40:998-1009. https://openresearch.surrey.ac.uk/esploro/outputs/99783513802346
- Milkman, Minson, Volpp (2014), Management Science 60:283-299. https://repository.upenn.edu/oid_papers/150
- Norton, Mochon, Ariely (2012), J Consumer Psychology 22:453-460. https://dash.harvard.edu/handle/1/12136084
- Nunes and Dreze (2006), J Consumer Research 32:504-512. https://www.coglode.com/nuggets/endowed-progress-effect (summary)
- Pielot, Church, de Oliveira (2014), MobileHCI 2014. https://ic.unicamp.br/~oliveira/doc/MHCI2014_An-in-situ-study-of-mobile-phone-notifications.pdf
- Polivy and Herman (1985), Psychological Bulletin 97:193-201; summary https://more.efpsa.org/rpblog/?p=1172
- Ryan and Deci (2000), American Psychologist 55:68-78. https://en.wikipedia.org/wiki/Self-determination_theory
- Sailer and Homner (2020), Educational Psychology Review 32:77-112. https://link.springer.com/article/10.1007/S10648-019-09498-W
- Salamone and Correa (2012), Neuron 76:470-485; related review https://pmc.ncbi.nlm.nih.gov/articles/PMC5876251
- Schultz, Dayan, Montague (1997), Science 275:1593-1599. https://www.gatsby.ucl.ac.uk/~dayan/papers/sdm97.html
- Silverman and Barasch (2023), J Consumer Research 49:1095-1117. https://doi.org/10.1093/jcr/ucac029
- Stawarz, Cox, Blandford (2015), CHI 2015 pp. 2653-2662. https://discovery.ucl.ac.uk/id/eprint/1468224/
- Wood and Neal (2007), Psychological Review 114:843-863. https://dornsife.usc.edu/wendy-wood/wp-content/uploads/sites/183/2023/10/wood.neal_.2007psychrev_a_new_look_at_habits_and_the_interface_between_habits_and_goals.pdf
- Woolley and Fishbach (2017), Personality and Social Psychology Bulletin 43:151-162. https://www.chicagobooth.edu/media-relations-and-communications/press-releases/implement-immediate-rewards-as-you-pursue-that-long-term-goal
- Zuckerman and Gal-Oz (2014), Personal and Ubiquitous Computing 18:1705-1719. https://runi.ac.il/media/whrh3e33/deconstructing-gamification.pdf

Books and practitioner sources (not primary evidence):

- Amabile and Kramer, The Progress Principle (2011), HBR Press.
- Clear, Atomic Habits (2018).
- Duhigg, The Power of Habit (2012).
- Eyal, Hooked (2014).
- Ferster and Skinner, Schedules of Reinforcement (1957). https://www.bfskinner.org/wp-content/uploads/2015/05/Schedules_of_Reinforcement_PDF.pdf
- Fogg, Tiny Habits (2019).
- Nielsen, "Response Times: The 3 Important Limits" (1993). https://nngroup.com/articles/response-times-3-important-limits
- Duolingo blog, "How Duolingo's streak works" and related posts. https://blog.duolingo.com/duolingo-streak-research/
- Matthews, Dominican University goals study summary (unpublished). https://www.dominican.edu/sites/default/files/2020-02/gailmatthews-harvard-goals-researchsummary.pdf
- Forest app description. https://en.wikipedia.org/wiki/Forest_(application)

Claims labelled as folk wisdom or unverified in this document: "don't break the chain" (Seinfeld), "21 days to form a habit" (Maltz), the "63 percent more likely to quit after one miss" figure, Fogg's celebration mechanism as a standalone effect, Clear's identity framing, and the inference that "nothing dies" beats punishment for long-term retention (derived, not directly tested).
