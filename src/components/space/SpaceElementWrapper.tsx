import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCw,
  Trash2,
  Copy,
  Layers,
  ArrowUp,
  ArrowDown,
  X,
  Lock,
  Unlock,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { SpaceElement } from '../../types/space';
import { uiSound } from '../../services/uiSound';

interface SpaceElementWrapperProps {
  element: SpaceElement;
  isSelected: boolean;
  isViewMode: boolean;
  onSelect: () => void;
  onUpdate: (updated: Partial<SpaceElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onOpenProperties?: () => void;
  children: React.ReactNode;
}

export const SpaceElementWrapper: React.FC<SpaceElementWrapperProps> = ({
  element,
  isSelected,
  isViewMode,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onOpenProperties,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(element.rotation || 0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef(element.rotation || 0);

  // Sync rotation with props
  useEffect(() => {
    setCurrentRotation(element.rotation || 0);
  }, [element.rotation]);

  // 1. DRAGGING HANDLER
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isViewMode || element.isLocked) {
      if (!isViewMode) onSelect();
      return;
    }

    // Don't drag if user clicked an input, button, or textarea
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.closest('button') ||
      target.closest('.no-drag')
    ) {
      onSelect();
      return;
    }

    e.stopPropagation();
    onSelect();
    uiSound.playPickup();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialElemX = element.x;
    const initialElemY = element.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      onUpdate({
        x: Math.round(initialElemX + dx),
        y: Math.round(initialElemY + dy),
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      uiSound.playPlace();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // 2. ROTATION HANDLER
  const handleRotationPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isViewMode || element.isLocked) return;

    setIsRotating(true);
    uiSound.playPickup();

    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleRotateMove = (moveEvent: PointerEvent) => {
      const rad = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      let deg = Math.round((rad * 180) / Math.PI) + 90;

      // Normalize to -180 .. 180
      while (deg > 180) deg -= 360;
      while (deg < -180) deg += 360;

      // Snap to 15 degrees if Shift key is pressed
      if (moveEvent.shiftKey) {
        deg = Math.round(deg / 15) * 15;
      }

      // Audio tick if angle moved by 10+ degrees
      if (Math.abs(deg - lastAngleRef.current) >= 12) {
        uiSound.playRotate();
        lastAngleRef.current = deg;
      }

      setCurrentRotation(deg);
      onUpdate({ rotation: deg });
    };

    const handleRotateUp = () => {
      setIsRotating(false);
      uiSound.playPlace();
      window.removeEventListener('pointermove', handleRotateMove);
      window.removeEventListener('pointerup', handleRotateUp);
    };

    window.addEventListener('pointermove', handleRotateMove);
    window.addEventListener('pointerup', handleRotateUp);
  };

  // 3. RESIZE HANDLER (Bottom-Right corner)
  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isViewMode || element.isLocked) return;

    setIsResizing(true);
    uiSound.playPickup();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = element.width;
    const initialHeight =
      element.height || (wrapperRef.current ? wrapperRef.current.offsetHeight : 200);

    const handleResizeMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const newWidth = Math.max(160, Math.min(960, Math.round(initialWidth + dx)));
      const newHeight = Math.max(80, Math.min(840, Math.round(initialHeight + dy)));

      onUpdate({
        width: newWidth,
        height: newHeight,
      });
    };

    const handleResizeUp = () => {
      setIsResizing(false);
      uiSound.playPlace();
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', handleResizeUp);
    };

    window.addEventListener('pointermove', handleResizeMove);
    window.addEventListener('pointerup', handleResizeUp);
  };

  return (
    <div
      ref={wrapperRef}
      onPointerDown={handlePointerDown}
      className={`absolute transition-[box-shadow] duration-150 ${
        isViewMode
          ? ''
          : element.isLocked
          ? 'cursor-default'
          : isDragging
          ? 'cursor-grabbing'
          : 'cursor-grab'
      }`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: element.height ? `${element.height}px` : undefined,
        zIndex: element.zIndex || 10,
        transform: `rotate(${currentRotation}deg)`,
        transformOrigin: 'center center',
        opacity: element.opacity !== undefined ? element.opacity : 1,
      }}
    >
      {/* Selection Bounding Ring (Only in Design Mode when Selected) */}
      {isSelected && !isViewMode && (
        <div
          className={`absolute -inset-2.5 rounded-2xl border-2 pointer-events-none transition-colors ${
            element.isLocked
              ? 'border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              : 'border-dashed border-indigo-400/80 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
          } animate-in fade-in duration-100`}
        />
      )}

      {/* Rotation Handle (Knob extending above top center) */}
      {isSelected && !isViewMode && !element.isLocked && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 select-none"
          onPointerDown={handleRotationPointerDown}
        >
          {/* Circular Rotation Knob */}
          <div
            className={`w-7 h-7 rounded-full bg-white text-zinc-900 border-2 border-indigo-600 shadow-xl flex items-center justify-center cursor-crosshair transition-transform ${
              isRotating ? 'scale-125 bg-indigo-50 border-indigo-500' : 'hover:scale-115'
            }`}
            title="Drag to rotate (Hold Shift to snap to 15°)"
          >
            <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
          </div>

          {/* Stem Line connecting knob to element */}
          <div className="w-0.5 h-3 bg-indigo-500/80" />

          {/* Floating Degree Indicator when rotating */}
          {isRotating && (
            <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-zinc-950/95 text-white text-[10px] font-mono border border-indigo-500/40 shadow-xl whitespace-nowrap">
              {currentRotation}°
            </div>
          )}
        </div>
      )}

      {/* Bottom-Right Corner Resize Handle */}
      {isSelected && !isViewMode && !element.isLocked && (
        <div
          className="absolute -bottom-2.5 -right-2.5 w-6 h-6 rounded-full bg-white text-indigo-700 border-2 border-indigo-600 shadow-xl flex items-center justify-center cursor-se-resize z-30 transition-transform hover:scale-125 select-none"
          onPointerDown={handleResizePointerDown}
          title="Drag corner to resize element dimensions"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
          {isResizing && (
            <div className="absolute top-7 right-0 px-2 py-0.5 rounded-md bg-zinc-950/95 text-white text-[10px] font-mono border border-indigo-500/40 shadow-xl whitespace-nowrap">
              {element.width} × {element.height || Math.round(wrapperRef.current?.offsetHeight || 0)}
            </div>
          )}
        </div>
      )}

      {/* Floating Action Menu (Lock, Duplicate, Layering, Angle reset, Properties, Delete) */}
      {isSelected && !isViewMode && (
        <div
          className="absolute -top-12 right-0 flex items-center gap-1 p-1 rounded-xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-md z-30 select-none"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Degree Reset Button */}
          {currentRotation !== 0 && !element.isLocked && (
            <button
              type="button"
              onClick={() => {
                uiSound.playClick();
                setCurrentRotation(0);
                onUpdate({ rotation: 0 });
              }}
              className="px-1.5 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-300 font-mono flex items-center gap-1 cursor-pointer"
              title="Reset angle to 0°"
            >
              <span>{currentRotation}°</span>
              <span className="text-zinc-500">✕</span>
            </button>
          )}

          {/* Lock / Unlock Toggle */}
          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              onUpdate({ isLocked: !element.isLocked });
            }}
            className={`p-1 rounded-lg cursor-pointer transition-colors ${
              element.isLocked
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title={element.isLocked ? 'Unlock element (allow move & rotate)' : 'Lock element in place'}
          >
            {element.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>

          {/* Properties Inspector Button */}
          {onOpenProperties && (
            <button
              type="button"
              onClick={() => {
                uiSound.playClick();
                onOpenProperties();
              }}
              className="p-1 rounded-lg hover:bg-indigo-500/20 text-zinc-400 hover:text-indigo-300 cursor-pointer"
              title="Open Properties Inspector"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Bring to Front */}
          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              onBringToFront();
            }}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            title="Bring to Front"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          {/* Send to Back */}
          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              onSendToBack();
            }}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            title="Send to Back"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              onDuplicate();
            }}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
            title="Duplicate element"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => {
              uiSound.playDelete();
              onDelete();
            }}
            className="p-1 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 cursor-pointer"
            title="Delete element"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Inner Element Content */}
      <div className="w-full h-full relative">{children}</div>
    </div>
  );
};
