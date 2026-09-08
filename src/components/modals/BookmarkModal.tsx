import React, { useState, useEffect } from 'react';
import { X, Globe, Tag, Image, Plus, Check, Trash2, Folder, Sparkles, EyeOff, Eye, ImageOff } from 'lucide-react';
import { Bookmark, BookmarkCategory } from '../../types';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkToEdit?: Bookmark | null;
  categories: BookmarkCategory[];
  onSave: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
}

const PRESET_THUMBNAILS = [
  'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
];

const SUGGESTED_TAGS = ['Dev', 'AI', 'Design', 'Work', 'Productivity', 'News', 'Tools', 'Media', 'Social', 'Docs'];

export const BookmarkModal: React.FC<BookmarkModalProps> = ({
  isOpen,
  onClose,
  bookmarkToEdit,
  categories,
  onSave,
  onDelete,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('cat-dev');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [hideThumbnail, setHideThumbnail] = useState(false);
  const [icon, setIcon] = useState('');
  const [pinned, setPinned] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (bookmarkToEdit) {
      setUrl(bookmarkToEdit.url);
      setTitle(bookmarkToEdit.title);
      setCategory(bookmarkToEdit.category);
      setDescription(bookmarkToEdit.description || '');
      setTags(bookmarkToEdit.tags || []);
      setThumbnail(bookmarkToEdit.thumbnail || '');
      setHideThumbnail(bookmarkToEdit.hideThumbnail || false);
      setIcon(bookmarkToEdit.icon || '');
      setPinned(bookmarkToEdit.pinned || false);
      setHidden(bookmarkToEdit.hidden || false);
    } else {
      setUrl('');
      setTitle('');
      setCategory(categories[1]?.id || 'cat-dev');
      setDescription('');
      setTags(['Dev']);
      setThumbnail(PRESET_THUMBNAILS[0]);
      setHideThumbnail(false);
      setIcon('');
      setPinned(false);
      setHidden(false);
    }
  }, [bookmarkToEdit, isOpen, categories]);

  if (!isOpen) return null;

  // Auto-extract favicon & domain when URL changes
  const handleUrlBlur = () => {
    if (!url.trim()) return;
    try {
      let fullUrl = url.trim();
      if (!/^https?:\/\//i.test(fullUrl)) {
        fullUrl = `https://${fullUrl}`;
        setUrl(fullUrl);
      }
      const parsed = new URL(fullUrl);
      const domain = parsed.hostname;

      if (!title) {
        const cleanName = domain.replace(/^www\./, '').split('.')[0];
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }

      if (!icon) {
        setIcon(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
      }
    } catch {
      // ignore invalid url
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    let fullUrl = url.trim();
    if (!/^https?:\/\//i.test(fullUrl)) {
      fullUrl = `https://${fullUrl}`;
    }

    let favIcon = icon;
    if (!favIcon) {
      try {
        const domain = new URL(fullUrl).hostname;
        favIcon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch {
        favIcon = '';
      }
    }

    onSave(
      {
        url: fullUrl,
        title: title.trim(),
        category,
        description: description.trim(),
        tags,
        thumbnail: thumbnail || undefined,
        hideThumbnail,
        hidden,
        icon: favIcon,
        pinned,
        order: bookmarkToEdit?.order ?? Date.now(),
      },
      bookmarkToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              {bookmarkToEdit ? 'Edit Bookmark' : 'Add New Bookmark'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Website URL *
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://github.com or domain.com..."
              className="w-full bg-zinc-800 border border-zinc-700 text-sm text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500"
              autoFocus
            />
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GitHub"
                className="w-full bg-zinc-800 border border-zinc-700 text-sm text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-sm text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories
                  .filter((c) => c.id !== 'cat-all')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief note or description about this link..."
              className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Tags & Labels
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-800/80 border border-zinc-700 rounded-xl mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 text-xs font-medium bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-300"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Add tag (press Enter)..."
                className="bg-transparent text-xs text-white focus:outline-none flex-1 min-w-[120px] px-1"
              />
            </div>

            {/* Suggested Tag Chips */}
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[11px] text-zinc-500 mr-1">Suggestions:</span>
              {SUGGESTED_TAGS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleAddTag(st)}
                  className="text-[10px] text-zinc-400 hover:text-indigo-300 bg-zinc-800/60 hover:bg-zinc-800 px-1.5 py-0.5 rounded transition-colors"
                >
                  +{st}
                </button>
              ))}
            </div>
          </div>

          {/* Thumbnail Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Card Thumbnail Preview
              </label>
              <label className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideThumbnail}
                  onChange={(e) => setHideThumbnail(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-indigo-600 bg-zinc-800 border-zinc-700 focus:ring-indigo-500"
                />
                <span className="flex items-center gap-1">
                  <ImageOff className="w-3 h-3 text-amber-400" />
                  <span>Hide thumbnail on card</span>
                </span>
              </label>
            </div>

            {!hideThumbnail ? (
              <>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRESET_THUMBNAILS.slice(0, 4).map((thumb, i) => (
                    <div
                      key={i}
                      onClick={() => setThumbnail(thumb)}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        thumbnail === thumb ? 'border-indigo-500 ring-2 ring-indigo-500/40' : 'border-zinc-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                      {thumbnail === thumb && (
                        <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="Or paste custom thumbnail image URL..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
                />
              </>
            ) : (
              <div className="p-3 rounded-xl bg-zinc-800/50 border border-dashed border-zinc-700 text-xs text-zinc-400 flex items-center gap-2">
                <ImageOff className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Thumbnail preview is hidden for this bookmark. It will display a sleek domain icon instead.</span>
              </div>
            )}
          </div>

          {/* Visibility & Pin Settings */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-2">
            {/* Pin Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinned-checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-zinc-800 border-zinc-700 focus:ring-indigo-500"
              />
              <label htmlFor="pinned-checkbox" className="text-xs font-medium text-zinc-300 cursor-pointer">
                Pin to top of list
              </label>
            </div>

            {/* Hidden Bookmark Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hidden-checkbox"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-zinc-800 border-zinc-700 focus:ring-amber-500"
              />
              <label htmlFor="hidden-checkbox" className="text-xs font-medium text-amber-300/90 hover:text-amber-200 cursor-pointer flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Mark as hidden (only visible when "Show Hidden" is toggled ON)</span>
              </label>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            {bookmarkToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(bookmarkToEdit.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {bookmarkToEdit ? 'Save Changes' : 'Add Bookmark'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
