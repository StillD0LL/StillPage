import React, { useState, useEffect } from 'react';
import {
  Rss,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react';
import { RSSFeed, RSSItem, WidgetSize } from '../../types';
import { fetchRSSFeed } from '../../services/rssService';

interface RssFeedWidgetProps {
  size: WidgetSize;
  feeds: RSSFeed[];
  isCleanMode?: boolean;
  onAddFeed: (feed: Omit<RSSFeed, 'id'>) => void;
  onDeleteFeed: (id: string) => void;
  onOpenArticleReader?: (item: RSSItem) => void;
}

export const RssFeedWidget: React.FC<RssFeedWidgetProps> = ({
  size,
  feeds,
  isCleanMode = false,
  onAddFeed,
  onDeleteFeed,
  onOpenArticleReader,
}) => {
  const [activeFeedId, setActiveFeedId] = useState<string>(feeds[0]?.id || '');
  const [articles, setArticles] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [newFeedTitle, setNewFeedTitle] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Keep active feed in sync when feeds array updates
  useEffect(() => {
    if (feeds.length > 0) {
      if (!feeds.some((f) => f.id === activeFeedId)) {
        setActiveFeedId(feeds[0].id);
      }
    } else {
      setActiveFeedId('');
      setArticles([]);
    }
  }, [feeds, activeFeedId]);

  const activeFeed = feeds.find((f) => f.id === activeFeedId) || feeds[0];

  const loadFeed = async (feedUrl: string, feedTitle: string) => {
    if (!feedUrl) {
      setArticles([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await fetchRSSFeed(feedUrl, feedTitle);
      setArticles(items);
    } catch (err: any) {
      console.error('Error fetching RSS:', err);
      setError('Unable to load feed articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeFeed?.url) {
      loadFeed(activeFeed.url, activeFeed.title);
    } else {
      setArticles([]);
    }
  }, [activeFeedId, activeFeed?.url, activeFeed?.title]);

  const handleAddFeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedUrl.trim() || !newFeedTitle.trim()) return;

    const newId = `feed-${Date.now()}`;
    onAddFeed({
      title: newFeedTitle.trim(),
      url: newFeedUrl.trim(),
      category: 'Custom',
      custom: true,
    });
    setActiveFeedId(newId);

    setNewFeedTitle('');
    setNewFeedUrl('');
    setShowAddFeed(false);
  };

  const filteredArticles = articles.filter((art) => {
    if (!searchFilter.trim()) return true;
    return (
      art.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (art.contentSnippet && art.contentSnippet.toLowerCase().includes(searchFilter.toLowerCase()))
    );
  });

  const isCompact = size === '1x1';

  return (
    <div className="h-full flex flex-col justify-between space-y-3">
      {/* Top Bar: Feed Selector Tabs & Refresh */}
      <div className="flex items-center justify-between gap-2 min-h-[28px]">
        {/* Horizontal Feed Tabs */}
        {feeds.length > 0 ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-[calc(100%-80px)] scrollbar-none">
            {feeds.map((feed) => (
              <button
                key={feed.id}
                type="button"
                onClick={() => setActiveFeedId(feed.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                  activeFeedId === feed.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {feed.title}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <Rss className="w-3.5 h-3.5 text-indigo-400" />
            <span>RSS Feeds</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          {!isCleanMode && (
            <button
              type="button"
              onClick={() => setShowAddFeed(!showAddFeed)}
              className="p-1 text-zinc-400 hover:text-indigo-300 rounded hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Add custom RSS feed"
            >
              <Plus className="w-4 h-4" />
              {feeds.length === 0 && <span className="text-[11px] font-medium pr-1">Add Feed</span>}
            </button>
          )}
          {feeds.length > 0 && (
            <button
              type="button"
              onClick={() => activeFeed && loadFeed(activeFeed.url, activeFeed.title)}
              disabled={loading}
              className={`p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${
                loading ? 'animate-spin' : ''
              }`}
              title="Refresh feed"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Add Custom Feed Drawer */}
      {!isCleanMode && showAddFeed && (
        <form
          onSubmit={handleAddFeedSubmit}
          className="p-3 rounded-xl bg-zinc-800/90 border border-zinc-700/80 space-y-2 animate-in fade-in"
        >
          <div className="text-xs font-semibold text-zinc-200">Add Custom RSS Feed</div>
          <input
            type="text"
            value={newFeedTitle}
            onChange={(e) => setNewFeedTitle(e.target.value)}
            placeholder="Feed name (e.g. Ars Technica)..."
            className="w-full bg-zinc-900 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            autoFocus
          />
          <input
            type="url"
            value={newFeedUrl}
            onChange={(e) => setNewFeedUrl(e.target.value)}
            placeholder="Feed RSS/XML URL (e.g. https://.../rss)..."
            className="w-full bg-zinc-900 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddFeed(false)}
              className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Save Feed
            </button>
          </div>
        </form>
      )}

      {/* Articles Feed Content or Empty State */}
      {feeds.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-zinc-900/40 border border-dashed border-zinc-700/60 my-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
            <Rss className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold text-zinc-200">No RSS Feeds Added</h4>
          <p className="text-[11px] text-zinc-400 mt-1 max-w-[240px]">
            Add RSS or Atom feed URLs to stream live news and articles directly in this widget.
          </p>
          {!isCleanMode && !showAddFeed && (
            <button
              type="button"
              onClick={() => setShowAddFeed(true)}
              className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add RSS Feed</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-8 gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
              <span className="text-xs text-zinc-400">Fetching latest stories...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6 text-xs text-rose-400">{error}</div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500">No articles available in this feed.</div>
          ) : (
            filteredArticles.map((item) => {
              const timeAgo = item.pubDate
                ? new Date(item.pubDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={item.id}
                  className="group p-2.5 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-700/40 hover:border-indigo-500/40 transition-all flex gap-3 items-start"
                >
                  {/* Article Thumbnail if available */}
                  {item.thumbnail && (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-700/50">
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).parentElement!.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-300 line-clamp-2 transition-colors block"
                    >
                      {item.title}
                    </a>

                    {item.contentSnippet && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                        {item.contentSnippet}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-700/30 text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{timeAgo || item.pubDate?.split('T')[0]}</span>
                        {item.author && <span className="hidden sm:inline">• {item.author}</span>}
                      </span>

                      <div className="flex items-center gap-2">
                        {onOpenArticleReader && (
                          <button
                            type="button"
                            onClick={() => onOpenArticleReader(item)}
                            className="hover:text-indigo-300 flex items-center gap-0.5"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Preview</span>
                          </button>
                        )}
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-indigo-300 flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Delete feed option for active feed */}
      {activeFeed && feeds.length > 0 && (
        <div className="pt-2 border-t border-zinc-800/80 flex justify-end">
          <button
            type="button"
            onClick={() => onDeleteFeed(activeFeed.id)}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove {activeFeed.title}</span>
          </button>
        </div>
      )}
    </div>
  );
};
