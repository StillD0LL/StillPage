import React from 'react';
import { X, ExternalLink, Clock, User, Share2, BookOpen } from 'lucide-react';
import { RSSItem } from '../../types';

interface ArticleReaderModalProps {
  item: RSSItem | null;
  onClose: () => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {item.feedTitle || 'News Article'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Article Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {item.thumbnail && (
            <div className="w-full h-56 rounded-xl overflow-hidden bg-zinc-800">
              <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <h2 className="text-xl font-bold text-white leading-snug">{item.title}</h2>

          <div className="flex items-center gap-3 text-xs text-zinc-400 py-1 border-b border-zinc-800">
            {item.pubDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(item.pubDate).toLocaleString()}</span>
              </span>
            )}
            {item.author && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>{item.author}</span>
              </span>
            )}
          </div>

          <div className="text-sm text-zinc-300 leading-relaxed space-y-3 font-sans">
            <p>{item.contentSnippet || 'Click below to read full article on source site.'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
          >
            Close
          </button>

          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>Read Original Article</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
