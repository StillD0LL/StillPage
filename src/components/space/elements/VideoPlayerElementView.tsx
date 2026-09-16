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
} from 'lucide-react';
import { VideoPlayerElement } from '../../../types/space';
import { CURATED_VIDEOS } from '../../../utils/spaceDefaults';
import { uiSound } from '../../../services/uiSound';

interface VideoPlayerElementViewProps {
  element: VideoPlayerElement;
  isSelected: boolean;
  isViewMode: boolean;
  globalAutoplay?: boolean;
  onUpdate: (updated: Partial<VideoPlayerElement>) => void;
}

export const VideoPlayerElementView: React.FC<VideoPlayerElementViewProps> = ({
  element,
  isSelected,
  isViewMode,
  globalAutoplay = false,
  onUpdate,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const effectiveAutoplay = element.autoplay || globalAutoplay;

  // Modern browsers require muted for unprompted autoplay
  const effectiveMuted = element.muted || effectiveAutoplay;

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
      });
      setUrlInput('');
      setIsConfigOpen(false);
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col rounded-2xl bg-zinc-950/90 text-zinc-100 border border-zinc-800/80 shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl select-none"
      style={{
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      {/* Sleek Top Player Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/80 border-b border-zinc-800/80 text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
          </div>
          <span className="font-semibold text-zinc-200 truncate text-[11px]">
            {element.title || 'Floating Video Player'}
          </span>
          {effectiveAutoplay && (
            <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-[9px] font-medium text-sky-300">
              <Play className="w-2 h-2 fill-current" />
              Autoplay
            </span>
          )}
        </div>

        {/* Header Controls */}
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

          {!isViewMode && (
            <button
              type="button"
              onClick={() => {
                uiSound.playClick();
                setIsConfigOpen(!isConfigOpen);
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Configure Video Source"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden min-h-[160px]">
        {element.sourceType === 'youtube' && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${
              effectiveAutoplay ? '1' : '0'
            }&mute=${effectiveMuted ? '1' : '0'}&loop=${
              element.loop ? '1' : '0'
            }&playlist=${youtubeId}&controls=1&rel=0&modestbranding=1&enablejsapi=1`}
            title={element.title || 'YouTube Player'}
            className="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : element.videoUrl ? (
          <video
            ref={videoRef}
            src={element.videoUrl}
            autoPlay={effectiveAutoplay}
            muted={effectiveMuted}
            loop={element.loop}
            controls
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-500">
            <Film className="w-8 h-8 mb-2 text-zinc-600 opacity-60" />
            <p className="text-xs text-zinc-400 mb-2">No video URL configured</p>
            {!isViewMode && (
              <button
                type="button"
                onClick={() => setIsConfigOpen(true)}
                className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs rounded-lg font-medium cursor-pointer"
              >
                Select Ambient Video
              </button>
            )}
          </div>
        )}
      </div>

      {/* Config Popover (Design Mode) */}
      {isConfigOpen && !isViewMode && (
        <div
          className="absolute inset-x-2 top-10 bottom-2 p-3.5 rounded-xl bg-zinc-950/98 border border-zinc-700/80 text-zinc-100 shadow-2xl z-30 flex flex-col gap-2.5 overflow-y-auto backdrop-blur-2xl text-xs"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 font-semibold text-zinc-200">
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-sky-400" />
              Configure Video Player
            </span>
            <button
              type="button"
              onClick={() => setIsConfigOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Title input */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Player Title:</label>
            <input
              type="text"
              value={element.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="e.g. Lofi Chill Station"
              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 outline-none focus:border-sky-500"
            />
          </div>

          {/* URL Input */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Video or YouTube URL:</label>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg cursor-pointer"
              >
                Set
              </button>
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Ambient Presets:</label>
            <div className="grid grid-cols-2 gap-1.5">
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
                    });
                    setIsConfigOpen(false);
                  }}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-sky-400/50 text-left text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <p className="font-semibold truncate">{v.title}</p>
                  <p className="text-[9px] text-zinc-500">YouTube Stream</p>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
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
