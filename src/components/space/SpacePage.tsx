import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Palette,
  Layers,
  RotateCcw,
  Eye,
  Edit3,
  Download,
  Share2,
  HelpCircle,
  X,
  Compass,
  Check,
  Sliders,
  Save,
} from 'lucide-react';
import {
  SpaceElement,
  TextBoxElement,
  ImageFrameElement,
  VideoPlayerElement,
  CustomButtonElement,
  SpaceElementType,
  SpaceBackgroundConfig,
  ButtonActionType,
  PageId,
} from '../../types';
import {
  createDefaultTextBox,
  createDefaultImageFrame,
  createDefaultVideoPlayer,
  createDefaultCustomButton,
  getStarterSpaceElements,
  BACKGROUND_TEXTURE_PRESETS,
} from '../../utils/spaceDefaults';
import { storage } from '../../services/storage';
import { uiSound } from '../../services/uiSound';
import { SpaceElementWrapper } from './SpaceElementWrapper';
import { TextBoxElementView } from './elements/TextBoxElementView';
import { ImageFrameElementView } from './elements/ImageFrameElementView';
import { VideoPlayerElementView } from './elements/VideoPlayerElementView';
import { CustomButtonElementView } from './elements/CustomButtonElementView';
import { SpaceDock } from './SpaceDock';
import { SpaceBackgroundModal } from './SpaceBackgroundModal';
import { SpacePropertiesPanel } from './SpacePropertiesPanel';

interface SpacePageProps {
  onNavigate?: (pageId: PageId) => void;
}

export const SpacePage: React.FC<SpacePageProps> = ({ onNavigate }) => {
  // 1. Elements State
  const [elements, setElements] = useState<SpaceElement[]>(() => {
    return storage.getSpaceElements();
  });

  // 2. Background State
  const [backgroundConfig, setBackgroundConfig] = useState<SpaceBackgroundConfig>(() => {
    return storage.getSpaceBackground();
  });

  // 3. Mode State ('design' vs. 'view')
  const [isViewMode, setIsViewMode] = useState<boolean>(() => {
    return storage.getSpaceMode() === 'view';
  });

  // 4. Active selection
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 5. Properties Panel state
  const [isPropertiesOpen, setIsPropertiesOpen] = useState<boolean>(false);

  // 6. Auto-Save Status tracking
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(() => Date.now());

  // 7. Background Modal
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);

  // 8. Action Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Save changes to storage (Continuous auto-save watcher)
  useEffect(() => {
    setSaveStatus('saving');
    const success = storage.saveSpaceElements(elements);
    setSaveStatus(success ? 'saved' : 'error');
    setLastSavedAt(Date.now());
  }, [elements]);

  useEffect(() => {
    storage.saveSpaceBackground(backgroundConfig);
  }, [backgroundConfig]);

  useEffect(() => {
    storage.saveSpaceMode(isViewMode ? 'view' : 'design');
  }, [isViewMode]);

  // When selection changes, if an element is selected and properties was open or user wants it, keep it open
  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  // Keyboard Shortcuts: Delete, Escape, Duplicate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'Escape') {
        setSelectedId(null);
        setIsPropertiesOpen(false);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && !isViewMode) {
          e.preventDefault();
          uiSound.playDelete();
          handleDeleteElement(selectedId);
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        if (selectedId && !isViewMode) {
          e.preventDefault();
          handleDuplicate(selectedId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, isViewMode]);

  // Spawn Element at specific coordinates (or viewport center)
  const handleSpawnElement = useCallback(
    (type: SpaceElementType, clientX?: number, clientY?: number) => {
      let spawnX = 200;
      let spawnY = 150;

      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        if (clientX !== undefined && clientY !== undefined) {
          spawnX = Math.max(20, Math.min(rect.width - 250, clientX - rect.left - 120));
          spawnY = Math.max(20, Math.min(rect.height - 200, clientY - rect.top - 80));
        } else {
          // Viewport center with slight offset
          spawnX = Math.max(40, Math.round(rect.width / 2 - 140 + (Math.random() * 60 - 30)));
          spawnY = Math.max(40, Math.round(rect.height / 2 - 120 + (Math.random() * 60 - 30)));
        }
      }

      let newElement: SpaceElement;
      switch (type) {
        case 'text':
          newElement = createDefaultTextBox(spawnX, spawnY);
          break;
        case 'image':
          newElement = createDefaultImageFrame(spawnX, spawnY);
          break;
        case 'video':
          newElement = createDefaultVideoPlayer(spawnX, spawnY);
          break;
        case 'button':
          newElement = createDefaultCustomButton(spawnX, spawnY);
          break;
      }

      // Max z-index
      const maxZ = elements.reduce((acc, curr) => Math.max(acc, curr.zIndex || 10), 10);
      newElement.zIndex = maxZ + 1;

      setElements((prev) => {
        const next = [...prev, newElement];
        storage.saveSpaceElements(next);
        return next;
      });
      setSelectedId(newElement.id);
      setIsPropertiesOpen(true);
    },
    [elements]
  );

  // Drag-and-Drop from Dock onto Canvas
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/space-element-type') as SpaceElementType;
    if (type) {
      uiSound.playPlace();
      handleSpawnElement(type, e.clientX, e.clientY);
    }
  };

  // Element CRUD operations with immediate auto-save
  const handleUpdateElement = useCallback((id: string, updated: Partial<SpaceElement>) => {
    setSaveStatus('saving');
    setElements((prev) => {
      const next = prev.map((el) =>
        el.id === id ? ({ ...el, ...updated } as SpaceElement) : el
      );
      const success = storage.saveSpaceElements(next);
      setSaveStatus(success ? 'saved' : 'error');
      setLastSavedAt(Date.now());
      return next;
    });
  }, []);

  const handleDeleteElement = useCallback((id: string) => {
    setElements((prev) => {
      const next = prev.filter((el) => el.id !== id);
      storage.saveSpaceElements(next);
      return next;
    });
    setSelectedId(null);
    setIsPropertiesOpen(false);
  }, []);

  const handleDuplicate = useCallback(
    (id: string) => {
      const source = elements.find((el) => el.id === id);
      if (!source) return;

      const duplicate: SpaceElement = {
        ...JSON.parse(JSON.stringify(source)),
        id: `${source.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        x: source.x + 35,
        y: source.y + 35,
        rotation: (source.rotation || 0) + (Math.random() * 4 - 2),
        zIndex: (source.zIndex || 10) + 1,
        createdAt: Date.now(),
      };

      setElements((prev) => {
        const next = [...prev, duplicate];
        storage.saveSpaceElements(next);
        return next;
      });
      setSelectedId(duplicate.id);
      uiSound.playSpawn();
    },
    [elements]
  );

  const handleBringToFront = useCallback((id: string) => {
    setElements((prev) => {
      const maxZ = prev.reduce((acc, curr) => Math.max(acc, curr.zIndex || 10), 10);
      const next = prev.map((el) => (el.id === id ? { ...el, zIndex: maxZ + 1 } : el));
      storage.saveSpaceElements(next);
      return next;
    });
  }, []);

  const handleSendToBack = useCallback((id: string) => {
    setElements((prev) => {
      const minZ = prev.reduce((acc, curr) => Math.min(acc, curr.zIndex || 10), 10);
      const next = prev.map((el) =>
        el.id === id ? { ...el, zIndex: Math.max(1, minZ - 1) } : el
      );
      storage.saveSpaceElements(next);
      return next;
    });
  }, []);

  // Action Button Triggers
  const handleButtonAction = useCallback(
    (actionType: ButtonActionType, payload?: string) => {
      if (actionType === 'cheer') {
        uiSound.playCheer();
        setToastMessage('🎉 Hooray! Creativity unleashed!');
        setTimeout(() => setToastMessage(null), 3000);
      } else if (actionType === 'quote') {
        const quotes = [
          '“Creativity is intelligence having fun.” — Albert Einstein',
          '“Every artist was first an amateur.” — Ralph Waldo Emerson',
          '“Simplicity is the soul of efficiency.” — Austin Freeman',
          '“Make each day your masterpiece.” — John Wooden',
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        uiSound.playCheer();
        setToastMessage(randomQuote);
        setTimeout(() => setToastMessage(null), 4000);
      } else if (actionType === 'page') {
        if (payload && onNavigate) {
          onNavigate(payload as PageId);
        }
      } else if (actionType === 'link') {
        if (payload) {
          window.open(payload, '_blank', 'noopener,noreferrer');
        }
      }
    },
    [onNavigate]
  );

  // Background Styling Resolver
  const getCanvasBackgroundStyle = (): React.CSSProperties => {
    if (backgroundConfig.type === 'texture') {
      const found = BACKGROUND_TEXTURE_PRESETS.find((t) => t.id === backgroundConfig.value);
      return found?.css || BACKGROUND_TEXTURE_PRESETS[0].css;
    }
    if (backgroundConfig.type === 'gradient') {
      return { background: backgroundConfig.value };
    }
    if (backgroundConfig.type === 'solid') {
      return { backgroundColor: backgroundConfig.value };
    }
    if (backgroundConfig.type === 'image') {
      return {
        backgroundImage: `url(${backgroundConfig.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      };
    }
    return {};
  };

  return (
    <div
      ref={canvasRef}
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
      onPointerDown={(e) => {
        // Deselect if clicking canvas directly
        if (e.target === canvasRef.current || (e.target as HTMLElement).id === 'space-backdrop') {
          setSelectedId(null);
        }
      }}
      className="relative w-full h-[calc(100vh-4rem)] overflow-hidden select-none"
      style={getCanvasBackgroundStyle()}
    >
      {/* Dim Overlay & Backdrop Blur */}
      <div
        id="space-backdrop"
        className="absolute inset-0 pointer-events-auto"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${(backgroundConfig.dim ?? 15) / 100})`,
          backdropFilter:
            backgroundConfig.blur && backgroundConfig.blur > 0
              ? `blur(${backgroundConfig.blur}px)`
              : undefined,
        }}
      />

      {/* Optional Dot Grid Overlay for Architectural / Drafting feel */}
      {backgroundConfig.showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      )}

      {/* Top Banner / Canvas Info with Live Auto-Save Status */}
      <div className="absolute top-4 left-6 z-30 flex items-center gap-2 select-none">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-xs text-zinc-200 shadow-xl">
          <span className="font-semibold tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Space Canvas
          </span>
          <span className="text-zinc-500">·</span>
          <span className="text-[11px] text-zinc-400">
            {isViewMode ? 'View Mode' : 'Design Mode'}
          </span>
          {elements.length > 0 && (
            <>
              <span className="text-zinc-500">·</span>
              <span className="text-[11px] text-zinc-400">{elements.length} elements</span>
            </>
          )}
          <span className="text-zinc-500">·</span>

          {/* Real-time Auto-Save Status Indicator */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[11px]"
            title={
              lastSavedAt
                ? `Last saved to local storage at ${new Date(lastSavedAt).toLocaleTimeString()}`
                : 'All changes are auto-saved in real-time'
            }
          >
            {saveStatus === 'saving' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 font-medium text-[10px]">Saving...</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-rose-400 font-medium text-[10px]">Storage limit</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300 font-medium text-[10px]">Auto-saved</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top Right Controls (Properties toggle & View Mode toggle) */}
      <div className="absolute top-4 right-6 z-40 flex items-center gap-2">
        {!isViewMode && (
          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              setIsPropertiesOpen(!isPropertiesOpen);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border shadow-xl flex items-center gap-1.5 cursor-pointer transition-all ${
              isPropertiesOpen
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-600/30'
                : 'bg-black/50 hover:bg-black/70 border-white/10 text-zinc-300 hover:text-white backdrop-blur-md'
            }`}
            title="Toggle Element Properties Inspector"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Properties</span>
            {selectedElement && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        )}

        {/* View Mode Exit Pill Button */}
        {isViewMode && (
          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              setIsViewMode(false);
            }}
            className="px-3.5 py-1.5 rounded-full bg-amber-500/90 hover:bg-amber-400 text-amber-950 text-xs font-bold shadow-xl flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Exit View Mode</span>
          </button>
        )}
      </div>

      {/* Empty Viewport Guide (Clean and inspiring) */}
      {elements.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4 text-center">
          <div className="p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md max-w-md pointer-events-auto shadow-2xl animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mb-1">
              Your Blank Creative Space
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed mb-5">
              An open, flexible canvas for your ideas. Drag or click any element from the bottom
              dock to add it to your viewport. Everything is fully draggable and rotatable.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  uiSound.playSpawn();
                  setElements(getStarterSpaceElements());
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer"
              >
                Load Starter Layout
              </button>
              <button
                type="button"
                onClick={() => handleSpawnElement('text')}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all hover:scale-105 cursor-pointer"
              >
                + Add Text Box
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render All Canvas Elements */}
      {elements.map((element) => {
        const isSelected = selectedId === element.id;

        return (
          <SpaceElementWrapper
            key={element.id}
            element={element}
            isSelected={isSelected}
            isViewMode={isViewMode}
            onSelect={() => setSelectedId(element.id)}
            onUpdate={(updated) => handleUpdateElement(element.id, updated)}
            onDelete={() => handleDeleteElement(element.id)}
            onDuplicate={() => handleDuplicate(element.id)}
            onBringToFront={() => handleBringToFront(element.id)}
            onSendToBack={() => handleSendToBack(element.id)}
            onOpenProperties={() => setIsPropertiesOpen(true)}
          >
            {element.type === 'text' && (
              <TextBoxElementView
                element={element}
                isSelected={isSelected}
                isViewMode={isViewMode}
                onUpdate={(updated) => handleUpdateElement(element.id, updated)}
              />
            )}

            {element.type === 'image' && (
              <ImageFrameElementView
                element={element}
                isSelected={isSelected}
                isViewMode={isViewMode}
                onUpdate={(updated) => handleUpdateElement(element.id, updated)}
              />
            )}

            {element.type === 'video' && (
              <VideoPlayerElementView
                element={element}
                isSelected={isSelected}
                isViewMode={isViewMode}
                onUpdate={(updated) => handleUpdateElement(element.id, updated)}
              />
            )}

            {element.type === 'button' && (
              <CustomButtonElementView
                element={element}
                isSelected={isSelected}
                isViewMode={isViewMode}
                onUpdate={(updated) => handleUpdateElement(element.id, updated)}
                onActionTrigger={handleButtonAction}
              />
            )}
          </SpaceElementWrapper>
        );
      })}

      {/* Floating Bottom Center Dock of Square Icons */}
      <SpaceDock
        onSpawnElement={(type, clientX, clientY) => handleSpawnElement(type, clientX, clientY)}
        onOpenBackgroundCustomizer={() => setIsBgModalOpen(true)}
        isViewMode={isViewMode}
        onToggleViewMode={() => setIsViewMode(!isViewMode)}
        onClearCanvas={() => setElements([])}
        onLoadStarterCanvas={() => setElements(getStarterSpaceElements())}
        elementCount={elements.length}
      />

      {/* Properties Inspector Panel */}
      <SpacePropertiesPanel
        element={selectedElement}
        isOpen={isPropertiesOpen && !isViewMode && !!selectedElement}
        onClose={() => setIsPropertiesOpen(false)}
        onUpdate={handleUpdateElement}
        onDelete={handleDeleteElement}
        onDuplicate={handleDuplicate}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
      />

      {/* Background Customization Modal */}
      <SpaceBackgroundModal
        isOpen={isBgModalOpen}
        onClose={() => setIsBgModalOpen(false)}
        backgroundConfig={backgroundConfig}
        onUpdate={(updated) => setBackgroundConfig((prev) => ({ ...prev, ...updated }))}
      />

      {/* Interactive Action Toast */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-zinc-950/95 border border-indigo-500/40 text-white shadow-2xl text-xs font-semibold backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
