import React, { useState, useRef } from 'react';
import {
  X,
  Palette,
  Image as ImageIcon,
  Sliders,
  Upload,
  Check,
  Sparkles,
  Grid,
} from 'lucide-react';
import {
  SpaceBackgroundConfig,
  SpaceBackgroundType,
} from '../../types/space';
import {
  BACKGROUND_SOLID_PRESETS,
  BACKGROUND_GRADIENT_PRESETS,
  BACKGROUND_TEXTURE_PRESETS,
} from '../../utils/spaceDefaults';
import { uiSound } from '../../services/uiSound';
import { compressImageFile } from '../../utils/imageCompressor';

interface SpaceBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundConfig: SpaceBackgroundConfig;
  onUpdate: (updated: Partial<SpaceBackgroundConfig>) => void;
}

export const SpaceBackgroundModal: React.FC<SpaceBackgroundModalProps> = ({
  isOpen,
  onClose,
  backgroundConfig,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<SpaceBackgroundType>(backgroundConfig.type);
  const [customUrl, setCustomUrl] = useState(
    backgroundConfig.type === 'image' ? backgroundConfig.value : ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressImageFile(file, 1600, 1600, 0.82);
      if (dataUrl) {
        uiSound.playPlace();
        onUpdate({
          type: 'image',
          value: dataUrl,
        });
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          uiSound.playPlace();
          onUpdate({
            type: 'image',
            value: dataUrl,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      uiSound.playPlace();
      onUpdate({
        type: 'image',
        value: customUrl.trim(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Space Background</h2>
              <p className="text-xs text-zinc-400">Configure your creative canvas canvas & atmosphere</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 pt-4 pb-2 border-b border-zinc-800/60 bg-zinc-900/20 overflow-x-auto">
          {(
            [
              { id: 'texture', label: 'Textures & Surfaces' },
              { id: 'gradient', label: 'Atmospheric Gradients' },
              { id: 'solid', label: 'Solid Minimal' },
              { id: 'image', label: 'Custom Wallpaper' },
            ] as Array<{ id: SpaceBackgroundType; label: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                uiSound.playClick();
                setActiveTab(tab.id);
                // Also update type if selecting presets
                if (tab.id === 'texture' && backgroundConfig.type !== 'texture') {
                  onUpdate({ type: 'texture', value: 'corkboard' });
                } else if (tab.id === 'gradient' && backgroundConfig.type !== 'gradient') {
                  onUpdate({ type: 'gradient', value: BACKGROUND_GRADIENT_PRESETS[0].value });
                } else if (tab.id === 'solid' && backgroundConfig.type !== 'solid') {
                  onUpdate({ type: 'solid', value: BACKGROUND_SOLID_PRESETS[0].value });
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TEXTURES */}
          {activeTab === 'texture' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Creative Surfaces
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BACKGROUND_TEXTURE_PRESETS.map((tex) => {
                  const isSelected =
                    backgroundConfig.type === 'texture' && backgroundConfig.value === tex.id;
                  return (
                    <button
                      key={tex.id}
                      type="button"
                      onClick={() => {
                        uiSound.playPlace();
                        onUpdate({ type: 'texture', value: tex.id });
                      }}
                      className={`relative h-24 rounded-2xl p-3 flex flex-col justify-end text-left border overflow-hidden transition-all group cursor-pointer ${
                        isSelected
                          ? 'border-violet-400 ring-2 ring-violet-500/40 scale-[1.02]'
                          : 'border-zinc-800 hover:border-zinc-600'
                      }`}
                      style={tex.css}
                    >
                      {/* Dark gradient for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                      <div className="relative z-10 flex items-center justify-between w-full">
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{tex.name}</p>
                          <p className="text-[10px] text-zinc-300 line-clamp-1">{tex.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ATMOSPHERIC GRADIENTS */}
          {activeTab === 'gradient' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Smooth Moody Gradients
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BACKGROUND_GRADIENT_PRESETS.map((grad) => {
                  const isSelected =
                    backgroundConfig.type === 'gradient' && backgroundConfig.value === grad.value;
                  return (
                    <button
                      key={grad.id}
                      type="button"
                      onClick={() => {
                        uiSound.playPlace();
                        onUpdate({ type: 'gradient', value: grad.value });
                      }}
                      className={`relative h-24 rounded-2xl p-3 flex flex-col justify-end text-left border overflow-hidden transition-all group cursor-pointer ${
                        isSelected
                          ? 'border-violet-400 ring-2 ring-violet-500/40 scale-[1.02]'
                          : 'border-zinc-800 hover:border-zinc-600'
                      }`}
                      style={{ background: grad.value }}
                    >
                      <div className="relative z-10 flex items-center justify-between w-full">
                        <p className="text-xs font-bold text-white drop-shadow-md">{grad.name}</p>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 shadow">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SOLID MINIMAL */}
          {activeTab === 'solid' && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Studio Solid Tones
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {BACKGROUND_SOLID_PRESETS.map((sol) => {
                  const isSelected =
                    backgroundConfig.type === 'solid' && backgroundConfig.value === sol.value;
                  return (
                    <button
                      key={sol.id}
                      type="button"
                      onClick={() => {
                        uiSound.playPlace();
                        onUpdate({ type: 'solid', value: sol.value });
                      }}
                      className={`relative h-18 rounded-2xl p-3 flex items-center justify-between border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-violet-400 ring-2 ring-violet-500/40 scale-[1.02]'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                      style={{ backgroundColor: sol.value }}
                    >
                      <span className="text-xs font-bold" style={{ color: sol.text }}>
                        {sol.name}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CUSTOM WALLPAPER */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              {/* File upload */}
              <div>
                <span className="text-xs font-semibold text-zinc-400 block mb-2">
                  Upload Wallpaper:
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-zinc-700 hover:border-violet-500 rounded-2xl flex flex-col items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer bg-zinc-900/40"
                >
                  <Upload className="w-6 h-6 mb-1 text-violet-400" />
                  <span className="text-xs font-semibold">Choose image file from computer</span>
                  <span className="text-[10px] text-zinc-500">Supports PNG, JPG, WebP</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* URL Input */}
              <div>
                <span className="text-xs font-semibold text-zinc-400 block mb-1.5">
                  Or use Image URL:
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 outline-none focus:border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADJUSTMENT SLIDERS & GRID (Dim, Blur, Dot Grid) */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-4">
            <span className="text-xs font-semibold text-zinc-300 block">
              Atmosphere & Canvas Grid
            </span>

            {/* Dim Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Darken / Dim Overlay</span>
                <span className="font-mono text-zinc-200">{backgroundConfig.dim ?? 15}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={85}
                value={backgroundConfig.dim ?? 15}
                onChange={(e) => onUpdate({ dim: parseInt(e.target.value, 10) })}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            {/* Blur Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Backdrop Soft Blur</span>
                <span className="font-mono text-zinc-200">{backgroundConfig.blur ?? 0}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={backgroundConfig.blur ?? 0}
                onChange={(e) => onUpdate({ blur: parseInt(e.target.value, 10) })}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            {/* Grid Overlay Toggle */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-300">Design Grid Alignment Dots</span>
              </div>
              <input
                type="checkbox"
                checked={backgroundConfig.showGrid ?? false}
                onChange={(e) => onUpdate({ showGrid: e.target.checked })}
                className="w-4 h-4 rounded text-violet-600 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/50 flex justify-end">
          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-violet-600/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
