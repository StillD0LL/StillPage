import {
  WidgetConfig,
  WidgetType,
  WidgetSize,
  LayoutPreset,
  ThemePreset,
  Bookmark,
  BookmarkCategory,
  CalendarEvent,
  RSSFeed,
  NoteItem,
  TaskItem,
  DashboardTheme,
  GalleryImage,
  GallerySettings,
  WritingProject,
  WritingFolder,
  WritingDocument,
  WritingSuiteSettings,
  UiSoundSettings,
  StartPageConfig,
  PageId,
  SpaceElement,
  SpaceBackgroundConfig,
} from '../types';
import { DEFAULT_START_CONFIG } from '../utils/startDefaults';
import { DEFAULT_SPACE_BACKGROUND } from '../utils/spaceDefaults';

export const DEFAULT_THEME: DashboardTheme = {
  mode: 'dark',
  accentColor: '#6366f1',
  backgroundType: 'gradient',
  backgroundValue:
    'radial-gradient(ellipse at 20% 20%, rgba(24, 24, 27, 0.95), rgba(9, 9, 11, 0.98)), linear-gradient(135deg, #09090b 0%, #18181b 100%)',
  backgroundBlur: 0,
  backgroundDim: 20,
  glassEffect: true,
  font: 'sans',
  compactMode: false,
  backgroundPositionX: 50,
  backgroundPositionY: 50,
  backgroundZoom: 100,
  backgroundRotate: 0,
  backgroundFit: 'cover',
  windowOpacity: 65,
  windowColor: '#18181b',
  windowRadius: 16,
  windowBlur: 16,
  windowBorderColor: '#3f3f46',
  windowBorderWidth: 1,
  windowBorderOpacity: 70,
};

export const DEFAULT_THEME_PRESETS: ThemePreset[] = [
  {
    id: 'preset-glass-liquid',
    name: 'Liquid Glass (Ultra Sheer)',
    description: 'High transparency (28%) with 24px backdrop blur and 20px soft curved corners.',
    createdAt: 1700000000010,
    isBuiltIn: true,
    theme: {
      mode: 'dark',
      accentColor: '#6366f1',
      backgroundType: 'gradient',
      backgroundValue:
        'radial-gradient(ellipse at 20% 20%, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.98)), linear-gradient(135deg, #090d16 0%, #0f172a 100%)',
      backgroundBlur: 0,
      backgroundDim: 20,
      glassEffect: true,
      font: 'sans',
      compactMode: false,
      windowOpacity: 28,
      windowColor: '#18181b',
      windowRadius: 20,
      windowBlur: 24,
      windowBorderColor: '#818cf8',
      windowBorderWidth: 1,
      windowBorderOpacity: 45,
    },
  },
  {
    id: 'preset-cyber-obsidian',
    name: 'Cyber Obsidian (OLED Pure)',
    description: 'Pitch black windows (#000000) with 85% density, 12px sleek radius, and vibrant neon accents.',
    createdAt: 1700000000011,
    isBuiltIn: true,
    theme: {
      mode: 'oled',
      accentColor: '#8b5cf6',
      backgroundType: 'solid',
      backgroundValue: '#000000',
      backgroundBlur: 0,
      backgroundDim: 0,
      glassEffect: false,
      font: 'sans',
      compactMode: false,
      windowOpacity: 85,
      windowColor: '#000000',
      windowRadius: 12,
      windowBlur: 8,
      windowBorderColor: '#27272a',
      windowBorderWidth: 1,
      windowBorderOpacity: 90,
    },
  },
  {
    id: 'preset-slate-studio',
    name: 'Slate Studio (Balanced Modern)',
    description: 'Deep slate tint (#0f172a) with 72% opacity, 16px standard rounded corners, and sky blue accents.',
    createdAt: 1700000000012,
    isBuiltIn: true,
    theme: {
      mode: 'dark',
      accentColor: '#0ea5e9',
      backgroundType: 'image',
      backgroundValue:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&auto=format&fit=crop&q=80',
      backgroundBlur: 2,
      backgroundDim: 30,
      glassEffect: true,
      font: 'sans',
      compactMode: false,
      windowOpacity: 72,
      windowColor: '#0f172a',
      windowRadius: 16,
      windowBlur: 16,
      windowBorderColor: '#334155',
      windowBorderWidth: 1,
      windowBorderOpacity: 75,
    },
  },
  {
    id: 'preset-emerald-forest',
    name: 'Emerald Aurora (Deep Pine Tint)',
    description: 'Deep forest green tint (#022c22) with 70% opacity and 18px curved corners.',
    createdAt: 1700000000013,
    isBuiltIn: true,
    theme: {
      mode: 'dark',
      accentColor: '#10b981',
      backgroundType: 'gradient',
      backgroundValue:
        'radial-gradient(ellipse at top left, rgba(6, 78, 59, 0.6), rgba(15, 23, 42, 0.95)), linear-gradient(135deg, #022c22 0%, #0f172a 100%)',
      backgroundBlur: 0,
      backgroundDim: 20,
      glassEffect: true,
      font: 'sans',
      compactMode: false,
      windowOpacity: 70,
      windowColor: '#022c22',
      windowRadius: 18,
      windowBlur: 16,
      windowBorderColor: '#065f46',
      windowBorderWidth: 1,
      windowBorderOpacity: 80,
    },
  },
  {
    id: 'preset-nordic-sharp',
    name: 'Nordic Brutalist (0px Sharp Square)',
    description: 'Crisp 0px edge radius, high contrast borders, 88% window density, and amber focus.',
    createdAt: 1700000000014,
    isBuiltIn: true,
    theme: {
      mode: 'dark',
      accentColor: '#f59e0b',
      backgroundType: 'solid',
      backgroundValue: '#121214',
      backgroundBlur: 0,
      backgroundDim: 0,
      glassEffect: false,
      font: 'sans',
      compactMode: false,
      windowOpacity: 88,
      windowColor: '#18181b',
      windowRadius: 0,
      windowBlur: 0,
      windowBorderColor: '#52525b',
      windowBorderWidth: 2,
      windowBorderOpacity: 90,
    },
  },
  {
    id: 'preset-amethyst-luxe',
    name: 'Amethyst Luxe (Curved Glow)',
    description: 'Deep royal purple tint (#1e1b4b) with generous 24px soft rounded edges and fuchsia accents.',
    createdAt: 1700000000015,
    isBuiltIn: true,
    theme: {
      mode: 'dark',
      accentColor: '#d946ef',
      backgroundType: 'image',
      backgroundValue:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&auto=format&fit=crop&q=80',
      backgroundBlur: 3,
      backgroundDim: 35,
      glassEffect: true,
      font: 'sans',
      compactMode: false,
      windowOpacity: 65,
      windowColor: '#1e1b4b',
      windowRadius: 24,
      windowBlur: 20,
      windowBorderColor: '#6366f1',
      windowBorderWidth: 1,
      windowBorderOpacity: 60,
    },
  },
  {
    id: 'preset-frost-light',
    name: 'Frosted Snow (Light Mode Clean)',
    description: 'Bright clean light canvas with white frosted glass windows (#ffffff) at 82% opacity and 16px radius.',
    createdAt: 1700000000016,
    isBuiltIn: true,
    theme: {
      mode: 'light',
      accentColor: '#6366f1',
      backgroundType: 'solid',
      backgroundValue: '#f4f4f5',
      backgroundBlur: 0,
      backgroundDim: 0,
      glassEffect: true,
      font: 'sans',
      compactMode: false,
      windowOpacity: 82,
      windowColor: '#ffffff',
      windowRadius: 16,
      windowBlur: 16,
      windowBorderColor: '#e4e4e7',
      windowBorderWidth: 1,
      windowBorderOpacity: 90,
    },
  },
];

export const DEFAULT_CATEGORIES: BookmarkCategory[] = [
  { id: 'cat-all', name: 'All Links', icon: 'Layers', order: 0 },
  { id: 'cat-dev', name: 'Development', icon: 'Code', order: 1 },
  { id: 'cat-work', name: 'Productivity & Work', icon: 'Briefcase', order: 2 },
  { id: 'cat-media', name: 'Media & Entertainment', icon: 'Film', order: 3 },
  { id: 'cat-design', name: 'Design & Inspiration', icon: 'Palette', order: 4 },
  { id: 'cat-news', name: 'News & Tech', icon: 'Newspaper', order: 5 },
  { id: 'cat-tools', name: 'Tools & Utilities', icon: 'Wrench', order: 6 },
];

export const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm-github',
    title: 'GitHub',
    url: 'https://github.com',
    category: 'cat-dev',
    tags: ['Dev', 'Code', 'Git', 'OpenSource'],
    icon: 'https://github.githubassets.com/favicons/favicon.png',
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',
    description: 'Code hosting, collaboration, and repository management.',
    pinned: true,
    order: 0,
    clickCount: 24,
    createdAt: Date.now() - 1000000,
  },
  {
    id: 'bm-chatgpt',
    title: 'ChatGPT',
    url: 'https://chat.openai.com',
    category: 'cat-tools',
    tags: ['AI', 'Assistant', 'Chat', 'Tools'],
    icon: 'https://chatgpt.com/favicon.ico',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80',
    description: 'Conversational AI system for answers, ideation, and coding.',
    pinned: true,
    order: 1,
    clickCount: 38,
    createdAt: Date.now() - 950000,
  },
  {
    id: 'bm-youtube',
    title: 'YouTube',
    url: 'https://youtube.com',
    category: 'cat-media',
    tags: ['Video', 'Media', 'Music', 'Learning'],
    icon: 'https://www.youtube.com/s/desktop/f71253a4/img/favicon_144x144.png',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop&q=80',
    description: 'Video sharing platform for tutorials, news, and entertainment.',
    pinned: true,
    order: 2,
    clickCount: 19,
    createdAt: Date.now() - 900000,
  },
  {
    id: 'bm-figma',
    title: 'Figma',
    url: 'https://figma.com',
    category: 'cat-design',
    tags: ['Design', 'UI', 'UX', 'Prototype'],
    icon: 'https://static.figma.com/app/icon/1/favicon.ico',
    thumbnail: 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=600&auto=format&fit=crop&q=80',
    description: 'Collaborative interface design tool and vector graphics.',
    pinned: false,
    order: 3,
    clickCount: 15,
    createdAt: Date.now() - 850000,
  },
  {
    id: 'bm-notion',
    title: 'Notion',
    url: 'https://notion.so',
    category: 'cat-work',
    tags: ['Notes', 'Productivity', 'Docs', 'Workspace'],
    icon: 'https://www.notion.so/front-static/favicon.ico',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
    description: 'All-in-one workspace for notes, tasks, wikis, and databases.',
    pinned: true,
    order: 4,
    clickCount: 30,
    createdAt: Date.now() - 800000,
  },
  {
    id: 'bm-hackernews',
    title: 'Hacker News',
    url: 'https://news.ycombinator.com',
    category: 'cat-news',
    tags: ['Tech', 'News', 'Startups', 'Dev'],
    icon: 'https://news.ycombinator.com/favicon.ico',
    thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
    description: 'Community for tech entrepreneurs, developers, and founders.',
    pinned: false,
    order: 5,
    clickCount: 12,
    createdAt: Date.now() - 750000,
  },
  {
    id: 'bm-tailwind',
    title: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    category: 'cat-dev',
    tags: ['CSS', 'Frontend', 'Design', 'Dev'],
    icon: 'https://tailwindcss.com/favicons/favicon.ico',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    description: 'Utility-first CSS framework for rapid UI styling.',
    pinned: false,
    order: 6,
    clickCount: 14,
    createdAt: Date.now() - 700000,
  },
  {
    id: 'bm-gmail',
    title: 'Gmail',
    url: 'https://mail.google.com',
    category: 'cat-work',
    tags: ['Email', 'Google', 'Work', 'Communication'],
    icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
    thumbnail: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&auto=format&fit=crop&q=80',
    description: 'Email by Google with smart organization and filtering.',
    pinned: true,
    order: 7,
    clickCount: 45,
    createdAt: Date.now() - 650000,
  },
  {
    id: 'bm-dribbble',
    title: 'Dribbble',
    url: 'https://dribbble.com',
    category: 'cat-design',
    tags: ['Design', 'Inspiration', 'UI', 'Illustration'],
    icon: 'https://cdn.dribbble.com/assets/favicon-b38525134603b9513174ec887944b005e839e550974917b203c944111be14a1e.ico',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80',
    description: 'Showcase and discover creative work from worldwide designers.',
    pinned: false,
    order: 8,
    clickCount: 8,
    createdAt: Date.now() - 600000,
  },
  {
    id: 'bm-theverge',
    title: 'The Verge',
    url: 'https://theverge.com',
    category: 'cat-news',
    tags: ['Tech', 'Gadgets', 'Reviews', 'News'],
    icon: 'https://www.theverge.com/favicon.ico',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
    description: 'Covers the intersection of technology, science, art, and culture.',
    pinned: false,
    order: 9,
    clickCount: 11,
    createdAt: Date.now() - 550000,
  },
  {
    id: 'bm-spotify',
    title: 'Spotify Web',
    url: 'https://open.spotify.com',
    category: 'cat-media',
    tags: ['Music', 'Audio', 'Podcasts', 'Entertainment'],
    icon: 'https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    description: 'Digital music and podcast streaming service.',
    pinned: false,
    order: 10,
    clickCount: 22,
    createdAt: Date.now() - 500000,
  },
  {
    id: 'bm-reddit',
    title: 'Reddit',
    url: 'https://reddit.com',
    category: 'cat-media',
    tags: ['Social', 'Community', 'Discussion', 'News'],
    icon: 'https://www.redditstatic.com/shreddit/assets/favicon/192x192.png',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
    description: 'Network of communities where people dive into their interests.',
    pinned: false,
    order: 11,
    clickCount: 16,
    createdAt: Date.now() - 450000,
  }
];

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'widget-clock',
    type: 'clock',
    title: 'Time & Greeting',
    size: '1x1',
    enabled: true,
    order: 0,
    settings: {
      showSeconds: false,
      format24h: false,
      showGreeting: true,
      showDate: true,
    },
  },
  {
    id: 'widget-weather',
    type: 'weather',
    title: 'Weather Forecast',
    size: '2x1',
    enabled: true,
    order: 1,
    settings: {
      city: 'San Francisco',
      country: 'US',
      lat: 37.7749,
      lon: -122.4194,
      units: 'fahrenheit',
      autoGeo: true,
    },
  },
  {
    id: 'widget-notes',
    type: 'notes',
    title: 'Quick Notes',
    size: '1x2',
    enabled: true,
    order: 2,
    settings: {},
  },
  {
    id: 'widget-tasks',
    type: 'tasks',
    title: 'Daily Tasks',
    size: '1x2',
    enabled: true,
    order: 3,
    settings: {},
  },
  {
    id: 'widget-bookmarks',
    type: 'bookmarks',
    title: 'Bookmarks',
    size: 'full',
    enabled: true,
    order: 4,
    settings: {
      viewMode: 'grid',
      showThumbnails: true,
      defaultCategory: 'cat-all',
      itemsPerRow: 4,
    },
  },
  {
    id: 'widget-calendar',
    type: 'calendar',
    title: 'Calendar & Events',
    size: '2x2',
    enabled: true,
    order: 5,
    settings: {
      view: 'month',
      showUpcoming: true,
      limitUpcoming: 5,
    },
  },
  {
    id: 'widget-rss',
    type: 'rss',
    title: 'News Feeds',
    size: '2x2',
    enabled: true,
    order: 6,
    settings: {
      activeFeedId: '',
      autoRefresh: 30,
    },
  },
  {
    id: 'widget-gallery',
    type: 'gallery',
    title: 'Image Gallery',
    size: '3x1',
    enabled: false,
    order: 7,
    settings: {
      cycleInterval: 6,
      isAutoPlay: true,
      transitionEffect: 'fade',
      fitMode: 'cover',
      showCaptions: true,
      showIndicators: true,
      showControls: true,
      showThumbnailsBar: false,
    },
  },
  {
    id: 'widget-video',
    type: 'video',
    title: 'Video Player',
    size: '2x2',
    enabled: false,
    order: 8,
    settings: {
      sourceType: 'youtube',
      youtubeUrl: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
      videoTitle: 'Lofi Girl - Synthwave & Chill Beats',
      autoplay: true,
      muted: true,
      loop: true,
      randomPlayOnEnd: true,
      controls: true,
      fitMode: 'cover',
      aspectRatio: '16:9',
    },
  },
];

const today = new Date();
const formatDate = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Sprint Planning & Architecture Sync',
    date: formatDate(0),
    time: '10:30',
    endTime: '11:45',
    color: '#3b82f6',
    category: 'meeting',
    description: 'Review product milestones, tech roadmap, and quarterly deliverables.',
    location: 'Google Meet',
  },
  {
    id: 'evt-2',
    title: 'Design Review: Homepage Revamp',
    date: formatDate(0),
    time: '14:00',
    endTime: '15:00',
    color: '#8b5cf6',
    category: 'work',
    description: 'Walk through widget customization, bookmark card designs, and dark mode palette.',
    location: 'Conference Room B',
  },
  {
    id: 'evt-3',
    title: 'Quarterly Team Lunch',
    date: formatDate(1),
    time: '12:30',
    endTime: '14:00',
    color: '#10b981',
    category: 'personal',
    description: 'Celebrate release milestone with the engineering team.',
    location: 'Blue Fin Bistro',
  },
  {
    id: 'evt-4',
    title: 'Project Beta Release Deadline',
    date: formatDate(2),
    time: '18:00',
    color: '#ef4444',
    category: 'deadline',
    description: 'Final deployment tag cut and verification run.',
  },
  {
    id: 'evt-5',
    title: 'Client Demo & Feedback Session',
    date: formatDate(4),
    time: '11:00',
    endTime: '12:00',
    color: '#f59e0b',
    category: 'meeting',
    description: 'Showcase customizable dashboard live features and bookmark tag filters.',
  },
];

export const DEFAULT_RSS_FEEDS: RSSFeed[] = [];

export const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: '💡 Quick Ideas & Shortcuts',
    content: '- Press `/` to focus the Universal Search Bar\n- Drag widgets by their top header to rearrange\n- Click the size buttons on widgets to toggle 1x1, 2x1, 2x2, or Full width\n- Filter bookmarks instantly by clicking categories or custom tags\n- Add any custom RSS feed URL in the RSS widget settings',
    color: '#6366f1',
    pinned: true,
    updatedAt: Date.now(),
  },
  {
    id: 'note-2',
    title: '🎯 Weekly Focus',
    content: '1. Ship dashboard customization updates\n2. Refine bookmark thumbnail cache\n3. Review calendar sync workflow\n4. Prepare sprint retro notes',
    color: '#10b981',
    pinned: false,
    updatedAt: Date.now() - 3600000,
  },
];

export const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    text: 'Customize widget layout and bookmark tags',
    completed: true,
    priority: 'high',
    createdAt: Date.now() - 8000000,
  },
  {
    id: 'task-2',
    text: 'Add favorite work and development links',
    completed: false,
    priority: 'high',
    dueDate: formatDate(0),
    createdAt: Date.now() - 5000000,
  },
  {
    id: 'task-3',
    text: 'Connect custom RSS feeds & set refresh rate',
    completed: false,
    priority: 'medium',
    dueDate: formatDate(1),
    createdAt: Date.now() - 3000000,
  },
  {
    id: 'task-4',
    text: 'Try out OLED Dark Mode and Unsplash Wallpapers',
    completed: false,
    priority: 'low',
    createdAt: Date.now() - 1000000,
  },
];

export const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'gal-1',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&auto=format&fit=crop&q=80',
    title: 'Yosemite Valley Mist',
    caption: 'Majestic morning light streaming across granite cliffs and valley pine trees.',
    sourceType: 'preset',
    addedAt: Date.now() - 500000,
  },
  {
    id: 'gal-2',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&auto=format&fit=crop&q=80',
    title: 'Starry Alpine Night',
    caption: 'Crisp midnight stars lighting up snow-capped mountain horizons.',
    sourceType: 'preset',
    addedAt: Date.now() - 400000,
  },
  {
    id: 'gal-3',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&auto=format&fit=crop&q=80',
    title: 'Emerald Forest Fog',
    caption: 'Quiet dawn fog rolling softly through ancient redwood giants.',
    sourceType: 'preset',
    addedAt: Date.now() - 300000,
  },
  {
    id: 'gal-4',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=80',
    title: 'Modern Architecture Shadows',
    caption: 'Clean geometric lines, glass facades, and warm golden hour reflections.',
    sourceType: 'preset',
    addedAt: Date.now() - 200000,
  },
];

export const DEFAULT_GALLERY_SETTINGS: GallerySettings = {
  cycleInterval: 6,
  isAutoPlay: true,
  transitionEffect: 'fade',
  fitMode: 'cover',
  showCaptions: true,
  showIndicators: true,
  showControls: true,
  showThumbnailsBar: false,
};

export const DEFAULT_LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'preset-daily',
    name: 'Daily Essentials',
    description: 'Clean daily dashboard: Clock, Weather, Notes, Tasks & Bookmarks.',
    createdAt: 1700000000000,
    isBuiltIn: true,
    widgets: [
      { id: 'widget-clock', type: 'clock', title: 'Time & Greeting', size: '1x1', enabled: true, order: 0 },
      { id: 'widget-weather', type: 'weather', title: 'Weather Forecast', size: '2x1', enabled: true, order: 1 },
      { id: 'widget-notes', type: 'notes', title: 'Quick Notes', size: '1x2', enabled: true, order: 2 },
      { id: 'widget-tasks', type: 'tasks', title: 'Daily Tasks', size: '1x2', enabled: true, order: 3 },
      { id: 'widget-bookmarks', type: 'bookmarks', title: 'Bookmarks', size: 'full', enabled: true, order: 4 },
      { id: 'widget-calendar', type: 'calendar', title: 'Calendar & Events', size: '2x2', enabled: true, order: 5 },
      { id: 'widget-rss', type: 'rss', title: 'News Feeds', size: '2x2', enabled: true, order: 6 },
      { id: 'widget-gallery', type: 'gallery', title: 'Image Gallery', size: '3x1', enabled: false, order: 7 },
      { id: 'widget-video', type: 'video', title: 'Video Player', size: '2x2', enabled: false, order: 8 },
    ],
  },
  {
    id: 'preset-productivity',
    name: 'Deep Focus & Tasks',
    description: 'Productivity suite with tasks, notes scratchpad, and calendar agenda.',
    createdAt: 1700000000000,
    isBuiltIn: true,
    widgets: [
      { id: 'widget-clock', type: 'clock', title: 'Time & Greeting', size: '1x1', enabled: true, order: 0 },
      { id: 'widget-weather', type: 'weather', title: 'Weather Forecast', size: '2x1', enabled: true, order: 1 },
      { id: 'widget-tasks', type: 'tasks', title: 'Daily Tasks', size: '1x2', enabled: true, order: 2 },
      { id: 'widget-notes', type: 'notes', title: 'Quick Notes', size: '1x2', enabled: true, order: 3 },
      { id: 'widget-calendar', type: 'calendar', title: 'Calendar & Events', size: '2x2', enabled: true, order: 4 },
      { id: 'widget-bookmarks', type: 'bookmarks', title: 'Bookmarks', size: 'full', enabled: true, order: 5 },
      { id: 'widget-rss', type: 'rss', title: 'News Feeds', size: '2x2', enabled: false, order: 6 },
      { id: 'widget-gallery', type: 'gallery', title: 'Image Gallery', size: '3x1', enabled: false, order: 7 },
      { id: 'widget-video', type: 'video', title: 'Video Player', size: '2x2', enabled: false, order: 8 },
    ],
  },
  {
    id: 'preset-minimal',
    name: 'Minimal Canvas',
    description: 'Ultra-clean view with time, weather, and your bookmark launchpad.',
    createdAt: 1700000000000,
    isBuiltIn: true,
    widgets: [
      { id: 'widget-clock', type: 'clock', title: 'Time & Greeting', size: '1x1', enabled: true, order: 0 },
      { id: 'widget-weather', type: 'weather', title: 'Weather Forecast', size: '2x1', enabled: true, order: 1 },
      { id: 'widget-bookmarks', type: 'bookmarks', title: 'Bookmarks', size: 'full', enabled: true, order: 2 },
      { id: 'widget-notes', type: 'notes', title: 'Quick Notes', size: '1x2', enabled: false, order: 3 },
      { id: 'widget-tasks', type: 'tasks', title: 'Daily Tasks', size: '1x2', enabled: false, order: 4 },
      { id: 'widget-calendar', type: 'calendar', title: 'Calendar & Events', size: '2x2', enabled: false, order: 5 },
      { id: 'widget-rss', type: 'rss', title: 'News Feeds', size: '2x2', enabled: false, order: 6 },
      { id: 'widget-gallery', type: 'gallery', title: 'Image Gallery', size: '3x1', enabled: false, order: 7 },
      { id: 'widget-video', type: 'video', title: 'Video Player', size: '2x2', enabled: false, order: 8 },
    ],
  },
  {
    id: 'preset-media',
    name: 'Media & News Hub',
    description: 'Ambient video, wallpapers gallery, and live RSS news aggregator.',
    createdAt: 1700000000000,
    isBuiltIn: true,
    widgets: [
      { id: 'widget-clock', type: 'clock', title: 'Time & Greeting', size: '1x1', enabled: true, order: 0 },
      { id: 'widget-weather', type: 'weather', title: 'Weather Forecast', size: '2x1', enabled: true, order: 1 },
      { id: 'widget-video', type: 'video', title: 'Video Player', size: '2x2', enabled: true, order: 2 },
      { id: 'widget-rss', type: 'rss', title: 'News Feeds', size: '2x2', enabled: true, order: 3 },
      { id: 'widget-gallery', type: 'gallery', title: 'Image Gallery', size: '3x1', enabled: true, order: 4 },
      { id: 'widget-bookmarks', type: 'bookmarks', title: 'Bookmarks', size: 'full', enabled: true, order: 5 },
      { id: 'widget-notes', type: 'notes', title: 'Quick Notes', size: '1x2', enabled: false, order: 6 },
      { id: 'widget-tasks', type: 'tasks', title: 'Daily Tasks', size: '1x2', enabled: false, order: 7 },
      { id: 'widget-calendar', type: 'calendar', title: 'Calendar & Events', size: '2x2', enabled: false, order: 8 },
    ],
  },
];

export const DEFAULT_WORKSPACE_PROJECT: WritingProject = {
  id: 'proj-default-workspace',
  name: 'My Workspace',
  description: 'Default personal workspace for notes, drafts, and lore.',
  icon: '📁',
  color: '#6366f1',
  order: 0,
  isDefault: true,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

export const DEFAULT_WRITING_PROJECTS: WritingProject[] = [DEFAULT_WORKSPACE_PROJECT];

export const DEFAULT_WRITING_FOLDERS: WritingFolder[] = [];

export const DEFAULT_WRITING_DOCUMENTS: WritingDocument[] = [
  {
    id: 'doc-welcome-getting-started',
    projectId: 'proj-default-workspace',
    folderId: null,
    title: 'Getting Started.md',
    content: `# Welcome to My Workspace ✍️

This is your default writing environment for crafting stories, character lore, technical documentation, and daily reflections.

## 🚀 Getting Started

- **Documents & Notes**: Click **+ Doc** to create a standard Markdown document.
- **Visual Canvas**: Click **+ Canvas** to brainstorm and arrange idea cards on an infinite board.
- **Image Directory**: Click **+ Image** to import local or web images into your project.
- **Character Wiki**: Click **+ Wiki** to create structured Wikipedia-style character lore.
- **Folders & Nesting**: Click **+ Folder** to organize your documents hierarchically.
- **Zen Focus Mode**: Focus without distractions by pressing the Focus button or hitting **ESC**.

> *"The secret of getting ahead is getting started."* — Mark Twain
`,
    docType: 'document',
    tags: ['Guide', 'Workspace'],
    wordCount: 75,
    charCount: 520,
    readingTimeMinutes: 1,
    status: 'in-progress',
    order: 0,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    coverEmoji: '📝',
    isFavorite: true,
  },
  {
    id: 'doc-img-alpine',
    projectId: 'proj-default-workspace',
    folderId: null,
    title: 'Alpine Peak Moodboard.png',
    content: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
    docType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
    imageSize: 184320,
    imageDimensions: { width: 1200, height: 800 },
    tags: ['Image', 'Asset', 'Moodboard'],
    wordCount: 0,
    charCount: 0,
    readingTimeMinutes: 0,
    status: 'completed',
    order: 2,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    coverEmoji: '🖼️',
    isFavorite: false,
  },
];

export const DEFAULT_WRITING_SETTINGS: WritingSuiteSettings = {
  viewMode: 'split',
  zenMode: false,
  fontSize: 'base',
  fontFamily: 'sans',
  lineSpacing: 'relaxed',
  pageWidth: 'wide',
  showWordCount: true,
  showLineNumbers: false,
  spellCheck: true,
  typewriterMode: false,
};

const STORAGE_KEYS = {
  THEME: 'nexus_dashboard_theme',
  WIDGETS: 'nexus_dashboard_widgets',
  BOOKMARKS: 'nexus_dashboard_bookmarks',
  CATEGORIES: 'nexus_dashboard_categories',
  EVENTS: 'nexus_dashboard_events',
  FEEDS: 'nexus_dashboard_feeds',
  NOTES: 'nexus_dashboard_notes',
  TASKS: 'nexus_dashboard_tasks',
  GALLERY_IMAGES: 'nexus_dashboard_gallery_images',
  GALLERY_SETTINGS: 'nexus_dashboard_gallery_settings',
  SEARCH_HISTORY: 'nexus_dashboard_search_history',
  DEFAULT_ENGINE: 'nexus_dashboard_search_engine',
  LAYOUT_COLUMNS: 'nexus_dashboard_layout_cols',
  LAYOUT_PRESETS: 'nexus_dashboard_layout_presets',
  THEME_PRESETS: 'nexus_dashboard_theme_presets',
  CLEAN_MODE: 'nexus_dashboard_clean_mode',
  ACTIVE_PAGE: 'nexus_active_page',
  START_CONFIG: 'nexus_start_page_config',
  WRITING_PROJECTS: 'nexus_writing_projects',
  WRITING_FOLDERS: 'nexus_writing_folders',
  WRITING_DOCUMENTS: 'nexus_writing_documents',
  WRITING_SETTINGS: 'nexus_writing_settings',
  UI_SOUND_SETTINGS: 'nexus_ui_sound_settings',
  SPACE_ELEMENTS: 'nexus_space_elements',
  SPACE_BACKGROUND: 'nexus_space_background',
  SPACE_MODE: 'nexus_space_mode',
};

export const storage = {
  getTheme(): DashboardTheme {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THEME);
      return data ? { ...DEFAULT_THEME, ...JSON.parse(data) } : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  },
  saveTheme(theme: DashboardTheme): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  },

  getDefaultWidgets(): WidgetConfig[] {
    return JSON.parse(JSON.stringify(DEFAULT_WIDGETS));
  },

  getWidgets(): WidgetConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WIDGETS);
      if (!data) {
        const defaults = this.getDefaultWidgets();
        try {
          localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(defaults));
        } catch {}
        return defaults;
      }

      const parsed: WidgetConfig[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const defaults = this.getDefaultWidgets();
        try {
          localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(defaults));
        } catch {}
        return defaults;
      }

      const validTypes = new Set<WidgetType>([
        'clock',
        'weather',
        'calendar',
        'rss',
        'bookmarks',
        'notes',
        'tasks',
        'gallery',
        'video',
      ]);

      const validSizes = new Set<WidgetSize>([
        '1x1',
        '2x1',
        '1x2',
        '2x2',
        '3x1',
        '3x2',
        'portrait',
        'poster',
        'shorts',
        'full',
      ]);

      // Strictly filter out any invalid/legacy widgets
      const filtered = parsed.filter(
        (w) =>
          w &&
          typeof w === 'object' &&
          validTypes.has(w.type as WidgetType) &&
          !String(w.type).toLowerCase().includes('character') &&
          !String(w.type).toLowerCase().includes('showcase') &&
          !String(w.id).toLowerCase().includes('character') &&
          !String(w.id).toLowerCase().includes('showcase') &&
          w.id !== 'widget-music'
      );

      // Preserve existing widgets in their existing order, and append any missing default types
      const result: WidgetConfig[] = [];
      const presentTypes = new Set<WidgetType>();

      for (let i = 0; i < filtered.length; i++) {
        const w = filtered[i];
        if (presentTypes.has(w.type as WidgetType)) continue;
        presentTypes.add(w.type as WidgetType);

        const def = DEFAULT_WIDGETS.find((d) => d.type === w.type) || {
          id: w.id,
          type: w.type,
          title: w.title || 'Widget',
          size: w.size || '1x1',
          enabled: true,
          order: i,
          settings: {},
        };

        let title = w.title || def.title;
        if (w.id === 'widget-gallery' && title === 'Photo Banner Gallery') {
          title = 'Image Gallery';
        }
        if (w.id === 'widget-video' && title === 'Ambient Video & YouTube') {
          title = 'Video Player';
        }
        if (
          w.id === 'widget-bookmarks' &&
          (title === 'Quick Bookmarks' || title === 'Visual Bookmark Hub')
        ) {
          title = 'Bookmarks';
        }

        let settings = { ...(def.settings || {}), ...(w.settings || {}) };
        if (w.type === 'gallery') {
          const standaloneGal = this.getGallerySettings();
          settings = { ...settings, ...standaloneGal, ...(w.settings || {}) };
        }

        const validSize: WidgetSize = validSizes.has(w.size) ? w.size : def.size;
        const validOrder = typeof w.order === 'number' && !isNaN(w.order) ? w.order : i;

        result.push({
          ...def,
          ...w,
          title,
          size: validSize,
          order: validOrder,
          enabled: typeof w.enabled === 'boolean' ? w.enabled : def.enabled,
          settings,
        });
      }

      // Append any default widgets that weren't present in stored widgets
      let maxOrder = result.length > 0 ? Math.max(...result.map((r) => r.order ?? 0)) + 1 : 0;
      for (const def of DEFAULT_WIDGETS) {
        if (!presentTypes.has(def.type)) {
          let settings = { ...(def.settings || {}) };
          if (def.type === 'gallery') {
            const standaloneGal = this.getGallerySettings();
            settings = { ...settings, ...standaloneGal };
          }
          result.push({
            ...def,
            order: maxOrder++,
            settings,
          });
          presentTypes.add(def.type);
        }
      }

      // Ensure stable contiguous ordering
      result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const normalized = result.map((w, idx) => ({ ...w, order: idx }));

      // Persist the clean normalized state back to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(normalized));
      } catch {}

      return normalized;
    } catch {
      return this.getDefaultWidgets();
    }
  },

  saveWidgets(widgets: WidgetConfig[]): void {
    try {
      const validTypes = new Set<WidgetType>([
        'clock',
        'weather',
        'calendar',
        'rss',
        'bookmarks',
        'notes',
        'tasks',
        'gallery',
        'video',
      ]);
      const validSizes = new Set<WidgetSize>([
        '1x1',
        '2x1',
        '1x2',
        '2x2',
        '3x1',
        '3x2',
        'portrait',
        'poster',
        'shorts',
        'full',
      ]);
      const clean = (widgets || [])
        .filter(
          (w) =>
            w &&
            validTypes.has(w.type) &&
            !String(w.type).toLowerCase().includes('character') &&
            !String(w.type).toLowerCase().includes('showcase') &&
            !String(w.id).toLowerCase().includes('character') &&
            !String(w.id).toLowerCase().includes('showcase') &&
            w.id !== 'widget-music'
        )
        .map((w, i) => ({
          ...w,
          size: validSizes.has(w.size) ? w.size : '1x1',
          order: typeof w.order === 'number' && !isNaN(w.order) ? w.order : i,
        }));
      localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(clean));

      // Also persist gallery settings independently if gallery is present
      const galleryWidget = clean.find((w) => w.type === 'gallery' || w.id === 'widget-gallery');
      if (galleryWidget && galleryWidget.settings) {
        try {
          const cur = this.getGallerySettings();
          this.saveGallerySettings({ ...cur, ...galleryWidget.settings });
        } catch {}
      }
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  },

  getBookmarks(): Bookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : DEFAULT_BOOKMARKS;
    } catch {
      return DEFAULT_BOOKMARKS;
    }
  },
  saveBookmarks(bookmarks: Bookmark[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  },

  getCategories(): BookmarkCategory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },
  saveCategories(categories: BookmarkCategory[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  },

  getEvents(): CalendarEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return data ? JSON.parse(data) : DEFAULT_CALENDAR_EVENTS;
    } catch {
      return DEFAULT_CALENDAR_EVENTS;
    }
  },
  saveEvents(events: CalendarEvent[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  },

  getFeeds(): RSSFeed[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FEEDS);
      if (!data) return DEFAULT_RSS_FEEDS;
      const parsed: RSSFeed[] = JSON.parse(data);
      const legacyDefaultIds = new Set([
        'feed-techcrunch',
        'feed-hackernews',
        'feed-theverge',
        'feed-bbc',
        'feed-wired',
      ]);
      return parsed.filter((f) => !legacyDefaultIds.has(f.id));
    } catch {
      return DEFAULT_RSS_FEEDS;
    }
  },
  saveFeeds(feeds: RSSFeed[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FEEDS, JSON.stringify(feeds));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  },

  getNotes(): NoteItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  },
  saveNotes(notes: NoteItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  },

  getTasks(): TaskItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  },
  saveTasks(tasks: TaskItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  },

  getGalleryImages(): GalleryImage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GALLERY_IMAGES);
      return data ? JSON.parse(data) : DEFAULT_GALLERY_IMAGES;
    } catch {
      return DEFAULT_GALLERY_IMAGES;
    }
  },
  saveGalleryImages(images: GalleryImage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY_IMAGES, JSON.stringify(images));
    } catch (e) {
      console.warn('Storage save failed for gallery images', e);
    }
  },

  getGallerySettings(): GallerySettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GALLERY_SETTINGS);
      return data ? { ...DEFAULT_GALLERY_SETTINGS, ...JSON.parse(data) } : DEFAULT_GALLERY_SETTINGS;
    } catch {
      return DEFAULT_GALLERY_SETTINGS;
    }
  },
  saveGallerySettings(settings: GallerySettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage save failed for gallery settings', e);
    }
  },

  getSearchHistory(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return data ? JSON.parse(data) : ['GitHub trending', 'Weather forecast', 'Tailwind CSS docs', 'Next.js 15'];
    } catch {
      return [];
    }
  },
  saveSearchHistory(history: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history.slice(0, 15)));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  },

  getDefaultEngine(): string {
    return localStorage.getItem(STORAGE_KEYS.DEFAULT_ENGINE) || 'google';
  },
  saveDefaultEngine(id: string): void {
    localStorage.setItem(STORAGE_KEYS.DEFAULT_ENGINE, id);
  },

  getLayoutPresets(): LayoutPreset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAYOUT_PRESETS);
      const customPresets: LayoutPreset[] = data ? JSON.parse(data) : [];
      const sampleIds = new Set([
        'preset-full',
        'preset-productivity',
        'preset-media',
        'preset-daily',
        'preset-minimal',
      ]);
      const filteredCustom = customPresets.filter((p) => !sampleIds.has(p.id) && !p.isBuiltIn);
      const customIds = new Set(filteredCustom.map((p) => p.id));
      const builtIns = DEFAULT_LAYOUT_PRESETS.filter((p) => !customIds.has(p.id));
      return [...filteredCustom, ...builtIns];
    } catch {
      return DEFAULT_LAYOUT_PRESETS;
    }
  },

  getCustomLayoutPresets(): LayoutPreset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAYOUT_PRESETS);
      const customPresets: LayoutPreset[] = data ? JSON.parse(data) : [];
      const sampleIds = new Set([
        'preset-full',
        'preset-productivity',
        'preset-media',
        'preset-daily',
        'preset-minimal',
      ]);
      return customPresets.filter((p) => !sampleIds.has(p.id) && !p.isBuiltIn);
    } catch {
      return [];
    }
  },

  saveCustomLayoutPresets(presets: LayoutPreset[]): void {
    try {
      const customOnly = presets.filter((p) => !p.isBuiltIn);
      localStorage.setItem(STORAGE_KEYS.LAYOUT_PRESETS, JSON.stringify(customOnly));
    } catch (e) {
      console.warn('Storage save failed for layout presets', e);
    }
  },

  saveCurrentLayoutAsPreset(name: string, widgets: WidgetConfig[], description?: string): LayoutPreset {
    const customOnly = this.getCustomLayoutPresets();
    const activeCount = widgets.filter((w) => w.enabled).length;
    const newPreset: LayoutPreset = {
      id: `preset-custom-${Date.now()}`,
      name: name.trim() || `My Layout ${customOnly.length + 1}`,
      description: description?.trim() || `${activeCount} widgets configured`,
      createdAt: Date.now(),
      isBuiltIn: false,
      widgets: JSON.parse(JSON.stringify(widgets)),
    };
    const updated = [newPreset, ...customOnly];
    this.saveCustomLayoutPresets(updated);
    return newPreset;
  },

  updateLayoutPreset(id: string, name: string, widgets: WidgetConfig[], description?: string): LayoutPreset | null {
    const customOnly = this.getCustomLayoutPresets();
    const activeCount = widgets.filter((w) => w.enabled).length;
    let updatedPreset: LayoutPreset | null = null;
    const updated = customOnly.map((p) => {
      if (p.id === id) {
        updatedPreset = {
          ...p,
          name: name.trim() || p.name,
          description: description?.trim() || `${activeCount} widgets configured`,
          widgets: JSON.parse(JSON.stringify(widgets)),
        };
        return updatedPreset;
      }
      return p;
    });
    this.saveCustomLayoutPresets(updated);
    return updatedPreset;
  },

  deleteLayoutPreset(id: string): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAYOUT_PRESETS);
      const allPresets: LayoutPreset[] = data ? JSON.parse(data) : [];
      const updated = allPresets.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.LAYOUT_PRESETS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage delete failed for layout preset', e);
    }
  },

  getThemePresets(): ThemePreset[] {
    const customPresets = this.getCustomThemePresets();
    return [...DEFAULT_THEME_PRESETS, ...customPresets];
  },

  getCustomThemePresets(): ThemePreset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THEME_PRESETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCustomThemePresets(presets: ThemePreset[]): void {
    try {
      const customOnly = presets.filter((p) => !p.isBuiltIn);
      localStorage.setItem(STORAGE_KEYS.THEME_PRESETS, JSON.stringify(customOnly));
    } catch (e) {
      console.warn('Storage save failed for theme presets', e);
    }
  },

  addThemePreset(name: string, theme: DashboardTheme, description?: string): ThemePreset {
    const customOnly = this.getCustomThemePresets();
    const newPreset: ThemePreset = {
      id: `theme-preset-${Date.now()}`,
      name: name.trim() || `Custom Theme ${customOnly.length + 1}`,
      description: description?.trim() || `Mode: ${theme.mode}, Radius: ${theme.windowRadius ?? 16}px, Opacity: ${theme.windowOpacity ?? 65}%`,
      createdAt: Date.now(),
      isBuiltIn: false,
      theme: JSON.parse(JSON.stringify(theme)),
    };
    const updated = [newPreset, ...customOnly];
    this.saveCustomThemePresets(updated);
    return newPreset;
  },

  updateThemePreset(id: string, name: string, theme: DashboardTheme, description?: string): ThemePreset | null {
    const customOnly = this.getCustomThemePresets();
    let updatedPreset: ThemePreset | null = null;
    const updated = customOnly.map((p) => {
      if (p.id === id) {
        updatedPreset = {
          ...p,
          name: name.trim() || p.name,
          description: description?.trim() || `Mode: ${theme.mode}, Radius: ${theme.windowRadius ?? 16}px, Opacity: ${theme.windowOpacity ?? 65}%`,
          theme: JSON.parse(JSON.stringify(theme)),
        };
        return updatedPreset;
      }
      return p;
    });
    this.saveCustomThemePresets(updated);
    return updatedPreset;
  },

  deleteThemePreset(id: string): void {
    const customOnly = this.getCustomThemePresets();
    const updated = customOnly.filter((p) => p.id !== id);
    this.saveCustomThemePresets(updated);
  },

  getCleanMode(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.CLEAN_MODE) === 'true';
    } catch {
      return false;
    }
  },

  saveCleanMode(isClean: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLEAN_MODE, String(isClean));
    } catch (e) {
      console.warn('Storage save failed for clean mode', e);
    }
  },

  exportAllData(): string {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      theme: this.getTheme(),
      startConfig: this.getStartPageConfig(),
      widgets: this.getWidgets(),
      bookmarks: this.getBookmarks(),
      categories: this.getCategories(),
      events: this.getEvents(),
      feeds: this.getFeeds(),
      notes: this.getNotes(),
      tasks: this.getTasks(),
      galleryImages: this.getGalleryImages(),
      gallerySettings: this.getGallerySettings(),
      layoutPresets: this.getCustomLayoutPresets(),
      themePresets: this.getCustomThemePresets(),
      uiSoundSettings: this.getUiSoundSettings(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importAllData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.theme) this.saveTheme(data.theme);
      if (data.startConfig) this.saveStartPageConfig(data.startConfig);
      if (data.widgets) this.saveWidgets(data.widgets);
      if (data.bookmarks) this.saveBookmarks(data.bookmarks);
      if (data.categories) this.saveCategories(data.categories);
      if (data.events) this.saveEvents(data.events);
      if (data.feeds) this.saveFeeds(data.feeds);
      if (data.notes) this.saveNotes(data.notes);
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.galleryImages) this.saveGalleryImages(data.galleryImages);
      if (data.gallerySettings) this.saveGallerySettings(data.gallerySettings);
      if (data.uiSoundSettings) this.saveUiSoundSettings(data.uiSoundSettings);
      if (data.layoutPresets && Array.isArray(data.layoutPresets)) {
        this.saveCustomLayoutPresets(data.layoutPresets);
      }
      if (data.themePresets && Array.isArray(data.themePresets)) {
        this.saveCustomThemePresets(data.themePresets);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.THEME);
    localStorage.removeItem(STORAGE_KEYS.START_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.WIDGETS);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.FEEDS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.GALLERY_IMAGES);
    localStorage.removeItem(STORAGE_KEYS.GALLERY_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.LAYOUT_PRESETS);
    localStorage.removeItem(STORAGE_KEYS.THEME_PRESETS);
    localStorage.removeItem(STORAGE_KEYS.WRITING_PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.WRITING_FOLDERS);
    localStorage.removeItem(STORAGE_KEYS.WRITING_DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.WRITING_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.UI_SOUND_SETTINGS);
  },

  getActivePage(): PageId {
    try {
      const p = localStorage.getItem(STORAGE_KEYS.ACTIVE_PAGE) as PageId;
      if (p === 'start' || p === 'dashboard' || p === 'writer') {
        return p;
      }
      return 'start';
    } catch {
      return 'start';
    }
  },
  saveActivePage(page: PageId): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PAGE, page);
    } catch (e) {
      console.warn('Storage save failed for active page', e);
    }
  },

  getStartPageConfig(): StartPageConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.START_CONFIG);
      if (data) {
        const parsed = JSON.parse(data);
        if (
          parsed.backgroundUrl?.includes('mixkit.co') ||
          parsed.selectedPresetId === 'preset-cosmic-stars' ||
          !parsed.backgroundUrl
        ) {
          parsed.backgroundUrl = DEFAULT_START_CONFIG.backgroundUrl;
          parsed.backgroundPoster = DEFAULT_START_CONFIG.backgroundPoster;
          parsed.selectedPresetId = DEFAULT_START_CONFIG.selectedPresetId;
        }

        const merged: StartPageConfig = {
          ...DEFAULT_START_CONFIG,
          ...parsed,
        };

        if (Array.isArray(parsed.videoPlaylist) && parsed.videoPlaylist.length > 0) {
          const cleanedPlaylist = parsed.videoPlaylist.filter(
            (item: any) => !item.url?.includes('mixkit.co')
          );
          merged.videoPlaylist = cleanedPlaylist.length > 0 ? cleanedPlaylist : DEFAULT_START_CONFIG.videoPlaylist || [];
        } else {
          merged.videoPlaylist = DEFAULT_START_CONFIG.videoPlaylist || [];
        }
        return merged;
      }
      return DEFAULT_START_CONFIG;
    } catch {
      return DEFAULT_START_CONFIG;
    }
  },
  saveStartPageConfig(config: StartPageConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.START_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.warn('Storage save failed for start page config, trying sanitized fallback', e);
      try {
        // If config contains a large ephemeral dataUrl or blobUrl, sanitize it
        const sanitized: StartPageConfig = {
          ...config,
          backgroundUrl: config.customMediaId ? '' : config.backgroundUrl.slice(0, 1000),
        };
        localStorage.setItem(STORAGE_KEYS.START_CONFIG, JSON.stringify(sanitized));
      } catch (innerErr) {
        console.error('Critical storage save error for start page config', innerErr);
      }
    }
  },

  getWritingProjects(): WritingProject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WRITING_PROJECTS);
      if (!data) return DEFAULT_WRITING_PROJECTS;
      const parsed: WritingProject[] = JSON.parse(data);
      const sampleIds = new Set(['proj-creative', 'proj-work', 'proj-journal']);
      const filtered = parsed.filter((p) => !sampleIds.has(p.id));

      // Guarantee "My Workspace" default project always exists and is marked as default
      const hasDefault = filtered.some(
        (p) => p.id === DEFAULT_WORKSPACE_PROJECT.id || p.isDefault || p.name === 'My Workspace'
      );
      if (!hasDefault) {
        return [DEFAULT_WORKSPACE_PROJECT, ...filtered];
      }
      return filtered.map((p) => {
        if (p.id === DEFAULT_WORKSPACE_PROJECT.id || p.name === 'My Workspace') {
          return { ...p, isDefault: true };
        }
        return p;
      });
    } catch {
      return DEFAULT_WRITING_PROJECTS;
    }
  },
  saveWritingProjects(projects: WritingProject[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WRITING_PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('Storage save failed for writing projects', e);
    }
  },

  getWritingFolders(): WritingFolder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WRITING_FOLDERS);
      if (!data) return DEFAULT_WRITING_FOLDERS;
      const parsed: WritingFolder[] = JSON.parse(data);
      const sampleIds = new Set([
        'folder-chapters',
        'folder-lore',
        'folder-characters',
        'folder-locations',
        'folder-meetings',
      ]);
      const sampleProjectIds = new Set(['proj-creative', 'proj-work', 'proj-journal']);
      return parsed.filter((f) => !sampleIds.has(f.id) && !sampleProjectIds.has(f.projectId));
    } catch {
      return DEFAULT_WRITING_FOLDERS;
    }
  },
  saveWritingFolders(folders: WritingFolder[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WRITING_FOLDERS, JSON.stringify(folders));
    } catch (e) {
      console.warn('Storage save failed for writing folders', e);
    }
  },

  getWritingDocuments(): WritingDocument[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WRITING_DOCUMENTS);
      if (!data) return DEFAULT_WRITING_DOCUMENTS;
      const parsed: WritingDocument[] = JSON.parse(data);
      const sampleIds = new Set([
        'doc-char-kael',
        'doc-chapter-1',
        'doc-lore-magic',
        'doc-work-architecture',
        'doc-journal-today',
      ]);
      const sampleProjectIds = new Set(['proj-creative', 'proj-work', 'proj-journal']);
      const filtered = parsed.filter(
        (d) =>
          !sampleIds.has(d.id) &&
          !sampleProjectIds.has(d.projectId) &&
          (d as any).docType !== 'canvas' &&
          !d.title?.toLowerCase().endsWith('.canvas')
      );
      if (filtered.length === 0) {
        return DEFAULT_WRITING_DOCUMENTS;
      }
      return filtered;
    } catch {
      return DEFAULT_WRITING_DOCUMENTS;
    }
  },
  saveWritingDocuments(docs: WritingDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WRITING_DOCUMENTS, JSON.stringify(docs));
    } catch (e) {
      console.warn('Storage save failed for writing documents', e);
    }
  },

  getWritingSettings(): WritingSuiteSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WRITING_SETTINGS);
      return data ? { ...DEFAULT_WRITING_SETTINGS, ...JSON.parse(data) } : DEFAULT_WRITING_SETTINGS;
    } catch {
      return DEFAULT_WRITING_SETTINGS;
    }
  },
  saveWritingSettings(settings: WritingSuiteSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WRITING_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage save failed for writing settings', e);
    }
  },
  resetWritingSuiteData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.WRITING_PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.WRITING_FOLDERS);
      localStorage.removeItem(STORAGE_KEYS.WRITING_DOCUMENTS);
      localStorage.removeItem(STORAGE_KEYS.WRITING_SETTINGS);
    } catch (e) {
      console.warn('Storage clear failed for writing data', e);
    }
  },

  getUiSoundSettings(): UiSoundSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UI_SOUND_SETTINGS);
      if (data) {
        return { enabled: true, volume: 0.4, pitchVariation: true, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Storage read failed for UI sound settings', e);
    }
    return { enabled: true, volume: 0.4, pitchVariation: true };
  },

  saveUiSoundSettings(settings: UiSoundSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.UI_SOUND_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage save failed for UI sound settings', e);
    }
  },

  getSpaceElements(): SpaceElement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SPACE_ELEMENTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Storage read failed for space elements', e);
    }
    // Default to empty array for an empty flexible creative canvas viewport as requested
    return [];
  },

  saveSpaceElements(elements: SpaceElement[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.SPACE_ELEMENTS, JSON.stringify(elements));
      return true;
    } catch (e: unknown) {
      console.warn('Storage save failed for space elements', e);
      // If quota exceeded, attempt to prune overly long base64 strings if present
      try {
        const sanitized = elements.map((el) => {
          if (el.type === 'image' && el.imageUrl && el.imageUrl.length > 500000) {
            // Truncate excessively bloated raw image string to prevent full crash
            return { ...el, imageUrl: '' };
          }
          return el;
        });
        localStorage.setItem(STORAGE_KEYS.SPACE_ELEMENTS, JSON.stringify(sanitized));
        return true;
      } catch {
        return false;
      }
    }
  },

  getSpaceBackground(): SpaceBackgroundConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SPACE_BACKGROUND);
      if (data) {
        return { ...DEFAULT_SPACE_BACKGROUND, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Storage read failed for space background', e);
    }
    return DEFAULT_SPACE_BACKGROUND;
  },

  saveSpaceBackground(config: SpaceBackgroundConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SPACE_BACKGROUND, JSON.stringify(config));
    } catch (e) {
      console.warn('Storage save failed for space background', e);
    }
  },

  getSpaceMode(): 'design' | 'view' {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SPACE_MODE);
      if (data === 'view' || data === 'design') return data;
    } catch {}
    return 'design';
  },

  saveSpaceMode(mode: 'design' | 'view'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SPACE_MODE, mode);
    } catch {}
  },

  resetSpaceData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SPACE_ELEMENTS);
      localStorage.removeItem(STORAGE_KEYS.SPACE_BACKGROUND);
      localStorage.removeItem(STORAGE_KEYS.SPACE_MODE);
    } catch (e) {
      console.warn('Failed to reset space data', e);
    }
  },
};
