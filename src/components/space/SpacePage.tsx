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
  Film,
  Play,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  Repeat,
  Settings,
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
  SpaceLayout,
  PhotoStyle,
  PhotoAspectRatio,
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
import { mediaStorage } from '../../services/mediaStorage';
import { compressImageFile } from '../../utils/imageCompressor';
import { uiSound } from '../../services/uiSound';
import { SpaceElementWrapper } from './SpaceElementWrapper';
import { TextBoxElementView } from './elements/TextBoxElementView';
import { ImageFrameElementView } from './elements/ImageFrameElementView';
import { VideoPlayerElementView } from './elements/VideoPlayerElementView';
import { CustomButtonElementView } from './elements/CustomButtonElementView';
import { SpaceDock } from './SpaceDock';
import { SpaceBackgroundModal } from './SpaceBackgroundModal';
import { SpacePropertiesPanel } from './SpacePropertiesPanel';
import { SpaceMediaModal } from './SpaceMediaModal';
import { SpaceLayoutModal } from './SpaceLayoutModal';

interface SpacePageProps {
  onNavigate?: (pageId: PageId) => void;
  onOpenSettings?: (initialTab?: 'space-layouts' | 'general' | 'backup' | 'shortcuts') => void;
  dataVersion?: number;
}

export const SpacePage: React.FC<SpacePageProps> = ({ onNavigate, onOpenSettings, dataVersion }) => {
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

  // 7b. Media Manager Modal (Local Video & Web Address)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  // 7c. Presets & Custom Layouts Modal
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

  // 8. Action Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 9. Auto-play media setting
  const [isAutoPlayMedia, setIsAutoPlayMedia] = useState<boolean>(() => {
    return storage.getSpaceAutoplayMedia();
  });

  // 10. Saved Custom Layouts & Cycling
  const [savedLayouts, setSavedLayouts] = useState<SpaceLayout[]>(() => {
    return storage.getSavedSpaceLayouts();
  });
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(() => {
    return storage.getActiveSpaceLayoutId() || (storage.getSavedSpaceLayouts()[0]?.id ?? null);
  });

  const activeLayout = savedLayouts.find((l) => l.id === activeLayoutId) || savedLayouts[0] || null;
  const activeLayoutIndex = savedLayouts.findIndex((l) => l.id === (activeLayout?.id ?? ''));

  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync external state updates (e.g. from Settings & Backup modal or window events)
  useEffect(() => {
    setElements(storage.getSpaceElements());
    setBackgroundConfig(storage.getSpaceBackground());
    setSavedLayouts(storage.getSavedSpaceLayouts());
    setActiveLayoutId(storage.getActiveSpaceLayoutId());
    setIsAutoPlayMedia(storage.getSpaceAutoplayMedia());
  }, [dataVersion]);

  // Real-time layout updates listener (broadcasted whenever layouts are saved/deleted in any modal)
  useEffect(() => {
    const handleLayoutsChanged = () => {
      setSavedLayouts(storage.getSavedSpaceLayouts());
      setActiveLayoutId(storage.getActiveSpaceLayoutId());
    };
    window.addEventListener('space-layouts-updated', handleLayoutsChanged);
    return () => {
      window.removeEventListener('space-layouts-updated', handleLayoutsChanged);
    };
  }, []);

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

  useEffect(() => {
    storage.saveSpaceAutoplayMedia(isAutoPlayMedia);
  }, [isAutoPlayMedia]);

  const handleToggleAutoplayMedia = useCallback(() => {
    uiSound.playClick();
    setIsAutoPlayMedia((prev) => {
      const next = !prev;
      setToastMessage(
        next
          ? 'Auto-play media enabled: Videos will automatically play on the Space canvas'
          : 'Auto-play media disabled: Videos will wait for user interaction'
      );
      return next;
    });
  }, []);

  // Layout Actions: Save, Load, Delete, Cycle
  const handleSaveCurrentLayout = useCallback(
    (name: string, description?: string) => {
      const newLayout: SpaceLayout = {
        id: `layout-custom-${Date.now()}`,
        name,
        description,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        elements: JSON.parse(JSON.stringify(elements)),
        background: { ...backgroundConfig },
        isPreset: false,
      };
      storage.saveSpaceLayout(newLayout);
      const updated = storage.getSavedSpaceLayouts();
      setSavedLayouts(updated);
      setActiveLayoutId(newLayout.id);
      storage.setActiveSpaceLayoutId(newLayout.id);
      setToastMessage(`Custom layout "${name}" with media saved!`);
      setTimeout(() => setToastMessage(null), 3500);
    },
    [elements, backgroundConfig]
  );

  const handleLoadLayout = useCallback((layout: SpaceLayout) => {
    uiSound.playPlace();
    const clonedElements = JSON.parse(JSON.stringify(layout.elements));
    setElements(clonedElements);
    setBackgroundConfig({ ...layout.background });
    storage.saveSpaceElements(clonedElements);
    storage.saveSpaceBackground(layout.background);
    storage.setActiveSpaceLayoutId(layout.id);
    setActiveLayoutId(layout.id);
    setSelectedId(null);
    setToastMessage(`Loaded layout: ${layout.name}`);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleDeleteLayout = useCallback(
    (id: string) => {
      storage.deleteSpaceLayout(id);
      const updated = storage.getSavedSpaceLayouts();
      setSavedLayouts(updated);
      if (activeLayoutId === id) {
        const fallback = updated[0]?.id || null;
        setActiveLayoutId(fallback);
        storage.setActiveSpaceLayoutId(fallback);
      }
      setToastMessage('Layout deleted');
      setTimeout(() => setToastMessage(null), 2500);
    },
    [activeLayoutId]
  );

  const handleCycleLayout = useCallback(
    (direction: 'next' | 'prev' = 'next') => {
      if (savedLayouts.length === 0) return;
      uiSound.playPlace();
      const currentIndex = savedLayouts.findIndex((l) => l.id === activeLayoutId);
      let nextIndex: number;
      if (currentIndex === -1) {
        nextIndex = 0;
      } else if (direction === 'next') {
        nextIndex = (currentIndex + 1) % savedLayouts.length;
      } else {
        nextIndex = (currentIndex - 1 + savedLayouts.length) % savedLayouts.length;
      }

      const nextLayout = savedLayouts[nextIndex];
      if (nextLayout) {
        const clonedElements = JSON.parse(JSON.stringify(nextLayout.elements));
        setElements(clonedElements);
        setBackgroundConfig({ ...nextLayout.background });
        storage.saveSpaceElements(clonedElements);
        storage.saveSpaceBackground(nextLayout.background);
        storage.setActiveSpaceLayoutId(nextLayout.id);
        setActiveLayoutId(nextLayout.id);
        setSelectedId(null);
        setToastMessage(
          `Switched to layout: ${nextLayout.name} (${nextIndex + 1}/${savedLayouts.length})`
        );
        setTimeout(() => setToastMessage(null), 3000);
      }
    },
    [savedLayouts, activeLayoutId]
  );

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
      } else if (e.key.toLowerCase() === 'l') {
        // 'L' or Alt+L cycles to next layout
        if (e.altKey || (!e.ctrlKey && !e.metaKey)) {
          e.preventDefault();
          handleCycleLayout('next');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, isViewMode, handleCycleLayout]);

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

  // Add Media Element from SpaceMediaModal
  const handleAddVideoFromModal = useCallback(
    (videoData: {
      videoUrl: string;
      sourceType: 'youtube' | 'direct';
      title?: string;
      isLocal?: boolean;
      localVideoId?: string;
      localFileName?: string;
      localFileSize?: number;
    }) => {
      let spawnX = 200;
      let spawnY = 150;
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        spawnX = Math.max(40, Math.round(rect.width / 2 - 190 + (Math.random() * 40 - 20)));
        spawnY = Math.max(40, Math.round(rect.height / 2 - 120 + (Math.random() * 40 - 20)));
      }

      const maxZ = elements.reduce((acc, curr) => Math.max(acc, curr.zIndex || 10), 10);
      const newVideo: VideoPlayerElement = {
        id: `video-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'video',
        x: spawnX,
        y: spawnY,
        width: 380,
        height: 240,
        rotation: 0,
        zIndex: maxZ + 1,
        createdAt: Date.now(),
        videoUrl: videoData.videoUrl,
        sourceType: videoData.sourceType,
        title: videoData.title,
        autoplay: true,
        muted: true,
        loop: true,
        isLocal: videoData.isLocal,
        localVideoId: videoData.localVideoId,
        localFileName: videoData.localFileName,
        localFileSize: videoData.localFileSize,
      };

      setElements((prev) => {
        const next = [...prev, newVideo];
        storage.saveSpaceElements(next);
        return next;
      });
      setSelectedId(newVideo.id);
      setIsPropertiesOpen(true);
      uiSound.playSpawn();
    },
    [elements]
  );

  const handleAddImageFromModal = useCallback(
    (imageData: {
      imageUrl: string;
      caption?: string;
      photoStyle: PhotoStyle;
      aspectRatio: PhotoAspectRatio;
    }) => {
      let spawnX = 200;
      let spawnY = 150;
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        spawnX = Math.max(40, Math.round(rect.width / 2 - 140 + (Math.random() * 40 - 20)));
        spawnY = Math.max(40, Math.round(rect.height / 2 - 120 + (Math.random() * 40 - 20)));
      }

      const maxZ = elements.reduce((acc, curr) => Math.max(acc, curr.zIndex || 10), 10);
      const newImage: ImageFrameElement = {
        id: `image-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'image',
        x: spawnX,
        y: spawnY,
        width: 280,
        rotation: Math.round(Math.random() * 6 - 3),
        zIndex: maxZ + 1,
        createdAt: Date.now(),
        imageUrl: imageData.imageUrl,
        caption: imageData.caption,
        tapeStyle: 'dual-corner',
        tapeColor: 'washi-pink',
        photoStyle: imageData.photoStyle,
        aspectRatio: imageData.aspectRatio,
      };

      setElements((prev) => {
        const next = [...prev, newImage];
        storage.saveSpaceElements(next);
        return next;
      });
      setSelectedId(newImage.id);
      setIsPropertiesOpen(true);
      uiSound.playSpawn();
    },
    [elements]
  );

  // Drag-and-Drop from Dock onto Canvas, or file/URL drop from desktop/browser
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    // 1. Drag from Dock buttons
    const type = e.dataTransfer.getData('application/space-element-type') as SpaceElementType;
    if (type) {
      uiSound.playPlace();
      handleSpawnElement(type, e.clientX, e.clientY);
      return;
    }

    // 2. Drag file from desktop (Video or Image)
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      const dropX = rect ? Math.max(20, e.clientX - rect.left - 140) : 200;
      const dropY = rect ? Math.max(20, e.clientY - rect.top - 100) : 150;
      const maxZ = elements.reduce((acc, curr) => Math.max(acc, curr.zIndex || 10), 10);

      // Video File: MP4, WebM, MOV, Ogg
      if (file.type.startsWith('video/')) {
        try {
          uiSound.playPlace();
          const { id, url, size } = await mediaStorage.saveLocalVideo(file);
          const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

          const newVideo: VideoPlayerElement = {
            id: `video-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'video',
            x: dropX,
            y: dropY,
            width: 380,
            height: 240,
            rotation: 0,
            zIndex: maxZ + 1,
            createdAt: Date.now(),
            videoUrl: url,
            sourceType: 'direct',
            title: cleanTitle,
            autoplay: true,
            muted: true,
            loop: true,
            isLocal: true,
            localVideoId: id,
            localFileName: file.name,
            localFileSize: size,
          };

          setElements((prev) => {
            const next = [...prev, newVideo];
            storage.saveSpaceElements(next);
            return next;
          });
          setSelectedId(newVideo.id);
          setIsPropertiesOpen(true);
        } catch (err) {
          console.error('Failed to load dropped video:', err);
        }
        return;
      }

      // Image File: JPG, PNG, WEBP, GIF, SVG
      if (file.type.startsWith('image/')) {
        try {
          uiSound.playPlace();
          const compressed = await compressImageFile(file, 1400, 1400, 0.88);
          const newImg: ImageFrameElement = {
            id: `image-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'image',
            x: dropX,
            y: dropY,
            width: 280,
            rotation: Math.round(Math.random() * 6 - 3),
            zIndex: maxZ + 1,
            createdAt: Date.now(),
            imageUrl: compressed,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            tapeStyle: 'dual-corner',
            tapeColor: 'washi-pink',
            photoStyle: 'media-player',
            aspectRatio: '16:9',
          };
          setElements((prev) => {
            const next = [...prev, newImg];
            storage.saveSpaceElements(next);
            return next;
          });
          setSelectedId(newImg.id);
          setIsPropertiesOpen(true);
        } catch (err) {
          console.error('Failed to load dropped image:', err);
        }
        return;
      }
    }

    // 3. Drag link or direct web address
    const textUrl = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
    if (textUrl && (textUrl.startsWith('http://') || textUrl.startsWith('https://'))) {
      const trimmed = textUrl.trim();
      const rect = canvasRef.current?.getBoundingClientRect();
      const dropX = rect ? Math.max(20, e.clientX - rect.left - 140) : 200;
      const dropY = rect ? Math.max(20, e.clientY - rect.top - 100) : 150;
      const maxZ = elements.reduce((acc, curr) => Math.max(acc, curr.zIndex || 10), 10);

      const isVideo =
        trimmed.includes('youtube.com') ||
        trimmed.includes('youtu.be') ||
        trimmed.endsWith('.mp4') ||
        trimmed.endsWith('.webm') ||
        trimmed.endsWith('.ogg') ||
        trimmed.endsWith('.mov') ||
        trimmed.includes('/video/');

      if (isVideo) {
        uiSound.playPlace();
        const isYt = trimmed.includes('youtube.com') || trimmed.includes('youtu.be');
        const newVideo: VideoPlayerElement = {
          id: `video-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'video',
          x: dropX,
          y: dropY,
          width: 380,
          height: 240,
          rotation: 0,
          zIndex: maxZ + 1,
          createdAt: Date.now(),
          videoUrl: trimmed,
          sourceType: isYt ? 'youtube' : 'direct',
          title: isYt ? 'YouTube Video Stream' : 'Direct Web Video Stream',
          autoplay: true,
          muted: true,
          loop: true,
          isLocal: false,
        };
        setElements((prev) => {
          const next = [...prev, newVideo];
          storage.saveSpaceElements(next);
          return next;
        });
        setSelectedId(newVideo.id);
        setIsPropertiesOpen(true);
        return;
      } else {
        uiSound.playPlace();
        const newImg: ImageFrameElement = {
          id: `image-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'image',
          x: dropX,
          y: dropY,
          width: 280,
          rotation: Math.round(Math.random() * 6 - 3),
          zIndex: maxZ + 1,
          createdAt: Date.now(),
          imageUrl: trimmed,
          caption: 'Web Image',
          tapeStyle: 'dual-corner',
          tapeColor: 'washi-pink',
          photoStyle: 'media-player',
          aspectRatio: '16:9',
        };
        setElements((prev) => {
          const next = [...prev, newImg];
          storage.saveSpaceElements(next);
          return next;
        });
        setSelectedId(newImg.id);
        setIsPropertiesOpen(true);
        return;
      }
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

      {/* Top Banner / Canvas Info with Live Auto-Save Status & Layout Cycler */}
      <div className="absolute top-4 left-6 z-30 flex items-center gap-2.5 select-none flex-wrap">
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

        {/* Quick Presets & Layouts Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-xs shadow-xl">
          <button
            type="button"
            onClick={() => handleCycleLayout('prev')}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Previous layout preset"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              setIsLayoutModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-white/10 text-zinc-200 hover:text-white transition-colors cursor-pointer"
            title="Open Space Presets & Custom Layouts Menu"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-[11px] max-w-[130px] truncate">
              {activeLayout ? activeLayout.name : 'Space Presets'}
            </span>
            <span className="text-[10px] text-zinc-400">
              ({savedLayouts.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCycleLayout('next')}
            className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Next layout preset"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              uiSound.playClick();
              setIsLayoutModalOpen(true);
            }}
            className="ml-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/30 text-[10px] font-semibold transition-colors cursor-pointer"
            title="Save current canvas layout to presets"
          >
            + Save
          </button>
        </div>
      </div>

      {/* Top Right Controls (Properties toggle, Auto-play setting, Settings, & View Mode toggle) */}
      <div className="absolute top-4 right-6 z-40 flex items-center gap-2">
        {/* Presets & Custom Layouts Menu Button */}
        <button
          type="button"
          onClick={() => {
            uiSound.playClick();
            setIsLayoutModalOpen(true);
          }}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-xl flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300 hover:text-amber-200 backdrop-blur-md cursor-pointer transition-all"
          title="Space Presets & Custom Layouts Menu"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Presets ({savedLayouts.length})</span>
        </button>

        {/* Settings, Custom Space Layouts & Backup Trigger */}
        <button
          type="button"
          onClick={() => {
            uiSound.playClick();
            onOpenSettings?.('space-layouts');
          }}
          className="px-3 py-1.5 rounded-xl text-xs font-medium border shadow-xl flex items-center gap-1.5 bg-black/50 hover:bg-black/70 border-white/10 text-zinc-300 hover:text-white backdrop-blur-md cursor-pointer transition-all"
          title="Settings, Custom Space Layouts & Backup"
        >
          <Settings className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Settings</span>
        </button>

        {/* Auto-play Media Setting Button */}
        <button
          type="button"
          onClick={handleToggleAutoplayMedia}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border shadow-xl flex items-center gap-2 cursor-pointer transition-all ${
            isAutoPlayMedia
              ? 'bg-sky-600/30 hover:bg-sky-600/40 border-sky-500/50 text-sky-200 shadow-sky-600/20'
              : 'bg-black/50 hover:bg-black/70 border-white/10 text-zinc-400 hover:text-zinc-200 backdrop-blur-md'
          }`}
          title={
            isAutoPlayMedia
              ? 'Auto-play media elements: Enabled (Click to disable automatic media playback)'
              : 'Auto-play media elements: Disabled (Click to enable automatic media playback)'
          }
        >
          <Film className={`w-3.5 h-3.5 ${isAutoPlayMedia ? 'text-sky-400' : 'text-zinc-400'}`} />
          <span className="hidden sm:inline">Auto-play Media:</span>
          <span className="sm:hidden">Auto-play:</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
              isAutoPlayMedia
                ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {isAutoPlayMedia ? 'ON' : 'OFF'}
          </span>
        </button>

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
                globalAutoplay={isAutoPlayMedia}
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
        onOpenMediaModal={() => setIsMediaModalOpen(true)}
        onOpenLayoutModal={() => setIsLayoutModalOpen(true)}
        onOpenBackgroundCustomizer={() => setIsBgModalOpen(true)}
        isViewMode={isViewMode}
        onToggleViewMode={() => setIsViewMode(!isViewMode)}
        onClearCanvas={() => setElements([])}
        onLoadStarterCanvas={() => setElements(getStarterSpaceElements())}
        elementCount={elements.length}
        isAutoPlayMedia={isAutoPlayMedia}
        onToggleAutoPlayMedia={handleToggleAutoplayMedia}
        onOpenSettings={() => {
          uiSound.playClick();
          onOpenSettings?.('space-layouts');
        }}
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
        globalAutoplay={isAutoPlayMedia}
        onToggleGlobalAutoplay={handleToggleAutoplayMedia}
      />

      {/* Background Customization Modal */}
      <SpaceBackgroundModal
        isOpen={isBgModalOpen}
        onClose={() => setIsBgModalOpen(false)}
        backgroundConfig={backgroundConfig}
        onUpdate={(updated) => setBackgroundConfig((prev) => ({ ...prev, ...updated }))}
      />

      {/* Space Media Modal (Load Local Video, Direct Web Address, or Custom Frame Photo) */}
      <SpaceMediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onAddVideo={handleAddVideoFromModal}
        onAddImage={handleAddImageFromModal}
      />

      {/* Space Custom Layouts & Presets Modal */}
      <SpaceLayoutModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        savedLayouts={savedLayouts}
        activeLayoutId={activeLayoutId}
        currentElements={elements}
        currentBackground={backgroundConfig}
        onSaveLayout={handleSaveCurrentLayout}
        onLoadLayout={handleLoadLayout}
        onDeleteLayout={handleDeleteLayout}
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
