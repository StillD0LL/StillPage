import React, { useState, useRef } from 'react';
import {
  Upload,
  Link,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Check,
  RotateCw,
} from 'lucide-react';
import {
  ImageFrameElement,
  TapeStyle,
  TapeColor,
  PhotoStyle,
  PhotoAspectRatio,
} from '../../../types/space';
import { CURATED_PHOTOS } from '../../../utils/spaceDefaults';
import { uiSound } from '../../../services/uiSound';
import { compressImageFile } from '../../../utils/imageCompressor';

interface ImageFrameElementViewProps {
  element: ImageFrameElement;
  isSelected: boolean;
  isViewMode: boolean;
  onUpdate: (updated: Partial<ImageFrameElement>) => void;
}

const TAPE_COLORS: Record<TapeColor, { bg: string; border: string; shadow: string }> = {
  crepe: {
    bg: 'rgba(245, 236, 215, 0.78)',
    border: 'rgba(215, 200, 175, 0.6)',
    shadow: 'rgba(50, 40, 30, 0.18)',
  },
  'washi-pink': {
    bg: 'rgba(251, 207, 232, 0.82)',
    border: 'rgba(244, 114, 182, 0.5)',
    shadow: 'rgba(190, 24, 93, 0.15)',
  },
  'washi-mint': {
    bg: 'rgba(167, 243, 208, 0.82)',
    border: 'rgba(52, 211, 153, 0.5)',
    shadow: 'rgba(5, 150, 105, 0.15)',
  },
  kraft: {
    bg: 'rgba(180, 145, 115, 0.75)',
    border: 'rgba(140, 105, 75, 0.5)',
    shadow: 'rgba(40, 25, 15, 0.25)',
  },
  neon: {
    bg: 'rgba(56, 189, 248, 0.8)',
    border: 'rgba(14, 165, 233, 0.6)',
    shadow: 'rgba(2, 132, 199, 0.2)',
  },
};

const ASPECT_RATIO_CLASSES: Record<PhotoAspectRatio, string> = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '3:2': 'aspect-[3/2]',
  '16:9': 'aspect-[16/9]',
};

export const ImageFrameElementView: React.FC<ImageFrameElementViewProps> = ({
  element,
  isSelected,
  isViewMode,
  onUpdate,
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tapeColorStyle = TAPE_COLORS[element.tapeColor] || TAPE_COLORS.crepe;
  const aspectClass = ASPECT_RATIO_CLASSES[element.aspectRatio] || ASPECT_RATIO_CLASSES['1:1'];

  // Handle local file upload with auto-compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressImageFile(file, 1200, 1200, 0.85);
      if (dataUrl) {
        uiSound.playPlace();
        onUpdate({
          imageUrl: dataUrl,
          caption: element.caption || file.name.replace(/\.[^/.]+$/, ''),
        });
        setIsPickerOpen(false);
      }
    } catch (err) {
      console.warn('Image processing failed, falling back to direct reader', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const fallbackUrl = event.target?.result as string;
        if (fallbackUrl) {
          uiSound.playPlace();
          onUpdate({
            imageUrl: fallbackUrl,
            caption: element.caption || file.name.replace(/\.[^/.]+$/, ''),
          });
          setIsPickerOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (inputUrl.trim()) {
      uiSound.playPlace();
      onUpdate({ imageUrl: inputUrl.trim() });
      setInputUrl('');
      setIsPickerOpen(false);
    }
  };

  return (
    <div className="relative group w-full select-none">
      {/* 1. Realistic Taped Masking Tape Accents */}
      {element.tapeStyle !== 'none' && (
        <>
          {element.tapeStyle === 'dual-corner' && (
            <>
              {/* Top-Left Corner Tape */}
              <div
                className="absolute -top-3.5 -left-4 w-12 h-6 z-20 pointer-events-none rounded-[1px] backdrop-blur-[1px]"
                style={{
                  backgroundColor: tapeColorStyle.bg,
                  border: `1px solid ${tapeColorStyle.border}`,
                  boxShadow: `0 2px 4px ${tapeColorStyle.shadow}`,
                  transform: 'rotate(-32deg)',
                  clipPath:
                    'polygon(0% 15%, 8% 0%, 92% 0%, 100% 12%, 96% 88%, 92% 100%, 8% 100%, 0% 85%)',
                }}
              />
              {/* Top-Right Corner Tape */}
              <div
                className="absolute -top-3.5 -right-4 w-12 h-6 z-20 pointer-events-none rounded-[1px] backdrop-blur-[1px]"
                style={{
                  backgroundColor: tapeColorStyle.bg,
                  border: `1px solid ${tapeColorStyle.border}`,
                  boxShadow: `0 2px 4px ${tapeColorStyle.shadow}`,
                  transform: 'rotate(28deg)',
                  clipPath:
                    'polygon(0% 10%, 8% 0%, 92% 0%, 100% 18%, 97% 88%, 92% 100%, 8% 100%, 3% 85%)',
                }}
              />
            </>
          )}

          {element.tapeStyle === 'top-center' && (
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 z-20 pointer-events-none rounded-[1px] backdrop-blur-[1px]"
              style={{
                backgroundColor: tapeColorStyle.bg,
                border: `1px solid ${tapeColorStyle.border}`,
                boxShadow: `0 2px 5px ${tapeColorStyle.shadow}`,
                transform: 'translateX(-50%) rotate(-1.5deg)',
                clipPath:
                  'polygon(2% 15%, 7% 0%, 93% 0%, 98% 12%, 97% 88%, 93% 100%, 7% 100%, 3% 85%)',
              }}
            />
          )}

          {element.tapeStyle === 'scotch' && (
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 z-20 pointer-events-none rounded-[1px]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                transform: 'translateX(-50%) rotate(1deg)',
              }}
            />
          )}
        </>
      )}

      {/* 2. Physical Photograph Frame (Polaroid / Photo Print on board) */}
      <div
        className="w-full bg-[#faf9f6] text-zinc-900 rounded-sm p-3 pb-8 transition-all"
        style={{
          boxShadow:
            '0 20px 35px -10px rgba(0, 0, 0, 0.4), 0 6px 12px -3px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(0,0,0,0.06)',
        }}
      >
        {/* Inner Photo Container */}
        <div className={`relative w-full ${aspectClass} overflow-hidden bg-zinc-950 rounded-[2px] shadow-inner`}>
          {element.imageUrl ? (
            <img
              src={element.imageUrl}
              alt={element.caption || 'Space photograph'}
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 p-4 text-center">
              <Camera className="w-8 h-8 mb-2 opacity-50 text-zinc-400" />
              <p className="text-xs">No photograph chosen</p>
            </div>
          )}

          {/* Quick Change Photo Overlay in Design Mode */}
          {!isViewMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                uiSound.playClick();
                setIsPickerOpen(!isPickerOpen);
              }}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[2px] cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Change Photo</span>
            </button>
          )}
        </div>

        {/* Polaroid Chin / Caption Area */}
        <div className="mt-3.5 px-1 text-center min-h-[24px]">
          {isViewMode || !isEditingCaption ? (
            <p
              onClick={() => !isViewMode && setIsEditingCaption(true)}
              className={`text-zinc-800 font-serif italic text-sm tracking-wide cursor-text select-text ${
                !element.caption && !isViewMode ? 'opacity-40 hover:opacity-70' : ''
              }`}
              title={!isViewMode ? 'Click to edit caption' : undefined}
            >
              {element.caption || (!isViewMode ? 'Click to add caption...' : '')}
            </p>
          ) : (
            <input
              type="text"
              autoFocus
              value={element.caption || ''}
              onChange={(e) => onUpdate({ caption: e.target.value })}
              onBlur={() => setIsEditingCaption(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingCaption(false)}
              placeholder="Caption..."
              className="w-full text-center bg-transparent outline-none font-serif italic text-sm text-zinc-900 border-b border-zinc-400/80 px-1"
            />
          )}
        </div>
      </div>

      {/* Hidden File Input for uploading images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Photo Customization Popover (When change photo is clicked or selected) */}
      {isPickerOpen && !isViewMode && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 p-3.5 rounded-2xl bg-zinc-950/95 border border-zinc-700/80 text-zinc-100 shadow-2xl shadow-black/80 backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-xs"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-zinc-800 font-semibold text-zinc-200">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-pink-400" />
              Photograph Settings
            </span>
            <button
              type="button"
              onClick={() => setIsPickerOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Upload Button */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 font-semibold transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Photo from Computer
            </button>
          </div>

          {/* Direct URL Input */}
          <div className="mb-3">
            <label className="text-[11px] text-zinc-400 block mb-1">Or paste image URL:</label>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-2.5 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Curated Aesthetic Photos */}
          <div className="mb-3">
            <span className="text-[11px] text-zinc-400 block mb-1.5">Aesthetic Presets:</span>
            <div className="grid grid-cols-3 gap-1.5 max-h-32 overflow-y-auto pr-1">
              {CURATED_PHOTOS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    uiSound.playPlace();
                    onUpdate({ imageUrl: p.url, caption: p.caption });
                  }}
                  className="group/p relative aspect-square rounded-lg overflow-hidden border border-zinc-700 hover:border-pink-400 cursor-pointer transition-all"
                  title={p.title}
                >
                  <img
                    src={p.url}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover/p:scale-110 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/p:opacity-100 flex items-center justify-center text-[10px] text-white font-medium text-center p-1">
                    {p.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tape Style & Color Customizer */}
          <div className="pt-2 border-t border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Tape Style:</span>
              <div className="flex gap-1">
                {(['dual-corner', 'top-center', 'scotch', 'none'] as TapeStyle[]).map((ts) => (
                  <button
                    key={ts}
                    type="button"
                    onClick={() => {
                      uiSound.playClick();
                      onUpdate({ tapeStyle: ts });
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                      element.tapeStyle === ts ? 'bg-pink-500/30 text-pink-300 border border-pink-500/50' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {ts === 'dual-corner' ? 'Corners' : ts === 'top-center' ? 'Center' : ts === 'scotch' ? 'Scotch' : 'None'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Tape Color:</span>
              <div className="flex gap-1">
                {(['crepe', 'washi-pink', 'washi-mint', 'kraft', 'neon'] as TapeColor[]).map((tc) => (
                  <button
                    key={tc}
                    type="button"
                    onClick={() => {
                      uiSound.playClick();
                      onUpdate({ tapeColor: tc });
                    }}
                    className={`w-4 h-4 rounded-full border cursor-pointer transition-transform ${
                      element.tapeColor === tc ? 'scale-125 ring-2 ring-pink-400' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor:
                        tc === 'crepe'
                          ? '#f5ecd7'
                          : tc === 'washi-pink'
                          ? '#fbcfe8'
                          : tc === 'washi-mint'
                          ? '#a7f3d0'
                          : tc === 'kraft'
                          ? '#b49173'
                          : '#38bdf8',
                    }}
                    title={tc}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Ratio:</span>
              <div className="flex gap-1">
                {(['1:1', '4:3', '3:2', '16:9'] as PhotoAspectRatio[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      uiSound.playClick();
                      onUpdate({ aspectRatio: r });
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                      element.aspectRatio === r ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
