import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Keyboard,
  Check,
  AlertTriangle,
  FileJson,
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  Film,
  Layers,
  Bookmark,
  Trash2,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  Repeat,
  CheckCircle2,
  Type,
  Image as ImageIcon,
  Palette,
  Eye,
  Info,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { uiSound } from '../../services/uiSound';
import { UiSoundSettings } from '../../types';
import { SpaceLayout, SpaceElement, SpaceBackgroundConfig } from '../../types/space';

export type SettingsTab = 'space-layouts' | 'general' | 'backup' | 'shortcuts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => void;
  initialTab?: SettingsTab;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataReload,
  initialTab = 'space-layouts',
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [soundSettings, setSoundSettings] = useState<UiSoundSettings>(() => uiSound.getSettings());
  const [spaceAutoplay, setSpaceAutoplay] = useState<boolean>(() => storage.getSpaceAutoplayMedia());

  // Space Layouts State
  const [savedLayouts, setSavedLayouts] = useState<SpaceLayout[]>(() => storage.getSavedSpaceLayouts());
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(() => storage.getActiveSpaceLayoutId());
  const [newLayoutName, setNewLayoutName] = useState('');
  const [newLayoutDesc, setNewLayoutDesc] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [layoutFilter, setLayoutFilter] = useState<'all' | 'custom' | 'presets'>('all');
  const [appliedLayoutId, setAppliedLayoutId] = useState<string | null>(null);

  // Sync initial tab whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSavedLayouts(storage.getSavedSpaceLayouts());
      setActiveLayoutId(storage.getActiveSpaceLayoutId());
      setSpaceAutoplay(storage.getSpaceAutoplayMedia());
      setSoundSettings(uiSound.getSettings());
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Live Canvas Elements Info from Storage
  const currentElements: SpaceElement[] = storage.getSpaceElements();
  const currentBackground: SpaceBackgroundConfig = storage.getSpaceBackground();

  const currentVideoCount = currentElements.filter((el) => el.type === 'video').length;
  const currentImageCount = currentElements.filter((el) => el.type === 'image').length;
  const currentTextCount = currentElements.filter((el) => el.type === 'text').length;
  const currentButtonCount = currentElements.filter((el) => el.type === 'button').length;

  const activeLayout = savedLayouts.find((l) => l.id === activeLayoutId) || savedLayouts[0] || null;
  const activeLayoutIndex = savedLayouts.findIndex((l) => l.id === (activeLayout?.id ?? ''));

  // Handlers
  const handleToggleSpaceAutoplay = (enabled: boolean) => {
    storage.saveSpaceAutoplayMedia(enabled);
    setSpaceAutoplay(enabled);
    uiSound.playClick(true);
    onDataReload();
  };

  const handleToggleSound = (enabled: boolean) => {
    const updated = uiSound.updateSettings({ enabled });
    setSoundSettings(updated);
    if (enabled) {
      uiSound.playClick(true);
    }
  };

  const handleVolumeChange = (volume: number) => {
    const updated = uiSound.updateSettings({ volume });
    setSoundSettings(updated);
    uiSound.playClick(true);
  };

  const handleTogglePitchVariation = (pitchVariation: boolean) => {
    const updated = uiSound.updateSettings({ pitchVariation });
    setSoundSettings(updated);
    uiSound.playClick(true);
  };

  const handleTestSound = () => {
    uiSound.playClick(true);
  };

  // Space Layout Actions
  const handleCycleLayout = (direction: 'next' | 'prev' = 'next') => {
    if (savedLayouts.length === 0) return;
    uiSound.playPlace();
    let nextIndex = activeLayoutIndex;
    if (direction === 'next') {
      nextIndex = (activeLayoutIndex + 1) % savedLayouts.length;
    } else {
      nextIndex = (activeLayoutIndex - 1 + savedLayouts.length) % savedLayouts.length;
    }
    const nextLayout = savedLayouts[nextIndex];
    if (nextLayout) {
      storage.saveSpaceElements(nextLayout.elements);
      storage.saveSpaceBackground(nextLayout.background);
      storage.setActiveSpaceLayoutId(nextLayout.id);
      setActiveLayoutId(nextLayout.id);
      setAppliedLayoutId(nextLayout.id);
      setTimeout(() => setAppliedLayoutId(null), 2000);
      onDataReload();
    }
  };

  const handleApplyLayout = (layout: SpaceLayout) => {
    uiSound.playPlace();
    storage.saveSpaceElements(layout.elements);
    storage.saveSpaceBackground(layout.background);
    storage.setActiveSpaceLayoutId(layout.id);
    setActiveLayoutId(layout.id);
    setAppliedLayoutId(layout.id);
    setTimeout(() => setAppliedLayoutId(null), 2500);
    onDataReload();
  };

  const handleSaveCurrentLayout = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newLayoutName.trim();
    if (!trimmed) return;

    uiSound.playPlace();
    const newLayout: SpaceLayout = {
      id: `layout-custom-${Date.now()}`,
      name: trimmed,
      description: newLayoutDesc.trim() || `${currentElements.length} elements with custom media`,
      elements: JSON.parse(JSON.stringify(currentElements)),
      background: JSON.parse(JSON.stringify(currentBackground)),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPreset: false,
    };

    storage.saveSpaceLayout(newLayout);
    const refreshed = storage.getSavedSpaceLayouts();
    setSavedLayouts(refreshed);
    setActiveLayoutId(newLayout.id);
    setNewLayoutName('');
    setNewLayoutDesc('');
    setSaveSuccessMessage(`Saved layout "${trimmed}" with ${currentElements.length} elements!`);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
    onDataReload();
  };

  const handleDeleteLayout = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the layout "${name}"?`)) {
      uiSound.playDelete();
      storage.deleteSpaceLayout(id);
      const refreshed = storage.getSavedSpaceLayouts();
      setSavedLayouts(refreshed);
      setActiveLayoutId(storage.getActiveSpaceLayoutId());
      onDataReload();
    }
  };

  const handleExportSingleLayout = (layout: SpaceLayout) => {
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

  // Full Backup Export / Import / Reset
  const handleExportAll = () => {
    const json = storage.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = storage.importAllData(text);
        if (success) {
          setImportStatus('success');
          setSavedLayouts(storage.getSavedSpaceLayouts());
          setActiveLayoutId(storage.getActiveSpaceLayoutId());
          setSpaceAutoplay(storage.getSpaceAutoplayMedia());
          onDataReload();
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1200);
        } else {
          setImportStatus('error');
        }
      } catch {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    storage.resetToDefaults();
    onDataReload();
    setShowConfirmReset(false);
    onClose();
  };

  // Filtered layouts
  const filteredLayouts = savedLayouts.filter((l) => {
    if (layoutFilter === 'custom') return !l.isPreset;
    if (layoutFilter === 'presets') return !!l.isPreset;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Settings & Backup</h2>
              <p className="text-xs text-zinc-400">
                Manage custom Space layouts, media settings, audio, and backups
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-zinc-800/80 bg-zinc-950/40 overflow-x-auto select-none">
          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              setActiveTab('space-layouts');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'space-layouts'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-300" />
            <span>Space Layouts</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'space-layouts' ? 'bg-indigo-800 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {savedLayouts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              setActiveTab('general');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio & General</span>
          </button>

          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              setActiveTab('backup');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <FileJson className="w-3.5 h-3.5 text-indigo-300" />
            <span>Data Backup & Sync</span>
          </button>

          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              setActiveTab('shortcuts');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'shortcuts'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: SPACE CANVAS LAYOUTS & PRESETS (THE LAYOUT MENU ELEMENTS) */}
          {activeTab === 'space-layouts' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Active Layout Banner & Cycler Controls */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-950 border border-indigo-500/30 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                        Active Space Layout
                      </span>
                      {activeLayoutIndex >= 0 && (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          ({activeLayoutIndex + 1} of {savedLayouts.length})
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {activeLayout?.name || 'Custom Layout'}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5 max-w-md">
                      {activeLayout?.description || 'Active element layout arrangement with media'}
                    </p>
                  </div>

                  {/* Layout Cycler Controls (Previous, Next, Cycle) */}
                  <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleCycleLayout('prev')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                      title="Cycle to previous saved layout"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-[10px] hidden sm:inline">Prev</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCycleLayout('next')}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Cycle to next layout (Shortcut: L or Alt+L)"
                    >
                      <Repeat className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Cycle Layout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCycleLayout('next')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                      title="Cycle to next saved layout"
                    >
                      <span className="text-[10px] hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Media Autoplay Setting quick switch in Space Layouts */}
                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Film className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-zinc-300 font-medium">Auto-play Media on Space Canvas</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSpaceAutoplay(!spaceAutoplay)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      spaceAutoplay ? 'bg-sky-600' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        spaceAutoplay ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Save Current Space Canvas Layout Form */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderPlus className="w-4 h-4 text-indigo-400" />
                    <span>Save Current Space Canvas as Custom Layout</span>
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    Includes all elements, media & background
                  </span>
                </div>

                {/* Canvas Contents Snapshot Badge Breakdown */}
                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center gap-2.5 flex-wrap text-[11px] text-zinc-300">
                  <span className="text-zinc-400 font-medium">Current Canvas:</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 font-semibold text-white">
                    {currentElements.length} elements total
                  </span>
                  {currentVideoCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-300 font-medium flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      {currentVideoCount} video{currentVideoCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {currentImageCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30 text-pink-300 font-medium flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {currentImageCount} photo{currentImageCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {currentTextCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium flex items-center gap-1">
                      <Type className="w-3 h-3" />
                      {currentTextCount} note{currentTextCount > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-medium flex items-center gap-1">
                    <Palette className="w-3 h-3" />
                    {currentBackground.type} background
                  </span>
                </div>

                <form onSubmit={handleSaveCurrentLayout} className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Layout Name:</label>
                      <input
                        type="text"
                        value={newLayoutName}
                        onChange={(e) => setNewLayoutName(e.target.value)}
                        placeholder="e.g. Chill Twilight Studio, Coding Desk"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">
                        Optional Description:
                      </label>
                      <input
                        type="text"
                        value={newLayoutDesc}
                        onChange={(e) => setNewLayoutDesc(e.target.value)}
                        placeholder="e.g. Lo-fi stream on left, notes and moodboard"
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    {saveSuccessMessage ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{saveSuccessMessage}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-500">
                        Layouts preserve element coordinates, media URLs, local video links, and ambiance.
                      </span>
                    )}

                    <button
                      type="submit"
                      disabled={!newLayoutName.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Save Layout</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Saved Custom Layouts & Presets Library */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-indigo-400" />
                    <span>Saved Layouts & Presets</span>
                  </h4>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setLayoutFilter('all')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                        layoutFilter === 'all'
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      All ({savedLayouts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutFilter('custom')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                        layoutFilter === 'custom'
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Custom ({savedLayouts.filter((l) => !l.isPreset).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutFilter('presets')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                        layoutFilter === 'presets'
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Curated ({savedLayouts.filter((l) => l.isPreset).length})
                    </button>
                  </div>
                </div>

                {/* List of Layout Cards */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredLayouts.length === 0 ? (
                    <div className="p-6 text-center text-zinc-500 bg-zinc-950/40 rounded-2xl border border-zinc-800">
                      No layouts found in this filter.
                    </div>
                  ) : (
                    filteredLayouts.map((layout) => {
                      const isActive = layout.id === activeLayoutId;
                      const isRecentlyApplied = layout.id === appliedLayoutId;
                      const videos = layout.elements.filter((el) => el.type === 'video').length;
                      const photos = layout.elements.filter((el) => el.type === 'image').length;

                      return (
                        <div
                          key={layout.id}
                          className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isActive
                              ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-950/40'
                              : 'bg-zinc-950/40 hover:bg-zinc-900/80 border-zinc-800/80'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-zinc-100 text-xs truncate">
                                {layout.name}
                              </span>

                              {layout.isPreset ? (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-500/15 border border-indigo-500/30 text-[9px] font-semibold text-indigo-300">
                                  Preset
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-[9px] font-semibold text-amber-300">
                                  Custom
                                </span>
                              )}

                              {isActive && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Active Layout
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                              {layout.description}
                            </p>

                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500 flex-wrap">
                              <span>{layout.elements.length} elements</span>
                              <span>•</span>
                              {videos > 0 && <span>{videos} video stream{videos > 1 ? 's' : ''} •</span>}
                              {photos > 0 && <span>{photos} photo{photos > 1 ? 's' : ''} •</span>}
                              <span>{layout.background.type} background</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            {/* Export Layout JSON */}
                            <button
                              type="button"
                              onClick={() => handleExportSingleLayout(layout)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="Download Layout Preset JSON"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete custom layout button */}
                            {!layout.isPreset && (
                              <button
                                type="button"
                                onClick={() => handleDeleteLayout(layout.id, layout.name)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Delete Custom Layout"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Apply Layout Button */}
                            <button
                              type="button"
                              onClick={() => handleApplyLayout(layout)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                isRecentlyApplied
                                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 shadow-md'
                                  : isActive
                                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 shadow-md'
                              }`}
                            >
                              {isRecentlyApplied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Applied!</span>
                                </>
                              ) : isActive ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Current</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>Load Layout</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO & GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* UI Interaction Sounds Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    {soundSettings.enabled ? (
                      <Volume2 className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-zinc-400" />
                    )}
                    <span>UI Interaction Sounds</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleTestSound}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-[11px] font-semibold text-indigo-300 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
                    title="Preview click sound effect"
                  >
                    <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                    <span>Test Sound</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-3.5">
                  {/* Main Toggle Switch */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-zinc-200 font-semibold text-xs">Tactile Click Sound</div>
                      <div className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                        Play tactile click sound effect when interacting with UI buttons and controls
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleSound(!soundSettings.enabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        soundSettings.enabled ? 'bg-indigo-600' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          soundSettings.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Volume & Details (Shown when enabled) */}
                  {soundSettings.enabled && (
                    <div className="pt-3 border-t border-zinc-800/60 space-y-3 animate-in fade-in duration-200">
                      {/* Volume Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-300 font-medium">Feedback Volume</span>
                          <span className="text-indigo-400 font-mono font-bold">
                            {Math.round(soundSettings.volume * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="1.0"
                          step="0.05"
                          value={soundSettings.volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      {/* Organic Pitch Variation Toggle */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-zinc-300 text-[11px]">Organic Pitch Modulation</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTogglePitchVariation(!soundSettings.pitchVariation)}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                            soundSettings.pitchVariation
                              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {soundSettings.pitchVariation ? 'Subtle Variance' : 'Fixed'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Space Media Autoplay Setting */}
              <div>
                <h3 className="font-bold text-zinc-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-sky-400" />
                  <span>Space Canvas Media Preferences</span>
                </h3>

                <div className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-zinc-200 font-semibold text-xs flex items-center gap-1.5">
                        <span>Auto-play Media Elements</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          Space
                        </span>
                      </div>
                      <div className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                        Automatically start video and ambient audio streams when opening the Space creative canvas
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleSpaceAutoplay(!spaceAutoplay)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        spaceAutoplay ? 'bg-sky-600' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          spaceAutoplay ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATA BACKUP & SYNC */}
          {activeTab === 'backup' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="font-bold text-zinc-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-indigo-400" />
                  <span>Data Backup & Sync</span>
                </h3>
                <p className="text-zinc-400 mb-3 leading-relaxed">
                  All bookmarks, widgets, dashboard layouts, notes, tasks, writing projects, and{' '}
                  <strong className="text-indigo-300">Space custom layouts & media elements</strong>{' '}
                  are stored safely in your browser. Export your complete backup to synchronize with other devices.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleExportAll}
                    className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-semibold transition-colors cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span>Export Full Backup (JSON)</span>
                  </button>

                  <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-semibold transition-colors cursor-pointer shadow-md">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Import Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </div>

                {importStatus === 'success' && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Backup restored successfully! All layouts, media, and data loaded.</span>
                  </div>
                )}
                {importStatus === 'error' && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Invalid backup JSON file. Please check the file and try again.</span>
                  </div>
                )}
              </div>

              {/* Factory Reset */}
              <div className="pt-3 border-t border-zinc-800">
                <h3 className="font-bold text-zinc-200 uppercase tracking-wider mb-2">
                  Factory Reset
                </h3>
                {showConfirmReset ? (
                  <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2">
                    <div className="text-rose-300 font-medium">
                      Are you sure? This will reset all bookmarks, custom Space layouts, widgets, and preferences to defaults.
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Yes, Reset Everything
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmReset(false)}
                        className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(true)}
                    className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset all settings & bookmarks to default</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: KEYBOARD SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-bold text-zinc-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Keyboard className="w-4 h-4 text-indigo-400" />
                <span>Keyboard Shortcuts</span>
              </h3>

              <div className="space-y-2 bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-800/80">
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-300">Cycle Space Custom Layouts</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-indigo-300 font-mono text-[11px] font-bold">
                    L or Alt+L
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-300">Delete Selected Space Element</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                    Delete / Backspace
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-300">Duplicate Selected Space Element</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                    ⌘D or Ctrl+D
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-300">Focus Search Bar</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                    / or ⌘K
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-zinc-300">Close Dropdowns / Deselect / Modals</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                    Esc
                  </kbd>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/40">
          <div className="text-[11px] text-zinc-500">
            {activeTab === 'space-layouts' && (
              <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded font-mono text-zinc-400">L</kbd> on the Space page to cycle layouts anytime.</span>
            )}
          </div>
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
