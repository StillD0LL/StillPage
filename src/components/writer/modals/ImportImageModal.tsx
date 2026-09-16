import React, { useState, useRef } from 'react';
import {
  Upload,
  Link,
  Image as ImageIcon,
  X,
  Folder,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { WritingFolder } from '../../../types';
import { optimizeLocalImage } from '../../../utils/imageOptimizer';

interface ImportImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: WritingFolder[];
  activeFolderId?: string | null;
  initialFolderId?: string | null;
  onImportSuccess?: (imageData: {
    title: string;
    imageUrl: string;
    imageSize?: number;
    imageDimensions?: { width: number; height: number };
    folderId?: string | null;
  }) => void;
  onImportImage?: (imageData: {
    title: string;
    imageUrl: string;
    imageSize?: number;
    imageDimensions?: { width: number; height: number };
    folderId?: string | null;
  }) => void;
}

export const ImportImageModal: React.FC<ImportImageModalProps> = ({
  isOpen,
  onClose,
  folders,
  activeFolderId,
  initialFolderId,
  onImportSuccess,
  onImportImage,
}) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [title, setTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    initialFolderId !== undefined ? initialFolderId : activeFolderId || null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<number | undefined>(undefined);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP, SVG, GIF)');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // Optimize image for local storage footprint
      const optimized = await optimizeLocalImage(file, 1920, 1080, 0.85);

      // Measure dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      };
      img.src = optimized.dataUrl;

      setPreviewUrl(optimized.dataUrl);
      setImageSize(optimized.size);
      if (!title) {
        // Strip extension for cleaner title
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setTitle(cleanName || 'Image');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    setErrorMessage(null);
    if (!url.trim()) {
      setPreviewUrl(null);
      return;
    }

    // Try loading image to verify URL
    const img = new Image();
    img.onload = () => {
      setPreviewUrl(url.trim());
      setImageDimensions({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      if (!title) {
        try {
          const pathname = new URL(url.trim()).pathname;
          const fileName = pathname.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Web Image';
          setTitle(decodeURIComponent(fileName));
        } catch {
          setTitle('Web Image');
        }
      }
    };
    img.onerror = () => {
      setErrorMessage('Could not load image from this URL. Please verify the link.');
      setPreviewUrl(null);
    };
    img.src = url.trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) {
      setErrorMessage('Please provide an image first');
      return;
    }

    const finalTitle = title.trim() || 'Untitled Image';
    const callback = onImportSuccess || onImportImage;
    if (callback) {
      callback({
        title: finalTitle,
        imageUrl: previewUrl,
        imageSize,
        imageDimensions,
        folderId: selectedFolderId,
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setUrlInput('');
    setPreviewUrl(null);
    setImageSize(undefined);
    setImageDimensions(undefined);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Import Image to Directory</h3>
              <p className="text-xs text-zinc-400">Add local or web images into your workspace directory</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => {
              setTab('upload');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              tab === 'upload'
                ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload from Computer</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('url');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              tab === 'url'
                ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Import from URL</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* UPLOAD TAB */}
          {tab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDraggingOver
                    ? 'border-purple-500 bg-purple-950/40'
                    : previewUrl
                    ? 'border-zinc-700 bg-zinc-950/50'
                    : 'border-zinc-700 hover:border-purple-500/70 bg-zinc-950/30'
                }`}
              >
                {isProcessing ? (
                  <div className="py-4 flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-purple-300">Optimizing image...</span>
                  </div>
                ) : previewUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-40 rounded-lg object-contain border border-zinc-800 shadow"
                    />
                    <span className="text-[11px] text-purple-400 font-medium hover:underline">
                      Click to choose a different image
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-zinc-200">
                      Drag and drop image here, or <span className="text-purple-400 underline">browse</span>
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Supports PNG, JPG, WEBP, GIF, SVG (auto-optimized for workspace)
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* URL TAB */}
          {tab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Image Web Address (URL)</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-purple-500"
                />
              </div>

              {previewUrl && (
                <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-40 rounded-lg object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Error notice */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* File Name / Title */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">File Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. World Map, Character Portrait, Architecture Sketch"
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-purple-500"
            />
          </div>

          {/* Destination Folder */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Directory Destination Folder</label>
            <div className="flex items-center gap-2">
              <select
                value={selectedFolderId || ''}
                onChange={(e) => setSelectedFolderId(e.target.value || null)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-purple-500"
              >
                <option value="">📁 Root (Project Level)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Meta Info Preview */}
          {(imageSize || imageDimensions) && (
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60">
              {imageDimensions && (
                <span>Dimensions: {imageDimensions.width} × {imageDimensions.height}px</span>
              )}
              {imageSize && (
                <span>Size: {(imageSize / 1024).toFixed(1)} KB</span>
              )}
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!previewUrl || isProcessing}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
            >
              <Check className="w-4 h-4" />
              <span>Import to Directory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
