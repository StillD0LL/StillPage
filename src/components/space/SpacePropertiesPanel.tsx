import React, { useRef } from 'react';
import {
  Sliders,
  X,
  Lock,
  Unlock,
  Move,
  RotateCw,
  Eye,
  Layers,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Sparkles,
  Type,
  Image as ImageIcon,
  Video,
  MousePointerClick,
  Check,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import {
  SpaceElement,
  TextBoxElement,
  ImageFrameElement,
  VideoPlayerElement,
  CustomButtonElement,
  TextNoteTheme,
  TextFontFamily,
  TextFontSize,
  TextAlign,
  TapeStyle,
  TapeColor,
  PhotoStyle,
  PhotoAspectRatio,
  ButtonStyleVariant,
  ButtonActionType,
} from '../../types/space';
import { CURATED_PHOTOS, CURATED_VIDEOS } from '../../utils/spaceDefaults';
import { compressImageFile } from '../../utils/imageCompressor';
import { uiSound } from '../../services/uiSound';

interface SpacePropertiesPanelProps {
  element: SpaceElement | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updated: Partial<SpaceElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  saveStatus: 'saved' | 'saving' | 'error';
  lastSavedAt: number | null;
}

export const SpacePropertiesPanel: React.FC<SpacePropertiesPanelProps> = ({
  element,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  saveStatus,
  lastSavedAt,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !element) return null;

  const handleUpdate = (updated: Partial<SpaceElement>) => {
    onUpdate(element.id, updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressImageFile(file, 1200, 1200, 0.85);
      if (dataUrl) {
        uiSound.playPlace();
        handleUpdate({ imageUrl: dataUrl } as Partial<ImageFrameElement>);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const rawUrl = ev.target?.result as string;
        if (rawUrl) {
          uiSound.playPlace();
          handleUpdate({ imageUrl: rawUrl } as Partial<ImageFrameElement>);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getElementTitle = () => {
    switch (element.type) {
      case 'text':
        return 'Text Note';
      case 'image':
        return 'Image Frame';
      case 'video':
        return 'Video Player';
      case 'button':
        return 'Custom Button';
      default:
        return 'Element';
    }
  };

  const getElementIcon = () => {
    switch (element.type) {
      case 'text':
        return <Type className="w-4 h-4 text-amber-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'button':
        return <MousePointerClick className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <aside
      id="space-properties-panel"
      className="absolute top-16 right-6 bottom-24 z-40 w-80 bg-zinc-950/90 border border-zinc-800/80 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col text-zinc-200 overflow-hidden animate-in slide-in-from-right-4 fade-in duration-200"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center">
            {getElementIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white tracking-wide uppercase">
                {getElementTitle()}
              </h2>
              {element.isLocked && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-medium border border-amber-500/30">
                  Locked
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              {saveStatus === 'saving' ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Auto-saving changes...
                </span>
              ) : saveStatus === 'error' ? (
                <span className="text-rose-400">Save failed</span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  Auto-saved to storage
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            uiSound.playClick();
            onClose();
          }}
          className="w-7 h-7 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Close Properties"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Properties Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-xs">
        {/* SECTION 1: Transform & Layout */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Move className="w-3 h-3 text-indigo-400" />
              Transform
            </span>
            <button
              type="button"
              onClick={() => {
                uiSound.playClick();
                handleUpdate({ isLocked: !element.isLocked });
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                element.isLocked
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {element.isLocked ? (
                <>
                  <Lock className="w-3 h-3" /> Locked
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3" /> Unlocked
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* X Position */}
            <div className="bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/80">
              <label className="text-[10px] text-zinc-400 block mb-1">Position X</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={element.x}
                  onChange={(e) => handleUpdate({ x: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black/40 border border-zinc-700/60 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-zinc-500">px</span>
              </div>
            </div>

            {/* Y Position */}
            <div className="bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/80">
              <label className="text-[10px] text-zinc-400 block mb-1">Position Y</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={element.y}
                  onChange={(e) => handleUpdate({ y: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black/40 border border-zinc-700/60 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-zinc-500">px</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Width */}
            <div className="bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/80">
              <label className="text-[10px] text-zinc-400 block mb-1">Width</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={140}
                  max={960}
                  value={element.width}
                  onChange={(e) =>
                    handleUpdate({
                      width: Math.max(140, Math.min(960, parseInt(e.target.value) || 280)),
                    })
                  }
                  className="w-full bg-black/40 border border-zinc-700/60 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-zinc-500">px</span>
              </div>
            </div>

            {/* Height */}
            <div className="bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/80">
              <label className="text-[10px] text-zinc-400 block mb-1">Height</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={60}
                  max={840}
                  value={element.height || ''}
                  placeholder="Auto"
                  onChange={(e) =>
                    handleUpdate({
                      height: e.target.value ? Math.max(60, parseInt(e.target.value)) : undefined,
                    })
                  }
                  className="w-full bg-black/40 border border-zinc-700/60 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-zinc-500">px</span>
              </div>
            </div>
          </div>

          {/* Rotation Control */}
          <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-zinc-400 flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-indigo-400" /> Rotation
              </label>
              <span className="text-[11px] font-mono text-zinc-200">{element.rotation || 0}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              value={element.rotation || 0}
              onChange={(e) => handleUpdate({ rotation: parseInt(e.target.value) || 0 })}
              className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between pt-1">
              {[-15, 0, 15, 45, 90].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => {
                    uiSound.playClick();
                    handleUpdate({ rotation: deg });
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer transition-colors ${
                    (element.rotation || 0) === deg
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          {/* Opacity Control */}
          <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80 mt-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-indigo-400" /> Opacity
              </label>
              <span className="text-[11px] font-mono text-zinc-200">
                {Math.round((element.opacity !== undefined ? element.opacity : 1) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.15}
              max={1}
              step={0.05}
              value={element.opacity !== undefined ? element.opacity : 1}
              onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* SECTION 2: Element-Specific Properties */}
        <div className="border-t border-zinc-800/80 pt-4">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2.5">
            Element Content & Style
          </span>

          {/* TEXT BOX PROPERTIES */}
          {element.type === 'text' && (
            <div className="space-y-3">
              {/* Text Note Color Theme */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1.5">Theme Palette</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: 'amber', label: 'Amber', color: '#fef3c7' },
                      { id: 'lavender', label: 'Lavender', color: '#ede9fe' },
                      { id: 'mint', label: 'Mint', color: '#ecfdf5' },
                      { id: 'rose', label: 'Rose', color: '#ffe4e6' },
                      { id: 'kraft', label: 'Kraft', color: '#d7c4a3' },
                      { id: 'dark', label: 'Slate', color: '#1e293b' },
                      { id: 'transparent', label: 'Clear', color: 'transparent' },
                    ] as Array<{ id: TextNoteTheme; label: string; color: string }>
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        uiSound.playClick();
                        handleUpdate({ theme: t.id } as Partial<TextBoxElement>);
                      }}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-medium flex items-center justify-between cursor-pointer transition-all ${
                        (element as TextBoxElement).theme === t.id
                          ? 'border-indigo-500 ring-1 ring-indigo-500 bg-zinc-800 text-white'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="truncate">{t.label}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: t.color }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family & Size */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Typography</label>
                  <select
                    value={(element as TextBoxElement).fontFamily}
                    onChange={(e) =>
                      handleUpdate({
                        fontFamily: e.target.value as TextFontFamily,
                      } as Partial<TextBoxElement>)
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="sans">Modern Sans</option>
                    <option value="serif">Classic Serif</option>
                    <option value="mono">Code Monospace</option>
                    <option value="handwriting">Handwriting</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Font Size</label>
                  <select
                    value={(element as TextBoxElement).fontSize}
                    onChange={(e) =>
                      handleUpdate({
                        fontSize: e.target.value as TextFontSize,
                      } as Partial<TextBoxElement>)
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="sm">Small (12px)</option>
                    <option value="base">Standard (14px)</option>
                    <option value="lg">Medium (16px)</option>
                    <option value="xl">Large (18px)</option>
                    <option value="2xl">Display (22px)</option>
                  </select>
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Alignment</label>
                <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  {(
                    [
                      { id: 'left', icon: AlignLeft },
                      { id: 'center', icon: AlignCenter },
                      { id: 'right', icon: AlignRight },
                    ] as Array<{ id: TextAlign; icon: React.FC<{ className?: string }> }>
                  ).map((a) => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          uiSound.playClick();
                          handleUpdate({ align: a.id } as Partial<TextBoxElement>);
                        }}
                        className={`flex-1 py-1 rounded flex items-center justify-center cursor-pointer transition-colors ${
                          (element as TextBoxElement).align === a.id
                            ? 'bg-indigo-600 text-white'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note Content Textarea */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Note Content</label>
                <textarea
                  rows={4}
                  value={(element as TextBoxElement).text}
                  onChange={(e) =>
                    handleUpdate({ text: e.target.value } as Partial<TextBoxElement>)
                  }
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
                  placeholder="Write your note..."
                />
              </div>
            </div>
          )}

          {/* IMAGE FRAME PROPERTIES */}
          {element.type === 'image' && (
            <div className="space-y-3">
              {/* Photo Upload & URL */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Photo Source</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={(element as ImageFrameElement).imageUrl}
                    onChange={(e) =>
                      handleUpdate({ imageUrl: e.target.value } as Partial<ImageFrameElement>)
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-zinc-700"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              </div>

              {/* Curated Presets */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Quick Photos</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {CURATED_PHOTOS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        uiSound.playPlace();
                        handleUpdate({
                          imageUrl: p.url,
                          caption: p.caption,
                        } as Partial<ImageFrameElement>);
                      }}
                      className="aspect-square rounded-lg overflow-hidden border border-zinc-800 hover:border-indigo-500 relative group cursor-pointer transition-all"
                    >
                      <img
                        src={p.url}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Handwritten Caption</label>
                <input
                  type="text"
                  value={(element as ImageFrameElement).caption || ''}
                  onChange={(e) =>
                    handleUpdate({ caption: e.target.value } as Partial<ImageFrameElement>)
                  }
                  placeholder="e.g. Kyoto Sunset • 2024"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['1:1', '4:3', '3:2', '16:9'] as PhotoAspectRatio[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        uiSound.playClick();
                        handleUpdate({ aspectRatio: r } as Partial<ImageFrameElement>);
                      }}
                      className={`py-1 rounded-lg text-[10px] font-mono cursor-pointer transition-colors border ${
                        (element as ImageFrameElement).aspectRatio === r
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tape Style */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Tape Style</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'dual-corner', label: 'Corner Tapes' },
                      { id: 'top-center', label: 'Top Tape' },
                      { id: 'scotch', label: 'Clear Tape' },
                      { id: 'none', label: 'No Tape' },
                    ] as Array<{ id: TapeStyle; label: string }>
                  ).map((ts) => (
                    <button
                      key={ts.id}
                      type="button"
                      onClick={() => {
                        uiSound.playClick();
                        handleUpdate({ tapeStyle: ts.id } as Partial<ImageFrameElement>);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[10px] border cursor-pointer transition-colors text-left ${
                        (element as ImageFrameElement).tapeStyle === ts.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-medium'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {ts.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Frame Style */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Frame Style</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'polaroid', label: 'Polaroid' },
                      { id: 'classic', label: 'White Border' },
                      { id: 'film', label: 'Film Frame' },
                      { id: 'minimal', label: 'Frameless' },
                    ] as Array<{ id: PhotoStyle; label: string }>
                  ).map((ps) => (
                    <button
                      key={ps.id}
                      type="button"
                      onClick={() => {
                        uiSound.playClick();
                        handleUpdate({ photoStyle: ps.id } as Partial<ImageFrameElement>);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[10px] border cursor-pointer transition-colors text-left ${
                        (element as ImageFrameElement).photoStyle === ps.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-medium'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {ps.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIDEO PLAYER PROPERTIES */}
          {element.type === 'video' && (
            <div className="space-y-3">
              {/* Title */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Player Title</label>
                <input
                  type="text"
                  value={(element as VideoPlayerElement).title || ''}
                  onChange={(e) =>
                    handleUpdate({ title: e.target.value } as Partial<VideoPlayerElement>)
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* URL */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">
                  YouTube / Video URL
                </label>
                <input
                  type="text"
                  value={(element as VideoPlayerElement).videoUrl}
                  onChange={(e) =>
                    handleUpdate({ videoUrl: e.target.value } as Partial<VideoPlayerElement>)
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Ambient Presets */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Ambient Presets</label>
                <div className="space-y-1">
                  {CURATED_VIDEOS.map((vid) => (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => {
                        uiSound.playClick();
                        handleUpdate({
                          videoUrl: vid.url,
                          title: vid.title,
                        } as Partial<VideoPlayerElement>);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 hover:text-white flex items-center justify-between cursor-pointer transition-colors text-left"
                    >
                      <span className="truncate">{vid.title}</span>
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 cursor-pointer">
                  <span className="text-[11px] text-zinc-300">Loop Playback</span>
                  <input
                    type="checkbox"
                    checked={!!(element as VideoPlayerElement).loop}
                    onChange={(e) =>
                      handleUpdate({ loop: e.target.checked } as Partial<VideoPlayerElement>)
                    }
                    className="accent-indigo-500 rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 cursor-pointer">
                  <span className="text-[11px] text-zinc-300">Start Muted</span>
                  <input
                    type="checkbox"
                    checked={!!(element as VideoPlayerElement).muted}
                    onChange={(e) =>
                      handleUpdate({ muted: e.target.checked } as Partial<VideoPlayerElement>)
                    }
                    className="accent-indigo-500 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* CUSTOM BUTTON PROPERTIES */}
          {element.type === 'button' && (
            <div className="space-y-3">
              {/* Button Label */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Button Label</label>
                <input
                  type="text"
                  value={(element as CustomButtonElement).label}
                  onChange={(e) =>
                    handleUpdate({ label: e.target.value } as Partial<CustomButtonElement>)
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              {/* Visual Style */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Visual Style</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'gradient', label: 'Cosmic Gradient' },
                      { id: 'neon', label: 'Neon Cyber' },
                      { id: 'glass', label: 'Frosted Glass' },
                      { id: 'solid', label: 'Solid Slate' },
                      { id: 'pastel', label: 'Pastel Sunrise' },
                    ] as Array<{ id: ButtonStyleVariant; label: string }>
                  ).map((bs) => (
                    <button
                      key={bs.id}
                      type="button"
                      onClick={() => {
                        uiSound.playClick();
                        handleUpdate({ buttonStyle: bs.id } as Partial<CustomButtonElement>);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[10px] border cursor-pointer transition-colors text-left ${
                        (element as CustomButtonElement).buttonStyle === bs.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-medium'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {bs.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Type */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Action on Click</label>
                <select
                  value={(element as CustomButtonElement).actionType}
                  onChange={(e) =>
                    handleUpdate({
                      actionType: e.target.value as ButtonActionType,
                    } as Partial<CustomButtonElement>)
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="cheer">Sparkles & Sound Effect</option>
                  <option value="quote">Inspirational Affirmation</option>
                  <option value="link">Open External Link</option>
                  <option value="page">Navigate to App Page</option>
                </select>
              </div>

              {/* Action Payload */}
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">
                  {(element as CustomButtonElement).actionType === 'link'
                    ? 'Target URL'
                    : (element as CustomButtonElement).actionType === 'page'
                    ? 'Target Page (dashboard, writer, start)'
                    : 'Custom Message'}
                </label>
                <input
                  type="text"
                  value={(element as CustomButtonElement).actionPayload || ''}
                  onChange={(e) =>
                    handleUpdate({ actionPayload: e.target.value } as Partial<CustomButtonElement>)
                  }
                  placeholder={
                    (element as CustomButtonElement).actionType === 'link'
                      ? 'https://example.com'
                      : (element as CustomButtonElement).actionType === 'page'
                      ? 'dashboard'
                      : 'You are doing great!'
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Layers & Actions */}
        <div className="border-t border-zinc-800/80 pt-4 space-y-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-indigo-400" />
            Layering & Actions
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                uiSound.playClick();
                onBringToFront(element.id);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[11px]"
            >
              <ArrowUp className="w-3.5 h-3.5" /> Bring to Front
            </button>
            <button
              type="button"
              onClick={() => {
                uiSound.playClick();
                onSendToBack(element.id);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[11px]"
            >
              <ArrowDown className="w-3.5 h-3.5" /> Send to Back
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                uiSound.playClick();
                onDuplicate(element.id);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[11px]"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
            <button
              type="button"
              onClick={() => {
                uiSound.playDelete();
                onDelete(element.id);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-[11px]"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
