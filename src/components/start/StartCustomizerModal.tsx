import React, { useState } from 'react';
import {
  X,
  Type,
  Video,
  Sliders,
  Sparkles,
  RotateCcw,
  Check,
  Upload,
  Link,
  Plus,
  Trash2,
  ExternalLink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Sun,
  Clock,
  Search,
  Quote,
  LayoutGrid,
  Loader2,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Film,
  ListVideo,
  Play,
  ArrowUp,
  ArrowDown,
  Shuffle,
  Repeat,
  ListPlus,
  Layers,
  Move,
} from 'lucide-react';
import {
  StartPageConfig,
  StartBackgroundPreset,
  StartQuickLink,
  StartTitleFont,
  StartTitleSize,
  StartTextAlignment,
  StartTextShadow,
  StartVideoItem,
  StartParticleType,
} from '../../types/start';
import {
  START_BACKGROUND_PRESETS,
  TITLE_GRADIENTS,
  DEFAULT_START_CONFIG,
  INSPIRATIONAL_QUOTES,
} from '../../utils/startDefaults';
import { videoStorage } from '../../services/videoStorage';

interface StartCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StartPageConfig;
  onUpdateConfig: (newConfig: StartPageConfig) => void;
  onResetDefaults: () => void;
}

type TabType = 'typography' | 'background' | 'widgets' | 'effects';

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const StartCustomizerModal: React.FC<StartCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('typography');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [customUrlTitle, setCustomUrlTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Media upload & processing state
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [mediaStatusMessage, setMediaStatusMessage] = useState<string | null>(null);
  const [mediaErrorMessage, setMediaErrorMessage] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = <K extends keyof StartPageConfig>(
    key: K,
    value: StartPageConfig[K]
  ) => {
    onUpdateConfig({
      ...config,
      [key]: value,
    });
  };

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
            poster: config.backgroundPoster,
            customMediaId: config.customMediaId,
            customMediaName: config.customMediaName,
            sourceType: (config.customMediaId ? 'local' : 'preset') as any,
          },
        ]
      : [];

  const currentVideoIdx = Math.min(
    Math.max(0, config.currentVideoIndex ?? 0),
    Math.max(0, playlist.length - 1)
  );

  // Apply a curated preset as the single active background
  const handleApplyPreset = (preset: StartBackgroundPreset) => {
    const newVideoItem: StartVideoItem = {
      id: preset.id,
      title: preset.title,
      url: preset.url,
      poster: preset.poster || preset.thumbnail,
      thumbnail: preset.thumbnail,
      sourceType: 'preset',
      author: preset.author,
    };

    // If playlist already has this preset, switch index to it; otherwise replace or prepend
    const existingIdx = playlist.findIndex((v) => v.id === preset.id || v.url === preset.url);
    let updatedPlaylist: StartVideoItem[];
    let nextIdx = 0;

    if (existingIdx !== -1) {
      updatedPlaylist = [...playlist];
      nextIdx = existingIdx;
    } else {
      updatedPlaylist = [newVideoItem, ...playlist];
      nextIdx = 0;
    }

    onUpdateConfig({
      ...config,
      backgroundType: 'video',
      backgroundUrl: preset.url,
      backgroundPoster: preset.poster || preset.thumbnail,
      selectedPresetId: preset.id,
      customMediaId: undefined,
      customMediaName: undefined,
      videoPlaylist: updatedPlaylist,
      currentVideoIndex: nextIdx,
      // User's customized typography, overlay dim, blur, and loop settings are preserved
    });

    setMediaStatusMessage(`Applied "${preset.title}" ambient video preset.`);
    setTimeout(() => setMediaStatusMessage(null), 3000);
  };

  // Add preset to existing playlist queue
  const handleAddPresetToPlaylist = (preset: StartBackgroundPreset) => {
    const newVideoItem: StartVideoItem = {
      id: `${preset.id}-${Date.now()}`,
      title: preset.title,
      url: preset.url,
      poster: preset.poster || preset.thumbnail,
      thumbnail: preset.thumbnail,
      sourceType: 'preset',
      author: preset.author,
    };

    const updatedPlaylist = [...playlist, newVideoItem];
    onUpdateConfig({
      ...config,
      backgroundType: 'video',
      videoPlaylist: updatedPlaylist,
    });
    setMediaStatusMessage(`Added "${preset.title}" to video playlist queue!`);
    setTimeout(() => setMediaStatusMessage(null), 3000);
  };

  // Add all curated video presets to playlist queue in one click
  const handleAddAllVideoPresetsToPlaylist = () => {
    const newItems: StartVideoItem[] = START_BACKGROUND_PRESETS.map((p) => ({
      id: `${p.id}-${Date.now()}`,
      title: p.title,
      url: p.url,
      poster: p.poster || p.thumbnail,
      thumbnail: p.thumbnail,
      sourceType: 'preset',
      author: p.author,
    }));

    const updatedPlaylist = [...playlist, ...newItems];
    onUpdateConfig({
      ...config,
      backgroundType: 'video',
      videoPlaylist: updatedPlaylist,
    });
    setMediaStatusMessage(`Added ${newItems.length} curated ambient videos to playlist sequence!`);
    setTimeout(() => setMediaStatusMessage(null), 3500);
  };

  // Add custom URL / YouTube / Vimeo video to playlist
  const handleAddCustomUrlToPlaylist = (playImmediately = false) => {
    const rawUrl = customUrlInput.trim();
    if (!rawUrl) return;

    const isYT = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/.+/.test(rawUrl);
    const isVimeo = /^(https?:\/\/)?(www\.)?(vimeo\.com|player\.vimeo\.com)\/.+/.test(rawUrl);
    const title =
      customUrlTitle.trim() ||
      (isYT
        ? 'YouTube Ambient Video'
        : isVimeo
        ? 'Vimeo Ambient Video'
        : `Custom Video Track ${playlist.length + 1}`);

    const newVideoItem: StartVideoItem = {
      id: `vid-url-${Date.now()}`,
      title,
      url: rawUrl,
      sourceType: isYT ? 'youtube' : isVimeo ? 'vimeo' : 'url',
    };

    const updatedPlaylist = playImmediately
      ? [newVideoItem, ...playlist]
      : [...playlist, newVideoItem];

    onUpdateConfig({
      ...config,
      backgroundType: 'video',
      videoPlaylist: updatedPlaylist,
      currentVideoIndex: playImmediately ? 0 : config.currentVideoIndex ?? 0,
      backgroundUrl: playImmediately ? rawUrl : config.backgroundUrl,
    });

    setCustomUrlInput('');
    setCustomUrlTitle('');
    setMediaStatusMessage(`Added "${title}" to playlist!`);
    setTimeout(() => setMediaStatusMessage(null), 3500);
  };

  // Play a specific video from the playlist now
  const handlePlayVideoAtIndex = (index: number) => {
    if (index < 0 || index >= playlist.length) return;
    const targetItem = playlist[index];
    onUpdateConfig({
      ...config,
      backgroundType: 'video',
      currentVideoIndex: index,
      backgroundUrl: targetItem.url,
      customMediaId: targetItem.customMediaId,
      customMediaName: targetItem.customMediaName,
      backgroundPoster: targetItem.poster,
    });
    setMediaStatusMessage(`Now playing: "${targetItem.title}"`);
    setTimeout(() => setMediaStatusMessage(null), 2500);
  };

  // Remove video track from playlist
  const handleRemoveVideoFromPlaylist = (index: number) => {
    if (playlist.length <= 1) {
      setMediaErrorMessage('Cannot delete the last video. Add another video first or reset to default.');
      setTimeout(() => setMediaErrorMessage(null), 3500);
      return;
    }

    const removedItem = playlist[index];
    const updatedPlaylist = playlist.filter((_, i) => i !== index);

    let nextIdx = currentVideoIdx;
    if (index === currentVideoIdx) {
      nextIdx = Math.min(index, updatedPlaylist.length - 1);
    } else if (index < currentVideoIdx) {
      nextIdx = currentVideoIdx - 1;
    }

    const nextActive = updatedPlaylist[nextIdx];

    onUpdateConfig({
      ...config,
      videoPlaylist: updatedPlaylist,
      currentVideoIndex: nextIdx,
      backgroundUrl: nextActive?.url || config.backgroundUrl,
      customMediaId: nextActive?.customMediaId,
      customMediaName: nextActive?.customMediaName,
      backgroundPoster: nextActive?.poster,
    });

    setMediaStatusMessage(`Removed "${removedItem.title}" from playlist.`);
    setTimeout(() => setMediaStatusMessage(null), 3000);
  };

  // Move video up/down in sequence
  const handleMoveVideoInPlaylist = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= playlist.length) return;

    const updatedPlaylist = [...playlist];
    const [moved] = updatedPlaylist.splice(fromIndex, 1);
    updatedPlaylist.splice(toIndex, 0, moved);

    // Adjust active index if affected
    let nextIdx = currentVideoIdx;
    if (currentVideoIdx === fromIndex) {
      nextIdx = toIndex;
    } else if (currentVideoIdx === toIndex) {
      nextIdx = fromIndex;
    }

    onUpdateConfig({
      ...config,
      videoPlaylist: updatedPlaylist,
      currentVideoIndex: nextIdx,
    });
  };

  // Multi-file upload and batch processing for permanent local storage
  const handleProcessFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsProcessingMedia(true);
    setMediaErrorMessage(null);
    setMediaStatusMessage(`Processing & storing ${fileArray.length} video(s) into local vault...`);

    try {
      const newVideoItems: StartVideoItem[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);

        if (isVideo) {
          const customId = `start-vid-${Date.now()}-${i}`;
          const meta = await videoStorage.saveVideo(file, customId, file.name);
          const sessionUrl = await videoStorage.getOrCreateVideoUrl(meta.id);
          newVideoItems.push({
            id: meta.id,
            title: file.name.replace(/\.[^/.]+$/, ''),
            url: sessionUrl || '',
            customMediaId: meta.id,
            customMediaName: file.name,
            sourceType: 'local',
          });
        }
      }

      if (newVideoItems.length > 0) {
        const updatedPlaylist = [...playlist, ...newVideoItems];
        onUpdateConfig({
          ...config,
          backgroundType: 'video',
          videoPlaylist: updatedPlaylist,
        });
        setMediaStatusMessage(
          `Added ${newVideoItems.length} video(s) to playlist queue!`
        );
      } else {
        setMediaErrorMessage('Please select valid MP4 or WebM video files.');
      }

      setTimeout(() => setMediaStatusMessage(null), 4500);
    } catch (err: any) {
      console.error('Failed to process video files', err);
      setMediaErrorMessage(`Failed to save video files: ${err?.message || 'Storage error'}`);
      setTimeout(() => setMediaErrorMessage(null), 4000);
    } finally {
      setIsProcessingMedia(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveCustomMedia = () => {
    const defaultPreset = START_BACKGROUND_PRESETS[0];
    onUpdateConfig({
      ...config,
      backgroundType: 'video',
      backgroundUrl: defaultPreset.url,
      backgroundPoster: defaultPreset.poster || defaultPreset.thumbnail,
      selectedPresetId: defaultPreset.id,
      customMediaId: undefined,
      customMediaName: undefined,
      videoPlaylist: DEFAULT_START_CONFIG.videoPlaylist,
      currentVideoIndex: 0,
    });
    setMediaStatusMessage('Reset background and video playlist to default.');
    setTimeout(() => setMediaStatusMessage(null), 3000);
  };

  const handleSaveAndClose = () => {
    if (customUrlInput.trim()) {
      handleAddCustomUrlToPlaylist(false);
    }
    onClose();
  };

  const handleAddQuickLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    let domain = '';
    try {
      domain = new URL(url).hostname;
    } catch {}

    const newLink: StartQuickLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle.trim(),
      url,
      icon: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : undefined,
      color: '#38bdf8',
    };

    onUpdateConfig({
      ...config,
      quickLinks: [...config.quickLinks, newLink],
    });
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleDeleteQuickLink = (id: string) => {
    onUpdateConfig({
      ...config,
      quickLinks: config.quickLinks.filter((l) => l.id !== id),
    });
  };

  const filteredPresets =
    selectedCategory === 'all'
      ? START_BACKGROUND_PRESETS
      : START_BACKGROUND_PRESETS.filter(
          (p) => p.category === selectedCategory || p.type === selectedCategory
        );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Start Page Customizer</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Studio Atelier
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Configure typography, multi-video sequence playlists, widgets, and cinematic filters
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800 bg-zinc-950/30 overflow-x-auto">
          {[
            { id: 'typography', label: 'Typography & Title', icon: <Type className="w-4 h-4" /> },
            {
              id: 'background',
              label: `Video Backgrounds & Playlist (${playlist.length})`,
              icon: <Film className="w-4 h-4" />,
            },
            { id: 'widgets', label: 'Widgets & Quick Links', icon: <LayoutGrid className="w-4 h-4" /> },
            { id: 'effects', label: 'Cinematic Filters & Effects', icon: <Sparkles className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-400 bg-zinc-900/90'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: TYPOGRAPHY & TITLE */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              {/* Title Text Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Main Headline / Title
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => handleUpdate('title', e.target.value)}
                    placeholder="e.g. Welcome Home, Explorer"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Dynamic Greeting Toggle & Name */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-white">Dynamic Time-of-Day Greeting</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Automatically prepend "Good morning", "Good afternoon", or "Good evening".
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={config.customGreetingName || ''}
                    onChange={(e) => handleUpdate('customGreetingName', e.target.value)}
                    placeholder="Name (e.g. Alex)"
                    className="w-32 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate('useDynamicGreeting', !config.useDynamicGreeting)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      config.useDynamicGreeting
                        ? 'bg-sky-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {config.useDynamicGreeting ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Subtitle Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Subtitle / Mission Statement
                </label>
                <textarea
                  value={config.subtitle}
                  onChange={(e) => handleUpdate('subtitle', e.target.value)}
                  rows={2}
                  placeholder="e.g. Your central command deck, creative atelier, and digital sanctuary."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              {/* Title Typography Font & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Title Font Family
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'display', label: 'Display Sans' },
                        { id: 'sans', label: 'Modern Sans' },
                        { id: 'serif', label: 'Editorial Serif' },
                        { id: 'mono', label: 'JetBrains Mono' },
                        { id: 'cyber', label: 'Cyber Bold' },
                      ] as { id: StartTitleFont; label: string }[]
                    ).map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => handleUpdate('titleFont', font.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          config.titleFont === font.id
                            ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Title Display Scale
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(
                      [
                        { id: 'md', label: 'Medium' },
                        { id: 'lg', label: 'Large' },
                        { id: 'xl', label: 'X-Large' },
                        { id: '2xl', label: 'Cinema' },
                      ] as { id: StartTitleSize; label: string }[]
                    ).map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => handleUpdate('titleSize', size.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          config.titleSize === size.id
                            ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                            : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title Gradient Style */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Title Color / Gradient Archetype
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {TITLE_GRADIENTS.map((grad) => (
                    <button
                      key={grad.id}
                      type="button"
                      onClick={() => handleUpdate('titleGradient', grad.value)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        config.titleGradient === grad.value
                          ? 'bg-zinc-800 border-sky-500 text-white ring-1 ring-sky-500'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full shrink-0 border border-white/20 shadow-sm"
                        style={{ backgroundColor: grad.preview }}
                      />
                      <span className="text-xs font-medium truncate">{grad.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Alignment & Shadow Glow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Text Alignment
                  </label>
                  <div className="flex gap-2">
                    {(
                      [
                        { id: 'left', label: 'Left', icon: <AlignLeft className="w-4 h-4" /> },
                        { id: 'center', label: 'Center', icon: <AlignCenter className="w-4 h-4" /> },
                        { id: 'right', label: 'Right', icon: <AlignRight className="w-4 h-4" /> },
                      ] as { id: StartTextAlignment; label: string; icon: React.ReactNode }[]
                    ).map((align) => (
                      <button
                        key={align.id}
                        type="button"
                        onClick={() => handleUpdate('textAlignment', align.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          config.textAlignment === align.id
                            ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {align.icon}
                        <span>{align.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Text Shadow & Glow
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(
                      [
                        { id: 'none', label: 'None' },
                        { id: 'subtle', label: 'Subtle' },
                        { id: 'glow', label: 'Glow' },
                        { id: 'cinema', label: 'Cinema' },
                      ] as { id: StartTextShadow; label: string }[]
                    ).map((shd) => (
                      <button
                        key={shd.id}
                        type="button"
                        onClick={() => handleUpdate('textShadow', shd.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          config.textShadow === shd.id
                            ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {shd.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WALLPAPERS & VIDEO SEQUENCE PLAYLIST */}
          {activeTab === 'background' && (
            <div className="space-y-6">
              {/* Media Status Messages */}
              {mediaStatusMessage && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{mediaStatusMessage}</span>
                </div>
              )}
              {mediaErrorMessage && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{mediaErrorMessage}</span>
                </div>
              )}

              {/* Active Background Info Card */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                    <Video className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Current Video Track:
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
                        Track {currentVideoIdx + 1} of {playlist.length}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white mt-0.5 truncate">
                      {playlist[currentVideoIdx]?.title || 'Ambient Video Background'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleRemoveCustomMedia}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
                    title="Reset playlist to factory default"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                </div>
              </div>

              {/* VIDEO PLAYLIST & SEQUENCE MANAGER */}
              <div className="space-y-4 p-5 rounded-3xl bg-zinc-950/80 border border-sky-500/20 shadow-xl shadow-sky-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      <ListVideo className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Video Queue & Sequential Playback</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {playlist.length} {playlist.length === 1 ? 'Video' : 'Videos'}
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Play ambient videos consecutively in sequence or loop single track
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddAllVideoPresetsToPlaylist}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-all cursor-pointer"
                      title="Add all curated ambient video loops to the queue"
                    >
                      <ListPlus className="w-3.5 h-3.5" />
                      <span>Add All Video Presets</span>
                    </button>
                  </div>
                </div>

                {/* Sequence & Looping Autoplay Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  {/* Auto Advance Next Toggle */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Auto-Play Next</p>
                      <p className="text-[10px] text-zinc-400">Advance when video finishes</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate('videoAutoplayNext', !Boolean(config.videoAutoplayNext))
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        Boolean(config.videoAutoplayNext)
                          ? 'bg-sky-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {Boolean(config.videoAutoplayNext) ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Loop Playlist Toggle */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Loop Playlist</p>
                      <p className="text-[10px] text-zinc-400">Restart from track 1 at end</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate('videoLoopPlaylist', !Boolean(config.videoLoopPlaylist))
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        Boolean(config.videoLoopPlaylist)
                          ? 'bg-sky-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {Boolean(config.videoLoopPlaylist) ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Single Video Loop Toggle */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Loop Current Video</p>
                      <p className="text-[10px] text-zinc-400">Continuous single repeat</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate('videoLoop', !Boolean(config.videoLoop))
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        Boolean(config.videoLoop)
                          ? 'bg-sky-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {Boolean(config.videoLoop) ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Shuffle Order Toggle */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-950/50 border border-zinc-800/80">
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Shuffle Sequence</p>
                      <p className="text-[10px] text-zinc-400">Random next track</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdate('videoShuffle', !Boolean(config.videoShuffle))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        Boolean(config.videoShuffle)
                          ? 'bg-sky-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {Boolean(config.videoShuffle) ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Playlist Video Items List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {playlist.map((item, index) => {
                    const isCurrent = index === currentVideoIdx;
                    return (
                      <div
                        key={item.id || `item-${index}`}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-sky-500/10 border-sky-500/50 ring-1 ring-sky-500/30'
                            : 'bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Track Number / Playing indicator */}
                          <button
                            type="button"
                            onClick={() => handlePlayVideoAtIndex(index)}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform cursor-pointer ${
                              isCurrent
                                ? 'bg-sky-500 text-zinc-950 font-bold shadow-md shadow-sky-500/30'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                            }`}
                            title={isCurrent ? 'Currently Playing' : 'Click to Play Now'}
                          >
                            {isCurrent ? (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <span className="text-xs font-mono font-bold">{index + 1}</span>
                            )}
                          </button>

                          {/* Thumbnail */}
                          {item.thumbnail || item.poster ? (
                            <img
                              src={item.thumbnail || item.poster}
                              alt=""
                              className="w-12 h-8 rounded-lg object-cover border border-white/10 shrink-0 bg-zinc-950"
                            />
                          ) : (
                            <div className="w-12 h-8 rounded-lg bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0">
                              <Film className="w-4 h-4 text-zinc-600" />
                            </div>
                          )}

                          {/* Title & Metadata */}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">
                              {item.title || 'Ambient Track'}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                              <span className="capitalize px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                                {item.sourceType || 'preset'}
                              </span>
                              {item.customMediaName && (
                                <span className="truncate max-w-[120px] text-zinc-500">
                                  {item.customMediaName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reorder and Delete controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isCurrent && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 mr-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                              Active
                            </span>
                          )}

                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveVideoInPlaylist(index, 'up')}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            title="Move track earlier in sequence"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={index === playlist.length - 1}
                            onClick={() => handleMoveVideoInPlaylist(index, 'down')}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            title="Move track later in sequence"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleRemoveVideoFromPlaylist(index)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remove from playlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Video File Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={handleDrop}
                className={`relative p-5 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-2.5 ${
                  isDraggingFile
                    ? 'border-sky-400 bg-sky-500/10'
                    : 'border-zinc-700/80 bg-zinc-950/60 hover:border-zinc-500'
                }`}
              >
                {isProcessingMedia ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                    <p className="text-xs font-semibold text-zinc-200">
                      Processing & storing video files in local vault...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-zinc-900 text-sky-400 border border-zinc-800">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        Upload Video(s) (Saved in Local Vault)
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Select <span className="text-sky-400 font-semibold">multiple MP4 or WebM video files</span> to build your ambient background queue.
                      </p>
                    </div>

                    <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-sky-500/20">
                      <Upload className="w-4 h-4" />
                      <span>Select Video Files</span>
                      <input
                        type="file"
                        multiple
                        accept="video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
              </div>

              {/* Add Custom Video / YouTube URL */}
              <div className="space-y-3 p-4 rounded-3xl bg-zinc-950 border border-zinc-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Add Video / YouTube Link to Playlist
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={customUrlTitle}
                    onChange={(e) => setCustomUrlTitle(e.target.value)}
                    placeholder="Optional Video Track Title (e.g. Sunset Drone Flight)"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <div className="relative">
                    <Link className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomUrlToPlaylist(false);
                        }
                      }}
                      placeholder="Paste MP4, WebM URL, or YouTube link..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAddCustomUrlToPlaylist(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
                    <span>Play Immediately</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddCustomUrlToPlaylist(false)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add to Playlist Queue</span>
                  </button>
                </div>
              </div>

              {/* Presets Gallery Filter & Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Curated Ambient Video Presets
                  </label>
                  <div className="flex items-center gap-1 text-[11px] overflow-x-auto">
                    {['all', 'space', 'nature', 'cyberpunk', 'minimal'].map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-zinc-800 text-sky-400 border border-sky-500/40'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredPresets.map((preset) => {
                    const isSelected =
                      config.backgroundUrl === preset.url ||
                      config.selectedPresetId === preset.id;

                    return (
                      <div
                        key={preset.id}
                        className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 aspect-video ${
                          isSelected
                            ? 'border-sky-400 ring-2 ring-sky-400/50 shadow-lg shadow-sky-500/20'
                            : 'border-zinc-800 hover:border-zinc-600 hover:scale-[1.02]'
                        }`}
                      >
                        <img
                          src={preset.thumbnail}
                          alt={preset.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2.5 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/90 text-zinc-950">
                              VIDEO
                            </span>
                            {isSelected && (
                              <div className="p-1 rounded-full bg-sky-500 text-zinc-950">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white leading-tight line-clamp-1 mb-1.5">
                              {preset.title}
                            </p>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleApplyPreset(preset)}
                                className="flex-1 px-2 py-1 rounded bg-white/20 hover:bg-sky-500 hover:text-zinc-950 text-[10px] font-bold text-white transition-colors cursor-pointer"
                              >
                                Play Now
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddPresetToPlaylist(preset);
                                }}
                                className="px-2 py-1 rounded bg-zinc-900/80 hover:bg-zinc-800 text-[10px] font-bold text-sky-400 border border-sky-500/30 transition-colors cursor-pointer"
                                title="Add to sequence queue"
                              >
                                + Queue
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WIDGETS & QUICK LINKS */}
          {activeTab === 'widgets' && (
            <div className="space-y-6">
              {/* Component Toggles */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Starter Page Components
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Clock Toggle */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Time & Date Clock</p>
                        <p className="text-[11px] text-zinc-400">Live ticking header clock</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdate('showClock', !config.showClock)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        config.showClock
                          ? 'bg-indigo-500 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {config.showClock ? 'Show' : 'Hide'}
                    </button>
                  </div>

                  {/* Search Bar Toggle */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Search className="w-4 h-4 text-sky-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Universal Search Bar</p>
                        <p className="text-[11px] text-zinc-400">Web search directly on start</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdate('showSearchBar', !config.showSearchBar)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        config.showSearchBar
                          ? 'bg-sky-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {config.showSearchBar ? 'Show' : 'Hide'}
                    </button>
                  </div>

                  {/* App Shortcuts */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <LayoutGrid className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Quick App Jump Tiles</p>
                        <p className="text-[11px] text-zinc-400">Dashboard, Writing, Showcase</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdate('showAppShortcuts', !config.showAppShortcuts)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        config.showAppShortcuts
                          ? 'bg-purple-500 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {config.showAppShortcuts ? 'Show' : 'Hide'}
                    </button>
                  </div>

                  {/* Daily Quote Toggle */}
                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Quote className="w-4 h-4 text-amber-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Inspirational Quote</p>
                        <p className="text-[11px] text-zinc-400">Curated daily thoughts</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdate('showDailyQuote', !config.showDailyQuote)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        config.showDailyQuote
                          ? 'bg-amber-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {config.showDailyQuote ? 'Show' : 'Hide'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Bookmarks Links */}
              <div className="space-y-3 p-4 rounded-3xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Quick Links Grid
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Fast-access icons rendered beneath the search bar
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdate('showQuickLinks', !config.showQuickLinks)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      config.showQuickLinks
                        ? 'bg-sky-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {config.showQuickLinks ? 'Visible' : 'Hidden'}
                  </button>
                </div>

                {/* Add new link form */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <input
                    type="text"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    placeholder="Link Name (e.g. Gmail)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  />
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="URL (e.g. mail.google.com)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuickLink}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* List of current quick links */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  {config.quickLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {link.icon ? (
                          <img
                            src={link.icon}
                            alt=""
                            className="w-4 h-4 rounded object-cover shrink-0"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-zinc-200 truncate">
                          {link.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuickLink(link.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DIM, BLUR & ATMOSPHERIC EFFECTS */}
          {activeTab === 'effects' && (
            <div className="space-y-6">
              {/* 1. 2.5D Parallax & Cyber Dust Particles Grid (Matching Showcase) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 2.5D Interactive Parallax Card */}
                <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Move className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                        2.5D Mouse Parallax
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.parallaxEnabled ?? true}
                        onChange={(e) => handleUpdate('parallaxEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500" />
                    </label>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Smooth dynamic multi-plane optical tracking reacting to your cursor coordinates.
                  </p>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[11px] text-zinc-400">Parallax Sensitivity</span>
                      <span className="text-sky-400 font-bold">{config.parallaxIntensity ?? 12}</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="30"
                      value={config.parallaxIntensity ?? 12}
                      onChange={(e) => handleUpdate('parallaxIntensity', Number(e.target.value))}
                      disabled={!(config.parallaxEnabled ?? true)}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Floating Cyber Dust Motes Card */}
                <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                        Cyber Dust Motes
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.ambientParticles ?? true}
                        onChange={(e) => handleUpdate('ambientParticles', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500" />
                    </label>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Atmospheric floating light motes drifting smoothly across the background canvas.
                  </p>

                  <div className="space-y-2 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Particle Archetype
                      </label>
                      <select
                        value={config.particleType || 'cyber-dust'}
                        onChange={(e) =>
                          handleUpdate('particleType', e.target.value as StartParticleType)
                        }
                        disabled={!(config.ambientParticles ?? true)}
                        className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white disabled:opacity-40"
                      >
                        <option value="cyber-dust">Cyber Dust Motes</option>
                        <option value="hexagons">Tactical Hexagons</option>
                        <option value="sparks">Glowing Sparks</option>
                        <option value="embers">Rising Embers</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                          <span>Density</span>
                          <span className="text-sky-400">{config.particleDensity ?? 35}</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={config.particleDensity ?? 35}
                          onChange={(e) => handleUpdate('particleDensity', Number(e.target.value))}
                          disabled={!(config.ambientParticles ?? true)}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-40"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                          <span>Speed</span>
                          <span className="text-sky-400">{config.particleSpeed ?? 2}x</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.5"
                          value={config.particleSpeed ?? 2}
                          onChange={(e) => handleUpdate('particleSpeed', Number(e.target.value))}
                          disabled={!(config.ambientParticles ?? true)}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-40"
                        />
                      </div>
                    </div>

                    {/* Particle Color Palette */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Particle Glow Color
                      </label>
                      <div className="flex items-center gap-2">
                        {[
                          { name: 'Cyan', color: '#38bdf8' },
                          { name: 'Amber', color: '#f59e0b' },
                          { name: 'Emerald', color: '#10b981' },
                          { name: 'Purple', color: '#a855f7' },
                          { name: 'White', color: '#ffffff' },
                        ].map((swatch) => (
                          <button
                            key={swatch.color}
                            type="button"
                            title={swatch.name}
                            onClick={() => handleUpdate('particleColor', swatch.color)}
                            disabled={!(config.ambientParticles ?? true)}
                            className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                              (config.particleColor || '#38bdf8').toLowerCase() === swatch.color.toLowerCase()
                                ? 'border-white scale-125 ring-2 ring-sky-400/50'
                                : 'border-zinc-700 opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: swatch.color }}
                          />
                        ))}
                        <input
                          type="color"
                          value={config.particleColor || '#38bdf8'}
                          onChange={(e) => handleUpdate('particleColor', e.target.value)}
                          disabled={!(config.ambientParticles ?? true)}
                          title="Custom Color"
                          className="w-6 h-6 rounded-lg bg-transparent cursor-pointer border-0 p-0 ml-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dim Slider */}
              <div className="space-y-2 p-4 rounded-3xl bg-zinc-950 border border-zinc-800">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Background Darkness / Dimming
                  </label>
                  <span className="text-xs font-bold text-sky-400 font-mono">
                    {config.overlayDim}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={config.overlayDim}
                  onChange={(e) => handleUpdate('overlayDim', Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <p className="text-[11px] text-zinc-500">
                  Darken bright backgrounds to maximize text contrast and readability.
                </p>
              </div>

              {/* Blur Slider */}
              <div className="space-y-2 p-4 rounded-3xl bg-zinc-950 border border-zinc-800">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Backdrop Frosted Blur Filter
                  </label>
                  <span className="text-xs font-bold text-sky-400 font-mono">
                    {config.overlayBlur}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="2"
                  value={config.overlayBlur}
                  onChange={(e) => handleUpdate('overlayBlur', Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <p className="text-[11px] text-zinc-500">
                  Adds a soft, frosted glass blur over the background ambient video.
                </p>
              </div>

              {/* Vignette Toggle */}
              <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Cinematic Vignette Shadow
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Darkens screen edges softly to create focal depth.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdate('overlayVignette', !config.overlayVignette)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    config.overlayVignette
                      ? 'bg-sky-500 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {config.overlayVignette ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 shrink-0">
          <button
            type="button"
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Factory Default</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex items-center gap-2 px-6 py-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 text-xs font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Save & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
