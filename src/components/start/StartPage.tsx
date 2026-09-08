import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  LayoutGrid,
  PenTool,
  Sparkles,
  Sliders,
  Clock,
  Calendar as CalendarIcon,
  Search,
  ExternalLink,
  Plus,
  ArrowRight,
  Sun,
  Cloud,
  Quote,
  Pencil,
  Maximize2,
  Move,
} from 'lucide-react';
import {
  PageId,
  StartPageConfig,
  StartVideoItem,
  Bookmark,
  CalendarEvent,
  RSSItem,
} from '../../types';
import { StartBackground } from './StartBackground';
import { StartCustomizerModal } from './StartCustomizerModal';
import { SearchBar } from '../SearchBar';
import {
  START_BACKGROUND_PRESETS,
  DEFAULT_START_CONFIG,
  INSPIRATIONAL_QUOTES,
} from '../../utils/startDefaults';
import { storage } from '../../services/storage';
import { uiSound } from '../../services/uiSound';

interface StartPageProps {
  onSelectPage: (page: PageId) => void;
  bookmarks: Bookmark[];
  events: CalendarEvent[];
  searchHistory: string[];
  defaultEngineId: string;
  onEngineChange: (id: string) => void;
  onAddSearchHistory: (query: string) => void;
  onClearSearchHistory?: () => void;
  onRemoveSearchHistory?: (query: string) => void;
  isCleanMode?: boolean;
}

export const StartPage: React.FC<StartPageProps> = ({
  onSelectPage,
  bookmarks,
  events,
  searchHistory,
  defaultEngineId,
  onEngineChange,
  onAddSearchHistory,
  onClearSearchHistory,
  onRemoveSearchHistory,
  isCleanMode = false,
}) => {
  const [config, setConfig] = useState<StartPageConfig>(() =>
    storage.getStartPageConfig()
  );
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Mouse coordinates tracking for 2.5D optical parallax
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!config.parallaxEnabled) return;
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth) * 2 - 1;
      const normY = (e.clientY / innerHeight) * 2 - 1;
      setMousePos({ x: normX, y: normY });
    },
    [config.parallaxEnabled]
  );

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateConfig = useCallback(
    (newConfig: StartPageConfig | ((prev: StartPageConfig) => StartPageConfig)) => {
      setConfig((prev) => {
        const resolved =
          typeof newConfig === 'function' ? newConfig(prev) : newConfig;
        storage.saveStartPageConfig(resolved);
        return resolved;
      });
    },
    []
  );

  const handleResetDefaults = () => {
    setConfig(DEFAULT_START_CONFIG);
    storage.saveStartPageConfig(DEFAULT_START_CONFIG);
  };

  // Video Playlist Helpers & Handlers
  const playlist: StartVideoItem[] =
    config.videoPlaylist && config.videoPlaylist.length > 0
      ? config.videoPlaylist
      : config.backgroundUrl
      ? [
          {
            id: 'default-single-vid',
            title: config.customMediaName || 'Ambient Video',
            url: config.backgroundUrl,
            poster: config.backgroundPoster,
            thumbnail: config.backgroundPoster,
            customMediaId: config.customMediaId,
            customMediaName: config.customMediaName,
            sourceType: config.customMediaId ? 'local' : 'preset',
          },
        ]
      : [];

  const currentVideoIdx = Math.min(
    Math.max(0, config.currentVideoIndex ?? 0),
    Math.max(0, playlist.length - 1)
  );
  const currentVideoItem = playlist[currentVideoIdx];

  const handleVideoIndexChange = useCallback(
    (newIndex: number) => {
      handleUpdateConfig((prevConfig) => {
        const activePlaylist =
          prevConfig.videoPlaylist && prevConfig.videoPlaylist.length > 0
            ? prevConfig.videoPlaylist
            : prevConfig.backgroundUrl
            ? [
                {
                  id: 'default-single-vid',
                  title: prevConfig.customMediaName || 'Ambient Video',
                  url: prevConfig.backgroundUrl,
                  poster: prevConfig.backgroundPoster,
                  thumbnail: prevConfig.backgroundPoster,
                  customMediaId: prevConfig.customMediaId,
                  customMediaName: prevConfig.customMediaName,
                  sourceType: prevConfig.customMediaId ? 'local' : 'preset',
                },
              ]
            : [];

        if (newIndex < 0 || newIndex >= activePlaylist.length) {
          return prevConfig;
        }

        const nextItem = activePlaylist[newIndex];
        return {
          ...prevConfig,
          currentVideoIndex: newIndex,
          backgroundUrl: nextItem?.url || prevConfig.backgroundUrl,
          backgroundPoster:
            nextItem?.poster || nextItem?.thumbnail || prevConfig.backgroundPoster,
          customMediaId: nextItem?.customMediaId,
          customMediaName: nextItem?.customMediaName,
        };
      });
    },
    [handleUpdateConfig]
  );

  // Compute greeting
  const getGreeting = () => {
    const hours = currentTime.getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedTime = () => {
    const is24h = config.clockFormat === '24h';
    return currentTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: config.showSeconds ? '2-digit' : undefined,
      hour12: !is24h,
    });
  };

  const formattedDate = () => {
    return currentTime.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Resolve Title display
  const renderTitle = () => {
    if (config.useDynamicGreeting) {
      const greeting = getGreeting();
      const name = config.customGreetingName ? `, ${config.customGreetingName}` : '';
      return `${greeting}${name}`;
    }
    return config.title;
  };

  // Font class mapping
  const getFontClass = () => {
    switch (config.titleFont) {
      case 'display':
        return 'font-extrabold tracking-tight';
      case 'serif':
        return 'font-serif font-bold tracking-normal';
      case 'mono':
        return 'font-mono font-bold tracking-tight';
      case 'cyber':
        return 'font-extrabold tracking-wider uppercase';
      case 'sans':
      default:
        return 'font-bold tracking-tight';
    }
  };

  // Size class mapping
  const getSizeClass = () => {
    switch (config.titleSize) {
      case 'md':
        return 'text-2xl sm:text-3xl md:text-4xl';
      case 'lg':
        return 'text-3xl sm:text-4xl md:text-5xl';
      case '2xl':
        return 'text-4xl sm:text-6xl md:text-7xl';
      case 'xl':
      default:
        return 'text-3xl sm:text-5xl md:text-6xl';
    }
  };

  // Text Shadow class mapping
  const getShadowStyle = () => {
    switch (config.textShadow) {
      case 'glow':
        return {
          textShadow: '0 0 30px rgba(56, 189, 248, 0.4), 0 0 60px rgba(99, 102, 241, 0.25), 0 2px 10px rgba(0,0,0,0.8)',
        };
      case 'subtle':
        return {
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
        };
      case 'cinema':
        return {
          textShadow: '0 4px 20px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.9)',
        };
      case 'none':
      default:
        return {};
    }
  };

  const getAlignmentClass = () => {
    switch (config.textAlignment) {
      case 'left':
        return 'text-left items-start';
      case 'right':
        return 'text-right items-end';
      case 'center':
      default:
        return 'text-center items-center';
    }
  };

  const currentQuote =
    config.customQuoteText ||
    INSPIRATIONAL_QUOTES[quoteIndex % INSPIRATIONAL_QUOTES.length].text;
  const currentAuthor =
    config.customQuoteAuthor ||
    INSPIRATIONAL_QUOTES[quoteIndex % INSPIRATIONAL_QUOTES.length].author;

  // 2.5D Stage parallax transform
  const parallaxIntensity = config.parallaxIntensity ?? 12;
  const fgParallaxX = config.parallaxEnabled ? mousePos.x * (parallaxIntensity * 0.9) : 0;
  const fgParallaxY = config.parallaxEnabled ? mousePos.y * (parallaxIntensity * 0.6) : 0;
  const rotateY = config.parallaxEnabled ? mousePos.x * 2.2 : 0;
  const rotateX = config.parallaxEnabled ? -mousePos.y * 1.8 : 0;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-[calc(100vh-56px)] w-full flex flex-col justify-between overflow-x-hidden text-zinc-100 select-none"
    >
      {/* 1. Full Ambient Video Background with 2.5D Parallax & Cyber Dust */}
      <StartBackground
        config={config}
        mousePos={mousePos}
        onVideoIndexChange={handleVideoIndexChange}
      />

      {/* 2. Top Floating Controls Bar */}
      {!isCleanMode && (
        <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 flex items-center justify-between gap-3 flex-wrap">
          {/* Live Date / Time Badge */}
          {config.showClock && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-950/50 backdrop-blur-xl border border-white/10 text-xs shadow-lg shadow-black/40"
            >
              <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-mono font-bold text-white tracking-wide">
                {formattedTime()}
              </span>
              {config.showDate && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-300 hidden sm:inline text-[11px] font-medium">
                    {formattedDate()}
                  </span>
                </>
              )}
            </motion.div>
          )}

          <div className="flex-1 hidden md:block" />

          {/* Quick Floating Action Tools */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Cyber Dust Motes Quick Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !config.ambientParticles;
                handleUpdateConfig((prev) => ({ ...prev, ambientParticles: next }));
                uiSound.playClick();
              }}
              title={config.ambientParticles ? 'Cyber Dust Motes: Active (Click to toggle)' : 'Cyber Dust Motes: Muted (Click to toggle)'}
              aria-label="Toggle Cyber Dust Particles"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                config.ambientParticles
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/35 shadow-md shadow-amber-500/10'
                  : 'bg-zinc-950/50 text-zinc-400 border-white/10 hover:text-zinc-200'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${config.ambientParticles ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
              <span className="hidden sm:inline">Cyber Dust</span>
            </button>

            {/* 2.5D Mouse Parallax Quick Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !config.parallaxEnabled;
                handleUpdateConfig((prev) => ({ ...prev, parallaxEnabled: next }));
                uiSound.playClick();
              }}
              title={config.parallaxEnabled ? '2.5D Mouse Parallax: Active (Click to toggle)' : '2.5D Mouse Parallax: Muted (Click to toggle)'}
              aria-label="Toggle 2.5D Mouse Parallax"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                config.parallaxEnabled
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/35 shadow-md shadow-sky-500/10'
                  : 'bg-zinc-950/50 text-zinc-400 border-white/10 hover:text-zinc-200'
              }`}
            >
              <Move className={`w-3.5 h-3.5 ${config.parallaxEnabled ? 'text-sky-400' : 'text-zinc-500'}`} />
              <span className="hidden sm:inline">2.5D Parallax</span>
            </button>

            {/* Start Page Customizer Trigger */}
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              title="Customize Title, Subtitle, Effects, Video Playlist & Background"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Customize</span>
            </button>
          </div>
        </header>
      )}

      {/* 3. Center Modern Starter Stage with 2.5D Foreground Parallax */}
      <main
        style={{
          transform: config.parallaxEnabled
            ? `translate3d(${fgParallaxX}px, ${fgParallaxY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
            : undefined,
          transformStyle: 'preserve-3d',
          perspective: 1000,
        }}
        className="relative z-20 flex-1 flex flex-col justify-center items-center w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8 transition-transform duration-100 ease-out will-change-transform"
      >
        {/* Dynamic Title & Subtitle Group */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex flex-col w-full group relative z-10 ${getAlignmentClass()}`}
        >
          {/* Live Headline */}
          <div className="relative inline-flex items-center gap-3">
            <h1
              className={`${getFontClass()} ${getSizeClass()} bg-gradient-to-r ${
                config.titleGradient || 'from-white via-zinc-100 to-zinc-300'
              } bg-clip-text text-transparent leading-tight py-1`}
              style={getShadowStyle()}
            >
              {renderTitle()}
            </h1>

            {/* Quick Inline Edit Hover Button */}
            {!isCleanMode && (
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                title="Edit Title & Subtitle"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-zinc-950/60 backdrop-blur-md border border-white/20 text-zinc-300 hover:text-white hover:bg-sky-500 hover:text-zinc-950 cursor-pointer shadow-lg"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Subtitle / Mission Statement */}
          {config.subtitle && (
            <p
              className="mt-2 text-sm sm:text-base md:text-lg max-w-2xl font-medium leading-relaxed tracking-normal transition-colors"
              style={{
                color: config.subtitleColor || '#e4e4e7',
                textShadow: '0 2px 10px rgba(0,0,0,0.85)',
              }}
            >
              {config.subtitle}
            </p>
          )}
        </motion.div>

        {/* 4. Integrated Search Bar */}
        {config.showSearchBar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-2xl relative z-40"
          >
            <div className="p-1 rounded-2xl bg-zinc-950/60 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/80 hover:border-sky-500/40 transition-all relative z-40">
              <SearchBar
                defaultEngineId={defaultEngineId}
                onEngineChange={onEngineChange}
                bookmarks={bookmarks}
                events={events}
                rssItems={[]}
                searchHistory={searchHistory}
                onAddSearchHistory={onAddSearchHistory}
                onClearSearchHistory={onClearSearchHistory}
                onRemoveSearchHistory={onRemoveSearchHistory}
                compact={false}
              />
            </div>
          </motion.div>
        )}

        {/* 5. Primary App Jump Tiles (Dashboard, Writing Suite) */}
        {config.showAppShortcuts && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-2xl relative z-10"
          >
            {/* Dashboard Tile */}
            <motion.button
              type="button"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                uiSound.playClick();
                onSelectPage('dashboard');
              }}
              className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-950/50 hover:bg-zinc-900/80 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 shadow-xl shadow-black/50 text-left transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Widgets Dashboard
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                  Weather, calendar, bookmarks, RSS & tasks.
                </p>
              </div>
            </motion.button>

            {/* Writing Suite Tile */}
            <motion.button
              type="button"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                uiSound.playClick();
                onSelectPage('writer');
              }}
              className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-950/50 hover:bg-zinc-900/80 backdrop-blur-xl border border-white/10 hover:border-amber-500/50 shadow-xl shadow-black/50 text-left transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                  <PenTool className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Writing Suite
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                  Distraction-free markdown & character wikis.
                </p>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* 6. Quick Launch Pinned Bookmarks Bar */}
        {config.showQuickLinks && config.quickLinks && config.quickLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center flex-wrap gap-2 sm:gap-2.5 max-w-4xl relative z-10"
          >
            {config.quickLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => uiSound.playClick()}
                className="group flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-950/60 hover:bg-zinc-900/90 backdrop-blur-xl border border-white/10 hover:border-sky-400/50 shadow-lg shadow-black/40 text-xs font-semibold text-zinc-200 hover:text-white transition-all duration-200 hover:scale-105"
              >
                {link.icon ? (
                  <img
                    src={link.icon}
                    alt=""
                    className="w-4 h-4 rounded object-contain shrink-0 group-hover:scale-110 transition-transform"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                )}
                <span>{link.title}</span>
              </a>
            ))}

            {!isCleanMode && (
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                title="Add More Quick Links"
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-dashed border-white/20 text-xs font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            )}
          </motion.div>
        )}
      </main>

      {/* 7. Bottom Status & Inspirational Motto */}
      {config.showDailyQuote && (
        <footer className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-8 pb-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-950/40 backdrop-blur-md border border-white/5 text-xs text-zinc-300 shadow-md"
          >
            <Quote className="w-3 h-3 text-sky-400 shrink-0" />
            <span className="italic">"{currentQuote}"</span>
            {currentAuthor && (
              <span className="text-zinc-500 font-medium">— {currentAuthor}</span>
            )}
          </motion.div>
        </footer>
      )}

      {/* 8. Start Page Customizer Modal */}
      <StartCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
};
