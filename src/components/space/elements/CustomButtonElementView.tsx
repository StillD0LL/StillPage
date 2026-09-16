import React, { useState } from 'react';
import {
  Sparkles,
  Rocket,
  Compass,
  ExternalLink,
  Play,
  BookOpen,
  Star,
  Coffee,
  Zap,
  Code,
  Heart,
  Music,
  Settings,
  ArrowRight,
  Smile,
  Check,
} from 'lucide-react';
import {
  CustomButtonElement,
  ButtonActionType,
  ButtonStyleVariant,
} from '../../../types/space';
import { uiSound } from '../../../services/uiSound';

interface CustomButtonElementViewProps {
  element: CustomButtonElement;
  isSelected: boolean;
  isViewMode: boolean;
  onUpdate: (updated: Partial<CustomButtonElement>) => void;
  onActionTrigger: (actionType: ButtonActionType, payload?: string) => void;
}

const AVAILABLE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  Rocket,
  Compass,
  ExternalLink,
  Play,
  BookOpen,
  Star,
  Coffee,
  Zap,
  Code,
  Heart,
  Music,
  ArrowRight,
};

const BUTTON_STYLES: Record<
  ButtonStyleVariant,
  { container: string; text: string; glow: string }
> = {
  gradient: {
    container: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border border-white/20',
    text: 'text-white font-bold',
    glow: '0 8px 24px -4px rgba(168, 85, 247, 0.5), 0 0 0 1px rgba(255,255,255,0.2)',
  },
  neon: {
    container: 'bg-zinc-950 border-2 border-emerald-400',
    text: 'text-emerald-400 font-extrabold tracking-wide',
    glow: '0 0 20px -2px rgba(52, 211, 153, 0.4), inset 0 0 12px rgba(52, 211, 153, 0.15)',
  },
  glass: {
    container: 'bg-white/10 backdrop-blur-xl border border-white/30 hover:bg-white/20',
    text: 'text-white font-semibold',
    glow: '0 8px 25px -4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
  },
  solid: {
    container: 'bg-zinc-900 border border-zinc-700 hover:bg-zinc-800',
    text: 'text-zinc-100 font-bold',
    glow: '0 10px 25px -5px rgba(0,0,0,0.6)',
  },
  pastel: {
    container: 'bg-amber-100 border border-amber-300 hover:bg-amber-200',
    text: 'text-amber-950 font-bold',
    glow: '0 8px 20px -4px rgba(217, 119, 6, 0.25)',
  },
};

export const CustomButtonElementView: React.FC<CustomButtonElementViewProps> = ({
  element,
  isSelected,
  isViewMode,
  onUpdate,
  onActionTrigger,
}) => {
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const styleConfig = BUTTON_STYLES[element.buttonStyle] || BUTTON_STYLES.gradient;
  const IconComponent = AVAILABLE_ICONS[element.icon] || Sparkles;

  const handleClick = (e: React.MouseEvent) => {
    if (isViewMode) {
      e.stopPropagation();
      uiSound.playClick();
      onActionTrigger(element.actionType, element.actionPayload);
    }
  };

  return (
    <div className="relative w-full select-none">
      {/* Physical Action Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`w-full py-3 px-5 rounded-full flex items-center justify-center gap-2.5 transition-all duration-200 ${
          styleConfig.container
        } ${styleConfig.text} ${
          isViewMode
            ? 'cursor-pointer hover:scale-105 active:scale-95'
            : 'cursor-grab active:cursor-grabbing'
        }`}
        style={{
          boxShadow: styleConfig.glow,
        }}
      >
        <IconComponent className="w-5 h-5 shrink-0" />
        <span className="truncate text-sm sm:text-base tracking-tight">{element.label || 'Action Button'}</span>

        {/* Action Type Pip */}
        {element.actionType === 'link' ? (
          <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-0.5 shrink-0" />
        ) : element.actionType === 'page' ? (
          <ArrowRight className="w-3.5 h-3.5 opacity-60 ml-0.5 shrink-0" />
        ) : null}
      </button>

      {/* Customize Trigger Badge in Design Mode */}
      {!isViewMode && isSelected && (
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              setIsInspectorOpen(!isInspectorOpen);
            }}
            className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white text-[11px] font-medium shadow-lg flex items-center gap-1 cursor-pointer"
          >
            <Settings className="w-3 h-3 text-emerald-400" />
            <span>Customize Button</span>
          </button>
        </div>
      )}

      {/* Button Customization Inspector Popover (Outside of view mode) */}
      {isInspectorOpen && !isViewMode && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-10 w-72 p-3.5 rounded-2xl bg-zinc-950/98 border border-zinc-700/80 text-zinc-100 shadow-2xl z-50 text-xs backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-zinc-800 font-semibold text-zinc-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Button Configuration
            </span>
            <button
              type="button"
              onClick={() => setIsInspectorOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Label Input */}
          <div className="mb-2.5">
            <label className="text-[11px] text-zinc-400 block mb-1">Button Label:</label>
            <input
              type="text"
              value={element.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 outline-none focus:border-emerald-500"
              placeholder="e.g. My Website"
            />
          </div>

          {/* Icon Selector */}
          <div className="mb-2.5">
            <label className="text-[11px] text-zinc-400 block mb-1">Select Icon:</label>
            <div className="grid grid-cols-6 gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
              {Object.keys(AVAILABLE_ICONS).map((iconName) => {
                const Icon = AVAILABLE_ICONS[iconName];
                const isActive = element.icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      uiSound.playClick();
                      onUpdate({ icon: iconName });
                    }}
                    className={`p-1.5 rounded flex items-center justify-center cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                    title={iconName}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style Selector */}
          <div className="mb-2.5">
            <label className="text-[11px] text-zinc-400 block mb-1">Visual Theme:</label>
            <div className="grid grid-cols-3 gap-1">
              {(['gradient', 'neon', 'glass', 'solid', 'pastel'] as ButtonStyleVariant[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    uiSound.playClick();
                    onUpdate({ buttonStyle: st });
                  }}
                  className={`py-1 px-1.5 rounded text-[10px] font-semibold capitalize cursor-pointer border ${
                    element.buttonStyle === st
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Action Type Selector */}
          <div className="mb-2.5">
            <label className="text-[11px] text-zinc-400 block mb-1">Click Action:</label>
            <select
              value={element.actionType}
              onChange={(e) => {
                uiSound.playClick();
                const at = e.target.value as ButtonActionType;
                let payload = element.actionPayload;
                if (at === 'link' && !payload?.startsWith('http')) {
                  payload = 'https://github.com';
                } else if (at === 'page' && !['dashboard', 'start', 'writer'].includes(payload || '')) {
                  payload = 'dashboard';
                }
                onUpdate({ actionType: at, actionPayload: payload });
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 outline-none cursor-pointer"
            >
              <option value="link">Open External URL</option>
              <option value="page">Navigate to Page</option>
              <option value="cheer">Sound & Cheer Sparkle</option>
              <option value="quote">Inspirational Quote</option>
            </select>
          </div>

          {/* Action Payload Input */}
          {element.actionType === 'link' && (
            <div className="mb-3">
              <label className="text-[11px] text-zinc-400 block mb-1">Destination URL:</label>
              <input
                type="url"
                value={element.actionPayload || ''}
                onChange={(e) => onUpdate({ actionPayload: e.target.value })}
                placeholder="https://..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {element.actionType === 'page' && (
            <div className="mb-3">
              <label className="text-[11px] text-zinc-400 block mb-1">Target Page:</label>
              <select
                value={element.actionPayload || 'dashboard'}
                onChange={(e) => onUpdate({ actionPayload: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 outline-none cursor-pointer"
              >
                <option value="dashboard">Dashboard</option>
                <option value="start">Start Page</option>
                <option value="writer">Writing Suite</option>
              </select>
            </div>
          )}

          {/* Test Action Trigger */}
          <div className="pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                onActionTrigger(element.actionType, element.actionPayload);
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Test Action</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
