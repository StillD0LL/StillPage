import React from 'react';
import {
  LayoutGrid,
  Palette,
  Settings,
  Sparkles,
  SlidersHorizontal,
  Check,
  Maximize,
  Minimize,
  EyeOff,
} from 'lucide-react';
import { BookMarkerNav } from './navigation/BookMarkerNav';
import { SearchBar } from './SearchBar';
import { PageId, Bookmark, CalendarEvent, RSSItem } from '../types';

interface HeaderProps {
  activePage?: PageId;
  onSelectPage?: (page: PageId) => void;
  isEditMode: boolean;
  isCleanMode?: boolean;
  onToggleEditMode: () => void;
  onToggleCleanMode: () => void;
  onOpenWidgetCustomizer: () => void;
  onOpenThemeCustomizer: () => void;
  onOpenSettings: () => void;
  // Browser Search Bar Props
  defaultEngineId: string;
  onEngineChange: (id: string) => void;
  bookmarks: Bookmark[];
  events: CalendarEvent[];
  rssItems: RSSItem[];
  searchHistory: string[];
  onAddSearchHistory: (query: string) => void;
  onClearSearchHistory?: () => void;
  onRemoveSearchHistory?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage = 'dashboard',
  onSelectPage,
  isEditMode,
  isCleanMode = false,
  onToggleEditMode,
  onToggleCleanMode,
  onOpenWidgetCustomizer,
  onOpenThemeCustomizer,
  onOpenSettings,
  defaultEngineId,
  onEngineChange,
  bookmarks,
  events,
  rssItems,
  searchHistory,
  onAddSearchHistory,
  onClearSearchHistory,
  onRemoveSearchHistory,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="w-full flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4 py-2 sm:py-2.5 px-4 sm:px-6 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 shadow-lg shadow-black/30 sticky top-0">
      {/* 1. Page Navigation Capsule */}
      {onSelectPage && (
        <div className="shrink-0 self-center md:self-auto">
          <BookMarkerNav
            activePage={activePage}
            onSelectPage={onSelectPage}
            isCleanMode={isCleanMode}
          />
        </div>
      )}

      {/* 2. Universal Browser Search Bar (Shown on dashboard, writer) */}
      {activePage !== 'start' ? (
        <div className="flex-1 w-full md:max-w-xl lg:max-w-2xl min-w-0">
          <SearchBar
            defaultEngineId={defaultEngineId}
            onEngineChange={onEngineChange}
            bookmarks={bookmarks}
            events={events}
            rssItems={rssItems}
            searchHistory={searchHistory}
            onAddSearchHistory={onAddSearchHistory}
            onClearSearchHistory={onClearSearchHistory}
            onRemoveSearchHistory={onRemoveSearchHistory}
            compact={true}
          />
        </div>
      ) : (
        <div className="flex-1 hidden md:block" />
      )}

      {/* 3. Action Tools & Utilities */}
      <div className="flex items-center gap-1.5 shrink-0 self-center md:self-auto flex-wrap justify-end">
        {/* Dashboard-specific controls */}
        {activePage === 'dashboard' && (
          <>
            {/* Toggle Clean Mode */}
            <button
              type="button"
              onClick={onToggleCleanMode}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isCleanMode
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60'
              }`}
              title={isCleanMode ? 'Exit Clean Mode' : 'Enable Clean Mode'}
            >
              {isCleanMode ? <Sparkles className="w-3.5 h-3.5 text-zinc-950" /> : <EyeOff className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline">{isCleanMode ? 'Clean' : 'Clean Mode'}</span>
            </button>

            {/* Toggle Edit Layout Mode */}
            {!isCleanMode && (
              <button
                type="button"
                onClick={onToggleEditMode}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isEditMode
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-lg shadow-amber-500/30 ring-2 ring-amber-400'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60'
                }`}
                title="Drag and resize widgets"
              >
                {isEditMode ? <Check className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isEditMode ? 'Done' : 'Customize'}</span>
              </button>
            )}

            {/* Widgets / Dashboard Layout & Presets Manager */}
            {!isCleanMode && (
              <button
                type="button"
                onClick={onOpenWidgetCustomizer}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
                title="Dashboard Layout, Widgets & Presets"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Widgets</span>
              </button>
            )}
          </>
        )}

        {/* Theme Customizer Trigger */}
        <button
          type="button"
          onClick={onOpenThemeCustomizer}
          className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
          title="Theme, Wallpapers & Image Mover"
        >
          <Palette className="w-3.5 h-3.5 text-violet-400" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden sm:flex p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>

        {/* Settings Trigger */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors cursor-pointer"
          title="Settings & Backup"
        >
          <Settings className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>
    </header>
  );
};
