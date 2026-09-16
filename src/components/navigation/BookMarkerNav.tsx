import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  LayoutGrid,
  PenTool,
  Sparkles,
} from 'lucide-react';
import { PageId } from '../../types';

interface BookMarkerNavProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
  isCleanMode?: boolean;
  className?: string;
}

interface NavTabItem {
  id: PageId;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  tabColor: string;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
  activeBg: string;
  shortcut: string;
  shortcutBadge: string;
}

export const BookMarkerNav: React.FC<BookMarkerNavProps> = ({
  activePage,
  onSelectPage,
  isCleanMode = false,
  className = '',
}) => {
  const [hoveredTab, setHoveredTab] = useState<PageId | null>(null);

  const tabs: NavTabItem[] = [
    {
      id: 'start',
      label: 'Start',
      shortLabel: 'Start',
      icon: <Compass className="w-3.5 h-3.5" />,
      tabColor: '#38bdf8', // Sky / Cyan luminous start tab
      borderColor: 'rgba(56, 189, 248, 0.6)',
      glowColor: 'rgba(56, 189, 248, 0.35)',
      bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      activeBg: '#0ea5e9',
      shortcut: 'Alt+1',
      shortcutBadge: '~1',
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      shortLabel: 'Dashboard',
      icon: <LayoutGrid className="w-3.5 h-3.5" />,
      tabColor: '#6366f1', // Indigo / Sapphire binder tab
      borderColor: 'rgba(99, 102, 241, 0.6)',
      glowColor: 'rgba(99, 102, 241, 0.35)',
      bgGradient: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
      activeBg: '#4f46e5',
      shortcut: 'Alt+2',
      shortcutBadge: '~2',
    },
    {
      id: 'writer',
      label: 'Writing Suite',
      shortLabel: 'Writing',
      icon: <PenTool className="w-3.5 h-3.5" />,
      tabColor: '#f59e0b', // Amber / Gold binder tab
      borderColor: 'rgba(245, 158, 11, 0.6)',
      glowColor: 'rgba(245, 158, 11, 0.35)',
      bgGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      activeBg: '#f59e0b',
      shortcut: 'Alt+3',
      shortcutBadge: '~3',
    },
    {
      id: 'space',
      label: 'Space',
      shortLabel: 'Space',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      tabColor: '#a855f7', // Purple creative canvas tab
      borderColor: 'rgba(168, 85, 247, 0.6)',
      glowColor: 'rgba(168, 85, 247, 0.35)',
      bgGradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
      activeBg: '#a855f7',
      shortcut: 'Alt+4',
      shortcutBadge: '~4',
    },
  ];

  // Keyboard shortcut listener for swift page switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing inside an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.altKey && e.key === '1') || (e.key === '1' && e.ctrlKey)) {
        e.preventDefault();
        onSelectPage('start');
      } else if ((e.altKey && e.key === '2') || (e.key === '2' && e.ctrlKey)) {
        e.preventDefault();
        onSelectPage('dashboard');
      } else if ((e.altKey && e.key === '3') || (e.key === '3' && e.ctrlKey)) {
        e.preventDefault();
        onSelectPage('writer');
      } else if ((e.altKey && e.key === '4') || (e.key === '4' && e.ctrlKey)) {
        e.preventDefault();
        onSelectPage('space');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectPage]);

  if (isCleanMode) return null;

  return (
    <nav
      aria-label="Application Page Navigation"
      className={`pointer-events-auto flex items-center gap-1 p-1 bg-zinc-950/70 backdrop-blur-md rounded-full border border-zinc-700/80 shadow-2xl select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activePage === tab.id;
        const isHovered = hoveredTab === tab.id;

        return (
          <motion.button
            key={tab.id}
            type="button"
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            onClick={() => onSelectPage(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 30,
            }}
            style={{
              background: isActive
                ? tab.bgGradient
                : isHovered
                ? 'rgba(39, 39, 42, 0.8)'
                : 'transparent',
              boxShadow: isActive
                ? `0 0 14px -1px ${tab.glowColor}, inset 0 1px 0 rgba(255,255,255,0.25)`
                : 'none',
              borderColor: isActive ? tab.borderColor : isHovered ? '#3f3f46' : 'transparent',
            }}
            className={`group relative flex items-center h-[32px] sm:h-[34px] px-2.5 sm:px-3 rounded-full border text-xs font-semibold cursor-pointer transition-all duration-200 ${
              isActive
                ? 'text-white font-bold'
                : isHovered
                ? 'text-zinc-200'
                : 'text-zinc-400'
            }`}
            title={`${tab.label} (${tab.shortcut})`}
          >
            {/* Color Accent Pip */}
            <div
              className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 transition-transform duration-200 ${
                isActive ? 'scale-125' : 'opacity-60'
              }`}
              style={{
                backgroundColor: tab.tabColor,
                boxShadow: isActive ? `0 0 6px ${tab.tabColor}` : 'none',
              }}
            />

            {/* Icon */}
            <div
              className={`shrink-0 transition-colors duration-200 mr-1.5 ${
                isActive ? 'text-white' : isHovered ? 'text-zinc-200' : 'text-zinc-400'
              }`}
            >
              {tab.icon}
            </div>

            {/* Tab Text Label */}
            <span className="whitespace-nowrap tracking-tight text-[11px] sm:text-xs">
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </span>

            {/* Keyboard Shortcut Indicator */}
            <span
              className={`ml-1.5 text-[9px] font-mono px-1 py-0.2 rounded transition-all duration-200 ${
                isActive
                  ? 'bg-black/30 text-white/90 font-medium'
                  : isHovered
                  ? 'bg-zinc-800 text-zinc-400 opacity-90'
                  : 'text-zinc-500 opacity-60'
              }`}
            >
              {tab.shortcutBadge}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
};
