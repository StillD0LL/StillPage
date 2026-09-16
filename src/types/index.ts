export type WidgetType =
  | 'weather'
  | 'calendar'
  | 'rss'
  | 'bookmarks'
  | 'notes'
  | 'tasks'
  | 'clock'
  | 'gallery'
  | 'video';

export type WidgetSize = '1x1' | '2x1' | '1x2' | '2x2' | '3x1' | '3x2' | 'portrait' | 'poster' | 'shorts' | 'full';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  enabled: boolean;
  order: number;
  settings?: Record<string, any>;
}

export interface LayoutPreset {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  isBuiltIn?: boolean;
  widgets: WidgetConfig[];
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  icon?: string;
  thumbnail?: string;
  hideThumbnail?: boolean;
  hidden?: boolean;
  customColor?: string;
  description?: string;
  pinned?: boolean;
  order: number;
  clickCount?: number;
  createdAt: number;
}

export interface BookmarkCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  endTime?: string;
  color: string;
  category: 'work' | 'personal' | 'meeting' | 'reminder' | 'deadline';
  description?: string;
  location?: string;
  completed?: boolean;
}

export interface RSSFeed {
  id: string;
  title: string;
  url: string;
  category: string;
  icon?: string;
  custom?: boolean;
}

export interface RSSItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  author?: string;
  contentSnippet?: string;
  thumbnail?: string;
  feedTitle?: string;
  feedId?: string;
}

export interface WeatherData {
  city: string;
  country: string;
  lat: number;
  lon: number;
  current: {
    temp: number;
    feelsLike: number;
    weatherCode: number;
    weatherText: string;
    windSpeed: number;
    windDirection: number;
    humidity: number;
    uvIndex: number;
    isDay: boolean;
    precipitation: number;
  };
  daily: Array<{
    date: string;
    weatherCode: number;
    weatherText: string;
    tempMax: number;
    tempMin: number;
    precipitationProb: number;
  }>;
  hourly: Array<{
    time: string;
    temp: number;
    weatherCode: number;
  }>;
  units: 'celsius' | 'fahrenheit';
  updatedAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned?: boolean;
  updatedAt: number;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: number;
}

export interface DashboardTheme {
  mode: 'dark' | 'light' | 'oled' | 'system';
  accentColor: string; // Hex or tailwind class
  backgroundType: 'solid' | 'gradient' | 'image' | 'mesh';
  backgroundValue: string;
  backgroundBlur: number;
  backgroundDim: number;
  glassEffect: boolean;
  font: 'sans' | 'mono' | 'heading';
  compactMode: boolean;
  backgroundPositionX?: number; // 0 to 100 percentage (default 50)
  backgroundPositionY?: number; // 0 to 100 percentage (default 50)
  backgroundZoom?: number; // 50 to 300 percentage (default 100)
  backgroundRotate?: number; // 0, 90, 180, 270 degrees
  backgroundFit?: 'cover' | 'contain' | 'custom' | 'fill';
  backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';

  // Window Container Customizations
  windowOpacity?: number; // 0 to 100 (percentage, e.g. 60)
  windowColor?: string; // Base Hex color, e.g. '#18181b', '#000000', '#0f172a'
  windowRadius?: number; // 0 to 40 (pixels, e.g. 16)
  windowBlur?: number; // 0 to 32 (backdrop blur in px, e.g. 16)
  windowBorderColor?: string; // Hex color for window border, e.g. '#3f3f46'
  windowBorderWidth?: number; // 0, 1, 2, 3 (pixels)
  windowBorderOpacity?: number; // 0 to 100 (percentage, e.g. 70)
}

export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  isBuiltIn?: boolean;
  theme: DashboardTheme;
}

export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  iconName: string;
  placeholder: string;
  shortcut: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  sourceType?: 'local' | 'url' | 'preset';
  addedAt: number;
}

export interface GallerySettings {
  cycleInterval: number; // in seconds (e.g. 5)
  isAutoPlay: boolean;
  transitionEffect: 'fade' | 'slide' | 'zoom';
  fitMode: 'cover' | 'contain';
  showCaptions: boolean;
  showIndicators: boolean;
  showControls: boolean;
  showThumbnailsBar: boolean;
}

export interface SavedVideoItem {
  id: string;
  title: string;
  sourceType: 'youtube' | 'local' | 'url';
  url: string;
  localMediaId?: string;
  fileName?: string;
  fileSize?: number;
  thumbnail?: string;
  addedAt: number;
}

export interface VideoWidgetSettings {
  sourceType: 'youtube' | 'local' | 'url';
  youtubeUrl: string;
  localVideoUrl?: string;
  localMediaId?: string;
  localVideoName?: string;
  videoTitle?: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  randomPlayOnEnd?: boolean;
  controls: boolean;
  aspectRatio: '16:9' | '4:3' | '9:16' | '21:9' | 'auto';
  fitMode: 'contain' | 'cover';
  zoom?: number; // 50 to 300 (percentage, default 100)
  cropX?: number; // 0 to 100 (horizontal pan anchor, default 50)
  cropY?: number; // 0 to 100 (vertical pan anchor, default 50)
  cropPreset?: 'default' | 'contain' | 'cover' | '16:9' | '9:16' | '4:3' | '1:1' | '21:9' | 'custom';
  rotate?: number; // 0, 90, 180, 270 degrees
  startTime?: number; // in seconds
  playbackRate?: number;
  savedVideos?: SavedVideoItem[];
}



export * from './start';
export * from './space';

export type PageId = 'start' | 'dashboard' | 'writer' | 'space';

export interface WritingProject {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WritingFolder {
  id: string;
  projectId: string;
  parentId?: string | null;
  name: string;
  color?: string;
  order: number;
  isExpanded?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type WritingDocType = 'document' | 'character' | 'image';

export interface CharacterInfoboxField {
  id: string;
  label: string;
  value: string;
  category?: 'general' | 'physical' | 'personal' | 'affiliations' | 'combat' | 'other';
}

export interface CharacterRelationship {
  id: string;
  characterName: string;
  relationType: string; // e.g. 'Ally', 'Rival', 'Sibling', 'Mentor', 'Love Interest', 'Enemy'
  description?: string;
  avatarEmoji?: string;
  avatarUrl?: string;
}

export interface CharacterQuote {
  id: string;
  quote: string;
  context?: string; // e.g. "Chapter 4, addressing the council"
}

export interface CharacterTimelineEvent {
  id: string;
  period: string; // e.g. "Age 16", "Year 2042", "Pre-War"
  title: string;
  description: string;
}

export interface CharacterStat {
  id: string;
  label: string;
  value: number; // 0 to 100
  maxValue?: number;
}

export interface CharacterGalleryItem {
  id: string;
  url: string;
  caption?: string;
}

export interface CharacterSection {
  id: string;
  title: string; // e.g. "Appearance", "Personality", "History & Biography", "Abilities", "Trivia"
  content: string;
  type?: 'text' | 'timeline' | 'relationships' | 'quotes' | 'gallery' | 'stats' | 'trivia';
  isCustom?: boolean;
}

export interface CharacterProfile {
  name: string;
  japaneseOrAltName?: string;
  titleOrEpithet?: string; // e.g. "The Silver Resonance Scholar"
  pronunciation?: string; // e.g. "[ˈkeɪ.lən]"
  avatarUrl?: string;
  avatarCaption?: string; // Subtitle or illustration caption below the portrait photo
  avatarEmoji?: string;
  bannerUrl?: string;
  themeColor?: string; // Accent color for Wikipedia infobox and badges
  summaryLead: string; // Wikipedia lead opening paragraph
  status?: 'Alive' | 'Deceased' | 'Unknown' | 'Immortal' | 'Missing' | string;
  speciesOrRace?: string;
  gender?: string;
  age?: string;
  birthday?: string;
  height?: string;
  weight?: string;
  hairColor?: string;
  eyeColor?: string;
  occupation?: string;
  affiliations?: string;
  alignment?: string;
  voiceActor?: string;
  customInfoboxFields: CharacterInfoboxField[];
  sections: CharacterSection[];
  relationships: CharacterRelationship[];
  quotes: CharacterQuote[];
  timeline: CharacterTimelineEvent[];
  stats: CharacterStat[];
  gallery: CharacterGalleryItem[];
  trivia: string[];
}

export interface WritingDocument {
  id: string;
  projectId: string;
  folderId?: string | null; // null or empty string = root of project
  title: string;
  content: string;
  docType?: WritingDocType; // 'document' (default), 'character', or 'image'
  characterData?: CharacterProfile;
  imageUrl?: string;
  imageSize?: number;
  imageDimensions?: { width: number; height: number };
  tags?: string[];
  pinned?: boolean;
  wordCount: number;
  charCount: number;
  readingTimeMinutes: number;
  status?: 'draft' | 'in-progress' | 'review' | 'completed' | 'archived';
  order: number;
  createdAt: number;
  updatedAt: number;
  coverEmoji?: string;
  isFavorite?: boolean;
}

export interface WritingSuiteSettings {
  viewMode: 'split' | 'editor' | 'preview';
  zenMode: boolean;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  fontFamily: 'sans' | 'serif' | 'mono';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  pageWidth: 'narrow' | 'medium' | 'wide' | 'full';
  showWordCount: boolean;
  showLineNumbers: boolean;
  spellCheck: boolean;
  typewriterMode: boolean;
}

export interface UiSoundSettings {
  enabled: boolean;
  volume: number; // 0.0 to 1.0 (default 0.4 / 40%)
  pitchVariation: boolean; // subtle natural pitch modulation
}

