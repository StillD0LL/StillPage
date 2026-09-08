import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bookmark as BookmarkIcon,
  Plus,
  ExternalLink,
  Search,
  Tag,
  Grid,
  List,
  Layers,
  Sparkles,
  Pin,
  Trash2,
  Edit2,
  Copy,
  Check,
  Folder,
  Code,
  Briefcase,
  Film,
  Palette,
  Newspaper,
  Wrench,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Globe,
  Eye,
  EyeOff,
  ImageOff,
  Image as ImageIcon,
} from 'lucide-react';
import { Bookmark, BookmarkCategory, WidgetSize } from '../../types';
import { uiSound } from '../../services/uiSound';

interface BookmarksWidgetProps {
  size: WidgetSize;
  bookmarks: Bookmark[];
  categories: BookmarkCategory[];
  isCleanMode?: boolean;
  onAddBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  onUpdateBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (id: string) => void;
  onReorderBookmarks: (bookmarks: Bookmark[]) => void;
  onAddCategory?: (name: string, icon: string) => void;
  onOpenBookmarkModal?: (bookmark?: Bookmark) => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  Layers: <Layers className="w-3.5 h-3.5" />,
  Code: <Code className="w-3.5 h-3.5" />,
  Briefcase: <Briefcase className="w-3.5 h-3.5" />,
  Film: <Film className="w-3.5 h-3.5" />,
  Palette: <Palette className="w-3.5 h-3.5" />,
  Newspaper: <Newspaper className="w-3.5 h-3.5" />,
  Wrench: <Wrench className="w-3.5 h-3.5" />,
  Folder: <Folder className="w-3.5 h-3.5" />,
};

export const BookmarksWidget: React.FC<BookmarksWidgetProps> = ({
  size,
  bookmarks,
  categories,
  isCleanMode = false,
  onAddBookmark,
  onUpdateBookmark,
  onDeleteBookmark,
  onReorderBookmarks,
  onOpenBookmarkModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('cat-all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'list'>('grid');
  const [showHidden, setShowHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dash_show_hidden_bookmarks') === 'true';
    } catch {
      return false;
    }
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // Local reorderable bookmarks state for real-time fluid animations
  const [localBookmarks, setLocalBookmarks] = useState<Bookmark[]>(() => {
    return [...bookmarks].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });
  });

  // Sync with prop when not actively dragging
  useEffect(() => {
    if (!draggedItemId) {
      setLocalBookmarks(
        [...bookmarks].sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return (a.order ?? 0) - (b.order ?? 0);
        })
      );
    }
  }, [bookmarks, draggedItemId]);

  const hiddenCount = useMemo(() => {
    return localBookmarks.filter((b) => b.hidden).length;
  }, [localBookmarks]);

  const handleToggleShowHidden = () => {
    setShowHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('dash_show_hidden_bookmarks', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Gather all unique tags from active category (respecting hidden filter)
  const availableTags = useMemo(() => {
    const relevantBookmarks = localBookmarks.filter((b) => {
      if (!showHidden && b.hidden) return false;
      if (activeCategory !== 'cat-all' && b.category !== activeCategory) return false;
      return true;
    });

    const tagSet = new Set<string>();
    relevantBookmarks.forEach((b) => {
      b.tags.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [localBookmarks, activeCategory, showHidden]);

  // Filtered bookmarks preserving the active real-time order
  const filteredBookmarks = useMemo(() => {
    return localBookmarks.filter((bm) => {
      // Hidden filter
      if (!showHidden && bm.hidden) {
        return false;
      }
      // Category filter
      if (activeCategory !== 'cat-all' && bm.category !== activeCategory) {
        return false;
      }
      // Tag filter
      if (selectedTag && !bm.tags.includes(selectedTag)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = bm.title.toLowerCase().includes(q);
        const matchesUrl = bm.url.toLowerCase().includes(q);
        const matchesDesc = bm.description && bm.description.toLowerCase().includes(q);
        const matchesTag = bm.tags.some((t) => t.toLowerCase().includes(q));
        return matchesTitle || matchesUrl || matchesDesc || matchesTag;
      }
      return true;
    });
  }, [localBookmarks, activeCategory, selectedTag, searchQuery, showHidden]);

  const handleCopyLink = (e: React.MouseEvent, bm: Bookmark) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(bm.url);
    setCopiedId(bm.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTogglePin = (e: React.MouseEvent, bm: Bookmark) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdateBookmark({
      ...bm,
      pinned: !bm.pinned,
    });
  };

  const handleToggleHidden = (e: React.MouseEvent, bm: Bookmark) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdateBookmark({
      ...bm,
      hidden: !bm.hidden,
    });
  };

  const handleToggleHideThumbnail = (e: React.MouseEvent, bm: Bookmark) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdateBookmark({
      ...bm,
      hideThumbnail: !bm.hideThumbnail,
    });
  };

  // Drag and Drop reordering handlers with smooth pop out and live position displacement
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.setData('application/x-bookmark-id', id);
    if (uiSound.isEnabled()) {
      uiSound.playClick();
    }
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (!draggedItemId || draggedItemId === targetId) return;

    setDragOverItemId(targetId);

    setLocalBookmarks((prev) => {
      const sourceIdx = prev.findIndex((b) => b.id === draggedItemId);
      const targetIdx = prev.findIndex((b) => b.id === targetId);
      if (sourceIdx === -1 || targetIdx === -1 || sourceIdx === targetIdx) {
        return prev;
      }
      const updated = [...prev];
      const [movedItem] = updated.splice(sourceIdx, 1);
      updated.splice(targetIdx, 0, movedItem);
      return updated;
    });
  };

  const handleDrop = (e: React.DragEvent, targetId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedItemId) return;

    const reordered = localBookmarks.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    onReorderBookmarks(reordered);
    setDraggedItemId(null);
    setDragOverItemId(null);
    if (uiSound.isEnabled()) {
      uiSound.playClick();
    }
  };

  const handleDragEnd = (e?: React.DragEvent | any) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (draggedItemId) {
      const reordered = localBookmarks.map((item, idx) => ({
        ...item,
        order: idx,
      }));
      onReorderBookmarks(reordered);
    }
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const getCategoryCount = (catId: string) => {
    const pool = showHidden ? localBookmarks : localBookmarks.filter((b) => !b.hidden);
    if (catId === 'cat-all') return pool.length;
    return pool.filter((b) => b.category === catId).length;
  };

  return (
    <div
      className="h-full flex flex-col justify-between space-y-4"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => handleDrop(e)}
    >
      {/* Top Header Controls: Search, Hidden Toggle, View Mode, Add Bookmark */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
        {/* Bookmark Inline Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter bookmarks or tags..."
            className="w-full bg-zinc-800/70 hover:bg-zinc-800 text-xs text-zinc-200 placeholder-zinc-400 pl-8 pr-7 py-1.5 rounded-xl border border-zinc-700/50 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Action Controls: Show Hidden, View Modes, Add Bookmark - Hidden in Clean Mode */}
        {!isCleanMode && (
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Toggle Show Hidden Bookmarks */}
            <button
              type="button"
              onClick={handleToggleShowHidden}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showHidden
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10 ring-1 ring-amber-400/30'
                  : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700/50'
              }`}
              title={showHidden ? 'Hide hidden bookmarks from view' : 'Show hidden bookmarks'}
            >
              {showHidden ? (
                <Eye className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span>{showHidden ? 'Hidden Shown' : 'Hidden'}</span>
              {hiddenCount > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    showHidden
                      ? 'bg-amber-500/40 text-amber-100 font-bold'
                      : 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {hiddenCount}
                </span>
              )}
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-700/50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Thumbnail Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Compact Tiles"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenBookmarkModal?.()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bookmark</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Tabs Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const count = getCategoryCount(cat.id);
          const isActive = activeCategory === cat.id;
          const icon = CATEGORY_ICON_MAP[cat.icon] || <Folder className="w-3.5 h-3.5" />;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedTag(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/40'
                  : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/40'
              }`}
            >
              <span className={isActive ? 'text-indigo-200' : 'text-zinc-400'}>{icon}</span>
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-indigo-800/80 text-indigo-100' : 'bg-zinc-700/60 text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tag Filter Chips Bar */}
      {availableTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
            <Tag className="w-3 h-3 text-indigo-400" />
            <span>Tags:</span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
              selectedTag === null
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Tags
          </button>

          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-zinc-800/60 hover:bg-zinc-800 text-indigo-300/90 border border-zinc-700/40'
              }`}
            >
              <span>#{tag}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bookmarks Display Area */}
      <div className="flex-1 overflow-y-auto min-h-[220px]">
        {filteredBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookmarkIcon className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-zinc-300">No bookmarks found</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs">
              {searchQuery || selectedTag
                ? 'Try adjusting your search query or tag filters.'
                : !showHidden && hiddenCount > 0
                ? `${hiddenCount} bookmark${hiddenCount > 1 ? 's are' : ' is'} hidden. Enable the "Hidden" toggle above to view.`
                : 'Get started by adding your favorite websites, tools, and links.'}
            </p>
            {!showHidden && hiddenCount > 0 ? (
              <button
                type="button"
                onClick={handleToggleShowHidden}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-xl transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show {hiddenCount} Hidden Bookmark{hiddenCount > 1 ? 's' : ''}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenBookmarkModal?.()}
                className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all"
              >
                Add your first bookmark
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Visual Thumbnail Grid View with Fluid Location-Switch Animation */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
            {filteredBookmarks.map((bm) => {
              const isMoving = draggedItemId === bm.id;
              const isHoveredTarget = dragOverItemId === bm.id && !isMoving;

              return (
                <motion.div
                  key={bm.id}
                  layout
                  layoutId={`bm-grid-${bm.id}`}
                  transition={{
                    layout: { type: 'spring', stiffness: 450, damping: 32 },
                  }}
                  draggable
                  onDragStart={(e: any) => handleDragStart(e, bm.id)}
                  onDragOver={(e) => handleDragOver(e, bm.id)}
                  onDragEnd={(e: any) => handleDragEnd(e)}
                  onDrop={(e) => handleDrop(e, bm.id)}
                  animate={
                    isMoving
                      ? {
                          scale: 1.08,
                          rotate: -1.5,
                          zIndex: 50,
                          boxShadow:
                            '0 20px 30px -4px rgba(99, 102, 241, 0.45), 0 10px 15px -3px rgba(0, 0, 0, 0.6)',
                        }
                      : {
                          scale: 1,
                          rotate: 0,
                          zIndex: 1,
                          boxShadow: '0 0 0 0 rgba(0,0,0,0)',
                        }
                  }
                  className={`group relative flex flex-col rounded-xl border transition-colors overflow-hidden select-none ${
                    isMoving
                      ? 'border-indigo-400 bg-indigo-950/95 ring-2 ring-indigo-400 shadow-2xl cursor-grabbing'
                      : isHoveredTarget
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-900/30'
                      : bm.hidden
                      ? 'border-dashed border-amber-500/50 bg-amber-950/15 cursor-grab'
                      : bm.pinned
                      ? 'border-indigo-500/40 bg-zinc-800/40 shadow-md shadow-indigo-500/5 hover:bg-zinc-800/80 cursor-grab'
                      : 'border-zinc-700/50 bg-zinc-800/40 hover:bg-zinc-800/80 hover:border-zinc-600 cursor-grab'
                  }`}
                >
                  {/* Moving Pop-Out Floating Indicator Badge */}
                  {isMoving && (
                    <div className="absolute top-2 left-2 z-50 px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold shadow-lg flex items-center gap-1 ring-1 ring-white/30 animate-pulse pointer-events-none">
                      <GripVertical className="w-3 h-3" />
                      <span>Moving</span>
                    </div>
                  )}

                  {/* Thumbnail Image Header (or Hidden Thumbnail Fallback) */}
                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noreferrer"
                    draggable={false}
                    className="relative aspect-[4/5] w-full bg-zinc-900 overflow-hidden block cursor-pointer"
                  >
                    {!bm.hideThumbnail && bm.thumbnail ? (
                      <img
                        src={bm.thumbnail}
                        alt={bm.title}
                        draggable={false}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100 pointer-events-none"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-indigo-950/40 flex flex-col items-center justify-center p-3 text-center pointer-events-none">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center mb-1 shadow-inner">
                          {bm.icon ? (
                            <img
                              src={bm.icon}
                              alt=""
                              draggable={false}
                              className="w-5 h-5 object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Globe className="w-5 h-5 text-indigo-400/70" />
                          )}
                        </div>
                        {bm.hideThumbnail && (
                          <span className="text-[9px] font-medium text-amber-400/80 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.2 rounded mt-1">
                            No Thumbnail
                          </span>
                        )}
                      </div>
                    )}

                    {/* Dark overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/20 to-transparent pointer-events-none" />

                    {/* Hidden Indicator Badge on Top-Left if Hidden */}
                    {bm.hidden && !isMoving && (
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/80 text-zinc-950 text-[9px] font-bold shadow-md pointer-events-none">
                        <EyeOff className="w-2.5 h-2.5" />
                        <span>Hidden</span>
                      </div>
                    )}

                    {/* Top-Right Quick Action Badges */}
                    <div
                      className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity z-20"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {/* Toggle Pin */}
                      <button
                        type="button"
                        draggable={false}
                        onClick={(e) => handleTogglePin(e, bm)}
                        className={`p-1 rounded-md backdrop-blur-md transition-colors ${
                          bm.pinned
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-900'
                        }`}
                        title={bm.pinned ? 'Unpin bookmark' : 'Pin bookmark'}
                      >
                        <Pin className="w-2.5 h-2.5" />
                      </button>

                      {/* Quick Hide/Unhide Bookmark */}
                      <button
                        type="button"
                        draggable={false}
                        onClick={(e) => handleToggleHidden(e, bm)}
                        className={`p-1 rounded-md backdrop-blur-md transition-colors ${
                          bm.hidden
                            ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                            : 'bg-zinc-900/80 text-zinc-300 hover:text-amber-300 hover:bg-zinc-900'
                        }`}
                        title={bm.hidden ? 'Unhide bookmark' : 'Mark bookmark as hidden'}
                      >
                        {bm.hidden ? (
                          <Eye className="w-2.5 h-2.5" />
                        ) : (
                          <EyeOff className="w-2.5 h-2.5" />
                        )}
                      </button>

                      {/* Copy Link */}
                      <button
                        type="button"
                        draggable={false}
                        onClick={(e) => handleCopyLink(e, bm)}
                        className="p-1 rounded-md bg-zinc-900/80 hover:bg-zinc-900 text-zinc-300 hover:text-white backdrop-blur-md transition-colors"
                        title="Copy URL"
                      >
                        {copiedId === bm.id ? (
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>

                    {/* Favicon Floating at Bottom-Left of Thumbnail */}
                    {!bm.hideThumbnail && (
                      <div className="absolute -bottom-2 left-2 w-6 h-6 rounded-lg bg-zinc-900 p-1 border border-zinc-700 shadow-md flex items-center justify-center overflow-hidden pointer-events-none">
                        {bm.icon ? (
                          <img
                            src={bm.icon}
                            alt=""
                            draggable={false}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Globe className="w-3 h-3 text-zinc-400" />
                        )}
                      </div>
                    )}
                  </a>

                  {/* Card Body */}
                  <div className="p-2.5 pt-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <a
                          href={bm.url}
                          target="_blank"
                          rel="noreferrer"
                          draggable={false}
                          className="text-[11px] font-bold text-zinc-100 group-hover:text-indigo-300 line-clamp-1 transition-colors"
                        >
                          {bm.title}
                        </a>
                        <a
                          href={bm.url}
                          target="_blank"
                          rel="noreferrer"
                          draggable={false}
                          className="text-zinc-500 hover:text-zinc-200 shrink-0"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      <div className="text-[10px] text-zinc-400 font-mono truncate mt-0.5 pointer-events-none">
                        {bm.url.replace(/^https?:\/\/(www\.)?/, '')}
                      </div>

                      {bm.description && (
                        <p className="text-[10px] text-zinc-400 line-clamp-1 mt-1 pointer-events-none">
                          {bm.description}
                        </p>
                      )}
                    </div>

                    {/* Tags and Action Bar */}
                    <div className="mt-2 pt-2 border-t border-zinc-700/40 flex items-center justify-between">
                      {/* Tag Chips */}
                      <div className="flex flex-wrap gap-1 max-w-[calc(100%-60px)] overflow-hidden">
                        {bm.tags.slice(0, 1).map((t) => (
                          <button
                            key={t}
                            type="button"
                            draggable={false}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => setSelectedTag(t)}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-zinc-700/50 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 transition-colors truncate max-w-[60px]"
                          >
                            #{t}
                          </button>
                        ))}
                        {bm.tags.length > 1 && (
                          <span className="text-[9px] text-zinc-400">+{bm.tags.length - 1}</span>
                        )}
                      </div>

                      {/* Edit, Thumbnail Toggle & Delete Controls */}
                      <div
                        className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {/* Toggle Hide/Show Thumbnail on card */}
                        <button
                          type="button"
                          draggable={false}
                          onClick={(e) => handleToggleHideThumbnail(e, bm)}
                          className={`p-1 rounded transition-colors ${
                            bm.hideThumbnail
                              ? 'text-amber-400 hover:text-amber-300'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                          title={bm.hideThumbnail ? 'Show thumbnail on card' : 'Hide thumbnail on card'}
                        >
                          {bm.hideThumbnail ? (
                            <ImageOff className="w-2.5 h-2.5" />
                          ) : (
                            <ImageIcon className="w-2.5 h-2.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          draggable={false}
                          onClick={() => onOpenBookmarkModal?.(bm)}
                          className="p-1 text-zinc-400 hover:text-indigo-300 rounded transition-colors"
                          title="Edit bookmark"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          draggable={false}
                          onClick={() => onDeleteBookmark(bm.id)}
                          className="p-1 text-zinc-400 hover:text-rose-400 rounded transition-colors"
                          title="Delete bookmark"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : viewMode === 'compact' ? (
          /* Compact Tiles View with Fluid Location-Switch Animation */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
            {filteredBookmarks.map((bm) => {
              const isMoving = draggedItemId === bm.id;
              const isHoveredTarget = dragOverItemId === bm.id && !isMoving;

              return (
                <motion.div
                  key={bm.id}
                  layout
                  layoutId={`bm-compact-${bm.id}`}
                  transition={{
                    layout: { type: 'spring', stiffness: 450, damping: 32 },
                  }}
                  draggable
                  onDragStart={(e: any) => handleDragStart(e, bm.id)}
                  onDragOver={(e) => handleDragOver(e, bm.id)}
                  onDragEnd={(e: any) => handleDragEnd(e)}
                  onDrop={(e) => handleDrop(e, bm.id)}
                  animate={
                    isMoving
                      ? {
                          scale: 1.06,
                          rotate: -1,
                          zIndex: 50,
                          boxShadow:
                            '0 16px 25px -4px rgba(99, 102, 241, 0.45), 0 8px 10px -3px rgba(0, 0, 0, 0.5)',
                        }
                      : {
                          scale: 1,
                          rotate: 0,
                          zIndex: 1,
                          boxShadow: '0 0 0 0 rgba(0,0,0,0)',
                        }
                  }
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl border transition-colors select-none ${
                    isMoving
                      ? 'border-indigo-400 bg-indigo-950/95 ring-2 ring-indigo-400 shadow-2xl cursor-grabbing'
                      : isHoveredTarget
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-900/30'
                      : bm.hidden
                      ? 'border-dashed border-amber-500/50 bg-amber-950/15 cursor-grab'
                      : bm.pinned
                      ? 'border-indigo-500/40 bg-zinc-800/50 hover:bg-zinc-800 cursor-grab'
                      : 'border-zinc-700/40 bg-zinc-800/50 hover:bg-zinc-800 hover:border-zinc-600 cursor-grab'
                  }`}
                >
                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noreferrer"
                    draggable={false}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 p-1 flex items-center justify-center shrink-0 overflow-hidden pointer-events-none">
                      {bm.icon ? (
                        <img
                          src={bm.icon}
                          alt=""
                          draggable={false}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-300 truncate flex items-center gap-1">
                        <span>{bm.title}</span>
                        {bm.hidden && <EyeOff className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate pointer-events-none">
                        {bm.tags[0] ? `#${bm.tags[0]}` : bm.url.replace(/^https?:\/\//, '')}
                      </div>
                    </div>
                  </a>

                  {/* Quick actions on hover */}
                  <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      draggable={false}
                      onClick={(e) => handleToggleHidden(e, bm)}
                      className="p-1 text-zinc-400 hover:text-amber-400 rounded"
                      title={bm.hidden ? 'Unhide bookmark' : 'Hide bookmark'}
                    >
                      {bm.hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      draggable={false}
                      onClick={() => onOpenBookmarkModal?.(bm)}
                      className="p-1 text-zinc-400 hover:text-indigo-300 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View with Fluid Location-Switch Animation */
          <div className="space-y-1.5">
            {filteredBookmarks.map((bm) => {
              const isMoving = draggedItemId === bm.id;
              const isHoveredTarget = dragOverItemId === bm.id && !isMoving;

              return (
                <motion.div
                  key={bm.id}
                  layout
                  layoutId={`bm-list-${bm.id}`}
                  transition={{
                    layout: { type: 'spring', stiffness: 450, damping: 32 },
                  }}
                  draggable
                  onDragStart={(e: any) => handleDragStart(e, bm.id)}
                  onDragOver={(e) => handleDragOver(e, bm.id)}
                  onDragEnd={(e: any) => handleDragEnd(e)}
                  onDrop={(e) => handleDrop(e, bm.id)}
                  animate={
                    isMoving
                      ? {
                          scale: 1.02,
                          y: -2,
                          zIndex: 50,
                          boxShadow:
                            '0 14px 24px -4px rgba(99, 102, 241, 0.45), 0 6px 10px -2px rgba(0, 0, 0, 0.5)',
                        }
                      : {
                          scale: 1,
                          y: 0,
                          zIndex: 1,
                          boxShadow: '0 0 0 0 rgba(0,0,0,0)',
                        }
                  }
                  className={`group flex items-center justify-between p-2.5 rounded-xl border transition-colors select-none ${
                    isMoving
                      ? 'border-indigo-400 bg-indigo-950/95 ring-2 ring-indigo-400 shadow-2xl cursor-grabbing'
                      : isHoveredTarget
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-indigo-900/30'
                      : bm.hidden
                      ? 'border-dashed border-amber-500/50 bg-amber-950/15 cursor-grab'
                      : 'border-zinc-700/40 hover:border-zinc-600 bg-zinc-800/40 hover:bg-zinc-800/80 cursor-grab'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-md bg-zinc-900 p-1 flex items-center justify-center shrink-0 pointer-events-none">
                      {bm.icon ? (
                        <img
                          src={bm.icon}
                          alt=""
                          draggable={false}
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <a
                        href={bm.url}
                        target="_blank"
                        rel="noreferrer"
                        draggable={false}
                        className="text-xs font-semibold text-zinc-200 hover:text-indigo-300 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{bm.title}</span>
                        {bm.hidden && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 flex items-center gap-0.5">
                            <EyeOff className="w-2.5 h-2.5" />
                            <span>Hidden</span>
                          </span>
                        )}
                        {bm.hideThumbnail && (
                          <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-zinc-700/40 text-zinc-400 flex items-center gap-0.5">
                            <ImageOff className="w-2.5 h-2.5 text-amber-400" />
                          </span>
                        )}
                      </a>
                      <span className="text-[11px] text-zinc-400 ml-2 hidden sm:inline font-mono pointer-events-none">
                        {bm.url.replace(/^https?:\/\/(www\.)?/, '')}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 shrink-0 ml-2"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="hidden md:flex items-center gap-1 pointer-events-none">
                      {bm.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-indigo-300 font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Toggle Hide/Unhide bookmark */}
                    <button
                      type="button"
                      draggable={false}
                      onClick={(e) => handleToggleHidden(e, bm)}
                      className="p-1 text-zinc-400 hover:text-amber-400 rounded"
                      title={bm.hidden ? 'Unhide bookmark' : 'Hide bookmark'}
                    >
                      {bm.hidden ? (
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      draggable={false}
                      onClick={(e) => handleCopyLink(e, bm)}
                      className="p-1 text-zinc-400 hover:text-white rounded"
                      title="Copy URL"
                    >
                      {copiedId === bm.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noreferrer"
                      draggable={false}
                      className="p-1 text-zinc-400 hover:text-indigo-300 rounded"
                      title="Open link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      draggable={false}
                      onClick={() => onOpenBookmarkModal?.(bm)}
                      className="p-1 text-zinc-400 hover:text-indigo-300 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      draggable={false}
                      onClick={() => onDeleteBookmark(bm.id)}
                      className="p-1 text-zinc-400 hover:text-rose-400 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

