import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Plus,
  Upload,
  Image as ImageIcon,
  Images,
  Maximize2,
  Minimize2,
  Settings2,
  Trash2,
  Edit2,
  GripVertical,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Layers,
  FolderOpen,
  Info,
} from 'lucide-react';
import { GalleryImage, GallerySettings, WidgetSize } from '../../types';
import { optimizeLocalImage } from '../../utils/imageOptimizer';

interface GalleryWidgetProps {
  size: WidgetSize;
  images: GalleryImage[];
  settings?: Partial<GallerySettings>;
  isCleanMode?: boolean;
  onAddImage: (image: Omit<GalleryImage, 'id' | 'addedAt'>) => void;
  onUpdateImage: (image: GalleryImage) => void;
  onDeleteImage: (id: string) => void;
  onReorderImages: (images: GalleryImage[]) => void;
  onUpdateSettings?: (settings: Partial<GallerySettings>) => void;
}

export const GalleryWidget: React.FC<GalleryWidgetProps> = ({
  size,
  images,
  settings: customSettings,
  isCleanMode = false,
  onAddImage,
  onUpdateImage,
  onDeleteImage,
  onReorderImages,
  onUpdateSettings,
}) => {
  // Merged Settings
  const settings: GallerySettings = useMemo(
    () => ({
      cycleInterval: 6,
      isAutoPlay: true,
      transitionEffect: 'fade',
      fitMode: 'cover',
      showCaptions: true,
      showIndicators: true,
      showControls: true,
      showThumbnailsBar: false,
      ...customSettings,
    }),
    [customSettings]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(settings.isAutoPlay);
  const [cycleProgress, setCycleProgress] = useState(0);

  // Modals & Panels
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState(false);

  // Upload Modal Form
  const [previewUrl, setPreviewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [sourceType, setSourceType] = useState<'local' | 'url'>('local');
  const [urlInput, setUrlInput] = useState('');

  // Editing existing image state
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');

  // Drag and drop reordering inside Manage Modal
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [dragOverImageId, setDragOverImageId] = useState<string | null>(null);

  // Ensure current index is in range
  useEffect(() => {
    if (images.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= images.length) {
      setCurrentIndex(images.length - 1);
    }
  }, [images.length, currentIndex]);

  // Synchronize autoPlay state when prop changes
  useEffect(() => {
    if (typeof settings.isAutoPlay === 'boolean') {
      setIsAutoPlay(settings.isAutoPlay);
      if (!settings.isAutoPlay) {
        setCycleProgress(0);
      }
    }
  }, [settings.isAutoPlay]);

  // Cycling Engine with progress bar
  useEffect(() => {
    if (!isAutoPlay || isHovered || images.length <= 1 || isLightboxOpen) {
      setCycleProgress(0);
      return;
    }

    const intervalMs = Math.max((settings.cycleInterval || 6) * 1000, 2000);
    const tickMs = 50;
    const step = (tickMs / intervalMs) * 100;

    const timer = setInterval(() => {
      setCycleProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % images.length);
          return 0;
        }
        return prev + step;
      });
    }, tickMs);

    return () => clearInterval(timer);
  }, [isAutoPlay, isHovered, images.length, settings.cycleInterval, isLightboxOpen]);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setCycleProgress(0);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setCycleProgress(0);
  };

  const handleSetAutoPlay = (enabled: boolean) => {
    setIsAutoPlay(enabled);
    if (!enabled) {
      setCycleProgress(0);
    }
    onUpdateSettings?.({ isAutoPlay: enabled });
  };

  // Direct File Selection from Local Disk
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          continue;
        }

        const optimized = await optimizeLocalImage(file, 1920, 1080, 0.85);
        // Format friendly default title from file name
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        onAddImage({
          url: optimized.dataUrl,
          title: cleanName,
          caption: `Added from local drive (${Math.round(optimized.size / 1024)} KB)`,
          sourceType: 'local',
        });
      }
      setIsUploadModalOpen(false);
      resetUploadForm();
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to process selected image file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Single file preview in Upload Modal
  const handleSingleFilePreview = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }
    setIsUploading(true);
    setUploadError(null);

    try {
      const optimized = await optimizeLocalImage(file, 1920, 1080, 0.85);
      setPreviewUrl(optimized.dataUrl);
      if (!newTitle) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setNewTitle(cleanName);
      }
      if (!newCaption) {
        setNewCaption(`Local image (${Math.round(optimized.size / 1024)} KB)`);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Could not load local image preview.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveUploadForm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = sourceType === 'local' ? previewUrl : urlInput.trim();
    if (!finalUrl) {
      setUploadError('Please select a local image file or enter an image URL.');
      return;
    }

    onAddImage({
      url: finalUrl,
      title: newTitle.trim() || 'Untitled Photo',
      caption: newCaption.trim() || undefined,
      sourceType,
    });

    setIsUploadModalOpen(false);
    resetUploadForm();
  };

  const resetUploadForm = () => {
    setPreviewUrl('');
    setNewTitle('');
    setNewCaption('');
    setUrlInput('');
    setUploadError(null);
    setSourceType('local');
  };

  // Drag and Drop on Banner Area
  const handleBannerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setDragOverZone(true);
    }
  };

  const handleBannerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverZone(false);
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverZone(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Reorder Handlers in Manage Modal
  const handleImageDragStart = (e: React.DragEvent, id: string) => {
    setDraggedImageId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleImageDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedImageId || draggedImageId === targetId) return;

    const sourceIdx = images.findIndex((img) => img.id === draggedImageId);
    const targetIdx = images.findIndex((img) => img.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const updated = [...images];
    const [moved] = updated.splice(sourceIdx, 1);
    updated.splice(targetIdx, 0, moved);

    onReorderImages(updated);
    setDraggedImageId(null);
    setDragOverImageId(null);
  };

  const handleStartEditImage = (img: GalleryImage) => {
    setEditingImage(img);
    setEditTitle(img.title || '');
    setEditCaption(img.caption || '');
  };

  const handleSaveEditImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    onUpdateImage({
      ...editingImage,
      title: editTitle.trim() || undefined,
      caption: editCaption.trim() || undefined,
    });

    setEditingImage(null);
  };

  const activeImage = images[currentIndex] || null;

  return (
    <div
      className="relative w-full h-full flex flex-col min-h-[180px] select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleBannerDragOver}
      onDragLeave={handleBannerDragLeave}
      onDrop={handleBannerDrop}
    >
      {/* Hidden File Input for Native File System Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      {/* Main Banner Container */}
      <div className="relative flex-1 w-full h-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-inner flex flex-col justify-between">
        {/* Drag & Drop Overlay Indicator */}
        {dragOverZone && (
          <div className="absolute inset-0 z-40 bg-indigo-950/85 backdrop-blur-md border-2 border-dashed border-indigo-400 flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95">
            <Upload className="w-10 h-10 text-indigo-300 animate-bounce mb-2" />
            <h3 className="text-sm font-bold text-white">Drop Images from Local Drive</h3>
            <p className="text-xs text-indigo-200 mt-1">
              Add photos directly into your cycling banner gallery
            </p>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 ? (
          <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center bg-zinc-900/50">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center mb-3 text-indigo-400">
              <Images className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">No Gallery Images Yet</h3>
            <p className="text-xs text-zinc-400 max-w-xs mt-1 mb-4">
              Add your favorite wallpapers, family photos, or artwork individually from your computer.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Select from Local Drive</span>
              </button>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl border border-zinc-700 transition-all cursor-pointer"
              >
                Custom URL / Title
              </button>
            </div>
          </div>
        ) : (
          /* Active Image Presentation */
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Background Image Layer */}
            {activeImage && (
              <div
                key={activeImage.id}
                className={`absolute inset-0 w-full h-full transition-all duration-700 ease-out ${
                  settings.transitionEffect === 'zoom'
                    ? 'scale-100 animate-in zoom-in-105 duration-1000'
                    : settings.transitionEffect === 'slide'
                    ? 'animate-in slide-in-from-right-4 duration-500'
                    : 'animate-in fade-in duration-700'
                }`}
              >
                <img
                  src={activeImage.url}
                  alt={activeImage.title || 'Gallery image'}
                  className={`w-full h-full ${
                    settings.fitMode === 'contain'
                      ? 'object-contain bg-zinc-950/90'
                      : 'object-cover'
                  }`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback on broken image
                    (e.target as HTMLElement).style.opacity = '0.3';
                  }}
                />
              </div>
            )}

            {/* Gradient Overlays for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/50 pointer-events-none" />

            {/* Top Bar Controls & Slide Counter - Hidden in Clean Mode */}
            {!isCleanMode && (
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20">
                {/* Slide Counter & Local Drive Tag */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-zinc-200 border border-white/10 shadow-sm">
                    {currentIndex + 1} / {images.length}
                  </span>

                  {activeImage?.sourceType === 'local' && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 backdrop-blur-md shadow-sm">
                      <FolderOpen className="w-2.5 h-2.5" />
                      <span>Local Drive</span>
                    </span>
                  )}

                  {/* Hover Paused Notice */}
                  {isHovered && isAutoPlay && images.length > 1 && (
                    <span className="text-[10px] text-zinc-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 backdrop-blur-sm">
                      Hover Paused
                    </span>
                  )}
                </div>

                {/* Action Buttons Toolbar */}
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md p-1 rounded-xl border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity">
                  {/* Upload from Local Disk quick button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
                    title="Add images individually from your computer"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="hidden md:inline text-[11px]">Add Image</span>
                  </button>

                  {/* Toggle AutoPlay */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSetAutoPlay(!isAutoPlay);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isAutoPlay
                          ? 'text-emerald-400 hover:bg-white/10'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/10'
                      }`}
                      title={isAutoPlay ? 'Pause Auto-cycle' : 'Start Auto-cycle'}
                    >
                      {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  {/* Manage Gallery Drawer */}
                  <button
                    type="button"
                    onClick={() => setIsManageModalOpen(true)}
                    className="p-1.5 text-zinc-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Manage all gallery images"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>

                  {/* Lightbox / Fullscreen */}
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="p-1.5 text-zinc-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="View fullscreen lightbox"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Gallery Settings */}
                  <button
                    type="button"
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="p-1.5 text-zinc-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Gallery settings & cycle interval"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Arrows - Hidden in Clean Mode */}
            {!isCleanMode && images.length > 1 && settings.showControls && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border border-white/15 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 z-20"
                  title="Previous image (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border border-white/15 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 z-20"
                  title="Next image (Right Arrow)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Bottom Section: Caption Overlay & Indicators */}
            <div className="absolute bottom-0 left-0 right-0 p-3 pt-6 z-20 flex flex-col gap-2">
              {/* Title & Caption */}
              {settings.showCaptions && activeImage && (activeImage.title || activeImage.caption) && (
                <div className="max-w-xl">
                  {activeImage.title && (
                    <h4 className="text-sm font-bold text-white drop-shadow-md truncate">
                      {activeImage.title}
                    </h4>
                  )}
                  {activeImage.caption && (
                    <p className="text-xs text-zinc-300 drop-shadow-md line-clamp-1 mt-0.5 font-normal">
                      {activeImage.caption}
                    </p>
                  )}
                </div>
              )}

              {/* Bottom Row: Cycle Progress Bar & Dot Indicators */}
              <div className="flex items-center justify-between gap-3">
                {/* Pagination Dots */}
                {settings.showIndicators && images.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(idx);
                          setCycleProgress(0);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentIndex
                            ? 'w-6 bg-indigo-400 shadow-sm shadow-indigo-500/50'
                            : 'w-1.5 bg-white/40 hover:bg-white/70'
                        }`}
                        title={img.title || `Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Auto Cycle Interval Progress Bar */}
                {isAutoPlay && images.length > 1 && (
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                      {settings.cycleInterval}s
                    </span>
                    <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-400 transition-all duration-75 ease-linear rounded-full"
                        style={{ width: `${cycleProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optional Mini Thumbnail Strip at Bottom - Hidden in Clean Mode */}
      {!isCleanMode && settings.showThumbnailsBar && images.length > 1 && (
        <div className="flex items-center gap-1.5 pt-2 overflow-x-auto pb-0.5">
          {images.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setCycleProgress(0);
              }}
              className={`relative h-11 w-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'border-indigo-500 ring-2 ring-indigo-500/40 opacity-100 scale-105'
                  : 'border-zinc-700/60 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-11 rounded-lg border border-dashed border-zinc-700 hover:border-indigo-500/60 hover:bg-indigo-500/10 flex items-center justify-center text-zinc-400 hover:text-indigo-300 transition-all shrink-0 cursor-pointer"
            title="Add more images"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: Add Image Modal (Local Drive or URL)
      ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Image to Gallery</h3>
                  <p className="text-xs text-zinc-400">
                    Upload from local drive or add an image URL
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  resetUploadForm();
                }}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveUploadForm} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Source Switcher */}
              <div className="flex rounded-xl bg-zinc-800/80 p-1 border border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => setSourceType('local')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    sourceType === 'local'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>From Local Drive</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('url')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    sourceType === 'url'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>From Image URL</span>
                </button>
              </div>

              {/* Local File Selector Area */}
              {sourceType === 'local' ? (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Choose Local Image File
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      previewUrl
                        ? 'border-indigo-500/60 bg-indigo-950/20'
                        : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/40 hover:bg-zinc-800/60'
                    }`}
                  >
                    {previewUrl ? (
                      <div className="space-y-3">
                        <div className="relative aspect-[16/9] max-h-48 rounded-lg overflow-hidden border border-zinc-700 bg-black/40 mx-auto">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-xs text-indigo-300 font-medium">
                          Click to choose a different local image
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-zinc-200">
                          Click to browse image from computer
                        </span>
                        <span className="text-[11px] text-zinc-500 mt-0.5">
                          Supports PNG, JPG, WebP, GIF, SVG (Auto-compressed)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* URL Input */
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Image Direct URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
                  />
                  {urlInput && (
                    <div className="mt-2 relative aspect-[16/9] max-h-40 rounded-lg overflow-hidden border border-zinc-700 bg-black">
                      <img
                        src={urlInput}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setUploadError('Could not load preview from URL')}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Title & Caption Inputs */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Image Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Sunset in Malibu"
                    className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Caption / Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="e.g. Taken during summer vacation road trip"
                    className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
                  />
                </div>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
                  {uploadError}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    resetUploadForm();
                  }}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (!previewUrl && !urlInput)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  Add Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: Manage Gallery & Reorder Modal
      ========================================================================= */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Manage Gallery Images</h3>
                  <p className="text-xs text-zinc-400">
                    {images.length} image{images.length !== 1 ? 's' : ''} in banner • Drag to
                    reorder
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload More</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {images.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  No images in gallery. Upload some from your local drive!
                </div>
              ) : (
                images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={(e) => handleImageDragStart(e, img.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverImageId(img.id);
                    }}
                    onDragLeave={() => setDragOverImageId(null)}
                    onDrop={(e) => handleImageDrop(e, img.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      dragOverImageId === img.id
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : idx === currentIndex
                        ? 'bg-zinc-800/80 border-indigo-500/40 ring-1 ring-indigo-500/20'
                        : 'bg-zinc-850/50 hover:bg-zinc-800/60 border-zinc-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Drag Handle */}
                      <div className="text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing p-1">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Image Thumbnail */}
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-black border border-zinc-700 shrink-0">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        {idx === currentIndex && (
                          <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-white bg-indigo-600 px-1 rounded">
                              Active
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info & Captions */}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-zinc-200 truncate flex items-center gap-2">
                          <span>{img.title || `Image ${idx + 1}`}</span>
                          {img.sourceType === 'local' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50 font-medium">
                              Local
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {img.caption || 'No caption'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentIndex(idx);
                          setCycleProgress(0);
                        }}
                        className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          idx === currentIndex
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {idx === currentIndex ? 'Current' : 'Show'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEditImage(img)}
                        className="p-1.5 text-zinc-400 hover:text-indigo-300 rounded-lg hover:bg-zinc-700/60 transition-colors cursor-pointer"
                        title="Edit title & caption"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteImage(img.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-zinc-700/60 transition-colors cursor-pointer"
                        title="Delete image from gallery"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/40">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Single Image with Details</span>
              </button>

              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: Edit Title & Caption Modal
      ========================================================================= */}
      {editingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/40">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Edit Image Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingImage(null)}
                className="p-1 text-zinc-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditImage} className="p-5 space-y-3.5">
              <div className="aspect-[16/9] max-h-32 rounded-lg overflow-hidden border border-zinc-700 bg-black">
                <img
                  src={editingImage.url}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Image title..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Image caption or location..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingImage(null)}
                  className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: Gallery Settings Modal
      ========================================================================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
              <div className="flex items-center gap-2.5">
                <Settings2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Gallery Banner Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Cycle Interval Speed */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Cycle Speed / Interval
                </label>
                <select
                  value={settings.cycleInterval}
                  onChange={(e) =>
                    onUpdateSettings?.({ cycleInterval: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value={3}>3 Seconds (Fast)</option>
                  <option value={5}>5 Seconds</option>
                  <option value={6}>6 Seconds (Default)</option>
                  <option value={8}>8 Seconds</option>
                  <option value={12}>12 Seconds</option>
                  <option value={20}>20 Seconds (Relaxed)</option>
                  <option value={30}>30 Seconds</option>
                  <option value={60}>1 Minute</option>
                </select>
              </div>

              {/* Transition Effect */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Slide Transition Effect
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['fade', 'slide', 'zoom'] as const).map((eff) => (
                    <button
                      key={eff}
                      type="button"
                      onClick={() => onUpdateSettings?.({ transitionEffect: eff })}
                      className={`p-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                        settings.transitionEffect === eff
                          ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                      }`}
                    >
                      {eff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Fit Mode */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Image Fit Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings?.({ fitMode: 'cover' })}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      settings.fitMode === 'cover'
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                    }`}
                  >
                    Cover (Fill Banner)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings?.({ fitMode: 'contain' })}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      settings.fitMode === 'contain'
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                    }`}
                  >
                    Contain (Full Image)
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-800">
                {/* Auto Play Toggle */}
                <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer select-none">
                  <span>Auto-cycle images automatically</span>
                  <input
                    type="checkbox"
                    checked={isAutoPlay}
                    onChange={(e) => handleSetAutoPlay(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-zinc-800 border-zinc-700 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                {/* Show Captions */}
                <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                  <span>Display title & caption overlays</span>
                  <input
                    type="checkbox"
                    checked={settings.showCaptions}
                    onChange={(e) =>
                      onUpdateSettings?.({ showCaptions: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 bg-zinc-800 border-zinc-700 focus:ring-indigo-500"
                  />
                </label>

                {/* Show Pagination Indicators */}
                <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                  <span>Display bottom dot indicators</span>
                  <input
                    type="checkbox"
                    checked={settings.showIndicators}
                    onChange={(e) =>
                      onUpdateSettings?.({ showIndicators: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 bg-zinc-800 border-zinc-700 focus:ring-indigo-500"
                  />
                </label>

                {/* Show Thumbnail Strip */}
                <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                  <span>Display bottom thumbnail strip</span>
                  <input
                    type="checkbox"
                    checked={settings.showThumbnailsBar}
                    onChange={(e) =>
                      onUpdateSettings?.({ showThumbnailsBar: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 bg-zinc-800 border-zinc-700 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-800 bg-zinc-950/40">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: Fullscreen Lightbox Modal
      ========================================================================= */}
      {isLightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Lightbox */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 z-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left / Right Nav in Lightbox */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white rounded-full bg-black/60 hover:bg-black/90 border border-white/20 z-50 transition-all hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white rounded-full bg-black/60 hover:bg-black/90 border border-white/20 z-50 transition-all hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Main Fullscreen Image View */}
          <div
            className="relative max-w-5xl max-h-[85vh] p-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage.url}
              alt={activeImage.title || ''}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
            {activeImage.title && (
              <h3 className="text-base font-bold text-white mt-3 text-center">
                {activeImage.title}
              </h3>
            )}
            {activeImage.caption && (
              <p className="text-xs text-zinc-400 text-center mt-0.5">
                {activeImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
