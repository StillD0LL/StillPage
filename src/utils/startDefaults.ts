import { StartBackgroundPreset, StartPageConfig, StartQuickLink, StartVideoItem } from '../types/start';

export const DEFAULT_START_QUICK_LINKS: StartQuickLink[] = [
  {
    id: 'link-github',
    title: 'GitHub',
    url: 'https://github.com',
    icon: 'https://github.githubassets.com/favicons/favicon.png',
    color: '#6366f1',
    category: 'Development',
  },
  {
    id: 'link-chatgpt',
    title: 'ChatGPT',
    url: 'https://chat.openai.com',
    icon: 'https://chatgpt.com/favicon.ico',
    color: '#10b981',
    category: 'AI Assistant',
  },
  {
    id: 'link-youtube',
    title: 'YouTube',
    url: 'https://youtube.com',
    icon: 'https://www.youtube.com/s/desktop/f71253a4/img/favicon_144x144.png',
    color: '#ef4444',
    category: 'Media',
  },
  {
    id: 'link-notion',
    title: 'Notion',
    url: 'https://notion.so',
    icon: 'https://www.notion.so/front-static/favicon.ico',
    color: '#8b5cf6',
    category: 'Workspace',
  },
  {
    id: 'link-figma',
    title: 'Figma',
    url: 'https://figma.com',
    icon: 'https://static.figma.com/app/icon/1/favicon.ico',
    color: '#ec4899',
    category: 'Design',
  },
  {
    id: 'link-spotify',
    title: 'Spotify',
    url: 'https://open.spotify.com',
    icon: 'https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico',
    color: '#22c55e',
    category: 'Music',
  },
];

export const START_BACKGROUND_PRESETS: StartBackgroundPreset[] = [
  {
    id: 'preset-default-yt',
    title: 'Default Ambient Video',
    category: 'minimal',
    type: 'video',
    url: 'https://youtu.be/zj7EGnq8g50',
    thumbnail: 'https://img.youtube.com/vi/zj7EGnq8g50/hqdefault.jpg',
    poster: 'https://img.youtube.com/vi/zj7EGnq8g50/maxresdefault.jpg',
    suggestedTitle: 'Welcome Home',
    suggestedSubtitle: 'Your central command deck, creative atelier, and digital sanctuary.',
    overlayDim: 30,
    overlayBlur: 0,
    titleGradient: 'from-white via-zinc-100 to-zinc-300',
  },
];

export const DEFAULT_START_CONFIG: StartPageConfig = {
  title: 'Welcome Home',
  subtitle: 'Your central command deck, creative atelier, and digital sanctuary.',
  useDynamicGreeting: true,
  customGreetingName: 'Explorer',
  titleFont: 'display',
  titleSize: 'xl',
  titleGradient: 'from-white via-zinc-100 to-zinc-300',
  subtitleColor: '#e4e4e7',
  textAlignment: 'center',
  textShadow: 'cinema',

  // Background media (Always Video)
  backgroundType: 'video',
  backgroundUrl: 'https://youtu.be/zj7EGnq8g50',
  backgroundPoster: 'https://img.youtube.com/vi/zj7EGnq8g50/maxresdefault.jpg',
  backgroundFit: 'cover',
  videoAutoplay: true,
  videoLoop: true,
  videoMuted: true,
  videoVolume: 0.5,

  // Multi-video playlist & sequence playback
  videoPlaylist: [
    {
      id: 'preset-default-yt',
      title: 'Default Ambient Video',
      url: 'https://youtu.be/zj7EGnq8g50',
      thumbnail: 'https://img.youtube.com/vi/zj7EGnq8g50/hqdefault.jpg',
      poster: 'https://img.youtube.com/vi/zj7EGnq8g50/maxresdefault.jpg',
      sourceType: 'preset',
    },
  ],
  currentVideoIndex: 0,
  videoAutoplayNext: false,
  videoLoopPlaylist: true,
  videoShuffle: false,

  // Overlay effects
  overlayDim: 30,
  overlayBlur: 0,
  overlayVignette: true,
  overlayColor: '#000000',

  // Cyber dust motes & atmospheric particles
  ambientParticles: true,
  particleType: 'cyber-dust',
  particleDensity: 35,
  particleSpeed: 2,
  particleColor: '#38bdf8',

  // 2.5D Interactive mouse parallax
  parallaxEnabled: true,
  parallaxIntensity: 12,

  // Modern starter components
  showClock: true,
  clockFormat: '12h',
  showSeconds: false,
  showDate: true,
  showSearchBar: true,
  showQuickLinks: true,
  showAppShortcuts: false,
  showWeatherGlance: true,
  showDailyQuote: true,
  customQuoteText: 'The secret of getting ahead is getting started.',
  customQuoteAuthor: 'Mark Twain',

  quickLinks: DEFAULT_START_QUICK_LINKS,
  selectedPresetId: 'preset-default-yt',
};

export const TITLE_GRADIENTS = [
  { id: 'grad-pure-white', label: 'Pure Diamond White', value: 'from-white via-zinc-100 to-zinc-300', preview: '#ffffff' },
  { id: 'grad-cyber-holo', label: 'Cyber Hologram', value: 'from-cyan-300 via-teal-200 to-indigo-300', preview: '#22d3ee' },
  { id: 'grad-golden-sunset', label: 'Sunset Amber Gold', value: 'from-amber-200 via-orange-200 to-rose-300', preview: '#fbbf24' },
  { id: 'grad-aurora-emerald', label: 'Aurora Emerald', value: 'from-emerald-200 via-teal-100 to-cyan-300', preview: '#34d399' },
  { id: 'grad-amethyst-neon', label: 'Amethyst Neon', value: 'from-fuchsia-300 via-pink-200 to-purple-300', preview: '#e879f9' },
  { id: 'grad-sky-azure', label: 'Azure Sky Breeze', value: 'from-sky-200 via-blue-100 to-indigo-300', preview: '#38bdf8' },
  { id: 'grad-crimson-blaze', label: 'Crimson Flame', value: 'from-rose-300 via-red-200 to-orange-300', preview: '#f43f5e' },
  { id: 'grad-titanium-silver', label: 'Titanium Metallic', value: 'from-zinc-100 via-slate-300 to-zinc-400', preview: '#94a3b8' },
];

export const INSPIRATIONAL_QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Creativity is intelligence having fun.', author: 'Albert Einstein' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'Make each day your masterpiece.', author: 'John Wooden' },
  { text: 'Mastery is not an accident. It is deliberate devotion.', author: 'Zen Proverb' },
];
