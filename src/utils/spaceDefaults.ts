import {
  SpaceElement,
  TextBoxElement,
  ImageFrameElement,
  VideoPlayerElement,
  CustomButtonElement,
  SpaceBackgroundConfig,
} from '../types/space';

export const DEFAULT_SPACE_BACKGROUND: SpaceBackgroundConfig = {
  type: 'texture',
  value: 'corkboard',
  dim: 15,
  blur: 0,
  showGrid: false,
  gridType: 'dots',
};

export const BACKGROUND_SOLID_PRESETS = [
  { id: 'obsidian', name: 'Pitch Obsidian', value: '#09090b', text: '#f4f4f5' },
  { id: 'slate', name: 'Midnight Slate', value: '#0f172a', text: '#f8fafc' },
  { id: 'charcoal', name: 'Warm Charcoal', value: '#1c1917', text: '#fafaf9' },
  { id: 'navy', name: 'Deep Royal Navy', value: '#1e1b4b', text: '#e0e7ff' },
  { id: 'forest', name: 'Emerald Pine', value: '#022c22', text: '#ecfdf5' },
  { id: 'ruby', name: 'Dark Burgundy', value: '#4c0519', text: '#ffe4e6' },
  { id: 'amethyst', name: 'Royal Amethyst', value: '#2e1065', text: '#f3e8ff' },
  { id: 'canvas-light', name: 'Studio Cream', value: '#f4f4f0', text: '#18181b' },
];

export const BACKGROUND_GRADIENT_PRESETS = [
  {
    id: 'cosmic',
    name: 'Cosmic Nebula',
    value: 'radial-gradient(ellipse at 20% 20%, rgba(49, 46, 129, 0.95), rgba(15, 23, 42, 0.98)), linear-gradient(135deg, #090d16 0%, #0f172a 100%)',
  },
  {
    id: 'sunset',
    name: 'Twilight Horizon',
    value: 'radial-gradient(ellipse at bottom, rgba(217, 70, 239, 0.25), transparent 70%), linear-gradient(135deg, #180924 0%, #0b0214 100%)',
  },
  {
    id: 'aurora',
    name: 'Boreal Glow',
    value: 'radial-gradient(ellipse at 80% 20%, rgba(16, 185, 129, 0.25), transparent 60%), linear-gradient(135deg, #022c22 0%, #061e24 50%, #0a0a0f 100%)',
  },
  {
    id: 'ocean',
    name: 'Deep Abyss',
    value: 'linear-gradient(135deg, #0f172a 0%, #032030 50%, #020617 100%)',
  },
  {
    id: 'ember',
    name: 'Dark Ember',
    value: 'radial-gradient(ellipse at top right, rgba(234, 88, 12, 0.2), transparent 70%), linear-gradient(135deg, #18181b 0%, #09090b 100%)',
  },
  {
    id: 'violet',
    name: 'Velvet Midnight',
    value: 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 60%, #09090b 100%)',
  },
];

export const BACKGROUND_TEXTURE_PRESETS = [
  {
    id: 'corkboard',
    name: 'Warm Corkboard',
    desc: 'Classic pinned bulletin board texture',
    css: {
      backgroundColor: '#261b14',
      backgroundImage: `radial-gradient(#3a291e 15%, transparent 16%), radial-gradient(#1c130e 15%, transparent 16%)`,
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0, 12px 12px',
    },
  },
  {
    id: 'desk-wood',
    name: 'Dark Walnut Desk',
    desc: 'Deep warm workspace timber',
    css: {
      backgroundColor: '#1c1512',
      backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0px, transparent 2px, transparent 40px, rgba(0,0,0,0.1) 42px), linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.3) 100%)`,
    },
  },
  {
    id: 'blueprint',
    name: 'Drafting Blueprint',
    desc: 'Architectural graph paper with fine blue lines',
    css: {
      backgroundColor: '#0c1d36',
      backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.15) 1px, transparent 1px), linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px)`,
      backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
    },
  },
  {
    id: 'dot-matrix',
    name: 'Slate Dot Grid',
    desc: 'Subtle tactile design dot matrix',
    css: {
      backgroundColor: '#121316',
      backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.18) 1.5px, transparent 1.5px)`,
      backgroundSize: '24px 24px',
    },
  },
  {
    id: 'starfield',
    name: 'Cosmic Starfield',
    desc: 'Starlight in the quiet deep universe',
    css: {
      backgroundColor: '#050711',
      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%), radial-gradient(white 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)`,
      backgroundSize: '100% 100%, 75px 75px, 120px 120px',
      backgroundPosition: '0 0, 15px 30px, 60px 80px',
    },
  },
  {
    id: 'clean-slate',
    name: 'Architect Studio',
    desc: 'Matte dark concrete surface',
    css: {
      backgroundColor: '#18181b',
      backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.02) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.02) 25%, transparent 25%), linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%), linear-gradient(315deg, rgba(255,255,255,0.02) 25%, #18181b 25%)`,
      backgroundSize: '32px 32px',
    },
  },
];

export const CURATED_PHOTOS = [
  {
    id: 'photo-mountain',
    title: 'Alpine Sunrise',
    caption: 'Chamonix Valley • Early mist',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'photo-cafe',
    title: 'Morning Espresso',
    caption: 'Kyoto Alleyway • 08:30 AM',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'photo-stars',
    title: 'Milky Way Observatory',
    caption: 'Atacama Desert • Clear sky',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'photo-tokyo',
    title: 'Neon Crossing',
    caption: 'Shibuya Rain • Reflections',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'photo-camper',
    title: 'Coastal Wanderlust',
    caption: 'Highway 1 • Pacific breeze',
    url: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'photo-plants',
    title: 'Botanical Greenhouse',
    caption: 'Fiddle Leaf & Monstera',
    url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=80',
  },
];

export const CURATED_VIDEOS = [
  {
    id: 'vid-lofi',
    title: 'Lofi Hip Hop Study Beats',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
  },
  {
    id: 'vid-fireplace',
    title: 'Cozy Crackling Fireplace',
    url: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
  },
  {
    id: 'vid-rain',
    title: 'Rain on Window & Gentle Thunder',
    url: 'https://www.youtube.com/watch?v=mPZkdNFkNps',
  },
  {
    id: 'vid-space',
    title: 'Deep Space Galaxy 4K Ambient',
    url: 'https://www.youtube.com/watch?v=17jymDn0W6U',
  },
];

export function createDefaultTextBox(x = 240, y = 140): TextBoxElement {
  return {
    id: `txt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'text',
    x,
    y,
    width: 280,
    height: 180,
    rotation: -2,
    zIndex: 10,
    createdAt: Date.now(),
    text: 'Click here to write notes, brainstorm ideas, or keep track of your thoughts.\n\nEverything in Space is draggable & rotatable!',
    theme: 'amber',
    fontSize: 'base',
    fontFamily: 'sans',
    align: 'left',
  };
}

export function createDefaultImageFrame(x = 580, y = 100): ImageFrameElement {
  const photo = CURATED_PHOTOS[0];
  return {
    id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'image',
    x,
    y,
    width: 320,
    height: 380,
    rotation: 4,
    zIndex: 12,
    createdAt: Date.now(),
    imageUrl: photo.url,
    caption: photo.caption,
    tapeStyle: 'dual-corner',
    tapeColor: 'crepe',
    photoStyle: 'polaroid',
    aspectRatio: '1:1',
  };
}

export function createDefaultVideoPlayer(x = 180, y = 360): VideoPlayerElement {
  return {
    id: `vid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'video',
    x,
    y,
    width: 400,
    height: 275,
    rotation: 1,
    zIndex: 8,
    createdAt: Date.now(),
    videoUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    sourceType: 'youtube',
    title: 'Lofi Ambient Player',
    autoplay: false,
    muted: false,
    loop: true,
  };
}

export function createDefaultCustomButton(x = 640, y = 520): CustomButtonElement {
  return {
    id: `btn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'button',
    x,
    y,
    width: 220,
    height: 64,
    rotation: -3,
    zIndex: 15,
    createdAt: Date.now(),
    label: '✨ Inspire Me',
    icon: 'Sparkles',
    buttonStyle: 'gradient',
    actionType: 'cheer',
    actionPayload: 'Focus on the journey, not just the destination.',
  };
}

export function getStarterSpaceElements(): SpaceElement[] {
  return [
    createDefaultImageFrame(480, 80),
    createDefaultTextBox(160, 140),
    createDefaultVideoPlayer(220, 360),
    createDefaultCustomButton(660, 480),
  ];
}
