import React, { useState } from 'react';
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
} from 'lucide-react';
import { storage } from '../../services/storage';
import { uiSound } from '../../services/uiSound';
import { UiSoundSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataReload,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [soundSettings, setSoundSettings] = useState<UiSoundSettings>(() => uiSound.getSettings());
  const [spaceAutoplay, setSpaceAutoplay] = useState<boolean>(() => storage.getSpaceAutoplayMedia());

  if (!isOpen) return null;

  const handleToggleSpaceAutoplay = (enabled: boolean) => {
    storage.saveSpaceAutoplayMedia(enabled);
    setSpaceAutoplay(enabled);
    uiSound.playClick(true);
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

  const handleExport = () => {
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
          onDataReload();
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1000);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">Dashboard Settings</h2>
              <p className="text-xs text-zinc-400">Data backup, sync, shortcuts, and preferences</p>
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
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
                    Play tactile click sound effect when interacting with UI buttons and controls (enabled by default)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSound(!soundSettings.enabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    soundSettings.enabled ? 'bg-indigo-600' : 'bg-zinc-800'
                  }`}
                  role="switch"
                  aria-checked={soundSettings.enabled}
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
                      title={soundSettings.pitchVariation ? 'Subtle natural pitch variance on rapid clicks' : 'Fixed pitch on every click'}
                    >
                      {soundSettings.pitchVariation ? 'Subtle Variance' : 'Fixed'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Space Canvas Settings */}
          <div>
            <h3 className="font-bold text-zinc-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-sky-400" />
              <span>Space Canvas Settings</span>
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
                    Automatically play video streams and ambient players when opening the Space creative canvas
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSpaceAutoplay(!spaceAutoplay)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    spaceAutoplay ? 'bg-sky-600' : 'bg-zinc-800'
                  }`}
                  role="switch"
                  aria-checked={spaceAutoplay}
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

          {/* Data Backup & Restore */}
          <div>
            <h3 className="font-bold text-zinc-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-indigo-400" />
              <span>Data Backup & Sync</span>
            </h3>
            <p className="text-zinc-400 mb-3 leading-relaxed">
              All bookmarks, widgets, layout order, events, and notes are saved in your browser's
              local storage. Export your backup to transfer to another device.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-semibold transition-colors cursor-pointer">
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
              <div className="mt-2 p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Backup restored successfully!</span>
              </div>
            )}
            {importStatus === 'error' && (
              <div className="mt-2 p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Invalid backup JSON file.</span>
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div>
            <h3 className="font-bold text-zinc-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-indigo-400" />
              <span>Keyboard Shortcuts</span>
            </h3>

            <div className="space-y-1.5 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/80">
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-300">Focus Search Bar</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                  / or ⌘K
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-300">Close Dropdowns / Modals</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                  Esc
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-300">Open Bookmark URL directly</span>
                <span className="text-zinc-400">Click or Drag Card</span>
              </div>
            </div>
          </div>

          {/* Reset To Default */}
          <div className="pt-2 border-t border-zinc-800">
            <h3 className="font-bold text-zinc-200 uppercase tracking-wider mb-2">
              Factory Reset
            </h3>
            {showConfirmReset ? (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
                <div className="text-rose-300 font-medium">
                  Are you sure? This will wipe all local bookmarks and restored default data.
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
                    className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg hover:text-white"
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

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-800 bg-zinc-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
