import React, { useState } from 'react';
import {
  GripVertical,
  Maximize2,
  Minimize2,
  Settings,
  X,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Columns,
  Grid,
} from 'lucide-react';
import { WidgetConfig, WidgetSize, DashboardTheme } from '../../types';
import { getWidgetWindowStyle, getWidgetHeaderStyle } from '../../utils/themeUtils';

interface WidgetContainerProps {
  widget: WidgetConfig;
  isEditMode: boolean;
  isCleanMode?: boolean;
  theme?: DashboardTheme;
  onResize: (id: string, size: WidgetSize) => void;
  onRemove: (id: string) => void;
  onOpenSettings?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const SIZE_LABELS: Record<WidgetSize, { label: string; icon: string }> = {
  '1x1': { label: 'Compact (1×1)', icon: 'Square' },
  '2x1': { label: 'Wide (2×1)', icon: 'Columns' },
  '1x2': { label: 'Tall (1×2)', icon: 'Rows' },
  '2x2': { label: 'Large (2×2)', icon: 'Grid' },
  '3x1': { label: 'Banner (3×1)', icon: 'Maximize2' },
  '3x2': { label: 'Wide Large (3×2)', icon: 'Maximize2' },
  'portrait': { label: 'Portrait 720×1080 (2:3)', icon: 'Rows' },
  'poster': { label: 'Large Portrait (2×3)', icon: 'Grid' },
  'shorts': { label: 'YouTube Short (9:16)', icon: 'Smartphone' },
  'full': { label: 'Full Width', icon: 'Maximize2' },
};

// Map size to responsive Tailwind CSS grid classes with strict height boundaries to prevent infinite widget scrolling
export const getGridSpanClass = (size: WidgetSize): string => {
  switch (size) {
    case '1x1':
      return 'col-span-1 row-span-1 h-[270px] min-h-[240px] max-h-[300px]';
    case '2x1':
      return 'col-span-1 md:col-span-2 row-span-1 h-[270px] min-h-[240px] max-h-[300px]';
    case '1x2':
      return 'col-span-1 row-span-2 h-[560px] min-h-[480px] max-h-[620px]';
    case '2x2':
      return 'col-span-1 md:col-span-2 row-span-2 h-[560px] min-h-[480px] max-h-[620px]';
    case '3x1':
      return 'col-span-1 md:col-span-2 lg:col-span-3 row-span-1 h-[270px] min-h-[240px] max-h-[300px]';
    case '3x2':
      return 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2 h-[560px] min-h-[480px] max-h-[620px]';
    case 'portrait':
      // Optimized precisely for 720x1080 (2:3 aspect ratio portrait)
      return 'col-span-1 md:col-span-1 lg:col-span-1 row-span-2 h-[560px] min-h-[500px] max-h-[640px] max-w-full';
    case 'poster':
      // 2 columns wide by 3 rows tall for larger 720x1080 display
      return 'col-span-1 md:col-span-2 lg:col-span-2 row-span-3 h-[740px] min-h-[640px] max-h-[820px]';
    case 'shorts':
      // Optimized for 9:16 vertical YouTube Shorts format
      return 'col-span-1 row-span-2 h-[560px] max-h-[620px] aspect-[9/16] max-w-full justify-self-center';
    case 'full':
      return 'col-span-1 md:col-span-2 lg:col-span-4 row-span-auto min-h-[340px] max-h-[660px] h-[560px]';
    default:
      return 'col-span-1 row-span-1 h-[270px] min-h-[240px] max-h-[300px]';
  }
};

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  isEditMode,
  isCleanMode = false,
  theme,
  onResize,
  onRemove,
  onOpenSettings,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  children,
  icon,
}) => {
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const spanClass = getGridSpanClass(widget.size);
  const containerStyle = getWidgetWindowStyle(theme, isCleanMode, isEditMode);
  const headerStyle = getWidgetHeaderStyle(theme, isCleanMode);

  return (
    <div
      draggable={!isCleanMode && isEditMode}
      onDragStart={(e) => {
        if (isCleanMode || !isEditMode) return;
        e.dataTransfer.setData('application/x-widget-id', widget.id);
        if (onDragStart) onDragStart(e, widget.id);
      }}
      onDragOver={(e) => {
        if (isCleanMode || !isEditMode) return;
        // Only react if dragging a widget in edit mode
        if (
          e.dataTransfer.types.includes('application/x-widget-id') ||
          e.dataTransfer.types.includes('text/plain')
        ) {
          e.preventDefault();
          setIsDragOver(true);
          if (onDragOver) onDragOver(e, widget.id);
        }
      }}
      onDragLeave={() => {
        if (isEditMode) setIsDragOver(false);
      }}
      onDragEnd={(e) => {
        if (isEditMode) {
          setIsDragOver(false);
          if (onDragEnd) onDragEnd(e);
        }
      }}
      onDrop={(e) => {
        if (isCleanMode || !isEditMode) return;
        e.preventDefault();
        setIsDragOver(false);
        if (onDrop) onDrop(e, widget.id);
      }}
      style={containerStyle}
      className={`group relative flex flex-col overflow-hidden transition-all duration-300 ${spanClass} ${
        isDragOver ? 'ring-2 ring-indigo-500 scale-[1.01]' : ''
      } ${
        !isCleanMode && isEditMode
          ? 'ring-1 ring-dashed ring-indigo-500/50 shadow-lg cursor-grab active:cursor-grabbing'
          : 'shadow-xl shadow-black/20'
      }`}
    >
      {/* Widget Header - Hidden in Clean Mode */}
      {!isCleanMode && (
        <div
          style={headerStyle}
          className="flex items-center justify-between px-4 py-3 bg-black/15 shrink-0"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Drag Handle in Edit Mode */}
            {isEditMode && (
              <div className="p-1 text-indigo-400 hover:text-indigo-300 rounded cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
              </div>
            )}
            {icon && <div className="text-indigo-400 shrink-0">{icon}</div>}
            <h2 className="text-sm font-semibold text-zinc-200 truncate">{widget.title}</h2>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1">
            {/* Reorder Buttons in Edit Mode for Mobile Touch */}
            {isEditMode && onMoveUp && (
              <button
                type="button"
                onClick={() => onMoveUp(widget.id)}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                title="Move left/up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}
            {isEditMode && onMoveDown && (
              <button
                type="button"
                onClick={() => onMoveDown(widget.id)}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                title="Move right/down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Size Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800/80 transition-colors"
                title="Change widget size"
              >
                <span className="font-mono text-[11px] font-semibold">{widget.size}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showSizeDropdown && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl backdrop-blur-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Widget Size
                  </div>
                  {(['1x1', '2x1', '1x2', '2x2', '3x1', '3x2', 'portrait', 'poster', 'shorts', 'full'] as WidgetSize[]).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        onResize(widget.id, sz);
                        setShowSizeDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between transition-colors ${
                        widget.size === sz
                          ? 'bg-indigo-600/30 text-indigo-300 font-medium'
                          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <span>{SIZE_LABELS[sz].label}</span>
                      {widget.size === sz && <span className="text-indigo-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Trigger */}
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => onOpenSettings(widget.id)}
                className="p-1 text-zinc-400 hover:text-indigo-300 rounded-lg hover:bg-zinc-800/80 transition-colors"
                title="Widget settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Remove / Hide Widget */}
            <button
              type="button"
              onClick={() => onRemove(widget.id)}
              className="p-1 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-800/80 transition-colors"
              title="Hide widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Widget Content Body - Smooth internal scrollbar container */}
      <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${isCleanMode ? 'p-4' : 'p-4'}`}>
        {children}
      </div>
    </div>
  );
};
