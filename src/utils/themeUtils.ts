import type { CSSProperties } from 'react';
import { DashboardTheme } from '../types';

/**
 * Converts a hex color (#RGB, #RRGGBB, or #RRGGBBAA) to rgba format with the given alpha (0 to 1).
 */
export function hexToRgba(hex: string | undefined, alpha: number = 1): string {
  if (!hex) return `rgba(24, 24, 27, ${alpha})`;
  
  let cleanHex = hex.replace('#', '').trim();
  
  // If named color or already rgb/rgba
  if (cleanHex.startsWith('rgb')) {
    return cleanHex;
  }
  
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  
  if (cleanHex.length < 6) {
    return `rgba(24, 24, 27, ${alpha})`;
  }
  
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

/**
 * Returns complete inline CSS styling for a widget window based on active theme customizations.
 */
export function getWidgetWindowStyle(
  theme?: DashboardTheme,
  isCleanMode: boolean = false,
  isEditMode: boolean = false
): CSSProperties {
  const mode = theme?.mode || 'dark';
  
  // 1. Default base color based on mode
  const defaultBaseColor =
    mode === 'oled' ? '#000000' : mode === 'light' ? '#ffffff' : '#18181b';
  const baseColor = theme?.windowColor || defaultBaseColor;
  
  // 2. Window Opacity / Transparency (0 to 100)
  const defaultOpacity = mode === 'oled' ? 85 : mode === 'light' ? 85 : 65;
  const rawOpacity = theme?.windowOpacity !== undefined ? theme.windowOpacity : defaultOpacity;
  const alpha = isEditMode ? Math.min(0.9, (rawOpacity / 100) + 0.15) : rawOpacity / 100;
  
  const backgroundColor = hexToRgba(baseColor, alpha);
  
  // 3. Edge Radius (0 to 40 px)
  const radius = theme?.windowRadius !== undefined ? theme.windowRadius : 16;
  
  // 4. Backdrop Blur (0 to 32 px)
  const blur = theme?.windowBlur !== undefined ? theme.windowBlur : 16;
  const backdropFilter = blur > 0 ? `blur(${blur}px)` : 'none';
  const webkitBackdropFilter = blur > 0 ? `blur(${blur}px)` : 'none';
  
  // 5. Border
  const defaultBorderColor =
    mode === 'oled' ? '#27272a' : mode === 'light' ? '#e4e4e7' : '#3f3f46';
  const borderColorHex = theme?.windowBorderColor || defaultBorderColor;
  const borderOpacity = (theme?.windowBorderOpacity !== undefined ? theme.windowBorderOpacity : (isCleanMode ? 40 : 70)) / 100;
  const borderColor = hexToRgba(borderColorHex, borderOpacity);
  const borderWidth = theme?.windowBorderWidth !== undefined ? theme.windowBorderWidth : 1;
  
  return {
    backgroundColor,
    borderRadius: `${radius}px`,
    backdropFilter,
    WebkitBackdropFilter: webkitBackdropFilter,
    border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
  };
}

/**
 * Returns header background styling that complements the window container.
 */
export function getWidgetHeaderStyle(
  theme?: DashboardTheme,
  isCleanMode: boolean = false
): CSSProperties {
  if (isCleanMode) return {};
  
  const mode = theme?.mode || 'dark';
  const defaultBorderColor =
    mode === 'oled' ? '#27272a' : mode === 'light' ? '#e4e4e7' : '#3f3f46';
  const borderColorHex = theme?.windowBorderColor || defaultBorderColor;
  const borderOpacity = ((theme?.windowBorderOpacity !== undefined ? theme.windowBorderOpacity : 70) * 0.7) / 100;
  const borderColor = hexToRgba(borderColorHex, borderOpacity);
  const borderWidth = theme?.windowBorderWidth !== undefined ? theme.windowBorderWidth : 1;
  
  return {
    borderBottom: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
  };
}
