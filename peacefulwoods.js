// Peaceful Woods encounters — triggered when the Face of Stone restores the forest.
// Each entry has only id, title, and description. No effects, no choices.
// Rendering is handled by showPeacefulEncounter() in game.js.

const PEACEFUL_ENCOUNTERS = [
    {
        id: 'pw_old_mountains',
        title: 'The Oldest Mountains',
        description: 'The Appalachian Mountains, which form the backbone of West Virginia\'s forests, are among the oldest mountain ranges on Earth.'
    },
    {
        id: 'pw_sugar_maple',
        title: 'State Tree',
        description: 'The sugar maple is West Virginia\'s state tree. In autumn, its leaves turn vivid shades of red, orange, and gold. The sap runs sweet in early spring before a single leaf appears.'
    },
    {
        id: 'pw_monongahela',
        title: 'The Monongahela',
        description: 'The Monongahela National Forest, established in 1920, spans roughly 919,000 acres across ten counties in eastern West Virginia. It contains the headwaters of several major rivers, all beginning as small, cold streams in the highlands.'
    },
    {
        id: 'pw_dolly_sods',
        title: 'Dolly Sods',
        description: 'The Dolly Sods Wilderness in Tucker County sits at over 4,000 feet in elevation. Its open heathlands and wind-sculpted spruce forests resemble landscapes more typical of Canada. On a clear day, the sky seems wider here than anywhere else.'
    },
    {
        id: 'pw_spruce_knob',
        title: 'Spruce Knob',
        description: 'Spruce Knob is the highest point in West Virginia at 4,863 feet above sea level. The red spruce trees near its summit grow bent and trailing in one direction. It has been shaped over decades by the prevailing wind.'
    },
    {
        id: 'pw_salamanders',
        title: 'Salamanders',
        description: 'West Virginia\'s forests are home to a remarkable diversity of salamanders. The southern Appalachians contain more species of salamander per square mile than anywhere else on Earth. Most live their entire lives beneath a single log.'
    },
    {
        id: 'pw_black_bears',
        title: 'Black Bears',
        description: 'Black bears are thriving in West Virginia\'s forests. The state\'s population has grown steadily, with bears now present in every county. They are shy and largely unbothered by the sound of a person moving carefully through the trees.'
    },
    {
        id: 'pw_ginseng',
        title: 'Wild Ginseng',
        description: 'American ginseng grows naturally in West Virginia\'s cool, shaded forest floors. It has been harvested here for centuries. '
    },
    {
        id: 'pw_fireflies',
        title: 'Fireflies',
        description: 'Each summer, West Virginia\'s clearings and forest edges come alive with fireflies. Their bioluminescent flashes are used to attract mates. Each species has its own unique pattern of light and timing.'
    },
    {
        id: 'pw_new_river',
        title: 'The New River',
        description: 'Despite its name, the New River is one of the oldest rivers in North America. It is possibly 65 million years old. The forests that line its gorge have grown largely undisturbed for centuries, sheltering species found nowhere else in the region.'
    },
    {
        id: 'pw_whitetail',
        title: 'White-Tailed Deer',
        description: 'White-tailed deer are the most commonly seen large mammal in West Virginia\'s forests. They move most often at dawn and dusk, stepping quietly through the underbrush with a stillness that seems almost deliberate.'
    },
    {
        id: 'pw_birdsong',
        title: 'Birdsong',
        description: 'West Virginia\'s forests fill with birdsong from before sunrise. Wood thrushes, red-eyed vireos, ovenbirds, and scarlet tanagers layer their calls over one another. By midmorning the chorus softens, but never fully stops.'
    },
    {
        id: 'pw_autumn',
        title: 'Autumn Color',
        description: 'Every autumn, West Virginia\'s forests undergo a transformation as chlorophyll breaks down and hidden pigments emerge in the leaves.'
    },
    {
        id: 'pw_old_growth',
        title: 'Old Growth',
        description: 'Small patches of old-growth forest survive in West Virginia, with trees that are hundreds of years old. These ancient stands are rare remnants of the vast, unbroken forest that once stretched across the entire eastern continent.'
    },
    {
        id: 'pw_coverage',
        title: 'Deep Woodland',
        description: 'West Virginia is one of the most densely forested states in the country, with over 12 million acres of woodlands covering roughly 79% of its land area.'
    },
    {
        id: 'pw_wild_turkey',
        title: 'Wild Turkey',
        description: 'Wild turkeys were nearly eliminated from West Virginia in the early twentieth century. They are now common across the state thanks to reintroduction efforts.'
    },
    {
        id: 'pw_ramps',
        title: 'Ramps',
        description: 'Ramps are a wild onion that grows in dense patches on moist forest floors throughout West Virginia each spring. They have been harvested and eaten here for centuries. Entire festivals are held in their honor.'
    },
    {
        id: 'pw_brook_trout',
        title: 'Brook Trout',
        description: 'The brook trout is the only trout native to West Virginia. It requires cold, clean, well-oxygenated water and is found in high-elevation mountain streams. Its presence is considered a sign of a healthy watershed.'
    },
    {
        id: 'pw_mountain_laurel',
        title: 'Mountain Laurel',
        description: 'Mountain laurel is West Virginia\'s state flower. It blooms in late spring, covering rocky hillsides and forest edges in clusters of white and pink. The flowers are toxic to most animals, but the plant thrives undisturbed for decades.'
    },
    {
        id: 'pw_chestnut',
        title: 'American Chestnut',
        description: 'The American chestnut once dominated West Virginia\'s forests, making up roughly a quarter of all canopy trees. A blight introduced in the early 1900s killed nearly four billion of them within fifty years. Efforts to restore the species are ongoing. Curiously, the forest around you now seems to be full of them.'
    },
    {
        id: 'pw_pawpaw',
        title: 'Pawpaw',
        description: 'The pawpaw is the largest fruit native to North America. It grows in shaded river bottoms and forest edges throughout West Virginia. Its flavor has been described as a cross between banana and mango. It does not keep well and is rarely sold commercially.'
    },
    {
        id: 'pw_fog',
        title: 'Mountain Fog',
        description: 'Fog is a regular feature of West Virginia\'s mountain valleys. Cold air settles overnight into the lower elevations, and by morning the hollows are filled with a low mist that burns off slowly as the sun rises above the ridgelines.'
    },
    {
        id: 'pw_timber_rattlesnake',
        title: 'Timber Rattlesnake',
        description: 'The timber rattlesnake is the largest venomous snake in West Virginia. It is secretive and rarely encountered. It prefers rocky outcrops and wooded hillsides, and spends much of its life motionless.'
    },
    {
        id: 'pw_monarch',
        title: 'Monarch Butterfly',
        description: 'Each autumn, monarch butterflies pass through West Virginia on their migration south to Mexico. They gather in large numbers along ridgelines and in open forest clearings, resting before continuing on a journey of over two thousand miles.'
    },
    {
        id: 'pw_coyote',
        title: 'Coyote',
        description: 'Coyotes are a relatively recent arrival in West Virginia, moving east as wolf populations declined. They are now present throughout the state. Their calls, a series of yips and howls, carry far through the forest at night.'
    },
    {
        id: 'pw_great_horned_owl',
        title: 'Great Horned Owl',
        description: 'The great horned owl is the largest owl in West Virginia. It begins nesting in January, often in the middle of winter, taking over the abandoned nests of hawks and crows. Its deep, rhythmic call is one of the first sounds of the new year.'
    },
    {
        id: 'pw_lichen',
        title: 'Lichen',
        description: 'Lichens grow on rocks and tree bark throughout West Virginia\'s forests. Each one is a partnership between a fungus and an alga. They are among the slowest-growing organisms in the world and among the most resilient.'
    },
    {
        id: 'pw_watersheds',
        title: 'Watersheds',
        description: 'West Virginia sits on the Eastern Continental Divide. Rain falling on opposite sides of the same ridge drains into entirely different river systems — one flowing toward the Gulf of Mexico, the other toward the Atlantic Ocean.'
    },
    {
        id: 'pw_blueberries',
        title: 'Wild Blueberries',
        description: 'Wild blueberries grow at higher elevations across West Virginia, particularly in exposed heath barrens and along rocky ridges. The berries ripen in midsummer. They are smaller and more tart than cultivated varieties.'
    },
    {
        id: 'pw_ferns',
        title: 'Ferns',
        description: 'Ferns carpet the floors of many West Virginia forests, particularly in moist hollows and along stream banks. Some species, like the cinnamon fern and the interrupted fern, have changed very little in millions of years.'
    },
    {
        id: 'pw_luna_moth',
        title: 'Luna Moth',
        description: 'The luna moth is one of the largest moths in North America. It lives for only about a week as an adult and does not eat. It has no mouth. It spends its brief life in the forest canopy, emerging at night.'
    },
    {
        id: 'pw_river_otter',
        title: 'River Otter',
        description: 'River otters were once abundant in West Virginia but were eliminated by trapping and habitat loss. Reintroduction efforts in the 1980s and 1990s successfully restored them to several river systems, where they are now breeding on their own.'
    },
    {
        id: 'pw_bloodroot',
        title: 'Bloodroot',
        description: 'Bloodroot is one of the earliest wildflowers to bloom in West Virginia\'s forests, often appearing before the last snow has melted. Its white petals last only a day or two. The root produces a vivid red-orange sap that was used as dye for centuries.'
    },
    {
        id: 'pw_flying_squirrel',
        title: 'Flying Squirrel',
        description: 'Two species of flying squirrel live in West Virginia\'s forests. They do not actually fly. They glide using a membrane stretched between their limbs. They are entirely nocturnal and rarely seen, though they are more common than most people realize.'
    },
    {
        id: 'pw_box_turtle',
        title: 'Eastern Box Turtle',
        description: 'The eastern box turtle is one of the most recognizable animals in West Virginia\'s forests. It can live for over a hundred years. Each turtle spends its entire life within a home range of only a few acres, returning to the same spots year after year.'
    },
    {
        id: 'pw_moss',
        title: 'Moss',
        description: 'Mosses grow on rocks, logs, and soil throughout West Virginia\'s forests. They have no roots and absorb water directly through their leaves. In wet weather they are a deep, saturated green. In dry conditions they shrink and go dormant.'
    },
    {
        id: 'pw_harpers_ferry',
        title: 'Harpers Ferry',
        description: 'Harpers Ferry, where the Shenandoah meets the Potomac, sits at the eastern edge of West Virginia\'s forested highlands. The Appalachian Trail passes directly through town. Thomas Jefferson once called the view from the cliffs above it one of the most stupendous scenes in nature.'
    },
];
