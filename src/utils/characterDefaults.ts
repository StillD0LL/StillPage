import { CharacterProfile, CharacterSection } from '../types';

export const CHARACTER_THEME_COLORS = [
  { id: 'slate', name: 'Wikipedia Classic Slate', color: '#475569', light: '#f8fafc', dark: '#1e293b' },
  { id: 'indigo', name: 'Royal Indigo', color: '#6366f1', light: '#eef2ff', dark: '#1e1b4b' },
  { id: 'crimson', name: 'Imperial Crimson', color: '#e11d48', light: '#fff1f2', dark: '#4c0519' },
  { id: 'emerald', name: 'Verdant Emerald', color: '#059669', light: '#ecfdf5', dark: '#022c22' },
  { id: 'amber', name: 'Solar Gold', color: '#d97706', light: '#fffbeb', dark: '#451a03' },
  { id: 'amethyst', name: 'Mystic Purple', color: '#9333ea', light: '#faf5ff', dark: '#3b0764' },
  { id: 'sky', name: 'Aether Sky', color: '#0284c7', light: '#f0f9ff', dark: '#082f49' },
  { id: 'rose', name: 'Sakura Rose', color: '#db2777', light: '#fdf2f8', dark: '#500724' },
];

export interface PresetAvatar {
  id: string;
  category: 'fantasy' | 'scifi' | 'modern' | 'royalty' | 'anime' | 'creature';
  label: string;
  url: string;
  emoji: string;
  caption: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'pa-scholar',
    category: 'fantasy',
    label: 'Scholar / Arcane Mage',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    emoji: '🧙‍♂️',
    caption: 'Canonical archive portrait in academic regalia',
  },
  {
    id: 'pa-warrior',
    category: 'fantasy',
    label: 'Knight / Vanguard Warrior',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    emoji: '🗡️',
    caption: 'Official field combat illustration',
  },
  {
    id: 'pa-cyber',
    category: 'scifi',
    label: 'Cyber Operative / Netrunner',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    emoji: '⚡',
    caption: 'Augmented optic telemetry portrait',
  },
  {
    id: 'pa-noble',
    category: 'royalty',
    label: 'Imperial Sovereign / Monarch',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    emoji: '👑',
    caption: 'Imperial coronation portrait',
  },
  {
    id: 'pa-rogue',
    category: 'fantasy',
    label: 'Shadow Scout / Assassin',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
    emoji: '🏹',
    caption: 'Cloaked observation record from the Outer Ring',
  },
  {
    id: 'pa-detective',
    category: 'modern',
    label: 'Noir Detective / Investigator',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    emoji: '🕵️',
    caption: 'Bureau personnel file photograph',
  },
  {
    id: 'pa-pilot',
    category: 'scifi',
    label: 'Starship Commander / Pilot',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    emoji: '🚀',
    caption: 'Fleet Academy officer portrait',
  },
  {
    id: 'pa-sorceress',
    category: 'fantasy',
    label: 'High Priestess / Mystic',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    emoji: '🔮',
    caption: 'Sanctuary ceremonial portrait',
  },
  {
    id: 'pa-alchemist',
    category: 'fantasy',
    label: 'Master Alchemist / Inventor',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80',
    emoji: '🧪',
    caption: 'Workshop laboratory record',
  },
  {
    id: 'pa-cyberpunk-drifter',
    category: 'scifi',
    label: 'Neon Street Mercenary',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
    emoji: '🌆',
    caption: 'District 9 surveillance capture',
  },
];

export const CHARACTER_PRESET_EMOJIS = [
  '🧙‍♂️', '🧝‍♀️', '🗡️', '🛡️', '⚡', '👑', '🏹', '🕵️', '🚀', '🔮',
  '🧪', '🦾', '🐉', '🦊', '🐺', '🐱', '🤖', '💀', '🧛‍♂️', '🧜‍♀️',
  '🥷', '🧑‍🔬', '🧑‍🚀', '👤', '🌟', '🌙', '🔥', '❄️', '🌿', '💎'
];

export const createDefaultCharacterProfile = (customName?: string): CharacterProfile => {
  const name = customName || 'Kaelen "Kael" Vance';
  return {
    name,
    japaneseOrAltName: 'カエレン・ヴァンス / Kael of the Silver Resonance',
    titleOrEpithet: 'Chief Harmonic Scholar of the Astral Tower',
    pronunciation: '[ˈkeɪ.lən væns]',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    avatarEmoji: '🧙‍♂️',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    themeColor: '#6366f1',
    summaryLead: `${name} is the primary protagonist of the Resonance Chronicles. A renowned natural philosopher and acoustical researcher, he is known across the Grand Archive for his discovery of the sub-harmonic quartz frequency and his investigation into the pre-calamity Void Leylines.`,
    status: 'Alive',
    speciesOrRace: 'Human (Resonance Adept)',
    gender: 'Male',
    age: '27',
    birthday: '14th of Frostfall',
    height: '182 cm (5\'11½")',
    weight: '73 kg (161 lbs)',
    hairColor: 'Obsidian Black',
    eyeColor: 'Lapis Lazuli (Silver flecked)',
    occupation: 'Lead Archivist & Field Acousticist',
    affiliations: 'Grand Archive of Oakhaven, Resonance Guild §4',
    alignment: 'Neutral Good',
    voiceActor: 'Kenjiro Tsuda (JP) / Ray Chase (EN)',
    customInfoboxFields: [
      { id: 'cfield-1', label: 'Signature Weapon', value: 'Harmonic Tuning Rapier "Aethelgard"', category: 'combat' },
      { id: 'cfield-2', label: 'Resonance Tier', value: 'Apex Grade IV (432.4 Hz)', category: 'combat' },
      { id: 'cfield-3', label: 'Known Relic', value: 'Tourmaline Pocket Resonator', category: 'general' },
      { id: 'cfield-4', label: 'Homeland', value: 'The Upper Terraces of Valdoria', category: 'general' },
    ],
    sections: [
      {
        id: 'sec-appearance',
        title: 'Appearance & Attire',
        content: `Kael is a tall, slender man in his late twenties with an athletic scholar's build. He has jet-black hair kept loosely parted and sharp, contemplative lapis-blue eyes that faintly glimmer with silver when channeling acoustic frequencies.\n\nHe typically wears a charcoal high-collared trench coat lined with reinforced silk, adorned with the brass pins of the Archive Academy. A customized leather harness across his chest holds three calibration tuning forks and his notebook.`,
        type: 'text',
        isCustom: false,
      },
      {
        id: 'sec-personality',
        title: 'Personality & Traits',
        content: `Methodical, observant, and deeply curious, Kael approaches danger with the mindset of a scientific investigator rather than a combatant. While reserved in large social gatherings, he becomes passionately animated when discussing resonance harmonics or ancient architectural blueprints.\n\nDespite his academic detachment, he harbors a strong moral compass and refuses to weaponize resonance technology against civilian populations.`,
        type: 'text',
        isCustom: false,
      },
      {
        id: 'sec-biography',
        title: 'History & Biography',
        content: `Born in the Upper Terraces of Valdoria, Kael showed an early sensitivity to acoustic reverberations, capable of detecting structural micro-fractures in city foundations before sensor instruments could record them.\n\nAt age nineteen, he was accepted into the High Archive, where he authored *Acoustic Harmonics of the Pre-Calamity Era*. His recent field assignment to the Old Quarter triggered the reactivation of the dormant Grand Leyline, plunging him into the epicenter of the continental crisis.`,
        type: 'text',
        isCustom: false,
      },
      {
        id: 'sec-abilities',
        title: 'Abilities & Combat Style',
        content: `Unlike conventional spellcasters, Kael manipulates kinetic waves and physical frequencies using sound waves and vibration matrices. He can disrupt metallic weapon balances, generate sound barrier shields, and analyze building weak points in real-time.`,
        type: 'stats',
        isCustom: false,
      },
      {
        id: 'sec-relationships',
        title: 'Key Relationships',
        content: 'Overview of known allies, mentors, and rivals across the Archive and city factions.',
        type: 'relationships',
        isCustom: false,
      },
      {
        id: 'sec-timeline',
        title: 'Story Timeline & Milestones',
        content: 'Chronological sequence of key canonical story events.',
        type: 'timeline',
        isCustom: false,
      },
      {
        id: 'sec-quotes',
        title: 'Notable Quotes',
        content: 'Memorable dialogue and quotes from canonical appearances.',
        type: 'quotes',
        isCustom: false,
      },
      {
        id: 'sec-trivia',
        title: 'Trivia & Behind the Scenes',
        content: 'Interesting lore details, development notes, and easter eggs.',
        type: 'trivia',
        isCustom: false,
      },
    ],
    relationships: [
      {
        id: 'rel-1',
        characterName: 'Archivist Evelyn Vance',
        relationType: 'Grandmother & Mentor',
        description: 'Former Grand Archivist who taught Kael the fundamentals of harmonic tuning and gifted him the Aethelgard rapier.',
        avatarEmoji: '👵',
      },
      {
        id: 'rel-2',
        characterName: 'Commander Soren Drake',
        relationType: 'Reluctant Ally / Rival',
        description: 'Captain of the City Vanguard. Frequently clashes with Kael over military requisition of resonance crystals.',
        avatarEmoji: '🛡️',
      },
      {
        id: 'rel-3',
        characterName: 'Lyra Moon',
        relationType: 'Companion & Smuggler',
        description: 'Underground navigator who provides Kael safe passage into restricted subterranean ruins.',
        avatarEmoji: '🗡️',
      },
    ],
    quotes: [
      {
        id: 'quote-1',
        quote: 'The world is not made of solid stone; it is merely a song that has slowed down enough to be touched.',
        context: 'Chapter 2, addressing the Archive Council',
      },
      {
        id: 'quote-2',
        quote: 'If you strike the crystal with hatred, you will only hear your own violence echoed back at you.',
        context: 'Field Notes, Vol. III',
      },
    ],
    timeline: [
      {
        id: 'tl-1',
        period: 'Year 312 (Age 7)',
        title: 'Acoustic Awakening',
        description: 'Discovers his harmonic sensitivity during the Great Bell Resonance in Valdoria.',
      },
      {
        id: 'tl-2',
        period: 'Year 324 (Age 19)',
        title: 'Archive Induction',
        description: 'Graduates at the top of the Academy with the thesis on sub-harmonic quartz drift.',
      },
      {
        id: 'tl-3',
        period: 'Year 332 (Present)',
        title: 'The Old Quarter Anomaly',
        description: 'Records the first 432.4 Hz continuous frequency signal in three centuries.',
      },
    ],
    stats: [
      { id: 'stat-1', label: 'Resonance Affinity', value: 94 },
      { id: 'stat-2', label: 'Intellect & Deduction', value: 92 },
      { id: 'stat-3', label: 'Field Agility', value: 76 },
      { id: 'stat-4', label: 'Close Combat', value: 68 },
      { id: 'stat-5', label: 'Charisma & Diplomacy', value: 70 },
      { id: 'stat-6', label: 'Acoustic Defense', value: 88 },
    ],
    gallery: [
      {
        id: 'gal-1',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        caption: 'Formal portrait in Archive ceremonial uniform',
      },
      {
        id: 'gal-2',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        caption: 'Field research in the Old Quarter Terraces',
      },
    ],
    trivia: [
      'Kael has perfect acoustic pitch and can identify any alloy composition simply by tapping it with a fingernail.',
      'His favorite drink is roasted chicory tea with a drop of wild mountain honey.',
      'The rapier *Aethelgard* was forged from meteorite iron that resonates at a natural D-minor harmonic.',
      'His design was initially inspired by classic Victorian naturalists blended with modern speculative fiction.',
    ],
  };
};

export const CHARACTER_PRESET_TEMPLATES: Array<{
  id: string;
  name: string;
  badge: string;
  description: string;
  createProfile: () => CharacterProfile;
}> = [
  {
    id: 'hero-scholar',
    name: 'Resonance Scholar (Protagonist)',
    badge: 'Sci-Fi / Fantasy',
    description: 'A deep, intellectual protagonist with lore, harmonic powers, timeline milestones, and quotes.',
    createProfile: () => createDefaultCharacterProfile('Kaelen "Kael" Vance'),
  },
  {
    id: 'cyber-detective',
    name: 'Cyberpunk Noir Detective',
    badge: 'Sci-Fi Cyber',
    description: 'A streetwise private eye with neural implants, underworld contacts, and investigative cases.',
    createProfile: () => ({
      name: 'Maya "Viper" Lin',
      japaneseOrAltName: 'マヤ・リン / Operative #772',
      titleOrEpithet: 'Independent Neural Investigator',
      pronunciation: '[ˈmaɪ.ə lɪn]',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      avatarEmoji: '⚡',
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
      themeColor: '#0284c7',
      summaryLead: `Maya "Viper" Lin is an ex-Megacorp security officer turned freelance neural detective operating out of the Lower District of Neo-Shibuya. Known for her customized cybernetic eye and encrypted memory decks.`,
      status: 'Alive',
      speciesOrRace: 'Cyborg Human',
      gender: 'Female',
      age: '31',
      birthday: 'November 9',
      height: '175 cm (5\'9")',
      weight: '68 kg (augmented)',
      hairColor: 'Electric Cyan / Undercut',
      eyeColor: 'Amber Optics (Left) / Brown (Right)',
      occupation: 'Private Investigator / Data Recovery',
      affiliations: 'Independent (Formerly Arasaka Tech Security)',
      alignment: 'Chaotic Good',
      voiceActor: 'Laura Bailey / Romi Park',
      customInfoboxFields: [
        { id: 'f-1', label: 'Primary Cyberware', value: 'Ocular HUD Mk. IV, Subdermal Armor', category: 'combat' },
        { id: 'f-2', label: 'Signature Weapon', value: 'Silenced 10mm "Nightfall" Pistol', category: 'combat' },
        { id: 'f-3', label: 'Vehicle', value: 'Kusanagi CT-3X Turbo Bike', category: 'general' },
      ],
      sections: [
        {
          id: 'sec-appearance',
          title: 'Appearance & Augmentations',
          content: 'Maya sports a cybernetic left eye with an orange optical aperture and a sleek reinforced leather jacket with neon thermal piping.',
          type: 'text',
        },
        {
          id: 'sec-personality',
          title: 'Personality & Modus Operandi',
          content: 'Cynical on the exterior with a dry sense of humor, yet fiercely protective of street orphans and rogue AI refugees.',
          type: 'text',
        },
        {
          id: 'sec-abilities',
          title: 'Combat & Hacking Capabilities',
          content: 'Specialized in optical camouflage, close-quarters gun-fu, and high-speed ICE breaking.',
          type: 'stats',
        },
        {
          id: 'sec-relationships',
          title: 'Underworld Network',
          content: 'Informants, black-market ripperdocs, and former corporate partners.',
          type: 'relationships',
        },
        {
          id: 'sec-quotes',
          title: 'Famous Lines',
          content: 'Quotes from crime scene investigations and rooftop standoffs.',
          type: 'quotes',
        },
        {
          id: 'sec-trivia',
          title: 'Trivia',
          content: 'Fun details about her habits, favorite synth-ramen spots, and firmware upgrades.',
          type: 'trivia',
        },
      ],
      relationships: [
        {
          id: 'r-1',
          characterName: 'Doc Zhang',
          relationType: 'Ripperdoc & Confidant',
          description: 'Runs an underground clinic in Sector 4; maintains Maya’s optical augments for free.',
          avatarEmoji: '💉',
        },
        {
          id: 'r-2',
          characterName: 'Executive Kuroda',
          relationType: 'Former Boss / Archenemy',
          description: 'Head of Megacorp Counter-Intel who placed a bounty on Maya after her defection.',
          avatarEmoji: '👔',
        },
      ],
      quotes: [
        {
          id: 'q-1',
          quote: 'In this city, memories are the only currency nobody can counterfeit without leaving blood on the chip.',
          context: 'Neon Alley, Act I',
        },
      ],
      timeline: [
        {
          id: 't-1',
          period: '2085',
          title: 'Corporate Enlistment',
          description: 'Recruited into Arasaka Elite Security division.',
        },
        {
          id: 't-2',
          period: '2092',
          title: 'The Whistleblower Incident',
          description: 'Refuses orders to purge civilian data logs; destroys corporate mainframe and flees underground.',
        },
      ],
      stats: [
        { id: 's-1', label: 'ICE Hacking', value: 95 },
        { id: 's-2', label: 'Marksmanship', value: 88 },
        { id: 's-3', label: 'Stealth & Infiltration', value: 85 },
        { id: 's-4', label: 'Streetwise Contacts', value: 90 },
        { id: 's-5', label: 'Physical Durability', value: 72 },
      ],
      gallery: [],
      trivia: [
        'Drinks black synthetic coffee with two sugar cubes before every night patrol.',
        'Her cybernetic eye has a 40x optical zoom with ultraviolet spectrum overlay.',
      ],
    }),
  },
  {
    id: 'fantasy-villain',
    name: 'Shadow Sovereign (Antagonist)',
    badge: 'Dark Fantasy',
    description: 'An imposing dark fantasy sovereign with royal title, occult power bars, and tragic backstory.',
    createProfile: () => ({
      name: 'Lord Morvath the Undying',
      japaneseOrAltName: 'モルヴァス卿 / The Obsidian Monarch',
      titleOrEpithet: 'Sovereign of the Shattered Eclipse',
      pronunciation: '[ˈmɔːr.væθ]',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
      avatarEmoji: '👑',
      bannerUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
      themeColor: '#e11d48',
      summaryLead: `Lord Morvath the Undying is the main antagonist of the Eclipse Era. Former champion of the Sun Court who embraced the forbidden Obsidian Flame after the betrayal of the High Council.`,
      status: 'Immortal (Bound to the Eclipse Core)',
      speciesOrRace: 'Ascended Fallen Celestial',
      gender: 'Male',
      age: 'Over 600 years',
      birthday: 'The Dark Solstice',
      height: '210 cm (6\'11")',
      weight: '115 kg',
      hairColor: 'Silver Ash',
      eyeColor: 'Crimson Glow',
      occupation: 'Ruler of the Void Citadel',
      affiliations: 'The Black Sun Dominion',
      alignment: 'Lawful Evil',
      voiceActor: 'Liam O’Brien',
      customInfoboxFields: [
        { id: 'f-1', label: 'Great Weapon', value: 'Greatsword "Soul Cleaver"', category: 'combat' },
        { id: 'f-2', label: 'Magic Domain', value: 'Netherflame & Gravity Singularity', category: 'combat' },
        { id: 'f-3', label: 'Seat of Power', value: 'The Obsidian Spire', category: 'general' },
      ],
      sections: [
        {
          id: 'sec-appearance',
          title: 'Appearance & Armor',
          content: 'Towering over mortal warriors, Morvath wears jagged ebony plate armor etched with glowing crimson runes.',
          type: 'text',
        },
        {
          id: 'sec-personality',
          title: 'Philosophy & Motives',
          content: 'Believes true peace can only be achieved through absolute order and the elimination of mortal discord.',
          type: 'text',
        },
        {
          id: 'sec-abilities',
          title: 'Powers & Dominion',
          content: 'Commands gravity wells, netherfire explosions, and absolute telepathic subjugation.',
          type: 'stats',
        },
        {
          id: 'sec-relationships',
          title: 'Generals & Nemeses',
          content: 'The Four Void Generals and his fated mortal rival.',
          type: 'relationships',
        },
        {
          id: 'sec-quotes',
          title: 'Royal Decrees & Quotes',
          content: 'Famous speeches from the throne room.',
          type: 'quotes',
        },
        {
          id: 'sec-trivia',
          title: 'Trivia & Mythos',
          content: 'Ancient poems and forbidden legends recorded in lost scrolls.',
          type: 'trivia',
        },
      ],
      relationships: [
        {
          id: 'r-1',
          characterName: 'High Priestess Vespera',
          relationType: 'Grand Chancellor & Cult Leader',
          description: 'Oversees the summoning rituals and sacrificial rites of the Black Sun.',
          avatarEmoji: '🔮',
        },
      ],
      quotes: [
        {
          id: 'q-1',
          quote: 'You speak of justice as if the stars themselves take pity on the weak. The cosmos knows only gravity and strength.',
          context: 'Throne Room Confrontation',
        },
      ],
      timeline: [
        {
          id: 't-1',
          period: 'Age of Dawn (Year 0)',
          title: 'The Great Betrayal',
          description: 'Banished into the Void Rift by the Seven Archons.',
        },
        {
          id: 't-2',
          period: 'Year 590',
          title: 'The Return',
          description: 'Shatters the Astral Seal and descends upon the Eastern Kingdom.',
        },
      ],
      stats: [
        { id: 's-1', label: 'Nether Magic', value: 99 },
        { id: 's-2', label: 'Physical Strength', value: 96 },
        { id: 's-3', label: 'Strategic Command', value: 94 },
        { id: 's-4', label: 'Intimidation & Aura', value: 98 },
        { id: 's-5', label: 'Mercy', value: 5 },
      ],
      gallery: [],
      trivia: [
        'His heart was replaced by a fragment of a dying star during his ascension.',
        'Never sleeps or eats; sustains his form purely on spiritual resonance.',
      ],
    }),
  },
  {
    id: 'blank-character',
    name: 'Blank Wiki Sheet (Clean Slate)',
    badge: 'Starter Template',
    description: 'A clean, empty Wikipedia template with pre-built sections ready for your custom lore.',
    createProfile: () => ({
      name: 'Character Name',
      japaneseOrAltName: 'Alternate Name / Title',
      titleOrEpithet: 'The Title or Epithet',
      pronunciation: '[ˈnəm]',
      avatarUrl: '',
      avatarEmoji: '👤',
      themeColor: '#475569',
      summaryLead: `**Character Name** is a major character in the story...`,
      status: 'Alive',
      speciesOrRace: 'Human',
      gender: 'Unknown',
      age: '20',
      birthday: '',
      height: '',
      weight: '',
      hairColor: '',
      eyeColor: '',
      occupation: '',
      affiliations: '',
      alignment: 'True Neutral',
      voiceActor: '',
      customInfoboxFields: [
        { id: 'f-1', label: 'Signature Ability', value: 'Special Skill', category: 'combat' },
        { id: 'f-2', label: 'Homeland', value: 'Origin Realm', category: 'general' },
      ],
      sections: [
        {
          id: 'sec-appearance',
          title: 'Appearance',
          content: 'Describe physical features, clothing style, hair, expressions, and notable scars or accessories.',
          type: 'text',
        },
        {
          id: 'sec-personality',
          title: 'Personality',
          content: 'Describe character temperament, behavioral habits, virtues, flaws, and personal beliefs.',
          type: 'text',
        },
        {
          id: 'sec-biography',
          title: 'History & Background',
          content: 'Narrative history describing origins, childhood, major turning points, and current motivations.',
          type: 'text',
        },
        {
          id: 'sec-abilities',
          title: 'Abilities & Powers',
          content: 'Combat skills, magical affinities, passive strengths, and equipment.',
          type: 'stats',
        },
        {
          id: 'sec-relationships',
          title: 'Relationships',
          content: 'Friends, rivals, mentors, family members, and foes.',
          type: 'relationships',
        },
        {
          id: 'sec-timeline',
          title: 'Timeline',
          content: 'Chronological timeline of key moments in this character’s life.',
          type: 'timeline',
        },
        {
          id: 'sec-quotes',
          title: 'Quotes',
          content: 'Memorable dialogue and lines.',
          type: 'quotes',
        },
        {
          id: 'sec-trivia',
          title: 'Trivia',
          content: 'Interesting facts, behind-the-scenes notes, and lore details.',
          type: 'trivia',
        },
      ],
      relationships: [
        {
          id: 'r-1',
          characterName: 'Ally / Partner',
          relationType: 'Friend',
          description: 'Describe their dynamic and history together.',
          avatarEmoji: '🤝',
        },
      ],
      quotes: [
        {
          id: 'q-1',
          quote: 'Insert a memorable character quote here.',
          context: 'Chapter or Scene reference',
        },
      ],
      timeline: [
        {
          id: 't-1',
          period: 'Early Years',
          title: 'Origins',
          description: 'Early life and initial formative experience.',
        },
      ],
      stats: [
        { id: 's-1', label: 'Strength', value: 70 },
        { id: 's-2', label: 'Agility', value: 75 },
        { id: 's-3', label: 'Intelligence', value: 80 },
        { id: 's-4', label: 'Charisma', value: 65 },
      ],
      gallery: [],
      trivia: [
        'Add interesting trivia facts or design inspirations here.',
      ],
    }),
  },
];

/**
 * Converts a CharacterProfile object into a formatted Markdown string
 * for full-text search indexing, word counts, and plain text export.
 */
export const characterProfileToMarkdown = (profile: CharacterProfile): string => {
  let md = `# ${profile.name || 'Character Sheet'}\n`;
  if (profile.titleOrEpithet) md += `*${profile.titleOrEpithet}*\n`;
  if (profile.japaneseOrAltName) md += `**Alternate Name:** ${profile.japaneseOrAltName}\n`;
  md += `\n${profile.summaryLead || ''}\n\n`;

  md += `## Quick Information\n`;
  if (profile.status) md += `- **Status:** ${profile.status}\n`;
  if (profile.speciesOrRace) md += `- **Species/Race:** ${profile.speciesOrRace}\n`;
  if (profile.gender) md += `- **Gender:** ${profile.gender}\n`;
  if (profile.age) md += `- **Age:** ${profile.age}\n`;
  if (profile.birthday) md += `- **Birthday:** ${profile.birthday}\n`;
  if (profile.height) md += `- **Height:** ${profile.height}\n`;
  if (profile.weight) md += `- **Weight:** ${profile.weight}\n`;
  if (profile.occupation) md += `- **Occupation:** ${profile.occupation}\n`;
  if (profile.affiliations) md += `- **Affiliation:** ${profile.affiliations}\n`;
  if (profile.alignment) md += `- **Alignment:** ${profile.alignment}\n`;

  if (profile.customInfoboxFields && profile.customInfoboxFields.length > 0) {
    profile.customInfoboxFields.forEach((f) => {
      if (f.label && f.value) md += `- **${f.label}:** ${f.value}\n`;
    });
  }
  md += `\n`;

  if (profile.sections && profile.sections.length > 0) {
    profile.sections.forEach((sec) => {
      md += `## ${sec.title}\n${sec.content || ''}\n\n`;
    });
  }

  if (profile.stats && profile.stats.length > 0) {
    md += `### Power & Abilities Metrics\n`;
    profile.stats.forEach((st) => {
      md += `- **${st.label}:** ${st.value}/100\n`;
    });
    md += `\n`;
  }

  if (profile.relationships && profile.relationships.length > 0) {
    md += `## Relationships\n`;
    profile.relationships.forEach((r) => {
      md += `### ${r.characterName} (${r.relationType})\n${r.description || ''}\n\n`;
    });
  }

  if (profile.quotes && profile.quotes.length > 0) {
    md += `## Notable Quotes\n`;
    profile.quotes.forEach((q) => {
      md += `> "${q.quote}"\n> — *${q.context || profile.name}*\n\n`;
    });
  }

  if (profile.timeline && profile.timeline.length > 0) {
    md += `## Story Timeline\n`;
    profile.timeline.forEach((t) => {
      md += `### [${t.period}] ${t.title}\n${t.description}\n\n`;
    });
  }

  if (profile.trivia && profile.trivia.length > 0) {
    md += `## Trivia\n`;
    profile.trivia.forEach((tr, i) => {
      md += `${i + 1}. ${tr}\n`;
    });
    md += `\n`;
  }

  return md;
};

export const CHARACTER_TEMPLATES = CHARACTER_PRESET_TEMPLATES;
