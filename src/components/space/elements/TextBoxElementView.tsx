import React, { useState, useRef, useEffect } from 'react';
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Minus,
  Plus,
} from 'lucide-react';
import {
  TextBoxElement,
  TextNoteTheme,
  TextFontSize,
  TextFontFamily,
  TextAlign,
} from '../../../types/space';
import { uiSound } from '../../../services/uiSound';

interface TextBoxElementViewProps {
  element: TextBoxElement;
  isEditing?: boolean;
  isSelected: boolean;
  isViewMode: boolean;
  onUpdate: (updated: Partial<TextBoxElement>) => void;
}

const THEME_STYLES: Record<
  TextNoteTheme,
  { bg: string; text: string; border: string; placeholder: string; pinColor: string }
> = {
  amber: {
    bg: 'bg-amber-100/95',
    text: 'text-amber-950',
    border: 'border-amber-300/80',
    placeholder: 'placeholder-amber-700/50',
    pinColor: '#d97706',
  },
  lavender: {
    bg: 'bg-purple-100/95',
    text: 'text-purple-950',
    border: 'border-purple-300/80',
    placeholder: 'placeholder-purple-700/50',
    pinColor: '#9333ea',
  },
  mint: {
    bg: 'bg-emerald-100/95',
    text: 'text-emerald-950',
    border: 'border-emerald-300/80',
    placeholder: 'placeholder-emerald-700/50',
    pinColor: '#059669',
  },
  rose: {
    bg: 'bg-rose-100/95',
    text: 'text-rose-950',
    border: 'border-rose-300/80',
    placeholder: 'placeholder-rose-700/50',
    pinColor: '#e11d48',
  },
  dark: {
    bg: 'bg-zinc-900/95',
    text: 'text-zinc-100',
    border: 'border-zinc-700/80',
    placeholder: 'placeholder-zinc-500',
    pinColor: '#6366f1',
  },
  kraft: {
    bg: 'bg-[#e8dcce]/95',
    text: 'text-[#382b20]',
    border: 'border-[#cbb9a3]',
    placeholder: 'placeholder-[#382b20]/50',
    pinColor: '#b45309',
  },
  transparent: {
    bg: 'bg-black/30 backdrop-blur-md',
    text: 'text-white',
    border: 'border-white/20',
    placeholder: 'placeholder-white/50',
    pinColor: '#38bdf8',
  },
};

const FONT_CLASSES: Record<TextFontFamily, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
  handwriting: 'font-serif italic tracking-wide',
};

const SIZE_CLASSES: Record<TextFontSize, string> = {
  sm: 'text-xs leading-relaxed',
  base: 'text-sm leading-relaxed',
  lg: 'text-base leading-relaxed',
  xl: 'text-lg leading-relaxed font-medium',
  '2xl': 'text-xl leading-relaxed font-semibold',
};

const ALIGN_CLASSES: Record<TextAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const TextBoxElementView: React.FC<TextBoxElementViewProps> = ({
  element,
  isSelected,
  isViewMode,
  onUpdate,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const themeStyle = THEME_STYLES[element.theme] || THEME_STYLES.amber;
  const fontClass = FONT_CLASSES[element.fontFamily] || FONT_CLASSES.sans;
  const sizeClass = SIZE_CLASSES[element.fontSize] || SIZE_CLASSES.base;
  const alignClass = ALIGN_CLASSES[element.align] || ALIGN_CLASSES.left;

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      if (scrollH > (element.height || 140)) {
        onUpdate({ height: Math.min(scrollH + 40, 600) });
      }
    }
  }, [element.text, element.fontSize, element.fontFamily]);

  const themes: TextNoteTheme[] = ['amber', 'lavender', 'mint', 'rose', 'dark', 'kraft', 'transparent'];
  const fontFamilies: Array<{ id: TextFontFamily; label: string }> = [
    { id: 'sans', label: 'Sans' },
    { id: 'serif', label: 'Serif' },
    { id: 'mono', label: 'Mono' },
    { id: 'handwriting', label: 'Script' },
  ];

  return (
    <div
      className={`relative w-full h-full flex flex-col rounded-xl border p-4 shadow-xl transition-shadow ${themeStyle.bg} ${themeStyle.text} ${themeStyle.border}`}
      style={{
        boxShadow:
          element.theme === 'dark'
            ? '0 16px 36px -8px rgba(0,0,0,0.7), 0 4px 12px -2px rgba(0,0,0,0.5)'
            : '0 16px 32px -8px rgba(0,0,0,0.25), 0 4px 10px -2px rgba(0,0,0,0.1)',
      }}
    >
      {/* Decorative top tape / pin detail */}
      <div
        className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-8 h-4 rounded-sm opacity-80 shadow-sm pointer-events-none"
        style={{
          backgroundColor: themeStyle.pinColor,
          opacity: 0.75,
        }}
      />

      {/* Text Area / Editable content */}
      <div className="flex-1 w-full relative flex flex-col">
        {isViewMode ? (
          <div
            className={`w-full flex-1 whitespace-pre-wrap select-text break-words ${fontClass} ${sizeClass} ${alignClass}`}
          >
            {element.text || (
              <span className="opacity-40 italic">Empty text note...</span>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={element.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type notes, ideas, or thoughts here..."
            className={`w-full flex-1 resize-none bg-transparent outline-none border-none p-0 ${fontClass} ${sizeClass} ${alignClass} ${themeStyle.placeholder}`}
            rows={4}
          />
        )}
      </div>

      {/* Floating Mini Controls inside the note (Shown when selected in design mode) */}
      {isSelected && !isViewMode && (
        <div
          className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-1.5 text-xs select-none"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Theme Colors Picker */}
          <div className="flex items-center gap-1">
            {themes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  uiSound.playClick();
                  onUpdate({ theme: t });
                }}
                className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                  element.theme === t ? 'scale-125 ring-2 ring-indigo-500' : 'hover:scale-110 opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor:
                    t === 'amber'
                      ? '#fef3c7'
                      : t === 'lavender'
                      ? '#f3e8ff'
                      : t === 'mint'
                      ? '#d1fae5'
                      : t === 'rose'
                      ? '#ffe4e6'
                      : t === 'dark'
                      ? '#27272a'
                      : t === 'kraft'
                      ? '#d5c2ad'
                      : 'rgba(0,0,0,0.4)',
                  borderColor: t === 'dark' ? '#52525b' : '#a1a1aa',
                }}
                title={`Color: ${t}`}
              />
            ))}
          </div>

          {/* Quick Font & Align Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Font family */}
            <select
              value={element.fontFamily}
              onChange={(e) => {
                uiSound.playClick();
                onUpdate({ fontFamily: e.target.value as TextFontFamily });
              }}
              className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[11px] font-medium outline-none cursor-pointer border border-black/10 dark:border-white/10"
            >
              {fontFamilies.map((f) => (
                <option key={f.id} value={f.id} className="bg-zinc-900 text-white">
                  {f.label}
                </option>
              ))}
            </select>

            {/* Alignment */}
            <div className="flex items-center bg-black/10 dark:bg-white/10 rounded p-0.5">
              {(['left', 'center', 'right'] as TextAlign[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    uiSound.playClick();
                    onUpdate({ align: a });
                  }}
                  className={`p-1 rounded cursor-pointer ${
                    element.align === a ? 'bg-black/20 dark:bg-white/20' : 'opacity-50 hover:opacity-100'
                  }`}
                  title={`Align ${a}`}
                >
                  {a === 'left' ? (
                    <AlignLeft className="w-3 h-3" />
                  ) : a === 'center' ? (
                    <AlignCenter className="w-3 h-3" />
                  ) : (
                    <AlignRight className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
