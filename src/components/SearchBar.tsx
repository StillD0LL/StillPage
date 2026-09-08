import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Globe,
  Youtube,
  Github,
  X,
  Clock,
  Trash2,
  ExternalLink,
  Bookmark as BookmarkIcon,
  Calendar,
  Newspaper,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SearchEngine, Bookmark, CalendarEvent, RSSItem } from '../types';
import { PrinnyIcon } from './PrinnyIcon';

export const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    iconName: 'Globe',
    placeholder: 'Search Google or type a URL...',
    shortcut: '!g',
  },
  {
    id: 'duckduckgo',
    name: 'PrinnyGo!',
    url: 'https://duckduckgo.com/?q=',
    iconName: 'Shield',
    placeholder: 'Search privately with PrinnyGo!...',
    shortcut: '!d',
  },
  {
    id: 'bing',
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    iconName: 'Search',
    placeholder: 'Search Bing...',
    shortcut: '!b',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com/results?search_query=',
    iconName: 'Youtube',
    placeholder: 'Search YouTube videos & music...',
    shortcut: '!y',
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/search?q=',
    iconName: 'Github',
    placeholder: 'Search repositories & code...',
    shortcut: '!gh',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    url: 'https://www.reddit.com/search/?q=',
    iconName: 'MessageSquare',
    placeholder: 'Search Reddit discussions...',
    shortcut: '!r',
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Special:Search?search=',
    iconName: 'BookOpen',
    placeholder: 'Search Wikipedia encyclopedia...',
    shortcut: '!w',
  },
];

interface SearchBarProps {
  defaultEngineId: string;
  onEngineChange: (id: string) => void;
  bookmarks: Bookmark[];
  events: CalendarEvent[];
  rssItems: RSSItem[];
  searchHistory: string[];
  onAddSearchHistory: (query: string) => void;
  onClearSearchHistory?: () => void;
  onRemoveSearchHistory?: (query: string) => void;
  compact?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  defaultEngineId,
  onEngineChange,
  bookmarks,
  events,
  rssItems,
  searchHistory,
  onAddSearchHistory,
  onClearSearchHistory,
  onRemoveSearchHistory,
  compact = false,
}) => {
  const [query, setQuery] = useState('');
  const [selectedEngineId, setSelectedEngineId] = useState(defaultEngineId);
  const [isFocused, setIsFocused] = useState(false);
  const [showEngineDropdown, setShowEngineDropdown] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentEngine =
    SEARCH_ENGINES.find((e) => e.id === selectedEngineId) || SEARCH_ENGINES[0];

  useEffect(() => {
    setSelectedEngineId(defaultEngineId);
  }, [defaultEngineId]);

  // Global shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (e.key === 'Escape') {
        setIsFocused(false);
        setShowEngineDropdown(false);
        setShowRecentSearches(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setShowEngineDropdown(false);
        setShowRecentSearches(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string = query, engineUrl: string = currentEngine.url) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    onAddSearchHistory(trimmed);

    // Check for engine shortcut prefix like "!y lo-fi" or "!gh react"
    for (const eng of SEARCH_ENGINES) {
      if (trimmed.startsWith(eng.shortcut + ' ')) {
        const queryWithoutPrefix = trimmed.slice(eng.shortcut.length + 1).trim();
        window.open(eng.url + encodeURIComponent(queryWithoutPrefix), '_blank');
        setQuery('');
        setIsFocused(false);
        return;
      }
    }

    // If it looks like a URL without spaces, open directly
    if (/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(trimmed) && !trimmed.includes(' ')) {
      const fullUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
      window.open(fullUrl, '_blank');
    } else {
      window.open(engineUrl + encodeURIComponent(trimmed), '_blank');
    }

    setQuery('');
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Filter bookmarks matching query
  const matchingBookmarks = query.trim()
    ? bookmarks.filter(
        (b) =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.url.toLowerCase().includes(query.toLowerCase()) ||
          b.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
          (b.description && b.description.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 4)
    : [];

  // Filter events matching query
  const matchingEvents = query.trim()
    ? events.filter(
        (ev) =>
          ev.title.toLowerCase().includes(query.toLowerCase()) ||
          (ev.description && ev.description.toLowerCase().includes(query.toLowerCase())) ||
          (ev.location && ev.location.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 2)
    : [];

  // Filter RSS matching query
  const matchingRss = query.trim()
    ? rssItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          (item.contentSnippet && item.contentSnippet.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 3)
    : [];

  const hasResults =
    matchingBookmarks.length > 0 || matchingEvents.length > 0 || matchingRss.length > 0;

  const hasActivePopover =
    showEngineDropdown || showRecentSearches || (isFocused && (query.trim().length > 0 || hasResults));

  return (
    <div
      ref={containerRef}
      className={`${
        compact ? 'relative w-full' : 'relative w-full max-w-3xl mx-auto'
      } ${hasActivePopover ? 'z-50' : 'z-40'}`}
    >
      {/* Search Input Bar */}
      <div
        className={`group relative flex items-center w-full ${
          compact ? 'rounded-full' : 'rounded-2xl'
        } transition-all duration-300 ${
          isFocused
            ? 'bg-zinc-900/95 shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500/60 backdrop-blur-xl border border-indigo-500/30'
            : 'bg-zinc-900/70 hover:bg-zinc-900/90 shadow-lg shadow-black/20 border border-zinc-700/70 backdrop-blur-lg'
        }`}
      >
        {/* Engine Switcher Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEngineDropdown(!showEngineDropdown)}
            className={`flex items-center gap-1.5 ${
              compact ? 'pl-3 pr-2.5 py-1.5 text-xs rounded-l-full' : 'pl-4 pr-3 py-3.5 text-sm rounded-l-2xl'
            } font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer border-r border-zinc-700/60`}
            title={`Active Engine: ${currentEngine.name}. Click to change.`}
          >
            {currentEngine.id === 'google' && <Globe className={compact ? "w-4 h-4 text-blue-400" : "w-5 h-5 text-blue-400"} />}
            {currentEngine.id === 'duckduckgo' && <PrinnyIcon className={compact ? "w-4 h-4" : "w-5 h-5"} />}
            {currentEngine.id === 'youtube' && <Youtube className={compact ? "w-4 h-4 text-red-400" : "w-5 h-5 text-red-400"} />}
            {currentEngine.id === 'github' && <Github className={compact ? "w-4 h-4 text-purple-400" : "w-5 h-5 text-purple-400"} />}
            {currentEngine.id === 'reddit' && <Globe className={compact ? "w-4 h-4 text-orange-500" : "w-5 h-5 text-orange-500"} />}
            {currentEngine.id === 'bing' && <Search className={compact ? "w-4 h-4 text-cyan-400" : "w-5 h-5 text-cyan-400"} />}
            {currentEngine.id === 'wikipedia' && <Globe className={compact ? "w-4 h-4 text-zinc-300" : "w-5 h-5 text-zinc-300"} />}
            <span className="hidden md:inline text-xs font-medium text-zinc-400">
              {currentEngine.name}
            </span>
          </button>

          {/* Engine Dropdown Menu */}
          {showEngineDropdown && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900/95 border border-zinc-700/80 rounded-xl shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Select Search Engine
              </div>
              {SEARCH_ENGINES.map((engine) => (
                <button
                  key={engine.id}
                  onClick={() => {
                    setSelectedEngineId(engine.id);
                    onEngineChange(engine.id);
                    setShowEngineDropdown(false);
                    inputRef.current?.focus();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                    selectedEngineId === engine.id
                      ? 'bg-indigo-600/30 text-indigo-300 font-medium'
                      : 'text-zinc-300 hover:bg-zinc-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {engine.id === 'google' && <Globe className="w-4 h-4 text-blue-400" />}
                    {engine.id === 'duckduckgo' && <PrinnyIcon className="w-4 h-4" />}
                    {engine.id === 'youtube' && <Youtube className="w-4 h-4 text-red-400" />}
                    {engine.id === 'github' && <Github className="w-4 h-4 text-purple-400" />}
                    {engine.id === 'reddit' && <Globe className="w-4 h-4 text-orange-500" />}
                    {engine.id === 'bing' && <Search className="w-4 h-4 text-cyan-400" />}
                    {engine.id === 'wikipedia' && <Globe className="w-4 h-4 text-zinc-300" />}
                    <span>{engine.name}</span>
                  </div>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    {engine.shortcut}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={currentEngine.placeholder}
          className={`flex-1 bg-transparent ${
            compact ? 'px-3 py-1.5 text-xs sm:text-sm' : 'px-4 py-3.5 text-base'
          } text-zinc-100 placeholder-zinc-400 focus:outline-none`}
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 mr-1 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Shortcut Badge / Search Action Button */}
        <div className={`${compact ? 'pr-2' : 'pr-3'} flex items-center gap-1.5`}>
          {query.trim() ? (
            <button
              type="button"
              onClick={() => handleSearch()}
              className={`flex items-center gap-1 ${
                compact ? 'px-2.5 py-1 rounded-full' : 'px-3 py-1.5 rounded-xl'
              } bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer`}
            >
              <span>Search</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowRecentSearches((prev) => !prev);
                setShowEngineDropdown(false);
              }}
              className={`flex items-center gap-1 ${
                compact ? 'px-2 py-1 text-[11px] rounded-full' : 'px-2.5 py-1.5 text-xs rounded-xl'
              } font-medium border transition-all cursor-pointer ${
                showRecentSearches
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700/60'
              }`}
              title="Recent searches"
            >
              <Clock className="w-3 h-3 text-indigo-400" />
              <span className="hidden md:inline">Recent</span>
            </button>
          )}
        </div>
      </div>

      {/* Dedicated Recent Searches Popover (Triggered only by the Recent button) */}
      {showRecentSearches && (
        <div className="absolute top-full right-0 mt-2 w-full sm:w-96 bg-zinc-900/95 border border-zinc-700/80 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Recent Searches</span>
              </div>
              {searchHistory.length > 0 && onClearSearchHistory && (
                <button
                  type="button"
                  onClick={() => onClearSearchHistory()}
                  className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* List of recent searches */}
            {searchHistory.length > 0 ? (
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                {searchHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-700/30 hover:border-indigo-500/40 transition-all group"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(item);
                        handleSearch(item);
                        setShowRecentSearches(false);
                      }}
                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
                      <span className="text-xs text-zinc-200 group-hover:text-white truncate">
                        {item}
                      </span>
                    </button>

                    {onRemoveSearchHistory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSearchHistory(item);
                        }}
                        className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-zinc-700/50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove search"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-zinc-400">
                <Clock className="w-6 h-6 mx-auto mb-2 text-zinc-600 opacity-60" />
                <p className="text-xs font-medium text-zinc-300">No recent searches</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Searches will appear here as you search.</p>
              </div>
            )}

            {/* Quick Search Engine Shortcuts Guide */}
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Engine Prefixes
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {SEARCH_ENGINES.slice(0, 4).map((eng) => (
                  <button
                    key={eng.id}
                    type="button"
                    onClick={() => {
                      setQuery(eng.shortcut + ' ');
                      setShowRecentSearches(false);
                      inputRef.current?.focus();
                    }}
                    className="p-2 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/40 text-left transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-indigo-400 font-semibold">{eng.shortcut}</span>
                    <span className="text-[11px] text-zinc-400 ml-1.5">Search {eng.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instant Search Suggestions & Matching Results (Shown only when query is typed) */}
      {isFocused && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 border border-zinc-700/80 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[70vh] overflow-y-auto">
          <div className="p-3 space-y-4">
            {/* Web Search Item */}
            <div
              onClick={() => handleSearch()}
              className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/20 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-indigo-200">
                    Search <span className="font-semibold text-white">"{query}"</span> on {currentEngine.name}
                  </div>
                  <div className="text-xs text-indigo-400/80">Press Enter to browse directly</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
            </div>

            {/* Matching Bookmarks */}
            {matchingBookmarks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-2 pb-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <BookmarkIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Matching Bookmarks</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingBookmarks.map((bm) => (
                    <a
                      key={bm.id}
                      href={bm.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 transition-all hover:border-indigo-500/40 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-700/80 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        {bm.icon ? (
                          <img
                            src={bm.icon}
                            alt=""
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Globe className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-300 truncate">
                          {bm.title}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">
                          {bm.url.replace(/^https?:\/\//, '')}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Events */}
            {matchingEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-2 pb-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Calendar Events</span>
                </div>
                <div className="space-y-1.5">
                  {matchingEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-700/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: evt.color || '#10b981' }}
                        />
                        <div>
                          <div className="text-xs font-semibold text-zinc-200">{evt.title}</div>
                          <div className="text-[11px] text-zinc-400">
                            {evt.date} {evt.time ? `• ${evt.time}` : ''} {evt.location ? `(${evt.location})` : ''}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {evt.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching News */}
            {matchingRss.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-2 pb-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <Newspaper className="w-3.5 h-3.5 text-amber-400" />
                  <span>News Articles</span>
                </div>
                <div className="space-y-1.5">
                  {matchingRss.map((item) => (
                    <a
                      key={item.id}
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-700/40 hover:border-amber-500/40 transition-colors group"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="text-xs font-medium text-zinc-200 group-hover:text-amber-300 line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-zinc-400">{item.feedTitle}</div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
