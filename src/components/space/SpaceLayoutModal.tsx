import React, { useState } from 'react';
import {
  X,
  Save,
  Bookmark,
  Sparkles,
  Check,
  Trash2,
  FolderPlus,
  Play,
  Film,
  Layers,
  Palette,
  ChevronRight,
  HardDrive,
  Copy,
} from 'lucide-react';
import { SpaceLayout, SpaceElement, SpaceBackgroundConfig } from '../../types/space';
import { uiSound } from '../../services/uiSound';

interface SpaceLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedLayouts: SpaceLayout[];
  activeLayoutId: string | null;
  currentElements: SpaceElement[];
  currentBackground: SpaceBackgroundConfig;
  onSaveLayout: (name: string, description?: string) => void;
  onLoadLayout: (layout: SpaceLayout) => void;
  onDeleteLayout: (id: string) => void;
}

export const SpaceLayoutModal: React.FC<SpaceLayoutModalProps> = ({
  isOpen,
  onClose,
  savedLayouts,
  activeLayoutId,
  currentElements,
  currentBackground,
  onSaveLayout,
  onLoadLayout,
  onDeleteLayout,
}) => {
  const [tab, setTab] = useState<'save' | 'browse'>('browse');
  const [layoutName, setLayoutName] = useState('');
  const [layoutDesc, setLayoutDesc] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  // Media breakdown of current canvas
  const videoElements = currentElements.filter((el) => el.type === 'video');
  const imageElements = currentElements.filter((el) => el.type === 'image');
  const textElements = currentElements.filter((el) => el.type === 'text');
  const buttonElements = currentElements.filter((el) => el.type === 'button');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = layoutName.trim();
    if (!trimmed) return;

    uiSound.playPlace();
    onSaveLayout(trimmed, layoutDesc.trim() || undefined);
    setSaveSuccess(true);
    setLayoutName('');
    setLayoutDesc('');

    setTimeout(() => {
      setSaveSuccess(false);
      setTab('browse');
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Space Custom Layouts & Presets
              </h2>
              <p className="text-[11px] text-zinc-400">
                Save and switch between your element arrangements with custom media
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center px-6 pt-3 pb-2 gap-2 border-b border-zinc-800/80 bg-zinc-950/80">
          <button
            type="button"
            onClick={() => setTab('browse')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              tab === 'browse'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Layouts ({savedLayouts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('save')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              tab === 'save'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Save Current Layout</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'browse' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Select a layout to instantly arrange your Space elements and media</span>
                <button
                  type="button"
                  onClick={() => setTab('save')}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Save current</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {savedLayouts.map((layout) => {
                  const isActive = activeLayoutId === layout.id;
                  const videos = layout.elements.filter((el) => el.type === 'video');
                  const images = layout.elements.filter((el) => el.type === 'image');
                  const texts = layout.elements.filter((el) => el.type === 'text');

                  return (
                    <div
                      key={layout.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-2.5 ${
                        isActive
                          ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-950/50'
                          : 'bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-zinc-100 text-sm truncate">
                              {layout.name}
                            </h3>
                            {layout.isPreset ? (
                              <span className="px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-bold">
                                Preset
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold">
                                Custom
                              </span>
                            )}
                            {isActive && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" />
                                Active
                              </span>
                            )}
                          </div>
                          {layout.description && (
                            <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                              {layout.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              uiSound.playPlace();
                              onLoadLayout(layout);
                              onClose();
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white'
                            }`}
                          >
                            <span>{isActive ? 'Reload' : 'Apply Layout'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          {!layout.isPreset && (
                            <button
                              type="button"
                              onClick={() => {
                                uiSound.playDelete();
                                onDeleteLayout(layout.id);
                              }}
                              className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Delete custom layout"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Element breakdown chips */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-800/60 text-[10px] text-zinc-400">
                        <span className="flex items-center gap-1 font-medium text-zinc-300">
                          <Layers className="w-3 h-3 text-indigo-400" />
                          {layout.elements.length} elements
                        </span>
                        {videos.length > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            <Film className="w-2.5 h-2.5" />
                            {videos.length} {videos.length === 1 ? 'Video' : 'Videos'}
                          </span>
                        )}
                        {images.length > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20">
                            <span>📷</span>
                            {images.length} {images.length === 1 ? 'Photo' : 'Photos'}
                          </span>
                        )}
                        {texts.length > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <span>📝</span>
                            {texts.length} {texts.length === 1 ? 'Note' : 'Notes'}
                          </span>
                        )}
                        <span className="flex items-center gap-1 ml-auto text-zinc-500 text-[10px]">
                          <Palette className="w-3 h-3" />
                          {layout.background.type} bg
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-indigo-400" />
                  Save Current Canvas Layout & Media
                </h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  This will snapshot your entire canvas arrangement: all text notes, photo frames,
                  video players (including your chosen media URLs and local videos), and background
                  ambiance.
                </p>

                {/* Canvas Summary Preview */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Total Elements:</span>
                    <span className="font-semibold text-zinc-200">
                      {currentElements.length} elements
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Background:</span>
                    <span className="font-semibold text-zinc-200 capitalize">
                      {currentBackground.type} ({currentBackground.dim}% dim)
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Media & Videos:</span>
                    <span className="font-semibold text-sky-400">
                      {videoElements.length} video player{videoElements.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Images & Notes:</span>
                    <span className="font-semibold text-amber-400">
                      {imageElements.length} photos, {textElements.length} notes
                    </span>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                      Layout Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={layoutName}
                      onChange={(e) => setLayoutName(e.target.value)}
                      placeholder="e.g. Chill Twilight Loft, Deep Focus Studio"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={layoutDesc}
                      onChange={(e) => setLayoutDesc(e.target.value)}
                      placeholder="e.g. Floating nature stream and sticky daily goals"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Layout saved successfully! Added to your custom layouts.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTab('browse')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!layoutName.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Layout</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
