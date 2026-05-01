'use strict';

// ============================================================
// CONSTANTS
// ============================================================
const BOARD_RADIUS = 3;
const HEX_SIZE     = 36;  // flat-top: distance from center to corner

const SQRT3 = Math.sqrt(3);

// Six neighbor directions in axial coordinates (flat-top grid)
const HEX_DIRS = [
    { q:  1, r:  0 },
    { q:  1, r: -1 },
    { q:  0, r: -1 },
    { q: -1, r:  0 },
    { q: -1, r:  1 },
    { q:  0, r:  1 }
];

// ============================================================
// POWER CARD DECK
// ============================================================
const POWER_CARDS = [
    // ── Stat boosts: single stat, +amount, next check ─────────────────────
    { id: 'good_friction',            name: 'Good Friction',                              type: 'boost',            stat: 'speed',      amount: 0.1, description: '+0.1 Speed for your next check.' },
    { id: 'greater_exertion',         name: 'Greater Exertion',                           type: 'boost',            stat: 'strength',   amount: 0.1, description: '+0.1 Strength for your next check.' },
    { id: 'the_moon_shines_brighter', name: 'The Moon Shines Brighter',                  type: 'boost',            stat: 'visibility', amount: 0.1, description: '+0.1 Visibility for your next check.' },
    { id: 'a_stroke_of_luck',         name: 'A Stroke of Luck',                          type: 'boost_choice',                         amount: 0.1, description: '+0.1 to a characteristic of your choice for your next check.' },
    { id: 'a_stroke_of_luck_q',       name: 'A Stroke of Luck?',                         type: 'boost_random',                         amount: 0.1, description: '+0.1 to a random characteristic for your next check.' },
    { id: 'a_second_wind',            name: 'A Second Wind',                              type: 'boost',            stat: 'speed',      amount: 0.2, description: '+0.2 Speed for your next check.' },
    { id: 'adrenaline_rush',          name: 'Adrenaline Rush',                            type: 'boost',            stat: 'strength',   amount: 0.2, description: '+0.2 Strength for your next check.' },
    { id: 'the_shadow_is_weaker',     name: 'The Shadow Is Weaker',                      type: 'boost',            stat: 'visibility', amount: 0.2, description: '+0.2 Visibility for your next check.' },
    { id: 'extreme_luck',             name: 'Extreme Luck',                               type: 'boost_choice',                         amount: 0.2, description: '+0.2 to a characteristic of your choice for your next check.' },
    { id: 'extreme_luck_q',           name: 'Extreme Luck?',                              type: 'boost_random',                         amount: 0.2, description: '+0.2 to a random characteristic for your next check.' },
    // ── Special test modifiers ─────────────────────────────────────────────
    { id: 'a_second_chance',          name: 'A Second Chance',                            type: 'second_chance',   description: 'After a test resolves, redo it from your original choice — reversing all effects.' },
    { id: 'saving_grace',             name: 'Saving Grace',                               type: 'saving_grace',    description: 'Your next die roll automatically returns a 10.' },
    // ── Random hex tile removal ────────────────────────────────────────────
    { id: 'uneasiness_1',             name: 'An Uneasiness in One Direction',             type: 'hex_remove_random', count: 1, description: 'Remove 1 random adjacent tile (not Leaf or Level 4).' },
    { id: 'strange_sounds_2',         name: 'Strange Sounds By the Trees',                type: 'hex_remove_random', count: 2, description: 'Remove 2 random adjacent tiles (not Leaf or Level 4).' },
    { id: 'route_dangerous_3',        name: 'Your Route Is Dangerous',                    type: 'hex_remove_random', count: 3, description: 'Remove 3 random adjacent tiles (not Leaf or Level 4).' },
    { id: 'surroundings_harsher_4',   name: 'Your Surroundings Are Harsher Than Before', type: 'hex_remove_random', count: 4, description: 'Remove 4 random adjacent tiles (not Leaf or Level 4).' },
    { id: 'not_as_they_seem_5',       name: 'Things Are Not As They Seem',                type: 'hex_remove_random', count: 5, description: 'Remove 5 random adjacent tiles (not Leaf or Level 4).' },
    { id: 'forest_crumbles_6',        name: 'The Forest Crumbles',                        type: 'hex_remove_random', count: 6, description: 'Remove up to 6 random adjacent tiles (not Leaf or Level 4).' },
    // ── Chosen hex tile removal ────────────────────────────────────────────
    { id: 'not_going_there_1',        name: 'Not Going There',                            type: 'hex_remove_choice', count: 1, description: 'Remove 1 adjacent tile of your choice (not Level 4; Leaf tiles are revealed instead of removed).' },
    { id: 'closed_off_2',             name: 'Closed Off',                                 type: 'hex_remove_choice', count: 2, description: 'Remove 2 adjacent tiles of your choice (not Level 4; Leaf tiles are revealed instead of removed).' },
    { id: 'absolutely_not_3',         name: 'Absolutely Not That Way',                    type: 'hex_remove_choice', count: 3, description: 'Remove 3 adjacent tiles of your choice (not Level 4; Leaf tiles are revealed instead of removed).' },
    { id: 'dont_think_so_4',          name: "Don't Think So",                             type: 'hex_remove_choice', count: 4, description: 'Remove 4 adjacent tiles of your choice (not Level 4; Leaf tiles are revealed instead of removed).' },
    { id: 'one_way_forward_5',        name: 'One Way Forward',                            type: 'hex_remove_choice', count: 5, description: 'Remove 5 adjacent tiles of your choice (not Level 4; Leaf tiles are revealed instead of removed).' },
    // ── Draw ───────────────────────────────────────────────────────────────
    { id: 'try_again',                name: 'Try Again',                                  type: 'draw',    count: 1, description: 'Draw 1 Power Card.' },
    { id: 'a_great_favorite',         name: 'A Great Favorite',                           type: 'draw',    count: 2, description: 'Draw 2 Power Cards.' },
    // ── Teleport ───────────────────────────────────────────────────────────
    { id: 'sudden_disorientation',    name: 'Sudden Disorientation',                      type: 'teleport_random',  description: 'Teleport to a random non-Level-4 hex and trigger its encounter. Use between encounters.' },
    // ── Adjacent hex reveal ────────────────────────────────────────────────
    { id: 'opening_trees_1',          name: 'An Opening in the Trees',                    type: 'hex_reveal_adjacent', count: 1, description: 'Reveal whether 1 adjacent hex contains a Leaf token.' },
    { id: 'hill_rises_2',             name: 'The Hill Rises to Meet You',                 type: 'hex_reveal_adjacent', count: 2, description: 'Reveal whether 2 adjacent hexes contain Leaf tokens.' },
    { id: 'valley_aids_3',            name: 'The View from a Small Valley Aids You',      type: 'hex_reveal_adjacent', count: 3, description: 'Reveal whether 3 adjacent hexes contain Leaf tokens.' },
    { id: 'rise_terrain_4',           name: 'You Can See Much From a Rise In the Terrain',type: 'hex_reveal_adjacent', count: 4, description: 'Reveal whether 4 adjacent hexes contain Leaf tokens.' },
    { id: 'grassy_clearing_5',        name: "You've Found an Expansive Grassy Clearing",  type: 'hex_reveal_adjacent', count: 5, description: 'Reveal whether 5 adjacent hexes contain Leaf tokens.' },
    { id: 'towering_tree_6',          name: 'You Climb A Towering Tree',                  type: 'hex_reveal_adjacent', count: 6, description: 'Reveal whether 6 adjacent hexes contain Leaf tokens.' },
    { id: 'vision_from_above',        name: 'A Vision From Above',                        type: 'hex_reveal_any',      description: 'Click any hex on the board to reveal whether it contains a Leaf token.' },
    // ── Attribute & movement ───────────────────────────────────────────────
    { id: 'you_feel_different',       name: 'You Feel Different',                         type: 'random_attribute',    description: 'Gain a random attribute.' },
    { id: 'a_quick_jog',              name: 'A Quick Jog',                                type: 'quick_jog',           description: 'Your next move may reach any hex up to 2 steps away. Only the destination triggers an encounter.' },
    // ── Result manipulation ────────────────────────────────────────────────
    { id: 'salvation',                name: 'Salvation',                                  type: 'salvation',           description: 'Reverse all effects of the most recent test outcome.' },
    { id: 'damnation',                name: 'Damnation',                                  type: 'damnation',           description: 'Re-apply all effects of the most recent failure outcome.' },
    // ── Chaos ──────────────────────────────────────────────────────────────
    { id: 'moment_of_clarity',        name: 'A Moment of Clarity',                        type: 'moment_of_clarity',   description: 'Preview 5 Power Cards and add up to 2 of them to your hand.' },
    { id: 'chaos_descends',           name: 'Chaos Descends',                             type: 'chaos_descends',      description: 'Roll a d10. Something unpredictable happens.' },
    { id: 'double_or_nothing',        name: 'Double or Nothing',                          type: 'double_or_nothing',   description: 'Roll a d10. Odd: your hand is discarded. Even: draw cards up to your hand limit.' },
    { id: 'just_an_illusion',         name: 'Just an Illusion',                           type: 'just_an_illusion',    description: 'Discard another card from your hand to draw a new one.' }
];

// ============================================================
// ENCOUNTER DATABASE
// Encounters are organized by the level they appear on (1-4).
// Each has a title, description, and 1-2 choices.
// Choices can have a check (stat + target) or be automatic (check: null).
// Effects: health, peaceOfMind, knowledge, insanity, visibility, strength, speed
// ============================================================
const ENCOUNTERS = {
    1: [
        {
            id: 'close_call',
            title: 'Close Call',
            description: 'You nearly walk into the middle of a stream. Gah, where did that come from. You look at the other side…It\'s probably possible to hop over the rocks to get to the other side or make a single longer jump over the stream. What do you do?',
            choices: [
                {
                    text: 'You make the single, longer jump.',
                    check: { stat: 'speed', target: 1.3 },
                    success: { text: 'You make the leap across the stream and land, though a bit awkwardly, on your feet. A small amount of satisfaction and pride flows through you.', effects: { peaceOfMind: 1 } },
                    failure: { text: 'You make the leap across the stream, falling just short of the other bank. You fall hard against the rocks in the stream, cutting yourself up and soaking your clothes in water.', effects: { peaceOfMind: -1, health: -1 } }
                },
                {
                    text: 'You climb to the stream\'s edge and hop over the rocks.',
                    multiCheck: { stat: 'speed', target: 1.2, count: 3 },
                    success: { text: 'You make it across the stream safely. Not even your socks became wet.', effects: {} },
                    failure: { text: 'You slip on one of the rocks and, as you try to regain your balance, your foot slides neatly into the water. Your socks are now extremely wet.', effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'You walk along the stream, hoping to find an easier way forward.',
                    condition: { stat: 'knowledge', min: 2 },
                    check: null,
                    success: { text: 'No easier way, however, presents itself and you don\'t want to tarry long.', effects: {} },
                    failure: null
                },
                {
                    text: 'Jump into the water.',
                    check: null,
                    success: { text: 'That was stupid of you. Now your clothing is soaked.', effects: { peaceOfMind: -2, insanity: 1 } },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: 'It isn\'t worth it to risk getting yourself wet in this brisk night. You deem it appropriate to find some other way through the wood.', effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'easy_stroll',
            title: 'An Easy Stroll',
            description: 'The forest floor is soft and mossy. You find it remarkably easy to tread through the undergrowth and decaying leaves. Even the inclines and declines of the terrain aren\'t too burdensome either, so long as you avoid the hills.',
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: {} },
                    failure: null
                }
            ]
        },
        {
            id: 'whack',
            title: 'WHACK!',
            description: 'A low-hanging branch appears out of nowhere, smacking you in the face. You fall backwards, landing hard on your bum. You quickly feel around your body for any major wounds. There are none. A trickle of blood starts to come out of your nose.',
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: { health: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'jumpscare',
            title: 'Jumpscare',
            description: 'You walk straight into a spiderweb. Frantically, you pull at the silky strands clinging to your face, imagining little legs crawling up and down your skin. It is an extraordinarily unpleasant experience and, lamentably, a common one in the forest on the East Coast.',
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'fond_memories',
            title: 'Fond Memories',
            description: 'The trees are clothed in leaves. They make soft shh shh whispers in the mild breeze, a good harmony when combined with the cicadas. There once was a time when you would have been out here with your mother, father, and siblings, enjoying the nighttime forest, but no longer. You will just have to appreciate it yourself.',
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: { randomCharBoost: 0.1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'a_small_blessing',
            title: 'A Small Blessing',
            description: 'You reach into your jacket pocket and realize that you left a granola bar in there from a couple of days ago. You pull it out, peeling off the wrapper, and eat it. It\'s your favorite kind, oat and chocolate chip. You store the plastic back into your pocket for safekeeping. It would be quite inappropriate to litter in the woods.',
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: { health: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'stars_of_the_brush',
            title: 'Stars of the Brush',
            description: 'The fireflies buzz lazily about, their behinds blinking over and over again a soft red. They make it seem like the forest is filled with stars all about you. You give yourself a moment to take it all in. There is comfort in those little lights. Almost an assurance of something better. This is something you certainly missed about living here.',
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: { peaceOfMind: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'annoyance',
            title: 'Annoyance',
            description: 'You wonder why there aren\'t any clear paths out here. You would think that there\'d be at least a steady stream of Sunday hikers from the local communities out here. Everything in this forest has been so dang frenetic and disorganized. The park service will have to do something about it eventually…',
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: {} },
                    failure: null
                }
            ]
        },
        {
            id: 'hoo_hoo',
            title: 'Hoo-hoo',
            description: 'A great-horned owl flies over your head. You recall hearing a lot about them in school. They eat almost any animal small enough to fit in their beak and slow enough to be caught. It doesn\'t matter if it\'s a vole or a frog. Big lards.',
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: {} },
                    failure: null
                }
            ]
        },
        {
            id: 'idle_thoughts',
            title: 'Idle Thoughts',
            description: 'You wonder if being so far off trail could lead you straight into a bomb like what some say could happen over in Dolly Sods. There, hikers are strictly forbidden by the park service to leave the trails. The park was apparently used for US military artillery training and possibly hosts a number of volatile ordnances. Getting blown up is not a fun way to end your camping trip. You shrug off the thought, however. Dolly Sods is far away from you.',
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: {} },
                    failure: null
                }
            ]
        },
        {
            id: 'idle_breeze',
            title: 'Idle Breeze',
            description: 'The wind blows across your face. It\'s chilly, but not enough to penetrate your jacket. In fact, with all of this exercise you are getting, you might even say it\'s a bit pleasant.',
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: {} },
                    failure: null
                }
            ]
        },
        {
            id: 'an_old_fence',
            title: 'An Old Fence',
            description: "In decades past, it probably designated the border of something at some point. Now, it is mostly collapsed. Only a few beams remain in the air. You can't even tell where humanity used to reside in this part of the forest.",
            choices: [
                {
                    text: 'Take a stick from it.',
                    check: { stat: 'strength', target: 1.4 },
                    success: { text: "You grab a long beam of wood and pull it from the ground. It is very bulky, but might come in handy later.", effects: { sotcp: -1, grantItem: 'Wooden Beam' } },
                    failure: { text: "You grab one of the firmest beams in the middle of the fence and start to pull on it. It does not budge until your 5th pull. On your 6th, it snaps in the middle, sending you falling backwards into the dirt.", effects: { health: -1, sotcp: -1 } }
                },
                {
                    text: 'Prop up a part that has fallen down.',
                    dualCheck: [{ stat: 'visibility', target: 1.2 }, { stat: 'strength', target: 1.3 }],
                    success: { text: "You find a smooth, solid stick that will be able to hold the fence up for a little while longer. You make an effort to firmly stick the piece of wood into the ground. Though you sweat a little in the process of doing so, you eventually succeed in fortifying the fence.", effects: { sotcp: 1 } },
                    failure: { text: "You find a stick that looks suitable enough and begin trying to push it deep enough in the dirt so as to support the leaning fence post. As you push, your hand slips, running quickly down the length of the stick. A number of splinters come off in your hand.", effects: { health: -1 } }
                },
                {
                    text: 'Knock the whole fence down.',
                    check: { stat: 'strength', target: 1.4 },
                    success: { text: "You place both your hands on the top of the fence posts and shove with all your might. The beams of wood do not give way at first, belying a sturdier construction than its appearance let on. Even so, a couple more pushes bring it down, the posts snapping off at their bottoms.", effects: { sotcp: -2 } },
                    failure: { text: "You make the foolish mistake of trying to kick the fence down. Instead of readily falling over as you anticipated, you thrust yourself backwards and fall. This fence was constructed way better than you originally thought.", effects: { health: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "Crossing the fence is probably a bad idea. It is a possibility that the property on the other side of it is still private. You don't see any \"No Trespassing\" signs around you, but ignorance of the law has never been an excuse for breaking the law.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'smoke',
            title: 'Smoke',
            description: "Familiar smells hit you. It is the scent of wood burning. Could there be a fire near? People have been known to camp out in the forest, but it is improbable that they would construct a fire so late at night. In any case, they might be able to help you leave.",
            choices: [
                {
                    text: 'Track the smell.',
                    check: { stat: 'health', target: 13, raw: true },
                    success: { text: "You don't really have a super keen sense of smell, but you do your best. Through what is more likely sheer dumb luck than your nose, you come upon the source of the scent. A large collection of sticks have recently been burnt. The flames have been doused, but it is still smoking a little bit. They almost smell like incense up close, like large sticks of palo santo or something. The sensation rejuvenates you a little.", effects: { health: 1 } },
                    failure: { text: "You lose the scent after following it for a few minutes. You wonder why you would even pursue it in the first place. Your nose isn't that good.", effects: { forceDeeperMove: true } }
                },
                {
                    text: 'Ignore the smell.',
                    check: null,
                    success: { text: "You elect to ignore whatever might be burning. It could easily be a mere forest fire.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'the_sky_darkens',
            title: 'The Sky Darkens',
            description: "Some clouds briefly overshadow the moon and it grows markedly darker. You can still see a little ways in front of you, but the forest floor is a lot less visible.",
            choices: [
                {
                    text: 'Slow down.',
                    check: null,
                    success: { text: "You slow down to a crawl, picking your way around roots and making sure that you don't fall over anything. It takes a while for the Moon to show its face again, but it does eventually.", effects: {} },
                    failure: null
                },
                {
                    text: 'Stay the course.',
                    check: { stat: 'visibility', target: 1.4 },
                    success: { text: "You continue walking like nothing happened. Before long, the clouds pass and you can see just fine again.", effects: { temporaryDebuff: { stat: 'visibility', amount: 0.1, uses: 3 } } },
                    failure: { text: "You continue walking like nothing happened and immediately trip over a root, scuffing your knee on a sharp rock. There was definitely not enough light for you to easily make it through the woods.", effects: { health: -1 } }
                }
            ]
        },
        {
            id: 'voices_from_afar',
            title: 'Voices from Afar',
            description: "Distant shouts come to you on the wind. You can't make out what they are saying, but you are reasonably sure that someone is yelling afar off.",
            choices: [
                {
                    text: 'Follow them.',
                    dualCheck: [{ stat: 'speed', target: 1.3 }, { stat: 'health', target: 13, raw: true }],
                    success: { text: 'You follow the voices for 10 minutes or so. As you get close to the source of the disturbance, you hear an extremely loud bellow and make out the words "Up there!" You find nothing else in the general direction of the voice.', effects: { peaceOfMind: -1, knowledge: 1 } },
                    failure: { text: "You walk in the general direction of the voices, expecting to eventually find whoever is making them. Your search does not come to fruition and you are left feeling frustrated that you have lost yourself even more in the woods.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Listen harder.',
                    check: { stat: 'health', target: 12, raw: true },
                    success: { text: 'Hmm, you can make out the words, "\u2026finding their way through the forest\u2026" but not much else.', effects: {}, opensVoicesListening: true },
                    failure: { text: "No, you can't hear anything more. The sounds are all jumbled together. It's no use. Still, you are pleased that your hearing is pretty good.", effects: { peaceOfMind: 1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "The only kind of people who are going to be out this deep in the forest tonight are either (a) lost or (b) psychopaths burying a fresh kill. You question the likelihood that there are more people lost like you and you definitely don't want to run into (b).", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'swirling_scraps',
            title: 'Swirling Scraps',
            description: "Some pieces of paper are blowing through the air.",
            choices: [
                {
                    text: 'Grab them and put them in your pocket.',
                    dualCheck: [{ stat: 'speed', target: 1.3 }, { stat: 'visibility', target: 1.2 }],
                    success: { text: "Get rid of the litter.", effects: { peaceOfMind: 1, sotcp: -1 } },
                    failure: { text: "You nearly catch up to them before tripping and face planting right in the dirt. Apparently not all receive good karma for attempted good deeds.", effects: { health: -1 } }
                },
                {
                    text: 'Grab them and read them.',
                    dualCheck: [{ stat: 'speed', target: 1.3 }, { stat: 'visibility', target: 1.3 }],
                    success: { text: 'You snatch one of the papers out of the air and hold it up to the moonlight. The letters swim in front of you. A slight headache builds up in your temples as you stare at the scrap\u2026 but it\'s not written in English\u2026 it seems to say "Mayyk ha sdahrs scrum."', effects: { knowledge: 1, sotcp: -1 } },
                    failure: { text: "You attempt to catch a few of the papers, jogging after them as they float away from you. Your running, however, causes you to fly straight into a tree. You fall hard onto your back.", effects: { health: -1 } }
                },
                {
                    text: 'Watch them float away.',
                    check: null,
                    success: { text: "The scraps of paper drift off, disappearing into the night.", effects: { sotcp: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'wish_upon_a_star',
            title: 'Wish Upon a Star',
            description: "A shooting star falls in the distance. A rock from some far-off place finishing its journey in Earth's atmosphere. It traces a red line across the sky before burning off in a flash of light. You wish these sights were not so ephemeral.",
            choices: [
                {
                    text: 'Wish upon it.',
                    check: null,
                    success: { text: '', effects: {}, opensWishChoices: true },
                    failure: null
                },
                {
                    text: 'Do nothing.',
                    check: null,
                    success: { text: "Well, that was cool. Let's keep walking.", effects: { insanity: -1 } },
                    failure: null
                },
                {
                    text: 'Curse the star.',
                    check: null,
                    success: { text: '"wishing upon stars" is a foolish Greek tradition developed by Ptolemy that has absolutely no bearing upon reality. We only do it in the paganistic hope that our materialistic interests will be served anyways. You yell expletives at the sky. A rock suddenly comes rolling down the hill, thumping you in the leg. You pick it up, thinking for a moment that you might have actually angered someone upstairs.', effects: { health: -1, insanity: 1, grantItem: 'Weird Rock' } },
                    failure: null
                }
            ]
        },
        {
            id: 'the_milky_way',
            title: 'The Milky Way',
            description: "The sky is peppered with stars. The constellations above shine with a heavenly glow. When you are this far out in the woods, you can even see some of the Milky Way. It's a sight you never got to see while you lived in the city and it is a sight that you miss.",
            choices: [
                {
                    text: 'Point out a constellation.',
                    check: { stat: 'visibility', target: 1.4 },
                    success: { text: "You instantly spot Ursa Major and Taurus. You search for Orion, but have a bit of trouble spotting him. Perhaps you'd need to look sometime in the morning.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You become distracted gazing at the Milky Way. It seems so close to you. The faint light it emits is almost haunting.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Do nothing.',
                    check: null,
                    success: { text: "You don't remember the names of any of the constellations, though you wish you could. It was nice to gaze up at them, however.", effects: { insanity: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'bluebells',
            title: 'Bluebells',
            description: "Some bluebells lie about on the forest floor. How odd\u2026 they usually stop blooming by May. Regardless, the sight of them is certainly pretty and they cause the forest to appear as if it were in a fairytale.",
            choices: [
                {
                    text: 'Pick one.',
                    dualCheck: [{ stat: 'strength', target: 1.1 }, { stat: 'visibility', target: 1.1 }],
                    success: { text: "You delicately pluck one of the flowers out of the ground and place it in your pocket. You'll put it in a vase once you return home.", effects: { grantItem: 'Bluebell' } },
                    failure: { text: "You have trouble pulling out one of the small flowers. The effort frustrates you. Surely you can't be THAT weak.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Take it all in.',
                    check: { stat: 'visibility', target: 1.4 },
                    success: { text: "You gaze as far as the trees will permit and yet the bluebells do not seem to have an end. The bluish-green growth fills you with awe for the wonders nature has to offer.", effects: { closeToPower: 1 } },
                    failure: { text: "The flowers ripple in the soft breeze. They are indeed quite beautiful. You focus hard so as to inspect them more. They are almost glowing. You rub your eyes wondering if you must be crazy. You must just be seeing things\u2026", effects: { knowledge: 1, peaceOfMind: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "Why on EARTH would you miss this wonderful sight. Surely you aren't in that much of a hurry\u2026", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'beady_eyes',
            title: 'Beady Eyes',
            description: "A few raccoons gaze at you from the trees. Their beady eyes make you shiver a bit.",
            choices: [
                {
                    text: 'Throw a rock at them.',
                    check: { stat: 'strength', target: 1.5 },
                    success: { text: "You heave a stone at the raccoons. One of them is hit and falls to the ground, dead. What a cruel thing to do.", effects: { grantItem: 'Food' } },
                    failure: { text: "You toss the stone up at the raccoons and miss them by a couple feet. They scamper off into the trees, eyeing you angrily as they flee.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Yell at them.',
                    check: null,
                    success: { text: 'You yell "dirty rats" up at them and shake your fist in their direction. They regard you lazily and slink off into the night.', effects: { peaceOfMind: -1 } },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "No need to stick around here.", effects: { peaceOfMind: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'pile_of_junk',
            title: 'Pile of Junk',
            description: "A pile of junk rests on the forest floor. It has always bothered you when people littered in nature. Unfortunately, it looks like there is no way to take all of it out of the woods with you right now.",
            choices: [
                {
                    text: 'Dig around in the trash.',
                    check: null,
                    success: { text: '', effects: {}, opensTrashDigging: true },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You leave the raccoons to rummage around in the trash.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'barking',
            title: 'Barking',
            description: "You hear barking in the distance. It's not loud, but not very far off either.",
            choices: [
                {
                    text: 'Follow the sound.',
                    dualCheck: [{ stat: 'visibility', target: 1.2 }, { stat: 'speed', target: 1.4 }],
                    success: { text: "You grow audibly closer to the source of the barking. It could very easily lie less than one hundred meters away.", effects: { peaceOfMind: 1 }, opensBarkingFollowup: true },
                    failure: { text: "The barking starts to die down as you make your way through the trees. No! You were so close! You lose the sound. Tracking it becomes impossible.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: "Don't follow the sound.",
                    check: null,
                    success: { text: "You don't care about finding your dog. What matters is your own wellbeing, and your wellbeing right now is not being served by your present circumstances.", effects: { peaceOfMind: -1, insanity: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'rock_and_a_hard_place',
            title: 'Rock and a Hard Place',
            description: "You find a cavity between two rocks sticking out of the ground. It isn't large enough to be called a cave, but it could fit a person or a large animal…",
            choices: [
                {
                    text: 'Enter the cavity.',
                    check: { stat: 'strength', target: 1.3 },
                    success: { text: "You manage to leverage yourself into the cavity. Unfortunately, there are no tunnels or openings into new areas. You take pride, however, in your successful pull-up.", effects: { closeToPower: 1 } },
                    failure: { text: "You hoist yourself between the rocks, putting most of your weight on your arms. The strain causes them to buckle out from under you and you topple backwards into the dirt.", effects: { health: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You take a mental note of the funny little opening and walk off, resolving to one day return and enter it. For now, though, you elect not to be investigative.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'scars_in_the_earth',
            title: 'Scars in the Earth',
            description: "Large divots are cut into the ground. In a spat of clumsiness, you trip and step into one, only barely catching yourself mid-fall.",
            choices: [
                {
                    text: 'Examine the hole.',
                    check: { stat: 'visibility', target: 1.3 },
                    success: { text: "You clear the area around the hole and take a better look at it. It isn't fashioned in any recognizable shape that you have ever seen. You notice a number of other holes very much like it stretching off in a line in one direction. The faint scent of tobacco wafts out of it.", effects: { knowledge: 1 } },
                    failure: { text: "You clear the debris from around the hole, attempting to look at it from all angles. Its shape is unrecognizable. A number of other similar holes much like it stretch off in a line in two more directions. They look like they could be… no, that would be silly. You shudder at the thought.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "This little foray of yours is certainly turning into a major nuisance. You wish that you could find a path or something out of this place.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'the_winds_dance',
            title: 'The Winds Dance',
            description: "A gust of wind blows through the trees. It isn't loud nor particularly quiet.",
            choices: [
                {
                    text: 'Listen to the wind.',
                    check: { stat: 'peaceOfMind', target: 15, raw: true },
                    success: { text: "You stop for a moment to enjoy the gentle shh-ing of the leaves. It harmonizes well with the chirping of the cicadas and the soft bending of the trees.", effects: { peaceOfMind: 2 } },
                    failure: { text: "You stop for a moment in an attempt to enjoy the gentle shh-ing of the leaves. The sound harmonizes well with the cicadas and the bending of the trees. As you listen, another sound echoes through the wind. It sounds like… like whispers. The auditory sensation is gone in a moment, but the sound still unsettles you.", effects: { peaceOfMind: -1, knowledge: 1 } }
                },
                {
                    text: "Don't listen to it.",
                    check: null,
                    success: { text: "It might be nice to listen to it on another day, but you just wish to move forward. You do so, walking without giving any heed to the gusts around you.", effects: {} },
                    failure: null
                }
            ]
        },
        {
            id: 'slow_going',
            title: 'Slow-going',
            description: "Some thick brush lies up ahead. It looks like you will have no choice but to wade through it. While it isn't likely that there are any animals in there to hurt you, you also don't wish to tear your skin to pieces on branches.",
            choices: [
                {
                    text: 'Pick your way carefully through the bushes.',
                    check: { stat: 'visibility', target: 1.4 },
                    success: { text: "You make your way through the bushes. A few burs cling to your clothes, but nothing too bad. You can pick them out later. You exit the patch of brush without problem, dodging a wicked looking nail sticking up from the ground. That would have hurt way worse than thorns.", effects: {} },
                    failure: { text: "You cautiously make your way through the bushes, dodging every wayward branch that looks like it could harm you. Your attention is so focused on the bushes that you briefly forget to look at the ground. Your foot lands on a nail. You withdraw your leg quickly, but not before it has time to penetrate a small distance.", effects: { health: -1 } }
                },
                {
                    text: 'Proceed as normal.',
                    check: null,
                    success: { text: "You take no precautions when walking through the bushes. Instead you trod on through them, crushing plants as you walk. Initially, only a couple of burs stick to you. You could easily pick them off. Just as you cross the threshold to the other side of the bushes, you step on a rusty nail. You quickly retract your foot before it can sink very deep, but it stings a little nonetheless. It's good that you got your tetanus shot a week ago.", effects: { conditionalHealth: { amount: -1, minResult: 7 } } },
                    failure: null
                },
                {
                    text: 'Run through the bushes.',
                    check: null,
                    success: { text: "You run as fast as you can through the bushes, your caution absolutely thrown to the wind. Upon reaching the other side of the bushes, you step on a rusty nail. You retract your foot, but not quickly enough that it doesn't sink deeply into your foot.", effects: { health: -2, insanity: 1 } },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You'd rather not walk through the bushes. You'll have to find some other way around.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'a_great_behemoth',
            title: 'A Great Behemoth',
            description: "A tall boulder stands before you. It lies on an outcropping in the hill and peeks just beyond some of the trees. It looks like it's rough enough to support you with friction if you climb on it. Your bouldering skills are, however, somewhat rusty, and you definitely don't want to fall and hurt yourself by accident.",
            choices: [
                {
                    text: 'Climb the boulder.',
                    check: { stat: 'strength', target: 1.4 },
                    success: { text: "You slowly make your way to the top of the boulder, putting one foot in front of the other. Some of your muscles seem to vaguely remember your days as a young child scaling rocks like this with extreme ease. Despite your lack of practice and good physique, you make it to the top of the boulder. It gives you a clear view of a large swath of woods, helping you chart out a place to go. It's a shame that you can't see any signs of humanity, though.", effects: { peaceOfMind: 1, scout: 3 } },
                    failure: { text: "You begin to scale the boulder. You are really not in shape for this. You get four feet above the ground before slipping and falling flat on your back. You lie there for five minutes, wind knocked out of you. The boulder looms over your body, as if silently judging you.", effects: { peaceOfMind: -1, health: -1 } }
                },
                {
                    text: 'Examine the boulder.',
                    check: { stat: 'visibility', target: 1.4 },
                    success: { text: "You walk to the closest side of the boulder and examine it up close. There are markings stretching all along its side. They are unintelligible, but there nonetheless. You've seen petroglyphs that made more sense.", effects: { knowledge: 1 } },
                    failure: { text: "You walk around to the far side of the boulder and step back to take it all in. At first, it looks relatively normal, albeit oddly smooth on some of its facades. As you continue to stare, however, you notice that it is full of… holes? Thousands, perhaps tens or hundreds of thousands of small holes are cut into the rock on this side. They appear to stretch off into the rock forever. Water wouldn't make something like this. You are deeply troubled by the experience.", effects: { knowledge: 1, peaceOfMind: -2 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "There is no WAY that you are going to climb that thing. One fall from the top of it could cave your skull in. The thought of your body lying broken on the ground makes you shudder. Even worse is the thought that no one would find you.", effects: {} },
                    failure: null
                }
            ]
        },
        {
            id: 'a_slight_glint',
            title: 'A Slight Glint',
            description: "Something glints on the ground. It is faint in the moonlight, but reflective enough for you to know that it is there.",
            choices: [
                {
                    text: 'Move to look at it.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You strain your eyes to gaze at the shiny object. It… yeah… it looks like it was just a piece of glass covered in a couple of leaves. Even so, all that focusing helped accustom your eyes to the darkness.", effects: { visibility: 0.1 } },
                    failure: { text: "You peer down at the shiny object. You can't tell what it is. Is it metal? Is it glass? You have wasted your time here.", effects: { temporaryDebuff: { stat: 'visibility', amount: -0.1, uses: 3 } } }
                },
                {
                    text: 'Pick it up.',
                    check: { stat: 'strength', target: 1.3 },
                    success: { text: "You pull the item from the ground without incident. It is an eyeglass, covered in a tarnished brass finish and set with two clear glass lenses. What an odd find. It'll look good on your dresser.", effects: { grantItem: 'Eyeglass' } },
                    failure: { text: "The glinting item is buried within the dirt and refuses to give way with a simple tug. You dig around in the dirt with your bare hands, cutting them on a bunch of rocks. Despite your sacrifice, your efforts bear fruit and you pull a brass spyglass out of the ground.", effects: { grantItem: 'Eyeglass', health: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You aren't here to pick up trash. It's not that you hate the environment or anything. You just don't want to be worrying about that right now. Plus, it could easily be a piece of sharp metal. You wouldn't want to prick yourself while handling it, would you?", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'a_youth_camp',
            title: 'A… Youth Camp?',
            description: "You arrive at a number of permanent canvas wall tents. The fabric on the walls of the tents is in tatters, exposing the remains of cots inside. Various rusty bits of metal are scattered across the dirt. The tents surround a single, destroyed fire pit. Clearly, no Boy Scout troop or camping party has been in the area for quite some time.",
            choices: [
                {
                    text: 'Investigate the tents.',
                    check: { stat: 'visibility', target: 1.2 },
                    success: { text: "The tents are mostly filled with rotting wood and debris. A few of the cots still stand, but look ready to break at any second. Some old clothing is discarded here and there and reeks of mildew. At least no trash had been left behind. You certainly do not want to know how bad a year-old bag of rotten food smells. Your findings, however, are very uninteresting.", effects: {} },
                    failure: { text: "The tents are mostly filled with overturned cots and random articles of clothing. You sigh. Nothing useful. Not even a map. You elect to push aside some of the debris in the hopes of finding something deeper. As you do so, a stick snaps outside, just outside the perimeter of the campground. You cautiously pull back the tent flap and look outside, but nothing is there.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Investigate the tools.',
                    check: { stat: 'visibility', target: 1.4 },
                    success: { text: "You begin to pick some of the items up from off the ground. A hammer. A decaying mallet. A screwdriver. All very weird to find in the woods. Lying among the leaves, however, is a small, orange plastic box with the words \"Emergency Firestarter Kit\" written on it. You open it up. It's clearly been used, but there are still enough matches for a few good fires.", effects: { grantItem: 'Firestarter', peaceOfMind: 1 } },
                    failure: { text: "You sort through some of the items on the ground. A hammer. A decaying mallet. A screwdriver. You look to the left. A… a pair of forceps? A saw. A sharp metal bar. A stiletto knife. A staff with a metal handle… you stop looking. You don't want to find any more creepy stuff.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Pick up a stone from the firepit.',
                    check: { stat: 'strength', target: 1.3 },
                    success: { text: "You select an almost spherical stone from the remains of the fire pit. It looks like it once bore some odd markings on it, but that had been removed.", effects: { grantItem: 'Weird Rock', sotcp: -1 } },
                    failure: { text: "You attempt to heft a few of the stones, but quickly find that you won't be able to lug any of them all that far. A pity, some of them looked relatively interesting. Your lack of strength bothers you.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You do not wish to approach an abandoned campsite. It's likely that nothing of use lies there at all, given how old it is.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'sleeping_deer',
            title: 'Sleeping Deer',
            description: "You stumble across a patch of sleeping deer. It doesn't look like they have noticed you yet. You haven't been making a lot of noise, at least not enough to make yourself heard over the sound of the cicadas.",
            choices: [
                {
                    text: 'Circle around the deer.',
                    dualCheck: [{ stat: 'speed', target: 1.2 }, { stat: 'visibility', target: 1.3 }],
                    success: { text: "You walk a short distance away from the herd and begin to pick your way through the bushes. Before long, you are far enough away from the deer to walk normally again.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You walk a short distance away from the group and attempt to pick your way around the trees. One of the deer raises its head, spotting you. Before you can freeze, it leaps up, alerting the others. They make a loud braying noise and rush every which way. You hug the nearest tree, hoping none will accidentally crash into you. None do, but the experience certainly unsettles you.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Yell at the deer.',
                    check: null,
                    success: { text: "You yell at the top of your lungs, stirring the sleeping group into action. They leap up and run frantically into the woods, their braying ringing in your ears. A buck darts within inches of you, nearly knocking you over. You press yourself up against a tree, hoping that the animals will have the sense to avoid you.", effects: { peaceOfMind: -1 } },
                    failure: null
                },
                {
                    text: 'Run through the pack of deer.',
                    check: { stat: 'speed', target: 1.6 },
                    success: { text: "You make a break for the other side of the sleeping herd. Before you even enter the midst of them, they are alerted and begin darting everywhere, confused at the sight of a stranger in their midst. One nearly runs you over, but you dodge it right in time. After the run, you feel slightly invigorated by your exploits.", effects: { speed: 0.1, peaceOfMind: -1 } },
                    failure: { text: "You sprint through the sleeping herd of deer. However, before you can even enter the pack, a number of the deer leap up and begin to run frantically around you. Their braying echoes in your ears like screams. It is a horrible experience.", effects: { peaceOfMind: -2, insanity: 1 } }
                },
                {
                    text: 'Leave the way you came.',
                    check: null,
                    success: { text: "You decide that it isn't worth it to possibly disturb a herd of deer. They could… stampede or something.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'a_grassy_clearing',
            title: 'A Grassy Clearing',
            description: "You come to a clearing… The faint moonlight shines down upon the quiet grass. It is a peaceful place, all things considered.",
            choices: [
                {
                    text: 'Take a moment to rest.',
                    check: null,
                    success: { text: "You've been walking for a long while. You might as well give yourself a moment to sit on a stone and catch your breath. The night air is pleasant here.", effects: { health: 1 } },
                    failure: null
                },
                {
                    text: 'Take a moment to think.',
                    check: null,
                    success: { text: "You sit down on a stone in the middle of the clearing and think about better days. You remember your childhood in these woods, when you had not a care in the world. You remember all the hikes and games you played here in West Virginia. It was a wonderful time.", effects: { peaceOfMind: 1 } },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You want to be out of the forest as soon as possible. There is no time to be mucking about in a grassy patch in the forest.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'an_old_fort',
            title: 'An Old Fort',
            description: "You pass by an old fort. It looks like one that you may have built when you were a kid. It is crudely made with dry sticks and string. The structure probably wouldn't be able to hold more than one person.",
            choices: [
                {
                    text: 'Destroy the old fort.',
                    dualCheck: [{ stat: 'strength', target: 1.4 }, { stat: 'visibility', target: 1.2 }],
                    success: { text: "You begin to kick and tear down the sticks holding the old fort. For a moment, you become entranced by the act of destruction. The fort is sturdier than it initially appeared. Regardless, it collapses after some effort.", effects: { sotcp: -1 } },
                    failure: { text: "You begin to tug sticks off of the old fort. They are oddly arranged, as if they were placed deliberately in its messy array. Even so, the sticks begin to come off one by one. You take down nearly the entire fort before a splinter of wood cuts a harsh gash in your hand. How bothersome.", effects: { health: -1, sotcp: 1, grantAttribute: 'Totally Lost' } }
                },
                {
                    text: 'Burn the fort.',
                    itemRequired: 'Firestarter',
                    check: null,
                    success: { text: "You add a few small sticks to the fort and set them on fire. Soon, the entirety of the fort is alight, blazing brightly in the night. It burns hotter than most bonfires you have been around. Was the wood treated with some odd chemicals?", effects: { sotcp: -1, insanity: 1 } },
                    failure: null
                },
                {
                    text: 'Investigate the old fort.',
                    check: { stat: 'visibility', target: 1.3 },
                    success: { text: "You investigate the old fort. There is what looks like an opening to one side of it. You crawl in, the earth and dirt caking your pants and sleeves. It is small, but big enough for at least one child to enjoy. You start to rifle around to see if there might be something of interest in the dirt. Before long, you find a notebook… a journal, perhaps… lying in the dirt. It is dated quite recently and is written in the same scrawl as a child might employ. Will you read it?", effects: {}, opensJournal: true },
                    failure: { text: "You rifle around in the dirt and come up with nothing. Coming in here was a waste of your time. Gah, and now you are filthy! What a mess.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Add a stick to the fort.',
                    dualCheck: [{ stat: 'strength', target: 1.2 }, { stat: 'visibility', target: 1.3 }],
                    success: { text: "The fort is remarkably ugly. It could use a bit of a tune-up. You look around the area for a stick or some foliage and come up with a nice branch. You lay it on top of the fort, briefly satisfied with the work you have done. The wind seems to whistle its satisfaction as well.", effects: { sotcp: 1 } },
                    failure: { text: "You attempt to find a good branch to lay on top of the fort. Unfortunately, most of the smaller ones are not to your liking. Instead, you pick out a rather hefty bough that may have fallen in a recent storm. You attempt to lug it over to the fort, but your efforts to do so cause you to trip and fall, bruising your legs. You give up the endeavor.", effects: { health: -1 } }
                },
                {
                    text: 'Take a stick from the fort.',
                    dualCheck: [{ stat: 'strength', target: 1.6 }, { stat: 'visibility', target: 1.6 }],
                    success: { text: "You pick out a stick that is just about your height from the middle of the pile. After a little bit of pulling, the stick comes free in your hands. It's actually quite smooth. Fancy that.", effects: { grantItem: 'Walking Stick', strength: 0.1 } },
                    failure: { text: "You rest your eyes on a particularly knobby one to the side of the fort. You begin to wrench it from the fort, but the stick refuses to budge. You pull with all your might and a piece of the stick snaps free, sending you sprawling backwards. You land awkwardly on your back.", effects: { health: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "There is nothing for you here. Still, it seems odd to you that there would be a fort built so far out in the woods. Who would let their child play here?", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'go_faster',
            title: 'Go Faster?',
            description: "You begin to wonder if you should pick up your speed or not. Night has fallen and you aren't totally sure where you are… What do you decide to do?",
            choices: [
                {
                    text: 'Start to jog.',
                    check: { stat: 'speed', target: 1.5 },
                    success: { text: "The cool night air invigorates you and fills you with new energy. The last time you did this was as a child on one of your family night hikes.", effects: { strength: 0.1 } },
                    failure: { text: "You start to jog but before you can get a good pace going, you trip over a root and fall flat on your face. What a bother… it makes no sense why one would try to run in the dark.", effects: { health: -1 } }
                },
                {
                    text: 'Continue at the same speed.',
                    check: null,
                    success: { text: "No need has, as of yet, presented itself to you to speed up. Doing so would probably tire you out even more. You keep trudging on.", effects: {} },
                    failure: null
                },
                {
                    text: 'Slow down.',
                    check: { stat: 'visibility', target: 1.4 },
                    success: { text: "You survey the land around you and get a bead on where you might wish to go…", effects: { scout: 3 } },
                    failure: { text: "The trees around you cast faint dark shadows from the moon's sickening silvery light. The cicadas' chirping blocks out any sounds of danger that might be lurking in the dark. You want to leave.", effects: { peaceOfMind: -1 } }
                }
            ]
        },
        {
            id: 'a_small_ravine',
            title: 'A Small Ravine',
            description: "You come to a small ravine. An old, but thick log crosses over it. At the bottom of the ravine are some nasty-looking thorn bushes. You give a quiet murmur of disgruntlement. This is such a pain.",
            choices: [
                {
                    text: 'Cross the log.',
                    dualCheck: [{ stat: 'strength', target: 1.2 }, { stat: 'visibility', target: 1.3 }],
                    success: { text: "You begin to walk along the log. It's not nearly as thin as it looked before you stood on it. In fact, it is quite stable. You have got the hang of this! You make it to the other side of the ravine without any further incident.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You begin to walk along the log. It is wide near the center and does not sway as much as you would've feared. This just might go over well! You walk a bit more confidently as you reach the very center. Without warning, you step on a rotten portion of the log, pushing straight through it into the center of the log. The stumble bruises your leg and almost sends you tumbling to the floor below, but you keep your balance and walk on.", effects: { health: -1 } }
                },
                {
                    text: 'Climb down the ravine.',
                    check: { stat: 'visibility', target: 1.5 },
                    success: { text: "Using your sharp eyes, you deftly pick your way around the bushes. Occasionally, a thorn tears at your clothes, but you are able to avoid most of the bushes. As you make your way through the undergrowth, your eyes adjust a bit more to the surroundings and your senses grow a bit more alert to the potential perils around you.", effects: {} },
                    failure: { text: "You blindly stumble through the bushes, thorns tearing at your skin all the while. What a bother. You think that you might be bleeding in a dozen different spots.", effects: { health: -1 } }
                },
                {
                    text: 'Jump off the log.',
                    check: null,
                    success: { text: "You walk to the center of the log and leap off of it. You are falling…falling. You wake up in a daze. The bushes below cushioned your fall. You are hurt, but not terribly injured. You roll onto your side, thorns pricking through your shirt. What could have possessed you to do such a thing?", effects: { health: -3, insanity: 1 } },
                    failure: null
                },
                {
                    text: 'Run through the bushes.',
                    check: null,
                    condition: { stat: 'insanity', min: 4 },
                    success: { text: "You decide that it might be easier to run straight through the thorns and deal with the pricks you might receive on the other side. You immediately, however, tumble down the hill into the bushes. After righting yourself, you take off to the other side, thorns making annoyingly deep cuts in your skin.", effects: { health: -3, insanity: 2 } },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You aren't going to take any chances and you shudder as you imagine what it would be like to fall from the log into those bushes.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'its_getting_late',
            title: "It's Getting Late",
            description: "The clock strikes 12 on your digital watch. Could it be 12 already? How long have you been walking for? Shouldn't you be walking back?",
            choices: [
                {
                    text: 'Ignore your watch.',
                    check: { stat: 'peaceOfMind', target: 12, raw: true },
                    success: { text: "You forget about the late hour. It no longer crosses your mind.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You try to forget about the late hour, but the darkness begins to nag at you. Will you be able to get out of these woods? Will anybody notice that you are gone once morning comes? Your eyes keep glancing down at your watch, your agitation growing.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Throw your watch away.',
                    check: { stat: 'strength', target: 1.3 },
                    success: { text: "Your watch goes soaring through the air, never to be seen again. Even the faint light it emitted is no longer visible from the spot where it presumably landed.", effects: { peaceOfMind: 1, grantAttribute: 'Watchless' } },
                    failure: { text: "Your watch hits a tree trunk and rebounds toward you. You cast it again with the same effect. Why won't this accursed watch just get rid of itself? You smash it to bits underneath your foot, your frustration obvious on your face.", effects: { peaceOfMind: -1, grantAttribute: 'Watchless' } }
                },
                {
                    text: 'Panic.',
                    check: null,
                    success: { text: "You begin to wonder if you are not going to be able to get out of these woods. Modern technology is powerful, but accidents always happen. You start to hyperventilate. This isn't right. You should be at home. Why did you ever choose to do this? Why are you out here? Why? Damn these woods.", effects: { peaceOfMind: -2, insanity: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'signs_of_life',
            title: 'Signs of Life',
            description: "You encounter a small firepit that must've been built many years ago. No campsite surrounds it any longer. It's strange that something like this would be constructed so far out of the way of human habitation. Surrounding the bits of charcoal and debris are rough, coarse stones. What do you do about the pit?",
            choices: [
                {
                    text: 'You gather some wood for a fire.',
                    itemCheck: 'Firestarter',
                    check: null,
                    success: { text: 'You build a nice, roaring fire in the center of the stones. The comforting warmth of the flames temporarily eases the severity of the surrounding forest.', effects: { peaceOfMind: 1, health: 1 } },
                    failure: { text: "You pick up a few twigs to use as tinder and some sticks for kindling before stopping. How are you going to light the fire? You probably should have thought about this before you started collecting wood.", effects: {} }
                },
                {
                    text: 'Destroy the fire pit.',
                    dualCheck: [{ stat: 'strength', target: 1.3 }, { stat: 'visibility', target: 1.2 }],
                    success: { text: "People shouldn't be building fires this far out in the woods anyways. A forest fire would be devastating to the local communities. Now no one will be tempted to build a fire where it might spread.", effects: { peaceOfMind: 1, sotcp: -1 } },
                    failure: { text: "As you pick up the first stone, you stumble, nearly dropping it on your foot. You decide against taking the fire pit apart any further.", effects: { sotcp: -1 } }
                },
                {
                    text: 'Examine the stones.',
                    dualCheck: [{ stat: 'strength', target: 1.2 }, { stat: 'visibility', target: 1.3 }],
                    success: { text: "You hold one of the firepit's stones up to the faint moonlight. Symbols almost seem to be dancing across its surface. You can hardly take your eyes off of them. For a moment you sit there, almost understanding.", effects: { knowledge: 1 } },
                    failure: { text: "You hold up a stone from the firepit. It is covered in strange shapes and symbols. Though they are all roughly shaped, it also becomes clear that they may have been intentionally cut in this way. However, you can't make out any of the symbols clearly. Perhaps you could one day seek out this weird firepit again in order to see what is drawn on them.", effects: {} }
                },
                {
                    text: 'Take a stone.',
                    check: { stat: 'strength', target: 1.3 },
                    success: { text: 'You succeed in pulling one of the smaller rocks out of the ground and stuffing it into one of your hefty coat pockets.', effects: { grantItem: 'Weird Rock', sotcp: -1 } },
                    failure: { text: "You pull a rock out of the ground and begin carrying it away. However, it is awkward to carry and severely impedes your movement. You look backwards to see if you could retrieve a different rock, but the firepit is no longer there.", effects: { sotcp: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You depart from the fire pit, not wishing to waste any time. As you walk away, you perceive that the darkness is somehow thicker here.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
    ],
    2: [
        {
            id: 'the_house',
            title: 'The House',
            description: "You stumble upon a lone house. A house? All the way out there? The architecture bears an antiquated colonial style common to many neighborhoods on the East Coast, though the structure is smaller than most modern homes. The paint on the walls is worn and gray wood is showing through it. Even so, the windows are all still intact and there is not yet any major decay that'd compromise its structural integrity. You shuffle around the leaves below you for a sign of a road, but there is none. It doesn't even have a mailbox. All in all, the outside of the home is quite bland, though it appears that the roof is damaged in one part.",
            choices: [
                {
                    text: 'Investigate.',
                    check: null,
                    success: { text: '', effects: {}, opensHouseEncounter: true },
                    failure: null
                },
                {
                    text: "Walk past.",
                    check: null,
                    success: { text: "Were you really just thinking about breaking into someone's house? The temptation makes you shake your head. You suppose you could have tried knocking on the door, but it looks like nobody is home. Still, you are glad to see some evidence of human civilization. You aren't the only one out here.", effects: { peaceOfMind: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'darned_thing',
            title: 'Darned Thing',
            noItemFallback: {
                item: 'Flashlight',
                description: "You feel an odd static shockwave hit you, enough to make your hair float into the air. The air briefly crackles for a moment. Did lightning just strike somewhere? You continue walking."
            },
            description: "A static shockwave hits you, and a light blasts out of your pocket. The air briefly crackles for a moment. Did lightning just strike somewhere? Your flashlight turns on, unnaturally bright, and stays on for a minute before sputtering, its light rapidly winking out. You turn it off and back on again, but experience the same flickering effect.",
            choices: [
                {
                    text: 'Shake the flashlight.',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "You forcefully shake the flashlight. It stops blinking and you stow it away back in your pocket.", effects: {} },
                    failure: { text: "You shake the flashlight, but the flickering doesn't stop. It soon dies and you are left with a useless lump of metal.", effects: { removeItem: 'Flashlight' } }
                },
                {
                    text: 'Whack the flashlight against a log.',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "You smartly hit the flashlight against a log two times. It stops flickering and you are left with a flashlight as good as new.", effects: {} },
                    failure: { text: "You hit the flashlight against the tough bark of a tree. The front section of the light comes right off, leaving you with a broken lump of metal.", effects: { removeItem: 'Flashlight' } }
                },
                {
                    text: 'Turn it off and on a few times.',
                    randomCheck: true,
                    success: { text: "You turn the flashlight on and off a couple of times. It takes a few tries for it to work, but you eventually get the thing running again.", effects: {} },
                    failure: { text: "You begin thumbing the on/off switch with your finger. After a bit of meddling, the button comes off completely in your hand. You try to put it back, but fail. The flashlight is officially broken.", effects: { removeItem: 'Flashlight' } }
                },
                {
                    text: 'Throw the flashlight away.',
                    check: null,
                    success: { text: "You did not want the thing anyways. It only had a little bit of charge left and you've grown well accustomed to the darkness.", effects: { removeItem: 'Flashlight' } },
                    failure: null
                }
            ]
        },
        {
            id: 'a_camp_site',
            title: 'A Camp Site',
            description: "You find the remains of a campsite. Shredded tents lie upon the ground, surrounding a concrete fire pit. Scattered about the area are various bits of debris and trash. The lacerated remains of a sleeping bag and backpack are off to your left. A plastic bag crunches beneath your leg. It is stained with something sticky. Most of the ground is discolored too. You don't want to think about what it could be, but the scene certainly looks like something out of a horror movie.",
            choices: [
                {
                    text: 'Search the tents.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You walk to the tent closest to you and unzip the door. A repulsive stench immediately hits you and you fall backwards before getting the zipper totally undone. At the foot of the door just inside the tent is a small first aid kit. Without looking further in, you grab it and walk away.", effects: { peaceOfMind: -1, grantItem: 'First Aid Kit' } },
                    failure: { text: "You head to the tent farthest away from you first. It is in the worst shape and appears to be entirely lacking one of the canvas walls. As you round the corner, you catch a glimpse inside the hole. At first, it looks like the tent is full of sleeping bags, but, no, they are too\u2026oh\u2026oh NO\u2026you pull back and reel off into the darkness.", effects: { peaceOfMind: -3 } }
                },
                {
                    text: 'Look around the concrete firepit.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "The pit is full of charcoal and odd little stones decorated with loops and whorls. The stones were likely once arranged in a nice little circle, but the circle has long since been broken. You take a stone with you.", effects: { grantItem: 'Weird Rock' } },
                    failure: { text: "The pit is full of charcoal and odd little stones decorated with loops and whorls. You elect to dig around in the firepit to see if there is anything of interest. As you do so, something burns you and you instinctively move your hand away. There must have been a hot coal somewhere still in there. Your hand aches but, as you keep walking, you realize that there is no physical wound there\u2026", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Look through some of the bags.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You root through some of the trash left around the campsite. Your search leads you to\u2026a firestarter kit! What luck.", effects: { grantItem: 'Firestarter', peaceOfMind: 1 } },
                    failure: { text: "You root through some of the trash left around the campsite. As you stick your hand into a particularly large brown paper bag, you grasp the blade of what feels like a knife and cut yourself horribly on it. You remove your bleeding palm and gasp in pain before stumbling off into the woods, cursing.", effects: { health: -2 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "And there's no need to step into a horror movie either.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'parade_of_lights',
            title: 'Parade of Lights',
            description: "There are a number of flickering lights about a quarter mile away from you. You squint and observe that they are carried by dark figures moving in a huddled group. Maybe they can help?",
            choices: [
                {
                    text: 'Follow the torches.',
                    check: { stat: 'speed', target: 1.7 },
                    success: { text: "You jog in the direction of the figures until there lies only about 20 meters between you and them. The lights you saw are large torches shooting flames high into the air as if to form a roof of fire over them. Though the light has made you visible in the treeline, your presence is ignored. You open your mouth to call out, but a blackness descends without warning upon all around you, including the group. You trip and black out. When you awake a minute later, the figures are gone, though one of the \"torches\" is now lying near you. As you examine it, you realize that it functions like a large lighter\u2026or maybe a small flamethrower.", effects: { health: -1, peaceOfMind: 1, grantItem: 'Flamethrower' } },
                    failure: { text: "You begin to jog after the figures, but you soon realize that you won't be able to keep up. As you open your mouth to call out to them, a great blackness descends upon you and the group. You trip and fly down a hill, cracking a few ribs along the way.", effects: { health: -3 } }
                },
                {
                    text: 'Call to the torchbearers.',
                    check: null,
                    success: { text: "You yell as loud as you can at the group, but receive no response. The figures recede into the distance until, finally, they wink out.", effects: { peaceOfMind: -2 } },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "Leave? Why are you leaving? You have just spotted definite signs of civilization! There can't be THAT many serial killers in the woods tonight.", effects: { insanity: 1, peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'painted_trees',
            title: 'Painted Trees',
            description: "You find a couple of trees with trailblazes marked on them. A path? You think that you might be able to dimly make out where humans have been walking in the dirt, though it is hard to make out any details. You follow the brightly colored markings on the trees. At first, they are easy to spot. Then they grow farther and farther apart. Before long, you can no longer spot any of them anymore. Still, following a recognizable path makes you feel just a tad bit closer to home.",
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: {}, collectLeaf: true },
                    failure: null
                }
            ]
        },
        {
            id: 'an_unfamiliar_feeling',
            title: 'An Unfamiliar Feeling',
            description: "Are the stars out of place? It isn't an immediately noticeable change, but you begin to notice that patches of the sky look funny. It's not that there are clouds or shapes that shouldn't be there. It's just\u2026well\u2026different.",
            choices: [
                {
                    text: 'Seek out the Big Dipper.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You gaze at the lights in the sky. The Big Dipper isn't there. That can't be. Stars do not just disappear. Well, perhaps they might, but not all in unison!", effects: { peaceOfMind: -2 } },
                    failure: { text: "You fail to focus sufficiently enough to get a good long view at the different parts of the night sky, but get a good glimpse of the numberless twinkling lights above. The sight of the stars briefly calms you.", effects: { peaceOfMind: 1 } }
                },
                {
                    text: 'Look at the Moon.',
                    check: null,
                    success: { text: "You look at the Moon. At least it looks normal. Its face-like features stare down at you. It's quite beautiful tonight. You are grateful for the light it's reflecting toward you.", effects: {} },
                    failure: null
                },
                {
                    text: 'Ignore the oddity.',
                    check: null,
                    success: { text: "You are neither an astrologist nor are you an astronomist. You're not even sure what your \"star sign\" or whatever is. How would you know if the stars \"were out of alignment.\"", effects: {} },
                    failure: null
                }
            ]
        },
        {
            id: 'strong_incense',
            title: 'Strong Incense',
            description: "The smell of something sweet fills your nostrils. You look about you for the source. A number of metallic incense burners have been fastened to the low hanging boughs on some of the trees near you. Wispy smoke drifts from them and is carried every which way by the wind. They must have been placed there or refueled earlier in the night.",
            choices: [
                {
                    text: 'Knock one down.',
                    check: { stat: 'strength', target: 1.7 },
                    success: { text: "You hug the trunk of one of the thinner oak trees and use your legs and arms to slowly shift yourself upwards. It is a lengthy process and you accumulate a number of small scrapes along your skin, but eventually you reach one of the burners. It is ornately carved and is composed of a dull brown metal that you think might be brass. It's loosely connected to a branch by a small pin, the likes of which you easily tear out. It falls to the ground, creating a metallic crunch as it lands. You climb back down the tree and peer at it. There isn't anything left for you to take. The burner was completely obliterated by your meddling. Only shards remain.", effects: { sotcp: -1 } },
                    failure: { text: "You walk over to a stunted chestnut oak and take hold of a lower branch. You start to ascend. The climb up is easy enough but just as you brush your fingers against the burner at the midsection of the tree, the branch below you cracks. You are sent falling through the foliage. Twigs and branches tear at your clothes, many repeatedly knocking the wind out of you. You do not fall directly onto the ground, but hurt yourself regardless.", effects: { health: -2, sotcp: -1 } }
                },
                {
                    text: 'Light a burner.',
                    itemRequired: 'Firestarter',
                    check: { stat: 'strength', target: 1.5 },
                    success: { text: "You pull yourself up into the birch tree, its trunk bending dangerously under your weight, and examine the incense burner. It's an ornately-carved container full of some chemical that you can't identify. You light it with a match regardless and place the burner back into place. You crawl down the tree and leave, hoping it helped someone out somewhere.", effects: { sotcp: 1 } },
                    failure: { text: "You pull yourself up into the birch tree, its trunk bending dangerously under your weight. One of the branches you've rested a part of your weight on bends a little too far and you topple backward, falling to the ground. Your rough landing doesn't break any of your bones, but you hit the earth awkwardly enough on your leg to walk with a slight limp for a little while.", effects: { health: -1, temporaryDebuff: { stat: 'speed', amount: -0.1, uses: 3 } } }
                },
                {
                    text: 'Identify the smell.',
                    randomCheck: true,
                    success: { text: "Something sickly sweet comes to you at times. At other points, the faint smell of old flowers. Finally, you get a whiff of rot and decay, like that which emanates from\u2026roadkill? You plug your nose. What a putrid stench. What are people burning out here?", effects: { peaceOfMind: -1 } },
                    failure: { text: "You try to catch a few whiffs of the burners and can occasionally pick out a faint sweet scent, but no more. You hope that the presence of these burners means someone else is near here.", effects: { peaceOfMind: 1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You breathe in some of the smoke that drifts down to you from a burner and gag. Why does it smell like a dead animal carcass and old flowers? You hurry away, covering your nose with your shirt and nearly retching as you do so.", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'an_old_fort_q',
            title: 'An Old Fort...?',
            description: "A round structure of sticks stands in front of you. You made stick forts when you were a child but never have you witnessed something as awesome as this. The fort standing before you resembles more of a tall, human-sized bird's nest nestled amongst the trunks of a few trees. Some of the individual sticks making up the walls of the fort could even have been young saplings themselves. It is a messy construction and is held together by nothing but tightly bound cords, but impressive nonetheless.",
            choices: [
                {
                    text: 'Climb onto it.',
                    dualCheck: [
                        { stat: 'visibility', target: 1.5 },
                        { stat: 'strength', target: 1.5 }
                    ],
                    success: { text: "You ascend to the top of the heap and scrabble to its center. As you expected, a peculiarly round hole lies in the center, stretching deeper than the ground that should have made up its floor. You can see nothing in the blackness, but are sure that falling down into it would likely kill you. You catch a faint whiff of halogen from down below and think you hear the shuffling of something slightly larger than a man, but you don't dare check your suspicions.", effects: { knowledge: 1, closeToPower: 2 } },
                    failure: { text: "You climb up onto the structure and crawl through the sticks over to a hole in the center of the\u2026is it really a fort? You peer down into it, noticing that it looks to be far deeper than the ground which should have made up its floor. As you stare, some of the wood shifts beneath you, causing you to fall partially into the hole. The smell of halogen hits you and you catch yourself before tumbling completely into the abyss below. Something shifts in the darkness, moving a meter or so beneath your feet, rattling the wood you are holding onto. Terrified, you heave yourself onto the top of the structure and then rush down its side, sprinting off into the night.", effects: { peaceOfMind: -2, closeToPower: 1, knowledge: 1 } }
                },
                {
                    text: 'Pull a stick off it.',
                    dualCheck: [
                        { stat: 'strength', target: 1.6 },
                        { stat: 'visibility', target: 1.2 }
                    ],
                    success: { text: "You examine the wall of the fort, pulling at each rod in order to find the loosest. After a few minutes, you take hold of one looser than the rest and pull it expertly through the cord. It comes out in your hand.", effects: { grantItem: 'Walking Stick', strength: 0.1, sotcp: -1 } },
                    failure: { text: "You grasp a rod that had likely once been carved by some passerby and pull on it. The weight of the fort shifts and a much larger bundle of sticks comes crashing down upon you, only narrowly missing your head. You scrabble out of the pile with cuts all up and down your arms and legs.", effects: { health: -2, sotcp: -2 } }
                },
                {
                    text: 'Add a stick to it.',
                    check: { stat: 'strength', target: 1.4 },
                    success: { text: "You insert a stick into a cylindrical gap in the fort. Nothing obvious happens, but you almost feel an invisible change in the air. Not one of temperature, but something.", effects: { sotcp: 1 } },
                    failure: { text: "You find a weirdly oblong gap in the structure and shove a stick into it. Instead of succeeding, the stick hardly goes more than a foot in. You shove harder, snapping the stick off in the middle. Your head rolls forward and you find yourself glaring eye-to-haft at a sharp point on the stick. One inch more and you would be blinded in one eye.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Burn it down.',
                    itemRequired: 'Firestarter',
                    check: null,
                    success: { text: "No, this is no bird's nest. It is a pyre! A pyre whose smoke will ascend to lofty heavens above! The nighted sky yearns for your reverence, your adulation! Burn it down! Burn it down now!", effects: { sotcp: -2, health: -3, insanity: 1, removeItem: 'Firestarter' } },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "The sight of the spiny pile causes you great unease. No child would build this nor any human adult. You make haste in your departure from it.", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'osteophobia',
            title: 'Osteophobia',
            description: "You find bones like you've never seen. When you were young, you were often beholden to the sundried skulls and remains of woodland animals. Dead deer and squirrels were plentiful in your hometown. However, these look nothing like what you recall. They are misshapen\u2026malformed. Few of them even form a straight line.",
            choices: [
                {
                    text: 'Take one.',
                    check: { stat: 'strength', target: 1.4 },
                    success: { text: "You pick up a hefty looking ball of dense bone. It might have been something's head had there been eye sockets in it or a mouth. Its eerie smoothness makes it surprisingly difficult to carry around, but you lug it along nonetheless.", effects: { grantItem: 'Weird Bone' } },
                    failure: { text: "You pick up a long, curvy, and thin bone. It gleams a dull white in the moonlight. You run your fingers across it and yelp in pain, dropping it to the floor. The edge you were touching is extremely sharp. It could cut paper! You won't be messing with that again. It's another minute before your fingers stop bleeding. The cut is deep.", effects: { health: -2 } }
                },
                {
                    text: 'Examine them.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You bend down to examine a small pile of them. Not a single one of the bones is alike. Some are flat, others bulbous, even more curvy. A few are as porous as volcanic rock. What strange things indeed.", effects: { knowledge: 1 } },
                    failure: { text: "You bend down to examine some of the larger bones. They twist and curve in the most disgusting fashion. Whatever limb or body they belonged to must have been terribly grotesque. Large sharp edges grow out of a few of them, forming wicked blades. Yes, the creatures in possession of these biological peculiarities must be ugly indeed.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "The sight is jarring for your eyes. You don't want to believe that there might be something worse than bears out here. These bones, unfortunately, are proof to the contrary. You try to thrust your concerns out of your mind, but the fear does not desist.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'green_rug',
            title: 'Green Rug',
            description: "Creeping Stonecrop and Phlox carpets the forest floor. It's a bit early for the Phlox to be blossoming, but shockingly blue flowers spring up underneath anyways. They are a bizarre sight and you can't help but wonder who might have planted them. That these plants are often seen growing over graves is a fact that doesn't come to your mind\u2026",
            choices: [
                {
                    text: 'Pick a bunch.',
                    check: null,
                    success: { text: "You take a delicate flower from the plant and place it in your pocket.", effects: { grantItem: 'Phlox Flower' } },
                    failure: null
                },
                {
                    text: 'Trample the plants.',
                    check: null,
                    success: { text: "You are truly a terrible vandal for this. Your wrongdoing will surely have consequences later.", effects: { insanity: -1, grantAttribute: 'Ecocidal' } },
                    failure: null
                },
                {
                    text: 'Pick your way around the plants.',
                    check: null,
                    success: { text: "You avoid the ground covering altogether, ensuring that no flowers are harmed by your trespass. You gain a subtle sense of satisfaction from your act of environmental friendliness as you continue on your way.", effects: { peaceOfMind: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'an_awful_ruckus',
            title: 'An Awful Ruckus',
            description: "Rumbling and shrieking come from beyond. Erratic yelps and howls reverberate through the trees to your position. Something must be happening close by.",
            choices: [
                {
                    text: 'Turn back.',
                    randomCheck: 'odd',
                    success: { text: "The fearsome sounds grow fainter and fainter until they stop altogether. You are away from\u2026whatever was out there.", effects: { peaceOfMind: 1 } },
                    failure: { text: "No matter where you go, the sounds follow you. They are greatly varied in tone and pitch, but all seem to be emanating from one single source.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Press forward.',
                    dualCheck: [
                        { stat: 'visibility', target: 1.4 },
                        { stat: 'speed', target: 1.4 },
                        { stat: 'strength', target: 1.4 }
                    ],
                    success: { text: "You make your way toward the direction of the voices, but they grow no louder or softer. Eventually, they even grow fainter until they fade away to nothing. Your little endeavor has brought you farther into the woods. Farther than you may like.", effects: { closeToPower: 1, forceShallowerMove: true } },
                    failure: { text: "They grow loud with every step until you reach the epicenter of the sound. Nothing is there, but the haunting sounds reverberate all around you, rattling your ribcage. You notice that the ground is mud. The sound\u2026the sound is coming from the mud! Is something under there? You fling yourself onto drier earth and cover your ears. The sounds fade away, but you are left with the memory of them still in your ear.", effects: { peaceOfMind: -2, forceDeeperMove: true } }
                },
                {
                    text: 'Run forward.',
                    check: null,
                    success: { text: "The beautiful melodies of the innermost parts of the forest. They attract you, as a moth to the flame. What would your life be without such harmonious sounds? Only here midst these branches can such a cacophony be mellifluous. Only here can you bask in the dulcet soundings of pain. You mustn't miss such a grand opportunity to listen.", effects: { insanity: 1 } },
                    failure: null
                },
                {
                    text: 'Listen to the cacophony.',
                    randomCheck: true,
                    success: { text: "Beyond the pained groans and moans coming to you through the thickets, that is what you hear. Longing. Something else besides you wants to leave. A deep and passionate longing.", effects: { knowledge: 1, grantAttribute: 'Longing' } },
                    failure: { text: "Pain. You can make out only pain in those voices\u2026or are they cries\u2026or pleas or\u2026", effects: { peaceOfMind: -1, grantAttribute: 'Longing' } }
                }
            ]
        },
        {
            id: 'crashed_cart',
            title: 'Crashed Cart',
            description: "An overturned cart has crashed into a tree. It's a bit larger than a wheelbarrow and has been painted red. The coloring is faded, as if it has been in the woods for a long time. From the looks of it, someone must have been pulling it by hand, like the pioneers did. It could easily have come from an antique store. The cart appears to have been crashed recently. You can still see the divots it left in the dirt.",
            choices: [
                {
                    text: 'Examine the cart.',
                    check: { stat: 'visibility', target: 1.5 },
                    success: { text: "You run your hands along the walls of the cart. Beneath the paint are small etchings, as if the wood was carved prior to the cart's creation.", effects: { closeToPower: 1 } },
                    failure: { text: "You run your fingers along one of the handles on the ground. Your fingers encounter something wet and you pull your hand away. Smelling your hand tells you that it is most likely blood. What happened to the person carrying this cart?", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Check its contents.',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "You summon all your strength and turn the cart back over. Its contents spill out onto the floor as the last bits of tarp holding them tears. You sort through the sticks on the ground and find\u2026a gun! You pull it out and examine it. It looks new and well taken care of. You wonder how it wor\u2026BAM! You accidentally pull the trigger and it fires a bullet off into the night.", effects: { grantItem: 'Gun' } },
                    failure: { text: "You huff and puff as you lift the cart up. A few more pieces of wood tumble out from beneath it. The cart groans and slips in your fingers, sending its edge straight down onto your toes. You gasp in pain, having suffered at least one broken toe and limp off.", effects: { health: -1, peaceOfMind: -1, temporaryDebuff: { stat: 'speed', amount: -0.1, uses: 3 } } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "An upside-down wreck, nothing more. There isn't anything in the cart that could possibly help you all the way out here. Not even a map.", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'method_to_the_madness',
            title: 'Method to the Madness?',
            description: "You come across similar-looking boulders a lot now. How odd. That boulder you just passed looks suspiciously like the one you saw before it\u2026and the one you saw before that\u2026and the one you saw before that\u2026",
            choices: [
                {
                    text: 'Keep track of their similarities.',
                    check: null,
                    success: { text: "You walk up to one of the boulders and peer at it in order to make sure it's not some tricks of the light. On one side, there are a number of holes that draw your eyes inward to them. They create a strange optical illusion in which they appear to grow and shrink, though you know this can't be possible. You check other boulders for similar features and find that they possess these same peculiarities as well.", effects: { peaceOfMind: -1, closeToPower: 1 } },
                    failure: null
                },
                {
                    text: 'Ignore their strangeness.',
                    check: null,
                    success: { text: "You are just seeing things. None of these boulders are actually that similar. If it were daytime, you just know that they'd all be different.", effects: { peaceOfMind: 1, closeToPower: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'droning',
            title: 'Droning',
            description: "The cicadas continue on. They hum in a droning, annoying cacophony. When you were a youth, they once came out of hibernation and covered everything in sight. Cars could not drive without crunching over hundreds of the thousands of bugs. Your parents often put the harmless cicadas on you, causing you to become extremely terrified. Looking back, it was undoubtedly pretty humorous.",
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: {} },
                    failure: null
                }
            ]
        },
        {
            id: 'shifting_ground',
            title: 'Shifting Ground',
            description: "The earth is shifting in places and you find yourself ankle deep in mud. The ground squirms beneath you, as if thousands of nasty wyrms are attempting to crawl up from beneath it. You can feel things writhing beneath your shoe.",
            choices: [
                {
                    text: 'Dig.',
                    check: null,
                    success: { text: "You have never felt a sensation like this before. It does not feel like an earthquake. You begin to clear away the mud from around your feet. It is firm enough to keep its shape and allow you to form a hole. As you dig, the ground moves even more. Eventually, slow bubbles begin surfacing out of the mud, letting out a putrid gas that forces you away from it. You are left with terrible thoughts about what might be down there.", effects: { peaceOfMind: -2, closeToPower: 1 } },
                    failure: null
                },
                {
                    text: 'Dig deeper.',
                    condition: { stat: 'insanity', min: 4 },
                    check: null,
                    success: { text: "You know what is down there, beyond this thin layer of wet earth. It bubbles up from the forest, the voices of those who have not returned. It is a beautiful harmony. You must seek it. You must seek it.", effects: { insanity: 1, closeToPower: 2 } },
                    failure: null
                },
                {
                    text: 'Find steadier ground.',
                    dualCheck: [
                        { stat: 'speed', target: 1.4 },
                        { stat: 'strength', target: 1.4 }
                    ],
                    success: { text: "You step from rock to rock and from tree root to tree root, carefully avoiding sinking your shoes into the mud. You quickly find firmer soil and tread on.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You hop from rock to rock, avoiding sinking your shoes into the mud. Your shoe touches a particularly smooth stone and you slip, falling deeply into the vile filth below. You become covered in mud.", effects: { peaceOfMind: -2, grantAttribute: 'Covered in Mud' } }
                }
            ]
        },
        {
            id: 'blasted_woodland',
            title: 'Blasted Woodland',
            description: "There are a number of burned trees around you. What was once a beautiful forest is now a desolate field. The charred remains of a number of trees lay on the ground. There must have been a small forest fire here. You didn't realize that some fires could also pull down the affected trees\u2026",
            choices: [
                {
                    text: 'Take a look at them.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You pick your way through the discarded branches and boughs and sidle up next to a less-blackened section of a log. In some of the less damaged parts, you can almost make out intentional etchings in the tree. The base of the tree was definitely not sawed by any machines. It has been snapped in half.", effects: { knowledge: 1, closeToPower: 1 } },
                    failure: { text: "You pick your way through the discarded branches and boughs. As you traverse the terrain, a long splinter of wood punctures your arm. You pull it out and the wound oozes blood.", effects: { health: -1 } }
                },
                {
                    text: 'Clamber over them.',
                    dualCheck: [
                        { stat: 'strength', target: 1.3 },
                        { stat: 'speed', target: 1.3 }
                    ],
                    success: { text: "You rapidly cross the burned-out clearing, opting to walk along the sturdier logs. It takes you longer than it would have hopping across them, but you come out uninjured.", effects: { health: 1 } },
                    failure: { text: "You jump from log to log, making it almost entirely across the clearing without incident. Unfortunately, you slip on the last log and catch your leg on a sharp broken branch. It leaves a long gash on your leg.", effects: { health: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "The blackened stumps stick up like knives into the air. The logs bear the appearance of dark bodies lying upon the ground. The scene is too ominous for your tastes. You will find another way forward.", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'a_warm_bed',
            title: 'A Warm Bed',
            description: "You wonder how late it is and wish that you were home and in bed.",
            choices: [
                {
                    text: 'Dwell on the thought.',
                    check: null,
                    success: { text: "You typically go to bed around 10:30. Tomorrow you are going to be so tired. Will you even make it to tomorrow? You feel like something is wrong with this neck of the woods. It's a miserable place to get lost in.", effects: { peaceOfMind: -1 } },
                    failure: null
                },
                {
                    text: 'Ignore the thought.',
                    check: { stat: 'peaceOfMind', target: 13, raw: true },
                    success: { text: "Though your frustration with yourself nags at you, you let your annoyance ebb and focus on the journey ahead.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You refuse to even think about the unfortunate state of your situation. You can't, however, ignore the aching in your muscles or the somewhat painful cuts and bruises you have sustained in your little foray. They weigh heavier on your mind.", effects: { temporaryDebuff: { stat: 'strength', amount: -0.1, uses: 5 } } }
                },
                {
                    text: 'Check your watch.',
                    condition: { lacksAttribute: 'Watchless' },
                    check: null,
                    success: { text: "Hmm, the time is much earlier than you thought. It's not even close to sunrise yet. You feel invigorated knowing that you haven't been out here as long as it feels. You can't help but wonder how it could be so early. It seems like you've been walking forever.", effects: {} },
                    failure: null
                }
            ]
        },
        {
            id: 'blustery_wind',
            title: 'Blustery Wind',
            description: "The strength and number of gusts picks up dramatically. You weren't aware that it could get this squally in West Virginia. The highest speeds ever recorded in the state's famous \"Derechos\" only ever topped somewhere in the 70s. These gusts feel a lot faster and threaten to blow you away.",
            choices: [
                {
                    text: 'Walk upwind.',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "You fight against the fierce weather. It is as if the heavens are trying to lift you up and fling you far away. Even so, you make it through this horrible, rainless tempest.", effects: { strength: 0.1 } },
                    failure: { text: "You fight against the fierce weather to no avail. You are pushed backwards by the wind and sent skidding off down a hillside. You are injured by the backbreaking fall.", effects: { health: -2 } }
                },
                {
                    text: 'Walk downwind.',
                    check: { stat: 'speed', target: 1.6 },
                    success: { text: "You allow the wind to pull you in one direction. Small voices come to you on the wind, but you ignore them. You are steadily carried elsewhere into the woods.", effects: { speed: 0.1 } },
                    failure: { text: "You run with the wind. For a few minutes it feels pleasant. You run faster than you have ever run before. This feeling dissipates when you trip, falling perilously down a slope of hill.", effects: { health: -1, peaceOfMind: -1 } }
                },
                {
                    text: 'Huddle next to a tree and wait.',
                    check: null,
                    success: { text: "You huddle next to a tree and wait for the bad weather to pass. A branch goes flying through the air, striking both you and the tree, flinging you to the ground. You don't think that you are badly injured by it, but you can feel a small bit of blood oozing from a cut on your forehead.", effects: { health: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'terrified_chittering',
            title: 'Terrified Chittering',
            description: "The leaves stir around you. You look down. Squirrels, mice, chipmunks, and even a raccoon or two are all running past you. They don't even seem to notice that you are there.",
            choices: [
                {
                    text: 'Investigate what they are running from.',
                    check: { stat: 'speed', target: 1.5 },
                    success: { text: "You walk in the direction that the animals were running away from, following the obvious trail that their stir left. You can't pinpoint the exact place that they originate from, but you feel the woods darken a little as you walk. The moon still shines, but it is less bright. You must leave this place.", effects: { knowledge: 1, closeToPower: 1, forceShallowerMove: true } },
                    failure: { text: "You walk in the direction that the animals were running away from, following a trail that you think they may have left behind. Though you are able to follow small paw prints for a little while, you eventually lose track of them. You turn around to go back to the section of the forest you came from, but can't orient yourself.", effects: { peaceOfMind: -1, forceDeeperMove: true } }
                },
                {
                    text: 'Follow them.',
                    dualCheck: [
                        { stat: 'visibility', target: 1.3 },
                        { stat: 'speed', target: 1.4 }
                    ],
                    success: { text: "You run after the animals, keeping pace with a few of the smaller ones. Normally, they would climb trees, but they don't. You dodge a few that fall down, apparently dead. Your sprint, unfortunately, does not let you maintain your course and you eventually slow down. You look about. The woods are a bit more familiar here, despite your failure to catch the animals.", effects: { knowledge: 1, closeToPower: -1, forceShallowerMove: true } },
                    failure: { text: "You follow the animals, hurrying as fast as you can after them. As you run, your foot kicks something. It's a little raccoon, covered in lacerations. You remove your foot, revolted and a little bit sad. The brief pause makes you lose sight of the animals. Even so, the woods look a bit kinder here. They are almost familiar.", effects: { peaceOfMind: -1, closeToPower: -1, forceDeeperMove: true } }
                },
                {
                    text: 'Observe them.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You squint your eyes at the large crowd of animals rushing through the forest. Some of them have odd lacerations all over their body, as if they have been cut many times by something. You can also see that some of them are quite scared, blindingly so. A few bump into you, ignoring your presence in their flight.", effects: { knowledge: 2 } },
                    failure: { text: "You peer at some of the larger and more distinguishable animals that are fleeing. A few are bumping into you, terrified out of their minds it seems. You squint your eyes to make out a raccoon running away a few paces from you. It has had its eyes removed. You recoil in horror at the sight and look away.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "This is not some animated movie. You have no time to go chasing off after animals.", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'stares',
            title: 'Stares',
            description: "Are those eyes shining in the distance? Far away on a hill, you think that you can see some eyes glinting in the moonlight, shrouded by an odd figure. It could just be an illusion of your paranoid brain, but what if it is something else?",
            choices: [
                {
                    text: 'Look for more.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You glance at the hills, searching for more eyes. One by one, you spot more and more suspicious fulgurations. They slowly shift, moving in a variety of directions. None appear to move towards you, which you are thankful for.", effects: { knowledge: 1, closeToPower: 1 } },
                    failure: { text: "You peer at the hill, noting a number of other subtly shifting fulgurations in the dark. None, thankfully, seem to be headed your way. You glance around at the woods around you and realize that these glimmers of light can be seen in every direction. They do not need to move your way. You are trapped.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You quickly walk in the opposite direction of the eyes, refusing to look back. Curiosity digs at you, but you stifle it.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'gushing_water',
            title: 'Gushing Water',
            description: "The rushing of water tells you that a small waterfall is nearby. You make your way over to it and realize that it is actually a somewhat big waterfall tumbling steeply off of the rocks.",
            choices: [
                {
                    text: 'Climb it.',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "You begin to scale a drier section of the rocks, slowly climbing one stone after another. It is hard work, but you are able to easily reach the top and continue on your journey.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You leap from one rock to another, hoisting yourself from boulder to boulder. You are about to reach the top when, without warning, one of the rocks comes off in your hand, sending you crashing down into a pool of water below. Though this cushions your spine, you struggle to leverage yourself back onto your feet.", effects: { health: -2 } }
                },
                {
                    text: 'Pass behind it.',
                    dualCheck: [{ stat: 'strength', target: 1.2 }, { stat: 'visibility', target: 1.3 }],
                    success: { text: "You hurriedly clamber behind the falls, water sprinkling your clothes and face.", effects: {}, opensWaterfallCave: true },
                    failure: { text: "You are partway toward the middle of the falls when a glimmer of something up ahead catches your eye. This distracts you, causing you to misplace your foot and tumble straight into the water. You float a bit downstream, careening into rocks, before making it to safety.", effects: { health: -2 } }
                },
                {
                    text: 'Cross it.',
                    dualCheck: [{ stat: 'strength', target: 1.3 }, { stat: 'speed', target: 1.4 }],
                    success: { text: "You lightly hop on the sturdiest boulders you can find. With deftness and a little skill, you manage to get yourself across without harm.", effects: {} },
                    failure: { text: "You lightly hop onto the first boulder in your path towards the other edge of the river. Unfortunately, it is loose and it shifts under your weight. You fall, landing awkwardly on your side and soaking the bottom half of your pants.", effects: { health: -2 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You hate to imagine what could happen should you fall into the water this far out of the woods. Out here, nobody could save you from the rushing rapids.", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'goosebumps',
            title: 'Goosebumps',
            description: "The hairs prick up on the nape of your neck. You've entered a grass field. Here you are visible from all directions and can easily be spotted from the treeline. You wouldn't think much of this if it weren't for the pit in your stomach suggesting that something is there waiting just beyond the low hanging branches.",
            choices: [
                {
                    text: 'Walk through the tall grass.',
                    check: null,
                    success: { text: "This is no time to be paranoid. There are no longer any gray wolves in West Virginia. The last one was killed in 1900. You make your way through the tall grass without incident. The gentle swishing makes you nostalgic for days when you were younger and would play in similar fields with friends, hiding from them. You reach the other side of the field and proceed into the woods again. You glance back and see a sight that chills you. It is hardly noticeable, but the grass slightly parts at a different end of the field for a black thing to go lumbering through. You pull your eyes away and hurry off into the night.", effects: { stalked: 1, peaceOfMind: -1 } },
                    failure: null
                },
                {
                    text: 'Crawl through the tall grass.',
                    check: { stat: 'speed', target: 1.5 },
                    success: { text: "You crouch down on your hands and knees and slowly make your way through the field. The grass obscures your movements, making it impossible to distinguish whether or not the grass is moving because of you or the wind. You think you hear some sticks crack in the woods off to another end of the field, but you are not sure about whether or not it was a trick of the mind. You reach the other edge of the field without incident and go quickly on your way.", effects: {} },
                    failure: { text: "You crouch down on your hands and knees and slowly make your way across the field. As you crawl, your hands collide with a number of burs that, though relatively harmless, are quite painful when crouching. Without thinking, you stand up in the middle of the field, forgetting why you were even crawling in the first place, and stalk off toward the forest. You do not notice the grass parting behind you to make way for a large black figure sneaking in your direction.", effects: { stalked: 1, health: -1 } }
                },
                {
                    text: 'Go around the grass field.',
                    check: null,
                    success: { text: "You cautiously make your way around the grass field through the woods, taking care not to walk out into the open. Your attention, diverted by the effort of finding yourself, unfortunately lands you in the middle of a patch of burs, which cover your clothes and bare skin. This is very painful and you let out a loud yelp. Grumbling to yourself, you walk off into the woods, not noticing the parting of the grass far off in the field behind you to make way for a large black figure on your trail.", effects: { stalked: 1, health: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'missing_investigator',
            title: 'Missing Investigator',
            description: "You find an empty police vehicle. It lies on a patch of gravel that might have once come from the side of a road, but you are unable to see any near it. The trees around you are actually so dense that you struggle to conceive of how a car could have made its way into the forest. It is not an old car and has even recently been washed.",
            choices: [
                {
                    text: 'Look around the perimeter of the vehicle.',
                    check: { stat: 'visibility', target: 1.5 },
                    success: { text: "You look around the car and don't immediately spot anything unusual. Your hopes rise as you convince yourself that a road must be nearby.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You look around the car, looping it a dozen or so times. How could something like this have ended up here? You look down at the gravel and notice that one of the edges of the gravel path is impossibly straight. You pick up the rocks. They appear to have been finely cut. The odd finding puzzles you.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Attempt to enter the vehicle.',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "You test the door to the car. It is unlocked for some reason. The inside does not contain much of use to you. You can't find any keys and, on top of that, have no idea how to hotwire a car. There is nothing of interest in the back seat or trunk. Whoever uses this car must be impeccably clean. In the trunk you find a first aid kit. It isn't a compass, but it could help you in a bind.", effects: { grantItem: 'First Aid Kit' } },
                    failure: { text: "You grasp the handle to the car and open the door. It is, to your surprise, open. You rummage around in the glove compartment and, finding nothing, begin sifting around some of the other items in the car. Dang, the radio isn't on either. You go to check under the hood and peer into the engine. Nope, nothing there of interest eith…The hood falls down on your head, leaving you sorely hurt on the scalp.", effects: { health: -2 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You choose not to investigate the car. Hopefully, you can find the officer somewhere around here.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'bark_in_ribbons',
            title: 'Bark in Ribbons',
            description: "You enter a part of the forest where the trees are covered in cuts, their bark completely shorn off in some places. These trees will definitely fall in the next storm.",
            choices: [
                {
                    text: 'Examine the gashes.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "The cuts run deep enough and high enough along the trunk that you can assume that nothing short of a flying beast could have made them. The faint smell of pool chemicals enters your nostrils. You take note of a few older, also deliberate scars on the trees that form different ideograms. The cuts run right through them.", effects: { closeToPower: 1 } },
                    failure: { text: "You walk up close to one of the lower hanging gashes and begin to look it over. It appears that this cut, as well as the others, run deeply through much older scars in the trees. These scars, which must've been decades old, are aligned so as to make some rather strange symbols. One, you notice, is left uncut. Upon gazing at it, you are filled with a deep and primal fear. You look down, noticing how far your head is above the ground, and immediately plummet to the forest floor, hoping to get as close to the dirt as possible. You wait a few moments. What were you just doing? You stand up and brush yourself off. You walk off, deliberately avoiding the other symbol in your presence.", effects: { peaceOfMind: -2, closeToPower: 1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "Whatever made these marks could still be about, noiselessly flying through the forest. You doubt any earthly animal has the ability to pick up a human and take them into the air, but you don't want to take your chances.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'rumors_of_wars',
            title: 'Rumors of Wars',
            description: "There was a struggle here. And a big one at that. Some of the trees are snapped off of their trunks. The undergrowth is flattened or has been pulverized into dirt. A variety of strange torches and tools litter the ground. Massive grooves have been carved into the ground haphazardly, as if great claws had thrown the dirt up in mountainous banks. It is certainly a sight to see. There are no corpses of anything, however.",
            choices: [
                {
                    text: 'Walk through the battlefield.',
                    check: { stat: 'visibility', target: 1.7 },
                    success: { text: "You skirt your way around the mounds of dirt and cuts before hurrying back on your journey.", effects: {} },
                    failure: { text: "You skirt your way around the mounds of dirt and mud, clinging to the more stable patches of dirt in the blasted forest. One wrong step, however, lands you on your bum in a five foot hole, sorely aching from the fall. You pull yourself out of the gash, groaning. The scent of incense, chlorine, and tobacco fills your nostrils. Combined, it is a nauseating stench.", effects: { health: -2 } }
                },
                {
                    text: 'Examine the large cuts.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You look at the myriad of markings along the ground. In the darkness, you can make out what seem to be a couple of human footprints sunk deep into the mud. In other places, the grooves in the ground are long and spindly. These have the awful scent of bleach coming from them, stinging your nose. Other parts of the terrain have huge, misshapen circles in the ground, from which you can smell…cigarette butts? All lie amidst massive indentations in the ground where something heavy must have fallen.", effects: { closeToPower: 1, knowledge: 1, peaceOfMind: -1 } },
                    failure: { text: "You step forward along the ridge of a large indentation in the ground in order to look at the myriad of markings in the darkness. Unfortunately, the wet dirt below you caves in, casting you into the hole. A number of acrid scents assault your nostrils and now your tailbone aches. Luckily, you don't think you have broken it.", effects: { health: -2 } }
                },
                {
                    text: 'Pick up some of the tools.',
                    dualCheck: [{ stat: 'strength', target: 1.2 }, { stat: 'visibility', target: 1.5 }],
                    success: { text: "You deftly make your way around some of the larger indentations and divots in the ground, until you come upon an incongruous stick standing straight up out of the ground. You pull it out with both hands and examine it. It is covered in undecipherable glyphs. You take it with you anyway.", effects: { grantItem: 'Incongruous Staff' } },
                    failure: { text: "You head towards a large stick poking out of the ground and, upon arriving at its position, begin to pull it from the ground with two hands. It comes out easier than you expected and you are sent reeling backwards into a large indentation in the land. You can feel that your bum has been bruised. What's more, the stick you pulled out of the ground snapped in half during the fall.", effects: { health: -2 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You do not wish to see what may have happened here. Whatever did this could still be waiting here.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'carried_by_the_breeze',
            title: 'Carried by the Breeze',
            description: "For a while now, you think that you have been hearing soft whispers coming from afar off.",
            choices: [
                {
                    text: 'Listen to them.',
                    check: { stat: 'health', target: 13, raw: true },
                    success: { text: "You lift your left ear to the wind and listen carefully to the gentle raspings. You can't make out any words at all. The whispering seems to fill you with a hollow feeling, sucking out your emotions. You shake your head. This must be a hallucination. Mustn't it?", effects: { peaceOfMind: -2, closeToPower: 1, knowledge: 1 } },
                    failure: { text: "You lift your right ear to the wind and attempt to make out what is being said. Unfortunately, as quickly as the whispers were heard, they die away. Maybe they were just an illusion after all.", effects: { peaceOfMind: 1 } }
                },
                {
                    text: 'Ignore them.',
                    check: { stat: 'peaceOfMind', target: 13, raw: true },
                    success: { text: "You plug your ears with your fingers, pushing out even the drone of the cicadas. All you can hear now is a mild case of tinnitus. You wait like this for five minutes or so and then unplug your ears. The whispering is gone. You were just imagining things.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You cup your hands over your ears, hoping that'll do the trick. To your dismay, the wind carries the voices through the small cracks between your fingers. You still hear them, their gentle rasping sound grating against your ears.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Follow the voices.',
                    dualCheck: [{ stat: 'speed', target: 1.4 }, { stat: 'health', target: 8, raw: true }],
                    success: { text: "You walk upwind toward what may be the source of the sound. You feel an odd tug at your emotions as you progress, but think little of it. Eventually, the whispers die away and you are left contemplating the odd sensation that you felt.", effects: { closeToPower: 1 } },
                    failure: { text: "The whispers seem to be coming from everywhere. They tug at your heart, beating away emotion. You feel cold inside and this makes you despair. But even despair is quickly pushed out. What did you do to deserve this? The whispers die off, flooding you with blessed pain.", effects: { peaceOfMind: -2 } }
                }
            ]
        },
        {
            id: 'paw_prints',
            title: 'Paw Prints',
            description: "You see some dog tracks. Could it be...?",
            choices: [
                {
                    text: 'Call out for the dog.',
                    check: null,
                    success: { text: "You cup your hands over your mouth and holler a few words to see if the dog is somewhere in the area. Unfortunately, it seems that it isn't.", effects: {} },
                    failure: null
                },
                {
                    text: 'Follow the tracks.',
                    check: { stat: 'visibility', target: 1.4 },
                    success: { text: "You eventually arrive at a spot where the tracks have disappeared on firmer ground. You are disappointed, but at least your surroundings look a bit less confusing.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You fail miserably at discerning where the paw prints lead and you worry about your fate.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Recall happy memories with your dog.',
                    condition: { stat: 'peaceOfMind', max: 3 },
                    check: null,
                    success: { text: "Your dog loves to play Tug-O'-War with the toys you bought her. When you find her, you'll have to buy her something extra special to play with. And maybe take her on longer walks too.", effects: { peaceOfMind: 2 } },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "It's more important that you find your way out of here now. It wouldn't even matter if you found your dog at this point.", effects: { peaceOfMind: -1, insanity: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'rooms_of_a_cave',
            title: 'Rooms of a Cave',
            description: "A shallow cave lies in the ground. West Virginia is known to be pockmarked with an endless number of chasms. This one looks relatively small and accessible. It shouldn't be difficult to enter it.",
            choices: [
                {
                    text: 'Enter the cave.',
                    check: null,
                    success: { text: '', effects: {}, opensCaveSubChoices: true },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "One of the most foolish things you can do is enter a cave at night while alone. There is no telling what could happen to you if you fell down some unseen shaft. The thought makes you queasy.", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'fearsome',
            title: 'Fearsome',
            description: "The night isn't safe. You are absolutely sure now that you are not alone. You come across various lines of potholes in the dirt and can't help but notice how organic they are. Something keeps flitting about just outside your field of vision, intruding too often into your sight for it to be a mere trick of the light.",
            choices: [
                {
                    text: 'Make as much noise as you can.',
                    check: null,
                    success: { text: "What is out there? Can it be of service to you? You try as hard as you can to entice the sneaking beast in your direction, calling out to it.", effects: { stalked: 2, insanity: 1 } },
                    failure: null
                },
                {
                    text: 'Trod more carefully.',
                    dualCheck: [{ stat: 'visibility', target: 1.3 }, { stat: 'strength', target: 1.3 }, { stat: 'speed', target: 1.3 }],
                    success: { text: "You retreat to a series of potholes and begin to hop through them. They smell foul, much like the odor of some mixture of cigarettes and paint. Though it makes you gag, you realize that it must mask your own scent somehow. If whatever is following you is tracking you with its nose, it'll certainly have a harder time now. The exertion required of your task motivates you to continue.", effects: { randomCharBoost: 0.1 } },
                    failure: { text: "You seek out one of the lines of potholes you had come across, but find none. Instead, you discover that your wanderings have increased the quantity of odd encounters you have been experiencing, as if you'd accidentally walked closer to the movement in the night.", effects: { stalked: 1 } }
                },
                {
                    text: 'Hide.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You walk until you reach another line of potholes. They are deep enough in the earth that you can fit into one. Upon climbing into it, you are assaulted by the smell of cigars and odious chemicals. Holding back vomit, you lightly cover yourself in leaves. The despicable stench, thankfully, covers your own. A few paces away, you hear the creaking of sticks and movement. Before long, whatever was there walks away. You are safer now.", effects: { peaceOfMind: 2 } },
                    failure: { text: "You creep toward a large fallen tree and stow yourself away next to it. Within minutes, something is lumbering around a hundred meters from where you are on the other side of the log. It comes closer, suspirations making soggy noises as it seeks you out with its nose. You crawl away as it makes its way toward the log. You don't know if it notices your departure and you don't turn around to make sure.", effects: { stalked: 1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "It will take you.", effects: { stalked: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'bridge_over_troubled_water',
            title: 'Bridge Over Troubled Water',
            description: "You come to a bridge over a stream. It doesn't look old or termite-infested.",
            choices: [
                {
                    text: 'Cross it.',
                    check: null,
                    success: { text: "It is made from sturdy wood and hardly creaks as you walk along it. You make it to the other side without incident.", effects: {} },
                    failure: null
                },
                {
                    text: 'Cross it, but examine the bridge as you go.',
                    check: { stat: 'visibility', target: 1.4 },
                    success: { text: "You take a peek around the bridge and find a carving in English that says, \"Ahn memorie de Mr. N. Linton, a Grate Leeder ihn teh fite.\" What odd spelling! It is as if it is some hybrid of ancient English and something stranger.", effects: { knowledge: 1 } },
                    failure: { text: "You search the middle of the bridge and look underneath it. A grate has been fashioned to trap larger objects that fall into the stream. The style of its mesh swirls in a number of loops and pivots. You aren't sure why this would function better than the finer, more square grates used to catch debris, but you also aren't really sure why this would be there at all.", effects: { closeToPower: 1, peaceOfMind: -2 } }
                },
                {
                    text: 'Avoid the bridge. Rock hop across the stream.',
                    dualCheck: [{ stat: 'speed', target: 1.4 }, { stat: 'visibility', target: 1.3 }],
                    success: { text: "You maneuver yourself from one rock to the other, water flowing quickly beneath you. You come close to falling in a few times, but make it easily to the other side.", effects: {} },
                    failure: { text: "A misplaced foot lands you headfirst into the water and you are taken a small ways downstream by the rushing water. Your ankle is slightly twisted and your fall may have also bruised your back.", effects: { health: -2 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You will find another way forward. You grumble in the back of your head about what a nuisance all this searching is becoming.", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'unsteady_ground',
            title: 'Unsteady Ground',
            description: "The earth is unsteady beneath your feet. Your walking leads you to a very peculiar patch of forest. Here, the trees have begun to sink beneath the forest floor. In fact, the ground is covered in most places by thick mud. Wherever you trod, it sinks a little and squelches beneath your feet.",
            choices: [
                {
                    text: 'Move away from it.',
                    check: { stat: 'speed', target: 1.5 },
                    success: { text: "You hop from rock to rock, avoiding sticking your shoes in the mud. The jumping helps your muscles recall the balance you felt that you had once lost as a child.", effects: { speed: 0.1 } },
                    failure: { text: "You attempt to hop around on firmer bits of ground and on rocks, but fall straight into the mud. It has the foul and rotten smell of necrosis. Did you just fall into the remains of an animal carcass?", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Dig.',
                    check: { stat: 'strength', target: 1.4 },
                    success: { text: "You start to dig, first a few inches, then almost a foot. The ground is far softer than you expected it to be. It is a wonder that it has still held your weight. Once you hit a foot and a half, a bubble rises to the top of the mud and bursts, emitting the most inconceivably horrific odor ever to have assaulted your nostrils. You pull back, disgusted.", effects: { peaceOfMind: -1 } },
                    failure: { text: "You dig down an inch or two and immediately hit a rock. The mud smells absolutely horrible. Why would anything be beneath it?", effects: {} }
                },
                {
                    text: 'Dig deep.',
                    condition: { stat: 'insanity', min: 4 },
                    check: null,
                    success: { text: "You start to dig. The mud is soft and warm to the touch. Despite its smell, its feeling is almost comforting to your touch. You have begun to burrow a nice two foot hole in the ground. Your fingers slide across the moist, smooth ooze. It feels nice. As you do so, you begin hoisting warm lumps out of the ground attached by a root to a greater body. This is where the warmth is coming from. You hold one close, allowing its sensation to wash over you.", effects: { insanity: 1 } },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You can't leave the ground!", repeatsChoices: true },
                    failure: null
                }
            ]
        },
        {
            id: 'over_the_moon',
            title: 'Over the Moon',
            description: "A dark shadow moves across the moon. By chance, you spy a winged figure slide across the moon thousands of feet in the air. You only catch a quick glimpse of it before it continues on its journey.",
            choices: [
                {
                    text: 'Try to make out what it is.',
                    check: { stat: 'visibility', target: 1.5 },
                    success: { text: "It takes a minute before your eyes find the winged beast. As you follow it, you notice cruel hooks jetting from where its legs should be and a bulbous hump above its head. Its wings would be nearly bat-like were it not for their faint glow. You tear your eyes away from it, disgusted by the hideous monstrosity. You will have to consult a chiropterologist about this once you get out of the forest.", effects: { peaceOfMind: -1, closeToPower: 1 } },
                    failure: { text: "Your eyes fail to find what you saw amidst the starry night sky. You surmise that you witnessed a mere trick of the light.", effects: { peaceOfMind: 1 } }
                },
                {
                    text: 'Look away.',
                    check: null,
                    success: { text: "It is better to be ignorant of the things in this forest than to know what might be out there. Letting your imagination run free could be poisonous.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'an_old_shed',
            title: 'An Old Shed',
            description: "You find an old shed. It is about the size of a small kitchen and enough to house at least one car. You can't see any other structures around it, but the front door is hanging open.",
            choices: [
                {
                    text: 'Enter.',
                    check: null,
                    success: { text: '', effects: {}, opensShedSubChoices: true },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "The shed is bound to be full of rusty instruments. You haven't had your tetanus shot for a while and aren't keen on losing a limb or two to it. Besides, the shed is somebody else's, right?", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'bent_memories',
            title: 'Bent Memories',
            description: "The trees are crooked. What is wrong with the trees in this part of the forest? Their branches have begun contorting into the most indescribable of shapes. Their leafy shoots hang in all sorts of odd fashions and their leaves boast the most peculiar shades of green. The boughs also sway far too much for the amount of wind blowing through the air. Herbaceous woody vines droop from a multitude of them, clawing occasionally at your hair. It is uncanny.",
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: {} },
                    failure: null
                }
            ]
        },
        {
            id: 'lions_and_tigers',
            title: 'Lions and Tigers and…',
            description: "A black bear walks among the trees. Those are definitely a rare sight in West Virginia these days. It has not spotted you yet.",
            choices: [
                {
                    text: 'Hold still.',
                    check: { stat: 'visibility', target: 1.5 },
                    success: { text: "You halt your breathing. Your arms freeze at your sides. You stand as erect and close to a tree as possible. It passes through the forest without noticing you. As it passes, you notice that it is shaking its head. Is it distracted by something?", effects: {} },
                    failure: { text: "You move to a large tree that is a little ways away and press yourself against it. The bear changes its path, heading straight for you. It lumbers closer. 30 steps turn into 20. 20 into 10. 10 into 5. It stops, peering past you. The bear's face is bleeding profusely. Its orifices are leaking blood and an indescribably terrible black fluid. You hold in a scream as it walks past you, unseeing.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Hide.',
                    check: { stat: 'visibility', target: 1.5 },
                    success: { text: "You immediately lie on the ground and cover yourself in leaves, a little trick that you once picked up from reading The Hardy Boys as a kid. When it is dark, one can lie on the ground and not be noticed. The bear changes course toward you, stepping through the leaves. You press your face to the ground awaiting its passage. It leaves and you begin your trek in the opposite direction of its path.", effects: {} },
                    failure: { text: "You hide in the hollow of a dead tree. The inside has entirely been eaten away by mold and fungus. The bear passes on by, not even looking toward you. It is nodding its head for some reason. After it passes, you start to climb out of the tree. The ground caves in beneath you and you fall into a shallow cave, dirt raining down upon you from above. In a daze, you hurriedly stand up and look around. You hear squelching noises all around you, like when you walk through a mud pile. The ground is dry though. Probably just a symptom of the fall. You rang your bell quite hard. You clamber up and out of the sinkhole, continuing in your journey.", effects: { health: -2 } }
                },
                {
                    text: 'Yell at it.',
                    check: { stat: 'visibility', target: 1.5 },
                    success: { text: "You begin yelling at the top of your lungs in the direction of the bear. It immediately takes off as fast as it can, not even looking your way. Wow, that was easy…", effects: {} },
                    failure: { text: "You raise your arms above your head and begin to yell at it. It wheels around wildly and begins running right for you. You continue to yell, but the bear keeps heading straight for your position. You brace yourself for death at its hands, but instead it runs into you. It's blind! The beast has no eyes! Terrified, it runs off in a different direction while you lie winded next to it.", effects: { health: -1, peaceOfMind: -1 } }
                },
                {
                    text: 'Attack it.',
                    check: { stat: 'strength', target: 1.9 },
                    success: { text: "You bum rush the bear, landing a hard punch on its nose. Its face begins bleeding from every pore. Did you do that? Was it already like that? Its eyes are gone, too, which you DEFINITELY did not do. It wheels around, running away.", effects: { health: -1, grantAttribute: 'Ballsy' } },
                    failure: { text: "You square up and land a solid hit on its shoulder. It turns toward you. You see that its face is bleeding. It has no eyes. Something has removed them. You kick it, this time hitting its belly. Its stomach, which you now see is painfully inflated, erupts into an indescribable bloody mass. Horrified, you crawl away from it, but your efforts are not enough. Whatever is behind you slams something hard into your skull. You do not wake up.", effects: { drainHealth: true, customDeathTitle: 'Unto dust you have returned.' } }
                },
                {
                    text: 'Run from it.',
                    check: null,
                    success: { text: "You have always been told that it is a bad idea to run from bears, but your panic overtakes the more rational components of your brain. You run hard through the forest, fearing for your life. A root sticking out of the ground trips you as you run, throwing you flat on your face. You pick yourself out of the dirt and look around. The bear has not followed you.", effects: { health: -1, peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'creeping_darkness',
            title: 'Creeping Darkness',
            description: "Something moves in the night. The suggestions that something is there are subtle. A twig snaps. A branch breaks. The trees sway oddly in the distance. You see a flicker in the corner of your eye. All flash by in an instant, but enough for you to notice.",
            choices: [
                {
                    text: 'Move away from it.',
                    dualCheck: [{ stat: 'speed', target: 1.4 }, { stat: 'visibility', target: 1.4 }],
                    success: { text: "You sneak away in the opposite direction. For a while, you are beset by a paranoid suspicion that something is right behind you. And yet, nothing is behind you. Nothing yet.", effects: {} },
                    failure: { text: "You begin to backpedal, creeping off into darker parts of the woods. You walk over a number of hills but can't shake the feeling that something is behind you. You look back. Nothing is there. And yet…another flicker in the corner of your eye. Nothing is in front of you either. Bother.", effects: { peaceOfMind: -1, stalked: 1 } }
                },
                {
                    text: 'Follow the flicker.',
                    check: null,
                    success: { text: "You swivel your head toward the unseeable foe and fling yourself into the undergrowth, calling upon whatever was lurking about. Something flutters in the corner of your eye again, though you are able to catch a better glimpse of it. It almost looks like it is covered in rags…If you wanted its attention, you certainly got its attention.", effects: { stalked: 2, insanity: 1 } },
                    failure: null
                },
                {
                    text: 'Yell at it to go away.',
                    check: { stat: 'health', target: 15, raw: true },
                    success: { text: "You holler into the night with all of your might. After you finish your yelling, you stop seeing flashes in the corner of your eye.", effects: {} },
                    failure: { text: "Your yell is choked off by a bit of spit in your mouth and you wheeze, coughing a lot. In your state of distraction, you feel like something is behind you. Nothing is there. Nothing is in front of you. For the next long while, you check over your shoulder, hoping to avoid seeing…whatever it is.", effects: { stalked: 1 } }
                },
                {
                    text: 'Shine a flashlight at it.',
                    itemRequired: 'Flashlight',
                    check: null,
                    success: { text: "You shine your flashlight into the inky blackness of the trees. The shadows flit back and forth with the subtle swaying of your torch. You can't see anything at first. After a few more minutes of searching, you make out some eerie aspect receding into the distance between the trunks. What could it be?", effects: { usesFlashlight: 1 } },
                    failure: null
                },
                {
                    text: 'Do nothing.',
                    check: null,
                    success: { text: "It is probably for the best that you do not alert it to your presence. Drawing attention to yourself could easily put you in more danger. You keep walking, cursed by the feeling that something is watching you.", effects: { peaceOfMind: -1, stalked: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'circle_of_gray',
            title: 'Circle of Gray',
            description: "You encounter a circle. The dense undergrowth is cut off precisely where it would grow into the bounds of the ring. Looking up, you also notice that the trees have been substantially trimmed back. All that lies within the circle are a number of stones placed in seemingly haphazard fashion though, at a closer glance, a few appear to have been placed deliberately.",
            choices: [
                {
                    text: 'Kick away the stones.',
                    dualCheck: [{ stat: 'strength', target: 1.4 }, { stat: 'peaceOfMind', target: 11, raw: true }],
                    success: { text: "You wind up and kick a couple of stones out of their original formation. They briefly glow a dull red which fades within a few seconds.", effects: { sotcp: -1 } },
                    failure: { text: "You wind up to deliver a kick to one of the rocks and realize that this might be a foolish idea. Instead, you bend down and grab two hefty ones. You yelp as you feel them burn your hands and fling them onto the ground. A soft red light glows around them and dissipates. They look relatively harmless now, but you don't wish to risk picking them up again.", effects: { health: -1 } }
                },
                {
                    text: 'Take a stone.',
                    dualCheck: [{ stat: 'strength', target: 1.4 }, { stat: 'peaceOfMind', target: 10, raw: true }],
                    success: { text: "You shift a few stones with the tip of your shoe. They briefly glow a deep red after tumbling over before they cool back down to a drab gray. You pick one up. It has a few marks etched into it, but it isn't warm to the touch. Even so, you notice that your shoe is slightly burned and the faint scent of melted plastic hangs in the air.", effects: { sotcp: -1, grantItem: 'Weird Rock' } },
                    failure: { text: "You reach down to pick up one of the stones. Upon making contact with one of them, it glows a hot red and burns you on your skin. You yelp, falling backwards, and resolve not to touch the stones again.", effects: { health: -2 } }
                },
                {
                    text: 'Add a stone to the circle.',
                    check: { stat: 'strength', target: 1.4 },
                    success: { text: "A number of other stones have been piled up in the outskirts of the circle. They look like they have been cut in deliberate ways as well. You pick one of these up and place it on a pile in the circle so that it fits in well with the other stones.", effects: { sotcp: 1 } },
                    failure: { text: "You pick up a stone that you find lying at the outskirts of the circle. It bears no markings, but you might be able to find a place for it amongst the others. You place it on one pile. It looks odd amongst the many unnatural stones and you instinctively shudder.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You decide not to mess with anything in the circle.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        }
    ],
    3: [
        {
            id: 'avant_garde',
            title: 'Avant-Garde',
            description: "A graven statue basks in the light. You can't make out any discernible image or likeness from it.",
            choices: [
                {
                    text: 'Gaze at it.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "Its meaning is entirely indecipherable to you, but the statue's appearance is not entirely displeasing.", effects: { closeToPower: 1 } },
                    failure: { text: "You can hardly make out any details on the statue and stalk off, annoyed at your inability to comprehend the oddness of it all.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Touch the statue.',
                    randomCheck: true,
                    success: { text: "You place your hand on the left side of the statue. A warm tingling sensation infuses your body. You remember buttery corn on Summer afternoons. Hot chocolate after a cold winter's day in the snow. A blanket in front of a fire. You retract your hand, confused. What was that? You leave with a faint sense of longing to one day return to the statue.", effects: { closeToPower: 3, peaceOfMind: -1 } },
                    failure: { text: "You place your hand on the right side of the statue. A sharp cold freezes you from the inside out. You remember the biting chill of a blizzard. The despairing shriek of loss. The stinging hate of an ex-lover. You try to pull your hand away but you are paralyzed. The awful shock of terminal illness. The pain of accidents that never happened. Your mind whirls. The scourge of demons! The fruits of desire! The bitterness of hell! And then\u2026nothing. The inevitability of Oblivion. Your hand falls away and you go scampering off into the woods.", effects: { peaceOfMind: -3 } }
                },
                {
                    text: 'Deface the statue.',
                    check: { stat: 'strength', target: 1.8 },
                    success: { text: "You take a few steps backward and run forward, sending a flying kick into the statue. It topples to the ground, shattering into a thousand pieces. Wasn't it made of stone? Why did it act like glass? A pallid grey light briefly shines from the rocks before fading away. You wonder if you just did something bad. Who knows? Time will tell.", effects: { closeToPower: 2, knowledge: 1, grantAttribute: 'Desecrator', sotcp: -1 } },
                    failure: { text: "You take a few steps backward and run forward, sending a flying kick straight past the statue and grazing it just enough for it to fall over. Unfortunately, your flying jump kick causes you to fall and knock your head on the ground. All goes black for a minute or so and you awake to see the pieces of the statue scattered about you.", effects: { grantAttribute: 'Desecrator', sotcp: -1, health: -2 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You have already been to the Met. There is no need to gaze at another one of modern art's tasteless \"masterpieces.\" Still, you wonder why a statue of this nature has been placed so far out in the woods. The thought troubles you more than it should.", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'totally_lost',
            title: 'Totally Lost',
            description: "It dawns on you that you have no idea where you are. How could this have happened? The woods around here aren't THAT big\u2026 How are you feeling right now?",
            choices: [
                {
                    text: 'Scared.',
                    check: null,
                    success: { text: "I would be too.", effects: { peaceOfMind: -1, grantAttribute: 'Honest' } },
                    failure: null
                },
                {
                    text: 'Sad.',
                    check: null,
                    success: { text: "Have a cookie to cheer you up.", effects: { grantItem: 'Cookie' } },
                    failure: null
                },
                {
                    text: 'Concerned.',
                    check: null,
                    success: { text: "Don't be. This isn't your fight.", effects: { knowledge: 1 } },
                    failure: null
                },
                {
                    text: 'Happy.',
                    check: null,
                    success: { text: "Glad you are enjoying yourself.", effects: { peaceOfMind: 1 } },
                    failure: null
                },
                {
                    text: 'Grossed out.',
                    check: null,
                    success: { text: "Not much to be done about that.", effects: { insanity: -1 } },
                    failure: null
                },
                {
                    text: 'Turned on.',
                    check: null,
                    success: { text: "\u25e6 \u25e6 \u25e6 (\u00b0\u30ee\u00b0)?", effects: { insanity: 1 } },
                    failure: null
                },
                {
                    text: 'Peaceful.',
                    check: null,
                    success: { text: "I like the woods too.", effects: { peaceOfMind: 1 } },
                    failure: null
                },
                {
                    text: 'AMPED.',
                    check: null,
                    success: { text: "Sick, brutha.", effects: { health: 1 } },
                    failure: null
                },
                {
                    text: 'Intrigued.',
                    check: null,
                    success: { text: "Hehe\u2026", effects: { closeToPower: 1 } },
                    failure: null
                },
                {
                    text: 'Nothing.',
                    check: null,
                    success: { text: "\u2026", effects: {} },
                    failure: null
                }
            ]
        },
        {
            id: 'small_miracles',
            title: 'Small Miracles',
            description: "Could it be??? It's your dog! You found your trusty companion! What a miracle!",
            choices: [
                {
                    text: 'Pet your dog.',
                    check: null,
                    success: { text: "Tears well up in your eyes as you hug your beloved pet. It happily leaps at you, making a number of happy woofs and huffs. You can leave the forest now knowing it wasn't all for nothing. What an excellent night.", effects: { peaceOfMind: 3, grantAttribute: 'An Energetic Companion' } },
                    failure: null
                },
                {
                    text: 'Offer it food.',
                    itemRequired: 'Food',
                    check: null,
                    success: { text: "You can see that your dog, much like you, has really been through the ringer tonight. It deserves a treat. You only have some of that odd-looking food you found earlier, but it'll have to do\u2026", effects: { removeItem: 'Food', peaceOfMind: 3, health: 1, grantAttribute: 'An Energetic Companion' } },
                    failure: null
                },
                {
                    text: 'Hit the dog.',
                    check: null,
                    success: { text: "What a bad dog you are\u2026mangy mutt.", effects: { setInsanity: 10 } },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You walk away from your dog without giving it any attention. It follows you anyway.", effects: { grantAttribute: 'An Energetic Companion' } },
                    failure: null
                }
            ]
        },
        {
            id: 'something_wicked',
            title: 'Something Wicked This Way Comes',
            description: "Something is pursuing you. You are beset upon by the fetor of cigars and you glance around to see where it might be coming from. What a wretched stink! Suddenly, the wind dies down. No whispers. No howl. Nothing but a soft, booming thudding sound and it is coming straight for you.",
            choices: [
                {
                    text: 'Fly to the West!',
                    dualCheck: [
                        { stat: 'strength', target: 1.5 },
                        { stat: 'visibility', target: 1.5 },
                        { stat: 'speed', target: 1.5 }
                    ],
                    success: { text: "You will sail once again toward the shores of the Akdelmeer! You will find rest in the valley of the shadow and will fear no beast\u2026for now.", effects: {} },
                    failure: { text: "And lo the temple is cast down! It has been flung to the earth! The indescribable thing bears down upon you, loudly crashing through the trees in your direction. Swift glances over your shoulder only show you a towering, misshapen figure covered in rags and skins. It crosses 20 meters with each step, growing closer by the second. You bob and weave through the growth, using your small size to temporarily get ahead of it. Indeed, you evade it for now, but it has surely caught onto your presence.", effects: { stalked: 1 } }
                },
                {
                    text: 'Fly to the East.',
                    dualCheck: [
                        { stat: 'strength', target: 1.5 },
                        { stat: 'visibility', target: 1.5 },
                        { stat: 'speed', target: 1.5 }
                    ],
                    success: { text: "Arise and make way toward Eden! Begone! Begone! Will you find life in the garden! Or a cherubim and a flaming sword?", effects: {} },
                    failure: { text: "Arise, o pilgrim of the deep! Arise and make way toward Eden! Begone! Begone! But oh, you man! You have fallen from the heavens! Where is thy salvation! The indescribable thing bears down upon you, loudly crashing through the trees in your direction. Swift glances over your shoulder only show you a towering, misshapen figure covered in rags and skins. It crosses 20 meters with each step, growing closer by the second. You bob and weave through the growth, using your small size to temporarily get ahead of it. Indeed, you evade it for now, but it has surely caught onto your presence.", effects: { stalked: 1 } }
                },
                {
                    text: 'Fly to the South.',
                    dualCheck: [
                        { stat: 'strength', target: 1.5 },
                        { stat: 'visibility', target: 1.5 },
                        { stat: 'speed', target: 1.5 }
                    ],
                    success: { text: "A storm cometh from the South! May it spare you and cleanse the land from its devastation! Begone! Begone! You ride on, a prophesied victory it seems. The enemy has lost today.", effects: {} },
                    failure: { text: "A storm cometh from the South! May it spare you and cleanse the land from its devastation! Begone! Begone! There is no mercy in nature, no love from the Great Mother! You are a barren castaway, protected by none. The indescribable thing bears down upon you, loudly crashing through the trees in your direction. Swift glances over your shoulder only show you a towering, misshapen figure covered in rags and skins. It crosses 20 meters with each step, growing closer by the second. You bob and weave through the growth, using your small size to temporarily get ahead of it. Indeed, you evade it for now, but it has surely caught onto your presence.", effects: { stalked: 1 } }
                },
                {
                    text: 'Sneak to the East.',
                    check: { stat: 'visibility', target: 1.9 },
                    success: { text: "Hide thyself in the branches of the Fusang! Does not life reside there! Begone! Begone! The hibiscus will be yours, no doubt. In time, all in good time.", effects: {} },
                    failure: { text: "Quick! Hide thyself in the branches of the Fusang! Does not life reside there! Begone! Begone! But surely it will burn its boughs, for nothing can escape. The indescribable thing bears down upon you, loudly crashing through the trees in your direction. Swift glances over your shoulder only show you a towering, misshapen figure covered in rags and skins. It crosses 20 meters with each step, growing closer by the second. You bob and weave through the growth, using your small size to temporarily get ahead of it. Indeed, you evade it for now, but it has surely caught onto your presence.", effects: { stalked: 1 } }
                },
                {
                    text: 'Sneak to the West.',
                    check: { stat: 'visibility', target: 1.9 },
                    success: { text: "Creep ye onward to the Mount of Temptation. Avoid sin, and fear no evil. Your afflictions will be a boon unto you, little one. This sorrow will end.", effects: {} },
                    failure: { text: "Creep ye onward to the Mount of Temptation. Avoid sin, and fear no evil. Yesterday was the day of your repentance! Why have you squandered it? You are nearly within its grasp! The indescribable thing bears down upon you, loudly crashing through the trees in your direction. Swift glances over your shoulder only show you a towering, misshapen figure covered in rags and skins. It crosses 20 meters with each step, growing closer by the second. You bob and weave through the growth, using your small size to temporarily get ahead of it. Indeed, you evade it for now, but it has surely caught onto your presence.", effects: { stalked: 1 } }
                },
                {
                    text: 'Sneak to the South.',
                    check: { stat: 'strength', target: 1.9 },
                    success: { text: "Ah, to find Pangaia! Oh, to be a subject of Olympia and not the cruel misery of the here and now! Quiet springs and peaceful fields are your future. You will not die here! You will not!", effects: {} },
                    failure: { text: "The defiler of paradise comes and no god may save you\u2026paradise is lost. The indescribable thing bears down upon you, loudly crashing through the trees in your direction. Swift glances over your shoulder only show you a towering, misshapen figure covered in rags and skins. It crosses 20 meters with each step, growing closer by the second. You bob and weave through the growth, using your small size to temporarily get ahead of it. Indeed, you evade it for now, but it has surely caught onto your presence.", effects: { stalked: 1 } }
                },
                {
                    text: 'Escape to the North.',
                    check: null,
                    success: { text: "You fool! You've misjudged which direction it was barreling toward you from! It is upon you! There is nothing to be done now! Noth\u2026", effects: { stalked: 3 } },
                    failure: null
                },
                {
                    text: 'Do nothing.',
                    check: null,
                    success: { text: "You lie upon your face, huddling as close as you can to the ground. It won't see you, but it'll get a hold on your presence, enough to make your capture nearly inevitable. You must leave these woods. You must!", effects: { stalked: 2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'roiling_ground',
            title: 'Roiling Ground',
            description: "The earth is throbbing beneath your feet. Red mud clings to your shoes as you walk. The odor of roadkill and cadavers clouds your nostrils and you struggle on, desperately seeking out fresh air. Vile red pustules burst angrily out of the ground, exploding into a disgusting ooze if stepped on. Every plant you see has developed sickly yellowish-brown cancers unlike any earthly disease you have heard of. You sometimes feel the most odious pulsations when you take a step, as if some massive growth was spread out below the dirt.",
            choices: [
                {
                    text: 'Trod more carefully.',
                    check: { stat: 'speed', target: 1.5 },
                    success: { text: "In the distance, you spot a more normal grove of trees and pick your way toward them. It takes the better part of twenty minutes, but you make it out without incident.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You wend your way through the alien undergrowth, increasingly growing agitated as the Jovian world about you seems to stretch on forever. This must end soon. It surely must\u2026", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Get out as fast as you can.',
                    check: { stat: 'speed', target: 1.6 },
                    success: { text: "You start up a brisk jog through the forest, focusing only on your path ahead. This distracts you from the strangeness of the environment.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You start up a brisk jog through the forest, focusing only on your path ahead. Suddenly, your leg sinks into a particularly deep patch of reddish mud, letting forth a sickening slurp. You dry heave in disgust. What an awful place.", effects: { peaceOfMind: -1, health: -1 } }
                },
                {
                    text: 'Dig.',
                    check: null,
                    success: { text: "You kneel down and spread your hands through the muck. It gives off a wonderfully comforting warmth, like the hug of an old friend or your mother. Yes, this is where you should be. You use your fingers to pull soft gobs of mud out of the earth, reaching for that splendid calidity. But the pulsing is still too far beneath you. You must seek it out closer to the surface.", effects: { insanity: 2, closeToPower: 1 } },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "Leave?! You are already trying to leave!", effects: {}, repeatsChoices: true },
                    failure: null
                }
            ]
        },
        {
            id: 'an_old_wall',
            title: 'An Old Wall',
            description: "An old wall looms before you. Unfortunately, you can see no end to it in the darkness. It must have fallen over somewhere, but getting to that point might take a bit of trudging through the undergrowth.",
            choices: [
                {
                    text: 'Climb over the wall.',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "You deftly ascend and then descend the stone barrier. Your arms will be sore in the morning, but you are pleased that the strength of your upper body held out so well.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You grasp the rocks and heave yourself onto the top of the wall. You sit down, breathing heavily on the edge and turn around so as to descend the other side. A gust of wind hits you hard, loosening your hold enough to cause you to swing out and down the wall. You hit the ground with a hard thud.", effects: { health: -2 } }
                },
                {
                    text: 'Push the wall over.',
                    check: null,
                    success: { text: "You place pressure on one of the stone supports. It won't budge.", effects: {}, repeatsChoices: true },
                    failure: null
                },
                {
                    text: 'Jump over the wall.',
                    check: { stat: 'speed', target: 2.0 },
                    success: { text: "You walk back a few meters and take a running jump. You turn on your back like a track and field athlete and BARELY make it over. Wow, maybe you are more athletic than you thought.", effects: { peaceOfMind: 2, health: 2 } },
                    failure: { text: "You walk back a few meters and make a running jump over the wall. You try to imitate what you have seen other athletes do but, instead of helping your situation, you slam headfirst into the wall.", effects: { health: -2 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "The bushes around you have been thicker as of late. Backtracking and finding a hole in the stones will be a pain. Still, you manage to find your way through. You scowl at the inconvenience of the plants tearing at your shirt.", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'bad_memories',
            title: 'Bad Memories',
            description: "The trees look wrong. Are these really trees? What horrific sylvan flora inhabit these woods? Their branches no longer grow straight around you, but rather curve and loop into impossible knots. The leaves have lost their regularity, contorting into the most unnatural shapes. This place is no different from the alien worlds described in books.",
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'burrs_and_thistle',
            title: 'Burrs and Thistle',
            description: "The underbrush clings to you, snatching at your clothes and hooking into your skin. You have felt stinging nettle and other nasty plants before, but nothing this troublesome. When given the chance, the barbs latch onto your skin, making small papercuts that sting and weep little droplets of blood.",
            choices: [
                {
                    text: 'Push on through.',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "You pull yourself away from plants wrapping themselves around your legs and stride on, avoiding them when you can. Before long, you reach a clearer patch of the forest and breathe a sigh of relief.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You pull yourself away from the little stems and leaves wrapping themselves around your pants and hear a loud RIIIIPPPP. One of your pockets is totally torn away. You clamber away to avoid further damage, but worry that you might have lost something of yours.", effects: { removeRandomItem: true } }
                },
                {
                    text: 'Tear at the plants.',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "You snatch at the less thorny bits of the plants grabbing at you and delicately peel them off. They are hesitant at first, but eventually bow to your superior strength. Your flight from this section of the forest is slow-going, but you make it out for now.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You violently tear at the annoying plants clinging to your clothes and skin. Blood runs down your hands and arms from the effort. As you hold back tears, you notice the vines moving in the direction of your blood as it soaks into the soil.", effects: { health: -2 } }
                },
                {
                    text: 'Examine pieces of the plants.',
                    dualCheck: [{ stat: 'strength', target: 1.5 }, { stat: 'visibility', target: 1.4 }],
                    success: { text: "You cautiously make your way through the bushes. Once you reach a clearer part of the forest, you reach down and pluck one of the stems off the nettle bushes. They are covered in jagged hooks and have serrations along multiple parts of the plant. There aren't even patterns to how they appear.", effects: { peaceOfMind: 1, knowledge: 1, closeToPower: 1 } },
                    failure: { text: "You cautiously make your way through the bushes. Upon reaching a somewhat clearer part of the forest, you reach down and attempt to pluck one of the stems off of the plants. As you do so, its leaves and vines somehow get wrapped around your hand and arm. You pull back your arm, but not without suffering severe lacerations all over your body.", effects: { peaceOfMind: -1, health: -2 } }
                }
            ]
        },
        {
            id: 'lights_in_the_caves',
            title: 'Lights in the Caves',
            description: "West Virginia is somewhat known for having a variety of caves interspersed throughout its landscape. Some have streams running through them. Others show up in the middle of cattle fields. You have stumbled upon an area containing such an environment. However, there are clearly torches or lanterns of some kind flickering within them.",
            choices: [
                {
                    text: 'Enter a cave.',
                    check: { stat: 'strength', target: 1.4 },
                    success: { text: "You make your way toward the most accessible one. There aren't any lights in it, but you are fairly certain that it is connected to the others. Unfortunately, upon entering, you find that there exists a large chasm between you and the rest of the cave.", effects: { health: 1 }, opensLightsCavesSubChoices: true },
                    failure: { text: "You scramble toward the cave entrance but the rocks surrounding it are slick and unstable. You nearly lose your footing twice before abandoning the attempt entirely.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Avoid the caves.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You use the lights in the caves as markers telling you where to avoid venturing. In a way, they help you make your way to a more traversable section of the forest.", effects: {} },
                    failure: { text: "You attempt to use the lights in the caves as markers to show you where to avoid, but you ultimately find yourself venturing in circles.", effects: { peaceOfMind: -1 } }
                }
            ]
        },
        {
            id: 'yawn',
            title: 'Yawn',
            description: "An entire hill has been ripped open. You stop. What is this? Where there was clearly an incline in the earth, there is now a massive tear, as though the world itself had been wounded. You step up to the injurious anomaly and peer around. Several tunnels, some big, some small, lead off many feet below the ground. You knew West Virginia had caves, but a blast large enough to tear up the landscape this way should have been more than sufficient to collapse any around here.",
            choices: [
                {
                    text: 'Enter a tunnel.',
                    check: null,
                    success: { text: "You pick a tunnel big enough to fit you and you climb into it. It stretches far away into the darkness, flat enough that you can walk through it.", effects: {}, opensYawnTunnelSubChoices: true },
                    failure: null
                },
                {
                    text: 'Go around the hill.',
                    check: { stat: 'speed', target: 1.5 },
                    success: { text: "You circumnavigate the area of the hill and continue on.", effects: {} },
                    failure: { text: "You carefully traverse the series of holes leading downwards into the tunnels. As you walk between two particularly large ones, the earth gives way, sending you tumbling down into one. You scramble your way back up, but are reasonably sure that some of the cuts you got on the way down are deeper than they first appear.", effects: { health: -2 } }
                }
            ]
        },
        {
            id: 'glassed',
            title: 'Glassed',
            description: "Entire boulders have been shattered near where you stand. And yet, there are no cliffs nearby. It is as if the hammer of God had fallen suddenly and swiftly upon the earth, breaking its contents to pieces.",
            choices: [
                {
                    text: 'Examine the stones.',
                    check: { stat: 'visibility', target: 1.5 },
                    success: { text: "You study the gouges more closely, inspecting the large faults formed by whatever had annihilated them. Carved onto them are a series of almost-glowing symbols which hurt to look at. What's worse, several are pockmarked with irregular holes and divots of an entirely unnatural design. They may have once contained something, like in a wasp's nest, but nothing is there now.", effects: { closeToPower: 1 } },
                    failure: { text: "You study the rock faces more closely. They are interlaced with a variety of symbols that almost seem to glow in the dark. You run your hand along a few of them, feeling the divots they have left in the stone. You turn your eyes to another oddity amongst the boulders, a large patchwork mosaic of strange irregular holes left in the stone. They likely contained something once, but most do not now. One of the holes appears to have something bright inside of it. You approach this hole and look in. At first, you see naught but an impossible mixture of blackness and pinpricks of light. Before long, however, the light swells up, flaring and beaming as if the fires of Sodom and Gomorrah. The sudden flash burns into your retinas.", effects: { health: -1, temporaryDebuff: { stat: 'visibility', amount: -0.1, uses: 3 } } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "Better to hurry on...", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'forgotten_post',
            title: 'Forgotten Post',
            description: "You come across a signpost with no road near it. The lettering on it is mostly gibberish, but you can make out one word for a \"Point Pleasant\" some 40 miles ahead. What's more odd than the lettering is the mere instance of the sign at all. It looks modern, like what one would see on the highway, and yet there is no reason it should be all the way out here.",
            choices: [
                {
                    text: 'Continue reading what it says.',
                    check: { stat: 'visibility', target: 1.7 },
                    success: { text: "In finer print below the white letters is emblazoned a series of words akin to a message. You squint in the moonlight and trace your hand along them. \"Eckspanshun...ehvidance...\" \"Expansion evidence?\" What does that mean?", effects: { knowledge: 1 } },
                    failure: { text: "Several fragments of text have been written beneath the white, normal letters of the sign. A few seem intelligible, but several are clearly glowing. You take a peek at them and stare at their abnormal curves. They twist and bend in areas they shouldn't. Their long sleek lines peel away at the cloth of the night, warping it around them and...you awake, startled at your reverie.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Push the sign over.',
                    check: { stat: 'strength', target: 1.5 },
                    success: { text: "You square your shoulders and roughly push on the metal. The sign falls over with relative ease, splitting off chunks of scrap metal.", effects: { grantItem: 'Scrap of Metal' } },
                    failure: { text: "You take a flying kick at the sign. It crumbles easily under your weight, but your momentum carries you farther than you wished. Your leg catches on one of the stray pieces of metal, cutting you.", effects: { health: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "What a weird thing to see out in the woods.", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'paths',
            title: 'Paths?',
            description: "You find a trail...no, a series of trails. Before you stands several paths proceeding somewhere off into the woodland. One even appears to loop back around and connect with another. The sides of the paths are well-defined, with bits of wood delineating their boundaries.",
            choices: [
                {
                    text: 'Follow one of the paths.',
                    check: null,
                    success: { text: "Well, they will clearly take you somewhere. You start off along one, trekking along curiously more even ground than before. The going is certainly easier, but you start to note peculiar oddities as you progress further along the path. The shadows grow darker, the moon angrier, and the trees more aloof. Eventually, the trail ends as quickly as it began and you turn backwards, hoping to go back the way you came, but it's gone now.", effects: { removeLeafToken: true } },
                    failure: null
                },
                {
                    text: 'Avoid the paths.',
                    dualCheck: [{ stat: 'visibility', target: 1.4 }, { stat: 'speed', target: 1.4 }],
                    success: { text: "Something isn't right here. You can't put your finger on it, but the trails are just...too organic. There aren't even any shoeprints cutting through them. They are pristine and you haven't seen anything like them before. You leave in a direction that doesn't have any paths. While it seems like an illogical decision at first, you feel good about it.", effects: {} },
                    failure: { text: "Something isn't right with these trails. They are simply too...pristine. Besides the boundaries, nothing suggests that they have been trekked recently. No footprints, no trash, no trailblazes. You turn around to leave, but realize that, somehow, you are already on one of the paths. You step out of the ring and are immediately tripped by one of the woody bits surrounding the trail. Was it really that high? Dirt gets in your eyes as your face smacks the ground. You aren't hurt, but you won't see very well for a little while.", effects: { temporaryDebuff: { stat: 'visibility', amount: -0.1, uses: 5 } } }
                }
            ]
        },
        {
            id: 'freezing',
            title: 'Freezing',
            description: "A piercing chill cuts into you, emanating from some foreign source. The feeling is highly uncharacteristic of any West Virginia night you've ever experienced. In fact, it seems to be arising from a dell to your East.",
            choices: [
                {
                    text: 'Approach the cold.',
                    check: null,
                    success: { text: "Curious, you walk toward the dell, growing increasingly uncomfortable by the gnawing frigidity that now penetrates your whole body. You shuffle forward, reaching a near hypothermic state as you step into the clearing. And then you stop. Your legs will go no further. Some carnal instinct wills you to backpedal and you retreat to an area of greater warmth.", effects: { stalked: 1, insanity: 1 } },
                    failure: null
                },
                {
                    text: 'Avoid the cold.',
                    dualCheck: [{ stat: 'speed', target: 1.7 }, { stat: 'visibility', target: 1.0 }],
                    success: { text: "You quicken the pace of your strides away from the cold spot. Soon enough, you reach warmer air and, with it, shed the unease you felt.", effects: { health: 1, peaceOfMind: 1 } },
                    failure: { text: "You quicken the pace of your strides away from the cold spot. As you walk, the cold seems to move away from the dell, following your progress as you race away. The air grows colder and colder, stabbing icy daggers into you. You fall on your face just as the epicenter of the chill approaches you. You wait, listening as the trees rustle. The smell of tobacco floats into your nose and you start breathing out of your mouth. You lie there for the better part of an hour until the cold leaves.", effects: { stalked: 1 } }
                }
            ]
        },
        {
            id: 'shoeprints',
            title: 'Shoeprints',
            description: "You think that you may have stumbled onto a path. There are what appear to be shoeprints in the ground right in front of you. The image of them repeats too often to simply be a trick of the light. You follow them, tracing a path toward civilization…hopefully. The footprints eventually stop showing up in the ground. You are disappointed, but not surprised at your misfortune. Even so, maybe these footprints led you somewhere helpful.",
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: {}, collectLeaf: true },
                    failure: null
                }
            ]
        },
        {
            id: 'pothole',
            title: 'Pothole',
            description: "You fall thigh deep into a hole filled with corpses of various shapes and sizes. The scent is vile and changing, mixing the awful odors of blood, phlegm, marrow, and muscle into a sickening blend. You plug your nose with one hand, to no avail.",
            choices: [
                {
                    text: 'Clamber out of the hole.',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "Without looking down, you pull one leg almost completely into the air, an appalling squelch following it. The ground surrounding the pit is muddy and you fumble around for a grip. After a few seconds, your hand falls on a root, giving you enough leverage to leave the hole.", effects: {} },
                    failure: { text: "You swing your arms around wildly grasping at nothing but mud and decay. Your hand falls on a rotting head of unknown origin and, in your frenzy, you pull it straight out of the muck, detaching it from its body. Though you fling it away, you can't help but notice that the gaze of the cold, dead eyes was oddly human...", effects: { health: -1, peaceOfMind: -1 } }
                },
                {
                    text: 'Examine the carcasses.',
                    dualCheck: [{ stat: 'strength', target: 1.3 }, { stat: 'visibility', target: 1.5 }],
                    success: { text: "At first, your adrenaline and panic creates a tonic that prevents you from thinking straight. Your mind is already roiling from the strange events of the night, but, following several disquieted moments, you bring up the nerve to look around. Many of the corpses are definitely animal carcasses, but several are almost certainly human. You wade through the bodies to gaze at one that is upright and peer at it. The arms, legs, and torso are all right, but the head...the head does not look like any person you have ever seen. The eye sockets are shriveled far back into the skull and the face, including the forehead, is pockmarked with deep, scarring acne. The little holes run so deep in some places that you felt like you should have seen bone. Strangely enough, the inhumanness of the people-like things comforts you. Maybe they aren't humans, but some other odd creature.", effects: { knowledge: 1 } },
                    failure: { text: "The adrenaline and stress of the night take hold of your mind, throwing you into a panic. You swivel your head around, attempting to comprehend the death that surrounds you. Just a foot away from you lies what you know to be a person. What a horrible, horrible thing! Its face is marred and twisted, as if it has been stabbed with many little pricks. You have to get out of here...you have to get out of here.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Take a carcass with you.',
                    check: { stat: 'strength', target: 1.7 },
                    success: { text: "With little effort, you manage to leave the pit. Turning back, you realize that there is actually quite a bit of fresh game getting left behind. Ignoring some of the more...person-like corpses, you latch hold of a dead rabbit and pull. The animal comes out cleanly and you walk off with it in tow.", effects: { grantItem: 'Food' } },
                    failure: { text: "With little effort, you manage to leave the pit. Turning back, you realize that there is actually quite a bit of fresh game getting left behind. You reach for what looks like the head of a raccoon and tug at it. It doesn't come loose. You tug a bit harder and slip right back into the pit, this time landing on top of what definitely looks too much like a person for your liking.", effects: { health: -1, peaceOfMind: -2 } }
                }
            ]
        },
        {
            id: 'scorching_blaze',
            title: 'Scorching Blaze',
            description: "A wooden fort is on fire. It won't cause a forest fire, will it? You'd hate to see the whole woods go up in smoke.",
            choices: [
                {
                    text: 'Watch the figures from afar.',
                    dualCheck: [{ stat: 'visibility', target: 1.4 }, { stat: 'speed', target: 1.3 }],
                    success: { text: "You can feel the blaze from a hundred meters away. A larger, more muscular figure appears dragging what looks like a large fire hose and starts dousing the flame. Before long, the fire is extinguished and the people retreat into the woods. You run toward them in an effort to catch up to them but they are gone.", effects: { sotcp: 1, closeToPower: 1 } },
                    failure: { text: "You can feel the blaze from a hundred meters away, but still decide to creep as close as you can. As you are walking, you spot a large, muscular figure dragging what appears to be a large fire hose toward the inferno. You attempt to walk silently in his direction, but accidentally snap a twig with your foot. The man, distracted, looks in your direction, pausing with the hose. You have been cau…BOOM! The fort explodes into a million pieces, shards of wood ripping through the air. Splinters, charcoal and ash fly into your skin, throwing you backward.", effects: { health: -2, sotcp: -1 } }
                },
                {
                    text: 'Approach the figures.',
                    dualCheck: [{ stat: 'visibility', target: 1.3 }, { stat: 'speed', target: 1.4 }],
                    success: { text: "You start running toward the figures, wondering if there was actually anything you could do to help. A large, muscular man comes out of the woods just as you arrive at the edge of the blaze. He pays you no attention and turns on the water. A huge fountain shoots into the fort, stymying the majority of the flames in mere seconds. After the blaze dies down, you turn to walk toward the man, but he holds his hand up, stopping you. You notice that his clothing is a patchwork of old linens, ragged and threadbare. A hood-mask hybrid piece of cloth covers his head and face, making him ghastly in the moonlight. You open your mouth to ask for help, but the man turns and hurries off into the woods before you can say anything.", effects: { sotcp: 1, knowledge: 1 } },
                    failure: { text: "You start running toward the figures, arriving just as a large, muscular man comes out of the woods. He is clothed in a strange patchwork of old linens and is wearing a mask-hood hybrid to cover his head and face. A large firehose snakes beneath him, though you are not sure where it leads to. You immediately try to approach him, but he holds up his hand as if to stop you. In three steps, you reach the man and open your mouth to speak to him. Before you can utter a word, he grabs you by the arms and throws you to the ground, landing right on top of you. A large BOOM tears through your eardrums and you smell the burnt clothing and searing flesh of the man as shrapnel rips through him. The concussive blast knocks you out for a moment and when you come to, the fort, the man, and the firehose are all gone.", effects: { health: -1, peaceOfMind: -1, sotcp: -1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "There isn't anything you can do about it.", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'a_matter_of_size',
            title: 'A Matter of Size',
            description: "Those are far too large to be raccoons. Large hairy mammals you can't identify have been following you through the trees for some time now. By their movements, you would think they are squirrels or raccoons, but they are not of the same size or shape. One drops down in front of you, chittering aggressively. What abomination is this?! It bears the face of a raccoon and yet its limbs are twisted, its bones all reformed. It lunges at you before you can study it further.",
            choices: [
                {
                    text: 'Kick it away!',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "You pull your leg around into a powerful sidekick and catch the beast right on the side. Your momentum carries your foot farther than you expected and you spin around, nearly knocking you over. As you regain your balance, you notice that the creature has been smashed into a tree. It's not moving.", effects: { grantItem: 'Food' } },
                    failure: { text: "You swing your leg up wildly, clipping the creature on its side. Its momentum carries it forward and it barrels into you, a ball of gnashing teeth. You grip it in your hands and slam it into a tree before flinging it away. It doesn't move. You pant heavily and recover your breath, trying not to think about the blood oozing from numerous cuts around your body.", effects: { health: -2 } }
                },
                {
                    text: 'Punch it away!',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "You toss a quick one-two punch as soon as the beast comes into range. Your fist connects on its…nose (?)...but it hasn't given up yet. It flips around to attack you again and you perform an excellent dodge to the side, grabbing the thing by a protrusion sticking out of it and flinging it away. It does not stir after it lands.", effects: { grantItem: 'Food' } },
                    failure: { text: "You punch forward with a wild haymaker strike, grazing the beast, but doing little damage. It barrels into you, a ball of gnashing teeth. You grip it in your hands and slam it into a tree before flinging it away. It doesn't move. You pant heavily and recover your breath, trying not to think about the blood oozing from numerous cuts around your body.", effects: { health: -2 } }
                },
                {
                    text: 'Flee!',
                    check: { stat: 'speed', target: 1.6 },
                    success: { text: "Your feet begin to move all on their own, adrenaline coursing through your veins. You quickly outpace the thing, despite its small stature. Some strange amalgamation of its bones is probably preventing it from quickly catching up to you.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You hesitate for a moment, wondering if you should actually fight the thing, and then your feet begin to move all on their own, adrenaline coursing through your veins. You don't find a pathway away from it quick enough, sadly. It pounces on your back, a ball of gnashing teeth and ghastliness. You spin around, throwing yourself against a tree. The creature's bones crunch behind you and it falls off, quite obviously dead. Your back runs hot with blood.", effects: { health: -2 } }
                },
                {
                    text: 'Do nothing.',
                    check: null,
                    success: { text: "Should not these be accepted, stranger? Why must we place so much value on what we know? No, the new is not horrible nor horrifying. It must be embraced. Something causes the creature to pause after it tears at you for a minute. It seems to glance around before running off. You straighten your head, wondering what just happened. And why is every part of your body in pain?", effects: { health: -3, insanity: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'flow_state',
            title: 'Flow State',
            description: "After all the earth passes away, heaven shall stand for eons to come. It too will one day be swallowed by the cold night, but not for a long time. It will resist the inevitable, fighting against its fate as dust. There is hope out there. This world is corrupted, but perhaps that is not so in other worlds. Not in other civilizations.",
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: { health: 1, peaceOfMind: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'lycoperdon',
            title: 'Lycoperdon',
            description: "Red protrusions stick out of the dirt. Angry pustules and diseased abscesses can be seen everywhere in the area you have just stumbled upon. The stench of rotting flesh assaults your nostrils. White splinters also stick up from the ground in jagged arrays. They look a bit like bones. The trees look sickly and many are dead or dying.",
            choices: [
                {
                    text: 'Poke one.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You lightly touch one of the growths with a single finger and it pulses, shying away from your touch. The feeling was oddly sticky and smooth. You decide not to continue your investigation.", effects: { closeToPower: 1, peaceOfMind: -1 } },
                    failure: { text: "You lightly touch one of the growths with a single finger and it pulses, shying away from your touch. The feeling was oddly sticky and smooth. Growing more curious, you slap the thing with your hand. Strange red ooze comes off it, sticking to your skin. The pustule also bursts with a loud pop, letting forth a truly noxious scent and a great amount of white pus. You have never been so repulsed in your life.", effects: { health: -1, peaceOfMind: -2 } }
                },
                {
                    text: 'Avoid them.',
                    dualCheck: [{ stat: 'visibility', target: 1.4 }, { stat: 'speed', target: 1.4 }],
                    success: { text: "You continue on your hike, careful to avoid the masses of red surrounding you. Though it takes you a while, you eventually find a more tolerable section of the woods.", effects: {} },
                    failure: { text: "You continue on your hike, careful to avoid the masses of red surrounding you. In your haste to keep out of the way of the masses of red, you accidentally place your hand onto a tree that has a white splinter of bone protruding out of it. You yelp as it punctures your skin, entering far enough to draw blood.", effects: { health: -1, peaceOfMind: -1 } }
                },
                {
                    text: 'Touch a bone.',
                    check: { stat: 'visibility', target: 1.6 },
                    success: { text: "You run your hand along a long white cylinder sticking out of a low-hanging bush. It definitely feels like bone, but it is far too natural. It's like it grew there, but plants do not grow bones. That you are sure of.", effects: { knowledge: 1, peaceOfMind: -1 } },
                    failure: { text: "You run your hand along a particularly jagged set of the white bones, accidentally slicing your hand as you do. You pull your hand back, muttering to yourself about how stupid you are as you walk off.", effects: { health: -2, peaceOfMind: -1 } }
                },
                {
                    text: 'Destroy one.',
                    check: { stat: 'strength', target: 1.8 },
                    success: { text: "You wind up for a powerful kick and give one of them a good uppercut. You uproot it and send it sailing into the air where, to your surprise, it explodes into a burst of red goo.", effects: { closeToPower: 2 } },
                    failure: { text: "You crouch down in order to uproot one of the pustules such that you might heave it against some rock. You firmly grasp it using both your arms and pull upwards. It comes out easily and is remarkably light. You move to carry it to a rock, but the whole thing explodes before you can walk two steps. It wasn't a fiery explosion, but it was enough to send you tumbling.", effects: { health: -3 } }
                },
                {
                    text: 'Examine them.',
                    check: { stat: 'speed', target: 1.8 },
                    success: { text: "You walk close to one in an effort to get a better look at it. It is definitely moving in a strange, animal-like way…the pustule bursts and you spring away in surprise. It's good nothing got on you.", effects: { knowledge: 2 } },
                    failure: { text: "You walk close to one in an effort to get a better look at it. It is definitely moving in a strange, animal-like way…the pustule bursts, spraying bone shrapnel and other fluids all over you. Everything stings. Everything hurts.", effects: { health: -3 } }
                },
                {
                    text: 'Dig.',
                    check: null,
                    success: { text: "It is back! The harmony is back. The rhythms pulse in the back of your head, bringing you to tears. Tears of desire. Tears of pain. It is below you. The symphony is below you. Yes, you must reach it. You tear at the grounds with your hands, pulling up clods of mud and red goo. Where is it? Where is it? You pull your hands back. It's not there. What were you looking for? A…song of some sort? What has gotten into you?", effects: { insanity: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'dead_clearing',
            title: 'Dead Clearing',
            description: "Is that the treeline? Could you be nearing the end of your venture? You rush towards it, hoping to catch a glimmer of civilization…but, no, this is all wrong. The trees have been pulverized into the earth. Everything is dead or dying. Only a large field of decay remains in this section of the woods.",
            choices: [
                {
                    text: 'Step into the dead field.',
                    check: { stat: 'speed', target: 1.7 },
                    success: { text: "Your feet pulverize wood stricken with brown and white rot as you walk, but nothing rears up in front of you. It's certainly eerie, but not dangerous.", effects: {} },
                    failure: { text: "Your feet turn the wood beneath you to dust and mush. It's slow going, but particularly dangerous. As you reach the middle of the field, you realize that its shape is that of a full circle and that the trees are lined up in an abnormal pattern that would not suggest that their destruction was natural. You move your head around in order to catch a better view of it. A fuzzy feeling begins to prickle up from your legs, as if they had fallen asleep. Frantically, you attempt to jolt yourself out of the paralysis, but to no avail. You crumble to the ground, staring upwards as other shapes fall from heaven toward you and…you are just lying on your back. Did you fall? Your head is sore, but you could have sworn something worse was happening. No matter, you had best get going.", effects: { closeToPower: 1, health: -1 } }
                },
                {
                    text: 'Skirt the dead field.',
                    check: { stat: 'speed', target: 1.4 },
                    success: { text: "You skirt around the dead trees and make it to the other side safely.", effects: {} },
                    failure: { text: "You skirt around the dead trees, watching the odd wound that something had inflicted upon the earth. Before long, you notice that the logs are twisted into an odd pattern. As you crane your neck to look at the odd sight, you begin to feel dizzy to the point of falling down. Your legs wobble and you collapse, hitting your head hard on the ground.", effects: { health: -2 } }
                }
            ]
        },
        {
            id: 'static_shock',
            title: 'Static Shock',
            noItemFallback: {
                item: 'Flashlight',
                description: "A massive wave of static electricity ripples through the air around you. The electricity flowing through your clothes stings and singes the skin. The effect continues for a few minutes, leaving you extremely uncomfortable.",
                effects: { peaceOfMind: -1 }
            },
            description: "A massive wave of static electricity ripples through the air around you. Your flashlight glows so brightly in your pocket that it actually singes the cloth. You pull it out quickly so as to avoid getting burned. It completely winks out after a few more seconds of the glow. You attempt to turn it back on. It doesn't.",
            choices: [
                {
                    text: 'Shake the flashlight.',
                    randomCheck: { min: 9 },
                    success: { text: "By some miracle, you are able to get your flashlight working. It still doesn't have much charge left, but it'll work.", effects: {} },
                    failure: { text: "You frantically shake the flashlight, but nothing happens.", effects: { peaceOfMind: -1, drainAllFlashlightUses: true } }
                },
                {
                    text: 'Throw away the flashlight.',
                    check: null,
                    success: { text: "You toss your flashlight into the darkness of the forest. It will only weigh you down now.", effects: { drainAllFlashlightUses: true } },
                    failure: null
                }
            ]
        },
        {
            id: 'bears_flight',
            title: "Bear's Flight",
            description: "A large hulking shape carrying a smaller ball of fur barrels into you, sending both of you tumbling. You claw at the thick body that has enveloped you, fearing that this might be your last moment alive. Indeed, it definitely feels that way. Once a bear has trapped you, escape is not so easy. In a flash, however, the bear leaps off of you, planting a crushing paw in your chest for leverage, and speeds off at a breakneck pace. What just happened?",
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: '', effects: { health: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'nostalgia',
            title: 'Nostalgia',
            description: "You are taken back to better memories of playing in these woods as a child. As you walk, you remember the numerous times you went out for recreation in these woods. Not this specific place, of course, but the surrounding area in general. You fondly recall a time you were hiking with your youth group, traversing the mild-mannered Yellow Birch Trail. Did you follow your group?",
            choices: [
                {
                    text: 'Of course you did.',
                    check: null,
                    success: { text: "You weren't known for rebellion as a kid.", effects: {}, opensNostalgiaGroupSubChoices: true },
                    failure: null
                },
                {
                    text: 'Steer off the path.',
                    check: null,
                    success: { text: "Your childhood was fraught with misbehavior. There was no way you would waste such a lovely day sticking to the boring old path. You don't remember how far away you got from your group, only that you came upon a hut at some point in your journeying. It was a plain, boring looking structure, but no road or path ran up to it for some odd reason.", effects: {}, opensNostalgiaHutSubChoices: true },
                    failure: null
                }
            ]
        },
        {
            id: 'sharp_talons',
            title: 'Sharp Talons',
            description: "Are those owls? They certainly can't be hawks…you find yourself surrounded by a gang of queerly shaped birds. From afar, you can't determine their species, but the glint of their eyes in the moonlight sets you on edge. One hops off their perch and swoops down, headed straight for you…",
            choices: [
                {
                    text: 'Duck.',
                    randomCheck: true,
                    success: { text: "You throw yourself to the ground just as the bird comes crashing down on your position and twist your body to avoid a further onslaught. You scramble away through the woods, evading the beasts.", effects: {} },
                    failure: { text: "You throw yourself to the ground to avoid the bird, but not soon enough. It lands on your back and tears at your clothing, claws raking down your skin. You eventually manage to crawl away, but not without a good lashing.", effects: { health: -1 } }
                },
                {
                    text: 'Run away.',
                    dualCheck: [{ stat: 'visibility', target: 1.3 }, { stat: 'speed', target: 1.4 }],
                    success: { text: "You dodge the bird's first plunge and leap backwards, taking off through the woods. You hear their pursuit and flee at top speed. Miraculously, you get away without further incident.", effects: {} },
                    failure: { text: "You take a few steps back from the plunging bird, but not quickly enough. The beast adjusts its course and flies straight into your face, a ball of heaving feathers. As its talons scratch at you, you realize that the thing is weirdly sinewy and misshapen. Before long, you get it off of you and escape, but not without a few wounds.", effects: { health: -1 } }
                },
                {
                    text: 'Do nothing.',
                    check: null,
                    success: { text: "You accept what is to come. The first bird draws a long, angry line down your face. The second carves your leg, taking some muscle with it. A third plucks out your hair with a beak. Before long, it becomes clear to the beasts that you aren't going to react and they fly away, laughing to themselves.", effects: { insanity: 1, health: -2, peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'thick_veins',
            title: 'Thick Veins',
            description: "Vines hang from the trees, too plump to be poisonous oak. They sway back and forth, raking the ground. As you plod along, you start to realize that they are growing denser and harder to avoid…",
            choices: [
                {
                    text: 'Be adventurous. Touch one.',
                    check: null,
                    success: { text: "You approach one of the trees. It seems to be groaning under the weight. The vine nearest to you is heavy and bulbous. One next to it is thin and wispy.", effects: {}, opensThickVeinsSubChoices: true },
                    failure: null
                },
                {
                    text: 'Avoid the vines.',
                    check: { stat: 'speed', target: 1.6 },
                    success: { text: "Though they appear benign, your instincts tell you to avoid them. You pick your way through the trees, dancing around the swaying plants. Your progress is slow, but the infestation eventually starts to thin out.", effects: { temporaryDebuff: { stat: 'speed', amount: 0.2, uses: 5 } } },
                    failure: { text: "Though they appear benign, your instincts tell you to avoid them. You pick your way clumsily through the trees, avoiding most of the plants, but bumbling into a few of the thicker ones. Just as you think you have made it out safely, you walk headfirst into a thin, cord-like vine. It's small, but curiously leaves a large gash all along your face. You clutch your head and try to staunch the bleeding.", effects: { health: -2 } }
                },
                {
                    text: 'Return the way you came.',
                    check: { stat: 'speed', target: 1.4 },
                    success: { text: "You have an incredibly bad feeling about continuing on through the trees here. The vines should NOT be moving so rapidly. You back away from the trees and walk away with an incredible sense of unease.", effects: { peaceOfMind: -1 } },
                    failure: { text: "You have an incredibly bad feeling about continuing on through the trees here. The plants have surrounded you, nearly boxing you in. With some difficulty, you make your way around the larger vines, but brush a few of the smaller ones. You glance down and see blood leaking from cuts on your arm.", effects: { peaceOfMind: -1, health: -1 } }
                }
            ]
        },
        {
            id: 'hushed_dispute',
            title: 'Hushed Dispute',
            description: "Your walking takes you to the edge of a small field filled with tall weeds. You hear two figures arguing close by in noticeably low tones.",
            choices: [
                {
                    text: 'Approach them.',
                    dualCheck: [{ stat: 'speed', target: 1.4 }, { stat: 'strength', target: 1.4 }],
                    success: { text: "You lightly step in their direction, careful not to disturb them. As you move closer, their quieted exchange becomes audible. Do you listen in?", effects: {}, opensHushedDisputeSubChoices: true },
                    failure: { text: "You walk clumsily over to the men and immediately get their attention. Like rabbits, they fade into the dark of the underbrush, escaping before you have time to utter a word.", effects: { peaceOfMind: 1 } }
                },
                {
                    text: 'Call out to them.',
                    check: null,
                    success: { text: "You cup your hands over your mouth and yell \"HEY!\" in their direction. They cut off their conversation and immediately fixate on you. In a brief flash of moonlight, you think you can see some slight puzzlement on one of the figure's faces. As you ready a follow-up comment, the two figures disappear into the woods, slipping off into the night.", effects: {} },
                    failure: null
                },
                {
                    text: 'Watch them from afar.',
                    check: { stat: 'visibility', target: 1.7 },
                    success: { text: "You hide yourself behind a bush and stare from far away. You can't hear what they are saying, but maybe they could give some sign of being friendly. After a few minutes, you observe a shadow pass over the general area. Could it be a bird…? No…that's too…as you scan the sky, you hear a loud shout from the men's vicinity. You return your gaze to where they once stood, but the men have since disappeared.", effects: { knowledge: 2, peaceOfMind: -1, insanity: 1 } },
                    failure: { text: "You creep toward the dead husk of an old tree and place your weight on it. The wood creaks and groans under the slight pressure and the whole thing comes falling down, creating a massive BOOM that shakes the whole woods. You are rattled by the encounter, but mostly unhurt.", effects: { health: -1, closeToPower: 1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You will find civilization another way.", effects: { insanity: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'war_and_peace',
            title: 'War and Peace',
            description: "There is fighting in the distance. It isn't easy to make out, but you can definitely see a large conflict in a field about a quarter of a mile off. A few fires appear to have been started and some of the yelps and shouts of the attack reach you from afar.",
            choices: [
                {
                    text: 'Hike toward the fighting.',
                    check: { stat: 'speed', target: 1.7 },
                    success: { text: "One by one the fires blink out as you pick your way toward the field until none are left. The screams and shouts die out just as you arrive at the scene of the turmoil. You scan the area, hoping to catch a glimpse of intelligent life. There! You spot a human shape struggling to stand only a few yards off.", effects: {}, opensWarSubChoices: true },
                    failure: { text: "The lights of the fires blink out one by one, causing you to lose sight of the struggle. In your haste to reach your target before all of the flames die out, you crash into a nest of thorns and burs, the likes of which cling to your clothes and poke at your feet through your socks. It takes you some time to remove them all. What's more, you can no longer see where the struggle might have taken place.", effects: { temporaryDebuff: { stat: 'speed', amount: -0.5, uses: 5 } } }
                },
                {
                    text: 'Walk away from the fighting.',
                    check: null,
                    success: { text: "If there's trouble, you want no part in it. That there are violent people out right now, however, is a thought that disturbs you.", effects: { peaceOfMind: -1 } },
                    failure: null
                },
                {
                    text: 'Observe the fighting from afar.',
                    check: { stat: 'visibility', target: 1.7 },
                    success: { text: "You gaze at the proceedings of the battle. Slowly, your eyes pick out people moving amongst the flames. They seem to be frantically battering away at hulking black shapes of a form you do not recognize. Many of the flames once held by the people are starting to die out, allowing the moonlight to reflect their silhouettes better. One of the larger shapes suddenly leaps into the air and jets off into the trees.", effects: { peaceOfMind: -2, knowledge: 1 } },
                    failure: { text: "You squint hard, but can't make out anything but a few columns of flame.", effects: { peaceOfMind: 1 } }
                }
            ]
        },
        {
            id: 'its_a_fight',
            title: "It's a Fight",
            description: "A massive circle of boulders surrounds you. Standing about 30 feet high, they tower above your head. The formation hardly seems natural. Plants might grow in beautiful geometric forms sometimes, but you have never known rocks to sprout up from the ground in perfect circles without outside interference. You exit the scene and stop as you hear a sharp whisper come from behind you and then, yelling. You twist around, instinctively moving backwards away from the sounds, and see a group of people dressed in large patchy robes grappling with something big and black. Had they been waiting behind the rocks?",
            choices: [
                {
                    text: 'Hide and watch.',
                    check: { stat: 'visibility', target: 1.7 },
                    success: { text: "You do your best to stand quietly in the shadows outside the stone circle. The beast is much larger than the men and about 1.5 times as large as a bear. Whispers mingled with cries of pain assault your ears and the scent of blood and faintly familiar chemicals tinges the air but you refuse to look away. Eventually, the fighting dies down, the human figures victorious. It's time to go.", effects: { closeToPower: 1, peaceOfMind: -1 } },
                    failure: { text: "You do your best to sneak away from the stone outcropping and find a decent spot within which to hide yourself in the shadows. The fighting continues for a couple of minutes, cries and whispers assaulting your ears. One of the men peels off from the group, clutching blindly at his face. Is he hurt? He happens to run blindly in your direction. You try to shuffle to the right but he stumbles right into you, knocking you over. His face is covered in deep wounds. A terrible sight. You shove him off of you and go flying into the night, feeling rather stupid for having stayed to watch the frenzy.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Fight on the side of the people.',
                    dualCheck: [{ stat: 'strength', target: 1.9 }, { stat: 'insanity', target: 3, raw: true }],
                    success: { text: "You run wildly into the group of fighters, yelling like a madman at the top of your lungs. Some of them, including the beast, hesitate and seem to stop fighting. In that moment of hesitation, a rather large, muscular looking fellow leaps from a boulder and brings an axe straight down upon the creature, apparently killing it. You stop, stunned by what just happened. The group scurries off before you can catch one of them.", effects: { sotcp: 2, closeToPower: 2 } },
                    failure: { text: "You run wildly into the group of fighters, bellowing like a madman. Before you can make it very far, you trip and tumble into some of the men who are fighting. The beast seizes the sudden interruption to swing a protrusion into the men, crushing a number of them. The rest of the group scatters off into the trees, leaving you behind. You shudder as you think about what the creature will do to you but, when you look up, it is gone.", effects: { sotcp: -1, health: -3 } }
                },
                {
                    text: 'Fight on the side of the beast.',
                    dualCheck: [{ stat: 'strength', target: 1.9 }, { stat: 'insanity', target: 3, raw: true }],
                    success: { text: "You run wildly at the group of fighters, shouting like a demon. The group hesitates, giving the beast enough time to bring a winged limb crashing down on top of three of the men. They are instantly decapitated and the survivors scurry off. The beast appears to turn to eye you for a minute before flying off.", effects: { sotcp: -2, closeToPower: 2 } },
                    failure: { text: "You run wildly at the group of fighters, bellowing at them with the force of a lion. The group hesitates, giving the beast time to slash at three of them. Three are decapitated but not before they fling a lance at you, cutting deeply into your side.", effects: { health: -3, sotcp: -2 } }
                }
            ]
        },
        {
            id: 'painful_whispers',
            title: 'Painful Whispers',
            description: "Strange whispers have begun to waft into your ears, carried to you by the wind. A harsh shh-shhing assaults your ears, mumbling words in antiquitous languages you could not bring yourself to understand. How could they be so loud and yet so quiet at the same time? And where are they coming from? You can't ascertain the direction of their origin.",
            choices: [
                {
                    text: 'Cover your ears.',
                    check: { stat: 'strength', target: 1.8 },
                    success: { text: "You cup your hands over your ears and, for good measure, hum a catchy tune in order to drown out the odd sounds. After a while, you remove your hands from your ears and realize that the whispers have stopped.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You cup your hands over your ears but, like some formless liquid, the whispers make it through the small cracks between your fingers and worm their way into your brain. They bring a certain coldness with them, sucking away all feeling from you. As you teeter on the brink of numbness, the whispers stop, but not without greatly disaffecting you.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Listen to them.',
                    check: null,
                    success: { text: "You stop for a moment anyways in order to really think about what might be said. You still don't comprehend what the whispers mean, but they begin to make you feel cold, as if leeching the emotion out of you. You shake your head, ignoring the frigidity of your state of mind, but fail to rid yourself of the nothing that you now feel.", effects: { knowledge: 1, peaceOfMind: -2 } },
                    failure: null
                },
                {
                    text: 'Ignore them.',
                    check: { stat: 'peaceOfMind', target: 14, raw: true },
                    success: { text: "Your face drifts into a branch, momentarily frightening you. You tear it off and hurry away, forgetting completely about the whispers.", effects: { peaceOfMind: 1 } },
                    failure: { text: "No matter how hard you try, the voices creep into your head anyway. You can't block them out. You even feel a distinct numbness growing throughout you the more you listen to them.", effects: { peaceOfMind: -2 } }
                }
            ]
        },
        {
            id: 'open_grave',
            title: 'Open Grave',
            description: "Carcasses litter the underbrush. A repellent stench blankets the air, making your eyes water. You glance around, wondering what could be making such a…ah. Your breath falters as you see death all around you. Fur and bones and organs and bodies and…",
            choices: [
                {
                    text: 'Close your eyes and run.',
                    randomCheck: { min: 7 },
                    success: { text: "You streak through the woods as fast as your blundering will let you. Miraculously, you make it through the ordeal unscathed. You turn back to look at where you came from. Nothing, not even a whiff. You wonder if the experience even happened…or if you were just being dramatic.", effects: {} },
                    failure: { text: "Running through the woods at night with your eyes closed was never going to end well. You end up slamming into a tree as you stampede out of that awful place. You bruise half your body and collapse into a heap. You are away from the horrors behind you, but at what cost?", effects: { health: -2 } }
                },
                {
                    text: 'Plug your nose and run.',
                    check: { stat: 'speed', target: 1.7 },
                    success: { text: "You clutch your nose and hurry off. You catch a few more glances at the heaps of…flesh…that surround where you were but you are mostly able to keep your eyes looking off into the distance.", effects: {} },
                    failure: { text: "You clutch your nose and hurry onwards. Though you are able to stymie some of the smell, the emetic odor finds its way into your mouth. It is like you can taste the stuff. Thus, you vomit anyways, heaving up more than you thought your stomach could contain.", effects: { health: -1, peaceOfMind: -1 } }
                },
                {
                    text: 'Take a carcass with you.',
                    dualCheck: [{ stat: 'strength', target: 1.4 }, { stat: 'visibility', target: 1.4 }],
                    success: { text: "You seek out a rather small mammal from the remains and pull it from one of the heaps. It smells awful, but you will have to support it.", effects: { peaceOfMind: -1, grantItem: 'Food' } },
                    failure: { text: "You catch hold of something long and rough and start pulling. Whatever it is, it's heavy. You tug and some of the carcasses fall off the heap it is buried in. You leap back. As you do, you notice something. The long thing is covered in jeans. Jeans and…a boot. Does that mean? No, are there people here? What is happening? What is happening? What is happening? This is very wrong. A Third Party has arrived. None shall escape, none shall escape.", effects: { peaceOfMind: -2, insanity: 1 } }
                },
                {
                    text: 'What happened here?',
                    check: { stat: 'visibility', target: 1.7 },
                    success: { text: "You look more closely at a smaller heap of bodies. They are mostly small mammals, birds, and a reptile or two. Each one of them has been slashed to bits and, underneath the rotting odor, smell faintly like a mix of tobacco, chlorine, and sweat. How…interesting. A few of them are missing eyes too. It is a disturbing sight. You will have to speak to the police about this when you get out of this despicable place. As you leave, you pass larger mounds of carcasses but you choose to avoid looking at them. You saw enough.", effects: { peaceOfMind: -1, knowledge: 1, closeToPower: 1 } },
                    failure: { text: "The smaller mounds are probably birds and rodents. But what of these larger mounds? What could they be? You peer at one of them and gasp. A human arm, scraped and missing a hand, but definitely an arm hangs out from one of them. You fall backwards and crawl away, retching onto the ground. You back up straight into another mound and look up to see a massive wing protruding from it. What monstrous sight is this? What are you seeing? You must get out. You must tell the police of what has happened here.", effects: { peaceOfMind: -1, insanity: 1 } }
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "You will be scarred for the rest of your life but at least you kept your dignity.", effects: { peaceOfMind: -2 } },
                    failure: null
                }
            ]
        },
        {
            id: 'dont_look',
            title: "Don't Look",
            description: "Clouds shroud the sky above you, obscuring the Moon entirely. The woods grow extremely dark, making it difficult to keep walking.",
            choices: [
                {
                    text: 'Look up.',
                    check: { stat: 'visibility', target: 1.2 },
                    success: { text: "You gaze upwards, hoping to see whether the cloud might pass soon. The blanket almost looks like it's shifting back and forth. How odd.", effects: {}, opensDoNotLookSubChoices: true },
                    failure: { text: "You stare upwards at the cloud. It shifts strangely, flowing from one side to the next. The oppressiveness of its shape and movements haunts you.", effects: { peaceOfMind: -2 } }
                },
                {
                    text: 'Focus on the path ahead.',
                    check: { stat: 'visibility', target: 1.5 },
                    success: { text: "The encroaching darkness causes you to re-double your efforts. You can even see where the cloud's shadow does not lie. You make your way toward it and, eventually, you can see the Moon again.", effects: { peaceOfMind: 1 } },
                    failure: { text: "The encroaching darkness causes you to re-double your efforts. You can even see where the cloud's shadow does not lie. You make your way toward it, but, while doing so, walk straight into a branch, knocking your head very hard.", effects: { health: -1 } }
                }
            ]
        },
        {
            id: 'black_bag',
            title: 'Black Bag',
            description: "A few minutes have gone by without incident. Your mind drifts until suddenly you realize that the trees around you are sagging under the weight of something. You look up and see hundreds of large black bags hanging down from the branches.",
            choices: [
                {
                    text: 'Untie one.',
                    check: { stat: 'strength', target: 1.7 },
                    success: { text: "One of the black bags is hanging within arm's length of you. You reach out to touch it and recoil. The bag is soft and leathery, like the hide of a cow. You grasp it again and pull backward. An ear-splitting screech sounds and the smell of chlorine suddenly permeates the air. The black bag unravels into an abomination on wings. These weren't bags! They were...they were...you can't find the word. The beast's yowl startles the other bags and they all unravel too into hideous new forms. The beast you disturbed eyes you with what seems to be its head appendage and takes off into the night, taking a massive black cloud of its fellows with it.", effects: { peaceOfMind: -1, sotcp: -1 } },
                    failure: { text: "One of the black bags is hanging very low to the ground, only about an inch suspended in the air. You reach forward and touch it, recoiling in shock at the leathery, hairy nature of it. It's like holding a cow's hide. You reach forward to touch it again, but are knocked back by a wing that comes out of nowhere. The black bag unravels into a terrifying large beast. Its wings are bat-like, but the body is irregular, with strange protrusions coming from all over it. It eyes you with what appears to be a head appendage, but does not attack. Instead, it shoots off into the night. The other black bags unravel as well and follow it, a terrible cloud of strangeness.", effects: { health: -1, peaceOfMind: -1, sotcp: -1 } }
                },
                {
                    text: 'Leave them hanging.',
                    check: null,
                    success: { text: "What would messing with them do? If one of them split open, they could leak trash everywhere.", effects: { sotcp: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'poor_game',
            title: 'Poor Game',
            description: "Antlers are tangled in the branches, as are a variety of other animal body parts. They hang down just out of reach, but climbing the trees could take you to them.",
            choices: [
                {
                    text: 'Retrieve the antlers.',
                    check: { stat: 'strength', target: 1.6 },
                    success: { text: "You hug a tree and shimmy up its length. Upon reaching the lowest branch with the antlers, you grasp one end of them and tug. They crumble to dust in your hand and you are forced to quickly return to the tree. You slowly descend back to the bottom. What a strange encounter.", effects: { closeToPower: 1 } },
                    failure: { text: "You hug the tree with the antlers and use your amateur rock-climbing skills to ascend to one of the lower branches. You reach the antlers and grasp them. They turn to dust in your hand, surprising you. You yelp as you fall back to the forest below.", effects: { health: -2, closeToPower: 1 } }
                },
                {
                    text: 'Examine them from afar.',
                    check: { stat: 'visibility', target: 1.4 },
                    success: { text: "You peer harder at the antlers. Are those really...? Now that you look closer, they seem to be more bone-like growths coming out of the tree than antlers. Same with the other animal parts. They look too wrong, too twisted to be natural.", effects: { knowledge: 1 } },
                    failure: { text: "You peer harder at the antlers. Are those really...? No, they aren't antlers. They are bone-like growths coming out of the tree. You look around. ALL of the parts you see hanging from the trees are similar such growths. You wheel around, taking in the horrors of the sights around you. These aren't even trees. They are too alive.", effects: { peaceOfMind: -1 } }
                },
                {
                    text: 'Hurry past.',
                    check: { stat: 'speed', target: 1.4 },
                    success: { text: "You keep your head down and continue to move through the forest.", effects: {} },
                    failure: { text: "You turn your head down, but notice odd little red pustules pushing up from the ground. You keep your head straight, but the reddish hue of the trees disturbs you. You close your eyes to shut everything out, but such only attunes your mind to a hideous thrumming surfacing from deep beneath the earth.", effects: { peaceOfMind: -2 } }
                }
            ]
        },
        {
            id: 'chance_encounter',
            title: 'Chance Encounter',
            description: "Out of nowhere, a scraggly figure walks into you. She appears to be a woman, but you can't tell very well in the light. The person is wearing a variety of sewn together skins and bits of cloths. A hood of sorts obscures both her face and hair, increasing your uncertainty. Not a single bit of skin is showing on her. Even her hands are gloved in strange bits of leather.",
            choices: [
                {
                    text: 'Talk to her.',
                    dualCheck: [
                        { stat: 'peaceOfMind', target: 10, raw: true },
                        { stat: 'visibility', target: 1.3 }
                    ],
                    success: { text: "Excited, you step toward her and introduce yourself. The woman, who is clearly surprised, only stares back. You introduce yourself again. Before you can finish, she abruptly says, \"Geht ahwaiy\" in an accent you can barely understand.", effects: { knowledge: 1 }, opensChanceEncounterTalkSubChoices: true },
                    failure: null
                },
                {
                    text: 'Flee.',
                    check: { stat: 'speed', target: 1.7 },
                    success: { text: "She is clearly dressed like a maniac. You turn heel and sprint away, leaving her far behind. After running several hundred meters, you look back. Nothing. Like she wasn't even following you in the first place.", effects: { health: 1 } },
                    failure: { text: "She is clearly dressed like a maniac. Visions of you getting stabbed to death and dumped in some unknown backcountry flood your mind. You run so fast in the opposite direction that you swear you can hear a few muscles tear in your leg. Your lungs eventually give out and you throw up on the ground, nauseated. You take a look backwards to see if she has followed you. Nothing.", effects: { health: -1 } }
                },
                {
                    text: 'Attack her.',
                    check: { stat: 'strength', target: 1.7 },
                    success: { text: "You fling yourself at the woman, throwing out a few right jabs and kicks. She glides back, almost looking surprised at your ferocity, and disappears into the underbrush. You smile at your prowess.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You fling yourself in her direction, throwing an uppercut that connects with her abdomen head-on. The woman shrieks in your ear and stumbles backward, running away into the underbrush. That was a cruel thing to do.", effects: { peaceOfMind: -1, sotcp: -1 } }
                }
            ]
        },
        {
            id: 'galvanized',
            title: 'Galvanized',
            description: "The air is rent by electricity. Arcs of electricity spring from the branches near you and, when you brush against the leaves, you are administered a small shock. You wonder what would happen if the bottoms of your shoes weren't grounding you.",
            choices: [
                {
                    text: 'Approach the source.',
                    check: null,
                    success: { text: "There is much more electricity coming from one direction in the woods. You walk toward the direction and reach what appears to be a large metal pole sticking out of the ground. Lightning ripples out of it, fraying the plants in its vicinity. Curiously enough, it doesn't do anything to you directly.", effects: {}, opensGalvanizedSubChoices: true },
                    failure: null
                },
                {
                    text: 'Leave.',
                    check: null,
                    success: { text: "Looks dangerous...", effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'trouble_with_somnolence',
            title: 'The Trouble with Somnolence',
            description: "You have a waking dream of a soft bed. Fact and fiction blend eerily. Your eyes are heavy with tiredness. It's hard to keep walking.",
            choices: [
                {
                    text: 'Force yourself onward.',
                    dualCheck: [
                        { stat: 'peaceOfMind', target: 8, raw: true },
                        { stat: 'visibility', target: 1.4 }
                    ],
                    success: { text: "The chilly wind cools your face, helping keep you awake as you walk. You grow confident that you will find your way out, thinking of the wonderful stories you will be able to tell your friends of this night.", effects: { peaceOfMind: 1 } },
                    failure: { text: "You are too tired. Continuing to walk with this drowsiness is bound to have bad consequ\u2026THUMP! You slam your head right into a low hanging branch. Ears ringing, you get up and feel a large gash on your forehead. The blow is causing you to bleed a bit, but at least you are fully awake now.", effects: { health: -2 } }
                },
                {
                    text: 'Give in. Sleep.',
                    check: null,
                    success: { text: "You lean against a misshapen oak tree and close your eyes. Just for five minutes, of course. You drift off into an uneasy sleep and dream of alien worlds and planes. With great lucidity, a particularly devilish nightmare comes to the forefront of your bewitched mind. A gargantuan valley of twisted rocks lies before you. The sky overhead is black, interspersed only by the occasional dead star. A pallid light from an unknown source barely illuminates the formations around you.", effects: {}, opensSomnolenceSleepSubChoices: true },
                    failure: null
                }
            ]
        },
    ],
    4: [
        {
            id: 'bare',
            title: 'Bare Earth',
            description: 'Nothing grows here. The ground is too dark, too still. You feel, with complete certainty, that you have walked this exact path before — many times.',
            choices: [
                {
                    text: 'Press on.',
                    check: null,
                    success: { text: 'You keep moving. There is nothing else to do.', effects: { peaceOfMind: -1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'nothing',
            title: 'Nothing',
            description: 'There is nothing here. That should be a relief. It is not.',
            choices: [
                {
                    text: 'Continue.',
                    check: null,
                    success: { text: 'You continue.', effects: { insanity: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'old_camp',
            title: 'An Old Campsite',
            description: 'The ashes in the fire pit are cold. Very cold. But someone left a jacket hanging from a branch — and it is still warm.',
            choices: [
                {
                    text: 'Take the jacket.',
                    check: null,
                    success: { text: 'It fits. It smells like nothing. You feel slightly less exposed.', effects: { health: 1 } },
                    failure: null
                },
                {
                    text: 'Leave it.',
                    check: null,
                    success: { text: 'You leave it. Whoever left it here may still need it.', effects: { knowledge: 1 } },
                    failure: null
                }
            ]
        },
        {
            id: 'third_party',
            title: 'Something has overtaken you.',
            description: "The sounds of the forest dull, the sharp scent of molded tobacco overwhelms you, and you are struck with an awful feeling of horror. Looming among the trees, directly in front of you, is a massive shrouded figure. Dirty rags and fibrous cloth cover every inch of it, none of them quite the same color against the moonlight. No eyes, orifices, or appendages obviously stick out from it save for a number of…legs? Despite these disadvantages, it is moving with surprising deftness and ease, churning up the mud beneath it. What's most peculiar of all is the fact that its form seems to be convulsing, shifting as your eyes attempt to track it. It starts to approach you.",
            choices: [
                {
                    text: 'Get ready.',
                    check: null,
                    success: { text: "This isn't going to be easy.", effects: {}, opensThirdPartyBattle: true },
                    failure: null
                },
                {
                    text: 'Plead for mercy.',
                    check: null,
                    success: { text: "It does not hear your cries.", effects: { peaceOfMind: -1 }, loopsToEncounter: true },
                    failure: null
                },
                {
                    text: 'Do nothing.',
                    check: null,
                    success: {
                        text: "You grin and walk toward the creature, accepting what is to come. The hulking thing shudders closer. As it nears, you suddenly realize what a powerful beast it is and cry out, attempting to escape. But there is no escape anymore. It has noticed you. And what it wants, it gets.",
                        effects: {},
                        gameOver: { title: 'Noticed.', message: 'You caught its eye.' }
                    },
                    failure: null
                }
            ]
        }
    ]
};

// Special encounter when a leaf token is found
const LEAF_ENCOUNTER = {
    title: 'A Trodden Path',
    description: "The trees give way to a dirt path about 5 feet wide, extending off toward what you hope is civilization. You begin to hurry down it. Unfortunately, the path starts to thin out until it eventually disappears altogether. A look backwards reveals no sign that the path existed to begin with. How did this happen? You were certain that you saw a path. Regardless, you take a little bit of comfort knowing that you are not entirely removed from any human landmarks.",
    choices: [
        {
            text: 'Continue.',
            check: null,
            success: { text: '', effects: {}, collectLeaf: true },
            failure: null
        }
    ]
};

const LEAF_ENCOUNTER_DEFAULT = {
    title: 'A Leaf Token',
    description: 'It is not a real leaf — not exactly. The shape is right, but the material is wrong. It is warm to the touch, and when you pocket it, you feel briefly, impossibly, that you know which way is home.',
    choices: [
        {
            text: 'Take it.',
            check: null,
            success: { text: 'You pocket the leaf. The warmth travels up your arm.', effects: { peaceOfMind: 1 }, collectLeaf: true },
            failure: null
        }
    ]
};

// ============================================================
// JOURNAL ENTRIES (used by "An Old Fort" encounter)
// Entries 0–8 use a 1.2 visibility check; entry 9 uses 1.9.
// ============================================================
const JOURNAL_ENTRIES = [
    { text: 'June 12, XXXX — I found a roly poly in the dirt today. It curled up in its shell before I could see his face. I also found a few worms under some rocks. They come out after it rains and dry up in the sun. I do not like this so I bury them as deep as I can.', effects: {} },
    { text: 'August 23, XXXX — I found a fuzzy looking caterpillar on a log today. Mom says that I shouldn\'t touch those because they could be poisonous. I just picked up a small inchworm in Mrs. Packer\'s garden. She doesn\'t like it when I get in her plants, but there are bugs there so I disobey sometimes.', effects: {} },
    { text: 'September 1, XXXX — I forgot to bring a lunch to school today. Mom usually has me make my own but I couldn\'t remember to do that this time. The lunch lady gave me an apple and told me not to tell anyone about it. She is nice.', effects: {} },
    { text: 'October 15, XXXX — I did badly on a test today. Mom says it\'s ok but she seemed sad about it. I miss dad. He could make her happy again. I don\'t like being home. It\'s not a good place anymore without him. Mom doesn\'t cook me food anymore. I don\'t like the snacks Mrs. Packer gives me.', effects: {} },
    { text: 'November 8, XXXX — I found a little fort in the woods today. It\'s kinda far in, but there was a path to lead me out of the woods right by it. Mom won\'t care if I am gone long. She doesn\'t want to leave her bed anymore.', effects: {} },
    { text: 'December 2, XXXX — Today I found a millipede out by the fort. My friends told me that\'s what it was. It\'s big, blue and orange and fat. I\'m glad I showed this fort to my friends. They help me learn and give me food when mom forgets.', effects: {} },
    { text: 'December 25, XXXX — Today was supposed to be Christmas, but mom forgot. Mrs. Packer brought us some chocolate pudding. I took it to my fort. Sometimes it\'s hard to find my way here, but I always do. My friends also came and we played here. They gave me some presents. They said they could build a bigger fort for me and suggested using the sticks from the old fort for it. They seemed sad when I said I didn\'t want to. I like this fort.', effects: {} },
    { text: 'February 9, XXXX — Me and my friends hang out at the fort a lot now. They don\'t come inside and say they are too big for it. I guess they are right. They say they could build a bigger fort if I were to take down the old one. Maybe I should.', effects: {} },
    { text: 'I told my mom about my friends but she didn\'t care. She said that they were probably imaginary because nobody is like my friends. I wish I could show them to her. I tried to take down the fort for my friends, but I wasn\'t strong enough. Dad could have helped me.', effects: { knowledge: 1 } },
    { text: 'My friends are outside the fort right now. I just wanted somewhere to sleep. Mom yelled at me to go out. Oh no, my friends are mad. They don\'t like this fort and are mad at me because I can\'t take it down. What did I do wrong? I haven\'t been naughty. I don\'t like being all the way out here at night. The journal ends.', effects: { peaceOfMind: -5, insanity: 2 }, checkTarget: 1.9 }
];

// ============================================================
// VOICES ENTRIES (used by "Voices from Afar" encounter)
// Each entry uses a raw Health check against checkTarget.
// Failure at any entry shows hearing-loss text with -1 PoM.
// ============================================================
const VOICES_ENTRIES = [
    { text: '"\u2026lost a lot of traps\u2026"', effects: {}, checkTarget: 13 },
    { text: '"\u2026too many people getting lost\u2026"', effects: { knowledge: 1 }, checkTarget: 14 },
    { text: 'The yelling increases violently all of a sudden and you can make out the words, "Up above!" before the yelling fades away completely.', effects: { peaceOfMind: -1, closeToPower: 1 }, checkTarget: 15 }
];

// ============================================================
// TRASH SUB-CHOICES (used by "Pile of Junk" encounter)
// ============================================================
const TRASH_SUB_CHOICES = [
    {
        text: 'Grab a blue cylinder thing.',
        dualCheck: [{ stat: 'strength', target: 1.2 }, { stat: 'visibility', target: 1.4 }],
        success: { text: "You reach for a blue, shiny cylindrical object and pull it out of the garbage. It is an unopened can of Fahrenheit, your favorite energy drink! You inspect it for signs of botulism and look at its expiration date. It hasn't yet passed.", effects: {}, opensEnergyDrinkPrompt: true },
        failure: { text: "You reach for the item in question and accidentally gash your arm on a long piece of sharp metal.", effects: { health: -1 } }
    },
    {
        text: 'Grab a grey rectangle.',
        check: { stat: 'strength', target: 1.7 },
        success: { text: "Using quite literally ALL of your strength, you tug a huge grey sheet of something out of the garbage. Upon further inspection, you realize that it's\u2026 it's a big sheet of asbestos cement\u2026?! You cast it away and resolve to wash your hands as soon as you get home.", effects: { health: -3, grantAttribute: 'Tainted by Carcinogens' } },
        failure: { text: "The item is way too stuck in the trash for you to pull it out. You sit back, glaring at it before realizing that it was actually a huge sheet of asbestos cement. It's a good thing you didn't pull it out.", effects: {} }
    },
    {
        text: 'Grab a cardboard box.',
        check: { stat: 'strength', target: 1.4 },
        success: { text: "You pull a cardboard box from the pile. Inside are a bunch of desiccated animal corpses. Though a little water appears to have gotten into the box, it is clear that they have been kept very well. You take one with you.", effects: { grantItem: 'Food' } },
        failure: { text: "You pull a large cardboard box off of the top of the pile. The box, however, tears as you open it, sending a shower of bones and dry animal carcasses all over you. You flee the scene, yelling in fright.", effects: { peaceOfMind: -1 } }
    },
    {
        text: 'Grab the brownish-white block.',
        dualCheck: [{ stat: 'strength', target: 1.3 }, { stat: 'visibility', target: 1.3 }],
        success: { text: "You lift a large tome out of the garbage heap and set it down on the ground. It is severely water damaged and most of its writings are a blur, but you can make out some odd symbols that are unmistakably NOT English. The illustrations you see also do not look like many of the regular animals you might find in West Virginia.", effects: { closeToPower: 1, knowledge: 1 } },
        failure: { text: "You attempt to pull a large book from the garbage pile, but it disintegrates in your hand. It has likely seen one too many rainfalls for its own good.", effects: { peaceOfMind: -1 } }
    }
];

// ============================================================
// WISH SUB-CHOICES (used by "Wish Upon a Star" encounter)
// ============================================================
const WISH_SUB_CHOICES = [
    {
        text: 'To leave the woods.',
        success: { text: "You don't teleport home, but you do feel a small bit of hope that you will get out somehow.", effects: {}, collectLeaf: true }
    },
    {
        text: 'Strength.',
        success: { text: "You feel invigorated.", effects: { strength: 0.1 } }
    },
    {
        text: 'Speed.',
        success: { text: "You feel quickened.", effects: { speed: 0.1 } }
    },
    {
        text: 'Sight.',
        success: { text: "You feel clear-sighted.", effects: { visibility: 0.1 } }
    },
    {
        text: 'Good health.',
        success: { text: "You feel rejuvenated.", effects: { health: 1 } }
    },
    {
        text: 'Peace of Mind.',
        success: { text: "You feel relief.", effects: { peaceOfMind: 1 } }
    },
    {
        text: 'Good luck.',
        success: { text: "You feel good\u2026 really good.", effects: { closeToPower: 2 } }
    },
    {
        text: 'Something cool.',
        success: { text: "Your pocket grows heavy.", effects: { grantItem: 'Weird Rock' } }
    },
    {
        text: 'To find your dog.',
        success: { text: "A fluffy dog appears in your path a little while after you start walking again. It is a stuffed animal that looks exactly like the stuffed dog that you once lost as a child. You bite your lip in frustration. This is not what you wished for.", effects: {} }
    },
    {
        text: 'Death.',
        success: { text: "And so shall it be.", effects: { drainHealth: true } }
    }
];

// ============================================================
// GAME STATE
// ============================================================
let G = null;

function newGameState() {
    return {
        board: {},
        player: {
            q: 0,
            r: 0,
            health:      10,
            peaceOfMind: 10,
            knowledge:   0,
            insanity:    0,
            stalked:     0,
            visibility:  1.0,
            strength:    1.0,
            speed:       1.0,
            items:       ['Flashlight'],
            attributes:  [],
            leafTokens:  0,
            closeToPower: 0,
            strengthOfACertainParty: 10
        },
        phase:            'move',   // 'move' | 'encounter' | 'gameover' | 'win'
        pendingEncounter: null,     // { encounter, hex }
        pendingMultiCheck: null,    // { stat, target, total, remaining, onSuccess, onFailure }
        pendingDualCheck:  null,    // { checks: [{stat,target},...], idx, onSuccess, onFailure }
        powerCards:           [],     // cards in the player's hand
        powerCardBoost:       null,  // { stat, amount } queued boost; consumed on next matching roll
        savingGrace:          false, // next rollD10() automatically returns 10
        quickJog:             false, // next move may reach hexes up to 2 steps away
        hexRemoveMode:        null,  // { remaining } — player choosing adjacent tiles to remove
        revealMode:           null,  // { remaining, anyHex } — player choosing hexes to reveal
        justAnIllusionMode:   false, // waiting for player to pick a card to discard+replace
        boostChoiceMode:      null,  // { amount, cardIndex } — waiting for player to pick stat
        secondChanceSnapshot: null,  // player state snapshot before last test (for A Second Chance)
        lastOutcomeEffects:   null,  // effects from last resolved test outcome (for Salvation)
        lastFailureEffects:   null,  // effects from last failure outcome (for Damnation)
        momentOfClarityCards: null,  // 5 cards shown in the Moment of Clarity modal
        momentOfClarityPicks: 0,     // how many picks taken in Moment of Clarity
        weirdRockQueued:      false,   // true after player activates the rock; consumed on next strength roll
        gunQueued:         false,   // true after player activates the Gun; auto-succeeds next strength check
        gunUses:           0,       // remaining uses on the Gun item
        woodenBeamActive:    false,  // true while Wooden Beam is active; boosts all strength rolls this encounter
        flashlightActive:    false,  // true while Flashlight is active; boosts all visibility rolls this encounter
        flamethrowerActive:  false,  // true while Flamethrower is active; boosts all visibility rolls this encounter by +0.3
        cookieActive:        false,  // true this encounter after eating Cookie; +0.1 speed on all rolls
        cookieHangover:      false,  // true next encounter after cookieActive; applies -0.1 speed debuff for 1 use
        flashlightUses:    3,       // remaining uses; item removed from inventory when this hits 0
        customDeathTitle:  null,    // overrides "Lost." title on game-over screen when set
        houseState:        null,    // non-null while inside The House sub-encounter
        scoutingMode:      null,    // { remaining: N } while in scout phase
        scoutResults:      {},      // { [hexKey]: true|false } leaf found or not
        totallyLostTurns:  0,       // countdown; when Totally Lost attribute is active
        forceDeeperMove:   false,   // when true, player may only move to higher-level hexes next turn
        forceShallowerMove: false,  // when true, player may only move to lower-level hexes next turn
        forceLevel3Move:   false,   // when true, player may only move to level-3 hexes next turn (if any adjacent)
        statDebuffs:       {},      // { [stat]: { amount, usesRemaining } }
        pendingLeaf:      false,
        difficulty:       'normal', // 'easy' | 'normal' | 'hard'
        canEscape:        false,
        thirdPartyInjured:   0,    // times the Third Party has been injured this encounter
        thirdPartyPlacated:  0,    // times the Third Party has been placated this encounter
        thirdPartyFedIt:     false, // Feed It can only be used once per encounter
        thirdPartyTriggered: false  // prevents stalked-path from firing more than once
    };
}

// ============================================================
// INITIALIZATION
// ============================================================
function initGame() {
    G = newGameState();

    // Build all hex positions for a radius-3 large hexagon
    for (let q = -BOARD_RADIUS; q <= BOARD_RADIUS; q++) {
        for (let r = -BOARD_RADIUS; r <= BOARD_RADIUS; r++) {
            if (Math.abs(-q - r) <= BOARD_RADIUS) {
                const key = hk(q, r);
                G.board[key] = {
                    q,
                    r,
                    currentLevel: 1,          // which level is currently on top (1=fresh, 4=board)
                    encounters: {
                        1: getRandEncounter(1),
                        2: getRandEncounter(2),
                        3: getRandEncounter(3),
                        4: getRandEncounter(4)
                    },
                    leafLevels:      [],       // which levels hold a leaf token (can be multiple)
                    collectedLevels: [],       // which levels' leaves have already been collected
                    visited:         false
                };
            }
        }
    }

    placeLeafTokens();

    // Player starts at center hex — no encounter on starting tile
    G.board[hk(0, 0)].visited = true;

    updateStats();
    updateLeafDisplay();
    const startPos = hexToPixel(0, 0);
    document.getElementById('player-token-img')
            .setAttribute('transform', `translate(${startPos.x}, ${startPos.y})`);
    document.body.classList.remove('level4-invert');
    document.getElementById('ep-idle').style.display = 'none';
    document.getElementById('ep-title').style.opacity = '';
    document.getElementById('ep-description').style.opacity = '';
    document.getElementById('ep-result').classList.add('hidden');
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('escape-container').classList.add('hidden');
    const existingOverlay = document.getElementById('tp-word-overlay');
    if (existingOverlay) existingOverlay.remove();

    renderBoard();
}

function placeLeafTokens() {
    // Exactly one leaf tile per level, levels 1–3 only
    const keys = Object.keys(G.board).filter(k => k !== hk(0, 0));
    for (let level = 1; level <= 3; level++) {
        const shuffled = shuffle([...keys]);
        for (const k of shuffled) {
            if (!G.board[k].leafLevels.includes(level)) {
                G.board[k].leafLevels.push(level);
                break;
            }
        }
    }
}

function placeReplacementLeaf() {
    const keys = Object.keys(G.board).filter(k => k !== hk(0, 0));
    const candidates = [];
    for (const k of keys) {
        const hex = G.board[k];
        for (const level of [1, 2, 3]) {
            if (hex.currentLevel >= level &&
                !hex.leafLevels.includes(level) &&
                !hex.collectedLevels.includes(level)) {
                candidates.push({ k, level });
            }
        }
    }
    if (candidates.length === 0) return;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    G.board[pick.k].leafLevels.push(pick.level);
    renderBoard();
}

function getRandEncounter(level) {
    const pool = ENCOUNTERS[level];
    return pool[Math.floor(Math.random() * pool.length)];
}

// ============================================================
// HEX MATH
// ============================================================

// String key for a hex coordinate
function hk(q, r) { return `${q},${r}`; }

// Axial coordinates → SVG pixel position (flat-top, centered at SVG origin 0,0)
function hexToPixel(q, r) {
    const x = HEX_SIZE * 1.5 * q;
    const y = HEX_SIZE * (SQRT3 / 2 * q + SQRT3 * r);
    return { x, y };
}

// The six corner points of a flat-top hex centered at (cx, cy)
function hexCorners(cx, cy) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;  // 0°, 60°, 120°, 180°, 240°, 300°
        pts.push({
            x: cx + HEX_SIZE * Math.cos(angle),
            y: cy + HEX_SIZE * Math.sin(angle)
        });
    }
    return pts;
}

function cornersToSVGPoints(corners) {
    return corners.map(c => `${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' ');
}

// All valid board neighbors of (q, r)
function getNeighbors(q, r) {
    return HEX_DIRS
        .map(d => ({ q: q + d.q, r: r + d.r }))
        .filter(h => G.board[hk(h.q, h.r)] !== undefined);
}

// True if a hex is on the outer ring of the board (adjacent to at least one off-board space)
function isEdgeHex(q, r) {
    return HEX_DIRS.some(d => G.board[hk(q + d.q, r + d.r)] === undefined);
}

// ============================================================
// RENDERING
// ============================================================
function renderBoard() {
    const hexLayer   = document.getElementById('hex-layer');
    const tokenLayer = document.getElementById('token-layer');
    hexLayer.innerHTML   = '';
    tokenLayer.innerHTML = '';

    const pq = G.player.q;
    const pr = G.player.r;
    const adjKeys = new Set(getNeighbors(pq, pr).map(h => hk(h.q, h.r)));

    // If forceDeeperMove/forceShallowerMove is active, restrict movement direction
    let validMoveKeys = adjKeys;
    if (G.quickJog && G.phase === 'move') {
        const extended = new Set([...adjKeys]);
        for (const n of getNeighbors(pq, pr)) {
            for (const n2 of getNeighbors(n.q, n.r)) {
                const k2 = hk(n2.q, n2.r);
                if (k2 !== hk(pq, pr)) extended.add(k2);
            }
        }
        validMoveKeys = extended;
    } else if (G.forceDeeperMove && G.phase === 'move') {
        const playerLevel = G.board[hk(pq, pr)].currentLevel;
        const deeper = new Set([...adjKeys].filter(k => G.board[k].currentLevel > playerLevel));
        if (deeper.size > 0) validMoveKeys = deeper;
    } else if (G.forceShallowerMove && G.phase === 'move') {
        const playerLevel = G.board[hk(pq, pr)].currentLevel;
        const shallower = new Set([...adjKeys].filter(k => G.board[k].currentLevel < playerLevel));
        if (shallower.size > 0) validMoveKeys = shallower;
    } else if (G.forceLevel3Move && G.phase === 'move') {
        const level3 = new Set([...adjKeys].filter(k => G.board[k].currentLevel === 3));
        if (level3.size > 0) validMoveKeys = level3;
    }

    for (const key of Object.keys(G.board)) {
        const hex = G.board[key];
        const { x, y } = hexToPixel(hex.q, hex.r);
        const corners = hexCorners(x, y);
        const pts     = cornersToSVGPoints(corners);

        const isAdjacent       = validMoveKeys.has(key) && G.phase === 'move' && !G.revealMode && !G.hexRemoveMode;
        const isScoutable      = adjKeys.has(key) && G.phase === 'scout' && G.scoutResults[key] === undefined;
        const isCardReveal     = G.revealMode && !G.revealMode.anyHex && adjKeys.has(key) && G.scoutResults[key] === undefined;
        const isCardRevealAny  = G.revealMode && G.revealMode.anyHex && key !== hk(pq, pr) && G.scoutResults[key] === undefined;
        const isHexRemovable   = G.hexRemoveMode && adjKeys.has(key) && hex.currentLevel < 4;
        const lvl              = hex.currentLevel;

        // Build group
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Fill polygon
        const fill = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        fill.setAttribute('points', pts);

        const fillClasses = ['hex-fill', `lvl-${lvl}`];
        if (isAdjacent)                    fillClasses.push('is-adjacent');
        if (isScoutable || isCardReveal || isCardRevealAny) fillClasses.push('is-scoutable');
        if (isHexRemovable)                fillClasses.push('is-removable');
        if (G.scoutResults[key] === true)  fillClasses.push('scouted-leaf');
        if (G.scoutResults[key] === false) fillClasses.push('scouted-empty');
        fill.setAttribute('class', fillClasses.join(' '));
        fill.setAttribute('data-key', key);

        if (isAdjacent)                    fill.addEventListener('click', () => onHexClick(hex.q, hex.r));
        if (isScoutable)                   fill.addEventListener('click', () => onScoutHexClick(hex.q, hex.r));
        if (isCardReveal || isCardRevealAny) fill.addEventListener('click', () => onRevealHexClick(hex.q, hex.r));
        if (isHexRemovable)                fill.addEventListener('click', () => onHexRemoveClick(hex.q, hex.r));

        // Stroke overlay
        const stroke = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        stroke.setAttribute('points', pts);
        stroke.setAttribute('class', 'hex-stroke');

        // Level number label (light text on dark tiles)
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', y);
        label.setAttribute('class', 'level-label');
        label.setAttribute('fill', lvl >= 3 ? '#cccccc' : '#555555');
        label.textContent = lvl;

        g.appendChild(fill);
        g.appendChild(stroke);
        g.appendChild(label);


        hexLayer.appendChild(g);
    }

    // Drift the persistent glasses token to the player's current hex
    const { x: px, y: py } = hexToPixel(pq, pr);
    document.getElementById('player-token-img')
            .setAttribute('transform', `translate(${px}, ${py})`);

    // Show/hide escape button
    const escapeContainer = document.getElementById('escape-container');
    if (G.canEscape && isEdgeHex(pq, pr) && G.phase === 'move') {
        escapeContainer.classList.remove('hidden');
    } else {
        escapeContainer.classList.add('hidden');
    }
}

// ============================================================
// MOVEMENT
// ============================================================
function onHexClick(q, r) {
    if (G.phase !== 'move') return;

    G.quickJog = false; // consume quick jog if active

    const prevQ = G.player.q;
    const prevR = G.player.r;

    // Departure: remove the top tile from the hex the player is leaving
    const prevHex = G.board[hk(prevQ, prevR)];
    if (prevHex.currentLevel < 4) {
        prevHex.currentLevel++;
    }

    // Clear forced move constraints (consumed on this move)
    G.forceDeeperMove = false;
    G.forceShallowerMove = false;
    G.forceLevel3Move = false;

    // Move player
    G.player.q = q;
    G.player.r = r;

    const hex = G.board[hk(q, r)];
    hex.visited = true;

    // Check if there is an uncollected leaf token at the current level of this hex
    const hasLeafHere = hex.leafLevels.includes(hex.currentLevel)
                     && !hex.collectedLevels.includes(hex.currentLevel);

    G.pendingLeaf   = hasLeafHere;
    G.scoutResults  = {};
    G.phase = 'encounter';

    // Tick down Totally Lost if active
    if (G.player.attributes.includes('Totally Lost')) {
        G.totallyLostTurns--;
        if (G.totallyLostTurns <= 0) removeTotallyLost();
    }

    // Energetic Companion: 1-in-10 chance of +1 PoM on each move
    if (G.player.attributes.includes('An Energetic Companion') && rollD10() === 10) {
        G.player.peaceOfMind = Math.min(12, G.player.peaceOfMind + 1);
        flashCompanionAttribute();
    }

    renderBoard();
    triggerEncounter(hex);
}

// ============================================================
// ENCOUNTER SYSTEM
// ============================================================
function triggerEncounter(hex) {
    if (hex.currentLevel === 4) {
        document.body.classList.add('level4-invert');
    }

    const encounter = G.pendingLeaf
        ? (hex.currentLevel === 1 ? LEAF_ENCOUNTER : LEAF_ENCOUNTER_DEFAULT)
        : hex.encounters[hex.currentLevel];

    G.pendingEncounter = { encounter, hex };

    // No-item fallback: if the encounter requires an item the player lacks, show alternate description and auto-continue
    if (encounter.noItemFallback && !G.player.items.includes(encounter.noItemFallback.item)) {
        showEncounterOverlay(encounter);
        document.getElementById('ep-roll').textContent = '';
        const fallbackLines = encounter.noItemFallback.effects
            ? applyEffects(encounter.noItemFallback.effects)
            : [];
        showResultText(encounter.noItemFallback.description, fallbackLines);
        document.getElementById('ep-choices').innerHTML = '';
        document.getElementById('ep-result').classList.remove('hidden');
        updateStats();
        return;
    }

    // Encounters with custom intros always bypass the normal flow
    if (encounter.id === 'third_party') {
        playThirdPartyIntro(encounter);
        return;
    }

    // Auto-resolve: single choice, no check, no multiCheck — skip the choice button
    const c = encounter.choices[0];
    const isAutoResolve = encounter.choices.length === 1 && !c.check && !c.multiCheck;

    if (isAutoResolve) {
        showEncounterOverlay(encounter);
        // Apply effects and show result immediately, bypassing choice buttons
        const effectLines = applyEffects(c.success.effects ?? {});
        if (c.success.collectLeaf) collectLeaf();
        document.getElementById('ep-roll').textContent = '';
        showResultText(c.success.text || '', effectLines);
        document.getElementById('ep-choices').innerHTML = '';
        document.getElementById('ep-result').classList.remove('hidden');
        updateStats();
    } else {
        showEncounterOverlay(encounter);
    }
}

function showEncounterOverlay(encounter) {
    document.getElementById('ep-idle').style.display = 'none';
    document.getElementById('ep-badge').textContent  = '';
    document.getElementById('ep-result').classList.add('hidden');
    clearJournalButtons();
    clearSubChoiceButtons();

    // Reset elements before animating
    const titleEl = document.getElementById('ep-title');
    const descEl  = document.getElementById('ep-description');
    const choicesEl = document.getElementById('ep-choices');

    titleEl.className = '';
    descEl.className  = '';
    titleEl.style.opacity = '0';
    descEl.style.opacity  = '0';
    choicesEl.innerHTML   = '';

    titleEl.textContent = encounter.title;
    descEl.textContent  = encounter.description;

    // Staggered fade-in: title → description → choices
    const delay = 120;
    setTimeout(() => { titleEl.classList.add('fade-in'); }, 0);
    setTimeout(() => { descEl.classList.add('fade-in');  }, delay);
    renderEncounterChoices(encounter, delay * 2);
}

function renderEncounterChoices(encounter, startDelay) {
    const choicesEl = document.getElementById('ep-choices');
    choicesEl.innerHTML = '';

    const visibleChoices = encounter.choices.filter(choice => {
        if (choice.itemRequired) {
            const hasItem = G.player.items.includes(choice.itemRequired);
            const hasSubstitute = (choice.itemRequired === 'Firestarter' && G.player.items.includes('Flamethrower'))
                                || (choice.itemRequired === 'Food'       && G.player.items.includes('Cookie'));
            if (!hasItem && !hasSubstitute) return false;
        }
        if (!choice.condition) return true;
        if (choice.condition.lacksAttribute && G.player.attributes.includes(choice.condition.lacksAttribute)) return false;
        if (choice.condition.stat) {
            const val = G.player[choice.condition.stat];
            if (choice.condition.min !== undefined && val < choice.condition.min) return false;
            if (choice.condition.max !== undefined && val > choice.condition.max) return false;
        }
        return true;
    });

    const buttons = [];
    visibleChoices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.style.opacity = '0';

        const textSpan = document.createElement('span');
        textSpan.textContent = choice.text;
        btn.appendChild(textSpan);

        if (choice.check) {
            const note = document.createElement('span');
            note.className = 'choice-check-note';
            if (choice.check.raw) {
                note.textContent = `[${statDisplayName(choice.check.stat)} check — target ${choice.check.target}]`;
            } else {
                note.textContent = `[${capitalize(choice.check.stat)} check — target ${choice.check.target}]`;
            }
            btn.appendChild(note);
        } else if (choice.multiCheck) {
            const note = document.createElement('span');
            note.className = 'choice-check-note';
            note.textContent = `[${capitalize(choice.multiCheck.stat)} check — target ${choice.multiCheck.target} × ${choice.multiCheck.count}]`;
            btn.appendChild(note);
        } else if (choice.dualCheck) {
            const note = document.createElement('span');
            note.className = 'choice-check-note';
            note.textContent = `[${choice.dualCheck.map(c => `${capitalize(c.stat)} ${c.target}`).join(' + ')} check]`;
            btn.appendChild(note);
        }
        if (choice.itemCheck) {
            const note = document.createElement('span');
            note.className = 'choice-check-note';
            const hasIt = G.player.items.includes(choice.itemCheck);
            note.textContent = `[${hasIt ? 'Has' : 'No'} ${choice.itemCheck}]`;
            if (!hasIt) note.style.opacity = '0.5';
            btn.appendChild(note);
        }
        if (choice.itemRequired) {
            const note = document.createElement('span');
            note.className = 'choice-check-note';
            const usingSubstitute = (choice.itemRequired === 'Firestarter' && !G.player.items.includes('Firestarter') && G.player.items.includes('Flamethrower'))
                                  || (choice.itemRequired === 'Food'       && !G.player.items.includes('Food')       && G.player.items.includes('Cookie'));
            const substituteLabel = choice.itemRequired === 'Firestarter' ? 'Firestarter / Flamethrower' : 'Food / Cookie';
            note.textContent = usingSubstitute ? `[Requires: ${substituteLabel}]` : `[Requires: ${choice.itemRequired}]`;
            btn.appendChild(note);
        }

        btn.addEventListener('click', () => resolveChoice(choice));
        choicesEl.appendChild(btn);
        buttons.push(btn);
    });

    buttons.forEach((btn, i) => {
        setTimeout(() => {
            btn.style.opacity = '0';
            btn.classList.add('fade-in');
        }, startDelay + 120 * i);
    });
}

function playThirdPartyIntro(enc) {
    const badge   = document.getElementById('ep-badge');
    const titleEl = document.getElementById('ep-title');
    const descEl  = document.getElementById('ep-description');

    // Reset battle state each time this encounter starts
    G.thirdPartyInjured  = 0;
    G.thirdPartyPlacated = 0;
    G.thirdPartyFedIt    = false;

    // Set up encounter content invisibly in the background
    document.getElementById('ep-idle').style.display = 'none';
    document.getElementById('ep-result').classList.add('hidden');
    document.getElementById('ep-choices').innerHTML  = '';
    badge.textContent     = '— Level 4 —';
    titleEl.textContent   = enc.title;
    titleEl.className     = '';
    titleEl.style.opacity = '0';
    descEl.textContent    = enc.description;
    descEl.className      = '';
    descEl.style.opacity  = '0';

    // Full-screen word overlay
    const overlay = document.createElement('div');
    overlay.id = 'tp-word-overlay';
    document.body.appendChild(overlay);

    const wordDisplay = document.createElement('div');
    wordDisplay.id = 'tp-word-display';
    overlay.appendChild(wordDisplay);

    const words = ['This.', 'Is.', 'Your.', 'End.'];
    let i = 0;

    function showNext() {
        if (i >= words.length) {
            // All words on screen — pause, then fade the whole overlay to black
            setTimeout(() => {
                overlay.style.transition = 'opacity 0.8s ease';
                overlay.style.opacity    = '0';

                setTimeout(() => {
                    overlay.remove();
                    titleEl.style.transition = 'opacity 0.4s ease';
                    titleEl.style.opacity    = '1';
                    setTimeout(() => {
                        descEl.style.transition = 'opacity 0.4s ease';
                        descEl.style.opacity    = '1';
                    }, 120);
                    renderEncounterChoices(enc, 240);
                }, 800);
            }, 1400);
            return;
        }

        wordDisplay.textContent = words.slice(0, i + 1).join('\u2003');
        i++;
        setTimeout(showNext, 900);
    }

    // Make word display visible before starting
    wordDisplay.style.opacity = '1';

    // Start after inversion settles
    setTimeout(showNext, 800);
}

// ============================================================
// THIRD PARTY BATTLE SUB-ENCOUNTER
// ============================================================

function showThirdPartyBattleChoices() {
    const choicesEl = document.getElementById('ep-choices');
    document.getElementById('ep-result').classList.add('hidden');
    document.getElementById('ep-roll').textContent = '';
    clearSubChoiceButtons();
    choicesEl.innerHTML = '';

    const hasFiveCards  = G.powerCards.length >= 5;
    const hasGun        = G.player.items.includes('Gun');
    const hasFirestarter = G.player.items.includes('Firestarter') || G.player.items.includes('Flamethrower');
    const hasFood       = !G.thirdPartyFedIt && (G.player.items.includes('Food') || G.player.items.includes('Cookie'));
    const hasFlowers    = G.player.items.includes('Bluebell') && G.player.items.includes('Phlox Flower');

    const choices = [
        { text: 'Attack it head on.',                  note: '[Strength check — target 1.9]',        show: true,           action: resolveTPAttack      },
        { text: 'Summon the stars to fight with you.', note: '[Costs 5 power cards]',                show: hasFiveCards,   action: resolveTPSummonStars },
        { text: 'Shoot it.',                           note: '[Uses the Gun]',                        show: hasGun,         action: resolveTPShoot       },
        { text: 'Kill it with fire.',                  note: '[Requires Firestarter]',                show: hasFirestarter, action: resolveTPFire        },
        { text: 'Offer it the stars.',                 note: '[Costs 5 power cards]',                 show: hasFiveCards,   action: resolveTPOfferStars  },
        { text: 'Feed it.',                            note: '[Consumes Food or Cookie]',             show: hasFood,        action: resolveTPFeed        },
        { text: 'Give it some flowers.',               note: '[Consumes Bluebell and Phlox Flower]',  show: hasFlowers,     action: resolveTPFlowers     },
        { text: 'Escape.',                             note: '[Speed check — target 2.0]',            show: true,           action: resolveTPEscape      },
    ];

    choices.filter(c => c.show).forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';

        const textSpan = document.createElement('span');
        textSpan.textContent = choice.text;
        btn.appendChild(textSpan);

        const note = document.createElement('span');
        note.className = 'choice-check-note';
        note.textContent = choice.note;
        btn.appendChild(note);

        btn.addEventListener('click', () => {
            document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
            choice.action();
        });
        choicesEl.appendChild(btn);
    });
}

// Show a battle result and set Continue to loop back to battle choices
function tpShowResult(rollText, text, effectLines) {
    document.getElementById('ep-roll').textContent = rollText;
    showResultText(text, effectLines);
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-result').classList.remove('hidden');
    updateStats();
    const btn = document.getElementById('ep-continue');
    btn.style.display = '';
    btn.textContent   = 'Continue';
    btn.onclick       = showThirdPartyBattleChoices;
}

// Check if either win condition has been reached; if so override Continue
function checkTPWin() {
    if (G.thirdPartyInjured >= 3) {
        const btn = document.getElementById('ep-continue');
        btn.onclick = () => {
            document.getElementById('ep-roll').textContent = '';
            showResultText("You can't tell for sure, but the beast is clearly wobbling more than it was before. Could it really be hurt? You throw all your weight into a final push and try to push it down. The thing stumbles, but regains its balance. For a second, it seems to regard you in its own way and then saunters off. You sit down wearily and look off into the distance. The sun is rising. What a relief. Somewhere close by, cars are rushing through the trees. Oh, what a beautiful morning.", []);
            document.getElementById('ep-choices').innerHTML = '';
            document.getElementById('ep-result').classList.remove('hidden');
            btn.textContent = 'Continue';
            btn.onclick = () => endGame(true, 'You beat the Third Party and escaped the woods.', 'Victor.');
        };
        return true;
    }
    if (G.thirdPartyPlacated >= 3) {
        const btn = document.getElementById('ep-continue');
        btn.onclick = () => {
            document.getElementById('ep-roll').textContent = '';
            showResultText("The thing appears to look down at your offerings, considering them. It picks up the bluebell in one of its strange appendages and inspects its fragile beauty...at least you think it does. The menace that had been exuding from it has faded now and you feel less uncomfortable in its presence. It lifts a long leg-like limb and gesticulates slightly past you. You look back. It's a...backyard? It's someone's backyard! You whip your head back around at the monster, but it is gone.", []);
            document.getElementById('ep-choices').innerHTML = '';
            document.getElementById('ep-result').classList.remove('hidden');
            btn.textContent = 'Continue';
            btn.onclick = () => endGame(true, 'You made a new friend tonight.', 'Acquainted.');
        };
        return true;
    }
    return false;
}

function resolveTPAttack() {
    let base = G.player.strength;
    if (G.weirdRockQueued) { base = parseFloat((base + 0.1).toFixed(1)); G.weirdRockQueued = false; }
    if (G.powerCardBoost && G.powerCardBoost.stat === 'strength') {
        base = parseFloat((base + G.powerCardBoost.amount).toFixed(1));
        G.powerCardBoost = null;
        renderPowerCards();
    }
    if (G.woodenBeamActive) base = parseFloat((base + 0.2).toFixed(1));
    const { base: debuffedBase } = applyDebuff('strength', base);
    base = debuffedBase;

    const roll     = rollD10();
    const result   = parseFloat((base + roll * 0.1).toFixed(1));
    const success  = result >= 1.9;
    const rollText = `Roll: ${roll}  |  Strength ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs 1.9 — ${success ? 'SUCCESS' : 'FAILURE'}`;

    if (success) {
        let text;
        if (G.thirdPartyInjured === 0) {
            text = "You grab the nearest stick and charge the monster. The point of the wood you chose drives itself soundly into the cloth of the creature. It steps back with a little bit of a \"humph.\" You aren't sure if you've wounded it.";
        } else if (G.thirdPartyInjured === 1) {
            text = "You scramble in the dirt to find a rock of ample size. With all of your weight, you drive it into one of its legs. The beast makes an audible grunt of pain and moves in for another attack.";
        } else {
            text = "You notice a dead tree nearby you. You run to it, allowing the thing to lumber after you. The tree...it could be pushed over! You press your chest hard against it and hear a sharp cracking sound. The tree comes down, straight on top of the beast. It shatters into two pieces and rolls away. The thing audibly roars.";
        }
        G.thirdPartyInjured++;
        tpShowResult(rollText, text, []);
        checkTPWin();
    } else {
        const effectLines = applyEffects({ health: -2 });
        tpShowResult(rollText, "You throw a wild haymaker at the beast's legs, but it sweeps your legs out from under you. The beast brings its weight down on top of you, crushing several of your ribs and organs.", effectLines);
    }
}

function resolveTPSummonStars() {
    G.powerCards.splice(0, 5);
    renderPowerCards();
    G.thirdPartyInjured++;
    tpShowResult('', "The sky shifts above you and Polaris casts a great beam upon the world. A heavenly chorus of wind, oak, and fire stirs from somewhere beyond sight and the light of the Moon is lifted to new heights. The creature is visibly discomfited.", []);
    checkTPWin();
}

function resolveTPShoot() {
    consumeGun();
    G.thirdPartyInjured++;
    tpShowResult('', "You pull out the pistol you've been keeping in your pocket and fire it at the beast. You hit it straight on, the force slowing its advance.", []);
    updateStats();
    checkTPWin();
}

function resolveTPFire() {
    const fi = G.player.items.indexOf('Firestarter');
    if (fi !== -1) {
        G.player.items.splice(fi, 1);
    } else {
        const fli = G.player.items.indexOf('Flamethrower');
        if (fli !== -1) G.player.items.splice(fli, 1);
    }
    G.thirdPartyInjured++;
    tpShowResult('', "The cloth that wraps the beast looks dry and flammable. You dart around to the side of the beast and grate your flint and steel together. It catches fire briefly, flaring up and consuming a part of it before dying out.", []);
    updateStats();
    checkTPWin();
}

function resolveTPOfferStars() {
    G.powerCards.splice(0, 5);
    renderPowerCards();
    G.thirdPartyPlacated++;
    tpShowResult('', "A strange force compels you to bow. You lift your arm and point upward, straight to Ursa Major. Heaven is watching.", []);
    checkTPWin();
}

function resolveTPFeed() {
    G.thirdPartyFedIt = true;
    let usedCookie = false;
    const foodIdx = G.player.items.indexOf('Food');
    if (foodIdx !== -1) {
        G.player.items.splice(foodIdx, 1);
    } else {
        const cookieIdx = G.player.items.indexOf('Cookie');
        if (cookieIdx !== -1) { G.player.items.splice(cookieIdx, 1); usedCookie = true; }
    }
    const text = usedCookie
        ? "That cookie was for you, dawg."
        : "You toss anything edible on your person at it. That might be enough to distract whatever this is.";
    G.thirdPartyPlacated++;
    tpShowResult('', text, []);
    updateStats();
    checkTPWin();
}

function resolveTPFlowers() {
    const bi = G.player.items.indexOf('Bluebell');
    if (bi !== -1) G.player.items.splice(bi, 1);
    const pi = G.player.items.indexOf('Phlox Flower');
    if (pi !== -1) G.player.items.splice(pi, 1);
    G.thirdPartyPlacated++;
    tpShowResult('', "You retrieve the flowers from your pocket and lay them down while backing away quickly. The beast picks each up and appears to examine them in turn.", []);
    updateStats();
    checkTPWin();
}

function resolveTPEscape() {
    let base = G.player.speed;
    if (G.cookieActive) base = parseFloat((base + 0.1).toFixed(1));
    if (G.powerCardBoost && G.powerCardBoost.stat === 'speed') {
        base = parseFloat((base + G.powerCardBoost.amount).toFixed(1));
        G.powerCardBoost = null;
        renderPowerCards();
    }
    const { base: debuffedBase } = applyDebuff('speed', base);
    base = debuffedBase;

    const roll     = rollD10();
    const result   = parseFloat((base + roll * 0.1).toFixed(1));
    const success  = result >= 2.0;
    const rollText = `Roll: ${roll}  |  Speed ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs 2.0 — ${success ? 'SUCCESS' : 'FAILURE'}`;

    if (success) {
        tpShowResult(rollText, "You bolt and don't look back. It chooses not to pursue.", []);
        document.getElementById('ep-continue').onclick = continueAfterEncounter;
    } else {
        const effectLines = applyEffects({ health: -2 });
        tpShowResult(rollText, "Fool. The desolation of abominations is upon you. Your ruin is assured. There is no escaping this.", effectLines);
    }
}

function showStrengthBoostPrompt(itemName) {
    const box = document.getElementById('items-box');
    box.classList.add('items-box-prompt');
    box.innerHTML = '';

    const question = document.createElement('p');
    question.style.cssText = 'margin:0 0 4px; font-size:13px;';
    question.textContent = 'Temporarily increase Strength by +0.1?';

    const warning = document.createElement('p');
    warning.style.cssText = 'margin:0 0 8px; font-size:11px; color:#888; font-style:italic;';
    warning.textContent = `The ${itemName.toLowerCase()} will be consumed.`;

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; gap:6px;';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'item-prompt-btn';
    yesBtn.textContent = 'Yes';
    yesBtn.addEventListener('click', () => {
        const ri = G.player.items.indexOf(itemName);
        if (ri !== -1) G.player.items.splice(ri, 1);
        G.weirdRockQueued = true;
        box.classList.remove('items-box-prompt');
        updateStats();
    });

    const noBtn = document.createElement('button');
    noBtn.className = 'item-prompt-btn';
    noBtn.textContent = 'No';
    noBtn.addEventListener('click', () => {
        box.classList.remove('items-box-prompt');
        updateInventory();
    });

    btnRow.appendChild(yesBtn);
    btnRow.appendChild(noBtn);
    box.appendChild(question);
    box.appendChild(warning);
    box.appendChild(btnRow);
}

function showWeirdRockPrompt() { showStrengthBoostPrompt('Weird Rock'); }

function showCookiePrompt() {
    const box = document.getElementById('items-box');
    box.classList.add('items-box-prompt');
    box.innerHTML = '';

    const question = document.createElement('p');
    question.style.cssText = 'margin:0 0 4px; font-size:13px;';
    question.textContent = 'Eat the Cookie? (+1 Health, +0.1 Speed this encounter, -0.1 Speed next encounter)';

    const warning = document.createElement('p');
    warning.style.cssText = 'margin:0 0 8px; font-size:11px; color:#888; font-style:italic;';
    warning.textContent = 'The cookie will be consumed. It can also substitute for Food.';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; gap:6px;';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'item-prompt-btn';
    yesBtn.textContent = 'Yes';
    yesBtn.addEventListener('click', () => {
        const ci = G.player.items.indexOf('Cookie');
        if (ci !== -1) G.player.items.splice(ci, 1);
        G.player.health = Math.min(12, G.player.health + 1);
        G.cookieActive = true;
        box.classList.remove('items-box-prompt');
        updateStats();
    });

    const noBtn = document.createElement('button');
    noBtn.className = 'item-prompt-btn';
    noBtn.textContent = 'No';
    noBtn.addEventListener('click', () => {
        box.classList.remove('items-box-prompt');
        updateInventory();
    });

    btnRow.appendChild(yesBtn);
    btnRow.appendChild(noBtn);
    box.appendChild(question);
    box.appendChild(warning);
    box.appendChild(btnRow);
}

function showFlamethrowerPrompt() {
    const box = document.getElementById('items-box');
    box.classList.add('items-box-prompt');
    box.innerHTML = '';

    const question = document.createElement('p');
    question.style.cssText = 'margin:0 0 4px; font-size:13px;';
    question.textContent = 'Activate Flamethrower? (+0.3 Visibility for this encounter)';

    const warning = document.createElement('p');
    warning.style.cssText = 'margin:0 0 8px; font-size:11px; color:#888; font-style:italic;';
    warning.textContent = 'The flamethrower will be consumed. It can also substitute for a Firestarter.';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; gap:6px;';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'item-prompt-btn';
    yesBtn.textContent = 'Yes';
    yesBtn.addEventListener('click', () => {
        const fi = G.player.items.indexOf('Flamethrower');
        if (fi !== -1) G.player.items.splice(fi, 1);
        G.flamethrowerActive = true;
        box.classList.remove('items-box-prompt');
        updateStats();
    });

    const noBtn = document.createElement('button');
    noBtn.className = 'item-prompt-btn';
    noBtn.textContent = 'No';
    noBtn.addEventListener('click', () => {
        box.classList.remove('items-box-prompt');
        updateInventory();
    });

    btnRow.appendChild(yesBtn);
    btnRow.appendChild(noBtn);
    box.appendChild(question);
    box.appendChild(warning);
    box.appendChild(btnRow);
}

function consumeGun() {
    G.gunQueued = false;
    G.gunUses--;
    if (G.gunUses <= 0) {
        const gi = G.player.items.indexOf('Gun');
        if (gi !== -1) G.player.items.splice(gi, 1, 'Empty Gun');
    }
}

function showGunPrompt() {
    const box = document.getElementById('items-box');
    box.classList.add('items-box-prompt');
    box.innerHTML = '';

    const question = document.createElement('p');
    question.style.cssText = 'margin:0 0 4px; font-size:13px;';
    question.textContent = 'Fire the Gun to auto-succeed your next Strength check?';

    const warning = document.createElement('p');
    warning.style.cssText = 'margin:0 0 8px; font-size:11px; color:#888; font-style:italic;';
    warning.textContent = 'The gun will become an Empty Gun.';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; gap:6px;';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'item-prompt-btn';
    yesBtn.textContent = 'Yes';
    yesBtn.addEventListener('click', () => {
        G.gunQueued = true;
        box.classList.remove('items-box-prompt');
        updateStats();
    });

    const noBtn = document.createElement('button');
    noBtn.className = 'item-prompt-btn';
    noBtn.textContent = 'No';
    noBtn.addEventListener('click', () => {
        box.classList.remove('items-box-prompt');
        updateInventory();
    });

    btnRow.appendChild(yesBtn);
    btnRow.appendChild(noBtn);
    box.appendChild(question);
    box.appendChild(warning);
    box.appendChild(btnRow);
}

function showEmptyGunPrompt() { showStrengthBoostPrompt('Empty Gun'); }

function showWoodenBeamPrompt() {
    const box = document.getElementById('items-box');
    box.classList.add('items-box-prompt');
    box.innerHTML = '';

    const question = document.createElement('p');
    question.style.cssText = 'margin:0 0 4px; font-size:13px;';
    question.textContent = 'Boost Strength by +0.2 for this encounter?';

    const warning = document.createElement('p');
    warning.style.cssText = 'margin:0 0 8px; font-size:11px; color:#888; font-style:italic;';
    warning.textContent = 'The beam will be used up.';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; gap:6px;';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'item-prompt-btn';
    yesBtn.textContent = 'Yes';
    yesBtn.addEventListener('click', () => {
        const i = G.player.items.indexOf('Wooden Beam');
        if (i !== -1) G.player.items.splice(i, 1);
        G.woodenBeamActive = true;
        box.classList.remove('items-box-prompt');
        updateStats();
    });

    const noBtn = document.createElement('button');
    noBtn.className = 'item-prompt-btn';
    noBtn.textContent = 'No';
    noBtn.addEventListener('click', () => {
        box.classList.remove('items-box-prompt');
        updateInventory();
    });

    btnRow.appendChild(yesBtn);
    btnRow.appendChild(noBtn);
    box.appendChild(question);
    box.appendChild(warning);
    box.appendChild(btnRow);
}

function showFlashlightPrompt() {
    if (G.flashlightActive) return;
    const box = document.getElementById('items-box');
    box.classList.add('items-box-prompt');
    box.innerHTML = '';

    const question = document.createElement('p');
    question.style.cssText = 'margin:0 0 4px; font-size:13px;';
    question.textContent = 'Boost Visibility by +0.1 for this encounter?';

    const warning = document.createElement('p');
    warning.style.cssText = 'margin:0 0 8px; font-size:11px; color:#888; font-style:italic;';
    warning.textContent = `Uses remaining: ${G.flashlightUses}. One use will be consumed.`;

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; gap:6px;';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'item-prompt-btn';
    yesBtn.textContent = 'Yes';
    yesBtn.addEventListener('click', () => {
        G.flashlightUses--;
        if (G.flashlightUses <= 0) {
            const i = G.player.items.indexOf('Flashlight');
            if (i !== -1) G.player.items.splice(i, 1);
        }
        G.flashlightActive = true;
        box.classList.remove('items-box-prompt');
        updateStats();
    });

    const noBtn = document.createElement('button');
    noBtn.className = 'item-prompt-btn';
    noBtn.textContent = 'No';
    noBtn.addEventListener('click', () => {
        box.classList.remove('items-box-prompt');
        updateInventory();
    });

    btnRow.appendChild(yesBtn);
    btnRow.appendChild(noBtn);
    box.appendChild(question);
    box.appendChild(warning);
    box.appendChild(btnRow);
}

// Generic prompt for simple use-and-consume items.
// promptText: e.g. 'Use First Aid Kit? (+2 Health)'
// effects: passed directly to applyEffects on confirm
function showSimpleItemPrompt(itemName, promptText, effects) {
    const box = document.getElementById('items-box');
    box.classList.add('items-box-prompt');
    box.innerHTML = '';

    const question = document.createElement('p');
    question.style.cssText = 'margin:0 0 8px; font-size:13px;';
    question.textContent = promptText;

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; gap:6px;';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'item-prompt-btn';
    yesBtn.textContent = 'Yes';
    yesBtn.addEventListener('click', () => {
        const i = G.player.items.indexOf(itemName);
        if (i !== -1) G.player.items.splice(i, 1);
        applyEffects(effects);
        box.classList.remove('items-box-prompt');
        updateStats();
    });

    const noBtn = document.createElement('button');
    noBtn.className = 'item-prompt-btn';
    noBtn.textContent = 'No';
    noBtn.addEventListener('click', () => {
        box.classList.remove('items-box-prompt');
        updateInventory();
    });

    btnRow.appendChild(yesBtn);
    btnRow.appendChild(noBtn);
    box.appendChild(question);
    box.appendChild(btnRow);
}

function showFirstAidKitPrompt()     { showSimpleItemPrompt('First Aid Kit',     'Use First Aid Kit? (+2 Health)',              { health: 2 }); }
function showBluebellPrompt()        { showSimpleItemPrompt('Bluebell',           'Use Bluebell? (+1 Peace of Mind)',            { peaceOfMind: 1 }); }
function showEyeglassPrompt()        { showSimpleItemPrompt('Eyeglass',           'Use Eyeglass? (+0.2 Visibility)',             { visibility: 0.2 }); }
function showPhloxFlowerPrompt()     { showSimpleItemPrompt('Phlox Flower',       'Use Phlox Flower? (−1 Peace of Mind)',        { peaceOfMind: -1 }); }
function showFoodPrompt()            { showSimpleItemPrompt('Food',               'Eat the food? (+1 Health)',                   { health: 1 }); }
function showIncongruousStaffPrompt(){ showSimpleItemPrompt('Incongruous Staff',  'Use Incongruous Staff? (+0.2 Strength)',      { strength: 0.2 }); }

function resolveChoice(choice) {
    // If Flamethrower was used as Firestarter substitute, consume it now
    if (choice.itemRequired === 'Firestarter' && !G.player.items.includes('Firestarter')) {
        const fi = G.player.items.indexOf('Flamethrower');
        if (fi !== -1) G.player.items.splice(fi, 1);
        G.flamethrowerActive = false;
    }
    // If Cookie was used as Food substitute, consume it now
    if (choice.itemRequired === 'Food' && !G.player.items.includes('Food')) {
        const ci = G.player.items.indexOf('Cookie');
        if (ci !== -1) G.player.items.splice(ci, 1);
    }

    // Item-gated choice: item possession determines success/failure, no dice roll
    if (choice.itemCheck) {
        document.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });
        const hasItem = G.player.items.includes(choice.itemCheck);
        const outcome = hasItem ? choice.success : (choice.failure ?? choice.success);
        const effectLines = applyEffects(outcome.effects ?? {});
        document.getElementById('ep-roll').textContent = hasItem
            ? `You had a ${choice.itemCheck}.`
            : `You did not have a ${choice.itemCheck}.`;
        showResultText(outcome.text, effectLines);
        document.getElementById('ep-choices').innerHTML = '';
        document.getElementById('ep-result').classList.remove('hidden');
        updateStats();
        return;
    }

    // Dual sequential check (two different stats)
    if (choice.dualCheck) {
        document.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });
        G.pendingDualCheck = {
            checks:    choice.dualCheck,
            idx:       0,
            onSuccess: choice.success,
            onFailure: choice.failure
        };
        rollNextDualCheck();
        return;
    }

    document.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });

    // Multi-step sequential check
    if (choice.multiCheck) {
        G.pendingMultiCheck = {
            stat:      choice.multiCheck.stat,
            target:    choice.multiCheck.target,
            total:     choice.multiCheck.count,
            remaining: choice.multiCheck.count,
            onSuccess: choice.success,
            onFailure: choice.failure
        };
        rollNextInSequence();
        return;
    }

    let outcome;
    let rollText = '';
    let isFailure = false;

    if (choice.check) {
        if (G.gunQueued && choice.check.stat === 'strength') {
            rollText = 'Roll: — (Bang!)';
            consumeGun();
            outcome = choice.success;
        } else {
        let base     = G.player[choice.check.stat];
        let rockUsed = false;
        if (G.weirdRockQueued && choice.check.stat === 'strength') {
            base = parseFloat((base + 0.1).toFixed(1));
            G.weirdRockQueued = false;
            rockUsed = true;
        }
        if (G.powerCardBoost && G.powerCardBoost.stat === choice.check.stat) {
            base = choice.check.raw
                ? base + G.powerCardBoost.amount
                : parseFloat((base + G.powerCardBoost.amount).toFixed(1));
            G.powerCardBoost = null;
            renderPowerCards();
        }
        if (G.woodenBeamActive && choice.check.stat === 'strength') {
            base = parseFloat((base + 0.2).toFixed(1));
        }
        if (G.flashlightActive    && choice.check.stat === 'visibility') base = parseFloat((base + 0.1).toFixed(1));
        if (G.flamethrowerActive  && choice.check.stat === 'visibility') base = parseFloat((base + 0.3).toFixed(1));
        if (G.cookieActive        && choice.check.stat === 'speed')      base = parseFloat((base + 0.1).toFixed(1));
        const { base: debuffedBase, note: debuffNote } = applyDebuff(choice.check.stat, base);
        base = debuffedBase;
        const roll = rollD10();
        let result, rawSingle, success;
        if (choice.check.raw) {
            result    = base + roll;
            rawSingle = result >= choice.check.target;
            rollText  = `Roll: ${roll}  |  ${statDisplayName(choice.check.stat)} ${base} + ${roll} = ${result} vs ${choice.check.target} — ${rawSingle ? 'SUCCESS' : 'FAILURE'}${debuffNote}`;
        } else {
            result    = parseFloat((base + roll * 0.1).toFixed(1));
            rawSingle = result >= choice.check.target;
            rollText  = `Roll: ${roll}  |  ${capitalize(choice.check.stat)} ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs ${choice.check.target} — ${rawSingle ? 'SUCCESS' : 'FAILURE'}${rockUsed ? ' (Weird Rock)' : ''}${debuffNote}`;
        }
        const b3 = tryBallsy(choice.check.stat, rawSingle, rollText);
        success  = b3.success;
        rollText = b3.rollLine;

        outcome  = success ? choice.success : (choice.failure ?? choice.success);
        isFailure = !success && !!choice.failure;
        } // end else (no gun)
    } else if (choice.randomCheck) {
        const roll = rollD10();
        const isEven = roll % 2 === 0;
        let success;
        if (choice.randomCheck === 'odd') {
            success = !isEven;
            rollText = `Roll: ${roll} — ${isEven ? 'EVEN — FAILURE' : 'ODD — SUCCESS'}`;
        } else if (typeof choice.randomCheck === 'object' && choice.randomCheck.min !== undefined) {
            success = roll >= choice.randomCheck.min;
            rollText = `Roll: ${roll} — ${success ? 'SUCCESS' : 'FAILURE'}`;
        } else {
            success = isEven;
            rollText = `Roll: ${roll} — ${isEven ? 'EVEN — SUCCESS' : 'ODD — FAILURE'}`;
        }
        outcome = success ? choice.success : (choice.failure ?? choice.success);
        isFailure = !success && !!choice.failure;
    } else {
        outcome = choice.success;
    }

    if (outcome.collectLeaf) {
        collectLeaf();
    }

    // Joke/loop choice: show text but re-enable all choices so player must pick a real one
    if (outcome.repeatsChoices) {
        document.getElementById('ep-roll').textContent = '';
        document.getElementById('ep-result').classList.remove('hidden');
        document.getElementById('ep-continue').style.display = 'none';
        showResultText(outcome.text, []);
        document.querySelectorAll('.choice-btn').forEach(b => { b.disabled = false; });
        return;
    }

    // Snapshot state and track effects (for Second Chance / Salvation / Damnation)
    G.secondChanceSnapshot = snapshotPlayer();
    G.lastOutcomeEffects   = outcome.effects ?? {};
    if (isFailure) G.lastFailureEffects = outcome.effects ?? {};

    // Display result in panel
    const effectLines = applyEffects(outcome.effects ?? {});
    document.getElementById('ep-roll').textContent        = rollText;
    showResultText(outcome.text, effectLines);
    document.getElementById('ep-choices').innerHTML       = '';
    document.getElementById('ep-result').classList.remove('hidden');
    updateStats();
    if (choice.check || choice.randomCheck) addSecondChancePrompt();

    // Journal reading prompt
    if (outcome.opensJournal) {
        document.getElementById('ep-continue').textContent = 'Leave it.';
        addJournalButton('Read it.', startJournalReading);
    }

    // Trash digging sub-choices
    if (outcome.opensTrashDigging) {
        showTrashSubChoices();
    }

    // Wish sub-choices
    if (outcome.opensWishChoices) {
        showWishSubChoices();
    }

    // Voices listening series
    if (outcome.opensVoicesListening) {
        startVoicesListening();
    }

    // House room-navigation encounter
    if (outcome.opensHouseEncounter) {
        startHouseEncounter();
    }

    // Shed sub-choices
    if (outcome.opensShedSubChoices) {
        showShedSubChoices();
    }

    // Cave sub-choices
    if (outcome.opensCaveSubChoices) {
        showCaveSubChoices();
    }

    // War and Peace sub-choices
    if (outcome.opensWarSubChoices) {
        showWarAndPeaceSubChoices();
    }

    // Hushed Dispute sub-choices
    if (outcome.opensHushedDisputeSubChoices) {
        showHushedDisputeSubChoices();
    }

    // Thick Veins sub-choices
    if (outcome.opensThickVeinsSubChoices) {
        showThickVeinsSubChoices();
    }

    // Third Party battle sub-encounter
    if (outcome.opensThirdPartyBattle) {
        document.getElementById('ep-continue').style.display = 'none';
        addSubChoiceButton('Continue.', showThirdPartyBattleChoices);
    }

    // Loop back to the encounter's initial choices (e.g. Plead for mercy)
    if (outcome.loopsToEncounter) {
        document.getElementById('ep-continue').style.display = 'none';
        addSubChoiceButton('Continue.', () => {
            clearSubChoiceButtons();
            document.getElementById('ep-result').classList.add('hidden');
            showEncounterOverlay(G.pendingEncounter.encounter);
        });
    }

    // Outcome triggers game over with a custom end screen on Continue
    if (outcome.gameOver) {
        G.customDeathTitle = outcome.gameOver.title;
        const continueBtn = document.getElementById('ep-continue');
        continueBtn.onclick = () => endGame(false, outcome.gameOver.message);
    }

    // Nostalgia sub-choices
    if (outcome.opensNostalgiaGroupSubChoices) {
        showNostalgiaGroupSubChoices();
    }
    if (outcome.opensNostalgiaHutSubChoices) {
        showNostalgiaHutSubChoices();
    }

    // Yawn sub-choices
    if (outcome.opensYawnTunnelSubChoices) {
        showYawnTunnelSubChoices();
    }

    // Lights in the Caves sub-choices
    if (outcome.opensLightsCavesSubChoices) {
        showLightsCavesSubChoices();
    }

    // Trouble with Somnolence sub-choices
    if (outcome.opensSomnolenceSleepSubChoices) {
        showSomnolenceSleepSubChoices();
    }

    // Don't Look sub-choices
    if (outcome.opensDoNotLookSubChoices) {
        showDoNotLookSubChoices();
    }

    // Galvanized sub-choices
    if (outcome.opensGalvanizedSubChoices) {
        showGalvanizedSubChoices();
    }

    // Chance Encounter sub-choices
    if (outcome.opensChanceEncounterTalkSubChoices) {
        showChanceEncounterTalkSubChoices();
    }
}

// Displays result text plus any effect lines beneath it
function showResultText(text, effectLines) {
    const el = document.getElementById('ep-result-text');
    el.innerHTML = '';
    if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        el.appendChild(p);
    }
    if (effectLines && effectLines.length) {
        const ul = document.createElement('ul');
        ul.style.cssText = 'margin-top:8px; padding-left:0; list-style:none; font-style:normal; font-size:12px; color:#555;';
        effectLines.forEach(line => {
            const li = document.createElement('li');
            if (typeof line === 'object' && line.html) {
                li.innerHTML = line.html;
            } else {
                li.textContent = line;
            }
            ul.appendChild(li);
        });
        el.appendChild(ul);
    }
}

// If player has Ballsy and a Strength check just failed, roll d10: on 10 it succeeds instead.
function tryBallsy(stat, success, rollLine) {
    if (!success && stat === 'strength' && G.player.attributes.includes('Ballsy') && rollD10() === 10) {
        return { success: true, rollLine: rollLine + ' (Ballsy!)' };
    }
    return { success, rollLine };
}

function rollNextInSequence() {
    const mc    = G.pendingMultiCheck;
    const rollN = mc.total - mc.remaining + 1;

    if (G.gunQueued && mc.stat === 'strength') {
        consumeGun();
        document.getElementById('ep-roll').textContent = `Roll ${rollN} of ${mc.total}: — (Bang!)`;
        document.getElementById('ep-choices').innerHTML = '';
        document.getElementById('ep-result').classList.remove('hidden');
        const continueBtn = document.getElementById('ep-continue');
        mc.remaining--;
        if (mc.remaining === 0) {
            const effectLines = applyEffects(mc.onSuccess.effects || {});
            showResultText(mc.onSuccess.text, effectLines);
            G.pendingMultiCheck = null;
            continueBtn.textContent = 'Continue';
            continueBtn.onclick = continueAfterEncounter;
        } else {
            showResultText(`Success. ${mc.remaining} more roll${mc.remaining > 1 ? 's' : ''} remaining.`, []);
            continueBtn.textContent = 'Roll Again';
            continueBtn.onclick = rollNextInSequence;
        }
        updateStats();
        return;
    }

    const roll  = rollD10();
    let { base, note: debuffNote } = applyDebuff(mc.stat, G.player[mc.stat]);
    if (G.woodenBeamActive && mc.stat === 'strength') {
        base = parseFloat((base + 0.2).toFixed(1));
    }
    if (G.flashlightActive   && mc.stat === 'visibility') base = parseFloat((base + 0.1).toFixed(1));
    if (G.flamethrowerActive && mc.stat === 'visibility') base = parseFloat((base + 0.3).toFixed(1));
    if (G.cookieActive       && mc.stat === 'speed')      base = parseFloat((base + 0.1).toFixed(1));
    const result  = parseFloat((base + roll * 0.1).toFixed(1));
    let rollLine  = `Roll ${rollN} of ${mc.total}: ${capitalize(mc.stat)} ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs ${mc.target} — ${result >= mc.target ? 'SUCCESS' : 'FAILURE'}${debuffNote}`;
    const b1      = tryBallsy(mc.stat, result >= mc.target, rollLine);
    const success = b1.success;
    rollLine      = b1.rollLine;

    document.getElementById('ep-roll').textContent = rollLine;
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-result').classList.remove('hidden');

    const continueBtn = document.getElementById('ep-continue');

    if (!success) {
        G.secondChanceSnapshot = snapshotPlayer();
        G.lastOutcomeEffects   = mc.onFailure.effects || {};
        G.lastFailureEffects   = mc.onFailure.effects || {};
        const effectLines = applyEffects(mc.onFailure.effects || {});
        showResultText(mc.onFailure.text, effectLines);
        G.pendingMultiCheck = null;
        continueBtn.textContent = 'Continue';
        continueBtn.onclick = continueAfterEncounter;
    } else {
        mc.remaining--;
        if (mc.remaining === 0) {
            G.secondChanceSnapshot = snapshotPlayer();
            G.lastOutcomeEffects   = mc.onSuccess.effects || {};
            const effectLines = applyEffects(mc.onSuccess.effects || {});
            showResultText(mc.onSuccess.text, effectLines);
            G.pendingMultiCheck = null;
            continueBtn.textContent = 'Continue';
            continueBtn.onclick = continueAfterEncounter;
        } else {
            showResultText(`Success. ${mc.remaining} more roll${mc.remaining > 1 ? 's' : ''} remaining.`, []);
            continueBtn.textContent = 'Roll Again';
            continueBtn.onclick = rollNextInSequence;
        }
    }

    updateStats();
}

function rollNextDualCheck() {
    const dc    = G.pendingDualCheck;
    const check = dc.checks[dc.idx];

    if (G.gunQueued && check.stat === 'strength') {
        consumeGun();
        document.getElementById('ep-roll').textContent = `Roll ${dc.idx + 1} of ${dc.checks.length}: — (Bang!)`;
        document.getElementById('ep-choices').innerHTML = '';
        document.getElementById('ep-result').classList.remove('hidden');
        const continueBtn = document.getElementById('ep-continue');
        continueBtn.style.display = '';
        dc.idx++;
        if (dc.idx >= dc.checks.length) {
            const effectLines = applyEffects(dc.onSuccess.effects || {});
            showResultText(dc.onSuccess.text, effectLines);
            G.pendingDualCheck = null;
            continueBtn.textContent = 'Continue';
            continueBtn.onclick = continueAfterEncounter;
        } else {
            showResultText('', []);
            continueBtn.textContent = 'Next roll...';
            continueBtn.onclick = rollNextDualCheck;
        }
        updateStats();
        return;
    }

    const roll  = rollD10();
    let base     = G.player[check.stat];
    let rockUsed = false;
    if (G.weirdRockQueued && check.stat === 'strength') {
        base = parseFloat((base + 0.1).toFixed(1));
        G.weirdRockQueued = false;
        rockUsed = true;
    }
    if (G.powerCardBoost && G.powerCardBoost.stat === check.stat) {
        base = check.raw
            ? base + G.powerCardBoost.amount
            : parseFloat((base + G.powerCardBoost.amount).toFixed(1));
        G.powerCardBoost = null;
        renderPowerCards();
    }
    if (G.woodenBeamActive && check.stat === 'strength') {
        base = parseFloat((base + 0.2).toFixed(1));
    }
    if (G.flashlightActive   && check.stat === 'visibility') base = parseFloat((base + 0.1).toFixed(1));
    if (G.flamethrowerActive && check.stat === 'visibility') base = parseFloat((base + 0.3).toFixed(1));
    if (G.cookieActive       && check.stat === 'speed')      base = parseFloat((base + 0.1).toFixed(1));
    const { base: debuffedBase, note: debuffNote } = applyDebuff(check.stat, base);
    base = debuffedBase;

    let result, rawSuccess, rollDisplay;
    if (check.raw) {
        result  = base + roll;
        rawSuccess  = result >= check.target;
        rollDisplay = `Roll ${dc.idx + 1} of ${dc.checks.length}: ${statDisplayName(check.stat)} ${base} + ${roll} = ${result} vs ${check.target} — ${rawSuccess ? 'SUCCESS' : 'FAILURE'}${debuffNote}`;
    } else {
        result  = parseFloat((base + roll * 0.1).toFixed(1));
        rawSuccess  = result >= check.target;
        rollDisplay = `Roll ${dc.idx + 1} of ${dc.checks.length}: ${capitalize(check.stat)} ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs ${check.target} — ${rawSuccess ? 'SUCCESS' : 'FAILURE'}${rockUsed ? ' (Weird Rock)' : ''}${debuffNote}`;
    }
    const b2     = tryBallsy(check.stat, rawSuccess, rollDisplay);
    const success = b2.success;
    rollDisplay   = b2.rollLine;

    document.getElementById('ep-roll').textContent = rollDisplay;
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-result').classList.remove('hidden');

    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = '';

    if (!success) {
        G.secondChanceSnapshot = snapshotPlayer();
        G.lastOutcomeEffects   = dc.onFailure ? dc.onFailure.effects || {} : {};
        G.lastFailureEffects   = G.lastOutcomeEffects;
        const effectLines = applyEffects(dc.onFailure ? dc.onFailure.effects || {} : {});
        showResultText(dc.onFailure ? dc.onFailure.text : '', effectLines);
        G.pendingDualCheck = null;
        continueBtn.textContent = 'Continue';
        continueBtn.onclick = continueAfterEncounter;
    } else {
        dc.idx++;
        if (dc.idx >= dc.checks.length) {
            G.secondChanceSnapshot = snapshotPlayer();
            G.lastOutcomeEffects   = dc.onSuccess.effects || {};
            const effectLines = applyEffects(dc.onSuccess.effects || {});
            showResultText(dc.onSuccess.text, effectLines);
            const hasBarkingFollowup   = !!dc.onSuccess.opensBarkingFollowup;
            const hasEnergyDrinkPrompt = !!dc.onSuccess.opensEnergyDrinkPrompt;
            G.pendingDualCheck = null;
            continueBtn.textContent = 'Continue';
            continueBtn.onclick = continueAfterEncounter;
            if (hasBarkingFollowup) {
                continueBtn.textContent = 'No, stop.';
                continueBtn.onclick = () => {
                    clearJournalButtons();
                    showResultText("You should already see the dog by now. It doesn't make sense for you to have to run any further to catch a glimpse of it. Maybe it's something else? The brief moments that you take to think about this cause you to lose track of the dog.", []);
                    document.getElementById('ep-roll').textContent = '';
                    continueBtn.textContent = 'Continue';
                    continueBtn.onclick = continueAfterEncounter;
                };
                addJournalButton('Yes, keep following.', startBarkingFollowup);
            } else if (hasEnergyDrinkPrompt) {
                startEnergyDrinkPrompt();
            } else if (dc.onSuccess.opensWaterfallCave) {
                showWaterfallCaveChoice();
            }
        } else {
            const next = dc.checks[dc.idx];
            showResultText(`${capitalize(check.stat)} check passed. Now: ${capitalize(next.stat)} check (target ${next.target}).`, []);
            continueBtn.textContent = 'Roll Again';
            continueBtn.onclick = rollNextDualCheck;
        }
    }

    updateStats();
}

function continueAfterEncounter() {
    document.body.classList.remove('level4-invert');
    G.phase           = 'move';
    G.pendingEncounter = null;
    G.pendingLeaf     = false;
    G.woodenBeamActive   = false;
    G.secondChanceSnapshot = null; // can't redo a test from a previous encounter
    G.hexRemoveMode   = null;
    G.revealMode      = null;
    G.justAnIllusionMode = false;
    G.boostChoiceMode = null;
    const bui = document.getElementById('boost-choice-ui');
    if (bui) bui.remove();
    G.flashlightActive   = false;
    G.flamethrowerActive = false;
    if (G.cookieActive) {
        G.cookieActive   = false;
        G.cookieHangover = true;
    } else if (G.cookieHangover) {
        G.cookieHangover = false;
        G.statDebuffs['speed'] = { amount: -0.1, usesRemaining: 1 };
    }
    G.houseState       = null;

    clearJournalButtons();
    clearSubChoiceButtons();

    // Reset encounter panel to idle state
    const titleEl = document.getElementById('ep-title');
    const descEl  = document.getElementById('ep-description');
    titleEl.textContent = '';
    titleEl.className   = '';
    titleEl.style.opacity = '0';
    descEl.textContent  = '';
    descEl.className    = '';
    descEl.style.opacity  = '0';
    document.getElementById('ep-badge').textContent   = '';
    document.getElementById('ep-choices').innerHTML   = '';
    document.getElementById('ep-result').classList.add('hidden');
    document.getElementById('ep-idle').style.display  = 'none';
    clearJournalButtons();
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.textContent = 'Continue';
    continueBtn.onclick = continueAfterEncounter;

    // Check loss first
    if (checkLoss()) return;

    // Enter scouting mode if queued by encounter effect
    if (G.scoutingMode && G.scoutingMode.remaining > 0) {
        G.phase = 'scout';
        G.scoutResults = {};
        showScoutingUI();
        renderBoard();
        return;
    }

    // Stalked >= 3 triggers the Third Party encounter (once per game)
    if (G.player.stalked >= 3 && !G.thirdPartyTriggered) {
        G.thirdPartyTriggered = true;
        const enc = ENCOUNTERS[4].find(e => e.id === 'third_party');
        if (enc) {
            triggerEncounter(enc);
            return;
        }
    }

    postEncounterCleanup();
}

function postEncounterCleanup() {
    const isTotallyLost = G.player.attributes.includes('Totally Lost');
    if (G.player.leafTokens >= 3 && !isTotallyLost) {
        G.canEscape = true;
    } else if (isTotallyLost) {
        G.canEscape = false;
    }
    renderBoard();
    updateStats();
}

function removeTotallyLost() {
    const idx = G.player.attributes.indexOf('Totally Lost');
    if (idx !== -1) G.player.attributes.splice(idx, 1);
    G.totallyLostTurns = 0;
    updateInventory();
}

function showScoutingUI() {
    const n = G.scoutingMode.remaining;
    document.getElementById('ep-title').textContent       = 'Scouting';
    document.getElementById('ep-title').style.opacity     = '1';
    document.getElementById('ep-description').textContent = `Click up to ${n} adjacent hex${n !== 1 ? 'es' : ''} to reveal whether they hold a leaf token.`;
    document.getElementById('ep-description').style.opacity = '1';
    document.getElementById('ep-choices').innerHTML       = '';
    document.getElementById('ep-result').classList.add('hidden');
    document.getElementById('ep-roll').textContent        = '';

    const doneBtn = document.createElement('button');
    doneBtn.className = 'choice-btn';
    doneBtn.style.opacity = '1';
    doneBtn.textContent = 'Done scouting.';
    doneBtn.addEventListener('click', endScouting);
    document.getElementById('ep-choices').appendChild(doneBtn);
}

function onScoutHexClick(q, r) {
    if (G.phase !== 'scout') return;
    const key = hk(q, r);
    if (G.scoutResults[key] !== undefined) return;

    const hex    = G.board[key];
    const hasLeaf = hex.leafLevels.includes(hex.currentLevel)
                 && !hex.collectedLevels.includes(hex.currentLevel);
    G.scoutResults[key] = hasLeaf;
    G.scoutingMode.remaining--;

    const desc = document.getElementById('ep-description');
    desc.textContent = hasLeaf
        ? `That hex holds a leaf token. ${G.scoutingMode.remaining} scout${G.scoutingMode.remaining !== 1 ? 's' : ''} remaining.`
        : `No leaf token there. ${G.scoutingMode.remaining} scout${G.scoutingMode.remaining !== 1 ? 's' : ''} remaining.`;

    if (G.scoutingMode.remaining === 0) {
        endScouting();
    } else {
        renderBoard();
    }
}

function endScouting() {
    G.scoutingMode = null;
    G.phase        = 'move';
    removeTotallyLost();
    document.getElementById('ep-title').textContent      = '';
    document.getElementById('ep-title').style.opacity    = '0';
    document.getElementById('ep-description').textContent = '';
    document.getElementById('ep-description').style.opacity = '0';
    document.getElementById('ep-choices').innerHTML      = '';
    document.getElementById('ep-idle').style.display     = 'none';
    postEncounterCleanup();
}

// ============================================================
// JOURNAL READING
// ============================================================
let journalEntryIdx = 0;

function addJournalButton(label, handler) {
    const btn = document.createElement('button');
    btn.className = 'journal-btn';
    btn.textContent = label;
    btn.addEventListener('click', handler);
    document.getElementById('ep-result').appendChild(btn);
}

function clearJournalButtons() {
    document.querySelectorAll('.journal-btn').forEach(b => b.remove());
}

function addSubChoiceButton(label, handler) {
    const btn = document.createElement('button');
    btn.className = 'sub-choice-btn';
    btn.textContent = label;
    btn.addEventListener('click', handler);
    document.getElementById('ep-result').appendChild(btn);
}

function clearSubChoiceButtons() {
    document.querySelectorAll('.sub-choice-btn').forEach(b => b.remove());
}

function startJournalReading() {
    journalEntryIdx = 0;
    clearJournalButtons();
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.textContent = 'Continue';
    continueBtn.onclick = continueAfterEncounter;
    rollJournalEntry();
}

function rollJournalEntry() {
    const entry  = JOURNAL_ENTRIES[journalEntryIdx];
    const target = entry.checkTarget ?? 1.2;
    const roll   = rollD10();
    const base   = G.player.visibility;
    const result = parseFloat((base + roll * 0.1).toFixed(1));
    const success = result >= target;

    document.getElementById('ep-roll').textContent =
        `Roll: ${roll}  |  Visibility ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs ${target} — ${success ? 'SUCCESS' : 'FAILURE'}`;
    document.getElementById('ep-choices').innerHTML = '';

    const continueBtn = document.getElementById('ep-continue');

    clearJournalButtons();

    if (success) {
        const effectLines = applyEffects(entry.effects || {});
        showResultText(entry.text, effectLines);
        updateStats();
        journalEntryIdx++;

        if (journalEntryIdx >= JOURNAL_ENTRIES.length) {
            continueBtn.textContent = 'Continue';
            continueBtn.onclick = continueAfterEncounter;
        } else {
            continueBtn.textContent = 'Set it down.';
            continueBtn.onclick = finishJournal;
            addJournalButton('Keep reading.', () => rollJournalEntry());
        }
    } else {
        const isLastEntry = journalEntryIdx === JOURNAL_ENTRIES.length - 1;
        const failText = isLastEntry
            ? "The last few pages of the notebook are stuck together. Prying them apart will only tear the pages and you don't want to intrude more than you have."
            : "Your eyes tire of reading. It was probably wrong of you to snoop on a kid's journal anyways. You set it down and leave the small enclosure.";
        showResultText(failText, []);
        continueBtn.textContent = 'Continue';
        continueBtn.onclick = continueAfterEncounter;
    }
}

function finishJournal() {
    document.getElementById('ep-choices').innerHTML = '';
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.textContent = 'Continue';
    continueBtn.onclick = continueAfterEncounter;
    continueAfterEncounter();
}

// ============================================================
// BARKING FOLLOW-UP (used by "Barking" encounter)
// Triggered when the initial dualCheck succeeds; offers Yes/No to keep following.
// ============================================================
function startBarkingFollowup() {
    clearJournalButtons();
    document.getElementById('ep-roll').textContent = '';
    G.pendingDualCheck = {
        checks:    [{ stat: 'visibility', target: 1.2 }, { stat: 'speed', target: 1.2 }],
        idx:       0,
        onSuccess: {
            text: "The barking suddenly stops as soon as it began. You also realize that you've only headed far deeper into the woods than you would like to be\u2026",
            effects: { forceDeeperMove: true }
        },
        onFailure: {
            text: "The barking is coming from all around you now. It is impossible to track it.",
            effects: {}
        }
    };
    rollNextDualCheck();
}

// ============================================================
// VOICES LISTENING (used by "Voices from Afar" encounter)
// ============================================================
let voicesEntryIdx = 0;

function startVoicesListening() {
    voicesEntryIdx = 0;
    clearJournalButtons();
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.textContent = 'Stop listening.';
    continueBtn.onclick = stopListening;
    addJournalButton('Keep listening.', rollVoicesEntry);
}

function rollVoicesEntry() {
    clearJournalButtons();
    const entry  = VOICES_ENTRIES[voicesEntryIdx];
    const roll   = rollD10();
    const base   = G.player.health;
    const result = base + roll;
    const success = result >= entry.checkTarget;

    document.getElementById('ep-roll').textContent =
        `Roll: ${roll}  |  Health ${base} + ${roll} = ${result} vs ${entry.checkTarget} — ${success ? 'SUCCESS' : 'FAILURE'}`;

    const continueBtn = document.getElementById('ep-continue');

    if (!success) {
        const effectLines = applyEffects({ peaceOfMind: -1 });
        showResultText("Hmm, maybe your hearing is giving out. The sounds are so close to words.", effectLines);
        continueBtn.textContent = 'Continue';
        continueBtn.onclick = continueAfterEncounter;
        updateStats();
        return;
    }

    const effectLines = applyEffects(entry.effects || {});
    showResultText(entry.text, effectLines);
    updateStats();
    voicesEntryIdx++;

    if (voicesEntryIdx >= VOICES_ENTRIES.length) {
        continueBtn.textContent = 'Continue';
        continueBtn.onclick = continueAfterEncounter;
    } else {
        continueBtn.textContent = 'Stop listening.';
        continueBtn.onclick = stopListening;
        addJournalButton('Keep listening.', rollVoicesEntry);
    }
}

function stopListening() {
    clearJournalButtons();
    showResultText("You stop listening.", []);
    document.getElementById('ep-roll').textContent = '';
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.textContent = 'Continue';
    continueBtn.onclick = continueAfterEncounter;
}

// ============================================================
// TRASH DIGGING SUB-CHOICES (used by "Pile of Junk" encounter)
// ============================================================
function showTrashSubChoices() {
    const choicesEl = document.getElementById('ep-choices');
    choicesEl.innerHTML = '';
    document.getElementById('ep-roll').textContent = '';
    showResultText('You wade into the pile, rummaging through the debris. What catches your eye?', []);
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = 'none';
    TRASH_SUB_CHOICES.forEach(subChoice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = subChoice.text;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });
            resolveTrashSubChoice(subChoice);
        });
        choicesEl.appendChild(btn);
    });
}

function resolveTrashSubChoice(subChoice) {
    if (subChoice.dualCheck) {
        G.pendingDualCheck = {
            checks:    subChoice.dualCheck,
            idx:       0,
            onSuccess: subChoice.success,
            onFailure: subChoice.failure
        };
        rollNextDualCheck();
        return;
    }

    let outcome;
    let rollText = '';

    if (subChoice.check) {
        const { base, note: debuffNote } = applyDebuff(subChoice.check.stat, G.player[subChoice.check.stat]);
        const roll    = rollD10();
        const result  = parseFloat((base + roll * 0.1).toFixed(1));
        const success = result >= subChoice.check.target;
        rollText = `Roll: ${roll}  |  ${capitalize(subChoice.check.stat)} ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs ${subChoice.check.target} — ${success ? 'SUCCESS' : 'FAILURE'}${debuffNote}`;
        outcome = success ? subChoice.success : (subChoice.failure ?? subChoice.success);
    } else {
        outcome = subChoice.success;
    }

    const effectLines = applyEffects(outcome.effects ?? {});
    document.getElementById('ep-roll').textContent = rollText;
    showResultText(outcome.text, effectLines);
    document.getElementById('ep-choices').innerHTML = '';
    updateStats();

    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = '';
    continueBtn.textContent = 'Continue';
    continueBtn.onclick = continueAfterEncounter;
}

// ============================================================
// SHED SUB-CHOICES (used by "An Old Shed" encounter)
// ============================================================
function showShedSubChoices() {
    const choicesEl = document.getElementById('ep-choices');
    choicesEl.innerHTML = '';
    document.getElementById('ep-roll').textContent = '';
    showResultText('You choose to inspect the internal parts of the shed. Upon opening the door, you find a ton of old tools and a single covered painting in the corner.', []);
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = 'none';

    const addBtn = (text, checkNote, action) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        const sp = document.createElement('span');
        sp.textContent = text;
        btn.appendChild(sp);
        if (checkNote) {
            const note = document.createElement('span');
            note.className = 'choice-check-note';
            note.textContent = checkNote;
            btn.appendChild(note);
        }
        btn.addEventListener('click', () => {
            document.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });
            action();
        });
        choicesEl.appendChild(btn);
    };

    addBtn('Gaze at the walls.', '[Visibility — target 1.6]', shedGazeWalls);
    if (G.flashlightUses >= 2) {
        addBtn('Gaze at the walls. (use flashlight ×2)', '[Auto-success — costs 2 flashlight uses]', shedGazeWallsFlashlight);
    }
    addBtn('Poke around the instruments.', '[Visibility 1.4 then Strength 1.4]', shedPokeAround);
    addBtn('Uncover the painting.', '[Visibility — target 1.5]', shedUncoverPainting);
    addBtn('Leave.', null, () => {
        showResultText('You decide not to poke around and head back outside.', []);
        continueBtn.style.display = '';
        continueBtn.textContent = 'Continue';
        continueBtn.onclick = continueAfterEncounter;
    });
}

function shedResolve(stat, target, successText, successEffects, failText, failEffects) {
    const { base, note: debuffNote } = applyDebuff(stat, G.player[stat]);
    const roll   = rollD10();
    const result = parseFloat((base + roll * 0.1).toFixed(1));
    const raw    = result >= target;
    let rollLine = `Roll: ${roll}  |  ${capitalize(stat)} ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs ${target} — ${raw ? 'SUCCESS' : 'FAILURE'}${debuffNote}`;
    const b      = tryBallsy(stat, raw, rollLine);
    const success = b.success;
    rollLine      = b.rollLine;

    document.getElementById('ep-roll').textContent = rollLine;
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-result').classList.remove('hidden');

    const effectLines = applyEffects(success ? successEffects : failEffects);
    showResultText(success ? successText : failText, effectLines);

    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = '';
    continueBtn.textContent = 'Continue';
    continueBtn.onclick = continueAfterEncounter;
    updateStats();
}

function shedGazeWalls() {
    shedResolve(
        'visibility', 1.6,
        "The walls are made of a hard wood of unknown make. You have never seen such a queer grain in your life. It might have something to do with the strange trees you have been noticing outside. They are etched with a variety of unfathomable symbols and signs. Something primal within you recognizes the feeling of their meaning, of their anger and desperation. The emotion thrums powerfully within you.",
        { closeToPower: 1, knowledge: 1 },
        "The walls have the craziest grain you've ever beheld. It looks like no kind of wood you have ever gazed upon in your earthly life. Strange motifs have been cut into the wall. One catches your eye. A powerful, primeval fear begins to blossom within you. It takes all of your mental effort to tear your eyes away from it. You gasp after doing so, as if coming up for air after being underwater, realizing that you hadn't been breathing while looking at the symbol.",
        { peaceOfMind: -2 }
    );
}

function shedGazeWallsFlashlight() {
    G.flashlightUses -= 2;
    if (G.flashlightUses <= 0) {
        G.flashlightUses = 0;
        const i = G.player.items.indexOf('Flashlight');
        if (i !== -1) G.player.items.splice(i, 1);
    }
    document.getElementById('ep-roll').textContent = 'Flashlight used ×2 — AUTO-SUCCESS';
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-result').classList.remove('hidden');
    const effectLines = applyEffects({ closeToPower: 1, knowledge: 1 });
    showResultText("The walls are made of a hard wood of unknown make. You have never seen such a queer grain in your life. It might have something to do with the strange trees you have been noticing outside. They are etched with a variety of unfathomable symbols and signs. Something primal within you recognizes the feeling of their meaning, of their anger and desperation. The emotion thrums powerfully within you.", effectLines);
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = '';
    continueBtn.textContent = 'Continue';
    continueBtn.onclick = continueAfterEncounter;
    updateStats();
}

function shedPokeAround() {
    G.pendingDualCheck = {
        checks:    [{ stat: 'visibility', target: 1.4 }, { stat: 'strength', target: 1.4 }],
        idx:       0,
        onSuccess: {
            text:    "Most of the tools are covered in a rotten mold that gives off a scent wholly noxious to your senses. These items disintegrate in your hand. You pick up a box that looks somewhat safe but that too disintegrates in your hand, dropping a variety of elixir vials all over the ground. Upon contact with the earth, they burst, letting off an invigorating smell of incense into the air. You leave the shed feeling energized.",
            effects: { strength: 0.1 }
        },
        onFailure: {
            text:    "You grab the only recognizable tool from off the wall. It is a large axe. This will come in handy for when you need it. You give it a test swing, but its wooden handle disintegrates into dust in your palms, dropping the metal part of the axe onto your head. It will leave you with a bump and possibly a slight concussion.",
            effects: { health: -2 }
        }
    };
    rollNextDualCheck();
}

function shedUncoverPainting() {
    shedResolve(
        'visibility', 1.5,
        "You remove the cover with the painting facing forward. At a glance, it is a somewhat boring landscape. A few hills rise above a dark forest at twilight. It could have even been painted somewhere here in West Virginia. You inspect it a little bit closer, holding it up to the moonlight streaming in from a crack in the ceiling. A large boulder is present in one section of the forest and a ton of bat-like creatures converge on it. You replace it back to its spot. How strange.",
        { closeToPower: 1, knowledge: 1 },
        "You remove the cover so that you can take a look at the back first. It contains one large symbol painted on it in black paint. The looping quality of the ideogram forms a number of hypnotizing contours. You can't stop staring at it. Fearful, you try to look away, but can't. A single word begins ringing softly in your ear, but growing in pitch. You attempt to move your hands, but fail in that endeavor. The word becomes noticeable, but shifts in its meaning. \"Parvenu,\" \"Interloper.\" You want to run. \"Outsider,\" \"Intruder,\" \"Settler.\" The words coalesce into one. \"Newcomer.\" Finally, your body gives out from lack of air and you collapse, breathing deeply. You crawl away from the shed, refusing to look back.",
        { peaceOfMind: -3 }
    );
}

// ============================================================
// CAVE SUB-CHOICES (used by "Rooms of a Cave" encounter)
// ============================================================
function showCaveSubChoices() {
    const choicesEl = document.getElementById('ep-choices');
    choicesEl.innerHTML = '';
    document.getElementById('ep-roll').textContent = '';
    showResultText('Once you climb in, you notice that there are two rooms you might be able to enter.', []);
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = 'none';

    const addBtn = (text, checkNote, action) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        const sp = document.createElement('span');
        sp.textContent = text;
        btn.appendChild(sp);
        if (checkNote) {
            const note = document.createElement('span');
            note.className = 'choice-check-note';
            note.textContent = checkNote;
            btn.appendChild(note);
        }
        btn.addEventListener('click', () => {
            document.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });
            action();
        });
        choicesEl.appendChild(btn);
    };

    addBtn('Explore the front room.', '[Visibility — target 1.5]', caveFrontRoom);
    addBtn('Explore the back room.', '[Visibility — target 1.9]', caveBackRoom);
    if (G.flashlightUses >= 3) {
        addBtn('Explore the back room. (with your flashlight)', '[Auto-success — costs 3 flashlight uses]', caveBackRoomFlashlight);
    }
    addBtn('Leave the cave.', null, () => {
        showResultText('You climb back out into the night.', []);
        continueBtn.style.display = '';
        continueBtn.textContent = 'Continue';
        continueBtn.onclick = continueAfterEncounter;
    });
}

function caveResolve(stat, target, successText, successEffects, failText, failEffects) {
    const { base, note: debuffNote } = applyDebuff(stat, G.player[stat]);
    const roll   = rollD10();
    const result = parseFloat((base + roll * 0.1).toFixed(1));
    const raw    = result >= target;
    let rollLine = `Roll: ${roll}  |  ${capitalize(stat)} ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs ${target} — ${raw ? 'SUCCESS' : 'FAILURE'}${debuffNote}`;
    const b      = tryBallsy(stat, raw, rollLine);
    const success = b.success;
    rollLine      = b.rollLine;

    document.getElementById('ep-roll').textContent = rollLine;
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-result').classList.remove('hidden');

    const effectLines = applyEffects(success ? successEffects : failEffects);
    showResultText(success ? successText : failText, effectLines);

    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = '';
    continueBtn.textContent = 'Continue';
    continueBtn.onclick = continueAfterEncounter;
    updateStats();
}

function caveFrontRoom() {
    caveResolve(
        'visibility', 1.5,
        "You wait in the center of the room for your eyes to adjust. The walls are all etched with pictograms of men and women fighting winged creatures. They remind you of depictions made of Michael and his angels fighting against the forces of Hell, but with both parties being horrifying. The people of the illustrations are singularly animalistic, ripping some of the creatures apart with their bare hands, while others proffer sacrifices of an unholy nature.",
        { knowledge: 1 },
        "You move toward one side of the room, allowing your eyesight to adjust as you walk. Your foot unexpectedly becomes wedged between two rocks and you fall. You leave the cave, limping.",
        { temporaryDebuff: { stat: 'speed', amount: -0.2, uses: 5 } }
    );
}

function caveBackRoom() {
    caveResolve(
        'visibility', 1.9,
        "Your eyes adjust to the light after an unknown number of minutes. The walls are painted with the shapes of dark figures. They look disturbingly realistic and you can't tell if they really are just paintings. You watch them in silence. One appears to shift, surprising you. You look more closely at it. No, it must have been an illusion. Nothing more. You leave, unsettled.",
        { peaceOfMind: -2, knowledge: 1, closeToPower: 1 },
        "No matter how hard you try to adjust your eyes to the light, you fail. All you can make out in the back of the room is a complex symbol composed of many mesmerizing loops and pivots.",
        { peaceOfMind: -1, knowledge: 1 }
    );
}

function caveBackRoomFlashlight() {
    G.flashlightUses -= 3;
    if (G.flashlightUses <= 0) {
        G.flashlightUses = 0;
        const i = G.player.items.indexOf('Flashlight');
        if (i !== -1) G.player.items.splice(i, 1);
    }
    document.getElementById('ep-roll').textContent = 'Flashlight used ×3 — AUTO-RESULT';
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-result').classList.remove('hidden');
    const effectLines = applyEffects({ peaceOfMind: -2, knowledge: 1, closeToPower: 1 });
    showResultText("You turn on your flashlight and scream, flicking it off and careening out of the cave. You lie on the ground after running 10 yards. A dozen dirty figures with brown robes had been standing about the entire perimeter of the cave…or were they just realistic paintings? You aren't sure, but you are very rattled by the experience.", effectLines);
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = '';
    continueBtn.textContent = 'Continue';
    continueBtn.onclick = continueAfterEncounter;
    updateStats();
}

// ============================================================
// WATERFALL CAVE SUB-CHOICES (used by "Gushing Water" encounter)
// ============================================================
function showWaterfallCaveChoice() {
    const continueBtn = document.getElementById('ep-continue');
    showResultText("The moon is bright beneath here, despite the gushing water. You notice that a small cave lies behind the falls. Do you enter it?", []);
    clearJournalButtons();
    continueBtn.textContent = 'No.';
    continueBtn.onclick = () => {
        clearJournalButtons();
        showResultText("You continue onward to the other edge of the waterfall, ignoring whatever might have been in that cave.", []);
        continueBtn.textContent = 'Continue';
        continueBtn.onclick = continueAfterEncounter;
    };
    addJournalButton('Yes.', showWaterfallInnerChoice);
}

function showWaterfallInnerChoice() {
    const continueBtn = document.getElementById('ep-continue');
    clearJournalButtons();
    showResultText("You enter into the cave. It is mostly dry here. To your surprise, there are a bunch of lenses arranged in a strange fashion, refracting and bending the moonlight entering the cave. One looks like it has been bumped somewhat out of place from its normal holder. Do you fix it?", []);
    continueBtn.textContent = 'No.';
    continueBtn.onclick = () => {
        clearJournalButtons();
        showResultText("You leave the contraption as is, not wanting to upset whoever put it there.", []);
        continueBtn.textContent = 'Continue';
        continueBtn.onclick = continueAfterEncounter;
    };
    addJournalButton('Yes.', waterfallLensCheck);
}

function waterfallLensCheck() {
    clearJournalButtons();
    const { base, note: debuffNote } = applyDebuff('visibility', G.player.visibility);
    const roll    = rollD10();
    const result  = parseFloat((base + roll * 0.1).toFixed(1));
    const raw     = result >= 1.3;
    let rollLine  = `Roll: ${roll}  |  Visibility ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs 1.3 — ${raw ? 'SUCCESS' : 'FAILURE'}${debuffNote}`;
    const b       = tryBallsy('visibility', raw, rollLine);
    const success = b.success;
    rollLine      = b.rollLine;

    document.getElementById('ep-roll').textContent = rollLine;
    document.getElementById('ep-result').classList.remove('hidden');

    const continueBtn = document.getElementById('ep-continue');
    continueBtn.textContent = 'Continue';
    continueBtn.onclick = continueAfterEncounter;

    if (success) {
        const effectLines = applyEffects({ sotcp: 1, closeToPower: 1 });
        showResultText("You carefully set the oculus back into its frame. When replaced, the moonlight it refracts shines brighter, harsher even, and the cave glows a bit. You step back, admiring your skill and leave.", effectLines);
    } else {
        const effectLines = applyEffects({ sotcp: -1 });
        showResultText("You set the oculus back into its frame, but are unable to get it placed in the proper position. You attempt to jam it in, but end up only cracking the frame and dropping the lens, cracking it. You hurry off, hoping no one saw your meddling.", effectLines);
    }
    updateStats();
}

function startEnergyDrinkPrompt() {
    clearJournalButtons();
    document.getElementById('ep-roll').textContent = '';
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.textContent = 'No.';
    continueBtn.onclick = () => {
        clearJournalButtons();
        showResultText("Why would you drink something found in the trash.", []);
        continueBtn.textContent = 'Continue';
        continueBtn.onclick = continueAfterEncounter;
    };
    addJournalButton('Drink it.', () => {
        clearJournalButtons();
        const effectLines = applyEffects({ speed: 0.1 });
        showResultText("It fills you with energy. You will likely crash in a couple of hours, but you hope to be out of the woods by then.", effectLines);
        continueBtn.textContent = 'Continue';
        continueBtn.onclick = continueAfterEncounter;
        updateStats();
    });
}

// ============================================================
// WISH SUB-CHOICES (used by "Wish Upon a Star" encounter)
// ============================================================
function showWishSubChoices() {
    const choicesEl = document.getElementById('ep-choices');
    choicesEl.innerHTML = '';
    document.getElementById('ep-roll').textContent = '';
    showResultText('You close your eyes and make a wish. What do you wish for?', []);
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = 'none';
    WISH_SUB_CHOICES.forEach(subChoice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = subChoice.text;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });
            resolveWishSubChoice(subChoice);
        });
        choicesEl.appendChild(btn);
    });
}

function resolveWishSubChoice(subChoice) {
    const outcome    = subChoice.success;
    const effectLines = applyEffects(outcome.effects ?? {});
    document.getElementById('ep-roll').textContent = '';
    showResultText(outcome.text, effectLines);
    document.getElementById('ep-choices').innerHTML = '';
    if (outcome.collectLeaf) collectLeaf();
    updateStats();

    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = '';
    continueBtn.textContent = 'Continue';
    continueBtn.onclick = continueAfterEncounter;
}

// ============================================================
// THE HOUSE — room navigation sub-encounter
// ============================================================

const HOUSE_ROOM_DATA = {
    exterior: {
        title: 'The House',
        description: "You stand outside the house. The paint on the walls is worn and gray wood is showing through it. You shuffle around the leaves below you for a sign of a road, but there is none."
    },
    back: {
        title: 'Behind the House',
        description: "An outside cellar door leads down into a basement. There is also a back door to the house."
    },
    back_entrance: {
        title: 'Back Entrance',
        description: "On your left there is what looks like a kitchen. On your right, a dining room. There is a staircase leading downstairs, but the door to it is locked and can't be forced."
    },
    front: {
        title: 'Front Entrance',
        description: "A living room sits to the right of you and a reading room lies to the left. Some stairs lead upwards."
    },
    living: {
        title: 'Living Room',
        description: "The living room contains a few old couches in desperate need of replacement. The rug in the center of them is the brown color of feces and the coffee table is dirty. A few paintings of landscapes sit on the wall. Two doorways lead to the kitchen and to the reading room. The stairs are to your left."
    },
    dining: {
        title: 'Dining Room',
        description: "The dining room contains a single table without any chairs. A large dirty tablecloth lies on top of it. Two doorways lead to the kitchen and to the reading room."
    },
    reading: {
        title: 'Reading Room',
        description: "This room's walls are covered in shelves. Though some are empty, the majority are filled with books. A worn leather chair inhabits one corner. Two doorways open up to a dining room and a living room. Ascending the staircase is also an option."
    },
    kitchen: {
        title: 'Kitchen',
        description: "It is drably painted and looks like it came right out of a 50s TV show. It boasts few amenities, but it has a refrigerator, a sink and some cabinets. Just as boring as the outside of the house. Two doorways open up into a dining room and a living room."
    },
    upstairs: {
        title: 'Upstairs',
        description: "The top floor is completely devoid of all but a single bed and nightstand. The hardwood floor is extremely scuffed and dirty. You spot a ton of mildewed clothing underneath the bed. An electrical telegraph sits on the nightstand next to a paper containing messages sent to it. The house also clearly contains an attic, with an entrance you pull down with a string."
    }
};

const ATTIC_STEPS = [
    'As you place your foot onto the first rung, an even louder crash comes from above you. Do you keep climbing?',
    'You take another step. Silence. Do you ascend another rung?',
    'You step up another rung. Do you keep ascending?',
    'Your head is now almost into the attic. Do you keep ascending?',
    'You can now see into the attic. It is pitch black. Do you ascend all the way?'
];

function startHouseEncounter() {
    G.houseState = {
        hasEntered:      false,
        fridgeOpened:    false,
        atticEntered:    false,
        hasGotSomething: false,
        atticStep:       0
    };
    showHouseRoom('exterior');
}

function showHouseRoom(roomId) {
    const room = HOUSE_ROOM_DATA[roomId];
    document.getElementById('ep-title').textContent       = room.title;
    document.getElementById('ep-description').textContent = room.description;
    document.getElementById('ep-roll').textContent        = '';
    document.getElementById('ep-result').classList.add('hidden');
    clearJournalButtons();

    const continueBtn       = document.getElementById('ep-continue');
    continueBtn.textContent = 'Leave the house.';
    continueBtn.onclick     = leaveHouse;

    const choicesEl = document.getElementById('ep-choices');
    choicesEl.innerHTML = '';
    getHouseRoomChoices(roomId).forEach(c => {
        const btn  = document.createElement('button');
        btn.className = 'choice-btn';
        const sp   = document.createElement('span');
        sp.textContent = c.text;
        btn.appendChild(sp);
        if (c.checkNote) {
            const note = document.createElement('span');
            note.className = 'choice-check-note';
            note.textContent = c.checkNote;
            btn.appendChild(note);
        }
        btn.addEventListener('click', c.action);
        choicesEl.appendChild(btn);
    });
}

function getHouseRoomChoices(roomId) {
    const nav   = room => () => showHouseRoom(room);
    const enter = room => () => { G.houseState.hasEntered = true; showHouseRoom(room); };
    switch (roomId) {
        case 'exterior': return [
            { text: 'Knock on the front door.', action: () => houseShowResult('It does not open. It is apparent that no one is home.', {}, 'exterior') },
            { text: 'Go around to the back.',    action: nav('back') },
            { text: 'Enter through the front door.', action: enter('front') }
        ];
        case 'back': return [
            { text: 'Enter through the back door.', action: enter('back_entrance') },
            { text: 'Enter the cellar.',             action: enterCellar, checkNote: '[Visibility check — target 1.4]' },
            { text: 'Return to the front.',          action: nav('exterior') },
            { text: 'Leave the house.',              action: leaveHouseSimple }
        ];
        case 'back_entrance': return [
            { text: 'Enter the kitchen.',     action: nav('kitchen') },
            { text: 'Enter the dining room.', action: nav('dining') },
            { text: 'Return outside.',        action: nav('back') },
            { text: 'Leave the house.',       action: leaveHouseSimple }
        ];
        case 'front': return [
            { text: 'Enter the living room.',   action: nav('living') },
            { text: 'Enter the reading room.',  action: nav('reading') },
            { text: 'Ascend the stairs.',       action: nav('upstairs') },
            { text: 'Return outside.',          action: nav('exterior') },
            { text: 'Leave the house.',         action: leaveHouseSimple }
        ];
        case 'living': return [
            { text: 'Enter the kitchen.',      action: nav('kitchen') },
            { text: 'Enter the reading room.', action: nav('reading') },
            { text: 'Observe the paintings.',  action: () => houseShowResult("The landscapes are a bit standard for an American household. A prairie here. A mountain there. You notice that there are no paintings or photos of family here. Maybe whoever lived here didn't have any family.", {}, 'living') },
            { text: 'Sit on a couch.',         action: () => houseShowResult('Wow, these couches are extremely uncomfy. You get off of them.', {}, 'living') },
            { text: 'Ascend the stairs.',      action: nav('upstairs') },
            { text: 'Return to the entrance.', action: nav('front') },
            { text: 'Leave the house.',        action: leaveHouseSimple }
        ];
        case 'dining': return [
            { text: 'Enter the kitchen.',      action: nav('kitchen') },
            { text: 'Enter the reading room.', action: nav('reading') },
            { text: 'Remove the tablecloth.',  action: tableclothAction },
            { text: 'Leave the house.',        action: leaveHouseSimple }
        ];
        case 'reading': return [
            { text: 'Flip through a few of the books.', action: readBooks, checkNote: '[Visibility check — target 1.6]' },
            { text: 'Enter the dining room.',   action: nav('dining') },
            { text: 'Enter the living room.',   action: nav('living') },
            { text: 'Ascend the stairs.',       action: nav('upstairs') },
            { text: 'Leave the house.',         action: leaveHouseSimple }
        ];
        case 'kitchen': return [
            { text: 'Open the fridge.',         action: openFridge, checkNote: (G.houseState && !G.houseState.fridgeOpened) ? '[Strength check — target 1.3]' : undefined },
            { text: 'Open some cabinets.',      action: () => houseShowResult('There is nothing in the cabinets but a box of salt. You close them again.', {}, 'kitchen') },
            { text: 'Go into the dining room.', action: nav('dining') },
            { text: 'Enter the living room.',   action: nav('living') },
            { text: 'Go up the stairs.',        action: nav('upstairs') },
            { text: 'Leave the house.',         action: leaveHouseSimple }
        ];
        case 'upstairs': return [
            { text: 'Read the telegraph messages.', action: readTelegraph, checkNote: '[Visibility check — target 1.6]' },
            { text: 'Enter the attic.',             action: startAtticClimb },
            { text: 'Go back downstairs.',          action: nav('front') },
            { text: 'Leave the house.',             action: leaveHouseSimple }
        ];
        default: return [];
    }
}

// Show a text result in the house, then return player to a room
function houseShowResult(text, effects, returnRoom) {
    const effectLines = applyEffects(effects || {});
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-roll').textContent  = '';
    document.getElementById('ep-result').classList.remove('hidden');
    showResultText(text, effectLines);
    clearJournalButtons();
    const continueBtn       = document.getElementById('ep-continue');
    continueBtn.textContent = 'Continue';
    continueBtn.onclick     = () => showHouseRoom(returnRoom);
    updateStats();
}

// Perform a stat check within the house
function performHouseCheck(stat, target, onSuccessFn, failText, failEffects, returnRoom) {
    if (G.gunQueued && stat === 'strength') {
        consumeGun();
        document.getElementById('ep-roll').textContent = 'Roll: — (Bang!)';
        onSuccessFn(document.getElementById('ep-continue'));
        updateStats();
        return;
    }
    let base     = G.player[stat];
    let rockUsed = false;
    if (G.weirdRockQueued && stat === 'strength') {
        base = parseFloat((base + 0.1).toFixed(1));
        G.weirdRockQueued = false;
        rockUsed = true;
    }
    if (G.powerCardBoost && G.powerCardBoost.stat === stat) {
        base = parseFloat((base + G.powerCardBoost.amount).toFixed(1));
        G.powerCardBoost = null;
        renderPowerCards();
    }
    if (G.woodenBeamActive  && stat === 'strength')   base = parseFloat((base + 0.2).toFixed(1));
    if (G.flashlightActive   && stat === 'visibility') base = parseFloat((base + 0.1).toFixed(1));
    if (G.flamethrowerActive && stat === 'visibility') base = parseFloat((base + 0.3).toFixed(1));
    if (G.cookieActive       && stat === 'speed')      base = parseFloat((base + 0.1).toFixed(1));
    const { base: debuffedBase, note: debuffNote } = applyDebuff(stat, base);
    base = debuffedBase;
    const roll    = rollD10();
    const result = parseFloat((base + roll * 0.1).toFixed(1));
    let rollLine = `Roll: ${roll}  |  ${capitalize(stat)} ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs ${target} — ${result >= target ? 'SUCCESS' : 'FAILURE'}${rockUsed ? ' (Weird Rock)' : ''}${debuffNote}`;
    const b4     = tryBallsy(stat, result >= target, rollLine);
    const success = b4.success;
    rollLine      = b4.rollLine;
    document.getElementById('ep-roll').textContent = rollLine;
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-result').classList.remove('hidden');
    clearJournalButtons();
    const continueBtn = document.getElementById('ep-continue');
    if (success) {
        onSuccessFn(continueBtn);
    } else {
        const effectLines = applyEffects(failEffects || {});
        showResultText(failText, effectLines);
        continueBtn.textContent = 'Continue';
        continueBtn.onclick     = () => showHouseRoom(returnRoom);
    }
    updateStats();
}

function leaveHouseSimple() {
    G.houseState = null;
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-roll').textContent  = '';
    document.getElementById('ep-result').classList.remove('hidden');
    showResultText('You leave the house.', []);
    clearJournalButtons();
    const continueBtn       = document.getElementById('ep-continue');
    continueBtn.textContent = 'Continue';
    continueBtn.onclick     = continueAfterEncounter;
    updateStats();
}

function leaveHouse() {
    const hs = G.houseState || {};
    let text, effects;
    if (!hs.hasEntered) {
        text    = "Were you really just thinking about breaking into someone's house? The temptation makes you shake your head. You suppose you could have tried knocking on the door, but it looks like nobody is home. Still, you are glad to see some evidence of human civilization. You aren't the only one out here.";
        effects = { peaceOfMind: 1 };
    } else if (hs.hasGotSomething) {
        text    = "You are satisfied with your efforts here. It is probably best to leave the house now. It would spell a lot of trouble for you if the owner came back and found you there.";
        effects = {};
    } else {
        text    = "You have seen your fill of the home. It's time to move on.";
        effects = {};
    }
    G.houseState = null;
    const effectLines = applyEffects(effects);
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-roll').textContent  = '';
    document.getElementById('ep-result').classList.remove('hidden');
    showResultText(text, effectLines);
    clearJournalButtons();
    const continueBtn       = document.getElementById('ep-continue');
    continueBtn.textContent = 'Continue';
    continueBtn.onclick     = continueAfterEncounter;
    updateStats();
}

// Cellar
function enterCellar() {
    performHouseCheck('visibility', 1.4,
        continueBtn => {
            showResultText("You reach the bottom of the basement. Immediately, you are hit with the overpowering smell of chlorine. It is nearly impossible to see anything. The faint light from the cellar door only gives you the slightest impression of objects scattered throughout the bottom floor.", []);
            continueBtn.textContent = 'Continue';
            continueBtn.onclick     = showCellarSubchoices;
        },
        "You immediately slip on something wet and tumble down the steps. It takes a ton of effort to climb back up the stairs and nurse your skinned shin.",
        { health: -1 },
        'back'
    );
}

function showCellarSubchoices() {
    document.getElementById('ep-roll').textContent = '';
    document.getElementById('ep-result').classList.add('hidden');
    clearJournalButtons();

    const choicesEl = document.getElementById('ep-choices');
    choicesEl.innerHTML = '';

    const addBtn = (text, action, checkNote) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        const sp = document.createElement('span');
        sp.textContent = text;
        btn.appendChild(sp);
        if (checkNote) {
            const note = document.createElement('span');
            note.className = 'choice-check-note';
            note.textContent = checkNote;
            btn.appendChild(note);
        }
        btn.addEventListener('click', action);
        choicesEl.appendChild(btn);
    };

    addBtn('Turn around.', () => houseShowResult("You ascend back up the stairs. Unfamiliar dark basements in the middle of the night are usually bad news. In fact, entering any house without the owner's express permission is, unsurprisingly, also bad news.", {}, 'back'));
    if (G.player.items.includes('Flashlight')) {
        addBtn('Turn on a flashlight.', cellarFlashlight);
    }
    addBtn('Try to see in the dark.', cellarVisionCheck, '[Visibility check — target 1.7]');

    const continueBtn       = document.getElementById('ep-continue');
    continueBtn.textContent = 'Leave the house.';
    continueBtn.onclick     = leaveHouse;
}

function cellarFlashlight() {
    G.flashlightUses--;
    if (G.flashlightUses <= 0) {
        const i = G.player.items.indexOf('Flashlight');
        if (i !== -1) G.player.items.splice(i, 1);
    }
    G.houseState.hasGotSomething = true;
    const effectLines = applyEffects({ knowledge: 1, peaceOfMind: -1 });
    const text = "You pull out your handy flashlight and turn it on. It immediately illuminates a good portion of your surroundings. The basement is one big room littered with a mountain of junk. Old generators, bundles of wooden planks, and rusty tools lie everywhere. A couple of shelves lined up along the wall hold a variety of mason jars and scientific-looking flasks. The whole place is so crammed with stuff that you are unable to make it more than a few steps beyond the door. Something shifts. Your flashlight flicks to the stairs. They remain empty. Nothing below them either. You wonder if it was an effect of your imagination, but another few items shift. You flick your flashlight to a large canvas tarp in one of the corners that has had a number of boxes fall onto it. The cardboard boxes remain still for a moment before moving again. Something is beneath the tarp. Boxes begin tumbling off of it as it rises before you. You make a break for the exit, items of various natures scattering everywhere as you run. You hurry up the stairs just as you hear whispers behind you\u2026and breathing. You slam the cellar door shut and feel a loud bang on the door the moment you close it and bar it. You are NOT re-entering this house.";
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-roll').textContent  = '';
    document.getElementById('ep-result').classList.remove('hidden');
    showResultText(text, effectLines);
    clearJournalButtons();
    const continueBtn       = document.getElementById('ep-continue');
    continueBtn.textContent = 'Continue';
    continueBtn.onclick     = continueAfterEncounter;
    updateStats();
}

function cellarVisionCheck() {
    performHouseCheck('visibility', 1.7,
        continueBtn => {
            const effectLines = applyEffects({ visibility: 0.1, knowledge: 1, peaceOfMind: -1 });
            G.houseState.hasGotSomething = true;
            showResultText("The smell is slightly nauseating, but bearable. You peer into the dark, waiting for your eyes to adjust. Eventually, they adjust enough for you to make out a few outlines. It doesn't look like the basement is well organized. Walking haphazardly through it could cause you to accidentally trod right onto something sharp. You begin planning some routes through darkness when suddenly you hear a shifting of boxes. You make out a pile of rectangles that look to be a few cardboard boxes. One of them falls over. A huge shape rises up to the ceiling and begins to lumber through the trash. You scramble up the stairs and shut the cellar door behind you. What was that?", effectLines);
            continueBtn.textContent = 'Continue';
            continueBtn.onclick     = () => showHouseRoom('back');
        },
        "You can't see anything. The dark of the basement is too much for your sight. You will just have to leave.",
        {},
        'back'
    );
}

// Dining tablecloth
function tableclothAction() {
    houseShowResult("You tug at the tablecloth and it slides off with ease. The wood is marked all over with burns and scratches. Part of you thinks they might look like symbols, though no definable pattern emerges from them. The defacement is too haphazard for any modern syllabary, but what has been made here is definitely intentional. You run your hands along it, but pull it away when you noticed dark stains residing as well upon the wood. Was this\u2026a dining room? You replace the tablecloth hurriedly, increasingly concerned about what may have gone on here.", { knowledge: 1, peaceOfMind: -1 }, 'dining');
}

// Reading room books
function readBooks() {
    performHouseCheck('visibility', 1.6,
        continueBtn => {
            const effectLines = applyEffects({ knowledge: 1, peaceOfMind: -1 });
            showResultText("You take one of the volumes from the shelf and begin to leaf through it, holding it up to a window so that you can read it in the moonlight. The words are mostly misspelled, but you can piece some sentences together. They mostly contain small bits of information about how to ward off monsters with wooden constructions and decoys. You close the book after seeing a particularly gruesome depiction of a ritual involving animal mutilation.", effectLines);
            continueBtn.textContent = 'Continue';
            continueBtn.onclick     = () => showHouseRoom('reading');
        },
        "You pull one of the books from off the shelf and begin to leaf through it. You hold it up to a dirty window, allowing you to see the letters clearly. The book is very poorly written. Most of the words are spelled wrong and the structure of the sentences is unbearable. Its illustrations are revolting, depicting savage rituals with animals that even the most paganistic of folks would find despicable. Who would ever read this crap?",
        { peaceOfMind: -1 },
        'reading'
    );
}

// Kitchen fridge
function openFridge() {
    if (G.houseState.fridgeOpened) {
        houseShowResult("You observe that the door to the fridge is slightly ajar. You step up to the fridge, preparing to grab the door handle, but a look downwards causes you to hesitate. What are those fluids beneath your shoes? You elect not to open the fridge for fear of what might be inside and instead close the door completely.", { peaceOfMind: -1 }, 'kitchen');
        return;
    }
    performHouseCheck('strength', 1.3,
        continueBtn => {
            const effectLines = applyEffects({ grantItem: 'Food', peaceOfMind: -1 });
            G.houseState.fridgeOpened    = true;
            G.houseState.hasGotSomething = true;
            showResultText("You swing the door open. A wave of putrid stench washes over you. It is unlike any refrigerator you have ever seen. Rotting game spills out onto the floor, vile fluids of an unknown type soaking into your shoes. You gag at the horrible smell. A botulism-ridden can also falls out. This thing is dangerous! If this house is abandoned and someone came in to try to eat it, they could die. You take it with you so as to throw it away.", effectLines);
            continueBtn.textContent = 'Continue';
            continueBtn.onclick     = () => showHouseRoom('kitchen');
        },
        "The handle to the fridge comes off in your hand as you pull. A broken part of it cuts your hand, making you gasp in pain.",
        { health: -1 },
        'kitchen'
    );
}

// Upstairs telegraph
function readTelegraph() {
    performHouseCheck('visibility', 1.6,
        continueBtn => {
            const effectLines = applyEffects({ knowledge: 1 });
            showResultText('The handwriting on the paper is nearly illegible, but you are able to make out the last few words. They say "PROTECTIONS GONE STOP FLEE STOP"', effectLines);
            continueBtn.textContent = 'Continue';
            continueBtn.onclick     = () => showHouseRoom('upstairs');
        },
        "You can't make out the scribbles on the page. Whoever wrote this has worse handwriting than they do spelling.",
        {},
        'upstairs'
    );
}

// Attic sequential climb
function startAtticClimb() {
    G.houseState.atticStep = 0;
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-roll').textContent  = '';
    showResultText('You pull down the ladder leading up to the attic. It falls with a loud thump.', []);
    document.getElementById('ep-result').classList.remove('hidden');
    clearJournalButtons();
    showAtticStep();
}

function showAtticStep() {
    const el = document.getElementById('ep-result-text');
    const p  = document.createElement('p');
    p.style.marginTop = '8px';
    p.textContent = ATTIC_STEPS[G.houseState.atticStep];
    el.appendChild(p);

    const continueBtn       = document.getElementById('ep-continue');
    continueBtn.textContent = 'No.';
    continueBtn.onclick     = () => {
        clearJournalButtons();
        houseShowResult("This escapade is definitely not worth it. The owner could be in the attic above you and, based on what you've seen of the house, might not be the most civilized of people.", {}, 'upstairs');
    };
    clearJournalButtons();
    addJournalButton('Yes.', () => {
        clearJournalButtons();
        G.houseState.atticStep++;
        if (G.houseState.atticStep >= ATTIC_STEPS.length) {
            atticFinalEntry();
        } else {
            showAtticStep();
        }
    });
}

function atticFinalEntry() {
    G.houseState.atticEntered    = true;
    G.houseState.hasGotSomething = true;
    const flashIdx      = G.player.items.indexOf('Flashlight');
    const hadFlashlight = flashIdx !== -1;
    if (hadFlashlight) {
        G.player.items.splice(flashIdx, 1);
        G.flashlightUses = 0;
    }
    const effectLines = applyEffects({ peaceOfMind: -3, knowledge: 1, insanity: 1 });
    let text = "You climb into the attic, the wood groaning underneath your weight. The sharp scent of chlorine hits your nose and you recoil in disgust for a moment.";
    if (hadFlashlight) text += " Your flashlight tumbles out of your pocket, falling back into the second floor.";
    text += " You can see nothing up here. You grope around, feeling your way around old furniture. You are making too much noise for your own comfort. Suddenly, your shoe squelches into something wet. You pull it back in disgust and start to make your way back to the opening downstairs\u2026 wait, wasn't the roof slightly caved in? You whirl around and see no moonlight where the hole should have been and freeze. How could that be? You hear a massive groaning and the roof shudders, raining dust all over you. A massive black shape reels back and jumps off the house, exposing the hole. You don't get a good look at whatever it was as you race down the stairs, terrified.";
    document.getElementById('ep-choices').innerHTML = '';
    document.getElementById('ep-roll').textContent  = '';
    document.getElementById('ep-result').classList.remove('hidden');
    showResultText(text, effectLines);
    clearJournalButtons();
    const continueBtn       = document.getElementById('ep-continue');
    continueBtn.textContent = 'Continue';
    continueBtn.onclick     = continueAfterEncounter;
    updateStats();
}

// ============================================================
// EFFECTS & STATS
// ============================================================
// Applies effects and returns an array of strings describing what changed
function applyEffects(effects) {
    const lines = [];

    for (const [stat, delta] of Object.entries(effects)) {
        if (!delta) continue;

        if (stat === 'health') {
            G.player.health = clamp(G.player.health + delta, 0, 12);
            lines.push(delta < 0 ? `Health ${delta}` : `Health +${delta}`);

        } else if (stat === 'peaceOfMind') {
            G.player.peaceOfMind = clamp(G.player.peaceOfMind + delta, 0, 12);
            lines.push(delta < 0 ? `Peace of Mind ${delta}` : `Peace of Mind +${delta}`);

        } else if (stat === 'knowledge') {
            G.player.knowledge += delta;
            lines.push(`+${delta} A Curious Scrap of Knowledge`);

        } else if (stat === 'insanity') {
            G.player.insanity += delta;
            lines.push('Something shifts within you.');

        } else if (stat === 'setInsanity') {
            G.player.insanity = delta;
            lines.push('Something shifts within you.');

        } else if (stat === 'customDeathTitle') {
            G.customDeathTitle = delta;
            // No display line

        } else if (stat === 'stalked') {
            G.player.stalked += delta;
            lines.push({ html: `<span class="stalked-label">Stalked</span> +${delta}` });

        } else if (stat === 'usesFlashlight') {
            G.flashlightUses--;
            if (G.flashlightUses <= 0) {
                const i = G.player.items.indexOf('Flashlight');
                if (i !== -1) G.player.items.splice(i, 1);
            }

        } else if (stat === 'drainAllHealth') {
            const lost = G.player.health;
            G.player.health = 0;
            lines.push(`Health -${lost}`);

        } else if (stat === 'drainAllFlashlightUses') {
            if (G.flashlightUses > 0) {
                G.flashlightUses = 0;
                const i = G.player.items.indexOf('Flashlight');
                if (i !== -1) G.player.items.splice(i, 1);
                lines.push('Flashlight dead.');
            }

        } else if (stat === 'visibility') {
            G.player.visibility = Math.max(0.1, parseFloat((G.player.visibility + delta).toFixed(1)));
            lines.push(`Visibility ${delta > 0 ? '+' : ''}${delta.toFixed(1)}`);

        } else if (stat === 'strength') {
            G.player.strength = Math.max(0.1, parseFloat((G.player.strength + delta).toFixed(1)));
            lines.push(`Strength ${delta > 0 ? '+' : ''}${delta.toFixed(1)}`);

        } else if (stat === 'speed') {
            G.player.speed = Math.max(0.1, parseFloat((G.player.speed + delta).toFixed(1)));
            lines.push(`Speed ${delta > 0 ? '+' : ''}${delta.toFixed(1)}`);

        } else if (stat === 'randomCharBoost') {
            const chars = ['visibility', 'strength', 'speed'];
            const chosen = chars[Math.floor(Math.random() * chars.length)];
            G.player[chosen] = parseFloat((G.player[chosen] + delta).toFixed(1));
            document.getElementById(`${chosen}-value`).textContent = G.player[chosen].toFixed(1);
            lines.push(`${capitalize(chosen)} +${delta.toFixed(1)}`);

        } else if (stat === 'drainHealth') {
            const lost = G.player.health;
            G.player.health = 0;
            if (lost > 0) lines.push(`Health -${lost}`);

        } else if (stat === 'forceDeeperMove') {
            G.forceDeeperMove = true;
            // Hidden — no display line

        } else if (stat === 'forceShallowerMove') {
            G.forceShallowerMove = true;
            // Hidden — no display line

        } else if (stat === 'forceLevel3Move') {
            G.forceLevel3Move = true;
            // Hidden — no display line

        } else if (stat === 'removeLeafToken') {
            if (G.player.leafTokens > 0) {
                G.player.leafTokens--;
                updateLeafDisplay();
                placeReplacementLeaf();
                lines.push('Lost a leaf token.');
            } else {
                G.forceLevel3Move = true;
            }

        } else if (stat === 'closeToPower') {
            G.player.closeToPower += delta;
            if (delta > 0) {
                for (let i = 0; i < delta; i++) drawPowerCard();
            }
            // Hidden — no display line

        } else if (stat === 'sotcp') {
            G.player.strengthOfACertainParty = Math.max(0, G.player.strengthOfACertainParty + delta);
            // Fully hidden — no display line

        } else if (stat === 'grantItem') {
            G.player.items.push(delta);
            if (delta === 'Gun') G.gunUses = 1;
            lines.push(`Received: ${delta}`);

        } else if (stat === 'removeRandomItem') {
            if (G.player.items.length > 0) {
                const idx = Math.floor(Math.random() * G.player.items.length);
                const lost = G.player.items.splice(idx, 1)[0];
                if (lost === 'Flashlight') {
                    G.flashlightUses   = 0;
                    G.flashlightActive = false;
                }
                lines.push(`Lost: ${lost}`);
            }

        } else if (stat === 'removeItem') {
            const i = G.player.items.indexOf(delta);
            if (i !== -1) G.player.items.splice(i, 1);
            if (delta === 'Flashlight') {
                G.flashlightUses   = 0;
                G.flashlightActive = false;
            }
            lines.push(`Lost: ${delta}`);

        } else if (stat === 'grantAttribute') {
            if (!G.player.attributes.includes(delta)) {
                G.player.attributes.push(delta);
                if (delta === 'Totally Lost') {
                    G.totallyLostTurns = 10;
                    G.canEscape = false;
                }
            }
            lines.push(`Gained attribute: ${delta}`);

        } else if (stat === 'scout') {
            G.scoutingMode = { remaining: delta };
            removeTotallyLost();

        } else if (stat === 'temporaryDebuff') {
            G.statDebuffs[delta.stat] = { amount: delta.amount, usesRemaining: delta.uses };
            lines.push(`${statDisplayName(delta.stat)} ${delta.amount > 0 ? '+' : ''}${delta.amount.toFixed(1)} for next ${delta.uses} checks`);

        } else if (stat === 'conditionalHealth') {
            // Apply health change only if result stays at or above delta.minResult
            if (G.player.health + delta.amount >= delta.minResult) {
                G.player.health = clamp(G.player.health + delta.amount, 0, 12);
                lines.push(`Health ${delta.amount}`);
            }
        }
    }

    return lines;
}

function collectLeaf() {
    const hex = G.board[hk(G.player.q, G.player.r)];
    hex.collectedLevels.push(hex.currentLevel);
    G.player.leafTokens++;
    updateLeafDisplay();
}

function checkLoss() {
    if (G.player.health <= 0) {
        endGame(false, 'Your body gives out in the dark. The woods close in around you. You are very still.');
        return true;
    }
    if (G.player.peaceOfMind <= 0) {
        endGame(false, 'The woods have gotten into your head completely. You stop trying to leave. You stop remembering why you came.');
        return true;
    }
    return false;
}

// ============================================================
// ESCAPE (WIN CONDITION)
// ============================================================
function attemptEscape() {
    if (!G.canEscape) {
        addLog('You are not ready. Find the leaf tokens first.', 'danger');
        return;
    }
    if (!isEdgeHex(G.player.q, G.player.r)) {
        addLog('You are not close enough to the edge.', 'danger');
        return;
    }
    endGame(true, 'You step through the treeline and onto a road. The woods release you. Somewhere behind you, a dog barks once — and then silence.');
}

function endGame(win, message, title) {
    G.phase = win ? 'win' : 'gameover';
    const defaultTitle = win ? 'You Escaped.' : (G.customDeathTitle || 'Lost.');
    document.getElementById('end-title').textContent   = title || defaultTitle;
    document.getElementById('end-message').textContent = message;
    const screen = document.getElementById('end-screen');
    screen.style.opacity = '0';
    screen.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        screen.style.opacity = '1';
    }));
}

// ============================================================
// UI
// ============================================================
function updateStats() {
    const p = G.player;
    document.getElementById('health-value').textContent    = p.health;
    document.getElementById('pom-value').textContent       = p.peaceOfMind;
    document.getElementById('knowledge-value').textContent = p.knowledge;

    setCharDisplay('visibility-value', 'visibility', p.visibility, (G.flashlightActive ? 0.1 : 0) + (G.flamethrowerActive ? 0.3 : 0));
    if (G.gunQueued) {
        const el = document.getElementById('strength-value');
        el.classList.remove('stat-debuffed');
        el.classList.add('stat-boosted');
        el.textContent = 'AUTO';
    } else {
        setCharDisplay('strength-value', 'strength', p.strength, (G.weirdRockQueued ? 0.1 : 0) + (G.woodenBeamActive ? 0.2 : 0));
    }
    setCharDisplay('speed-value',       'speed',      p.speed, G.cookieActive ? 0.1 : 0);

    updateInventory();
}

function setCharDisplay(elId, stat, baseValue, extraBoost = 0) {
    const el = document.getElementById(elId);
    const db = G.statDebuffs[stat];
    const debuff = db ? db.amount : 0;
    const effective = parseFloat((baseValue + extraBoost + debuff).toFixed(1));

    el.classList.remove('stat-boosted', 'stat-debuffed');

    if (db) {
        el.textContent = `${effective} (${db.usesRemaining})`;
        el.classList.add('stat-debuffed');
    } else if (extraBoost) {
        el.textContent = effective.toFixed(1);
        el.classList.add('stat-boosted');
    } else {
        el.textContent = baseValue.toFixed(1);
    }
}

function updateInventory() {
    const itemsBox = document.getElementById('items-box');
    itemsBox.classList.remove('items-box-prompt');
    itemsBox.innerHTML = '';
    G.player.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.textContent = item;
        if (item === 'Weird Rock' || item === 'Weird Bone') {
            div.classList.add('inventory-item-usable');
            div.addEventListener('click', () => showStrengthBoostPrompt(item));
        }
        if (item === 'Wooden Beam') {
            div.classList.add('inventory-item-usable');
            div.addEventListener('click', showWoodenBeamPrompt);
        }
        if (item === 'Flashlight') {
            div.textContent = `Flashlight (${G.flashlightUses})`;
            if (!G.flashlightActive) {
                div.classList.add('inventory-item-usable');
                div.addEventListener('click', showFlashlightPrompt);
            }
        }
        if (item === 'First Aid Kit') {
            div.classList.add('inventory-item-usable');
            div.addEventListener('click', showFirstAidKitPrompt);
        }
        if (item === 'Bluebell') {
            div.classList.add('inventory-item-usable');
            div.addEventListener('click', showBluebellPrompt);
        }
        if (item === 'Eyeglass') {
            div.classList.add('inventory-item-usable');
            div.addEventListener('click', showEyeglassPrompt);
        }
        if (item === 'Phlox Flower') {
            div.classList.add('inventory-item-usable');
            div.addEventListener('click', showPhloxFlowerPrompt);
        }
        if (item === 'Food') {
            div.classList.add('inventory-item-usable');
            div.addEventListener('click', showFoodPrompt);
        }
        if (item === 'Incongruous Staff') {
            div.classList.add('inventory-item-usable');
            div.addEventListener('click', showIncongruousStaffPrompt);
        }
        if (item === 'Cookie') {
            div.classList.add('inventory-item-usable');
            div.addEventListener('click', () => showSimpleItemPrompt('Cookie', 'Eat the cookie? (+1 Health)', { health: 1 }));
        }
        if (item === 'Flamethrower') {
            if (!G.flamethrowerActive) {
                div.classList.add('inventory-item-usable');
                div.addEventListener('click', showFlamethrowerPrompt);
            }
        }
        if (item === 'Gun') {
            div.textContent = `Gun (${G.gunUses})`;
            if (!G.gunQueued) {
                div.classList.add('inventory-item-usable');
                div.addEventListener('click', showGunPrompt);
            }
        }
        if (item === 'Empty Gun') {
            div.classList.add('inventory-item-usable');
            div.addEventListener('click', showEmptyGunPrompt);
        }
        itemsBox.appendChild(div);
    });
    const attrsBox = document.getElementById('attributes-box');
    attrsBox.innerHTML = '';
    G.player.attributes.forEach(attr => {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.textContent = attr;
        attrsBox.appendChild(div);
    });
    if (G.player.stalked > 0) {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.innerHTML = `<span class="stalked-label">Stalked</span> (${G.player.stalked})`;
        attrsBox.appendChild(div);
    }
    if (G.thirdPartyInjured > 0) {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.textContent = `It's Injured (${G.thirdPartyInjured})`;
        attrsBox.appendChild(div);
    }
    if (G.thirdPartyPlacated > 0) {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.textContent = `It's Placated (${G.thirdPartyPlacated})`;
        attrsBox.appendChild(div);
    }
}

function flashCompanionAttribute() {
    const attrsBox = document.getElementById('attributes-box');
    const divs = attrsBox.querySelectorAll('.inventory-item');
    divs.forEach(div => {
        if (div.textContent === 'An Energetic Companion') {
            div.classList.remove('companion-rainbow');
            // Force reflow so re-adding the class restarts the animation
            void div.offsetWidth;
            div.classList.add('companion-rainbow');
            div.addEventListener('animationend', () => div.classList.remove('companion-rainbow'), { once: true });
        }
    });
}

function updateLeafDisplay() {
    for (let i = 0; i < 3; i++) {
        const leaf = document.getElementById(`leaf-${i}`);
        if (i < G.player.leafTokens) {
            leaf.classList.remove('hidden');
            // Small delay so each leaf fades in sequentially
            setTimeout(() => leaf.classList.add('visible'), i * 150);
        } else {
            leaf.classList.add('hidden');
            leaf.classList.remove('visible');
        }
    }
}

function addLog() {}   // retired — encounters now display in the encounter panel
function clearLog() {} // retired

// ============================================================
// UTILITIES
// ============================================================
function rollD10() {
    if (G.savingGrace) {
        G.savingGrace = false;
        renderPowerCards();
        return 10;
    }
    return Math.floor(Math.random() * 10) + 1;
}

function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function statDisplayName(stat) {
    const names = { peaceOfMind: 'Peace of Mind', health: 'Health' };
    return names[stat] ?? capitalize(stat);
}

// Applies any active temporary debuff to a stat base and returns { base, note }
function applyDebuff(stat, base) {
    const db = G.statDebuffs[stat];
    if (!db) return { base, note: '' };
    const adjusted = parseFloat((base + db.amount).toFixed(1));
    db.usesRemaining--;
    if (db.usesRemaining <= 0) delete G.statDebuffs[stat];
    return { base: adjusted, note: ' (debuffed)' };
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ============================================================
// DEV: TEST ENCOUNTER
// ============================================================
function populateDevPanel() {
    const select = document.getElementById('dev-encounter-select');
    select.innerHTML = '';
    for (const [level, encounters] of Object.entries(ENCOUNTERS)) {
        const group = document.createElement('optgroup');
        group.label = `Level ${level}`;
        encounters.forEach(enc => {
            const opt = document.createElement('option');
            opt.value = `${level}:${enc.id}`;
            opt.textContent = enc.title;
            group.appendChild(opt);
        });
        select.appendChild(group);
    }

    // Populate power card select
    const cardSelect = document.getElementById('dev-card-select');
    if (cardSelect) {
        cardSelect.innerHTML = '';
        POWER_CARDS.forEach(card => {
            const opt = document.createElement('option');
            opt.value = card.id;
            opt.textContent = card.name;
            cardSelect.appendChild(opt);
        });
    }

    // Populate item select
    const allItems = [
        'Bluebell', 'Cookie', 'Eyeglass', 'Firestarter', 'First Aid Kit',
        'Flashlight', 'Flamethrower', 'Food', 'Gun', 'Incongruous Staff',
        'Phlox Flower', 'Scrap of Metal', 'Walking Stick', 'Weird Bone',
        'Weird Rock', 'Wooden Beam'
    ];
    const itemSelect = document.getElementById('dev-item-select');
    if (itemSelect) {
        itemSelect.innerHTML = '';
        allItems.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            itemSelect.appendChild(opt);
        });
    }

    // Populate attribute select
    const allAttributes = [
        'An Energetic Companion', 'Ascended', 'Ballsy', 'Covered in Mud',
        'Desecrator', 'Ecocidal', 'Honest', 'Longing', 'Maddening Beauty',
        'Tainted by Carcinogens', 'Totally Lost', 'Watchless'
    ];
    const attrSelect = document.getElementById('dev-attr-select');
    if (attrSelect) {
        attrSelect.innerHTML = '';
        allAttributes.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            attrSelect.appendChild(opt);
        });
    }
}

function devGivePowerCard() {
    const id = document.getElementById('dev-card-select').value;
    if (!id) return;
    const card = POWER_CARDS.find(c => c.id === id);
    if (!card) return;
    if (G.powerCards.length >= 5) {
        showPowerCardResult('Hand is full (5/5).');
        return;
    }
    G.powerCards.push({ ...card });
    renderPowerCards();
}

function devGiveItem() {
    const name = document.getElementById('dev-item-select').value.trim();
    if (!name) return;
    G.player.items.push(name);
    updateInventory();
    updateStats();
}

function devGiveAttribute() {
    const name = document.getElementById('dev-attr-select').value.trim();
    if (!name) return;
    if (!G.player.attributes.includes(name)) {
        G.player.attributes.push(name);
        updateInventory();
        updateStats();
    }
}

function toggleDevPopup() {
    document.getElementById('dev-popup').classList.toggle('hidden');
}

function devTriggerEncounter() {
    // Reset any in-progress encounter so dev panel always works
    G.phase = 'move';
    G.pendingEncounter  = null;
    G.pendingMultiCheck = null;
    G.pendingDualCheck  = null;
    G.pendingLeaf       = false;
    document.getElementById('ep-result').classList.add('hidden');
    document.getElementById('ep-choices').innerHTML = '';
    document.body.classList.remove('level4-invert');

    const val = document.getElementById('dev-encounter-select').value;
    if (!val) return;
    const [level, id] = val.split(':');
    if (level === '4') document.body.classList.add('level4-invert');
    const encounter = ENCOUNTERS[level].find(e => e.id === id);
    if (!encounter) return;

    G.phase = 'encounter';
    G.pendingEncounter = { encounter, hex: G.board[hk(G.player.q, G.player.r)] };
    G.pendingLeaf = false;

    if (encounter.id === 'third_party') {
        playThirdPartyIntro(encounter);
        return;
    }

    const c = encounter.choices[0];
    const isAutoResolve = encounter.choices.length === 1 && !c.check && !c.multiCheck;

    if (isAutoResolve) {
        showEncounterOverlay(encounter);
        const effectLines = applyEffects(c.success.effects ?? {});
        document.getElementById('ep-roll').textContent = '';
        showResultText(c.success.text || '', effectLines);
        document.getElementById('ep-choices').innerHTML = '';
        document.getElementById('ep-result').classList.remove('hidden');
        updateStats();
    } else {
        showEncounterOverlay(encounter);
    }
}

// ============================================================
// LIGHTS IN THE CAVES SUB-CHOICES
// ============================================================
function showLightsCavesSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Gaze into the chasm.', () => {
        clearSubChoiceButtons();
        const roll = rollD10();
        let base = G.player.visibility;
        if (G.statDebuffs.visibility) {
            base += G.statDebuffs.visibility.amount;
            G.statDebuffs.visibility.usesRemaining--;
            if (G.statDebuffs.visibility.usesRemaining <= 0) delete G.statDebuffs.visibility;
        }
        const result = parseFloat((base + roll * 0.1).toFixed(1));
        const success = result >= 1.7;
        document.getElementById('ep-roll').textContent = `visibility ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs 1.7 — ${success ? 'SUCCESS' : 'FAILURE'}`;
        if (success) {
            const lines = applyEffects({ closeToPower: 1, knowledge: 1 });
            showResultText("You stare deeply into the blackness, but see nothing. A faint upward draft of warm, humid air hits you.", lines);
        } else {
            const lines = applyEffects({ peaceOfMind: -2, closeToPower: 1 });
            showResultText("You stare deeply into the mouth of the abyss. For a second, it doesn't seem as deep as you imagine it. Still, you won't take your chances by jumping off of it. You stay a while longer, observing. Something is moving, churning beneath the shadows.", lines);
        }
        cb.style.display = '';
        updateStats();
    });

    addSubChoiceButton('Leave.', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        showResultText("It's too dark to see anything.", []);
        cb.style.display = '';
        updateStats();
    });

    addSubChoiceButton('Leap into the chasm.', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        const lines = applyEffects({ drainAllHealth: true });
        showResultText("You stare deeply into the mouth of the abyss. For a second, it doesn't seem as deep as you imagine it. There even appears to be something moving beneath the shadows. You take a short hop off the cliff's edge and fall, MUCH farther than you thought you would. Nothing registers as you hit the bottom of the cave.", lines);
        cb.style.display = '';
        updateStats();
    });
}

// ============================================================
// YAWN SUB-CHOICES (6 levels deep)
// ============================================================
function yawnRollSingle(stat, target, raw) {
    const roll = rollD10();
    let base = G.player[stat];
    if (G.statDebuffs[stat]) {
        base += G.statDebuffs[stat].amount;
        G.statDebuffs[stat].usesRemaining--;
        if (G.statDebuffs[stat].usesRemaining <= 0) delete G.statDebuffs[stat];
    }
    if (G.powerCardBoost && G.powerCardBoost.stat === stat) {
        base = raw ? base + G.powerCardBoost.amount : parseFloat((base + G.powerCardBoost.amount).toFixed(1));
        G.powerCardBoost = null;
        renderPowerCards();
    }
    const result = raw ? base + roll : parseFloat((base + roll * 0.1).toFixed(1));
    const success = result >= target;
    const rollText = raw
        ? `${stat} ${base} + ${roll} = ${result} vs ${target} — ${success ? 'SUCCESS' : 'FAILURE'}`
        : `${stat} ${base.toFixed(1)} + ${(roll * 0.1).toFixed(1)} = ${result.toFixed(1)} vs ${target} — ${success ? 'SUCCESS' : 'FAILURE'}`;
    return { success, rollText };
}

// Level 1: Enter tunnel → Go deeper / Leave (1.6 speed)
function showYawnTunnelSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Go deeper.', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        showResultText("It may be foolish of you to keep going, but the tunnel intrigues you and, as far as you can tell, it doesn't lead into any other tunnels. In fact, it is remarkably straight.", []);
        updateStats();
        showYawnDeeperSubChoices();
    });

    addSubChoiceButton('Leave.', () => {
        clearSubChoiceButtons();
        const { success, rollText } = yawnRollSingle('speed', 1.6, false);
        document.getElementById('ep-roll').textContent = rollText;
        if (success) {
            showResultText("Nope. No reason to go any further. This forest is already weird. Venturing down a cave could get you killed.", []);
        } else {
            const lines = applyEffects({ peaceOfMind: -1 });
            showResultText("Nope. No reason to go any further. Venturing down a cave in the middle of the night WILL get you killed. Guaranteed. You reach for a root to pull you up and slip. Your knee jams into a wet patch of mud. Nasty.", lines);
        }
        cb.style.display = '';
        updateStats();
    });
}

// Level 2: Go even deeper / Leave (1.7 speed)
function showYawnDeeperSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Go even deeper.', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        showResultText("You keep walking for who-knows-how-long. The air around you grows warmer and more humid, an impossibility in an underground place like this. The smell also changes substantially, adopting the tang of blood and something else you can't rightly describe.", []);
        updateStats();
        showYawnEvenDeeperSubChoices();
    });

    addSubChoiceButton('Leave.', () => {
        clearSubChoiceButtons();
        const { success, rollText } = yawnRollSingle('speed', 1.7, false);
        document.getElementById('ep-roll').textContent = rollText;
        if (success) {
            showResultText("You turn around. The exit is still visible, but it is probably a good idea to go back. Tonight is a bad time for spelunking.", []);
        } else {
            const lines = applyEffects({ peaceOfMind: -2 });
            showResultText("You turn around. The exit is still visible, but it is probably a good idea to go back. As you hoist yourself out of the tunnel, your shoulder collapses onto some nasty-smelling mud. It won't kill you, but it will definitely necessitate a shower.", lines);
        }
        cb.style.display = '';
        updateStats();
    });
}

// Level 3: ... / Turn back (1.8 speed)
function showYawnEvenDeeperSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('...', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        showResultText("You aren't sure how long you have been walking for. Is there something here that you want?", []);
        updateStats();
        showYawnFourthSubChoices();
    });

    addSubChoiceButton('Turn back.', () => {
        clearSubChoiceButtons();
        const { success, rollText } = yawnRollSingle('speed', 1.8, false);
        document.getElementById('ep-roll').textContent = rollText;
        if (success) {
            showResultText("You look backwards and realize that the tunnel entrance is getting a bit hard to see, despite the fact that you've been walking mostly straight. It's time to leave. You think you hear something further down the tunnel, but it's probably nothing.", []);
        } else {
            const lines = applyEffects({ peaceOfMind: -2 });
            showResultText("You look backwards and realize that the tunnel entrance is no longer visible. But you didn't take any turns! You have just been walking in a straight line. You hurry back the way you think you came. The entrance comes into view, but you slip and fall into something wet and sticky. Many animals must have died here.", lines);
        }
        cb.style.display = '';
        updateStats();
    });
}

// Level 4: ... ... / Get out of there (1.9 speed)
function showYawnFourthSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('... ...', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        showResultText("I can't give it to you, but perhaps this world can.", []);
        updateStats();
        showYawnFifthSubChoices();
    });

    addSubChoiceButton('Get out of there.', () => {
        clearSubChoiceButtons();
        const { success, rollText } = yawnRollSingle('speed', 1.9, false);
        document.getElementById('ep-roll').textContent = rollText;
        if (success) {
            showResultText("You realize that you haven't actually been walking at all and look around you. The tang of copper rests on your tongue and you hear a very distant thrumming as if from a drum. You exit the tunnel with little difficulty.", []);
        } else {
            const lines = applyEffects({ peaceOfMind: -2 });
            showResultText("You realize that you haven't actually been walking at all and look around you. The tang of copper rests on your tongue and a distant thrumming sounds in your ears. The cave entrance is only a few meters back. You lift yourself out of the cave, but not before resting your hand on something putrid and gelatinous. You tell yourself it's just animal scat, but your brain isn't convinced.", lines);
        }
        cb.style.display = '';
        updateStats();
    });
}

// Level 5: Seek the heart / Snap out of it (1.7 speed + 17 PoM raw)
function showYawnFifthSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Seek the heart.', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        showResultText("As you have loved yourself, so must you love the dust to which you will return.", []);
        updateStats();
        showYawnSixthSubChoices();
    });

    addSubChoiceButton('Snap out of it, man.', () => {
        clearSubChoiceButtons();
        const r1 = yawnRollSingle('speed', 1.7, false);
        const r2 = yawnRollSingle('peaceOfMind', 17, true);
        const success = r1.success && r2.success;
        document.getElementById('ep-roll').textContent = r1.rollText + ' | ' + r2.rollText;
        if (success) {
            showResultText("The sharp scent of copper and feces startles you out of your reverie. You gaze wildly about, looking for the entrance to the tunnel. Curiously enough, it was only a few meters behind you all along.", []);
        } else {
            const lines = applyEffects({ peaceOfMind: -2 });
            showResultText("The sharp scent of feces and copper awakens you out of your reverie. You gaze frantically about looking for the entrance to the tunnel. A distant pounding hums in your ears and, though you try to plug them, it doesn't stop.", lines);
        }
        cb.style.display = '';
        updateStats();
    });
}

// Level 6: Worship the pulsations (roll 10) / Come on, don't lose yourself (19 PoM raw)
function showYawnSixthSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Worship the pulsations.', () => {
        clearSubChoiceButtons();
        const roll = rollD10();
        const success = roll === 10;
        document.getElementById('ep-roll').textContent = `Roll: ${roll} — ${success ? 'SUCCESS' : 'FAILURE'}`;
        if (success) {
            const lines = applyEffects({ closeToPower: 5, knowledge: 5, grantAttribute: 'Ascended' });
            showResultText("Your meekness is sufficient. Your sacrifice, accepted. Walk uprightly in the valley of the shadow of death and fear no evil.", lines);
            cb.style.display = '';
        } else {
            const lines = applyEffects({ peaceOfMind: -3, health: -3 });
            showResultText("You are not accepted.", lines);
            updateStats();
            showYawnSixthSubChoices();
        }
        updateStats();
    });

    addSubChoiceButton("Come on, don't lose yourself here!", () => {
        clearSubChoiceButtons();
        const { success, rollText } = yawnRollSingle('peaceOfMind', 19, true);
        document.getElementById('ep-roll').textContent = rollText;
        if (success) {
            showResultText("Where are you? Have you even been walking? The tunnel entrance is just behind you! Get out of this place.", []);
        } else {
            const lines = applyEffects({ peaceOfMind: -3 });
            showResultText("You awaken as if from a dream. Were you even walking? You scramble back toward the tunnel entrance. The pounding of the heart grows deafening, blocking out all other noise. Make it stop! The blood, the bone, the phlegm. Make it stop!", lines);
        }
        cb.style.display = '';
        updateStats();
    });
}

// ============================================================
// NOSTALGIA SUB-CHOICES
// ============================================================
function nostalgiaRollDual(checks) {
    let parts = [];
    let success = true;
    for (const { stat, target } of checks) {
        const roll = rollD10();
        let base = G.player[stat];
        if (G.statDebuffs[stat]) {
            base += G.statDebuffs[stat].amount;
            G.statDebuffs[stat].usesRemaining--;
            if (G.statDebuffs[stat].usesRemaining <= 0) delete G.statDebuffs[stat];
        }
        if (G.powerCardBoost && G.powerCardBoost.stat === stat) {
            base = +(base + G.powerCardBoost.amount).toFixed(1);
            G.powerCardBoost = null;
            renderPowerCards();
        }
        const result = +(base + roll * 0.1).toFixed(1);
        const hit = result >= target;
        if (!hit) success = false;
        parts.push(`${stat}: ${roll} → ${result} vs ${target} — ${hit ? 'HIT' : 'MISS'}`);
    }
    return { success, rollText: parts.join(' | ') };
}

function showNostalgiaGroupSubChoices() {
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = 'none';
    clearSubChoiceButtons();
    addSubChoiceButton('Walk toward the front of the group.', nostalgiaSubFront);
    addSubChoiceButton('Walk closer to the back.', nostalgiaSubBack);
    addSubChoiceButton('Walk in the middle of the pack.', nostalgiaSubMiddle);
}

function nostalgiaSubFront() {
    clearSubChoiceButtons();
    const { success, rollText } = nostalgiaRollDual([
        { stat: 'strength', target: 1.4 },
        { stat: 'speed', target: 1.4 }
    ]);
    document.getElementById('ep-roll').textContent = rollText;
    const continueBtn = document.getElementById('ep-continue');
    if (success) {
        showResultText("Unfortunately, your eagerness took you a bit too far ahead. Looking back, you realized that the group had totally disappeared from view. Did you go back to look for them or did you keep going?", []);
        updateStats();
        continueBtn.style.display = 'none';
        addSubChoiceButton('Yes.', () => {
            clearSubChoiceButtons();
            continueBtn.style.display = '';
            const lines = applyEffects({ insanity: 1 });
            showResultText("You ran back the way you came, calling the names of some of those you knew in the group. Nobody responded. None of the trails looked the same either. You plunged deeper and deeper into the woods. The trees started to grow into funnier and funnier shapes. Could you have been imagining things? The earth was violently upturned in some places and odd growth began appearing on the trees. What a si…Wait, that's not how the story went…you shake your head. You never saw any of those things…", lines);
            updateStats();
        });
        addSubChoiceButton('No.', () => {
            clearSubChoiceButtons();
            continueBtn.style.display = '';
            const lines = applyEffects({ health: -2 });
            showResultText("Surely the end of the path would be somewhere. Anyways, the brief freedom that you had to do as you wished without adult supervision was remarkably freeing. Your imagination wandered to thoughts about the cool things older folks must do in the woods. It'll be so much fun going to illicit parties and to go camping and…you tripped, falling straight through a pointy white thing growing out of the ground. The pain began to blossom from your…Wait, that's not how the story went…you shake your head. You never saw any of those things…maybe it's YOUR imagination running too wild.", lines);
            updateStats();
        });
    } else {
        const lines = applyEffects({ health: 1 });
        showResultText("This time, however, they made sure that you were always in sight. If you got lost, there would surely be hell to pay.", lines);
        continueBtn.style.display = '';
        updateStats();
    }
}

function nostalgiaSubBack() {
    clearSubChoiceButtons();
    const { success, rollText } = nostalgiaRollDual([
        { stat: 'strength', target: 1.6 },
        { stat: 'speed', target: 1.6 }
    ]);
    document.getElementById('ep-roll').textContent = rollText;
    const continueBtn = document.getElementById('ep-continue');
    if (success) {
        const lines = applyEffects({ temporaryDebuff: { stat: 'speed', amount: 0.1, uses: 3 } });
        showResultText("Despite the speed of the group, you manage to keep up with them. Oh sure, you were sore the next day, but at least you didn't get lost.", lines);
        continueBtn.style.display = '';
        updateStats();
    } else {
        showResultText("You fell behind, far behind.", []);
        continueBtn.style.display = 'none';
        updateStats();
        addSubChoiceButton('Speed up to catch them.', () => {
            clearSubChoiceButtons();
            continueBtn.style.display = '';
            const lines = applyEffects({ health: -1, peaceOfMind: -1 });
            showResultText("In your fear over getting lost, you sped up your pace, desperately trying to find the youth group, but they were nowhere to be seen. The path became less and less visible too. Night came on quickly, leaving you wandering through haunting trees. Out of nowhere, something pummeled into you, tearing at your face and…Wait, that's not how the story went…you shake your head. You never saw any of those things…", lines);
            updateStats();
        });
        addSubChoiceButton('Stop and wait for someone to find you.', () => {
            clearSubChoiceButtons();
            continueBtn.style.display = '';
            const lines = applyEffects({ health: -1, peaceOfMind: -1 });
            showResultText("No one came. Night came on quickly, leaving you wandering through haunting trees. Out of nowhere, something pummeled into you, tearing at your face and…Wait, that's not how the story went…you shake your head. You never saw any of those things…", lines);
            updateStats();
        });
    }
}

function nostalgiaSubMiddle() {
    clearSubChoiceButtons();
    const { success, rollText } = nostalgiaRollDual([
        { stat: 'strength', target: 1.5 },
        { stat: 'speed', target: 1.5 }
    ]);
    document.getElementById('ep-roll').textContent = rollText;
    const continueBtn = document.getElementById('ep-continue');
    if (success) {
        const lines = applyEffects({ peaceOfMind: 1 });
        showResultText("The trek brings warm memories to your mind, especially in such a cold, cold place.", lines);
    } else {
        const lines = applyEffects({ peaceOfMind: -2 });
        showResultText("At some point during the hike, you tripped and slid down the boulders, falling far into a stream below. The others yelled as you were carried away in the soft current, frantically trying to reach you. But they were so…so…distant…the blackness…wait a moment…that never happened to you…you shake your head, disoriented…", lines);
    }
    continueBtn.style.display = '';
    updateStats();
}

function showNostalgiaHutSubChoices() {
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = 'none';
    clearSubChoiceButtons();
    addSubChoiceButton('Peek inside the hut.', () => {
        clearSubChoiceButtons();
        continueBtn.style.display = '';
        const lines = applyEffects({ stalked: 1 });
        showResultText("You had to take a look inside. What strange treasures might be waiting for you in it? Surely it's been abandoned for some time. You recall creaking open the door and hearing a twig snap behind you. Then…hmm, you don't remember what happened after that…is this your memory? Did you actually go to that hut? You can't quite recall.", lines);
        updateStats();
    });
    addSubChoiceButton("Don't peek inside the hut.", () => {
        clearSubChoiceButtons();
        continueBtn.style.display = '';
        const lines = applyEffects({ insanity: 1 });
        showResultText("You thought you saw something flash through the trees as you approached the building. Though you did not get a good glimpse of it, it caused you to shiver with a cold blackness. The air even smelled of some foul smoke, like burning plastic. You held your shirt up to your mouth, choking on the noxious fumes that wreathed you. As you shielded your nose from the smell, you remember something appearing from out behind a tree. What…you…these aren't your memories…they couldn't be.", lines);
        updateStats();
    });
}

// ============================================================
// THICK VEINS SUB-CHOICES
// ============================================================
function showThickVeinsSubChoices() {
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Touch the thick one.', () => {
        clearSubChoiceButtons();
        continueBtn.style.display = '';
        const lines = applyEffects({});
        showResultText("You reach out a hand and feel its stalk. As you examine it closer, you realize that, instead of a woody texture, the plant is squishy and almost warm to the touch. A faint thrumming emanates from the thing. On closer inspection, there also appear to be white, sappy growths sprouting from different parts of it. How odd.", lines);
        updateStats();
    });

    addSubChoiceButton('Touch the thin one.', () => {
        clearSubChoiceButtons();
        continueBtn.style.display = '';
        const lines = applyEffects({ health: -1, knowledge: 1 });
        showResultText("You extend your hand toward the farther vine, which is thin as a reed. It is almost cord-like and pulling on it…AH, you retract your fingers, covered in blood. The plant jerks violently in your direction, sending stinging barbs straight into your leg. You hurriedly limp away, jets of pain shooting up your thigh.", lines);
        updateStats();
    });
}

// ============================================================
// HUSHED DISPUTE SUB-CHOICES
// ============================================================
function showHushedDisputeSubChoices() {
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Yes.', () => {
        clearSubChoiceButtons();
        continueBtn.style.display = '';
        const lines = applyEffects({ health: -1, peaceOfMind: -1, closeToPower: 1, knowledge: 1 });
        showResultText('"Ah thinck..." says one in a thickly accented drawl, "...thaht wee need to retern to th\' howses. Sumthin\' in\'t raht tooday." "Nah,..." responds the other. "Wee stahy hear, lahk we\'s bin ohrder\'d." Their accent is molasses, oozing out in thick rolls. You begin to stand when suddenly a WHOOSH shoots over your head, knocking you onto your back. The men both yell in surprise, but when you get back up to see what happened, they are gone.', lines);
        updateStats();
    });

    addSubChoiceButton('No.', () => {
        clearSubChoiceButtons();
        continueBtn.style.display = '';
        const lines = applyEffects({});
        showResultText("You turn around and head backwards, not entirely sure why you'd leave such a good lead behind. You think you hear one of the figures shout back the way you came but, when you turn around, no one is there.", lines);
        updateStats();
    });
}

// ============================================================
// WAR AND PEACE SUB-CHOICES
// ============================================================
function showWarAndPeaceSubChoices() {
    const continueBtn = document.getElementById('ep-continue');
    continueBtn.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Approach the wounded man.', () => {
        clearSubChoiceButtons();
        continueBtn.style.display = '';
        const lines = applyEffects({ knowledge: 1, closeToPower: 1, peaceOfMind: -2 });
        showResultText('You sidle up next to the man and gently touch his shoulder. He quits his struggling and gazes up at you, eyes glassy and dull. Blood coats his clothing and, judging by his gasps of pain, it is his own. He begins to speak in a low, raspy tone, "…stronger than before…so much loss…damn these abominations…and all for the dead one." The man\'s eyes roll back as he breathes his last breath, falling back onto the ground. You recoil in horror and, wordlessly, retreat into the obscurity offered by the woods.', lines);
        updateStats();
    });

    addSubChoiceButton('Leave the wounded man.', () => {
        clearSubChoiceButtons();
        continueBtn.style.display = '';
        const lines = applyEffects({ peaceOfMind: 1 });
        showResultText('Whatever attacked that man could very well still be around. You hate the prospect of leaving the man behind, but you can think of no better options.', lines);
        updateStats();
    });
}

// ============================================================
// CHANCE ENCOUNTER SUB-CHOICES
// ============================================================
function showChanceEncounterTalkSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Inquire further.', () => {
        clearSubChoiceButtons();
        const r1 = rollD10();
        const pomBase = G.player.peaceOfMind;
        const pomResult = pomBase + r1;
        const pomHit = pomResult >= 11;
        const r2 = rollD10();
        let visBase = G.player.visibility;
        if (G.statDebuffs.visibility) {
            visBase += G.statDebuffs.visibility.amount;
            G.statDebuffs.visibility.usesRemaining--;
            if (G.statDebuffs.visibility.usesRemaining <= 0) delete G.statDebuffs.visibility;
        }
        const visResult = +(visBase + r2 * 0.1).toFixed(1);
        const visHit = visResult >= 1.4;
        const success = pomHit && visHit;
        document.getElementById('ep-roll').textContent =
            `peaceOfMind: ${pomBase} + ${r1} = ${pomResult} vs 11 \u2014 ${pomHit ? 'HIT' : 'MISS'} | visibility: ${r2} \u2192 ${visResult} vs 1.4 \u2014 ${visHit ? 'HIT' : 'MISS'}`;
        if (success) {
            const lines = applyEffects({ closeToPower: 1 });
            showResultText("You aren't quite sure how to get away, considering that you are lost in these woods, so you ask, \"How?\" Again, the woman seems surprised at your response. \"Howe?\" she responds. \"Ah dohn't noh.\"", lines);
            updateStats();
            showChanceEncounterInquireSubChoices();
        } else {
            const lines = applyEffects({ peaceOfMind: -1 });
            showResultText("You take a few steps closer to the woman, hoping to get a better look at her face. \"How...?\" She pushes you away, uttering a small shriek. The shove isn't meant to hurt you, but it's definitely startling. You fall to the forest floor and stare up at the woman. For a second, you get a peek underneath her hood. Her face contains no discernible mouth or nose. Where her eyes should be, you see only two deep, dark depressions. Most of her skin is pockmarked by irregularly deep acne scars. The person shoves the hood back over her head and vanishes into the forest.", lines);
            cb.style.display = '';
            updateStats();
        }
    });

    addSubChoiceButton('Let her go.', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        showResultText("You nod your head in understanding. Almost imperceptibly, the woman seems to nod back. She steps back into the woods and disappears.", []);
        cb.style.display = '';
        updateStats();
    });
}

function showChanceEncounterInquireSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Inquire further.', () => {
        clearSubChoiceButtons();
        const r1 = rollD10();
        const pomBase = G.player.peaceOfMind;
        const pomResult = pomBase + r1;
        const pomHit = pomResult >= 12;
        const r2 = rollD10();
        let visBase = G.player.visibility;
        if (G.statDebuffs.visibility) {
            visBase += G.statDebuffs.visibility.amount;
            G.statDebuffs.visibility.usesRemaining--;
            if (G.statDebuffs.visibility.usesRemaining <= 0) delete G.statDebuffs.visibility;
        }
        const visResult = +(visBase + r2 * 0.1).toFixed(1);
        const visHit = visResult >= 1.5;
        const success = pomHit && visHit;
        document.getElementById('ep-roll').textContent =
            `peaceOfMind: ${pomBase} + ${r1} = ${pomResult} vs 12 \u2014 ${pomHit ? 'HIT' : 'MISS'} | visibility: ${r2} \u2192 ${visResult} vs 1.5 \u2014 ${visHit ? 'HIT' : 'MISS'}`;
        if (success) {
            const lines = applyEffects({ sotcp: 1 });
            showResultText("You look quizzically at her, still unable to see her face. \"Then why...\" You step closer to her, but she flings herself forward, pushing you away. You catch a small glimpse underneath her hood, but can't detect a mouth or nose. Her push sends you to the ground, but it didn't seem like she did so with the intent to harm you. You recover your footing within a few seconds, but she has vanished into the undergrowth.", lines);
        } else {
            const lines = applyEffects({ peaceOfMind: -1, health: -1 });
            showResultText("You move as close as you can to her, both trying to hear her better and get a better look at her face. \"Then why...\" The woman shrieks, shoving you away. It's not a shove meant to hurt you, but you tumble to the ground. The hood of the woman's face is thrown back briefly and you gasp in horror. She has no discernible mouth or nose. Instead, her face contains two deep depressions for eyes and is pockmarked by acne-like scars that carve deeply into the skin. She quickly tugs the hood back over her face and vanishes into the underbrush.", lines);
        }
        cb.style.display = '';
        updateStats();
    });

    addSubChoiceButton('Let her go.', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        showResultText("The woman seems to observe you apologetically for a second and then leaves.", []);
        cb.style.display = '';
        updateStats();
    });
}

// ============================================================
// GALVANIZED SUB-CHOICES
// ============================================================
function showGalvanizedSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Break the...antenna?', () => {
        clearSubChoiceButtons();
        const { success, rollText } = yawnRollSingle('strength', 1.7, false);
        document.getElementById('ep-roll').textContent = rollText;
        if (success) {
            const lines = applyEffects({ sotcp: -1 });
            showResultText("This rod is clearly doing damage to the woods around it. You grab a fallen branch and swing it at the rod. Your blow connects at just the right angle, snapping the rod in half.", lines);
        } else {
            const lines = applyEffects({ health: -2 });
            showResultText("This rod is clearly doing damage to the woods around it. You grab a branch and swing it at the rod. The branch connects with the pole, but breaks in half. A zap of lightning suddenly strikes you, throwing you backwards.", lines);
        }
        cb.style.display = '';
        updateStats();
    });

    addSubChoiceButton('Support the...antenna?', () => {
        clearSubChoiceButtons();
        const { success, rollText } = yawnRollSingle('strength', 1.7, false);
        document.getElementById('ep-roll').textContent = rollText;
        if (success) {
            const lines = applyEffects({ sotcp: 1 });
            showResultText("The rod looks like it is leaning a bit to one direction. You grab a stick and prop it up against the rod, righting it.", lines);
        } else {
            const lines = applyEffects({ health: -1, peaceOfMind: -1 });
            showResultText("The rod looks like it is leaning a bit in one direction. You push your shoulder against it in an effort to support it, but are hit with a massive wave of electricity, throwing you back several meters.", lines);
        }
        cb.style.display = '';
        updateStats();
    });
}

// ============================================================
// DON'T LOOK SUB-CHOICES
// ============================================================
function showDoNotLookSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Look back down.', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        showResultText("You can see no end to the cloud from your vantage point. You re-focus on the task ahead and proceed forward.", []);
        cb.style.display = '';
        updateStats();
    });

    addSubChoiceButton('Squint at the cloud.', () => {
        clearSubChoiceButtons();
        const { success, rollText } = yawnRollSingle('visibility', 1.5, false);
        document.getElementById('ep-roll').textContent = rollText;
        if (success) {
            showResultText("You look closer at the cloud and at where the Moon should be. For some reason, small parts of it infrequently appear and disappear. As you consider this phenomenon, you realize that the cloud must not be a cloud at all. It looks almost like a massive cluster of birds.", []);
        } else {
            const lines = applyEffects({ peaceOfMind: -2 });
            showResultText("You look closer at the cloud. It expands and contracts in an unusual manner. Parts of it break off and re-join the central mass. It almost reminds you of the patterns made by birds, but it would take millions of birds to cause an effect of this magnitude. You hold your gaze for a while longer and witness the Moon's light break free of the clouds. Thousands of winged things encircle it, before cutting off its light again. You shudder and wait for them to move away.", lines);
        }
        cb.style.display = '';
        updateStats();
    });
}

// ============================================================
// TROUBLE WITH SOMNOLENCE SUB-CHOICES
// ============================================================
function showSomnolenceSleepSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Proceed forward.', () => {
        clearSubChoiceButtons();
        const { success, rollText } = nostalgiaRollDual([
            { stat: 'visibility', target: 1.6 },
            { stat: 'speed', target: 1.3 }
        ]);
        document.getElementById('ep-roll').textContent = rollText;
        if (success) {
            showResultText("It feels like you walk for hours through the desolation and you start to grow cold. A chill breeze blows in from behind, smelling strongly of chlorine gas. You hurry faster, not wanting to expose your lungs to that tainted chill and soon find yourself gazing up at a massive rise in the valley. Is it a rise\u2026? No\u2026? It is a boulder\u2026(?)...a statue\u2026(?)...your eyes adjust to the light, showing you a massive rocky, heaving thing covered in pores glaring down at you. Its patterns and emptiness tear at your very soul, dragging you in and repelling you at the same time.", []);
            updateStats();
            showSomnolenceEntitySubChoices();
        } else {
            const lines = applyEffects({ peaceOfMind: -1, health: -1 });
            showResultText("The stone structures throughout the valley severely hinder your progress. Everywhere you go looks more and more inhospitable. The weak illumination of the environment frustrates you to no end. You start to walk faster, hoping to stamp out your annoyance. As you probably should have expected, your foot lands on a jagged formation, driving a stalagmitic spike up and into your foot. You almost feel the pain before waking up.", lines);
            cb.style.display = '';
            updateStats();
        }
    });

    addSubChoiceButton('Go backward.', () => {
        clearSubChoiceButtons();
        const { success, rollText } = nostalgiaRollDual([
            { stat: 'visibility', target: 1.6 },
            { stat: 'speed', target: 1.3 }
        ]);
        document.getElementById('ep-roll').textContent = rollText;
        if (success) {
            showResultText("You begin a steady hike through the canyon, making good progress across the jagged protrusions sticking out of the ground. The gales pick up, bringing toward you an ever sharper smell of chemicals. You see nothing strange up ahead in the canyon, but\u2026you gaze upwards. Something is flying up there. You look harder. No! A great gathering of terrible winged monsters are flying up there! Thousands and thousands of them!", []);
            updateStats();
            showSomnolenceWingsSubChoices();
        } else {
            const lines = applyEffects({ peaceOfMind: -2 });
            showResultText("The stone structures throughout the valley severely hinder your progress. Everywhere you go looks more and more inhospitable. The weak illumination of the environment frustrates you to no end. You start to walk faster, hoping to stamp out your annoyance. As you probably should have expected, your foot lands on a jagged formation, driving a stalagmitic spike up and into your foot. You almost feel the pain before waking up.", lines);
            cb.style.display = '';
            updateStats();
        }
    });

    addSubChoiceButton('Examine the rocks.', () => {
        clearSubChoiceButtons();
        const { success, rollText } = yawnRollSingle('visibility', 1.5, false);
        document.getElementById('ep-roll').textContent = rollText;
        if (success) {
            const lines = applyEffects({ knowledge: 1, peaceOfMind: -1 });
            showResultText("You gaze at the warped curves and edges of the jagged pillars. They have no pattern associated with them, but you are certain that they must have been intentionally placed and fastened here. Who would do this and for what purpose. You put your hand on the cool stone and begin to feel all kinds of emotions, only to wake up before you can investigate further.", lines);
        } else {
            const lines = applyEffects({ peaceOfMind: -2 });
            showResultText("You press your hand against the pillar and are immediately hit with a blast of emotions. Ecstasy! Rage! Terror! Jubilation! Adulation! What is this! You are drowning! Dying! Rising! Breathing! You must awake! You must\u2026you awake, heart beating at a million miles per second.", lines);
        }
        cb.style.display = '';
        updateStats();
    });

    addSubChoiceButton('Climb up the valley.', () => {
        clearSubChoiceButtons();
        const { success, rollText } = yawnRollSingle('strength', 1.6, false);
        document.getElementById('ep-roll').textContent = rollText;
        if (success) {
            const lines = applyEffects({ closeToPower: 1, peaceOfMind: -1 });
            showResultText("You hike up the side of the valley, passing twisted pillars until you begin to hike through boulders. The last part of your hike takes you up a steeper section of the hill. For a minute, you worry that you won't make it, but you arrive at the top anyways. There is\u2026nothing? Nothing but a flat, gray plane! You look upwards, peering at the bluish stars above, wondering how you could have found yourself in this mess. One of them glares down at you. It shines brighter, and brighter. Does it? You can't tell. You wake up before you can be sure.", lines);
        } else {
            const lines = applyEffects({ peaceOfMind: -1, health: -1 });
            showResultText("You hike up the side of the valley, passing twisted pillars until you begin to hike through boulders. The last part of your hike takes you up a steeper section of the hill. Just as your head peeks over the top of the valley, your foot slips and you go tumbling back down to the ground below. Your head connects with a rock and you awake in the forest, asleep under the oak tree.", lines);
        }
        cb.style.display = '';
        updateStats();
    });
}

function showSomnolenceEntitySubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Interact with It.', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        const lines = applyEffects({ closeToPower: 2, peaceOfMind: -1 });
        showResultText("You cast your eyes downward, unwilling to look at it further, but you stumble on towards it, reaching the very bottom of the Entity. Your arm stretches out to touch it, yearning to feel the coarse roughness of its side, to test the holes lining its skin, but you awake before you can reach its side.", lines);
        cb.style.display = '';
        updateStats();
    });

    addSubChoiceButton('Gaze upon It.', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        const lines = applyEffects({ closeToPower: 2, peaceOfMind: -2, grantAttribute: 'Maddening Beauty' });
        showResultText("What an awesome thing this is! What a horrible thing it is! You become caught by the hypnotic sight of something so large and so great. You are transfixed, paralyzed and unable to do anything else. You stand for hours, days, weeks, months, years! Time is of no consequence! You must look upon this Entity! You must\u2026you awake, wondering how long you've been asleep.", lines);
        cb.style.display = '';
        updateStats();
    });

    addSubChoiceButton('Flee from It.', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        const lines = applyEffects({ peaceOfMind: 1 });
        showResultText("What is this massive thing? Could it be alive? Does it breathe? The eye does not permit you to see it in its entirety! No! Your brain cannot fathom it! Away, away! You awake in a cold sweat.", lines);
        cb.style.display = '';
        updateStats();
    });
}

function showSomnolenceWingsSubChoices() {
    const cb = document.getElementById('ep-continue');
    cb.style.display = 'none';
    clearSubChoiceButtons();

    addSubChoiceButton('Confront them.', () => {
        clearSubChoiceButtons();
        const roll = rollD10();
        const success = roll <= 8;
        document.getElementById('ep-roll').textContent = `Roll: ${roll} \u2014 ${success ? 'SUCCESS' : 'FAILURE'}`;
        if (success) {
            const lines = applyEffects({ closeToPower: 1, knowledge: 1, peaceOfMind: -1 });
            showResultText("You continue to wend your way around the twisted pillars of stone. None of the creatures above pay you any heed. It is not long before you realize that you've escaped their gaze. The hellish flock passes you, traveling hastily toward the opposite end of the canyon. The canyon has also begun to level out, sides flowing down into a flat plane. You stare at the horizon, growing fearful at the utter lack of human civilization for what appears to be miles. The sky is also\u2026getting lighter? You squint and realize that it must be near daytime here. A giant sun peeks over the vast landscape. You catch only one glimpse of it before waking, but something about it makes you shiver.", lines);
        } else {
            const lines = applyEffects({ peaceOfMind: -2 });
            showResultText("You continue to wend your way around the twisted pillars of stone. Your movement appears to, at first, go unnoticed by the creatures above. You confidently move forward at a quicker pace, allowing yourself to grow less discreet in your progression. After a few minutes, you hear a tremendous thump behind you and\u2026whispers? What could\u2026? Oh goodness, why did you turn around? What pulsating nightmare have you\u2026? Wake up! Wake up! You awake, breathing heavy.", lines);
        }
        cb.style.display = '';
        updateStats();
    });

    addSubChoiceButton('Flee.', () => {
        clearSubChoiceButtons();
        document.getElementById('ep-roll').textContent = '';
        const lines = applyEffects({ peaceOfMind: -2 });
        showResultText("They will soon be just over your head! You start to run in the opposite direction, tripping and stumbling as you run along. It isn't long before you hear flapping and whispering nearby, as if just out of reach. You turn your head and\u2026oh heaven\u2026they are approaching\u2026they are approaching. You awake kicking and yelling.", lines);
        cb.style.display = '';
        updateStats();
    });
}

// ============================================================
// POWER CARDS UI
// ============================================================
function drawPowerCard() {
    if (G.powerCards.length >= 5) return; // hand size limit
    const card = POWER_CARDS[Math.floor(Math.random() * POWER_CARDS.length)];
    G.powerCards.push({ ...card });
    renderPowerCards();
}

function renderPowerCards() {
    const countEl = document.getElementById('power-card-count');
    const grid    = document.getElementById('power-cards-grid');
    const empty   = document.getElementById('power-cards-empty');
    if (!grid) return;

    countEl.textContent = G.powerCards.length;
    grid.innerHTML = '';

    if (G.powerCards.length === 0) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    G.powerCards.forEach((card, i) => {
        const div = document.createElement('div');
        const boostBlocked    = (card.type === 'boost' || card.type === 'boost_choice' || card.type === 'boost_random') && G.powerCardBoost !== null;
        const illusionSelect  = G.justAnIllusionMode;
        div.className = 'power-card'
            + (boostBlocked   ? ' boosted-queued'  : '')
            + (illusionSelect ? ' illusion-select'  : '');
        div.innerHTML = `
            <div class="power-card-name">${card.name}</div>
            <hr class="power-card-sep">
            <div class="power-card-desc">${card.description}</div>
        `;
        if (!boostBlocked) div.addEventListener('click', () => usePowerCard(i));
        grid.appendChild(div);
    });
}

function togglePowerCards() {
    const panel = document.getElementById('power-cards-panel');
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) renderPowerCards();
}

function usePowerCard(index) {
    const card = G.powerCards[index];
    if (!card) return;

    // Just an Illusion mode: the next card click discards that card and draws a new one
    if (G.justAnIllusionMode) {
        G.justAnIllusionMode = false;
        G.powerCards.splice(index, 1);
        drawPowerCard();
        renderPowerCards();
        return;
    }

    switch (card.type) {
        case 'boost': {
            if (G.powerCardBoost) { showPowerCardResult('A boost is already queued.'); return; }
            G.powerCardBoost = { stat: card.stat, amount: card.amount };
            G.powerCards.splice(index, 1);
            renderPowerCards();
            updateStats();
            showPowerCardResult(`${capitalize(card.stat)} +${card.amount.toFixed(1)} queued for your next check.`);
            break;
        }
        case 'boost_random': {
            if (G.powerCardBoost) { showPowerCardResult('A boost is already queued.'); return; }
            const stats = ['visibility', 'strength', 'speed'];
            const stat  = stats[Math.floor(Math.random() * stats.length)];
            G.powerCardBoost = { stat, amount: card.amount };
            G.powerCards.splice(index, 1);
            renderPowerCards();
            updateStats();
            showPowerCardResult(`${capitalize(stat)} +${card.amount.toFixed(1)} queued for your next check.`);
            break;
        }
        case 'boost_choice': {
            if (G.powerCardBoost) { showPowerCardResult('A boost is already queued.'); return; }
            G.boostChoiceMode = { amount: card.amount, cardIndex: index };
            showBoostChoiceUI();
            break;
        }
        case 'second_chance': {
            if (!G.secondChanceSnapshot) {
                showPowerCardResult('Use immediately after a test resolves.');
                return;
            }
            executeSecondChance(index);
            break;
        }
        case 'saving_grace': {
            G.savingGrace = true;
            G.powerCards.splice(index, 1);
            renderPowerCards();
            showPowerCardResult('Your next die roll will automatically return a 10.');
            break;
        }
        case 'hex_remove_random': {
            if (G.phase !== 'move') { showPowerCardResult('Use between encounters.'); return; }
            doHexRemoveRandom(card.count);
            G.powerCards.splice(index, 1);
            renderPowerCards();
            break;
        }
        case 'hex_remove_choice': {
            if (G.phase !== 'move') { showPowerCardResult('Use between encounters.'); return; }
            G.hexRemoveMode = { remaining: card.count };
            G.powerCards.splice(index, 1);
            renderPowerCards();
            renderBoard();
            showPowerCardResult(`Select ${card.count} adjacent tile${card.count > 1 ? 's' : ''} to remove.`);
            break;
        }
        case 'draw': {
            G.powerCards.splice(index, 1);
            for (let i = 0; i < card.count; i++) drawPowerCard();
            break;
        }
        case 'teleport_random': {
            if (G.phase !== 'move') { showPowerCardResult('Use between encounters.'); return; }
            G.powerCards.splice(index, 1);
            renderPowerCards();
            doTeleportRandom();
            break;
        }
        case 'hex_reveal_adjacent': {
            if (G.phase !== 'move') { showPowerCardResult('Use between encounters.'); return; }
            G.revealMode = { remaining: card.count, anyHex: false };
            G.powerCards.splice(index, 1);
            renderPowerCards();
            renderBoard();
            showPowerCardResult(`Click ${card.count} adjacent hex${card.count > 1 ? 'es' : ''} to reveal their Leaf token status.`);
            break;
        }
        case 'hex_reveal_any': {
            if (G.phase !== 'move') { showPowerCardResult('Use between encounters.'); return; }
            G.revealMode = { remaining: 1, anyHex: true };
            G.powerCards.splice(index, 1);
            renderPowerCards();
            renderBoard();
            showPowerCardResult('Click any hex on the board to reveal its Leaf token status.');
            break;
        }
        case 'random_attribute': {
            const pool = [
                'Watchless', 'Ballsy', 'Ecocidal', 'Longing', 'Covered in Mud',
                'Desecrator', 'Honest', 'An Energetic Companion', 'Tainted by Carcinogens',
                'Ascended', 'Maddening Beauty'
            ].filter(a => !G.player.attributes.includes(a));
            if (pool.length === 0) { showPowerCardResult('You already have all available attributes.'); return; }
            const attr = pool[Math.floor(Math.random() * pool.length)];
            applyEffects({ grantAttribute: attr });
            G.powerCards.splice(index, 1);
            renderPowerCards();
            updateStats();
            showPowerCardResult(`Gained attribute: ${attr}.`);
            break;
        }
        case 'quick_jog': {
            if (G.phase !== 'move') { showPowerCardResult('Use before moving.'); return; }
            G.quickJog = true;
            G.powerCards.splice(index, 1);
            renderPowerCards();
            renderBoard();
            showPowerCardResult('You may move up to 2 hexes this turn. Only the destination triggers an encounter.');
            break;
        }
        case 'salvation': {
            if (!G.lastOutcomeEffects) { showPowerCardResult('No recent test to reverse.'); return; }
            reverseEffects(G.lastOutcomeEffects);
            G.lastOutcomeEffects = null;
            G.powerCards.splice(index, 1);
            renderPowerCards();
            updateStats();
            showPowerCardResult('The effects of your last test have been reversed.');
            break;
        }
        case 'damnation': {
            if (!G.lastFailureEffects) { showPowerCardResult('No recent failure to repeat.'); return; }
            applyEffects(G.lastFailureEffects);
            G.powerCards.splice(index, 1);
            renderPowerCards();
            updateStats();
            showPowerCardResult('The effects of your last failure have been re-applied.');
            break;
        }
        case 'moment_of_clarity': {
            G.powerCards.splice(index, 1);
            renderPowerCards();
            showMomentOfClarityModal();
            break;
        }
        case 'chaos_descends': {
            G.powerCards.splice(index, 1);
            handleChaosDescends();
            renderPowerCards();
            break;
        }
        case 'double_or_nothing': {
            G.powerCards.splice(index, 1);
            handleDoubleOrNothing();
            renderPowerCards();
            break;
        }
        case 'just_an_illusion': {
            if (G.powerCards.length <= 1) {
                showPowerCardResult('No other cards in hand to discard.');
                return;
            }
            G.powerCards.splice(index, 1);
            G.justAnIllusionMode = true;
            renderPowerCards();
            showPowerCardResult('Click a card in your hand to discard it and draw a replacement.');
            break;
        }
    }
}

// ============================================================
// POWER CARD HELPERS
// ============================================================

function snapshotPlayer() {
    const p = G.player;
    return {
        health:                  p.health,
        peaceOfMind:             p.peaceOfMind,
        knowledge:               p.knowledge,
        insanity:                p.insanity,
        stalked:                 p.stalked,
        visibility:              p.visibility,
        strength:                p.strength,
        speed:                   p.speed,
        items:                   [...p.items],
        attributes:              [...p.attributes],
        leafTokens:              p.leafTokens,
        strengthOfACertainParty: p.strengthOfACertainParty
    };
}

function restorePlayerSnapshot() {
    if (!G.secondChanceSnapshot) return;
    const s = G.secondChanceSnapshot;
    Object.assign(G.player, {
        health:                  s.health,
        peaceOfMind:             s.peaceOfMind,
        knowledge:               s.knowledge,
        insanity:                s.insanity,
        stalked:                 s.stalked,
        visibility:              s.visibility,
        strength:                s.strength,
        speed:                   s.speed,
        items:                   [...s.items],
        attributes:              [...s.attributes],
        leafTokens:              s.leafTokens,
        strengthOfACertainParty: s.strengthOfACertainParty
    });
    G.secondChanceSnapshot = null;
    updateLeafDisplay();
}

function reverseEffects(effects) {
    if (!effects) return;
    const toApply = {};
    for (const [stat, delta] of Object.entries(effects)) {
        if (['health', 'peaceOfMind', 'knowledge', 'insanity',
             'visibility', 'strength', 'speed', 'stalked', 'sotcp'].includes(stat)) {
            toApply[stat] = -delta;
        } else if (stat === 'grantItem') {
            toApply['removeItem'] = delta;
        } else if (stat === 'grantAttribute') {
            const idx = G.player.attributes.indexOf(delta);
            if (idx !== -1) G.player.attributes.splice(idx, 1);
            if (delta === 'Totally Lost') G.totallyLostTurns = 0;
        }
        // scout, temporaryDebuff, conditionalHealth, etc. not reversible
    }
    applyEffects(toApply);
}

function addSecondChancePrompt() {
    const idx = G.powerCards.findIndex(c => c.id === 'a_second_chance');
    if (idx === -1 || !G.pendingEncounter) return;
    const btn = document.createElement('button');
    btn.className = 'second-chance-btn';
    btn.textContent = '↩ Use: A Second Chance';
    btn.addEventListener('click', () => {
        btn.remove();
        executeSecondChance(idx);
    });
    document.getElementById('ep-result').appendChild(btn);
}

function executeSecondChance(cardIndex) {
    restorePlayerSnapshot();
    G.powerCards.splice(cardIndex, 1);
    G.lastOutcomeEffects = null;
    G.lastFailureEffects = null;
    renderPowerCards();
    updateStats();
    // Hide result, re-show encounter choices
    document.getElementById('ep-result').classList.add('hidden');
    document.getElementById('ep-roll').textContent = '';
    clearSubChoiceButtons();
    showEncounterOverlay(G.pendingEncounter.encounter);
}

function doHexRemoveRandom(count) {
    const pq = G.player.q;
    const pr = G.player.r;
    const neighbors = getNeighbors(pq, pr);
    const eligible  = neighbors.filter(h => {
        const hex    = G.board[hk(h.q, h.r)];
        const isLeaf = hex.leafLevels.includes(hex.currentLevel) && !hex.collectedLevels.includes(hex.currentLevel);
        return !isLeaf && hex.currentLevel < 4;
    });
    const toRemove = shuffle([...eligible]).slice(0, count);
    toRemove.forEach(h => { G.board[hk(h.q, h.r)].currentLevel++; });
    showPowerCardResult(`Removed top tile from ${toRemove.length} adjacent hex${toRemove.length !== 1 ? 'es' : ''}.`);
    renderBoard();
}

function onHexRemoveClick(q, r) {
    if (!G.hexRemoveMode) return;
    const key = hk(q, r);
    const hex = G.board[key];
    const hasLeaf = hex.leafLevels.includes(hex.currentLevel) && !hex.collectedLevels.includes(hex.currentLevel);

    if (hasLeaf) {
        G.scoutResults[key] = true;
        showPowerCardResult('Leaf token found here!');
    } else {
        hex.currentLevel++;
        showPowerCardResult('Tile removed.');
    }

    G.hexRemoveMode.remaining--;
    if (G.hexRemoveMode.remaining <= 0) {
        G.hexRemoveMode = null;
    }
    renderBoard();
}

function onRevealHexClick(q, r) {
    if (!G.revealMode) return;
    const key = hk(q, r);
    const hex = G.board[key];
    const hasLeaf = hex.leafLevels.includes(hex.currentLevel) && !hex.collectedLevels.includes(hex.currentLevel);
    G.scoutResults[key] = hasLeaf;
    G.revealMode.remaining--;

    const left = G.revealMode.remaining;
    showPowerCardResult(hasLeaf
        ? `Leaf token found!${left > 0 ? ` ${left} reveal${left > 1 ? 's' : ''} remaining.` : ''}`
        : `No leaf token.${left > 0 ? ` ${left} reveal${left > 1 ? 's' : ''} remaining.` : ''}`);

    if (G.revealMode.remaining <= 0) G.revealMode = null;
    renderBoard();
}

function doTeleportRandom() {
    const pKey = hk(G.player.q, G.player.r);
    let candidates = Object.keys(G.board).filter(k => k !== pKey && G.board[k].currentLevel < 4);
    if (candidates.length === 0) candidates = Object.keys(G.board).filter(k => k !== pKey);
    if (candidates.length === 0) return;

    const targetKey = candidates[Math.floor(Math.random() * candidates.length)];
    const targetHex = G.board[targetKey];

    // Remove departure tile
    const prevHex = G.board[pKey];
    if (prevHex.currentLevel < 4) prevHex.currentLevel++;

    G.player.q = targetHex.q;
    G.player.r = targetHex.r;
    targetHex.visited = true;

    const hasLeafHere = targetHex.leafLevels.includes(targetHex.currentLevel)
                     && !targetHex.collectedLevels.includes(targetHex.currentLevel);
    G.pendingLeaf  = hasLeafHere;
    G.scoutResults = {};
    G.phase        = 'encounter';

    renderBoard();
    triggerEncounter(targetHex);
}

function showBoostChoiceUI() {
    const panel = document.getElementById('power-cards-panel');
    panel.classList.remove('hidden');
    let existing = document.getElementById('boost-choice-ui');
    if (existing) existing.remove();

    const ui = document.createElement('div');
    ui.id = 'boost-choice-ui';
    const amt = G.boostChoiceMode.amount.toFixed(1);
    ui.innerHTML = `<div class="boost-choice-label">Choose a characteristic to boost (+${amt}):</div>
        <div class="boost-choice-btns">
            <button onclick="applyBoostChoice('visibility')">Visibility</button>
            <button onclick="applyBoostChoice('strength')">Strength</button>
            <button onclick="applyBoostChoice('speed')">Speed</button>
            <button class="boost-choice-cancel" onclick="cancelBoostChoice()">Cancel</button>
        </div>`;
    panel.insertBefore(ui, panel.firstChild);
}

function applyBoostChoice(stat) {
    if (!G.boostChoiceMode) return;
    G.powerCardBoost = { stat, amount: G.boostChoiceMode.amount };
    G.powerCards.splice(G.boostChoiceMode.cardIndex, 1);
    G.boostChoiceMode = null;
    const ui = document.getElementById('boost-choice-ui');
    if (ui) ui.remove();
    renderPowerCards();
    updateStats();
    showPowerCardResult(`${capitalize(stat)} +${G.powerCardBoost.amount.toFixed(1)} queued for your next check.`);
}

function cancelBoostChoice() {
    G.boostChoiceMode = null;
    const ui = document.getElementById('boost-choice-ui');
    if (ui) ui.remove();
}

function showPowerCardResult(msg) {
    const el = document.getElementById('card-feedback');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._fadeTimer);
    el._fadeTimer = setTimeout(() => { el.style.opacity = '0'; }, 3000);
}

function handleChaosDescends() {
    const roll = Math.floor(Math.random() * 10) + 1;
    let msg;
    if (roll <= 2) {
        drawPowerCard(); drawPowerCard();
        msg = `Roll: ${roll} — Drew 2 Power Cards.`;
    } else if (roll <= 4) {
        ['visibility', 'strength', 'speed'].forEach(s => {
            G.statDebuffs[s] = { amount: 0.1, usesRemaining: 3 };
        });
        msg = `Roll: ${roll} — +0.1 to all characteristics for the next 3 checks each.`;
        updateStats();
    } else if (roll <= 6) {
        const lost = Math.min(2, G.powerCards.length);
        for (let i = 0; i < lost; i++) {
            G.powerCards.splice(Math.floor(Math.random() * G.powerCards.length), 1);
        }
        msg = `Roll: ${roll} — Lost ${lost} random card${lost !== 1 ? 's' : ''}.`;
    } else if (roll <= 8) {
        G.player.health     = clamp(G.player.health - 1, 0, 12);
        G.player.peaceOfMind = clamp(G.player.peaceOfMind - 1, 0, 12);
        msg = `Roll: ${roll} — Health −1, Peace of Mind −1.`;
        updateStats();
    } else if (roll === 9) {
        if (G.player.items.length > 0) {
            const idx  = Math.floor(Math.random() * G.player.items.length);
            const lost = G.player.items.splice(idx, 1)[0];
            msg = `Roll: ${roll} — Lost item: ${lost}.`;
            updateStats();
        } else {
            msg = `Roll: ${roll} — You have no items to lose.`;
        }
    } else {
        if (G.player.items.length > 0) {
            const dupe = G.player.items[Math.floor(Math.random() * G.player.items.length)];
            G.player.items.push(dupe);
            msg = `Roll: ${roll} — Gained a duplicate: ${dupe}.`;
            updateStats();
        } else {
            msg = `Roll: ${roll} — You have no items to duplicate.`;
        }
    }
    showPowerCardResult(msg);
}

function handleDoubleOrNothing() {
    const roll = Math.floor(Math.random() * 10) + 1;
    if (roll % 2 !== 0) {
        G.powerCards = [];
        renderPowerCards();
        showPowerCardResult(`Roll: ${roll} (odd) — Your hand is discarded.`);
    } else {
        const needed = 5 - G.powerCards.length;
        for (let i = 0; i < needed; i++) drawPowerCard();
        showPowerCardResult(`Roll: ${roll} (even) — Drew ${needed} card${needed !== 1 ? 's' : ''}.`);
    }
}

function showMomentOfClarityModal() {
    const modal = document.getElementById('clarity-modal');
    const grid  = document.getElementById('clarity-grid');
    if (!modal || !grid) return;

    const cards = [];
    for (let i = 0; i < 5; i++) cards.push({ ...POWER_CARDS[Math.floor(Math.random() * POWER_CARDS.length)] });
    G.momentOfClarityCards = cards;
    G.momentOfClarityPicks = 0;

    grid.innerHTML = '';
    cards.forEach((card, i) => {
        const div = document.createElement('div');
        div.className = 'clarity-card';
        div.id = `clarity-card-${i}`;
        div.innerHTML = `<div class="power-card-name">${card.name}</div><hr class="power-card-sep"><div class="power-card-desc">${card.description}</div>`;
        div.addEventListener('click', () => pickClarityCard(i));
        grid.appendChild(div);
    });

    updateClarityPicks();
    modal.classList.remove('hidden');
}

function pickClarityCard(i) {
    if (!G.momentOfClarityCards || !G.momentOfClarityCards[i]) return;
    if (G.momentOfClarityPicks >= 2 || G.powerCards.length >= 5) return;

    G.powerCards.push({ ...G.momentOfClarityCards[i] });
    G.momentOfClarityCards[i] = null;
    G.momentOfClarityPicks++;

    const el = document.getElementById(`clarity-card-${i}`);
    if (el) el.classList.add('clarity-card-picked');

    renderPowerCards();
    updateClarityPicks();

    if (G.momentOfClarityPicks >= 2 || G.powerCards.length >= 5) closeClarityModal();
}

function updateClarityPicks() {
    const el = document.getElementById('clarity-picks-remaining');
    if (!el) return;
    const left = Math.min(2 - G.momentOfClarityPicks, 5 - G.powerCards.length);
    el.textContent = `${left} pick${left !== 1 ? 's' : ''} remaining`;
}

function closeClarityModal() {
    const modal = document.getElementById('clarity-modal');
    if (modal) modal.classList.add('hidden');
    G.momentOfClarityCards = null;
    G.momentOfClarityPicks = 0;
}

// ============================================================
// STARTUP
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    initGame();
    populateDevPanel();
});

window.addEventListener('keydown', e => {
    if (e.key === 't' || e.key === 'T') toggleDevPopup();
});
