import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Table as TableIcon,
  Minus,
  Link as LinkIcon,
  Eye,
  Columns,
  Edit3,
  Maximize2,
  Minimize2,
  Type,
  Download,
  FileDown,
  Printer,
  Sparkles,
  BookOpen,
  Settings2,
  FileCode,
  Check,
} from 'lucide-react';
import { WritingSuiteSettings } from '../../types';

interface WritingToolbarProps {
  settings: WritingSuiteSettings;
  onUpdateSettings: (updates: Partial<WritingSuiteSettings>) => void;
  onInsertMarkdown: (prefix: string, suffix?: string, defaultText?: string) => void;
  onOpenTemplates: () => void;
  onOpenSettings: () => void;
  onExportMarkdown: () => void;
  onExportPlainText: () => void;
  onExportHTML: () => void;
  onPrintPDF: () => void;
  wordCount: number;
  charCount: number;
  readingTimeMinutes: number;
}

export const WritingToolbar: React.FC<WritingToolbarProps> = ({
  settings,
  onUpdateSettings,
  onInsertMarkdown,
  onOpenTemplates,
  onOpenSettings,
  onExportMarkdown,
  onExportPlainText,
  onExportHTML,
  onPrintPDF,
  wordCount,
  charCount,
  readingTimeMinutes,
}) => {
  const [showTypographyMenu, setShowTypographyMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="w-full flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md z-20 flex-wrap">
      {/* Left Tools: Markdown Formatting Quick Buttons */}
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none py-0.5">
        {/* Headings */}
        <button
          type="button"
          onClick={() => onInsertMarkdown('# ', '', 'Heading 1')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Heading 1 (# )"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsertMarkdown('## ', '', 'Heading 2')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Heading 2 (## )"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsertMarkdown('### ', '', 'Heading 3')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Heading 3 (### )"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-zinc-800 mx-1" />

        {/* Text Styling */}
        <button
          type="button"
          onClick={() => onInsertMarkdown('**', '**', 'bold text')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Bold (**text**)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsertMarkdown('*', '*', 'italic text')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Italic (*text*)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsertMarkdown('~~', '~~', 'strikethrough text')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Strikethrough (~~text~~)"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsertMarkdown('`', '`', 'code')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Inline Code (`code`)"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-zinc-800 mx-1" />

        {/* Blocks & Lists */}
        <button
          type="button"
          onClick={() => onInsertMarkdown('> ', '', 'Quotation text here...')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Blockquote (> quote)"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsertMarkdown('- ', '', 'List item')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Bullet List (- item)"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsertMarkdown('1. ', '', 'Numbered item')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Numbered List (1. item)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsertMarkdown('- [ ] ', '', 'Task item')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Checklist Task (- [ ] task)"
        >
          <CheckSquare className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            onInsertMarkdown(
              '\n| Header 1 | Header 2 | Header 3 |\n| :--- | :--- | :--- |\n| Row 1 | Data | Data |\n| Row 2 | Data | Data |\n'
            )
          }
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors hidden sm:block"
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsertMarkdown('\n---\n')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors hidden sm:block"
          title="Horizontal Divider (---)"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsertMarkdown('[', '](https://example.com)', 'Link title')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Insert Link ([title](url))"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onInsertMarkdown('```ts\n', '\n```', '// Code snippet here')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors hidden sm:block"
          title="Code Block (```)"
        >
          <FileCode className="w-4 h-4" />
        </button>
      </div>

      {/* Right Tools: View Mode, Zen, Typography, Export, Telemetry */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* View Mode Segmented Switcher */}
        <div className="flex items-center p-0.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
          <button
            type="button"
            onClick={() => onUpdateSettings({ viewMode: 'editor' })}
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              settings.viewMode === 'editor'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Editor view only"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Write</span>
          </button>
          <button
            type="button"
            onClick={() => onUpdateSettings({ viewMode: 'split' })}
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              settings.viewMode === 'split'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Split editor & live markdown preview"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Split</span>
          </button>
          <button
            type="button"
            onClick={() => onUpdateSettings({ viewMode: 'preview' })}
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              settings.viewMode === 'preview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Rendered reader view"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Preview</span>
          </button>
        </div>

        {/* Templates Picker Button */}
        <button
          type="button"
          onClick={onOpenTemplates}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 text-xs font-semibold transition-colors cursor-pointer"
          title="Document Templates"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Templates</span>
        </button>

        {/* Typography Controls Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTypographyMenu(!showTypographyMenu)}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              showTypographyMenu
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700/60'
            }`}
            title="Typography & Canvas options"
          >
            <Type className="w-4 h-4 text-violet-400" />
          </button>

          {showTypographyMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl p-3 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-violet-400" />
                  <span>Typography & Canvas</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowTypographyMenu(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  ✕
                </button>
              </div>

              {/* Font Family */}
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Font Type</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['sans', 'serif', 'mono'] as const).map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => onUpdateSettings({ fontFamily: font })}
                      className={`py-1 px-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        settings.fontFamily === font
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Font Size</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onUpdateSettings({ fontSize: size })}
                      className={`py-1 px-1.5 rounded-lg text-xs font-semibold uppercase border transition-all ${
                        settings.fontSize === size
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Width */}
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Page Width</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['narrow', 'medium', 'wide', 'full'] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => onUpdateSettings({ pageWidth: w })}
                      className={`py-1 px-1.5 rounded-lg text-[11px] font-semibold capitalize border transition-all ${
                        settings.pageWidth === w
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                <label className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer select-none">
                  <span>Typewriter Scrolling</span>
                  <input
                    type="checkbox"
                    checked={settings.typewriterMode}
                    onChange={(e) => onUpdateSettings({ typewriterMode: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-0 bg-zinc-800 border-zinc-700"
                  />
                </label>
                <label className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer select-none">
                  <span>Show Word Count</span>
                  <input
                    type="checkbox"
                    checked={settings.showWordCount}
                    onChange={(e) => onUpdateSettings({ showWordCount: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-0 bg-zinc-800 border-zinc-700"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Export / Download Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              showExportMenu
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700/60'
            }`}
            title="Export Document"
          >
            <Download className="w-4 h-4 text-emerald-400" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                Export As
              </div>
              <button
                type="button"
                onClick={() => {
                  onExportMarkdown();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 text-left transition-colors cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-semibold">Markdown (.md)</div>
                  <div className="text-[10px] text-zinc-500">Standard formatted text</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportPlainText();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 text-left transition-colors cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="font-semibold">Plain Text (.txt)</div>
                  <div className="text-[10px] text-zinc-500">Raw unformatted file</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportHTML();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 text-left transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold">Web Page (.html)</div>
                  <div className="text-[10px] text-zinc-500">Standalone styled HTML</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  onPrintPDF();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 text-left transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="font-semibold">Print / Save PDF</div>
                  <div className="text-[10px] text-zinc-500">Print-ready layout</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Zen Focus Mode Toggle */}
        <button
          type="button"
          onClick={() => onUpdateSettings({ zenMode: !settings.zenMode })}
          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
            settings.zenMode
              ? 'bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700/60'
          }`}
          title={settings.zenMode ? 'Exit Zen Focus Mode (Esc)' : 'Enter Zen Focus Mode (Distraction-Free)'}
        >
          {settings.zenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Writing Suite Settings & Data Backup Modal Trigger */}
        <button
          type="button"
          id="open-writing-settings-toolbar-btn"
          onClick={onOpenSettings}
          className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
          title="Writing Suite Settings & JSON Backup / Restore"
        >
          <Settings2 className="w-4 h-4 text-zinc-300" />
        </button>

        {/* Word Count / Telemetry Pill */}
        {settings.showWordCount && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400">
            <span>
              <strong className="text-zinc-200">{wordCount}</strong> words
            </span>
            <span>•</span>
            <span>
              <strong className="text-zinc-200">{readingTimeMinutes}</strong> min read
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
