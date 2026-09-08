import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import {
  Star,
  Tag,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ListTree,
  ChevronRight,
  Hash,
  FileText,
  Pin,
  Smile,
  X,
  Plus,
} from 'lucide-react';
import {
  WritingDocument,
  WritingSuiteSettings,
  WritingFolder,
} from '../../types';
import { Folder } from 'lucide-react';

interface DocumentEditorProps {
  document: WritingDocument | null;
  settings: WritingSuiteSettings;
  folders?: WritingFolder[];
  onUpdateDocument: (id: string, updates: Partial<WritingDocument>) => void;
  editorTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsertMarkdown: (prefix: string, suffix?: string, defaultText?: string) => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  document,
  settings,
  folders = [],
  onUpdateDocument,
  editorTextareaRef,
  onInsertMarkdown,
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOutline, setShowOutline] = useState(false);

  if (!document) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950/40">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4 shadow-xl">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-zinc-300">No Document Selected</h3>
        <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
          Select a note or document from the project sidebar on the left, or create a new file to start writing.
        </p>
      </div>
    );
  }

  // Calculate statistics
  const words = document.content.trim() ? document.content.trim().split(/\s+/).length : 0;
  const chars = document.content.length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  // Extract Heading Outline from Markdown
  const headings = document.content
    .split('\n')
    .filter((line) => /^#{1,3}\s/.test(line))
    .map((line, idx) => {
      const match = line.match(/^(#{1,3})\s+(.*)$/);
      if (!match) return null;
      const level = match[1].length;
      const text = match[2].trim();
      return { id: `heading-${idx}`, level, text };
    })
    .filter(Boolean) as Array<{ id: string; level: number; text: string }>;

  // Handle Textarea Keydown (Smart tabs, auto-lists, markdown shortcuts)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;

    // Tab key -> 2 spaces indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);

      onUpdateDocument(document.id, {
        content: newValue,
        wordCount: newValue.trim() ? newValue.trim().split(/\s+/).length : 0,
        charCount: newValue.length,
        readingTimeMinutes: Math.max(1, Math.ceil(newValue.trim().split(/\s+/).length / 200)),
        updatedAt: Date.now(),
      });

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // Auto list continuation on Enter
    if (e.key === 'Enter') {
      const start = textarea.selectionStart;
      const value = textarea.value;
      const currentLine = value.substring(0, start).split('\n').pop() || '';

      const bulletMatch = currentLine.match(/^(\s*)([-*]|\d+\.|\-\s\[\s\])\s+/);
      if (bulletMatch) {
        // If line is empty bullet, pressing Enter clears the bullet
        if (currentLine.trim() === bulletMatch[2].trim() || currentLine.trim() === '- [ ]') {
          e.preventDefault();
          const lineStart = start - currentLine.length;
          const newValue = value.substring(0, lineStart) + value.substring(start);
          onUpdateDocument(document.id, {
            content: newValue,
            updatedAt: Date.now(),
          });
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lineStart;
          }, 0);
          return;
        }

        e.preventDefault();
        const prefix = bulletMatch[1];
        let nextBullet = bulletMatch[2];
        if (/^\d+\./.test(nextBullet)) {
          const num = parseInt(nextBullet, 10) + 1;
          nextBullet = `${num}.`;
        }
        const insertText = `\n${prefix}${nextBullet} `;
        const newValue = value.substring(0, start) + insertText + value.substring(start);

        onUpdateDocument(document.id, {
          content: newValue,
          updatedAt: Date.now(),
        });

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + insertText.length;
        }, 0);
        return;
      }
    }

    // Shortcuts: Cmd+B (Bold), Cmd+I (Italic), Cmd+K (Link)
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        onInsertMarkdown('**', '**', 'bold text');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        onInsertMarkdown('*', '*', 'italic text');
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onInsertMarkdown('[', '](https://)', 'link title');
      }
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim().replace(/^#/, '');
    const currentTags = document.tags || [];
    if (!currentTags.includes(tag)) {
      onUpdateDocument(document.id, { tags: [...currentTags, tag], updatedAt: Date.now() });
    }
    setNewTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = (document.tags || []).filter((t) => t !== tagToRemove);
    onUpdateDocument(document.id, { tags: updated, updatedAt: Date.now() });
  };

  // Typography Class Generators
  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'serif':
        return 'font-serif tracking-normal leading-relaxed';
      case 'mono':
        return 'font-mono text-sm leading-relaxed';
      case 'sans':
      default:
        return 'font-sans tracking-tight leading-relaxed';
    }
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm':
        return 'text-xs sm:text-sm';
      case 'lg':
        return 'text-base sm:text-lg';
      case 'xl':
        return 'text-lg sm:text-xl';
      case 'base':
      default:
        return 'text-sm sm:text-base';
    }
  };

  const getPageWidthClass = () => {
    switch (settings.pageWidth) {
      case 'narrow':
        return 'max-w-2xl';
      case 'medium':
        return 'max-w-3xl';
      case 'wide':
        return 'max-w-5xl';
      case 'full':
      default:
        return 'max-w-full';
    }
  };

  const popularEmojis = ['📄', '✨', '📝', '💡', '🚀', '🔮', '🌿', '⚡', '💼', '📓', '🎯', '🔬', '📚', '🌟'];

  return (
    <div className="flex-1 flex overflow-hidden relative bg-zinc-950/70">
      {/* Central Editor Canvas Container */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-thin">
        <div className={`w-full mx-auto p-4 sm:p-8 md:p-10 flex-1 flex flex-col ${getPageWidthClass()}`}>
          {/* Document Header Metadata Bar */}
          <div className="mb-6 space-y-3 border-b border-zinc-800/80 pb-5">
            {/* Breadcrumb Folder Hierarchy */}
            {document.folderId && (
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {(() => {
                  const path: string[] = [];
                  let curr = folders.find((f) => f.id === document.folderId);
                  const visited = new Set<string>();
                  while (curr) {
                    if (visited.has(curr.id)) break;
                    visited.add(curr.id);
                    path.unshift(curr.name);
                    curr = curr.parentId ? folders.find((f) => f.id === curr!.parentId) : undefined;
                  }
                  return path.map((name, i) => (
                    <React.Fragment key={i}>
                      <span className={i === path.length - 1 ? 'text-zinc-300 font-semibold' : 'text-zinc-500'}>
                        {name}
                      </span>
                      {i < path.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />}
                    </React.Fragment>
                  ));
                })()}
              </div>
            )}

            {/* Top Row: Emoji Picker, Title Input, Favorite, Pinned, Status */}
            <div className="flex items-center gap-3">
              {/* Emoji Icon Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-10 h-10 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-xl flex items-center justify-center shadow-sm transition-all hover:scale-105 cursor-pointer"
                  title="Change document emoji"
                >
                  {document.coverEmoji || '📄'}
                </button>

                {showEmojiPicker && (
                  <div className="absolute left-0 top-full mt-2 p-2 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl z-40 flex gap-1.5 flex-wrap w-56 animate-in fade-in zoom-in-95 duration-150">
                    {popularEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          onUpdateDocument(document.id, { coverEmoji: emoji, updatedAt: Date.now() });
                          setShowEmojiPicker(false);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-base transition-transform hover:scale-110"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Document Title Input */}
              <input
                type="text"
                value={document.title}
                onChange={(e) =>
                  onUpdateDocument(document.id, { title: e.target.value, updatedAt: Date.now() })
                }
                placeholder="Untitled Document..."
                className="flex-1 text-xl sm:text-2xl md:text-3xl font-extrabold text-white bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-zinc-600 tracking-tight"
              />

              {/* Status & Favorite Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateDocument(document.id, {
                      isFavorite: !document.isFavorite,
                      updatedAt: Date.now(),
                    })
                  }
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    document.isFavorite
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 border-zinc-800'
                  }`}
                  title={document.isFavorite ? 'Starred' : 'Star this document'}
                >
                  <Star className={`w-4 h-4 ${document.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateDocument(document.id, {
                      pinned: !document.pinned,
                      updatedAt: Date.now(),
                    })
                  }
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    document.pinned
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 border-zinc-800'
                  }`}
                  title={document.pinned ? 'Pinned to top' : 'Pin document'}
                >
                  <Pin className="w-4 h-4" />
                </button>

                {/* Status Dropdown */}
                <select
                  value={document.status || 'draft'}
                  onChange={(e) =>
                    onUpdateDocument(document.id, {
                      status: e.target.value as WritingDocument['status'],
                      updatedAt: Date.now(),
                    })
                  }
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="draft">📝 Draft</option>
                  <option value="in-progress">⚡ In Progress</option>
                  <option value="review">👀 Review</option>
                  <option value="completed">✅ Completed</option>
                  <option value="archived">📦 Archived</option>
                </select>

                {/* Outline Toggle */}
                {headings.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowOutline(!showOutline)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      showOutline
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-zinc-900/60 text-zinc-400 hover:text-white border-zinc-800'
                    }`}
                    title="Toggle Table of Contents Outline"
                  >
                    <ListTree className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Tag Chips & Timestamps Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-zinc-400">
              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-zinc-500" />
                {(document.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-indigo-300 text-[11px] font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-500 hover:text-rose-400 rounded transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {showTagInput ? (
                  <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="tag name..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="px-2 py-0.5 text-[11px] bg-zinc-900 border border-indigo-500 rounded-lg text-white focus:outline-none w-24"
                    />
                    <button
                      type="submit"
                      className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-500 cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTagInput(false)}
                      className="text-zinc-500 text-xs hover:text-white"
                    >
                      ✕
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTagInput(true)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tag</span>
                  </button>
                )}
              </div>

              {/* Updated Time Indicator */}
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 ml-auto">
                <Clock className="w-3 h-3" />
                <span>Last updated {new Date(document.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Editor & Preview Split/Single Canvas */}
          <div className="flex-1 flex gap-6 min-h-[500px]">
            {/* Markdown Text Area (Editor) */}
            {(settings.viewMode === 'editor' || settings.viewMode === 'split') && (
              <div
                className={`flex-1 flex flex-col relative rounded-2xl bg-zinc-900/30 border border-zinc-800/60 p-4 transition-all ${
                  settings.viewMode === 'split' ? 'w-1/2' : 'w-full'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 flex items-center justify-between">
                  <span>Markdown Editor</span>
                  <span className="text-[10px] text-zinc-600 font-mono">Tab=Indent • Ctrl+B=Bold</span>
                </div>
                <textarea
                  ref={editorTextareaRef}
                  value={document.content}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateDocument(document.id, {
                      content: val,
                      wordCount: val.trim() ? val.trim().split(/\s+/).length : 0,
                      charCount: val.length,
                      readingTimeMinutes: Math.max(1, Math.ceil(val.trim().split(/\s+/).length / 200)),
                      updatedAt: Date.now(),
                    });
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Start writing your thoughts, notes, novel chapters, or technical specs in markdown..."
                  className={`w-full flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-100 placeholder-zinc-600 resize-none ${getFontFamilyClass()} ${getFontSizeClass()}`}
                  style={{
                    lineHeight: settings.lineSpacing === 'loose' ? '2' : settings.lineSpacing === 'relaxed' ? '1.75' : '1.5',
                  }}
                />
              </div>
            )}

            {/* Rendered Live Markdown Preview */}
            {(settings.viewMode === 'preview' || settings.viewMode === 'split') && (
              <div
                className={`flex-1 flex flex-col rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-6 overflow-y-auto ${
                  settings.viewMode === 'split' ? 'w-1/2' : 'w-full'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-4 pb-2 border-b border-zinc-800/80 flex items-center justify-between">
                  <span>Live Rendered Output</span>
                  <span className="text-zinc-500 font-normal">{words} words</span>
                </div>

                <div className={`prose prose-invert max-w-none text-zinc-200 ${getFontFamilyClass()} ${getFontSizeClass()} space-y-4`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight border-b border-zinc-800 pb-2 mt-6 mb-3">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight mt-5 mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-semibold text-indigo-300 tracking-tight mt-4 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => <p className="leading-relaxed text-zinc-300 my-2">{children}</p>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-amber-500 bg-amber-500/5 px-4 py-2 my-3 rounded-r-xl italic text-amber-200/90">
                          {children}
                        </blockquote>
                      ),
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-zinc-300">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 text-zinc-300">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      code: ({ className, children }) => {
                        const isBlock = className?.includes('language-');
                        return isBlock ? (
                          <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-indigo-200 font-mono text-xs overflow-x-auto my-3">
                            <code>{children}</code>
                          </pre>
                        ) : (
                          <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono text-xs border border-zinc-700/60">
                            {children}
                          </code>
                        );
                      },
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                          <table className="w-full text-xs text-left border-collapse rounded-xl overflow-hidden border border-zinc-800">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-zinc-800/80 text-zinc-200 uppercase font-bold">{children}</thead>,
                      th: ({ children }) => <th className="p-2.5 border-b border-zinc-700">{children}</th>,
                      td: ({ children }) => <td className="p-2.5 border-b border-zinc-800/80 text-zinc-300">{children}</td>,
                      hr: () => <hr className="my-6 border-zinc-800" />,
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors font-medium"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {document.content || '*No content yet. Type in the editor on the left.*'}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-out Table of Contents Outline Panel */}
      {showOutline && headings.length > 0 && (
        <aside className="w-64 border-l border-zinc-800/80 bg-zinc-900/90 backdrop-blur-xl p-4 overflow-y-auto animate-in slide-in-from-right duration-200 z-30">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ListTree className="w-3.5 h-3.5 text-indigo-400" />
              <span>Document Outline</span>
            </span>
            <button
              type="button"
              onClick={() => setShowOutline(false)}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1">
            {headings.map((h, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  // Find text in textarea and scroll into view
                  if (editorTextareaRef.current) {
                    const pos = editorTextareaRef.current.value.indexOf(h.text);
                    if (pos !== -1) {
                      editorTextareaRef.current.focus();
                      editorTextareaRef.current.setSelectionRange(pos, pos + h.text.length);
                    }
                  }
                }}
                className={`w-full text-left py-1 px-2 rounded-lg text-xs hover:bg-zinc-800 transition-colors truncate block ${
                  h.level === 1
                    ? 'font-bold text-zinc-100 pl-2'
                    : h.level === 2
                    ? 'font-semibold text-zinc-300 pl-4'
                    : 'text-zinc-400 pl-6'
                }`}
              >
                {h.text}
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};
