/**
 * The museum's plaques: one line about every find, the legendaries and the
 * finds half way to them, shown when a find's case is opened in the museum
 * (src/app/museum.ts). Silly and warm, never a hint of what to do. Every
 * line is a draft for the author's own voice (TODO-VOICE); a fact in one
 * (a seahorse father, an octopus's hearts) is a true one.
 */
export const PLAQUES: Readonly<Record<string, string>> = {
  // The sea, line a.
  'sea-a-plankton': 'the smallest lights in the sea, and the first to come.', // TODO-VOICE
  'sea-a-fish': 'swims in circles. calls it exploring.', // TODO-VOICE
  'sea-a-school': 'six fish, one opinion.', // TODO-VOICE
  'sea-a-anchor': 'it stopped here once and never saw a reason to leave.', // TODO-VOICE
  'sea-a-jelly': 'mostly water, entirely glow.', // TODO-VOICE
  'sea-a-dolphin': 'jumps for no reason. this is the reason.', // TODO-VOICE
  'sea-a-lighthouse': 'keeps the light on, in case you come back late.', // TODO-VOICE
  'sea-a-jacket': 'the whale tried it on once. that was that.', // TODO-VOICE
  'sea-a-calf': 'follows the whale everywhere. learning by copying.', // TODO-VOICE
  'sea-a-song': 'a whale song can carry for miles. this one stays here.', // TODO-VOICE
  'sea-a-otter': 'holds its shell like it is the only one. to it, it is.', // TODO-VOICE
  'sea-a-seal': 'has not moved since tuesday. thriving.', // TODO-VOICE
  'sea-a-pod': 'a year of days, swimming in the same direction.', // TODO-VOICE
  // The sea, line b.
  'sea-b-pool': 'a whole sea, small enough to look after.', // TODO-VOICE
  'sea-b-seahorse': 'the father carries the babies. it brings this up often.', // TODO-VOICE
  'sea-b-crab': 'walks sideways. gets there anyway.', // TODO-VOICE
  'sea-b-turtle': 'in no hurry. has never once been in a hurry.', // TODO-VOICE
  'sea-b-jellies': 'two jellyfish, glowing at each other. it is going well.', // TODO-VOICE
  'sea-b-manta': 'glides like it read the instructions for flying.', // TODO-VOICE
  'sea-b-octopus': 'three hearts, and all of them in this.', // TODO-VOICE
  'sea-b-ship': 'it sank. it is fine now. it glows.', // TODO-VOICE
  'sea-b-narwhal': 'the unicorn of the sea, and a little smug about it.', // TODO-VOICE
  'sea-b-deep': 'under the floor, another floor. with lights.', // TODO-VOICE
  'sea-b-puffer': 'round when surprised. you surprise it a lot.', // TODO-VOICE
  'sea-b-coral': 'builds itself a thin layer at a time. sound familiar.', // TODO-VOICE
  'sea-b-orca': 'orcas keep their family close. it counts you.', // TODO-VOICE
  // The sky, line a.
  'sky-a-first': 'got here before the others and is proud of it.', // TODO-VOICE
  'sky-a-constellation': 'seven stars in a shape only you can name.', // TODO-VOICE
  'sky-a-moon': 'a ring of ice round the moon. sailors said rain was coming.', // TODO-VOICE
  'sky-a-shooting': 'make a wish. it has done its part.', // TODO-VOICE
  'sky-a-comet': 'comes back on a schedule. respects that in a person.', // TODO-VOICE
  'sky-a-aurora': 'the sky, slowly changing its mind about green.', // TODO-VOICE
  'sky-a-plane': 'folded by hand, thrown with hope, still going.', // TODO-VOICE
  'sky-a-astronaut': 'wears the red jacket over the suit. regulations unclear.', // TODO-VOICE
  'sky-a-whale-stars': 'a whale made of stars, keeping an eye on the real one.', // TODO-VOICE
  'sky-a-turning': 'the whole sky turns round one star. that star stays put.', // TODO-VOICE
  'sky-a-rocket': 'off somewhere. it said it would write.', // TODO-VOICE
  'sky-a-ringed': 'its rings are mostly ice. very fashionable.', // TODO-VOICE
  'sky-a-galaxy': 'a hundred billion stars, and you added some.', // TODO-VOICE
  // The sky, line b.
  'sky-b-satellite': 'crosses once a minute. just checking on things.', // TODO-VOICE
  'sky-b-planet': 'not a star. does not twinkle. will tell you so.', // TODO-VOICE
  'sky-b-moon2': 'this sky has two moons. nobody here minds.', // TODO-VOICE
  'sky-b-milkyway': 'that faint band is our own galaxy, seen from the inside.', // TODO-VOICE
  'sky-b-fullmoon': 'a road of light on the water, open all night.', // TODO-VOICE
  'sky-b-meteors': 'dust from an old comet, burning up to say hello.', // TODO-VOICE
  'sky-b-owl': 'sees everything. says nothing. blinks, sometimes.', // TODO-VOICE
  'sky-b-balloon': 'the red jacket is the basket. the whale is fine with this.', // TODO-VOICE
  'sky-b-kite': 'flies at night. the string goes somewhere down there.', // TODO-VOICE
  'sky-b-eclipse': 'two seconds of dark, once a week, for the drama.', // TODO-VOICE
  'sky-b-cloud': 'silver at the edges, because the moon is behind it.', // TODO-VOICE
  'sky-b-visitor': 'it waves. wave back.', // TODO-VOICE
  'sky-b-sun': 'after a year of nights, a morning. worth the wait.', // TODO-VOICE
  // The garden, line a.
  'garden-a-sprout': 'small. green. very determined.', // TODO-VOICE
  'garden-a-sunflower': 'young sunflowers follow the sun. this one follows you.', // TODO-VOICE
  'garden-a-bees': 'busy. would like you to know they are busy.', // TODO-VOICE
  'garden-a-field': 'one sunflower told the others.', // TODO-VOICE
  'garden-a-scarecrow': 'has never scared a single crow. wears the jacket well.', // TODO-VOICE
  'garden-a-butterfly': 'lands on your creature like it was always the plan.', // TODO-VOICE
  'garden-a-greenhouse': 'warm inside, glowing at night, open to everyone.', // TODO-VOICE
  'garden-a-tree': 'tall enough for a swing. there will be a swing.', // TODO-VOICE
  'garden-a-fireflies': 'they blink on purpose. it is how they talk.', // TODO-VOICE
  'garden-a-island': 'a second shore. same sea, new view.', // TODO-VOICE
  'garden-a-pond': 'a frog lives here. it has thoughts about the rain.', // TODO-VOICE
  'garden-a-hedgehog': 'out for a walk. no destination. very important.', // TODO-VOICE
  'garden-a-cottage': 'a year of days, and now somewhere to keep them.', // TODO-VOICE
  // The garden, line b.
  'garden-b-mushroom': 'glows at night for reasons it keeps to itself.', // TODO-VOICE
  'garden-b-roses': 'red, of course. a little thorny, also of course.', // TODO-VOICE
  'garden-b-snail': 'going somewhere. it will get there.', // TODO-VOICE
  'garden-b-path': 'stones to nowhere in particular. the best kind of path.', // TODO-VOICE
  'garden-b-bench': 'facing the sea. saved for you.', // TODO-VOICE
  'garden-b-rabbit': 'peeks out, checks you are still here, goes back in.', // TODO-VOICE
  'garden-b-lantern': 'lit at night in case anyone walks by. you did.', // TODO-VOICE
  'garden-b-cat': 'asleep on the bench. it was its bench first.', // TODO-VOICE
  'garden-b-wind': 'the whole garden leans one way, like it heard something nice.', // TODO-VOICE
  'garden-b-treehouse': 'the window lights up. someone small is reading in there.', // TODO-VOICE
  'garden-b-deer': 'stands at the edge of the light, deciding you are nice.', // TODO-VOICE
  'garden-b-well': 'one wish a year. it has been saving up.', // TODO-VOICE
  'garden-b-apple': 'a year of fruit. take one.', // TODO-VOICE
  // The legendaries, and the finds half way to them.
  'legend-whale': 'thirty days of showing up, in gold. heavier than it looks.', // TODO-VOICE
  'rare-scale': 'fell off the golden whale on the way here. it says keep it.', // TODO-VOICE
  'legend-turtle': 'carried a pearl the whole way, slowly, on purpose.', // TODO-VOICE
  'rare-pearl': 'made one thin layer at a time, around something small.', // TODO-VOICE
  'legend-fox': 'a fox with a comet for a tail. arrives fast, stays.', // TODO-VOICE
  'rare-stardust': 'you are made of this too. it checked.', // TODO-VOICE
  'legend-jelly': 'clear as glass. you can see the light right through it.', // TODO-VOICE
  'rare-prism': 'takes one light and makes seven. show-off.', // TODO-VOICE
  'legend-heron': 'stands very still under the moon. learned that from you.', // TODO-VOICE
  'rare-feather': 'light as nothing. kept anyway.', // TODO-VOICE
}
