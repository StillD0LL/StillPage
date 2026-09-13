import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Video as VideoIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize,
  Sliders,
  Upload,
  Link,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Check,
  Film,
  Tv,
  Crop,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
  Crosshair,
  SlidersHorizontal,
  Smartphone,
  Square,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  AlertCircle,
  HardDrive,
  RefreshCw,
  Loader2,
  Shuffle,
  Dice5,
} from 'lucide-react';
import { WidgetSize, VideoWidgetSettings, SavedVideoItem } from '../../types';
import { videoStorage } from '../../services/videoStorage';

interface VideoWidgetProps {
  size: WidgetSize;
  settings?: Partial<VideoWidgetSettings>;
  isCleanMode?: boolean;
  onUpdateSettings: (newSettings: Partial<VideoWidgetSettings>) => void;
}

const PRESET_VIDEOS: SavedVideoItem[] = [
  {
    id: 'preset-short-lofi',
    title: 'Rainy Night Street (Short 9:16)',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/shorts/3ZqW9G8F4aM',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    addedAt: Date.now() - 400000,
  },
  {
    id: 'preset-lofi',
    title: 'Lofi Girl - Synthwave & Chill Beats',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    addedAt: Date.now() - 300000,
  },
  {
    id: 'preset-cyberpunk',
    title: 'Cyberpunk City Rain Loop',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/watch?v=BtuT15jYj28',
    thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80',
    addedAt: Date.now() - 200000,
  },
  {
    id: 'preset-nature',
    title: 'Relaxing Nature & Forest River 4K',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/watch?v=eKFTSSKCzWA',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80',
    addedAt: Date.now() - 100000,
  },
];

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const VideoWidget: React.FC<VideoWidgetProps> = ({
  size,
  settings,
  isCleanMode = false,
  onUpdateSettings,
}) => {
  const cfg = settings || {};
  // Extract settings with robust defaults
  const sourceType = cfg.sourceType || 'youtube';
  const youtubeUrl = cfg.youtubeUrl || 'https://www.youtube.com/watch?v=4xDzrJKXOOY';
  const localVideoUrl = cfg.localVideoUrl || '';
  const localMediaId = cfg.localMediaId || '';
  const localVideoName = cfg.localVideoName || '';
  const videoTitle = cfg.videoTitle || 'Ambient Video Stream';
  const autoplay = cfg.autoplay ?? true;
  const muted = cfg.muted ?? true;
  const loop = cfg.loop ?? true;
  const randomPlayOnEnd = cfg.randomPlayOnEnd ?? true;
  const controls = cfg.controls ?? true;
  const fitMode = cfg.fitMode || 'cover';
  const aspectRatio = cfg.aspectRatio || '16:9';
  const savedVideos = cfg.savedVideos || PRESET_VIDEOS;

  // Zoom, Pan & Crop Settings
  const zoom = cfg.zoom ?? (fitMode === 'cover' ? 130 : 100);
  const cropX = cfg.cropX ?? 50;
  const cropY = cfg.cropY ?? 50;
  const rotate = cfg.rotate ?? 0;
  const cropPreset = cfg.cropPreset || 'default';

  // Resolved dynamic playback URL for local video (restored from IndexedDB)
  const [resolvedLocalUrl, setResolvedLocalUrl] = useState<string | null>(null);
  const [isLoadingLocalVideo, setIsLoadingLocalVideo] = useState(false);
  const [isSavingLocalVideo, setIsSavingLocalVideo] = useState(false);
  const [hasLocalVideoError, setHasLocalVideoError] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showCropBar, setShowCropBar] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'source' | 'crop' | 'playback'>('source');
  const [newUrlInput, setNewUrlInput] = useState('');
  const [newTitleInput, setNewTitleInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Live drag-to-pan state
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initCropX: number; initCropY: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onUpdateSettingsRef = useRef(onUpdateSettings);
  onUpdateSettingsRef.current = onUpdateSettings;

  // Load and resolve local video from IndexedDB whenever localMediaId or sourceType changes
  useEffect(() => {
    let isMounted = true;

    async function resolveLocalMedia() {
      if (sourceType !== 'local') {
        if (isMounted) {
          setResolvedLocalUrl(null);
          setHasLocalVideoError(false);
          setIsLoadingLocalVideo(false);
        }
        return;
      }

      setIsLoadingLocalVideo(true);
      setHasLocalVideoError(false);

      // Strategy 1: Load from IndexedDB using localMediaId
      if (localMediaId) {
        try {
          const freshUrl = await videoStorage.getOrCreateVideoUrl(localMediaId);
          if (!isMounted) return;

          if (freshUrl) {
            setResolvedLocalUrl(freshUrl);
            setHasLocalVideoError(false);
            setIsLoadingLocalVideo(false);
            return;
          }
        } catch (err) {
          console.warn('Failed to resolve video by mediaId', err);
        }
      }

      // Strategy 2: Check savedVideos for a matching item with a localMediaId
      const matchingSaved = savedVideos.find(
        (v) => v.sourceType === 'local' && (v.localMediaId || v.id === localMediaId || v.fileName === localVideoName)
      );

      if (matchingSaved?.localMediaId) {
        try {
          const freshUrl = await videoStorage.getOrCreateVideoUrl(matchingSaved.localMediaId);
          if (!isMounted) return;

          if (freshUrl) {
            setResolvedLocalUrl(freshUrl);
            setHasLocalVideoError(false);
            setIsLoadingLocalVideo(false);
            if (localMediaId !== matchingSaved.localMediaId) {
              onUpdateSettingsRef.current({ localMediaId: matchingSaved.localMediaId });
            }
            return;
          }
        } catch (err) {
          console.warn('Failed to resolve matching saved video', err);
        }
      }

      // Strategy 3: Check all stored videos in IndexedDB
      try {
        const allStored = await videoStorage.listAllVideos();
        if (!isMounted) return;

        if (allStored.length > 0) {
          // If we find a video with the same name or take the most recently saved
          const matched = allStored.find((item) => item.name === localVideoName) || allStored[0];
          const freshUrl = await videoStorage.getOrCreateVideoUrl(matched.id);
          if (isMounted && freshUrl) {
            setResolvedLocalUrl(freshUrl);
            setHasLocalVideoError(false);
            setIsLoadingLocalVideo(false);
            if (localMediaId !== matched.id) {
              onUpdateSettingsRef.current({
                localMediaId: matched.id,
                localVideoName: matched.name,
              });
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to scan stored videos in IndexedDB', err);
      }

      // Fallback: If we have an existing URL (e.g., direct web URL or active session)
      if (localVideoUrl && !localVideoUrl.startsWith('blob:')) {
        if (isMounted) {
          setResolvedLocalUrl(localVideoUrl);
          setHasLocalVideoError(false);
          setIsLoadingLocalVideo(false);
        }
        return;
      }

      // If nothing was found or resolved
      if (isMounted) {
        setResolvedLocalUrl(null);
        setHasLocalVideoError(true);
        setIsLoadingLocalVideo(false);
      }
    }

    resolveLocalMedia();

    return () => {
      isMounted = false;
    };
  }, [sourceType, localMediaId, localVideoName]);

  // Helper to extract YouTube video ID from various standard URL schemas (including Shorts)
  const getYouTubeEmbedUrl = (rawUrl: string): string | null => {
    if (!rawUrl) return null;
    let videoId = '';

    try {
      const trimmed = rawUrl.trim();
      if (trimmed.includes('youtube.com/shorts/')) {
        videoId = trimmed.split('youtube.com/shorts/')[1]?.split('?')[0]?.split('&')[0]?.split('/')[0] || '';
      } else if (trimmed.includes('youtu.be/')) {
        videoId = trimmed.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]?.split('/')[0] || '';
      } else if (trimmed.includes('youtube.com/watch')) {
        const urlObj = new URL(trimmed);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (trimmed.includes('youtube.com/embed/')) {
        videoId = trimmed.split('youtube.com/embed/')[1]?.split('?')[0]?.split('&')[0]?.split('/')[0] || '';
      } else if (trimmed.length === 11) {
        videoId = trimmed;
      }
    } catch {
      videoId = '';
    }

    if (!videoId) return null;

    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      mute: isMuted ? '1' : '0',
      loop: randomPlayOnEnd ? '0' : (loop ? '1' : '0'),
      playlist: !randomPlayOnEnd && loop ? videoId : '',
      enablejsapi: '1',
      controls: '0',
      modestbranding: '1',
      rel: '0',
      playsinline: '1',
      showinfo: '0',
      iv_load_policy: '3',
      disablekb: '1',
      fs: '0',
    });

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  };

  // Handle playing a random video from the saved/preset video list to add variety
  const playRandomVideo = useCallback(
    (isAuto = false) => {
      const pool = savedVideos && savedVideos.length > 0 ? savedVideos : PRESET_VIDEOS;
      if (pool.length === 0) return;

      // Exclude currently playing video to ensure fresh variety if more than 1 video is available
      const otherVideos = pool.filter((v) => {
        if (v.sourceType === 'youtube' && sourceType === 'youtube') {
          return v.url !== youtubeUrl;
        }
        if (v.sourceType === 'local' && sourceType === 'local') {
          return (v.localMediaId || v.id) !== localMediaId && v.fileName !== localVideoName;
        }
        return true;
      });

      const candidates = otherVideos.length > 0 ? otherVideos : pool;
      const randomIndex = Math.floor(Math.random() * candidates.length);
      const nextVideo = candidates[randomIndex];
      if (!nextVideo) return;

      handleSelectVideo(nextVideo);
    },
    [savedVideos, sourceType, youtubeUrl, localMediaId, localVideoName]
  );

  // Listen for YouTube iframe player state change messages (State 0 = Ended)
  useEffect(() => {
    if (!randomPlayOnEnd) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }
        if (data && typeof data === 'object') {
          // YouTube State 0 is ENDED (YT.PlayerState.ENDED = 0)
          if (
            (data.event === 'onStateChange' && (data.info === 0 || data.info === '0')) ||
            (data.event === 'infoDelivery' && data.info?.playerState === 0)
          ) {
            playRandomVideo(true);
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [randomPlayOnEnd, playRandomVideo]);

  // Handle local video selection with persistent IndexedDB storage
  const handleLocalVideoUpload = async (file: File) => {
    if (!file || !file.type.startsWith('video/')) return;

    try {
      setIsSavingLocalVideo(true);
      setHasLocalVideoError(false);

      // Save raw video Blob directly into persistent IndexedDB
      const meta = await videoStorage.saveVideo(file);
      const activeUrl = await videoStorage.getOrCreateVideoUrl(meta.id);

      const newSaved: SavedVideoItem = {
        id: meta.id,
        localMediaId: meta.id,
        title: file.name.replace(/\.[^/.]+$/, ''),
        sourceType: 'local',
        url: '', // dynamic resolution via IndexedDB
        fileName: file.name,
        fileSize: file.size,
        addedAt: Date.now(),
      };

      setResolvedLocalUrl(activeUrl);

      onUpdateSettings({
        sourceType: 'local',
        localMediaId: meta.id,
        localVideoUrl: activeUrl || '',
        localVideoName: file.name,
        videoTitle: newSaved.title,
        savedVideos: [newSaved, ...savedVideos.filter((v) => v.id !== newSaved.id && v.localMediaId !== meta.id)],
      });

      setShowSettingsDrawer(false);
    } catch (err) {
      console.error('Failed to save video to persistent storage:', err);
      setHasLocalVideoError(true);
    } finally {
      setIsSavingLocalVideo(false);
    }
  };

  const handleAddYouTubeUrl = () => {
    if (!newUrlInput.trim()) return;

    const newSaved: SavedVideoItem = {
      id: `yt-${Date.now()}`,
      title: newTitleInput.trim() || (newUrlInput.includes('/shorts/') ? 'YouTube Short' : 'YouTube Clip'),
      sourceType: 'youtube',
      url: newUrlInput.trim(),
      addedAt: Date.now(),
    };

    onUpdateSettings({
      sourceType: 'youtube',
      youtubeUrl: newUrlInput.trim(),
      videoTitle: newSaved.title,
      savedVideos: [newSaved, ...savedVideos],
    });

    setNewUrlInput('');
    setNewTitleInput('');
    setShowSettingsDrawer(false);
  };

  const handleSelectVideo = async (video: SavedVideoItem) => {
    if (video.sourceType === 'youtube') {
      onUpdateSettings({
        sourceType: 'youtube',
        youtubeUrl: video.url,
        videoTitle: video.title,
      });
    } else {
      const mediaId = video.localMediaId || video.id;
      setIsLoadingLocalVideo(true);
      try {
        const freshUrl = await videoStorage.getOrCreateVideoUrl(mediaId);
        if (freshUrl) {
          setResolvedLocalUrl(freshUrl);
          setHasLocalVideoError(false);
          onUpdateSettings({
            sourceType: 'local',
            localMediaId: mediaId,
            localVideoUrl: freshUrl,
            localVideoName: video.fileName || video.title,
            videoTitle: video.title,
          });
        } else {
          setHasLocalVideoError(true);
          onUpdateSettings({
            sourceType: 'local',
            localMediaId: mediaId,
            localVideoName: video.fileName || video.title,
            videoTitle: video.title,
          });
        }
      } catch (e) {
        console.warn('Failed to switch video', e);
        setHasLocalVideoError(true);
      } finally {
        setIsLoadingLocalVideo(false);
      }
    }
  };

  const handleDeleteSavedVideo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemToDelete = savedVideos.find((v) => v.id === id);
    if (itemToDelete?.sourceType === 'local') {
      await videoStorage.deleteVideo(itemToDelete.localMediaId || itemToDelete.id);
    }
    onUpdateSettings({
      savedVideos: savedVideos.filter((v) => v.id !== id),
    });
  };

  // Zoom & Crop helper actions
  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.max(50, Math.min(300, Math.round(newZoom)));
    onUpdateSettings({
      zoom: clamped,
      cropPreset: 'custom',
    });
  };

  const handleCropPresetSelect = (preset: 'contain' | 'cover' | '9:16' | '16:9' | '4:3' | '1:1' | '21:9') => {
    switch (preset) {
      case 'contain':
        onUpdateSettings({
          zoom: 100,
          cropX: 50,
          cropY: 50,
          fitMode: 'contain',
          cropPreset: 'contain',
        });
        break;
      case 'cover':
        onUpdateSettings({
          zoom: 130,
          cropX: 50,
          cropY: 50,
          fitMode: 'cover',
          cropPreset: 'cover',
        });
        break;
      case '9:16':
        onUpdateSettings({
          zoom: 178,
          cropX: 50,
          cropY: 50,
          cropPreset: '9:16',
        });
        break;
      case '16:9':
        onUpdateSettings({
          zoom: 100,
          cropX: 50,
          cropY: 50,
          cropPreset: '16:9',
        });
        break;
      case '4:3':
        onUpdateSettings({
          zoom: 133,
          cropX: 50,
          cropY: 50,
          cropPreset: '4:3',
        });
        break;
      case '1:1':
        onUpdateSettings({
          zoom: 178,
          cropX: 50,
          cropY: 50,
          cropPreset: '1:1',
        });
        break;
      case '21:9':
        onUpdateSettings({
          zoom: 135,
          cropX: 50,
          cropY: 50,
          cropPreset: '21:9',
        });
        break;
    }
  };

  const handleResetCropAndZoom = () => {
    onUpdateSettings({
      zoom: 100,
      cropX: 50,
      cropY: 50,
      rotate: 0,
      fitMode: 'contain',
      cropPreset: 'default',
    });
  };

  const handlePanStep = (dx: number, dy: number) => {
    const nextX = Math.max(0, Math.min(100, cropX + dx));
    const nextY = Math.max(0, Math.min(100, cropY + dy));
    onUpdateSettings({
      cropX: nextX,
      cropY: nextY,
      cropPreset: 'custom',
    });
  };

  const handleRotateStep = () => {
    const nextRotate = (rotate + 90) % 360;
    onUpdateSettings({ rotate: nextRotate });
  };

  // Interactive Pan on Video Shield
  const handleMouseDownOnShield = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    if (!showCropBar && zoom <= 100) return;

    setIsDraggingPan(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initCropX: cropX,
      initCropY: cropY,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingPan || !dragStartRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      // Sensitivity adjusted by zoom factor
      const zoomFactor = Math.max(1, zoom / 100);
      const percentX = (deltaX / rect.width) * 100 * (1 / zoomFactor);
      const percentY = (deltaY / rect.height) * 100 * (1 / zoomFactor);

      // Inverted so dragging content left pans viewport right
      const newCropX = Math.max(0, Math.min(100, Math.round(dragStartRef.current.initCropX - percentX)));
      const newCropY = Math.max(0, Math.min(100, Math.round(dragStartRef.current.initCropY - percentY)));

      onUpdateSettings({
        cropX: newCropX,
        cropY: newCropY,
        cropPreset: 'custom',
      });
    },
    [isDraggingPan, zoom, onUpdateSettings]
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingPan) {
      setIsDraggingPan(false);
      dragStartRef.current = null;
    }
  }, [isDraggingPan]);

  useEffect(() => {
    if (isDraggingPan) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPan, handleMouseMove, handleMouseUp]);

  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);

  // Compute CSS Transform values for video scale, origin and rotation
  const effectiveScale = zoom / 100;
  const transformStyle: React.CSSProperties = {
    transform: `scale(${effectiveScale}) rotate(${rotate}deg)`,
    transformOrigin: `${cropX}% ${cropY}%`,
    transition: isDraggingPan ? 'none' : 'transform 0.15s ease-out',
  };

  const activeLocalVideoSource = resolvedLocalUrl || (localVideoUrl && !localVideoUrl.startsWith('blob:') ? localVideoUrl : null);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex flex-col rounded-2xl overflow-hidden bg-zinc-950 group select-none"
    >
      {/* Hidden file input for quick video attachment */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleLocalVideoUpload(file);
        }}
        className="hidden"
      />

      {/* Video Display Area */}
      <div
        className={`relative flex-1 w-full h-full min-h-[160px] bg-black overflow-hidden flex items-center justify-center ${
          size === 'shorts' ? 'aspect-[9/16]' : ''
        }`}
      >
        {/* Loading Spinner for Local IndexedDB retrieval or caching */}
        {(isLoadingLocalVideo || isSavingLocalVideo) && (
          <div className="absolute inset-0 z-25 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-zinc-300">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <span className="text-xs font-medium">
              {isSavingLocalVideo ? 'Storing video in offline vault...' : 'Restoring video stream...'}
            </span>
          </div>
        )}

        {sourceType === 'youtube' && embedUrl ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={videoTitle}
              style={transformStyle}
              onLoad={() => {
                try {
                  iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*');
                } catch {
                  // ignore
                }
              }}
              className={`w-full h-full border-0 absolute inset-0 pointer-events-none select-none ${
                size === 'shorts' ? 'scale-[1.02]' : ''
              }`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            {/* Transparent hover & click shield with optional pan-drag support */}
            <div
              onMouseDown={handleMouseDownOnShield}
              className={`absolute inset-0 z-10 select-none bg-transparent ${
                showCropBar || zoom > 100
                  ? isDraggingPan
                    ? 'cursor-grabbing'
                    : 'cursor-grab'
                  : 'cursor-default'
              }`}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        ) : sourceType === 'local' && activeLocalVideoSource && !hasLocalVideoError ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
            <video
              ref={videoRef}
              src={activeLocalVideoSource}
              autoPlay={autoplay}
              muted={isMuted}
              loop={randomPlayOnEnd ? false : loop}
              playsInline
              style={transformStyle}
              onLoadedData={() => setHasLocalVideoError(false)}
              onEnded={() => {
                if (randomPlayOnEnd) {
                  playRandomVideo(true);
                }
              }}
              onError={() => {
                console.warn('Video failed to render source:', activeLocalVideoSource);
                setHasLocalVideoError(true);
              }}
              className={`w-full h-full pointer-events-none select-none ${
                fitMode === 'cover' && zoom === 100 ? 'object-cover' : 'object-contain'
              }`}
            />
            {/* Transparent hover shield with pan drag */}
            <div
              onMouseDown={handleMouseDownOnShield}
              className={`absolute inset-0 z-10 select-none bg-transparent ${
                showCropBar || zoom > 100
                  ? isDraggingPan
                    ? 'cursor-grabbing'
                    : 'cursor-grab'
                  : 'cursor-default'
              }`}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        ) : sourceType === 'local' && hasLocalVideoError ? (
          /* Local Video Session Expired / Needs Re-attachment State */
          <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full bg-zinc-950/95 border border-zinc-800">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-zinc-200">Local Video Needs Re-attachment</h4>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-xs leading-relaxed">
              Browser session blobs expire when refreshed. Re-select your MP4 video file to store it permanently in offline storage.
            </p>
            <div className="flex items-center gap-2 mt-3.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Re-select MP4 File</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ sourceType: 'youtube' })}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Switch to YouTube
              </button>
            </div>
          </div>
        ) : (
          /* Empty / Initial Upload State */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleLocalVideoUpload(file);
            }}
            className={`flex flex-col items-center justify-center p-6 text-center w-full h-full transition-colors cursor-pointer ${
              isDragOver ? 'bg-indigo-600/20' : 'bg-zinc-900/60'
            }`}
            onClick={() => setShowSettingsDrawer(true)}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-2">
              <VideoIcon className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-zinc-200">No Video Configured</h4>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-xs">
              Click to load a local MP4 file or paste a YouTube / YouTube Short link.
            </p>
          </div>
        )}

        {/* Live Pan / Crop Crosshair Indicator while Dragging or Framing */}
        {(isDraggingPan || (showCropBar && zoom > 100)) && (
          <div className="absolute inset-0 z-20 pointer-events-none border border-indigo-500/30 flex items-center justify-center animate-in fade-in duration-100">
            {/* Center Framing Reticle */}
            <div className="w-6 h-6 rounded-full border border-dashed border-indigo-400/60 flex items-center justify-center bg-black/30 backdrop-blur-xs">
              <Crosshair className="w-3 h-3 text-indigo-300" />
            </div>
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur text-[10px] font-mono text-indigo-300 border border-indigo-500/30">
              Crop Pan: {cropX}%, {cropY}% (Zoom: {zoom}%)
            </div>
          </div>
        )}

        {/* Floating Top-Right Quick Action Toolbar - Hidden in Clean Mode */}
        {!isCleanMode && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-30">
            {/* Randomize Video / Variety Button */}
            <button
              type="button"
              onClick={() => playRandomVideo(false)}
              className="p-1.5 rounded-lg bg-black/80 hover:bg-indigo-600 text-zinc-300 hover:text-white backdrop-blur border border-white/10 transition-colors cursor-pointer shadow-md"
              title="Play a random video from the list now (Variety Shuffle)"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            {/* Zoom & Crop Live Overlay Toggle */}
            <button
              type="button"
              onClick={() => setShowCropBar(!showCropBar)}
              className={`p-1.5 rounded-lg backdrop-blur border transition-all cursor-pointer shadow-md flex items-center gap-1 text-xs font-semibold ${
                showCropBar || zoom !== 100 || cropX !== 50 || cropY !== 50 || rotate !== 0
                  ? 'bg-indigo-600/90 hover:bg-indigo-500 text-white border-indigo-400/50 ring-1 ring-indigo-400/30'
                  : 'bg-black/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border-white/10'
              }`}
              title="Zoom & Crop Framing Controls"
            >
              <Crop className="w-3.5 h-3.5" />
              {zoom !== 100 && <span className="text-[10px] font-mono pr-0.5">{zoom}%</span>}
            </button>

            {/* Full Settings Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="p-1.5 rounded-lg bg-black/80 hover:bg-zinc-800 text-zinc-300 hover:text-white backdrop-blur border border-white/10 transition-colors cursor-pointer shadow-md"
              title="Video Settings & Sources"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating On-Screen Live Zoom & Crop Control Bar */}
        {!isCleanMode && showCropBar && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 p-2.5 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 shadow-2xl animate-in slide-in-from-bottom-2 fade-in duration-150 space-y-2">
            {/* Top row: Zoom slider, Zoom Out, Zoom Level, Zoom In, Presets & Close */}
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                  <Crop className="w-3 h-3" />
                  <span>Zoom / Crop</span>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-200 font-mono text-[10px]">
                  {zoom}%
                </span>
              </div>

              {/* Zoom Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoom - 15)}
                  disabled={zoom <= 50}
                  className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>

                <input
                  type="range"
                  min="50"
                  max="300"
                  step="5"
                  value={zoom}
                  onChange={(e) => handleZoomChange(Number(e.target.value))}
                  className="w-20 sm:w-28 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  title="Zoom Scale"
                />

                <button
                  type="button"
                  onClick={() => handleZoomChange(zoom + 15)}
                  disabled={zoom >= 300}
                  className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>

              {/* Rotation & Reset */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleRotateStep}
                  className="p-1 px-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  title={`Rotate video orientation (current: ${rotate}°)`}
                >
                  <RotateCw className="w-3 h-3" />
                  <span>{rotate}°</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetCropAndZoom}
                  className="p-1 px-1.5 rounded-md bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-300 text-zinc-400 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset Zoom & Crop"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCropBar(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 text-[10px] transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Bottom Row: Quick Crop Aspect Presets & Directional Pan Anchors */}
            <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-zinc-800 flex-wrap text-[10px]">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-zinc-500 text-[9px] uppercase font-bold pr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleCropPresetSelect('contain')}
                  className={`px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                    zoom === 100 && cropPreset === 'contain'
                      ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300 font-bold'
                      : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Fit 100%
                </button>
                <button
                  type="button"
                  onClick={() => handleCropPresetSelect('cover')}
                  className={`px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                    zoom === 130 && cropPreset === 'cover'
                      ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300 font-bold'
                      : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Fill Frame
                </button>
                <button
                  type="button"
                  onClick={() => handleCropPresetSelect('9:16')}
                  className={`px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                    cropPreset === '9:16'
                      ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300 font-bold'
                      : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  9:16 Shorts
                </button>
                <button
                  type="button"
                  onClick={() => handleCropPresetSelect('4:3')}
                  className={`px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                    cropPreset === '4:3'
                      ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300 font-bold'
                      : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  4:3 TV
                </button>
                <button
                  type="button"
                  onClick={() => handleCropPresetSelect('21:9')}
                  className={`px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                    cropPreset === '21:9'
                      ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300 font-bold'
                      : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  21:9 Cinema
                </button>
              </div>

              {/* Pan Arrows */}
              <div className="flex items-center gap-1">
                <span className="text-zinc-500 text-[9px] uppercase font-bold">Pan:</span>
                <button
                  type="button"
                  onClick={() => handlePanStep(-10, 0)}
                  className="p-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                  title="Pan Left"
                >
                  <ChevronLeft className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePanStep(0, -10)}
                  className="p-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                  title="Pan Up"
                >
                  <ChevronUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePanStep(0, 10)}
                  className="p-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                  title="Pan Down"
                >
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePanStep(10, 0)}
                  className="p-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                  title="Pan Right"
                >
                  <ChevronRight className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ cropX: 50, cropY: 50 })}
                  className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                  title="Center Pan"
                >
                  Center
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings & Video Source Drawer */}
      {showSettingsDrawer && (
        <div className="absolute inset-0 z-40 bg-zinc-900/98 backdrop-blur-md p-4 overflow-y-auto flex flex-col justify-between text-xs animate-in fade-in duration-150">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">Video Settings & Customization</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {/* Sub Tabs: Source vs Zoom/Crop vs Playback */}
            <div className="flex items-center gap-1 border-b border-zinc-800/80 -mt-2 pb-1">
              <button
                type="button"
                onClick={() => setActiveSettingsTab('source')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeSettingsTab === 'source'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Source & Library
              </button>
              <button
                type="button"
                onClick={() => setActiveSettingsTab('crop')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSettingsTab === 'crop'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Crop className="w-3.5 h-3.5" />
                <span>Zoom & Crop Framing</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSettingsTab('playback')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeSettingsTab === 'playback'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Playback
              </button>
            </div>

            {/* TAB 1: Video Source & Library */}
            {activeSettingsTab === 'source' && (
              <div className="space-y-4 animate-in fade-in duration-100">
                {/* Source Type Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ sourceType: 'youtube' })}
                    className={`flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                      sourceType === 'youtube'
                        ? 'bg-red-500/20 border-red-500/50 text-red-300'
                        : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>YouTube Link</span>
                  </button>

                  <label
                    className={`flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                      sourceType === 'local'
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Local MP4 (Offline)</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLocalVideoUpload(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* YouTube Link Input Form */}
                {sourceType === 'youtube' && (
                  <div className="space-y-2 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                    <span className="font-bold text-zinc-300 block text-[11px]">Add YouTube Video URL</span>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={newUrlInput}
                      onChange={(e) => setNewUrlInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Video Title (Optional)"
                        value={newTitleInput}
                        onChange={(e) => setNewTitleInput(e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddYouTubeUrl}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs cursor-pointer"
                      >
                        Load Video
                      </button>
                    </div>
                  </div>
                )}

                {/* Local Video Offline Storage Status Info */}
                {sourceType === 'local' && (
                  <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-800/40 flex items-start gap-2.5">
                    <HardDrive className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-indigo-200">
                        {localVideoName || 'Local Video Stream'}
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Saved in IndexedDB storage. Video persists across page refreshes and browser reloads without expiring.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 text-[10px] font-semibold text-indigo-300 hover:text-white underline cursor-pointer"
                      >
                        Replace with different video file
                      </button>
                    </div>
                  </div>
                )}

                {/* Saved Clips / Presets Library */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] block">
                      Saved Video Library & Presets ({savedVideos.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => playRandomVideo(false)}
                      className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition-colors"
                      title="Play a random video from the list now"
                    >
                      <Shuffle className="w-3 h-3" />
                      <span>Shuffle Random Video</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {savedVideos.map((v) => {
                      const isCurrent =
                        (v.sourceType === 'youtube' && sourceType === 'youtube' && v.url === youtubeUrl) ||
                        (v.sourceType === 'local' &&
                          sourceType === 'local' &&
                          (v.localMediaId === localMediaId || v.fileName === localVideoName));
                      return (
                        <div
                          key={v.id}
                          onClick={() => handleSelectVideo(v)}
                          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                            isCurrent
                              ? 'bg-indigo-600/20 border-indigo-500/60 text-white'
                              : 'bg-zinc-800/40 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {v.sourceType === 'youtube' ? (
                              <Film className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            ) : (
                              <HardDrive className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className="text-xs truncate font-medium block">{v.title}</span>
                              {v.sourceType === 'local' && (
                                <span className="text-[9px] text-zinc-500 flex items-center gap-1">
                                  <span>Offline Vault</span>
                                  {v.fileSize ? <span>&bull; {formatFileSize(v.fileSize)}</span> : null}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSavedVideo(v.id, e)}
                              className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                              title="Delete from saved library"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Zoom, Pan & Crop Framing */}
            {activeSettingsTab === 'crop' && (
              <div className="space-y-4 animate-in fade-in duration-100">
                {/* Zoom Level Section */}
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Zoom Scale Factor</span>
                    </div>
                    <span className="font-mono text-xs text-indigo-300 font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      {zoom}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="300"
                    step="5"
                    value={zoom}
                    onChange={(e) => handleZoomChange(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />

                  {/* Quick Zoom Presets */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {[
                      { label: '50% Min', val: 50 },
                      { label: '100% Fit', val: 100 },
                      { label: '130% Fill', val: 130 },
                      { label: '150%', val: 150 },
                      { label: '200%', val: 200 },
                      { label: '250%', val: 250 },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => handleZoomChange(btn.val)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                          zoom === btn.val
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                            : 'bg-zinc-800 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pan / Crop Position Sliders */}
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Crop Pan Positioning</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ cropX: 50, cropY: 50 })}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      Reset Center (50/50)
                    </button>
                  </div>

                  {/* Horizontal Pan X */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Horizontal Pan (X):</span>
                      <span className="font-mono text-zinc-200">{cropX}% (0% Left - 100% Right)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={cropX}
                      onChange={(e) => onUpdateSettings({ cropX: Number(e.target.value), cropPreset: 'custom' })}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Vertical Pan Y */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Vertical Pan (Y):</span>
                      <span className="font-mono text-zinc-200">{cropY}% (0% Top - 100% Bottom)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={cropY}
                      onChange={(e) => onUpdateSettings({ cropY: Number(e.target.value), cropPreset: 'custom' })}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                {/* Aspect Framing Presets */}
                <div className="space-y-2">
                  <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] block">
                    Aspect Ratio Framing Presets
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCropPresetSelect('contain')}
                      className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-bold text-zinc-200">Fit (Contain)</div>
                      <div className="text-[10px] text-zinc-400">100% scale, no crop</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCropPresetSelect('cover')}
                      className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-bold text-zinc-200">Fill Frame</div>
                      <div className="text-[10px] text-zinc-400">130% edge-to-edge</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCropPresetSelect('9:16')}
                      className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-bold text-zinc-200">9:16 Shorts</div>
                      <div className="text-[10px] text-zinc-400">Vertical center crop</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCropPresetSelect('4:3')}
                      className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-bold text-zinc-200">4:3 Classic</div>
                      <div className="text-[10px] text-zinc-400">TV aspect crop</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCropPresetSelect('1:1')}
                      className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-bold text-zinc-200">1:1 Square</div>
                      <div className="text-[10px] text-zinc-400">Square crop box</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCropPresetSelect('21:9')}
                      className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-bold text-zinc-200">21:9 Cinema</div>
                      <div className="text-[10px] text-zinc-400">Ultra-wide cinema</div>
                    </button>
                  </div>
                </div>

                {/* Rotation and Global Framing Reset */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-xs font-medium">Rotation:</span>
                    {[0, 90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => onUpdateSettings({ rotate: deg })}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          rotate === deg
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleResetCropAndZoom}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Framing</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Playback Settings */}
            {activeSettingsTab === 'playback' && (
              <div className="space-y-4 animate-in fade-in duration-100">
                {/* Random Video on Finish Variety Mode */}
                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 mt-0.5 shrink-0">
                        <Shuffle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-200">Play Random Video on Finish</div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                          When the currently playing video finishes, automatically pick and play a random video from your saved list to add variety to your dashboard.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={randomPlayOnEnd}
                        onChange={(e) => onUpdateSettings({ randomPlayOnEnd: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs">
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoplay}
                      onChange={(e) => onUpdateSettings({ autoplay: e.target.checked })}
                      className="rounded accent-indigo-500"
                    />
                    <span>Autoplay stream</span>
                  </label>

                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMuted}
                      onChange={(e) => {
                        setIsMuted(e.target.checked);
                        onUpdateSettings({ muted: e.target.checked });
                      }}
                      className="rounded accent-indigo-500"
                    />
                    <span>Start Muted</span>
                  </label>

                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loop}
                      onChange={(e) => onUpdateSettings({ loop: e.target.checked })}
                      className="rounded accent-indigo-500"
                    />
                    <span>Continuous Loop</span>
                  </label>

                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fitMode === 'cover'}
                      onChange={(e) =>
                        onUpdateSettings({ fitMode: e.target.checked ? 'cover' : 'contain' })
                      }
                      className="rounded accent-indigo-500"
                    />
                    <span>Auto-Fill Frame</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowSettingsDrawer(false)}
            className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
          >
            Apply & Close
          </button>
        </div>
      )}
    </div>
  );
};
