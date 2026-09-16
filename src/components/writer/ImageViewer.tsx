import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  Trash2,
  Maximize2,
  Folder,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { WritingDocument, WritingFolder } from '../../types';

interface ImageViewerProps {
  document: WritingDocument;
  folders: WritingFolder[];
  onUpdateDocument: (id: string, updates: Partial<WritingDocument>) => void;
  onDeleteDocument: (id: string) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  document: doc,
  folders,
  onUpdateDocument,
  onDeleteDocument,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(doc.title);

  const imageUrl = doc.imageUrl || doc.content;
  const folder = folders.find((f) => f.id === doc.folderId);

  const handleCopy = () => {
    if (!imageUrl) return;
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = window.document.createElement('a');
    a.href = imageUrl;
    a.download = doc.title || 'image';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto custom-scrollbar">
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={() => {
                  onUpdateDocument(doc.id, { title: titleInput.trim() || doc.title });
                  setIsEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onUpdateDocument(doc.id, { title: titleInput.trim() || doc.title });
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="bg-zinc-900 border border-purple-500 rounded px-2 py-0.5 text-sm text-zinc-100 font-bold outline-none"
              />
            ) : (
              <h1
                onDoubleClick={() => setIsEditingTitle(true)}
                className="text-base font-bold text-zinc-100 cursor-text hover:text-purple-300 transition-colors flex items-center gap-2"
                title="Double click to rename"
              >
                <span>{doc.title}</span>
                <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">
                  Directory Image
                </span>
              </h1>
            )}
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
              {folder && (
                <span className="flex items-center gap-1">
                  <Folder className="w-3 h-3 text-amber-400" />
                  {folder.name}
                </span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(doc.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
            title="Copy Image URL / Source"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy URL'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
            title="Download Image"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Delete this image from directory?')) {
                onDeleteDocument(doc.id);
              }
            }}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 border border-zinc-800 transition-colors"
            title="Delete Image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Display Area */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full flex flex-col items-center">
          <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-zinc-800 shadow-2xl p-2 max-h-[65vh] flex items-center justify-center group">
            <img
              src={imageUrl}
              alt={doc.title}
              className="max-w-full max-h-[60vh] object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Meta Info Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 px-6 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-400">
            {doc.imageDimensions && (
              <div>
                <span className="text-zinc-500">Dimensions: </span>
                <span className="text-zinc-200 font-mono">
                  {doc.imageDimensions.width} × {doc.imageDimensions.height} px
                </span>
              </div>
            )}
            {doc.imageSize && (
              <div>
                <span className="text-zinc-500">File Size: </span>
                <span className="text-zinc-200 font-mono">
                  {(doc.imageSize / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
            <div>
              <span className="text-zinc-500">Format: </span>
              <span className="text-zinc-200 uppercase font-mono">
                {imageUrl?.startsWith('data:image/svg')
                  ? 'SVG'
                  : imageUrl?.startsWith('data:image/webp')
                  ? 'WEBP'
                  : imageUrl?.startsWith('data:image/png')
                  ? 'PNG'
                  : imageUrl?.startsWith('data:image/jpeg')
                  ? 'JPEG'
                  : 'Web Image'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
