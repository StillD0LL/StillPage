import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Palette,
  Moon,
  Sun,
  Sparkles,
  Image as ImageIcon,
  Sliders,
  Check,
  Upload,
  Move,
  Crop,
  RotateCw,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
  Sparkle,
  Trash2,
  Layers,
  Layout,
  Bookmark,
  BookmarkPlus,
  Save,
  Download,
  Copy,
  FolderOpen,
  Square,
  Circle,
  HelpCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { DashboardTheme, ThemePreset } from '../../types';
import { storage } from '../../services/storage';
import { hexToRgba, getWidgetWindowStyle } from '../../utils/themeUtils';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: DashboardTheme;
  onUpdateTheme: (theme: DashboardTheme) => void;
}

type ThemeTab = 'windows' | 'presets' | 'wallpaper';

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sky Blue', value: '#0ea5e9' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Fuchsia', value: '#d946ef' },
];

const WINDOW_COLOR_PRESETS = [
  { name: 'Pitch Obsidian', value: '#000000', border: '#27272a', desc: 'Pure OLED black' },
  { name: 'Deep Zinc', value: '#18181b', border: '#3f3f46', desc: 'Neutral modern dark' },
  { name: 'Midnight Slate', value: '#0f172a', border: '#334155', desc: 'Deep cosmic slate blue' },
  { name: 'Royal Navy', value: '#1e1b4b', border: '#4338ca', desc: 'Rich midnight indigo' },
  { name: 'Emerald Pine', value: '#022c22', border: '#065f46', desc: 'Deep forest green' },
  { name: 'Dark Ruby', value: '#4c0519', border: '#881337', desc: 'Rich wine/burgundy' },
  { name: 'Warm Charcoal', value: '#1c1917', border: '#44403c', desc: 'Warm stone dark' },
  { name: 'Amethyst', value: '#2e1065', border: '#581c87', desc: 'Deep royal purple' },
  { name: 'Cyber Teal', value: '#042f2e', border: '#115e59', desc: 'Deep dark cyan teal' },
  { name: 'Frosted Snow', value: '#ffffff', border: '#e4e4e7', desc: 'Clean frosty light' },
];

const WINDOW_OPACITY_PRESETS = [
  { label: 'Sheer (20%)', value: 20 },
  { label: 'Frost (45%)', value: 45 },
  { label: 'Balanced (65%)', value: 65 },
  { label: 'Dense (85%)', value: 85 },
  { label: 'Opaque (100%)', value: 100 },
];

const WINDOW_RADIUS_PRESETS = [
  { label: 'Sharp (0px)', value: 0, desc: 'Brutalist square' },
  { label: 'Subtle (8px)', value: 8, desc: 'Minimal soft' },
  { label: 'Smooth (14px)', value: 14, desc: 'Balanced card' },
  { label: 'Standard (18px)', value: 18, desc: 'Modern rounded' },
  { label: 'Curved (24px)', value: 24, desc: 'Generous radius' },
  { label: 'Pill (32px)', value: 32, desc: 'Super curved' },
];

const WALLPAPER_PRESETS = [
  {
    name: 'Deep Nebula',
    type: 'gradient' as const,
    value:
      'radial-gradient(ellipse at 20% 20%, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.98)), linear-gradient(135deg, #090d16 0%, #0f172a 100%)',
    preview: 'bg-gradient-to-br from-indigo-950 to-slate-950',
  },
  {
    name: 'Midnight Pure (OLED)',
    type: 'solid' as const,
    value: '#000000',
    preview: 'bg-black',
  },
  {
    name: 'Cosmic Mountain',
    type: 'image' as const,
    value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=60',
  },
  {
    name: 'Cyberpunk City',
    type: 'image' as const,
    value: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300&auto=format&fit=crop&q=60',
  },
  {
    name: 'Minimal Nature',
    type: 'image' as const,
    value: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&auto=format&fit=crop&q=60',
  },
  {
    name: 'Modern Architecture',
    type: 'image' as const,
    value: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop&q=60',
  },
  {
    name: 'Abstract Fluid Dark',
    type: 'image' as const,
    value: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&auto=format&fit=crop&q=80',
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=60',
  },
  {
    name: 'Emerald Forest',
    type: 'gradient' as const,
    value:
      'radial-gradient(ellipse at top left, rgba(6, 78, 59, 0.6), rgba(15, 23, 42, 0.95)), linear-gradient(135deg, #022c22 0%, #0f172a 100%)',
    preview: 'bg-gradient-to-br from-emerald-950 to-slate-950',
  },
];

const CROP_PRESETS = [
  { id: '16:9', label: '16:9 Widescreen', ratio: 16 / 9 },
  { id: '16:10', label: '16:10 Display', ratio: 16 / 10 },
  { id: '21:9', label: '21:9 Ultrawide', ratio: 21 / 9 },
  { id: '2:3', label: '2:3 (720×1080 Portrait)', ratio: 2 / 3 },
  { id: '4:3', label: '4:3 Classic', ratio: 4 / 3 },
  { id: '1:1', label: '1:1 Square', ratio: 1 },
];

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  theme,
  onUpdateTheme,
}) => {
  const [activeTab, setActiveTab] = useState<ThemeTab>('windows');
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isProcessingLocalImg, setIsProcessingLocalImg] = useState(false);
  const [showMoverPanel, setShowMoverPanel] = useState(false);
  const [selectedCropRatio, setSelectedCropRatio] = useState<string>('16:9');
  const [cropStatus, setCropStatus] = useState<string | null>(null);

  // Theme Presets State
  const [themePresets, setThemePresets] = useState<ThemePreset[]>(() => storage.getThemePresets());
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const previewBoxRef = useRef<HTMLDivElement | null>(null);
  const isMouseDownRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({
    x: 0,
    y: 0,
    posX: 50,
    posY: 50,
  });

  const posX = theme.backgroundPositionX ?? 50;
  const posY = theme.backgroundPositionY ?? 50;
  const zoom = theme.backgroundZoom ?? 100;
  const rotate = theme.backgroundRotate ?? 0;
  const fitMode = theme.backgroundFit ?? 'cover';

  // Window properties defaults
  const windowOpacity = theme.windowOpacity !== undefined ? theme.windowOpacity : 65;
  const windowColor = theme.windowColor || (theme.mode === 'oled' ? '#000000' : theme.mode === 'light' ? '#ffffff' : '#18181b');
  const windowRadius = theme.windowRadius !== undefined ? theme.windowRadius : 16;
  const windowBlur = theme.windowBlur !== undefined ? theme.windowBlur : 16;
  const windowBorderColor = theme.windowBorderColor || (theme.mode === 'oled' ? '#27272a' : theme.mode === 'light' ? '#e4e4e7' : '#3f3f46');
  const windowBorderWidth = theme.windowBorderWidth !== undefined ? theme.windowBorderWidth : 1;
  const windowBorderOpacity = theme.windowBorderOpacity !== undefined ? theme.windowBorderOpacity : 70;

  // Process Local Image File
  const handleLocalImageSelect = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;

    setIsProcessingLocalImg(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        const maxDim = 2560;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedUrl = canvas.toDataURL('image/jpeg', 0.88);
          onUpdateTheme({
            ...theme,
            backgroundType: 'image',
            backgroundValue: optimizedUrl,
            backgroundPositionX: 50,
            backgroundPositionY: 50,
            backgroundZoom: 100,
            backgroundRotate: 0,
            backgroundFit: 'cover',
          });
        }
        setIsProcessingLocalImg(false);
        setShowMoverPanel(true);
      };
      img.onerror = () => setIsProcessingLocalImg(false);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
  };

  const handleDragLeave = () => {
    setIsDraggingImage(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleLocalImageSelect(file);
  };

  // Mouse Drag Image Mover within preview box
  const handlePreviewMouseDown = (e: React.MouseEvent) => {
    if (theme.backgroundType !== 'image') return;
    isMouseDownRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: posX,
      posY: posY,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDownRef.current || !previewBoxRef.current) return;
      const rect = previewBoxRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

      const newX = Math.max(0, Math.min(100, Math.round(dragStartRef.current.posX - deltaX)));
      const newY = Math.max(0, Math.min(100, Math.round(dragStartRef.current.posY - deltaY)));

      onUpdateTheme({
        ...theme,
        backgroundPositionX: newX,
        backgroundPositionY: newY,
      });
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [theme, posX, posY, onUpdateTheme]);

  // Crop Image via Canvas
  const handleApplyPermanentCrop = () => {
    if (theme.backgroundType !== 'image' || !theme.backgroundValue) return;

    setCropStatus('Cropping...');
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const preset = CROP_PRESETS.find((p) => p.id === selectedCropRatio) || CROP_PRESETS[0];
      const targetRatio = preset.ratio;

      let cropW = img.naturalWidth;
      let cropH = img.naturalHeight;

      if (cropW / cropH > targetRatio) {
        cropW = Math.round(cropH * targetRatio);
      } else {
        cropH = Math.round(cropW / targetRatio);
      }

      const maxOffsetX = img.naturalWidth - cropW;
      const maxOffsetY = img.naturalHeight - cropH;
      const srcX = Math.round((posX / 100) * maxOffsetX);
      const srcY = Math.round((posY / 100) * maxOffsetY);

      const canvas = document.createElement('canvas');
      canvas.width = Math.min(cropW, 2560);
      canvas.height = Math.round(canvas.width / targetRatio);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, srcX, srcY, cropW, cropH, 0, 0, canvas.width, canvas.height);
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onUpdateTheme({
          ...theme,
          backgroundValue: croppedDataUrl,
          backgroundPositionX: 50,
          backgroundPositionY: 50,
          backgroundZoom: 100,
        });
        setCropStatus('Cropped & Applied!');
        setTimeout(() => setCropStatus(null), 2000);
      }
    };
    img.onerror = () => {
      setCropStatus('Crop failed (cross-origin)');
      setTimeout(() => setCropStatus(null), 2500);
    };
    img.src = theme.backgroundValue;
  };

  // Preset Handlers
  const handleSaveAsThemePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const saved = storage.addThemePreset(newPresetName.trim(), theme, newPresetDesc.trim());
    setThemePresets(storage.getThemePresets());
    setNewPresetName('');
    setNewPresetDesc('');
    setSaveSuccessNotice(`Theme preset "${saved.name}" successfully saved!`);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleApplyPreset = (preset: ThemePreset) => {
    onUpdateTheme({ ...preset.theme });
    setSaveSuccessNotice(`Applied "${preset.name}" preset!`);
    setTimeout(() => setSaveSuccessNotice(null), 2500);
  };

  const handleUpdatePreset = (presetId: string, name: string) => {
    storage.updateThemePreset(presetId, name, theme);
    setThemePresets(storage.getThemePresets());
    setSaveSuccessNotice(`Updated preset "${name}" with current window & background styles!`);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleDeletePreset = (presetId: string, name: string) => {
    storage.deleteThemePreset(presetId);
    setThemePresets(storage.getThemePresets());
    setSaveSuccessNotice(`Deleted preset "${name}"`);
    setTimeout(() => setSaveSuccessNotice(null), 2500);
  };

  const handleExportPresetsJson = () => {
    const customOnly = storage.getCustomThemePresets();
    const jsonStr = JSON.stringify(customOnly, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setSaveSuccessNotice('Copied custom theme presets JSON to clipboard!');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleImportPresetsSubmit = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed)) {
        storage.saveCustomThemePresets(parsed);
        setThemePresets(storage.getThemePresets());
        setIsImportModalOpen(false);
        setImportJsonText('');
        setSaveSuccessNotice(`Successfully imported ${parsed.length} theme preset(s)!`);
        setTimeout(() => setSaveSuccessNotice(null), 3000);
      } else {
        setImportStatus('Invalid format: Expected a JSON array of presets.');
      }
    } catch {
      setImportStatus('Invalid JSON syntax. Please check the text and try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Appearance & Theme Studio</h2>
              <p className="text-xs text-zinc-400">
                Customize window transparency, colors, edge radiuses, and theme presets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-5 sm:px-6 py-2.5 bg-zinc-950/40 border-b border-zinc-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('windows')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'windows'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Window Styling</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Sparkle className="w-3.5 h-3.5" />
            <span>Theme Presets</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
              {themePresets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wallpaper')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'wallpaper'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Wallpaper & Color Mode</span>
          </button>
        </div>

        {/* Feedback Alert Notice */}
        {saveSuccessNotice && (
          <div className="px-6 py-2 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{saveSuccessNotice}</span>
            <button
              type="button"
              onClick={() => setSaveSuccessNotice(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* ================= TAB 1: WINDOW STYLING ================= */}
          {activeTab === 'windows' && (
            <div className="space-y-6">
              {/* Interactive Live Mini-Window Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Live Window Appearance Preview</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Opacity: {windowOpacity}% &bull; Radius: {windowRadius}px &bull; Tint: {windowColor}
                  </span>
                </div>

                {/* Simulated Widget Window Card */}
                <div
                  className="relative p-4 shadow-xl overflow-hidden transition-all duration-200 min-h-[140px] flex flex-col justify-between"
                  style={{
                    backgroundColor: hexToRgba(windowColor, windowOpacity / 100),
                    borderRadius: `${windowRadius}px`,
                    backdropFilter: windowBlur > 0 ? `blur(${windowBlur}px)` : 'none',
                    WebkitBackdropFilter: windowBlur > 0 ? `blur(${windowBlur}px)` : 'none',
                    border:
                      windowBorderWidth > 0
                        ? `${windowBorderWidth}px solid ${hexToRgba(windowBorderColor, windowBorderOpacity / 100)}`
                        : 'none',
                  }}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                      <span className="font-bold text-zinc-100 text-xs">Sample Widget Window</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-zinc-300">
                        {windowRadius}px radius
                      </span>
                    </div>
                  </div>

                  <div className="py-2 space-y-1">
                    <p className="text-zinc-300 text-xs font-medium">
                      Window glass transparency, color tint, and border radius render live across all dashboard widgets.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <div
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: theme.accentColor }}
                      >
                        Accent Button
                      </div>
                      <div className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/10 text-zinc-200 border border-white/10">
                        Frost Pill
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Window Transparency & Opacity */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Window Transparency & Opacity
                  </label>
                  <span className="font-mono text-indigo-400 font-bold text-xs">
                    {windowOpacity}% Opacity ({100 - windowOpacity}% Transparent)
                  </span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="100"
                  value={windowOpacity}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      windowOpacity: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />

                {/* Opacity Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-zinc-500 font-medium">Quick Opacity:</span>
                  {WINDOW_OPACITY_PRESETS.map((op) => (
                    <button
                      key={op.label}
                      type="button"
                      onClick={() => onUpdateTheme({ ...theme, windowOpacity: op.value })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        windowOpacity === op.value
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Window Background Base Color & Tint */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Window Base Tint & Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-zinc-400 text-xs">{windowColor}</span>
                    <input
                      type="color"
                      value={windowColor.startsWith('#') ? windowColor : '#18181b'}
                      onChange={(e) => onUpdateTheme({ ...theme, windowColor: e.target.value })}
                      className="w-6 h-6 rounded border border-zinc-700 cursor-pointer bg-transparent"
                      title="Pick custom color"
                    />
                  </div>
                </div>

                {/* Color Swatch Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {WINDOW_COLOR_PRESETS.map((col) => {
                    const isSelected = windowColor.toLowerCase() === col.value.toLowerCase();
                    return (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() =>
                          onUpdateTheme({
                            ...theme,
                            windowColor: col.value,
                            windowBorderColor: col.border,
                          })
                        }
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/15 text-white ring-1 ring-indigo-500'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-lg border border-white/20 shadow-sm shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: col.value }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white drop-shadow" />}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-[11px] truncate">{col.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Hex input */}
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400 shrink-0">Custom Hex:</span>
                  <input
                    type="text"
                    value={windowColor}
                    onChange={(e) => onUpdateTheme({ ...theme, windowColor: e.target.value })}
                    placeholder="#18181b"
                    className="flex-1 bg-zinc-900 border border-zinc-700 text-white font-mono rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* 3. Window Edge / Corner Radius */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    Window Edge / Corner Radius
                  </label>
                  <span className="font-mono text-indigo-400 font-bold text-xs">{windowRadius}px</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="40"
                  value={windowRadius}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      windowRadius: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />

                {/* Corner Radius Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                  {WINDOW_RADIUS_PRESETS.map((rad) => {
                    const isSelected = windowRadius === rad.value;
                    return (
                      <button
                        key={rad.label}
                        type="button"
                        onClick={() => onUpdateTheme({ ...theme, windowRadius: rad.value })}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-sm'
                            : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        <div
                          className="w-5 h-5 border-2 border-indigo-400 bg-indigo-500/20"
                          style={{ borderRadius: `${Math.min(10, rad.value / 2.5)}px` }}
                        />
                        <span className="font-bold text-[10px]">{rad.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Backdrop Blur & Border Precision */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Backdrop Blur */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">Glass Backdrop Blur</span>
                    <span className="font-mono text-indigo-400 font-bold">{windowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={windowBlur}
                    onChange={(e) =>
                      onUpdateTheme({
                        ...theme,
                        windowBlur: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Defines the frosted glass optical diffusion behind widgets.
                  </p>
                </div>

                {/* Border Width & Opacity */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">Window Border Width</span>
                    <span className="font-mono text-indigo-400 font-bold">{windowBorderWidth}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      { label: '0px (None)', value: 0 },
                      { label: '1px (Subtle)', value: 1 },
                      { label: '2px (Bold)', value: 2 },
                      { label: '3px (Frame)', value: 3 },
                    ].map((bw) => (
                      <button
                        key={bw.label}
                        type="button"
                        onClick={() => onUpdateTheme({ ...theme, windowBorderWidth: bw.value })}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          windowBorderWidth === bw.value
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {bw.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-zinc-400">Border Color:</span>
                    <input
                      type="color"
                      value={windowBorderColor.startsWith('#') ? windowBorderColor : '#3f3f46'}
                      onChange={(e) => onUpdateTheme({ ...theme, windowBorderColor: e.target.value })}
                      className="w-5 h-5 rounded border border-zinc-700 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: THEME PRESETS ================= */}
          {activeTab === 'presets' && (
            <div className="space-y-6">
              {/* Save Current Customizations Form */}
              <form
                onSubmit={handleSaveAsThemePreset}
                className="p-4 rounded-2xl bg-zinc-950 border border-indigo-500/30 space-y-3"
              >
                <div className="flex items-center gap-2 text-indigo-400">
                  <BookmarkPlus className="w-4 h-4" />
                  <span className="font-bold text-xs text-white">
                    Save Active Window & Atmosphere as Theme Preset
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Preset Name *
                    </label>
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="e.g. My Ultra Sheer Glass or Obsidian Neon"
                      required
                      className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Optional Description
                    </label>
                    <input
                      type="text"
                      value={newPresetDesc}
                      onChange={(e) => setNewPresetDesc(e.target.value)}
                      placeholder="e.g. 24px radius, 30% sheer opacity with dark nebula"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-zinc-500">
                    Saves current window opacity ({windowOpacity}%), radius ({windowRadius}px), base tint ({windowColor}), and background.
                  </span>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Preset</span>
                  </button>
                </div>
              </form>

              {/* Theme Presets Catalog */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-300 uppercase tracking-wider text-xs">
                    Available Theme Presets ({themePresets.length})
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportPresetsJson}
                      className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                      title="Copy JSON to clipboard"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Export JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsImportModalOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Import</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {themePresets.map((preset) => {
                    const isCustom = !preset.isBuiltIn;
                    const pTheme = preset.theme;
                    const pColor = pTheme.windowColor || '#18181b';
                    const pOpacity = pTheme.windowOpacity !== undefined ? pTheme.windowOpacity : 65;
                    const pRadius = pTheme.windowRadius !== undefined ? pTheme.windowRadius : 16;

                    return (
                      <div
                        key={preset.id}
                        className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between gap-3 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {/* Swatch indicator of window appearance */}
                              <div
                                className="w-6 h-6 border border-white/20 shadow-sm flex items-center justify-center"
                                style={{
                                  backgroundColor: hexToRgba(pColor, pOpacity / 100),
                                  borderRadius: `${Math.min(10, pRadius / 2)}px`,
                                }}
                              >
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: pTheme.accentColor }}
                                />
                              </div>
                              <h3 className="font-bold text-zinc-100 text-xs truncate max-w-[180px]">
                                {preset.name}
                              </h3>
                            </div>

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isCustom
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              }`}
                            >
                              {isCustom ? 'Custom' : 'Built-in'}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 line-clamp-2">
                            {preset.description || `Radius: ${pRadius}px, Opacity: ${pOpacity}%`}
                          </p>

                          {/* Quick specs pill */}
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                              {pRadius}px radius
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                              {pOpacity}% opacity
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                              {pTheme.mode}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                          <button
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer text-center"
                          >
                            Apply Preset
                          </button>

                          {isCustom && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdatePreset(preset.id, preset.name)}
                                className="p-1.5 text-zinc-400 hover:text-amber-300 rounded-lg hover:bg-zinc-800 transition-colors"
                                title="Overwrite with current settings"
                              >
                                <RefreshCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePreset(preset.id, preset.name)}
                                className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                                title="Delete preset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: WALLPAPER & ATMOSPHERE ================= */}
          {activeTab === 'wallpaper' && (
            <div className="space-y-6">
              {/* Color Mode Switcher */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Color Mode
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'dark', label: 'Dark Mode', icon: Moon },
                    { id: 'oled', label: 'Midnight OLED', icon: Sparkles },
                    { id: 'light', label: 'Light Mode', icon: Sun },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isActive = theme.mode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onUpdateTheme({
                            ...theme,
                            mode: m.id as any,
                            backgroundType: m.id === 'oled' ? 'solid' : theme.backgroundType,
                            backgroundValue: m.id === 'oled' ? '#000000' : theme.backgroundValue,
                          });
                        }}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/10'
                            : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Accent Color
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {ACCENT_COLORS.map((c) => {
                    const isActive = theme.accentColor === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => onUpdateTheme({ ...theme, accentColor: c.value })}
                        className="relative w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-md"
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      >
                        {isActive && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background Wallpaper & Local Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Background Wallpaper
                  </label>
                  {theme.backgroundType === 'image' && (
                    <button
                      type="button"
                      onClick={() => setShowMoverPanel(!showMoverPanel)}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      <Move className="w-3.5 h-3.5" />
                      <span>{showMoverPanel ? 'Hide Position & Crop Controls' : 'Open Image Mover & Cropper'}</span>
                    </button>
                  )}
                </div>

                {/* Local Drive File Picker & Drag-and-Drop Dropzone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-4 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
                    isDraggingImage
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-zinc-700/80 bg-zinc-950/60 hover:border-indigo-500/60'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLocalImageSelect(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-200">
                      {isProcessingLocalImg ? 'Optimizing Image...' : 'Choose Local Background Image from Drive'}
                    </p>
                    <p className="text-zinc-500 text-[11px] mt-0.5">
                      Click to select or drag & drop PNG, JPG wallpaper &bull; Stored locally
                    </p>
                  </div>
                </div>

                {/* Interactive Image Mover & Cropping Control Box */}
                {theme.backgroundType === 'image' && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Move className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold text-zinc-200">Interactive Image Position & Crop</span>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Pos: {posX}%, {posY}% &bull; Zoom: {zoom}%
                      </span>
                    </div>

                    {/* Interactive Drag Preview Box */}
                    <div
                      ref={previewBoxRef}
                      onMouseDown={handlePreviewMouseDown}
                      className="relative w-full h-44 rounded-xl overflow-hidden border border-zinc-700 bg-black cursor-grab active:cursor-grabbing select-none group"
                      title="Click and drag image to reposition"
                    >
                      <div
                        className="w-full h-full transition-transform duration-75"
                        style={{
                          backgroundImage: `url(${theme.backgroundValue})`,
                          backgroundSize: fitMode === 'custom' ? `${zoom}% auto` : fitMode,
                          backgroundPosition: `${posX}% ${posY}%`,
                          backgroundRepeat: theme.backgroundRepeat || 'no-repeat',
                          transform: rotate ? `rotate(${rotate}deg)` : undefined,
                        }}
                      />

                      <div className="absolute inset-0 pointer-events-none border border-white/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border border-indigo-400/60 bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-300 font-mono">
                          +
                        </div>
                      </div>

                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur text-[10px] text-zinc-300 font-medium pointer-events-none">
                        Drag anywhere to pan image &bull; Click controls below
                      </div>
                    </div>

                    {/* Controls Sliders Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Horizontal Position X */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-400">Horizontal Pan (X)</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-indigo-400">{posX}%</span>
                            <button
                              type="button"
                              onClick={() => onUpdateTheme({ ...theme, backgroundPositionX: 50 })}
                              className="text-[10px] text-zinc-500 hover:text-white underline cursor-pointer"
                            >
                              Center
                            </button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={posX}
                          onChange={(e) =>
                            onUpdateTheme({
                              ...theme,
                              backgroundPositionX: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      {/* Vertical Position Y */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-400">Vertical Pan (Y)</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-indigo-400">{posY}%</span>
                            <button
                              type="button"
                              onClick={() => onUpdateTheme({ ...theme, backgroundPositionY: 50 })}
                              className="text-[10px] text-zinc-500 hover:text-white underline cursor-pointer"
                            >
                              Center
                            </button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={posY}
                          onChange={(e) =>
                            onUpdateTheme({
                              ...theme,
                              backgroundPositionY: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      {/* Zoom / Scale */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-400">Image Zoom</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-indigo-400">{zoom}%</span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateTheme({
                                  ...theme,
                                  backgroundZoom: 100,
                                  backgroundFit: 'cover',
                                })
                              }
                              className="text-[10px] text-zinc-500 hover:text-white underline cursor-pointer"
                            >
                              Reset 100%
                            </button>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="250"
                          value={zoom}
                          onChange={(e) =>
                            onUpdateTheme({
                              ...theme,
                              backgroundZoom: parseInt(e.target.value, 10),
                              backgroundFit: 'custom',
                            })
                          }
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>

                      {/* Sizing & Rotation Action Bar */}
                      <div className="space-y-1">
                        <span className="text-zinc-400 block text-[11px]">Sizing & Rotation</span>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={fitMode}
                            onChange={(e) =>
                              onUpdateTheme({
                                ...theme,
                                backgroundFit: e.target.value as any,
                              })
                            }
                            className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                          >
                            <option value="cover">Fill Screen (Cover)</option>
                            <option value="contain">Fit Full Image (Contain)</option>
                            <option value="custom">Custom Zoom Scale</option>
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              onUpdateTheme({
                                ...theme,
                                backgroundRotate: (rotate + 90) % 360,
                              })
                            }
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 cursor-pointer"
                            title="Rotate 90° clockwise"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Aspect Ratio Crop Tool */}
                    <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                          <Crop className="w-3.5 h-3.5 text-sky-400" />
                          <span>Aspect Ratio Crop Tool</span>
                        </span>
                        {cropStatus && (
                          <span className="text-[11px] text-emerald-400 font-bold">{cropStatus}</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {CROP_PRESETS.map((cp) => (
                          <button
                            key={cp.id}
                            type="button"
                            onClick={() => setSelectedCropRatio(cp.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              selectedCropRatio === cp.id
                                ? 'bg-sky-500/20 border border-sky-500/40 text-sky-300'
                                : 'bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {cp.label}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={handleApplyPermanentCrop}
                          className="ml-auto px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[11px] font-bold shadow-md shadow-sky-600/20 transition-colors cursor-pointer"
                        >
                          Crop & Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Presets Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {WALLPAPER_PRESETS.map((wp) => {
                    const isActive = theme.backgroundValue === wp.value;
                    return (
                      <div
                        key={wp.name}
                        onClick={() =>
                          onUpdateTheme({
                            ...theme,
                            backgroundType: wp.type,
                            backgroundValue: wp.value,
                            backgroundPositionX: 50,
                            backgroundPositionY: 50,
                            backgroundZoom: 100,
                            backgroundRotate: 0,
                            backgroundFit: 'cover',
                          })
                        }
                        className={`group relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                          isActive
                            ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-[1.02]'
                            : 'border-zinc-700/70 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {wp.type === 'image' ? (
                          <img src={wp.preview} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full ${wp.preview}`} />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[10px] font-semibold text-white truncate">
                            {wp.name}
                          </span>
                        </div>

                        {isActive && (
                          <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-indigo-600 text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom Image URL */}
                <input
                  type="url"
                  value={theme.backgroundType === 'image' && !theme.backgroundValue.startsWith('data:') ? theme.backgroundValue : ''}
                  onChange={(e) =>
                    onUpdateTheme({
                      ...theme,
                      backgroundType: 'image',
                      backgroundValue: e.target.value,
                    })
                  }
                  placeholder="Or paste external wallpaper image URL..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
                />
              </div>

              {/* Wallpaper Blur & Dim Adjustments */}
              <div className="space-y-3 pt-2 border-t border-zinc-800">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1">
                    <span>Background Dim Overlay</span>
                    <span className="font-mono text-indigo-400">{theme.backgroundDim}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={theme.backgroundDim}
                    onChange={(e) =>
                      onUpdateTheme({ ...theme, backgroundDim: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1">
                    <span>Background Blur Effect</span>
                    <span className="font-mono text-indigo-400">{theme.backgroundBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={theme.backgroundBlur}
                    onChange={(e) =>
                      onUpdateTheme({ ...theme, backgroundBlur: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-zinc-800 bg-zinc-950/70">
          <button
            type="button"
            onClick={() => {
              onUpdateTheme(storage.getTheme());
              onClose();
            }}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>

      {/* Import Presets Modal Subdialog */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Import Theme Presets</h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Paste the exported theme presets JSON array below to restore or add them to your collection.
            </p>

            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => {
                setImportJsonText(e.target.value);
                setImportStatus(null);
              }}
              placeholder='[ { "id": "custom-1", "name": "My Preset", "theme": { ... } } ]'
              className="w-full font-mono text-xs bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            {importStatus && (
              <p className="text-xs font-semibold text-rose-400">{importStatus}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportPresetsSubmit}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
              >
                Import Presets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
