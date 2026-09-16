import React, { useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Film,
  Sparkles,
  Palette,
  Eye,
  Edit3,
  RotateCcw,
  Plus,
  HelpCircle,
} from 'lucide-react';
import { SpaceElementType } from '../../types/space';
import { uiSound } from '../../services/uiSound';

interface SpaceDockProps {
  onSpawnElement: (type: SpaceElementType, clientX?: number, clientY?: number) => void;
  onOpenBackgroundCustomizer: () => void;
  isViewMode: boolean;
  onToggleViewMode: () => void;
  onClearCanvas: () => void;
  onLoadStarterCanvas: () => void;
  elementCount: number;
}

interface DockToolItem {
  type: SpaceElementType;
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  badge: string;
  description: string;
}

const DOCK_ELEMENTS: DockToolItem[] = [
  {
    type: 'text',
    label: 'Text Box',
    icon: Type,
    color: 'text-amber-400 group-hover:text-amber-300 bg-amber-500/10 border-amber-500/30',
    badge: 'Notes',
    description: 'Editable floating note & typography card',
  },
  {
    type: 'image',
    label: 'Image Frame',
    icon: ImageIcon,
    color: 'text-pink-400 group-hover:text-pink-300 bg-pink-500/10 border-pink-500/30',
    badge: 'Photo',
    description: 'Photograph taped to board with washi tape',
  },
  {
    type: 'video',
    label: 'Video Player',
    icon: Film,
    color: 'text-sky-400 group-hover:text-sky-300 bg-sky-500/10 border-sky-500/30',
    badge: 'Media',
    description: 'Floating media player & ambient stream',
  },
  {
    type: 'button',
    label: 'Custom Button',
    icon: Sparkles,
    color: 'text-emerald-400 group-hover:text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    badge: 'Action',
    description: 'Interactive button customizable outside view mode',
  },
];

export const SpaceDock: React.FC<SpaceDockProps> = ({
  onSpawnElement,
  onOpenBackgroundCustomizer,
  isViewMode,
  onToggleViewMode,
  onClearCanvas,
  onLoadStarterCanvas,
  elementCount,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Handle HTML5 Drag Start from Dock
  const handleDragStart = (e: React.DragEvent, type: SpaceElementType) => {
    uiSound.playPickup();
    e.dataTransfer.setData('application/space-element-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <nav
      aria-label="Space canvas tools dock"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-2 rounded-2xl bg-zinc-950/85 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)] select-none transition-all"
    >
      {/* 1. Main Square Floating Element Icons (Drag & Drop or Click to Spawn) */}
      <div className="flex items-center gap-2">
        {DOCK_ELEMENTS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.type} className="relative group">
              <button
                type="button"
                draggable
                onDragStart={(e) => handleDragStart(e, item.type)}
                onClick={() => {
                  uiSound.playSpawn();
                  onSpawnElement(item.type);
                }}
                onMouseEnter={() => setActiveTooltip(item.label)}
                onMouseLeave={() => setActiveTooltip(null)}
                className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 shadow-lg ${item.color}`}
                title={`Click to add or drag into viewport: ${item.label}`}
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="text-[9px] font-semibold tracking-tight mt-0.5 opacity-80">
                  {item.badge}
                </span>
              </button>

              {/* Tooltip */}
              {activeTooltip === item.label && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-[11px] whitespace-nowrap shadow-xl pointer-events-none z-50">
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-[10px] text-zinc-400 font-normal">Click or drag into canvas</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Subtle Vertical Divider */}
      <div className="h-8 w-px bg-white/10 mx-1" />

      {/* 2. Utility & Control Icons */}
      <div className="flex items-center gap-1.5">
        {/* Background Customizer Button */}
        <button
          type="button"
          onClick={() => {
            uiSound.playClick();
            onOpenBackgroundCustomizer();
          }}
          className="w-10 h-10 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-md"
          title="Customize Canvas Background"
        >
          <Palette className="w-4 h-4 text-violet-400" />
        </button>

        {/* View Mode / Design Mode Toggle */}
        <button
          type="button"
          onClick={() => {
            uiSound.playClick();
            onToggleViewMode();
          }}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-md ${
            isViewMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-zinc-900/90 text-zinc-300 border-white/10 hover:bg-zinc-800 hover:text-white'
          }`}
          title={isViewMode ? 'Exit View Mode (Back to Design Mode)' : 'Enter View Mode (Hide controls & activate buttons)'}
        >
          {isViewMode ? (
            <Edit3 className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4 text-sky-400" />
          )}
        </button>

        {/* Canvas Options: Starter / Clear (When has elements or empty) */}
        {elementCount === 0 ? (
          <button
            type="button"
            onClick={() => {
              uiSound.playSpawn();
              onLoadStarterCanvas();
            }}
            className="px-2.5 h-10 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer shadow-md"
            title="Load starter creative layout"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Starter</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              uiSound.playDelete();
              onClearCanvas();
            }}
            className="w-10 h-10 rounded-xl bg-zinc-900/90 hover:bg-red-500/20 text-zinc-400 hover:text-red-300 border border-white/10 flex items-center justify-center transition-all hover:scale-105 cursor-pointer shadow-md"
            title="Clear all canvas elements"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </nav>
  );
};
