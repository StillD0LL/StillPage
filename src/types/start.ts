export type StartBackgroundType = 'image' | 'video';

export type StartTextAlignment = 'center' | 'left' | 'right';

export type StartTitleFont = 'sans' | 'display' | 'serif' | 'mono' | 'cyber';

export type StartTitleSize = 'md' | 'lg' | 'xl' | '2xl';

export type StartTextShadow = 'none' | 'subtle' | 'glow' | 'cinema';

export type StartParticleType = 'cyber-dust' | 'hexagons' | 'embers' | 'sparks';

export interface StartQuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  color?: string;
  category?: string;
}

export interface StartVideoItem {
  id: string;
  title: string;
  url: string;
  poster?: string;
  thumbnail?: string;
  customMediaId?: string; // IndexedDB storage ID if local file
  customMediaName?: string;
  sourceType?: 'preset' | 'url' | 'local' | 'youtube' | 'vimeo';
  duration?: number;
  author?: string;
}

export interface StartBackgroundPreset {
  id: string;
  title: string;
  category: 'video' | 'nature' | 'cyberpunk' | 'anime' | 'space' | 'architecture' | 'minimal';
  type: StartBackgroundType;
  url: string;
  poster?: string;
  thumbnail: string;
  author?: string;
  suggestedTitle?: string;
  suggestedSubtitle?: string;
  overlayDim?: number;
  overlayBlur?: number;
  titleGradient?: string;
}

export interface StartPageConfig {
  title: string;
  subtitle: string;
  useDynamicGreeting: boolean;
  customGreetingName?: string;
  titleFont: StartTitleFont;
  titleSize: StartTitleSize;
  titleGradient: string;
  subtitleColor: string;
  textAlignment: StartTextAlignment;
  textShadow: StartTextShadow;

  // Background media
  backgroundType: StartBackgroundType;
  backgroundUrl: string;
  backgroundPoster?: string;
  backgroundFit: 'cover' | 'contain' | 'fill';
  videoAutoplay: boolean;
  videoLoop: boolean;
  videoMuted: boolean;
  videoVolume: number; // 0 to 1
  customMediaId?: string;
  customMediaName?: string;

  // Multi-video playlist & sequence playback
  videoPlaylist?: StartVideoItem[];
  currentVideoIndex?: number;
  videoAutoplayNext?: boolean; // Automatically advance to next video when current finishes
  videoLoopPlaylist?: boolean; // Loop playlist back to the beginning after the last video finishes
  videoShuffle?: boolean; // Shuffle play order

  // Visual filters & overlay
  overlayDim: number; // 0 to 100 percentage
  overlayBlur: number; // 0 to 30 pixels
  overlayVignette: boolean;
  overlayColor: string; // e.g. '#000000' or '#090d16'

  // Cyber dust motes & atmospheric particles
  ambientParticles?: boolean;
  particleType?: StartParticleType;
  particleDensity?: number; // 10 to 100
  particleSpeed?: number; // 1 to 5
  particleColor?: string;

  // 2.5D Interactive mouse parallax
  parallaxEnabled?: boolean;
  parallaxIntensity?: number; // 2 to 30

  // Component visibility
  showClock: boolean;
  clockFormat: '12h' | '24h';
  showSeconds: boolean;
  showDate: boolean;
  showSearchBar: boolean;
  showQuickLinks: boolean;
  showAppShortcuts: boolean;
  showWeatherGlance: boolean;
  showDailyQuote: boolean;
  customQuoteText?: string;
  customQuoteAuthor?: string;

  // Quick links & items
  quickLinks: StartQuickLink[];
  selectedPresetId?: string;
}
