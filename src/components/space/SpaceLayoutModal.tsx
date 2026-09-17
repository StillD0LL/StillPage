import React, { useState, useEffect, useRef } from 'react';
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
  Download,
  Upload,
  RefreshCw,
  FileCode,
  AlertCircle,
  Share2,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { SpaceLayout, SpaceElement, SpaceBackgroundConfig } from '../../types/space';
import { storage } from '../../services/storage';
import { uiSound } from '../../services/uiSound';

interface SpaceLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedLayouts: SpaceLayout[];
  activeLayoutId: string | null;
  currentElements: SpaceElement[];
  currentBackground: SpaceBackgroundConfig;
  initialTab?: 'browse' | 'save' | 'sync';
  onSaveLayout: (name: string, description?: string) => boolean | void;
  onLoadLayout: (layout: SpaceLayout) => void;
  onDeleteLayout: (id: string) => void;
  onImportLayouts?: (count: number) => void;
}

type ModalTab = 'browse' | 'save' | 'sync';

export const SpaceLayoutModal: React.FC<SpaceLayoutModalProps> = ({
  isOpen,
  onClose,
  savedLayouts,
  activeLayoutId,
  currentElements,
  currentBackground,
  initialTab = 'browse',
  onSaveLayout,
  onLoadLayout,
  onDeleteLayout,
  onImportLayouts,
}) => {
  const [tab, setTab] = useState<ModalTab>(initialTab);
  const [layoutName, setLayoutName] = useState('');
  const [layoutDesc, setLayoutDesc] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync / Import states
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedCodeSuccess, setCopiedCodeSuccess] = useState(false);
  const [copiedJsonLayoutId, setCopiedJsonLayoutId] = useState<string | null>(null);
  const [copiedAllSuccess, setCopiedAllSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync tab with initialTab prop whenever modal re-opens
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setSaveSuccess(false);
      setSaveError(null);
      setImportFeedback(null);
    }
  }, [isOpen, initialTab]);

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
    setSaveError(null);
    try {
      const result = onSaveLayout(trimmed, layoutDesc.trim() || undefined);
      if (result === false) {
        setSaveError('Failed to save layout. Browser storage limit may have been reached.');
        return;
      }
      setSaveSuccess(true);
      setLayoutName('');
      setLayoutDesc('');

      setTimeout(() => {
        setSaveSuccess(false);
        setTab('browse');
      }, 1200);
    } catch (err) {
      setSaveError('Unexpected error saving layout to storage.');
    }
  };

  // 1. Export single layout
  const handleExportSingle = (layout: SpaceLayout) => {
    uiSound.playClick();
    const jsonStr = storage.exportSingleSpaceLayout(layout.id) || JSON.stringify(layout, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `space-layout-${layout.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 2. Copy single layout JSON
  const handleCopySingle = async (layout: SpaceLayout) => {
    uiSound.playClick();
    const jsonStr = storage.exportSingleSpaceLayout(layout.id) || JSON.stringify(layout, null, 2);
    try {
      await navigator.clipboard.writeText(jsonStr);
      setCopiedJsonLayoutId(layout.id);
      setTimeout(() => setCopiedJsonLayoutId(null), 2000);
    } catch {
      // Fallback
    }
  };

  // 3. Export all layouts as JSON file
  const handleExportAll = () => {
    uiSound.playClick();
    const jsonStr = storage.exportSpaceLayouts();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-space-layouts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 4. Copy all layouts JSON to clipboard
  const handleCopyAll = async () => {
    uiSound.playClick();
    const jsonStr = storage.exportSpaceLayouts();
    try {
      await navigator.clipboard.writeText(jsonStr);
      setCopiedAllSuccess(true);
      setTimeout(() => setCopiedAllSuccess(false), 2200);
    } catch {
      // Fallback
    }
  };

  // 5. Copy TypeScript Code for defaults
  const handleCopyDefaultsCode = async () => {
    uiSound.playClick();
    const code = `export const DEFAULT_SPACE_LAYOUTS: SpaceLayout[] = ${JSON.stringify(savedLayouts, null, 2)};\n`;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeSuccess(true);
      setTimeout(() => setCopiedCodeSuccess(false), 2500);
    } catch {
      // Fallback
    }
  };

  // 6. Handle file upload for import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processImport(text);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 7. Process import from text or file
  const processImport = (jsonStr: string) => {
    uiSound.playPlace();
    const res = storage.importSpaceLayouts(jsonStr, importMode);
    if (res.success) {
      setImportFeedback({
        type: 'success',
        message: `Successfully imported ${res.count} layout${res.count === 1 ? '' : 's'}!`,
      });
      setImportText('');
      onImportLayouts?.(res.count);
      setTimeout(() => {
        setImportFeedback(null);
        setTab('browse');
      }, 1500);
    } else {
      setImportFeedback({
        type: 'error',
        message: res.error || 'Failed to parse layout JSON.',
      });
    }
  };

  // 8. Reset to default presets
  const handleResetDefaults = () => {
    uiSound.playDelete();
    storage.resetSpaceLayoutsToDefaults();
    setShowConfirmReset(false);
    onImportLayouts?.(0);
    setImportFeedback({
      type: 'success',
      message: 'Reset space layouts to factory curated presets.',
    });
    setTimeout(() => {
      setImportFeedback(null);
      setTab('browse');
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl max-h-[88vh] rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Space Presets & Layouts
              </h2>
              <p className="text-[11px] text-zinc-400 line-clamp-1">
                Save, load, and transfer canvas element arrangements with media
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
        <div className="flex items-center px-4 sm:px-6 pt-2.5 pb-2 gap-1.5 sm:gap-2 border-b border-zinc-800/80 bg-zinc-950/80 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setTab('browse')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              tab === 'browse'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Presets ({savedLayouts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('save')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              tab === 'save'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Save Current</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('sync')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              tab === 'sync'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Sync to Website</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {tab === 'browse' ? (
            <div className="space-y-3">
              {/* Quick Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400 bg-zinc-900/40 p-2.5 rounded-2xl border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400">
                  Select a layout to arrange your Space elements & media instantly:
                </span>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleExportAll}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Download all presets as JSON file"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('sync')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Import or sync presets across environments"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Import</span>
                  </button>
                </div>
              </div>

              {/* Layout Cards */}
              <div className="space-y-2.5">
                {savedLayouts.map((layout) => {
                  const isActive = activeLayoutId === layout.id;
                  const videos = layout.elements.filter((el) => el.type === 'video');
                  const images = layout.elements.filter((el) => el.type === 'image');
                  const texts = layout.elements.filter((el) => el.type === 'text');

                  return (
                    <div
                      key={layout.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-2.5 ${
                        isActive
                          ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg shadow-indigo-950/50'
                          : 'bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
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

                        {/* Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Copy JSON */}
                          <button
                            type="button"
                            onClick={() => handleCopySingle(layout)}
                            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy layout JSON to clipboard"
                          >
                            {copiedJsonLayoutId === layout.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Download JSON */}
                          <button
                            type="button"
                            onClick={() => handleExportSingle(layout)}
                            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Download layout JSON file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Apply Layout Button */}
                          <button
                            type="button"
                            onClick={() => {
                              uiSound.playPlace();
                              onLoadLayout(layout);
                              onClose();
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                              isActive
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white'
                            }`}
                          >
                            <span>{isActive ? 'Reload' : 'Apply'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          {/* Delete custom layout */}
                          {!layout.isPreset && (
                            <button
                              type="button"
                              onClick={() => {
                                uiSound.playDelete();
                                onDeleteLayout(layout.id);
                              }}
                              className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer ml-0.5"
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
          ) : tab === 'save' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-indigo-400" />
                  Save Current Canvas Layout & Media
                </h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Snapshots your active canvas arrangement: text notes, photo frames,
                  video players (including YouTube URLs & media settings), and ambiance background.
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
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Layout saved successfully! Added to your custom layouts.</span>
                </div>
              )}

              {saveError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Tip: Presets saved here are stored in your browser's local storage. To transfer your preset to your published website, switch to the <strong>Sync to Website</strong> tab after saving.
                </span>
              </div>

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
          ) : (
            /* Sync & Transfer Tab */
            <div className="space-y-4">
              {/* Educational Explanation Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-amber-200">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Why didn't my Gemini Studio presets appear on my published site?</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Web browsers isolate <strong>localStorage</strong> between domains. Layout presets saved in the Gemini Studio preview URL live in that preview's local storage and are not automatically transferred to your published domain (e.g. GitHub Pages).
                </p>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  To get your presets onto your published website, choose one of the two straightforward methods below:
                </p>
              </div>

              {/* Method 1: Export & Import */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <h3 className="text-xs font-bold text-zinc-100">
                      Export & Import Presets JSON
                    </h3>
                  </div>
                  <span className="text-[10px] text-zinc-400">Works across all browsers</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Export your layouts from Gemini Studio as a JSON file, then open your published website and import it right here.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExportAll}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedAllSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Copy All JSON</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Import Area */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-zinc-300">
                      Import Presets on this Device
                    </label>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-zinc-500">Mode:</span>
                      <button
                        type="button"
                        onClick={() => setImportMode('merge')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          importMode === 'merge' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                        }`}
                      >
                        Merge
                      </button>
                      <button
                        type="button"
                        onClick={() => setImportMode('replace')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          importMode === 'replace' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                        }`}
                      >
                        Replace
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="space-layout-file-input"
                    />
                    <label
                      htmlFor="space-layout-file-input"
                      className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-medium flex items-center justify-center gap-2 border border-zinc-700/80 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-sky-400" />
                      <span>Upload .json File</span>
                    </label>
                  </div>

                  {/* Paste JSON option */}
                  <div>
                    <textarea
                      rows={2}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="Or paste Space Layout JSON here..."
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-200 placeholder-zinc-500 outline-none focus:border-indigo-500 resize-none font-mono"
                    />
                    {importText.trim() && (
                      <button
                        type="button"
                        onClick={() => processImport(importText)}
                        className="mt-1.5 w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Apply Pasted Layouts
                      </button>
                    )}
                  </div>

                  {importFeedback && (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        importFeedback.type === 'success'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {importFeedback.type === 'success' ? (
                        <Check className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{importFeedback.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Method 2: Permanently Embed in Codebase */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <h3 className="text-xs font-bold text-zinc-100">
                      Permanent Build-in (Best for Published Site)
                    </h3>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">Zero-setup for visitors</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Make your custom presets the permanent built-in default for every single person who visits your published website, even on fresh devices.
                </p>

                <button
                  type="button"
                  onClick={handleCopyDefaultsCode}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedCodeSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied TypeScript Defaults!</span>
                    </>
                  ) : (
                    <>
                      <FileCode className="w-4 h-4 text-emerald-400" />
                      <span>Copy Preset Defaults Code for spaceDefaults.ts</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-zinc-500">
                  Ask the assistant: "Save my current Space layouts into spaceDefaults.ts" or paste the copied code into <code>/src/utils/spaceDefaults.ts</code>.
                </p>
              </div>

              {/* Reset to Factory Presets */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-zinc-800">
                <span className="text-zinc-500 text-[11px]">Factory Reset</span>
                {showConfirmReset ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmReset(false)}
                      className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white text-[11px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDefaults}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-medium text-[11px] cursor-pointer"
                    >
                      Confirm Reset
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(true)}
                    className="text-zinc-400 hover:text-rose-400 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Original 3 Presets</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
