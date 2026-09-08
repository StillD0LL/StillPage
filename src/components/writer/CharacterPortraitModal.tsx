import React, { useState, useEffect, useRef } from 'react';
import {
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Smile,
  Check,
  X,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Copy,
} from 'lucide-react';
import {
  PRESET_AVATARS,
  CHARACTER_PRESET_EMOJIS,
  PresetAvatar,
} from '../../utils/characterDefaults';
import { optimizeLocalImage } from '../../utils/imageOptimizer';

interface CharacterPortraitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  currentAvatarCaption?: string;
  currentAvatarEmoji?: string;
  characterName: string;
  themeColor?: string;
  onSave: (data: {
    avatarUrl: string;
    avatarCaption?: string;
    avatarEmoji?: string;
  }) => void;
}

export const CharacterPortraitModal: React.FC<CharacterPortraitModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl = '',
  currentAvatarCaption = '',
  currentAvatarEmoji = '🧙‍♂️',
  characterName,
  themeColor = '#6366f1',
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'presets' | 'upload' | 'emoji'>('url');
  
  // URL Tab State
  const [imageUrl, setImageUrl] = useState(currentAvatarUrl);
  const [caption, setCaption] = useState(currentAvatarCaption);
  const [selectedEmoji, setSelectedEmoji] = useState(currentAvatarEmoji);
  
  // Image URL validation & loading state
  const [imgLoadStatus, setImgLoadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dragOver, setDragOver] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);
  const prevIsOpenRef = useRef(false);

  // Sync state ONLY when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setImageUrl(currentAvatarUrl || '');
      setCaption(currentAvatarCaption || '');
      setSelectedEmoji(currentAvatarEmoji || '🧙‍♂️');
      setImgLoadStatus(currentAvatarUrl ? 'loading' : 'idle');
      setUploadError(null);
      // If character already has an uploaded data image, open to the upload tab; otherwise URL tab
      setActiveTab(currentAvatarUrl?.startsWith('data:') ? 'upload' : 'url');
      
      // Auto-focus input after modal renders
      setTimeout(() => {
        if (urlInputRef.current) {
          urlInputRef.current.focus();
        }
      }, 100);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, currentAvatarUrl, currentAvatarCaption, currentAvatarEmoji]);

  if (!isOpen) return null;

  // Handle URL paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().startsWith('http')) {
          setImageUrl(text.trim());
          setImgLoadStatus('loading');
        }
      }
    } catch {
      // Ignore clipboard read errors in restricted contexts
    }
  };

  // Handle file drop / upload with image optimization
  const processFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Selected file is not an image. Please choose a JPG, PNG, WebP, GIF, or SVG file.');
      return;
    }

    setUploadError(null);
    setIsProcessingFile(true);

    try {
      // Optimize image for portrait presentation (resizes to max 1200x1600, preserving quality and keeping payload light)
      const { dataUrl } = await optimizeLocalImage(file, 1200, 1600, 0.85);
      setImageUrl(dataUrl);
      if (!caption.trim()) {
        setCaption(file.name.replace(/\.[^/.]+$/, ''));
      }
      setImgLoadStatus('success');
    } catch {
      // Fallback to direct FileReader if canvas optimization is not supported
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setImageUrl(dataUrl);
          if (!caption.trim()) {
            setCaption(file.name.replace(/\.[^/.]+$/, ''));
          }
          setImgLoadStatus('success');
        }
      };
      reader.onerror = () => {
        setUploadError('Failed to read image file from disk.');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyPreset = (preset: PresetAvatar) => {
    setImageUrl(preset.url);
    setSelectedEmoji(preset.emoji);
    setCaption(preset.caption);
    setImgLoadStatus('loading');
    setActiveTab('url');
  };

  const handleSave = () => {
    onSave({
      avatarUrl: imageUrl.trim(),
      avatarCaption: caption.trim(),
      avatarEmoji: selectedEmoji,
    });
    onClose();
  };

  const handleRemovePhoto = () => {
    setImageUrl('');
    setCaption('');
    setImgLoadStatus('idle');
    setUploadError(null);
  };

  const filteredPresets = selectedCategory === 'all'
    ? PRESET_AVATARS
    : PRESET_AVATARS.filter((p) => p.category === selectedCategory);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl bg-zinc-900 border border-zinc-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
      >
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: themeColor }}
            >
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Character Portrait & Wiki Photo
              </h3>
              <p className="text-xs text-zinc-400">
                Set a canonical illustration, web photo URL, or artwork for <span className="text-zinc-200 font-semibold">{characterName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-zinc-800 px-6 bg-zinc-950/40 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            id="tab-portrait-url"
            onClick={() => setActiveTab('url')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'url'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Image URL & Details</span>
          </button>

          <button
            type="button"
            id="tab-portrait-presets"
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curated Presets</span>
          </button>

          <button
            type="button"
            id="tab-portrait-upload"
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Upload File</span>
          </button>

          <button
            type="button"
            id="tab-portrait-emoji"
            onClick={() => setActiveTab('emoji')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'emoji'
                ? 'border-indigo-500 text-white font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smile className="w-3.5 h-3.5 text-rose-400" />
            <span>Fallback Emoji</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 scrollbar-thin">
          {/* TAB 1: IMAGE URL */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              {/* URL Input Form */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                    Direct Image URL
                  </span>
                  <span className="text-[11px] text-zinc-500 font-normal">
                    Supports JPG, PNG, WebP, GIF, SVG, Unsplash, Imgur, ArtStation
                  </span>
                </label>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    {imageUrl.startsWith('data:') ? (
                      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-zinc-950 border border-indigo-500/50 text-xs">
                        <div className="flex items-center gap-2 text-zinc-200">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-semibold">Local file uploaded</span>
                          <span className="text-[11px] text-zinc-500 hidden sm:inline">(ready to apply)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl('');
                            setImgLoadStatus('idle');
                          }}
                          className="text-[11px] text-zinc-400 hover:text-rose-400 transition-colors font-medium cursor-pointer"
                        >
                          Clear to enter URL
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          ref={urlInputRef}
                          type="url"
                          id="character-portrait-url-input"
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value);
                            setImgLoadStatus(e.target.value.trim() ? 'loading' : 'idle');
                          }}
                          placeholder="https://images.unsplash.com/... or https://i.imgur.com/..."
                          className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 focus:border-indigo-500 focus:outline-none text-zinc-200 text-xs font-mono tracking-tight"
                        />
                        {imageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('');
                              setImgLoadStatus('idle');
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                            title="Clear input"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {!imageUrl.startsWith('data:') && (
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-zinc-700/60 transition-colors cursor-pointer shrink-0"
                      title="Paste link from clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Paste URL</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Portrait Preview Card */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                <div className="sm:col-span-4 flex flex-col items-center justify-center">
                  <div className="w-36 aspect-3/4 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 relative shadow-lg flex items-center justify-center">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt="Character preview"
                          referrerPolicy="no-referrer"
                          onLoad={() => setImgLoadStatus('success')}
                          onError={() => setImgLoadStatus('error')}
                          className={`w-full h-full object-cover object-center transition-opacity duration-200 ${
                            imgLoadStatus === 'loading' ? 'opacity-30' : 'opacity-100'
                          }`}
                        />
                        {imgLoadStatus === 'loading' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                          </div>
                        )}
                        {imgLoadStatus === 'error' && (
                          <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-2 text-center gap-1">
                            <AlertCircle className="w-6 h-6 text-rose-400" />
                            <span className="text-[10px] text-rose-300 font-semibold leading-tight">
                              Could not load image. Check URL.
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center gap-1.5">
                        <span className="text-3xl">{selectedEmoji || '👤'}</span>
                        <span className="text-[11px] text-zinc-500 font-medium">No Image URL</span>
                      </div>
                    )}
                  </div>

                  {imageUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="mt-2.5 text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                <div className="sm:col-span-8 flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">
                        Portrait Subtitle / Caption
                      </label>
                      <input
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="e.g. Canonical profile illustration • Grand Archive Commission"
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 focus:border-indigo-500 focus:outline-none text-zinc-200 text-xs"
                      />
                      <p className="text-[10px] text-zinc-500 mt-1 italic">
                        Displayed as the fine-print caption below the Wikipedia infobox photo
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                      <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tip for high quality portraits</span>
                      </div>
                      <p>
                        Portrait images with a vertical 3:4 or 4:5 aspect ratio work best in the Wikipedia infobox.
                      </p>
                    </div>
                  </div>

                  {/* Quick sample URLs to try */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1.5">
                      Quick Sample Presets
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {PRESET_AVATARS.slice(0, 4).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleApplyPreset(p)}
                          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <span>{p.emoji}</span>
                          <span className="truncate max-w-[90px]">{p.label.split('/')[0].trim()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURATED PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'All Presets' },
                  { id: 'fantasy', label: 'Fantasy & Magic' },
                  { id: 'scifi', label: 'Sci-Fi & Cyber' },
                  { id: 'modern', label: 'Modern & Noir' },
                  { id: 'royalty', label: 'Royalty & Leaders' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Preset Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                {filteredPresets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2.5 rounded-2xl bg-zinc-950/80 border transition-all cursor-pointer group/card flex flex-col justify-between space-y-2 ${
                      imageUrl === preset.url
                        ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="aspect-3/4 rounded-xl overflow-hidden bg-zinc-900 relative">
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover/card:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1.5 right-1.5 text-base bg-zinc-950/80 rounded-md px-1 py-0.5 backdrop-blur-xs">
                        {preset.emoji}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-zinc-200 group-hover/card:text-indigo-300 truncate">
                        {preset.label}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {preset.caption}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* If an image is loaded (either newly uploaded or previously set) */}
              {imageUrl && (imageUrl.startsWith('data:') || imgLoadStatus === 'success') ? (
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                    {/* Thumbnail Preview */}
                    <div className="w-32 aspect-3/4 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 relative shadow-md shrink-0 flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt="Uploaded portrait preview"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Details, Caption & Action Buttons */}
                    <div className="flex-1 min-w-0 space-y-3 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold text-white">Image Ready to Apply</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        >
                          Change Image File
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-300 block mb-1">
                          Portrait Caption / Source
                        </label>
                        <input
                          type="text"
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="e.g. Official character illustration"
                          className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 focus:border-indigo-500 focus:outline-none text-zinc-200 text-xs"
                        />
                        <p className="text-[10px] text-zinc-500 mt-1">
                          Shown as the subtitle caption below the character photo in the Wikipedia infobox.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleSave}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply to Character Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/30 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dropzone when no image is loaded */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-10 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer ${
                    dragOver
                      ? 'border-indigo-500 bg-indigo-950/20'
                      : 'border-zinc-700/80 hover:border-indigo-500 bg-zinc-950/60 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    {isProcessingFile ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100">
                      {isProcessingFile
                        ? 'Optimizing and loading illustration...'
                        : 'Drop your character illustration here'}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      or click anywhere to browse from your computer (JPG, PNG, WebP, GIF, SVG)
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isProcessingFile}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    {isProcessingFile ? 'Loading...' : 'Choose File'}
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FALLBACK EMOJI */}
          {activeTab === 'emoji' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400">
                Choose an icon or emoji avatar that represents this character when no portrait illustration is available or in compact sidebar list views:
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                {CHARACTER_PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`h-11 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                      selectedEmoji === emoji
                        ? 'border-indigo-500 bg-indigo-600/20 ring-2 ring-indigo-500/40 scale-105'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {imageUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear Photo
              </button>
            )}
            <button
              type="button"
              id="save-portrait-btn"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Portrait</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
