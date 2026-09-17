import React, { useState, useRef } from 'react';
import {
  Film,
  Upload,
  Link,
  HardDrive,
  Camera,
  Sparkles,
  X,
  Check,
  Globe,
  FileVideo,
  Play,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { PhotoStyle, PhotoAspectRatio } from '../../types/space';
import { mediaStorage } from '../../services/mediaStorage';
import { uiSound } from '../../services/uiSound';
import { CURATED_DIRECT_VIDEOS, CURATED_VIDEOS, CURATED_PHOTOS } from '../../utils/spaceDefaults';
import { compressImageFile } from '../../utils/imageCompressor';

interface SpaceMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (videoData: {
    videoUrl: string;
    sourceType: 'youtube' | 'direct';
    title?: string;
    isLocal?: boolean;
    localVideoId?: string;
    localFileName?: string;
    localFileSize?: number;
  }) => void;
  onAddImage: (imageData: {
    imageUrl: string;
    caption?: string;
    photoStyle: PhotoStyle;
    aspectRatio: PhotoAspectRatio;
  }) => void;
}

type MediaTab = 'local-video' | 'video-url' | 'photo';

export const SpaceMediaModal: React.FC<SpaceMediaModalProps> = ({
  isOpen,
  onClose,
  onAddVideo,
  onAddImage,
}) => {
  const [activeTab, setActiveTab] = useState<MediaTab>('local-video');

  // Video by URL state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  // Local Video state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo state
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoStyle, setPhotoStyle] = useState<PhotoStyle>('media-player');
  const [photoRatio, setPhotoRatio] = useState<PhotoAspectRatio>('16:9');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Detect YouTube vs Direct Video
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // 1. Submit Local Video
  const handleLocalVideoUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessingVideo(true);
      setVideoError(null);
      uiSound.playPlace();

      const { id, url, size } = await mediaStorage.saveLocalVideo(selectedFile);
      const cleanTitle =
        videoTitle.trim() ||
        selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      onAddVideo({
        videoUrl: url,
        sourceType: 'direct',
        title: cleanTitle,
        isLocal: true,
        localVideoId: id,
        localFileName: selectedFile.name,
        localFileSize: size,
      });

      setSelectedFile(null);
      setVideoTitle('');
      onClose();
    } catch (err: any) {
      console.error('Failed to save local video:', err);
      setVideoError(err.message || 'Failed to process local video file');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // 2. Submit Video by URL / Direct Web Address
  const handleAddVideoUrl = () => {
    if (!videoUrl.trim()) return;
    uiSound.playPlace();

    const trimmed = videoUrl.trim();
    const isYt = isYouTubeUrl(trimmed);
    const defaultTitle = isYt ? 'YouTube Video Stream' : 'Direct Web Video Stream';

    onAddVideo({
      videoUrl: trimmed,
      sourceType: isYt ? 'youtube' : 'direct',
      title: videoTitle.trim() || defaultTitle,
      isLocal: false,
    });

    setVideoUrl('');
    setVideoTitle('');
    onClose();
  };

  // 3. Submit Photo
  const handleAddPhoto = () => {
    if (!photoUrl.trim()) return;
    uiSound.playPlace();

    onAddImage({
      imageUrl: photoUrl.trim(),
      caption: photoCaption.trim() || undefined,
      photoStyle,
      aspectRatio: photoRatio,
    });

    setPhotoUrl('');
    setPhotoCaption('');
    onClose();
  };

  // Handle Photo local file upload
  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingPhoto(true);
      const compressed = await compressImageFile(file, 1400, 1400, 0.88);
      if (compressed) {
        uiSound.playPlace();
        onAddImage({
          imageUrl: compressed,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          photoStyle,
          aspectRatio: photoRatio,
        });
        onClose();
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const res = ev.target?.result as string;
        if (res) {
          uiSound.playPlace();
          onAddImage({
            imageUrl: res,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            photoStyle,
            aspectRatio: photoRatio,
          });
          onClose();
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Add Media Element</h2>
              <p className="text-xs text-zinc-400">
                Load local offline videos, direct web video streams, or photos with custom frames
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/30 px-5 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('local-video')}
            className={`pb-2.5 px-3 font-medium cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'local-video'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Local Video (Offline)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('video-url')}
            className={`pb-2.5 px-3 font-medium cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'video-url'
                ? 'border-sky-400 text-sky-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Video by URL / Web Address
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`pb-2.5 px-3 font-medium cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'photo'
                ? 'border-pink-400 text-pink-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Photo / Custom Frame
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {/* TAB 1: LOCAL VIDEO */}
          {activeTab === 'local-video' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    setVideoTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                  }
                }}
              />

              {/* Upload Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2.5 ${
                  selectedFile
                    ? 'border-amber-500/60 bg-amber-950/20 text-amber-200'
                    : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 text-zinc-400'
                }`}
              >
                <div className="p-3 rounded-full bg-amber-500/10 text-amber-400">
                  <Upload className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="font-semibold text-sm text-zinc-100">{selectedFile.name}</p>
                    <p className="text-xs text-amber-400/90 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Click to choose different file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-sm text-zinc-200">
                      Click to choose or drag local video file
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Supported formats: MP4, WebM, OGG, MOV (Stored securely in browser IndexedDB)
                    </p>
                  </div>
                )}
              </div>

              {videoError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{videoError}</span>
                </div>
              )}

              {/* Optional Title */}
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">
                  Player Title (Optional)
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. My Recording, Sunset Timelapse"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
                <p className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  Zero-Bandwidth Offline Storage
                </p>
                <p>
                  Local videos are persisted in your device's browser storage (IndexedDB). They load
                  instantly without any internet connection, buffering, or video ads.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedFile || isProcessingVideo}
                  onClick={handleLocalVideoUpload}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-amber-600/20"
                >
                  {isProcessingVideo ? 'Saving to Storage...' : 'Place Video on Canvas'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VIDEO BY URL / DIRECT ADDRESS */}
          {activeTab === 'video-url' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">
                  Video Address or Website URL
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://.../video.mp4 or https://youtube.com/watch?v=..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-sky-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Supports direct web video files (.mp4, .webm, stream links) as well as YouTube links & shorts.
                </p>
              </div>

              {videoUrl.trim() && (
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Detected Source:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      isYouTubeUrl(videoUrl)
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isYouTubeUrl(videoUrl) ? 'YouTube Video' : 'Direct MP4 / Web Stream'}
                  </span>
                </div>
              )}

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">
                  Player Title (Optional)
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Ambient Rain Stream, Nature Background"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Curated Direct Video Addresses (Ad-Free MP4) */}
              <div>
                <span className="text-xs text-emerald-400 font-medium block mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Curated Direct Video Addresses (Ready to Play):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {CURATED_DIRECT_VIDEOS.map((vid) => (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => {
                        uiSound.playClick();
                        setVideoUrl(vid.url);
                        setVideoTitle(vid.title);
                      }}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left text-[11px] text-zinc-200 hover:border-emerald-500/50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{vid.title}</span>
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded">
                        MP4
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!videoUrl.trim()}
                  onClick={handleAddVideoUrl}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-sky-600/20"
                >
                  Place Video on Canvas
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PHOTO / CUSTOM FRAME */}
          {activeTab === 'photo' && (
            <div className="space-y-4">
              <input
                ref={photoFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoFileUpload}
              />

              {/* Photo Source */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 block font-medium">Photo Image Source</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer border border-zinc-700 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload File
                  </button>
                </div>
              </div>

              {/* Frame Style Selector */}
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 font-medium">
                  Photo Frame Design
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        id: 'media-player',
                        title: 'Media Frame (Video Match)',
                        desc: 'Matches the sleek dark video player container',
                      },
                      {
                        id: 'polaroid',
                        title: 'Polaroid Frame',
                        desc: 'Classic white border with bottom signature chin',
                      },
                      {
                        id: 'classic',
                        title: 'Classic White Border',
                        desc: 'Fine art gallery border with crisp matte',
                      },
                      {
                        id: 'film',
                        title: '35mm Film Strip',
                        desc: 'Cinematic film frame with sprocket holes',
                      },
                      {
                        id: 'minimal',
                        title: 'Frameless Minimal',
                        desc: 'Clean floating edge-to-edge photograph',
                      },
                    ] as Array<{ id: PhotoStyle; title: string; desc: string }>
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        uiSound.playClick();
                        setPhotoStyle(st.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        photoStyle === st.id
                          ? 'bg-pink-600/20 border-pink-500 text-pink-200 ring-1 ring-pink-500/40'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <p className="text-xs font-semibold text-zinc-200">{st.title}</p>
                      <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{st.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['16:9', '4:3', '3:2', '1:1'] as PhotoAspectRatio[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        uiSound.playClick();
                        setPhotoRatio(r);
                      }}
                      className={`py-1 rounded-lg text-xs font-mono cursor-pointer border ${
                        photoRatio === r
                          ? 'bg-pink-600 text-white font-bold border-pink-500'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Caption (Optional)</label>
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="e.g. Tokyo Twilight • 2024"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Presets */}
              <div>
                <span className="text-xs text-zinc-400 block mb-1 font-medium">Quick Photo Presets:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {CURATED_PHOTOS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        uiSound.playClick();
                        setPhotoUrl(p.url);
                        setPhotoCaption(p.caption);
                      }}
                      className="aspect-square rounded-xl overflow-hidden border border-zinc-800 hover:border-pink-500 cursor-pointer transition-all"
                    >
                      <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!photoUrl.trim() || isProcessingPhoto}
                  onClick={handleAddPhoto}
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-pink-600/20"
                >
                  Place Photo on Canvas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
