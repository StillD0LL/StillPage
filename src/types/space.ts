export type SpaceElementType = 'text' | 'image' | 'video' | 'button';

export interface BaseSpaceElement {
  id: string;
  type: SpaceElementType;
  x: number;
  y: number;
  width: number;
  height?: number;
  rotation: number; // degrees, e.g. -12 to 360
  zIndex: number;
  createdAt: number;
  opacity?: number; // 0.1 to 1.0, defaults to 1
  isLocked?: boolean; // When true, prevents dragging & rotating
}

export type TextNoteTheme = 'amber' | 'lavender' | 'mint' | 'rose' | 'dark' | 'kraft' | 'transparent';
export type TextFontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type TextFontFamily = 'sans' | 'serif' | 'mono' | 'handwriting';
export type TextAlign = 'left' | 'center' | 'right';

export interface TextBoxElement extends BaseSpaceElement {
  type: 'text';
  text: string;
  theme: TextNoteTheme;
  fontSize: TextFontSize;
  fontFamily: TextFontFamily;
  align: TextAlign;
}

export type TapeStyle = 'dual-corner' | 'top-center' | 'scotch' | 'none';
export type TapeColor = 'crepe' | 'washi-pink' | 'washi-mint' | 'kraft' | 'neon';
export type PhotoStyle = 'polaroid' | 'classic' | 'film' | 'minimal';
export type PhotoAspectRatio = '1:1' | '4:3' | '3:2' | '16:9';

export interface ImageFrameElement extends BaseSpaceElement {
  type: 'image';
  imageUrl: string;
  caption?: string;
  tapeStyle: TapeStyle;
  tapeColor: TapeColor;
  photoStyle: PhotoStyle;
  aspectRatio: PhotoAspectRatio;
}

export interface VideoPlayerElement extends BaseSpaceElement {
  type: 'video';
  videoUrl: string;
  sourceType: 'youtube' | 'direct';
  title?: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
}

export type ButtonActionType = 'link' | 'page' | 'cheer' | 'quote';
export type ButtonStyleVariant = 'gradient' | 'neon' | 'glass' | 'solid' | 'pastel';

export interface CustomButtonElement extends BaseSpaceElement {
  type: 'button';
  label: string;
  icon: string;
  buttonStyle: ButtonStyleVariant;
  actionType: ButtonActionType;
  actionPayload?: string; // e.g. URL, or 'dashboard' | 'start' | 'writer'
}

export type SpaceElement =
  | TextBoxElement
  | ImageFrameElement
  | VideoPlayerElement
  | CustomButtonElement;

export type SpaceBackgroundType = 'solid' | 'gradient' | 'texture' | 'image';

export interface SpaceBackgroundConfig {
  type: SpaceBackgroundType;
  value: string;
  texturePreset?: string;
  dim: number; // 0 to 100 percentage
  blur: number; // 0 to 32 pixels
  showGrid: boolean;
  gridType: 'dots' | 'lines' | 'none';
}
