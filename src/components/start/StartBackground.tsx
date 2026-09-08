import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StartPageConfig, StartVideoItem } from '../../types/start';
import { videoStorage } from '../../services/videoStorage';

interface StartBackgroundProps {
  config: StartPageConfig;
  onVideoIndexChange?: (index: number) => void;
  mousePos?: { x: number; y: number };
}

export const StartBackground: React.FC<StartBackgroundProps> = ({
  config,
  onVideoIndexChange,
  mousePos,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const particlesCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [resolvedMediaUrl, setResolvedMediaUrl] = useState<string | null>(null);
  const hasTriggeredAdvanceRef = useRef(false);
  const failedIndicesRef = useRef<Set<number>>(new Set());

  // Active playlist resolution
  const playlist: StartVideoItem[] =
    config.videoPlaylist && config.videoPlaylist.length > 0
      ? config.videoPlaylist
      : config.backgroundUrl
      ? [
          {
            id: 'default-single-vid',
            title: config.customMediaName || 'Ambient Video',
            url: config.backgroundUrl,
            customMediaId: config.customMediaId,
            customMediaName: config.customMediaName,
            sourceType: config.customMediaId ? 'local' : 'preset',
          },
        ]
      : [];

  const rawIndex = config.currentVideoIndex ?? 0;
  const activeIndex = playlist.length > 0 ? Math.min(Math.max(0, rawIndex), playlist.length - 1) : 0;
  const currentVideoItem: StartVideoItem | undefined = playlist[activeIndex];

  // Helper: check if URL is YouTube
  const isYouTubeUrl = (url?: string) => {
    if (!url) return false;
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/.+/.test(url);
  };

  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    let videoId = '';
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else if (url.trim().length === 11 && !url.includes('/') && !url.includes('.')) {
      videoId = url.trim();
    }
    if (!videoId) return null;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      controls: '0',
      disablekb: '1',
      fs: '0',
      rel: '0',
      iv_load_policy: '3',
      cc_load_policy: '0',
      cc_lang_pref: '',
      modestbranding: '1',
      playsinline: '1',
      enablejsapi: '1',
      loop: '1',
      playlist: videoId,
      autohide: '1',
    });
    if (origin) {
      params.set('origin', origin);
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  };

  // Helper: check if URL is Vimeo
  const isVimeoUrl = (url?: string) => {
    if (!url) return false;
    return /^(https?:\/\/)?(www\.)?(vimeo\.com|player\.vimeo\.com)\/.+/.test(url);
  };

  const getVimeoEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
    if (!match || !match[1]) return null;
    const vimeoId = match[1];
    return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&background=1&controls=0&title=0&byline=0&portrait=0&texttrack=0&dnt=1`;
  };

  // Next video transition logic
  const handleAdvanceToNextVideo = useCallback(() => {
    if (playlist.length <= 1) {
      // If only one video, replay if single video looping is enabled
      if (Boolean(config.videoLoop) && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      return;
    }

    let nextIndex: number;
    if (Boolean(config.videoShuffle)) {
      // Pick random index different from current that hasn't failed
      const availableIndices = playlist
        .map((_, i) => i)
        .filter((i) => i !== activeIndex && !failedIndicesRef.current.has(i));
      nextIndex =
        availableIndices.length > 0
          ? availableIndices[Math.floor(Math.random() * availableIndices.length)]
          : (activeIndex + 1) % playlist.length;
    } else {
      nextIndex = activeIndex + 1;
      if (nextIndex >= playlist.length) {
        if (config.videoLoopPlaylist !== false) {
          nextIndex = 0;
        } else {
          return; // Stop at the end if playlist looping is disabled
        }
      }
    }

    if (onVideoIndexChange) {
      onVideoIndexChange(nextIndex);
    }
  }, [playlist, activeIndex, config.videoShuffle, config.videoLoopPlaylist, config.videoLoop, onVideoIndexChange]);

  // Asynchronously resolve local custom media from IndexedDB vault for active video item
  const activeMediaId = currentVideoItem?.customMediaId || config.customMediaId;
  const activeFallbackUrl = currentVideoItem?.url || config.backgroundUrl;

  useEffect(() => {
    let isMounted = true;

    async function resolveMedia() {
      if (activeMediaId) {
        try {
          const url = await videoStorage.getOrCreateVideoUrl(activeMediaId);
          if (isMounted && url) {
            setResolvedMediaUrl(url);
            setVideoError(false);
            return;
          }
        } catch (err) {
          console.warn('Could not resolve start page background video from vault', err);
        }
      }
      if (isMounted) {
        setResolvedMediaUrl(null);
      }
    }

    resolveMedia();

    return () => {
      isMounted = false;
    };
  }, [activeMediaId, activeFallbackUrl, activeIndex]);

  // Pre-resolve all other local videos in the playlist in background to avoid any switch delays
  useEffect(() => {
    playlist.forEach((item) => {
      if (item.customMediaId) {
        videoStorage.getOrCreateVideoUrl(item.customMediaId).catch(() => {});
      }
    });
  }, [playlist]);

  // Reset advance trigger and error state when media source changes
  useEffect(() => {
    hasTriggeredAdvanceRef.current = false;
    setVideoError(false);
    setIsVideoLoaded(false);
  }, [activeFallbackUrl, activeMediaId, activeIndex]);

  // Active media URL (either restored from IndexedDB or remote/preset URL)
  const effectiveMediaUrl = resolvedMediaUrl || activeFallbackUrl;
  const isYouTube = isYouTubeUrl(effectiveMediaUrl);
  const youTubeEmbedUrl = isYouTube ? getYouTubeEmbedUrl(effectiveMediaUrl) : null;
  const isVimeo = isVimeoUrl(effectiveMediaUrl);
  const vimeoEmbedUrl = isVimeo ? getVimeoEmbedUrl(effectiveMediaUrl) : null;

  // Always ensure video element is strictly muted and silent, and disable any active text tracks/captions
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0;
      videoRef.current.muted = true;
      if (videoRef.current.textTracks) {
        for (let i = 0; i < videoRef.current.textTracks.length; i++) {
          videoRef.current.textTracks[i].mode = 'disabled';
        }
      }
    }
  }, [effectiveMediaUrl, activeIndex]);

  // Listen for YouTube iframe postMessage state events (ENDED state = 0)
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        if (!data) return;

        // YouTube API onStateChange event info === 0 or state === 0 means video ENDED
        const isEnded =
          (data.event === 'onStateChange' && (data.info === 0 || data.info?.playerState === 0)) ||
          data.info === 0 ||
          data.event === 'ended';

        if (isEnded) {
          if (Boolean(config.videoAutoplayNext) && playlist.length > 1) {
            handleAdvanceToNextVideo();
          }
        }
      } catch {
        // Not a JSON message or unrelated message
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [config.videoAutoplayNext, playlist.length, handleAdvanceToNextVideo]);

  // Determine if autoplay next is active for multi-video playlist
  const isAutoplayNextActive = Boolean(config.videoAutoplayNext) && playlist.length > 1;

  // Single video loop is active ONLY if videoLoop is explicitly enabled and not in multi-video advancing
  const isSingleLoopActive = Boolean(config.videoLoop) && !isAutoplayNextActive;

  // Native HTML video loop attribute
  const shouldNativeLoop = isSingleLoopActive;

  const handleIframeLoad = () => {
    setIsVideoLoaded(true);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const win = iframeRef.current.contentWindow;
        win.postMessage(JSON.stringify({ event: 'listening' }), '*');
        win.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }), '*');
        // Explicitly enforce mute, play, and turn off captions/CC modules
        win.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
        win.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
        win.postMessage(JSON.stringify({ event: 'command', func: 'unloadModule', args: ['captions'] }), '*');
        win.postMessage(JSON.stringify({ event: 'command', func: 'unloadModule', args: ['cc'] }), '*');
        win.postMessage(JSON.stringify({ event: 'command', func: 'setOption', args: ['captions', 'track', {}] }), '*');
        win.postMessage(JSON.stringify({ event: 'command', func: 'setOption', args: ['cc', 'track', {}] }), '*');
      } catch {}
    }
  };

  // Parallax offsets for background media layer (moves subtly in opposite direction of mouse)
  const intensity = config.parallaxIntensity ?? 12;
  const parallaxX = config.parallaxEnabled && mousePos ? -mousePos.x * (intensity * 0.8) : 0;
  const parallaxY = config.parallaxEnabled && mousePos ? -mousePos.y * (intensity * 0.8) : 0;

  // Cyber dust motes & atmospheric particle simulation
  useEffect(() => {
    if (!config.ambientParticles) return;
    const canvas = particlesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = config.particleDensity ?? 35;
    const speed = config.particleSpeed ?? 2;
    const particleType = config.particleType || 'cyber-dust';
    const particleColor = config.particleColor || '#38bdf8';

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.8,
      speedY: -(Math.random() * 0.8 + 0.2) * speed,
      speedX: (Math.random() - 0.5) * 0.4 * speed,
      opacity: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.04 + 0.01,
      angle: Math.random() * Math.PI * 2,
    }));

    const renderParticles = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentOpacity = p.opacity * (0.6 + Math.sin(p.angle) * 0.4);

        ctx.fillStyle = particleColor;
        ctx.globalAlpha = currentOpacity;

        if (particleType === 'hexagons') {
          // Tactical miniature hexagon
          const r = p.size * 1.5;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3;
            const hx = p.x + r * Math.cos(a);
            const hy = p.y + r * Math.sin(a);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (particleType === 'sparks') {
          // Glowing diamond spark
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size * 2);
          ctx.lineTo(p.x + p.size, p.y);
          ctx.lineTo(p.x, p.y + p.size * 2);
          ctx.lineTo(p.x - p.size, p.y);
          ctx.closePath();
          ctx.fill();
        } else if (particleType === 'embers') {
          // Rising soft ember
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard cyber dust mote circle with soft glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animId = requestAnimationFrame(renderParticles);
    };

    renderParticles();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [
    config.ambientParticles,
    config.particleDensity,
    config.particleSpeed,
    config.particleType,
    config.particleColor,
  ]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0 bg-zinc-950">
      {/* 1. Pure Ambient Video Background Container with 2.5D Parallax */}
      <div
        className="absolute inset-[-40px] pointer-events-none overflow-hidden transition-transform duration-100 ease-out will-change-transform"
        style={{
          transform: config.parallaxEnabled
            ? `translate3d(${parallaxX}px, ${parallaxY}px, 0) scale(1.08)`
            : undefined,
        }}
      >
        {!videoError && effectiveMediaUrl ? (
          isYouTube && youTubeEmbedUrl ? (
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden scale-105">
              <iframe
                ref={iframeRef}
                key={`yt-${effectiveMediaUrl}-${activeIndex}`}
                src={youTubeEmbedUrl}
                title="Start Page YouTube Ambient Video Background"
                onLoad={handleIframeLoad}
                className={`absolute top-1/2 left-1/2 w-[115vw] h-[115vh] min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-1000 ${
                  isVideoLoaded ? 'opacity-90' : 'opacity-0'
                }`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : isVimeo && vimeoEmbedUrl ? (
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden scale-105">
              <iframe
                ref={iframeRef}
                key={`vimeo-${effectiveMediaUrl}-${activeIndex}`}
                src={vimeoEmbedUrl}
                title="Start Page Vimeo Ambient Video Background"
                onLoad={() => setIsVideoLoaded(true)}
                className={`absolute top-1/2 left-1/2 w-[115vw] h-[115vh] min-w-[177.77vh] min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-1000 ${
                  isVideoLoaded ? 'opacity-90' : 'opacity-0'
                }`}
                allow="autoplay; fullscreen; picture-in-picture"
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              key={`vid-${effectiveMediaUrl}-${activeIndex}`}
              src={effectiveMediaUrl}
              autoPlay={config.videoAutoplay !== false}
              loop={shouldNativeLoop}
              muted
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              // @ts-ignore
              controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
              onLoadedData={() => {
                setIsVideoLoaded(true);
                setVideoError(false);
                failedIndicesRef.current.delete(activeIndex);
                if (videoRef.current) {
                  videoRef.current.volume = 0;
                  videoRef.current.muted = true;
                  // Explicitly disable any text tracks (captions / subtitles)
                  if (videoRef.current.textTracks) {
                    for (let i = 0; i < videoRef.current.textTracks.length; i++) {
                      videoRef.current.textTracks[i].mode = 'disabled';
                    }
                  }
                  if (config.videoAutoplay !== false) {
                    videoRef.current.play().catch(() => {});
                  }
                }
              }}
              onCanPlay={() => {
                setIsVideoLoaded(true);
                if (videoRef.current && config.videoAutoplay !== false) {
                  videoRef.current.play().catch(() => {});
                }
              }}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                // If video is within 0.25s of ending and autoplay is active, trigger advance
                if (
                  isAutoplayNextActive &&
                  v.duration > 0 &&
                  v.currentTime > 0.5 &&
                  v.duration - v.currentTime <= 0.25 &&
                  !hasTriggeredAdvanceRef.current
                ) {
                  hasTriggeredAdvanceRef.current = true;
                  handleAdvanceToNextVideo();
                }
              }}
              onEnded={() => {
                if (isAutoplayNextActive) {
                  if (!hasTriggeredAdvanceRef.current) {
                    hasTriggeredAdvanceRef.current = true;
                    handleAdvanceToNextVideo();
                  }
                } else if (isSingleLoopActive && videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play().catch(() => {});
                }
              }}
              onError={() => {
                console.warn(`StartBackground video at index ${activeIndex} failed to load.`);
                failedIndicesRef.current.add(activeIndex);

                // If other videos in playlist exist and have not failed yet, try advancing once
                if (
                  isAutoplayNextActive &&
                  failedIndicesRef.current.size < playlist.length
                ) {
                  handleAdvanceToNextVideo();
                } else {
                  setVideoError(true);
                }
              }}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                isVideoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                objectFit: config.backgroundFit || 'cover',
              }}
            />
          )
        ) : (
          /* Clean dark ambient fallback without image artifacts */
          <div className="absolute inset-0 w-full h-full bg-zinc-950" />
        )}
      </div>

      {/* 2. Color Dimming Overlay */}
      <div
        className="absolute inset-0 transition-all duration-300 pointer-events-none"
        style={{
          backgroundColor: config.overlayColor || '#000000',
          opacity: (config.overlayDim ?? 30) / 100,
        }}
      />

      {/* 3. Backdrop Blur Filter Overlay */}
      {config.overlayBlur > 0 && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            backdropFilter: `blur(${config.overlayBlur}px)`,
            WebkitBackdropFilter: `blur(${config.overlayBlur}px)`,
          }}
        />
      )}

      {/* 4. Floating Cyber Dust Motes Layer */}
      {config.ambientParticles && (
        <canvas
          ref={particlesCanvasRef}
          className="absolute inset-0 pointer-events-none z-10"
        />
      )}

      {/* 5. Cinematic Vignette Mask */}
      {config.overlayVignette && (
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.45) 75%, rgba(0, 0, 0, 0.85) 100%), linear-gradient(to top, rgba(9, 9, 11, 0.7) 0%, transparent 20%, transparent 80%, rgba(9, 9, 11, 0.6) 100%)',
          }}
        />
      )}

      {/* 6. Subtle ambient gradient shimmer */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50 pointer-events-none z-20" />
    </div>
  );
};

