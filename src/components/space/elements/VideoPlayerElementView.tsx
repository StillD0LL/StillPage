import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Play,
  Volume2,
  VolumeX,
  Repeat,
  Settings,
  Sparkles,
  Link,
  Film,
  Upload,
  HardDrive,
  Globe,
  FileVideo,
  Check,
  RefreshCw,
} from 'lucide-react';
import { VideoPlayerElement } from '../../../types/space';
import { CURATED_VIDEOS, CURATED_DIRECT_VIDEOS } from '../../../utils/spaceDefaults';
import { uiSound } from '../../../services/uiSound';
import { mediaStorage } from '../../../services/mediaStorage';

interface VideoPlayerElementViewProps {
  element: VideoPlayerElement;
  isSelected: boolean;
  isViewMode: boolean;
  globalAutoplay?: boolean;
  onUpdate: (updated: Partial<VideoPlayerElement>) => void;
}

type ConfigTab = 'address' | 'local' | 'presets';

export const VideoPlayerElementView: React.FC<VideoPlayerElementViewProps> = ({
  element,
  isSelected,
  isViewMode,
  globalAutoplay = false,
  onUpdate,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configTab, setConfigTab] = useState<ConfigTab>('address');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveAutoplay = element.autoplay || globalAutoplay;
  const effectiveMuted = element.muted || effectiveAutoplay;

  // Re-hydrate local video if URL is missing or stale after refresh/cycle
  useEffect(() => {
    let isMounted = true;
    if (element.isLocal && element.localVideoId) {
      mediaStorage.getLocalVideoUrl(element.localVideoId).then((url) => {
        if (isMounted && url && url !== element.videoUrl) {
          onUpdate({ videoUrl: url });
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [element.localVideoId, element.isLocal]);

  // Handle HTML5 video autoplay with fallback
  useEffect(() => {
    if (effectiveAutoplay && videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [effectiveAutoplay, element.videoUrl]);

  // Extract YouTube ID
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    if (url.trim().length === 11 && !url.includes('/') && !url.includes('.')) {
      return url.trim();
    }
    return null;
  };

  const isYouTube = (url: string) => {
    return Boolean(getYouTubeId(url));
  };

  const youtubeId = getYouTubeId(element.videoUrl);

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      uiSound.playPlace();
      const trimmed = urlInput.trim();
      const isYt = isYouTube(trimmed);
      onUpdate({
        videoUrl: trimmed,
        sourceType: isYt ? 'youtube' : 'direct',
        isLocal: false,
        localVideoId: undefined,
        localFileName: undefined,
        localFileSize: undefined,
        title: element.title || (isYt ? 'YouTube Video Player' : 'Web Video Stream'),
      });
      setUrlInput('');
      setIsConfigOpen(false);
    }
  };

  // Handle local video file upload via file dialog
  const handleLocalVideoUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (MP4, WebM, MOV, Ogg).');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      uiSound.playPlace();

      const { id, url, size } = await mediaStorage.saveLocalVideo(file);

      // Clean title from filename
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      onUpdate({
        videoUrl: url,
        sourceType: 'direct',
        isLocal: true,
        localVideoId: id,
        localFileName: file.name,
        localFileSize: size,
        title: cleanTitle || 'Local Video Player',
      });

      setIsConfigOpen(false);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to save local video.');
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLocalVideoUpload(file);
    }
  };

  // Drag and drop video file directly on player in design mode
  const handleDragOver = (e: React.DragEvent) => {
    if (isViewMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isViewMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isViewMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      handleLocalVideoUpload(file);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col rounded-2xl bg-zinc-950/90 text-zinc-100 border shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl select-none transition-colors ${
        isDraggingOver ? 'border-sky-400 ring-2 ring-sky-400/40 bg-sky-950/40' : 'border-zinc-800/80'
      }`}
      style={{
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
        className="hidden"
        onChange={onFileInputChange}
      />

      {/* Top Player Header Bar:
          When in view mode, ALL media controls (mute/unmute, settings) are disabled and hidden! */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/80 border-b border-zinc-800/80 text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
          </div>
          <span className="font-semibold text-zinc-200 truncate text-[11px]">
            {element.title || (element.isLocal ? element.localFileName : 'Floating Video Player')}
          </span>

          {element.isLocal && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[9px] font-medium text-amber-300 shrink-0">
              <HardDrive className="w-2.5 h-2.5" />
              Local
            </span>
          )}

          {effectiveAutoplay && (
            <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-[9px] font-medium text-sky-300 shrink-0">
              <Play className="w-2 h-2 fill-current" />
              Autoplay
            </span>
          )}
        </div>

        {/* Header Controls - ONLY visible in design mode. Completely disabled/hidden in view mode! */}
        {!isViewMode && (
          <div className="flex items-center gap-1 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
            {/* Quick Sound/Mute Toggle */}
            <button
              type="button"
              onClick={() => {
                uiSound.playClick();
                onUpdate({ muted: !element.muted });
              }}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                element.muted
                  ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
              }`}
              title={element.muted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {element.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Quick Local Video Upload Button */}
            <button
              type="button"
              onClick={() => {
                uiSound.playClick();
                fileInputRef.current?.click();
              }}
              className="p-1 rounded-md text-amber-400 hover:text-amber-300 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Upload Local Video File"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>

            {/* Configure Video Source */}
            <button
              type="button"
              onClick={() => {
                uiSound.playClick();
                setIsConfigOpen(!isConfigOpen);
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Configure Video Source (Address, Local File, Presets)"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Video Viewport:
          In View Mode, all native browser and YouTube controls are disabled!
          A transparent overlay prevents clicks from triggering playback controls or popups. */}
      <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden min-h-[160px]">
        {element.sourceType === 'youtube' && youtubeId ? (
          <div className="relative w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${
                effectiveAutoplay ? '1' : '0'
              }&mute=${effectiveMuted ? '1' : '0'}&loop=${
                element.loop ? '1' : '0'
              }&playlist=${youtubeId}&controls=${isViewMode ? '0' : '1'}&disablekb=${
                isViewMode ? '1' : '0'
              }&fs=${isViewMode ? '0' : '1'}&rel=0&modestbranding=1&enablejsapi=1`}
              title={element.title || 'YouTube Player'}
              className={`w-full h-full border-0 absolute inset-0 ${
                isViewMode ? 'pointer-events-none' : ''
              }`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen={!isViewMode}
            />
            {/* View Mode Shield: completely absorbs pointer events to prevent YouTube controls */}
            {isViewMode && (
              <div
                className="absolute inset-0 z-20 bg-transparent cursor-default select-none pointer-events-auto"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                title="View Mode: Media controls disabled"
              />
            )}
          </div>
        ) : element.videoUrl ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={element.videoUrl}
              autoPlay={effectiveAutoplay}
              muted={effectiveMuted}
              loop={element.loop}
              controls={!isViewMode}
              controlsList={isViewMode ? 'nofullscreen nodownload noremoteplayback noplaybackrate' : undefined}
              disablePictureInPicture={isViewMode}
              playsInline
              className={`w-full h-full object-contain ${
                isViewMode ? 'pointer-events-none select-none' : ''
              }`}
            />
            {/* View Mode Shield: completely blocks clicks and context menus on HTML5 video */}
            {isViewMode && (
              <div
                className="absolute inset-0 z-20 bg-transparent cursor-default select-none pointer-events-auto"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onContextMenu={(e) => e.preventDefault()}
                title="View Mode: Media controls disabled"
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-500">
            <Film className="w-8 h-8 mb-2 text-zinc-600 opacity-60" />
            <p className="text-xs text-zinc-400 mb-1">No video configured</p>
            <p className="text-[10px] text-zinc-500 mb-3">Add a video address or choose a local file</p>
            {!isViewMode && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs rounded-lg font-medium cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3 h-3" />
                  Local Video
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(true)}
                  className="px-2.5 py-1 bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/30 text-xs rounded-lg font-medium cursor-pointer flex items-center gap-1.5"
                >
                  <Globe className="w-3 h-3" />
                  Video Address
                </button>
              </div>
            )}
          </div>
        )}

        {/* Drag over overlay when dropping a video file */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-30 bg-sky-950/80 backdrop-blur-sm border-2 border-dashed border-sky-400 flex flex-col items-center justify-center text-sky-200 pointer-events-none animate-in fade-in duration-150">
            <Upload className="w-8 h-8 mb-2 animate-bounce text-sky-300" />
            <span className="text-xs font-bold">Drop local video here</span>
            <span className="text-[10px] text-sky-300/80">MP4, WebM, MOV supported</span>
          </div>
        )}
      </div>

      {/* Config Popover (Design Mode only) */}
      {isConfigOpen && !isViewMode && (
        <div
          className="absolute inset-x-2 top-10 bottom-2 p-3.5 rounded-xl bg-zinc-950/98 border border-zinc-700/80 text-zinc-100 shadow-2xl z-30 flex flex-col gap-2.5 overflow-y-auto backdrop-blur-2xl text-xs"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 font-semibold text-zinc-200">
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-sky-400" />
              Configure Video Source
            </span>
            <button
              type="button"
              onClick={() => setIsConfigOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer px-1"
            >
              ✕
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800">
            <button
              type="button"
              onClick={() => setConfigTab('address')}
              className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                configTab === 'address' ? 'bg-sky-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Address / URL</span>
            </button>
            <button
              type="button"
              onClick={() => setConfigTab('local')}
              className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                configTab === 'local' ? 'bg-amber-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <HardDrive className="w-3 h-3" />
              <span>Local File</span>
            </button>
            <button
              type="button"
              onClick={() => setConfigTab('presets')}
              className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                configTab === 'presets' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Presets</span>
            </button>
          </div>

          {/* Title input */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Player Title:</label>
            <input
              type="text"
              value={element.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="e.g. Chill Session, Nature Meadow"
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 outline-none focus:border-sky-500"
            />
          </div>

          {/* TAB 1: Video Address (Direct video or YouTube) */}
          {configTab === 'address' && (
            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Video Address (Direct MP4, WebM, Stream, or YouTube):
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://.../video.mp4 or youtube.com/..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 outline-none focus:border-sky-500 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Tip: Enter any direct video URL (.mp4, .webm) or YouTube video address. Direct video plays seamlessly without ads!
              </p>
            </div>
          )}

          {/* TAB 2: Local Video File */}
          {configTab === 'local' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                    <FileVideo className="w-3.5 h-3.5 text-amber-400" />
                    Local Video on Device
                  </span>
                  {element.isLocal && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Active Local Video
                    </span>
                  )}
                </div>

                {element.isLocal && element.localFileName ? (
                  <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] space-y-1">
                    <div className="text-zinc-200 font-mono truncate font-medium">{element.localFileName}</div>
                    <div className="text-zinc-500 text-[10px] flex items-center gap-2">
                      <span>Size: {formatBytes(element.localFileSize)}</span>
                      <span>•</span>
                      <span>Persisted in local browser storage</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-400">
                    Upload any local video from your computer. Video is securely stored and available across Space custom layout switches!
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Saving local video...' : element.isLocal ? 'Choose Another Video File' : 'Select Local Video File'}</span>
                </button>

                {uploadError && (
                  <p className="text-[10px] text-rose-400 bg-rose-950/30 p-1.5 rounded border border-rose-800/40">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Curated Presets (Both Direct Videos & YouTube) */}
          {configTab === 'presets' && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
              {/* Curated Direct Video Streams */}
              <div>
                <label className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                  Direct Video Addresses (Ad-free MP4):
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {CURATED_DIRECT_VIDEOS.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        uiSound.playPlace();
                        onUpdate({
                          videoUrl: v.url,
                          title: v.title,
                          sourceType: 'direct',
                          isLocal: false,
                        });
                        setIsConfigOpen(false);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 text-left text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span className="truncate font-medium">{v.title}</span>
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                        MP4
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* YouTube Presets */}
              <div className="pt-1">
                <label className="text-[10px] uppercase font-bold text-sky-400 block mb-1">
                  Curated YouTube Streams:
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {CURATED_VIDEOS.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        uiSound.playPlace();
                        onUpdate({
                          videoUrl: v.url,
                          title: v.title,
                          sourceType: 'youtube',
                          isLocal: false,
                        });
                        setIsConfigOpen(false);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-sky-400/50 text-left text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span className="truncate font-medium">{v.title}</span>
                      <span className="text-[9px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 shrink-0">
                        YouTube
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Autoplay & Playback Toggles */}
          <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2 text-[11px]">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={element.autoplay}
                  onChange={(e) => onUpdate({ autoplay: e.target.checked })}
                  className="rounded text-sky-500 focus:ring-0 cursor-pointer"
                />
                <span>Auto-play (this video)</span>
              </label>

              {globalAutoplay && (
                <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 font-medium">
                  Space Auto-play Active
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={element.loop}
                  onChange={(e) => onUpdate({ loop: e.target.checked })}
                  className="rounded text-sky-500 focus:ring-0 cursor-pointer"
                />
                <span>Loop Playback</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={element.muted}
                  onChange={(e) => onUpdate({ muted: e.target.checked })}
                  className="rounded text-sky-500 focus:ring-0 cursor-pointer"
                />
                <span>Start Muted</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
