import React, { useState, useRef } from 'react';
import {
  Settings2,
  Download,
  Upload,
  Database,
  FileJson,
  Check,
  AlertTriangle,
  Copy,
  RefreshCw,
  Trash2,
  Layers,
  FileText,
  Folder,
  Sparkles,
  Type,
  ShieldCheck,
  Archive,
  Info,
} from 'lucide-react';
import {
  WritingProject,
  WritingFolder,
  WritingDocument,
  WritingSuiteSettings,
} from '../../types';

interface WritingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: WritingProject[];
  folders: WritingFolder[];
  documents: WritingDocument[];
  settings: WritingSuiteSettings;
  activeProjectId: string;
  onUpdateSettings: (updates: Partial<WritingSuiteSettings>) => void;
  onRestoreWorkspace: (data: {
    projects?: WritingProject[];
    folders?: WritingFolder[];
    documents?: WritingDocument[];
    settings?: Partial<WritingSuiteSettings>;
  }, mode: 'replace' | 'merge') => void;
  onResetToDefaults: () => void;
}

export interface WritingBackupPayload {
  version: number;
  exportedAt: string;
  app: string;
  projects: WritingProject[];
  folders: WritingFolder[];
  documents: WritingDocument[];
  settings: WritingSuiteSettings;
}

export const WritingSettingsModal: React.FC<WritingSettingsModalProps> = ({
  isOpen,
  onClose,
  projects,
  folders,
  documents,
  settings,
  activeProjectId,
  onUpdateSettings,
  onRestoreWorkspace,
  onResetToDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'editor' | 'stats'>('backup');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [pastedJson, setPastedJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [parsedImport, setParsedImport] = useState<WritingBackupPayload | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Compute total statistics
  const totalWords = documents.reduce((acc, doc) => acc + (doc.wordCount || 0), 0);
  const totalChars = documents.reduce((acc, doc) => acc + (doc.charCount || 0), 0);
  const totalReadTime = Math.max(1, Math.ceil(totalWords / 200));
  const estimatedStorageBytes = new Blob([
    JSON.stringify({ projects, folders, documents, settings }),
  ]).size;
  const storageKb = (estimatedStorageBytes / 1024).toFixed(1);

  // Generate Workspace JSON Payload
  const getFullBackupPayload = (): WritingBackupPayload => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'WritingSuite',
      projects,
      folders,
      documents,
      settings,
    };
  };

  // Export handlers
  const handleDownloadFullBackup = () => {
    const payload = getFullBackupPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const dateStamp = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `writing-suite-backup-${dateStamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setImportSuccess('Full JSON backup downloaded successfully.');
    setTimeout(() => setImportSuccess(null), 4000);
  };

  const handleDownloadCurrentProjectBackup = () => {
    const currentProj = projects.find((p) => p.id === activeProjectId);
    if (!currentProj) return;

    const projFolders = folders.filter((f) => f.projectId === activeProjectId);
    const projDocs = documents.filter((d) => d.projectId === activeProjectId);

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      app: 'WritingSuiteProject',
      projects: [currentProj],
      folders: projFolders,
      documents: projDocs,
      settings,
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const sanitizedName = (currentProj.name || 'project').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const a = document.createElement('a');
    a.href = url;
    a.download = `writing-project-${sanitizedName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setImportSuccess(`Project "${currentProj.name}" exported as JSON.`);
    setTimeout(() => setImportSuccess(null), 4000);
  };

  const handleCopyJsonToClipboard = () => {
    const payload = getFullBackupPayload();
    const jsonStr = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  // Validate parsed JSON data
  const validateAndSetImportData = (rawText: string) => {
    setImportError(null);
    setImportSuccess(null);
    try {
      if (!rawText.trim()) {
        setParsedImport(null);
        return;
      }
      const data = JSON.parse(rawText);

      // Validate basic format
      const hasDocs = Array.isArray(data.documents);
      const hasProjects = Array.isArray(data.projects);

      if (!hasDocs && !hasProjects && !Array.isArray(data)) {
        setImportError('Invalid JSON format: Expected a Writing Suite backup payload containing documents and projects.');
        setParsedImport(null);
        return;
      }

      const formattedPayload: WritingBackupPayload = {
        version: data.version || 1,
        exportedAt: data.exportedAt || new Date().toISOString(),
        app: data.app || 'WritingSuite',
        projects: Array.isArray(data.projects) ? data.projects : projects,
        folders: Array.isArray(data.folders) ? data.folders : [],
        documents: Array.isArray(data.documents) ? data.documents : Array.isArray(data) ? data : [],
        settings: data.settings ? { ...settings, ...data.settings } : settings,
      };

      setParsedImport(formattedPayload);
    } catch (err: any) {
      setImportError(`JSON Syntax Error: ${err.message || 'Unable to parse file'}`);
      setParsedImport(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPastedJson(content);
      validateAndSetImportData(content);
    };
    reader.onerror = () => {
      setImportError('Failed to read selected file.');
    };
    reader.readAsText(file);
    // Reset file input value so re-selecting same file triggers change
    e.target.value = '';
  };

  const handleApplyImport = () => {
    if (!parsedImport) return;

    onRestoreWorkspace(
      {
        projects: parsedImport.projects,
        folders: parsedImport.folders,
        documents: parsedImport.documents,
        settings: parsedImport.settings,
      },
      importMode
    );

    const docCount = parsedImport.documents?.length || 0;
    const projCount = parsedImport.projects?.length || 0;
    setImportSuccess(
      `Successfully ${importMode === 'replace' ? 'restored' : 'merged'} ${projCount} project(s) and ${docCount} document(s)!`
    );
    setPastedJson('');
    setParsedImport(null);
    setTimeout(() => {
      setImportSuccess(null);
      onClose();
    }, 1500);
  };

  return (
    <div
      id="writing-settings-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        id="writing-settings-dialog"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-zinc-900 border border-zinc-700/80 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Writing Suite Settings & Data</h2>
              <p className="text-xs text-zinc-400">Manage backups, JSON export/import, and editor defaults</p>
            </div>
          </div>
          <button
            type="button"
            id="close-writing-settings-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800 bg-zinc-950/30">
          <button
            type="button"
            id="tab-backup-btn"
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'border-indigo-500 text-indigo-400 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>JSON Backup & Restore</span>
          </button>

          <button
            type="button"
            id="tab-editor-btn"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'border-indigo-500 text-indigo-400 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Editor Preferences</span>
          </button>

          <button
            type="button"
            id="tab-stats-btn"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-xl border-b-2 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'border-indigo-500 text-indigo-400 bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Storage & Health</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* TAB 1: JSON BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-200 leading-relaxed">
                  <strong className="text-white">Protect Your Writing Progress:</strong> Export a complete JSON snapshot of all your projects, documents, folder hierarchies, and editor preferences. You can restore this file anytime across browsers or devices.
                </div>
              </div>

              {/* SECTION: EXPORT DATA */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Export Writing Data</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Full Workspace Export */}
                  <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-xs text-white">
                        <FileJson className="w-4 h-4 text-emerald-400" />
                        <span>All Projects & Docs (.json)</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Includes {projects.length} project(s), {folders.length} folder(s), and {documents.length} document(s).
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                      <button
                        type="button"
                        id="download-workspace-json-btn"
                        onClick={handleDownloadFullBackup}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download JSON</span>
                      </button>
                      <button
                        type="button"
                        id="copy-workspace-json-btn"
                        onClick={handleCopyJsonToClipboard}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Copy JSON string to clipboard"
                      >
                        {copiedNotification ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Active Project Only Export */}
                  <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-xs text-white">
                        <Archive className="w-4 h-4 text-sky-400" />
                        <span>Current Project Only (.json)</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Exports active project: <strong className="text-zinc-200">{projects.find((p) => p.id === activeProjectId)?.name || 'Default'}</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      id="download-project-json-btn"
                      onClick={handleDownloadCurrentProjectBackup}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all border border-zinc-700/80 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>Export Project</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION: IMPORT & RESTORE DATA */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Import / Restore From JSON</span>
                  </h3>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px]">
                    <button
                      type="button"
                      id="import-mode-merge-btn"
                      onClick={() => setImportMode('merge')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        importMode === 'merge'
                          ? 'bg-indigo-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="Keep existing content and add new items"
                    >
                      Merge (Safe)
                    </button>
                    <button
                      type="button"
                      id="import-mode-replace-btn"
                      onClick={() => setImportMode('replace')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        importMode === 'replace'
                          ? 'bg-rose-600 text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="Replace current workspace with backup"
                    >
                      Clean Restore
                    </button>
                  </div>
                </div>

                {/* Upload or Drop Area */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    id="trigger-file-input-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="sm:col-span-1 p-4 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800/80 border border-dashed border-zinc-700 hover:border-indigo-500/60 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer group"
                  >
                    <div className="p-2.5 rounded-xl bg-zinc-900 group-hover:bg-indigo-600/20 text-indigo-400 transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-white">Choose JSON File</span>
                    <span className="text-[10px] text-zinc-500">.json backup file</span>
                  </button>

                  {/* Paste JSON Raw Text */}
                  <div className="sm:col-span-2 flex flex-col space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400">Or Paste JSON Content Below:</label>
                    <textarea
                      id="json-import-textarea"
                      placeholder="Paste your JSON backup payload here..."
                      value={pastedJson}
                      onChange={(e) => {
                        setPastedJson(e.target.value);
                        validateAndSetImportData(e.target.value);
                      }}
                      className="w-full h-24 p-2.5 text-[11px] font-mono bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none scrollbar-thin"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {importError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-2.5 text-rose-300 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{importError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {importSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2.5 text-emerald-300 text-xs">
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{importSuccess}</span>
                  </div>
                )}

                {/* Validated Backup Preview Card */}
                {parsedImport && (
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/40 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>Valid Backup Verified</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Exported: {new Date(parsedImport.exportedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                        <span className="text-zinc-400 text-[10px] block">Projects</span>
                        <strong className="text-white text-sm">{parsedImport.projects.length}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                        <span className="text-zinc-400 text-[10px] block">Folders</span>
                        <strong className="text-white text-sm">{parsedImport.folders.length}</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                        <span className="text-zinc-400 text-[10px] block">Documents</span>
                        <strong className="text-white text-sm">{parsedImport.documents.length}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      id="confirm-apply-import-btn"
                      onClick={handleApplyImport}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg cursor-pointer ${
                        importMode === 'replace'
                          ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                      }`}
                    >
                      {importMode === 'replace'
                        ? 'Confirm Clean Restore (Overwrite Workspace)'
                        : 'Confirm Merge into Workspace'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EDITOR PREFERENCES */}
          {activeTab === 'editor' && (
            <div className="space-y-5">
              {/* Default Font Family */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                <label className="text-xs font-bold text-zinc-200 block">Default Typography Style</label>
                <p className="text-[11px] text-zinc-400">Choose the default typeface applied to your document canvas.</p>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {(
                    [
                      { id: 'sans', label: 'Sans-Serif', desc: 'Modern & Clean' },
                      { id: 'serif', label: 'Editorial Serif', desc: 'Book & Novel' },
                      { id: 'mono', label: 'JetBrains Mono', desc: 'Code & Technical' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onUpdateSettings({ fontFamily: f.id })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        settings.fontFamily === f.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{f.label}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size & Line Spacing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                  <label className="text-xs font-bold text-zinc-200 block">Default Font Size</label>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => onUpdateSettings({ fontSize: sz })}
                        className={`py-1.5 rounded-lg text-xs font-semibold uppercase border transition-all ${
                          settings.fontSize === sz
                            ? 'bg-indigo-600 text-white border-indigo-400'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                  <label className="text-xs font-bold text-zinc-200 block">Line Spacing</label>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {(['normal', 'relaxed', 'loose'] as const).map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => onUpdateSettings({ lineSpacing: sp })}
                        className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          settings.lineSpacing === sp
                            ? 'bg-indigo-600 text-white border-indigo-400'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <label className="flex items-center justify-between text-xs text-zinc-300 hover:text-white cursor-pointer select-none">
                  <div>
                    <div className="font-semibold">Typewriter Vertical Scrolling</div>
                    <div className="text-[11px] text-zinc-500">Keep active cursor line centered while typing</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.typewriterMode}
                    onChange={(e) => onUpdateSettings({ typewriterMode: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-zinc-800 border-zinc-700 cursor-pointer"
                  />
                </label>

                <div className="border-t border-zinc-800/80" />

                <label className="flex items-center justify-between text-xs text-zinc-300 hover:text-white cursor-pointer select-none">
                  <div>
                    <div className="font-semibold">Show Live Word Count & Reading Telemetry</div>
                    <div className="text-[11px] text-zinc-500">Displays real-time document telemetry in the toolbar</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showWordCount}
                    onChange={(e) => onUpdateSettings({ showWordCount: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-zinc-800 border-zinc-700 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE & HEALTH */}
          {activeTab === 'stats' && (
            <div className="space-y-5">
              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Words</span>
                  <strong className="text-lg font-black text-indigo-400">{totalWords.toLocaleString()}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Documents</span>
                  <strong className="text-lg font-black text-sky-400">{documents.length}</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Reading Time</span>
                  <strong className="text-lg font-black text-amber-400">{totalReadTime} min</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">Storage Size</span>
                  <strong className="text-lg font-black text-emerald-400">{storageKb} KB</strong>
                </div>
              </div>

              {/* Persistence Notice */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Real-Time Local Storage Engine</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Your writing is automatically cached and synchronized to high-performance local storage upon every keystroke. Using the JSON backup tool ensures you keep long-term archives.
                </p>
              </div>

              {/* Reset to Defaults */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-rose-300">Reset Writing Suite Data</div>
                    <div className="text-[11px] text-zinc-400">Restore factory sample projects and initial documents</div>
                  </div>
                  {!showResetConfirm ? (
                    <button
                      type="button"
                      id="reset-writing-suite-btn"
                      onClick={() => setShowResetConfirm(true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/50 text-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reset Data
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        id="confirm-reset-writing-suite-btn"
                        onClick={() => {
                          onResetToDefaults();
                          setShowResetConfirm(false);
                          onClose();
                        }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                      >
                        Confirm Reset
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-500">
          <span>Writing Suite v1.2</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
