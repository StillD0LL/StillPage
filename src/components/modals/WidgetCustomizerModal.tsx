import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutGrid,
  Sun,
  Calendar,
  Rss,
  Bookmark,
  FileText,
  CheckSquare,
  Clock,
  Images,
  Video,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Check,
  Download,
  Upload,
  RefreshCw,
  Copy,
  Info,
  BookmarkCheck,
  Layers,
  Film,
  Camera,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import {
  WidgetConfig,
  WidgetType,
  WidgetSize,
  LayoutPreset,
  SpaceLayout,
  SpaceElement,
  SpaceBackgroundConfig,
  PageId,
} from '../../types';
import { storage } from '../../services/storage';
import { uiSound } from '../../services/uiSound';

interface WidgetCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onToggleWidget: (id: string, enabled: boolean) => void;
  onResizeWidget: (id: string, size: WidgetSize) => void;
  onApplyLayoutPreset: (preset: LayoutPreset | string) => void;
  onResetLayout: () => void;
  initialTab?: 'widgets' | 'presets';
  onNavigateToSpace?: () => void;
  activePage?: PageId;
}

const WIDGET_METADATA: Record<
  WidgetType,
  { name: string; description: string; icon: React.ReactNode; defaultSize: WidgetSize }
> = {
  clock: {
    name: 'Time & Greeting',
    description: 'Digital/analog clock, dynamic greeting, date, and timezone.',
    icon: <Clock className="w-5 h-5 text-indigo-400" />,
    defaultSize: '1x1',
  },
  weather: {
    name: 'Live Weather Forecast',
    description: 'Real-time conditions, hourly trends, and 7-day forecast with GPS/city search.',
    icon: <Sun className="w-5 h-5 text-amber-400" />,
    defaultSize: '2x1',
  },
  calendar: {
    name: 'Calendar & Events',
    description: 'Interactive month grid, upcoming agenda feed, reminders, and tags.',
    icon: <Calendar className="w-5 h-5 text-emerald-400" />,
    defaultSize: '2x2',
  },
  rss: {
    name: 'Custom RSS News Feeds',
    description: 'Multi-source news aggregator with thumbnails, previews, and custom feeds.',
    icon: <Rss className="w-5 h-5 text-orange-400" />,
    defaultSize: '2x2',
  },
  bookmarks: {
    name: 'Bookmarks',
    description: 'Thumbnail card bookmark manager with category tabs and custom tags.',
    icon: <Bookmark className="w-5 h-5 text-indigo-400" />,
    defaultSize: 'full',
  },
  notes: {
    name: 'Quick Scratchpad',
    description: 'Multi-tab notes with automatic local storage saving and markdown styling.',
    icon: <FileText className="w-5 h-5 text-sky-400" />,
    defaultSize: '1x2',
  },
  tasks: {
    name: 'Focus Tasks & To-Do',
    description: 'Daily focus task tracker with priorities, completion rate, and progress bar.',
    icon: <CheckSquare className="w-5 h-5 text-purple-400" />,
    defaultSize: '1x2',
  },
  gallery: {
    name: 'Image Gallery',
    description: 'Cycle images from local drive on an auto-playing wallpaper banner.',
    icon: <Images className="w-5 h-5 text-pink-400" />,
    defaultSize: '3x1',
  },
  video: {
    name: 'Video Player',
    description: 'Play local MP4 video clips or embed auto-looping YouTube videos.',
    icon: <Video className="w-5 h-5 text-red-400" />,
    defaultSize: '2x2',
  },
};

export const WidgetCustomizerModal: React.FC<WidgetCustomizerModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onResizeWidget,
  onApplyLayoutPreset,
  onResetLayout,
  initialTab = 'widgets',
  onNavigateToSpace,
  activePage,
}) => {
  const [activeTab, setActiveTab] = useState<'widgets' | 'presets'>(initialTab);
  const [presetCategory, setPresetCategory] = useState<'dashboard' | 'space'>(() => {
    return activePage === 'space' ? 'space' : 'dashboard';
  });

  // Dashboard presets
  const [presets, setPresets] = useState<LayoutPreset[]>(() => storage.getLayoutPresets());
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmOverwriteId, setConfirmOverwriteId] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Space Canvas layouts & presets
  const [spaceLayouts, setSpaceLayouts] = useState<SpaceLayout[]>(() => storage.getSavedSpaceLayouts());
  const [activeSpaceLayoutId, setActiveSpaceLayoutId] = useState<string | null>(() => storage.getActiveSpaceLayoutId());
  const [isSavingSpaceLayout, setIsSavingSpaceLayout] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDesc, setNewSpaceDesc] = useState('');
  const [confirmDeleteSpaceId, setConfirmDeleteSpaceId] = useState<string | null>(null);
  const [spaceFilter, setSpaceFilter] = useState<'all' | 'custom' | 'presets'>('all');

  // Keep layouts up-to-date across components
  useEffect(() => {
    const handleUpdate = () => {
      setSpaceLayouts(storage.getSavedSpaceLayouts());
      setActiveSpaceLayoutId(storage.getActiveSpaceLayoutId());
      setPresets(storage.getLayoutPresets());
    };
    window.addEventListener('space-layouts-updated', handleUpdate);
    return () => window.removeEventListener('space-layouts-updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPresets(storage.getLayoutPresets());
      setSpaceLayouts(storage.getSavedSpaceLayouts());
      setActiveSpaceLayoutId(storage.getActiveSpaceLayoutId());
      if (activePage === 'space') {
        setPresetCategory('space');
      }
    }
  }, [isOpen, activePage]);

  if (!isOpen) return null;

  const refreshPresets = () => {
    setPresets(storage.getLayoutPresets());
    setSpaceLayouts(storage.getSavedSpaceLayouts());
    setActiveSpaceLayoutId(storage.getActiveSpaceLayoutId());
  };

  const handleSaveCurrentSpaceLayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    const elements = storage.getSpaceElements();
    const bg = storage.getSpaceBackground();
    const newLayout: SpaceLayout = {
      id: `layout-custom-${Date.now()}`,
      name: newSpaceName.trim(),
      description: newSpaceDesc.trim() || `${elements.length} elements with custom media`,
      elements: JSON.parse(JSON.stringify(elements)),
      background: JSON.parse(JSON.stringify(bg)),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPreset: false,
    };
    const ok = storage.saveSpaceLayout(newLayout);
    const updated = storage.getSavedSpaceLayouts();
    setSpaceLayouts(updated);
    setActiveSpaceLayoutId(newLayout.id);
    setIsSavingSpaceLayout(false);
    setNewSpaceName('');
    setNewSpaceDesc('');
    uiSound.playPlace();
    setSaveSuccessMsg(ok ? `Custom space layout "${newLayout.name}" saved to presets!` : 'Storage limit reached - layout partially saved');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleApplySpaceLayout = (layout: SpaceLayout, shouldNavigate = false) => {
    uiSound.playPlace();
    const cloned = JSON.parse(JSON.stringify(layout.elements));
    storage.saveSpaceElements(cloned);
    storage.saveSpaceBackground(layout.background);
    storage.setActiveSpaceLayoutId(layout.id);
    setActiveSpaceLayoutId(layout.id);
    setSaveSuccessMsg(`Applied Space Canvas layout: "${layout.name}"`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
    if (shouldNavigate && onNavigateToSpace) {
      onClose();
      onNavigateToSpace();
    }
  };

  const handleDeleteSpaceLayout = (id: string, name: string) => {
    uiSound.playClick();
    storage.deleteSpaceLayout(id);
    const updated = storage.getSavedSpaceLayouts();
    setSpaceLayouts(updated);
    if (activeSpaceLayoutId === id) {
      const fallback = updated[0]?.id || null;
      setActiveSpaceLayoutId(fallback);
      storage.setActiveSpaceLayoutId(fallback);
    }
    setConfirmDeleteSpaceId(null);
    setSaveSuccessMsg(`Deleted space layout "${name}"`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleExportSpaceLayout = (layout: SpaceLayout) => {
    const json = JSON.stringify(layout, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `space-layout-${layout.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveCurrentPreset = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPresetName.trim()) return;

    const saved = storage.saveCurrentLayoutAsPreset(newPresetName, widgets, newPresetDesc);
    refreshPresets();
    setNewPresetName('');
    setNewPresetDesc('');
    setIsSavingPreset(false);
    setSaveSuccessMsg(`Preset "${saved.name}" saved successfully!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleOverwritePreset = (preset: LayoutPreset) => {
    storage.updateLayoutPreset(preset.id, preset.name, widgets);
    refreshPresets();
    setConfirmOverwriteId(null);
    setSaveSuccessMsg(`Preset "${preset.name}" updated with current layout!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleDeletePreset = (id: string, name: string) => {
    storage.deleteLayoutPreset(id);
    refreshPresets();
    setConfirmDeleteId(null);
    setSaveSuccessMsg(`Deleted layout preset "${name}"`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleExportPreset = (preset: LayoutPreset) => {
    const json = JSON.stringify(preset, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout-preset-${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportPreset = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed || !parsed.widgets || !Array.isArray(parsed.widgets)) {
        setImportError('Invalid preset format: missing widgets array');
        return;
      }
      const newPreset = storage.saveCurrentLayoutAsPreset(
        parsed.name || 'Imported Preset',
        parsed.widgets,
        parsed.description || 'Imported from JSON'
      );
      refreshPresets();
      setImportJsonText('');
      setShowImportBox(false);
      setSaveSuccessMsg(`Preset "${newPreset.name}" imported!`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch {
      setImportError('Failed to parse JSON. Please check formatting.');
    }
  };

  const validWidgets = widgets
    .filter(
      (w) =>
        w &&
        WIDGET_METADATA[w.type] &&
        !String(w.type).toLowerCase().includes('character') &&
        !String(w.type).toLowerCase().includes('showcase') &&
        !String(w.id).toLowerCase().includes('character') &&
        !String(w.id).toLowerCase().includes('showcase') &&
        w.id !== 'widget-music'
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const activeWidgetsCount = validWidgets.filter((w) => w.enabled).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dashboard Layout & Presets</h2>
              <p className="text-xs text-zinc-400">
                Configure active widgets, card sizes, and save/load layout presets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-950/30">
          <div className="flex items-center gap-1 -mb-px">
            <button
              type="button"
              onClick={() => setActiveTab('widgets')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'widgets'
                  ? 'border-indigo-500 text-indigo-300 font-bold bg-indigo-500/10'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Widgets & Sizing</span>
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-zinc-300 font-mono">
                {activeWidgetsCount}/{validWidgets.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('presets');
                refreshPresets();
              }}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'border-indigo-500 text-indigo-300 font-bold bg-indigo-500/10'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Saved Layout Presets</span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                {presets.length + spaceLayouts.length}
              </span>
            </button>
          </div>

          {activeTab === 'presets' && (
            <button
              type="button"
              onClick={() => {
                if (presetCategory === 'space') {
                  setIsSavingSpaceLayout(!isSavingSpaceLayout);
                } else {
                  setIsSavingPreset(!isSavingPreset);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{presetCategory === 'space' ? 'Save Current Space Canvas' : 'Save Current Layout'}</span>
            </button>
          )}
        </div>

        {/* Feedback Message */}
        {saveSuccessMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Tab 1: Widgets Customizer */}
        {activeTab === 'widgets' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Quick Presets Ribbon */}
            {presets.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Saved Presets</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('presets');
                      refreshPresets();
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                  >
                    Manage All Presets →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {presets.slice(0, 4).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onApplyLayoutPreset(preset);
                        setSaveSuccessMsg(`Applied layout: "${preset.name}"`);
                        setTimeout(() => setSaveSuccessMsg(null), 2500);
                      }}
                      className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-indigo-600/20 border border-zinc-700/60 hover:border-indigo-500/50 text-left transition-all group cursor-pointer"
                    >
                      <div className="text-xs font-bold text-zinc-200 group-hover:text-indigo-300 truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {preset.widgets.filter((w) => w.enabled).length} widgets
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Widgets List */}
            <div>
              <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Available Widgets</span>
                <span className="text-[11px] font-normal text-zinc-400">
                  {activeWidgetsCount} of {validWidgets.length} enabled
                </span>
              </div>

              <div className="space-y-2.5">
                {validWidgets.map((widget) => {
                  const meta = WIDGET_METADATA[widget.type] || {
                    name: widget.title,
                    description: '',
                    icon: <LayoutGrid className="w-5 h-5 text-zinc-400" />,
                  };

                  return (
                    <div
                      key={widget.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        widget.enabled
                          ? 'bg-zinc-800/50 border-zinc-700/60'
                          : 'bg-zinc-900/40 border-zinc-800/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-700/50 shrink-0">
                          {meta.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                            <span>{meta.name}</span>
                            {!widget.enabled && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-500 font-normal">
                                Hidden
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                            {meta.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        {/* Sizing dropdown */}
                        <select
                          value={widget.size}
                          onChange={(e) => onResizeWidget(widget.id, e.target.value as WidgetSize)}
                          disabled={!widget.enabled}
                          className="bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 rounded-lg px-2 py-1 focus:outline-none disabled:opacity-40"
                        >
                          <option value="1x1">1×1 Compact</option>
                          <option value="2x1">2×1 Wide</option>
                          <option value="1x2">1×2 Tall</option>
                          <option value="2x2">2×2 Large</option>
                          <option value="3x1">3×1 Banner</option>
                          <option value="3x2">3×2 Wide Large</option>
                          <option value="portrait">Portrait 720×1080 (2:3)</option>
                          <option value="poster">Large Portrait (2×3)</option>
                          <option value="shorts">YouTube Short (9:16)</option>
                          <option value="full">Full Width</option>
                        </select>

                        {/* Toggle On/Off Switch */}
                        <button
                          type="button"
                          onClick={() => onToggleWidget(widget.id, !widget.enabled)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            widget.enabled
                              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700'
                          }`}
                        >
                          {widget.enabled ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Saved Layout Presets */}
        {activeTab === 'presets' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Presets Category Switcher (Dashboard Widgets vs Space Canvas Layouts) */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <button
                type="button"
                onClick={() => setPresetCategory('dashboard')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  presetCategory === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Dashboard Widgets ({presets.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setPresetCategory('space')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  presetCategory === 'space'
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30 font-extrabold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Space Canvas Layouts ({spaceLayouts.length})</span>
              </button>
            </div>

            {presetCategory === 'dashboard' && (
              <div className="space-y-6">
                {/* Save Current Layout Form */}
                {isSavingPreset ? (
              <form
                onSubmit={handleSaveCurrentPreset}
                className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-200 uppercase tracking-wider">
                    <Save className="w-4 h-4 text-indigo-400" />
                    <span>Save Current Layout to Preset</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSavingPreset(false)}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                      Preset Name *
                    </label>
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="e.g., Work Station, Night Lofi, Minimalist Daily"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newPresetDesc}
                      onChange={(e) => setNewPresetDesc(e.target.value)}
                      placeholder="e.g., Tasks, calendar agenda, and note scratchpad"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-indigo-300/80">
                    Captures {activeWidgetsCount} enabled widgets and their exact sizes/order.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSavingPreset(false)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newPresetName.trim()}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Preset</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-800/40 border border-zinc-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                    <BookmarkCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-200">
                      Save Current Workspace Configuration
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Currently {activeWidgetsCount} widgets active with customized card dimensions.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSavingPreset(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save as Preset</span>
                </button>
              </div>
            )}

            {/* Presets List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider">
                <span>All Layout Presets ({presets.length})</span>
                <button
                  type="button"
                  onClick={() => setShowImportBox(!showImportBox)}
                  className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold lowercase tracking-normal"
                >
                  <Upload className="w-3 h-3" />
                  <span>{showImportBox ? 'Close Import' : 'Import Preset JSON'}</span>
                </button>
              </div>

              {/* Import JSON Sub-box */}
              {showImportBox && (
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-700 space-y-2.5">
                  <div className="text-xs font-bold text-zinc-200">Paste Layout Preset JSON</div>
                  <textarea
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder='{"name": "My Preset", "widgets": [...]}'
                    className="w-full h-20 bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 font-mono text-[11px] text-zinc-300 focus:outline-none focus:border-indigo-500"
                  />
                  {importError && (
                    <div className="text-rose-400 text-[11px]">{importError}</div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowImportBox(false)}
                      className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleImportPreset}
                      disabled={!importJsonText.trim()}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                    >
                      Import
                    </button>
                  </div>
                </div>
              )}

              {presets.length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-800/20 border border-zinc-800 text-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/80 text-zinc-400 mx-auto flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-200">No saved layout presets</h4>
                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                    Arrange and resize your widgets on the dashboard, then click "Save as Preset" above to create your custom layout preset.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {presets.map((preset) => {
                    const enabledCount = preset.widgets.filter((w) => w.enabled).length;

                    return (
                      <div
                        key={preset.id}
                        className="p-3.5 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800/80 border border-zinc-700/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-zinc-100">{preset.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-medium">
                              Saved Preset
                            </span>
                            <span className="text-[11px] text-zinc-400 font-medium">
                              • {enabledCount} widgets
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                            {preset.description || 'Configured layout preset'}
                          </p>

                          {/* Active widgets mini preview tags */}
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {preset.widgets
                              .filter((w) => w.enabled)
                              .map((w) => (
                                <span
                                  key={w.id}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900/80 border border-zinc-700/50 text-zinc-300 font-mono"
                                >
                                  {w.title} ({w.size})
                                </span>
                              ))}
                          </div>
                        </div>

                        {/* Action buttons */}
                        {confirmDeleteId === preset.id ? (
                          <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-500/50 px-3 py-1.5 rounded-xl animate-in fade-in shrink-0">
                            <span className="text-[11px] text-rose-200 font-semibold">Delete preset?</span>
                            <button
                              type="button"
                              onClick={() => handleDeletePreset(preset.id, preset.name)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-[11px] font-medium text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : confirmOverwriteId === preset.id ? (
                          <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500/50 px-3 py-1.5 rounded-xl animate-in fade-in shrink-0">
                            <span className="text-[11px] text-amber-200 font-semibold">Overwrite?</span>
                            <button
                              type="button"
                              onClick={() => handleOverwritePreset(preset)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmOverwriteId(null)}
                              className="px-2 py-1 text-[11px] font-medium text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            {/* Load / Apply Preset */}
                            <button
                              type="button"
                              onClick={() => {
                                onApplyLayoutPreset(preset);
                                setSaveSuccessMsg(`Restored and loaded layout preset: "${preset.name}"`);
                                setTimeout(() => setSaveSuccessMsg(null), 2500);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                              title="Load and restore this layout preset"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Load Layout</span>
                            </button>

                            {/* Preset actions: Overwrite, Export, Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmOverwriteId(preset.id);
                                setConfirmDeleteId(null);
                              }}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-zinc-700/60 transition-colors cursor-pointer"
                              title="Update preset with current layout"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExportPreset(preset)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-300 hover:bg-zinc-700/60 transition-colors cursor-pointer"
                              title="Export preset JSON"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteId(preset.id);
                                setConfirmOverwriteId(null);
                              }}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-700/60 transition-colors cursor-pointer"
                              title="Delete preset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Category 2: Space Canvas Layouts & Presets */}
        {presetCategory === 'space' && (
          <div className="space-y-5">
            {/* Save Current Space Layout Form */}
            {isSavingSpaceLayout ? (
              <form
                onSubmit={handleSaveCurrentSpaceLayout}
                className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-3 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>Save Current Space Canvas to Presets</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSavingSpaceLayout(false)}
                    className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                      Layout Preset Name *
                    </label>
                    <input
                      type="text"
                      value={newSpaceName}
                      onChange={(e) => setNewSpaceName(e.target.value)}
                      placeholder="e.g., Chill Loft, Photo & Video Stage, Media Wall"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newSpaceDesc}
                      onChange={(e) => setNewSpaceDesc(e.target.value)}
                      placeholder="e.g., 2 local videos, 3 framed pictures and quick actions"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-amber-300/85">
                    Captures current active elements, media frames, and background texture.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSavingSpaceLayout(false)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newSpaceName.trim()}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Space Layout</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-800/40 border border-zinc-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-200">
                      Save Space Canvas Layout
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Save your custom arrangement of photo frames, local & direct videos, notes, and buttons.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSavingSpaceLayout(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save as Space Preset</span>
                </button>
              </div>
            )}

            {/* Filter and Count Header */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSpaceFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    spaceFilter === 'all'
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  All ({spaceLayouts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSpaceFilter('custom')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    spaceFilter === 'custom'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  Custom ({spaceLayouts.filter((l) => !l.isPreset).length})
                </button>
                <button
                  type="button"
                  onClick={() => setSpaceFilter('presets')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    spaceFilter === 'presets'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  Curated Presets ({spaceLayouts.filter((l) => l.isPreset).length})
                </button>
              </div>

              {activePage !== 'space' && onNavigateToSpace && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToSpace();
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Go to Space Canvas</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Space Layouts Cards List */}
            <div className="space-y-3">
              {spaceLayouts
                .filter((layout) => {
                  if (spaceFilter === 'custom') return !layout.isPreset;
                  if (spaceFilter === 'presets') return layout.isPreset;
                  return true;
                })
                .map((layout) => {
                  const isActive = activeSpaceLayoutId === layout.id;
                  const videos = layout.elements.filter((el) => el.type === 'video');
                  const images = layout.elements.filter((el) => el.type === 'image');
                  const notes = layout.elements.filter((el) => el.type === 'text');
                  const buttons = layout.elements.filter((el) => el.type === 'button');

                  return (
                    <div
                      key={layout.id}
                      className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col gap-3 group ${
                        isActive
                          ? 'bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-950/30'
                          : 'bg-zinc-800/50 hover:bg-zinc-800/80 border-zinc-700/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-zinc-100">{layout.name}</h4>
                            {layout.isPreset ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/30 font-semibold">
                                Curated Preset
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 font-semibold">
                                Custom Layout
                              </span>
                            )}
                            {isActive && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active on Space
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                            {layout.description || `${layout.elements.length} elements with custom layout`}
                          </p>

                          {/* Breakdown Tags */}
                          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700/50 text-zinc-300 font-mono">
                              {layout.elements.length} total elements
                            </span>
                            {videos.length > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-700/40 text-rose-300 flex items-center gap-1">
                                <Film className="w-3 h-3" />
                                <span>{videos.length} video{videos.length > 1 ? 's' : ''}</span>
                              </span>
                            )}
                            {images.length > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 flex items-center gap-1">
                                <Camera className="w-3 h-3" />
                                <span>{images.length} frame{images.length > 1 ? 's' : ''}</span>
                              </span>
                            )}
                            {notes.length > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-700/40 text-amber-300 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span>{notes.length} note{notes.length > 1 ? 's' : ''}</span>
                              </span>
                            )}
                            {buttons.length > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>{buttons.length} button{buttons.length > 1 ? 's' : ''}</span>
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700/50 text-zinc-400 capitalize">
                              Bg: {layout.background?.texturePreset || layout.background?.type || 'Default'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        {confirmDeleteSpaceId === layout.id ? (
                          <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-500/50 px-3 py-1.5 rounded-xl animate-in fade-in shrink-0">
                            <span className="text-[11px] text-rose-200 font-semibold">Delete layout?</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSpaceLayout(layout.id, layout.name)}
                              className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteSpaceId(null)}
                              className="px-2 py-1 text-[11px] font-medium text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleApplySpaceLayout(layout, false)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                              }`}
                              title="Apply this layout to the Space canvas"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isActive ? 'Reload' : 'Apply'}</span>
                            </button>

                            {onNavigateToSpace && (
                              <button
                                type="button"
                                onClick={() => handleApplySpaceLayout(layout, true)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
                                title="Apply layout and open Space Canvas"
                              >
                                <span>Open in Space</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleExportSpaceLayout(layout)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-zinc-700/60 transition-colors cursor-pointer"
                              title="Export Space layout JSON"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {!layout.isPreset && (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteSpaceId(layout.id)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-700/60 transition-colors cursor-pointer"
                                title="Delete custom space layout"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/60">
          <button
            type="button"
            onClick={onResetLayout}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default Layout</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
