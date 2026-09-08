import { RSSItem } from '../types';

// Fallback items in case feed is offline, blocked by adblocker, or rate-limited
const SAMPLE_FEEDS_BACKUP: Record<string, RSSItem[]> = {
  'https://techcrunch.com/feed/': [
    {
      id: 'tc-1',
      title: 'The AI hardware landscape is entering its next phase of custom silicon',
      link: 'https://techcrunch.com',
      pubDate: new Date(Date.now() - 3600000).toISOString(),
      author: 'TechCrunch AI',
      contentSnippet: 'New benchmarks showcase exponential gains in inference efficiency across edge architectures and hyperscalers.',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      feedTitle: 'TechCrunch',
    },
    {
      id: 'tc-2',
      title: 'Open source robotics models accelerate warehouse and manufacturing automation',
      link: 'https://techcrunch.com',
      pubDate: new Date(Date.now() - 7200000).toISOString(),
      author: 'Robotics Desk',
      contentSnippet: 'Startups are releasing vision-language-action models that generalize dexterous manipulation across diverse hardware platforms.',
      thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
      feedTitle: 'TechCrunch',
    },
    {
      id: 'tc-3',
      title: 'Venture funding in climate tech stabilizes as grid modernization takes center stage',
      link: 'https://techcrunch.com',
      pubDate: new Date(Date.now() - 14400000).toISOString(),
      author: 'Climate Desk',
      contentSnippet: 'Battery storage and grid-scale software platforms see strong growth amidst rising electrification demands.',
      thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop&q=80',
      feedTitle: 'TechCrunch',
    },
  ],
  'https://news.ycombinator.com/rss': [
    {
      id: 'hn-1',
      title: 'Show HN: Nexus Homepage – A modular browser dashboard with drag-and-drop',
      link: 'https://news.ycombinator.com',
      pubDate: new Date(Date.now() - 1800000).toISOString(),
      author: 'pg',
      contentSnippet: 'A fast, client-side personal startpage featuring customizable widgets, tag filters, RSS aggregation, and bookmarks.',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      feedTitle: 'Hacker News',
    },
    {
      id: 'hn-2',
      title: 'PostgreSQL 17 performance improvements in deep dive',
      link: 'https://news.ycombinator.com',
      pubDate: new Date(Date.now() - 5400000).toISOString(),
      author: 'db_expert',
      contentSnippet: 'Memory management optimizations, vacuuming performance benchmarks, and native JSON functions analyzed.',
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
      feedTitle: 'Hacker News',
    },
    {
      id: 'hn-3',
      title: 'Reflections on 10 years of building web applications',
      link: 'https://news.ycombinator.com',
      pubDate: new Date(Date.now() - 10800000).toISOString(),
      author: 'coder_daily',
      contentSnippet: 'Lessons on architecture simplicity, client state, CSS evolution, and developer ergonomic priorities.',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      feedTitle: 'Hacker News',
    },
  ],
};

export async function fetchRSSFeed(feedUrl: string, feedTitle?: string): Promise<RSSItem[]> {
  try {
    // Try rss2json API first
    const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(endpoint);

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
        const title = feedTitle || data.feed?.title || 'RSS Feed';
        return data.items.map((item: any, index: number) => {
          // Extract thumbnail from enclosure, description HTML img, or thumbnail prop
          let thumb = item.thumbnail || item.enclosure?.link;
          if (!thumb && item.description) {
            const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) thumb = imgMatch[1];
          }

          // Clean HTML snippet
          const snippet = item.description
            ? item.description.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...'
            : '';

          return {
            id: item.guid || `${feedUrl}-${index}-${Date.now()}`,
            title: item.title || 'Untitled Article',
            link: item.link || '#',
            pubDate: item.pubDate || new Date().toISOString(),
            author: item.author || '',
            contentSnippet: snippet,
            thumbnail: thumb,
            feedTitle: title,
          };
        });
      }
    }
  } catch (e) {
    console.warn('rss2json failed, trying direct XML parser with CORS proxy', e);
  }

  // Fallback to CORS proxy + DOMParser
  try {
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`;
    const res = await fetch(corsProxyUrl);
    if (res.ok) {
      const xmlText = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, 'text/xml');
      const items = Array.from(xml.querySelectorAll('item, entry'));

      if (items.length > 0) {
        const title = feedTitle || xml.querySelector('channel > title, feed > title')?.textContent || 'RSS Feed';
        return items.slice(0, 15).map((node, index) => {
          const itemTitle = node.querySelector('title')?.textContent || 'Untitled';
          const link =
            node.querySelector('link')?.textContent ||
            node.querySelector('link')?.getAttribute('href') ||
            '#';
          const pubDate =
            node.querySelector('pubDate, published, updated')?.textContent ||
            new Date().toISOString();
          const desc =
            node.querySelector('description, summary, content')?.textContent || '';
          const snippet = desc.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...';

          const enclosure = node.querySelector('enclosure');
          const mediaContent = node.querySelector('media\\:content, content');
          let thumbnail = enclosure?.getAttribute('url') || mediaContent?.getAttribute('url');

          if (!thumbnail && desc) {
            const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) thumbnail = imgMatch[1];
          }

          return {
            id: `${feedUrl}-${index}`,
            title: itemTitle,
            link,
            pubDate,
            contentSnippet: snippet,
            thumbnail: thumbnail || undefined,
            feedTitle: title,
          };
        });
      }
    }
  } catch (err) {
    console.warn('CORS XML fetch failed, using cached backup', err);
  }

  // Return static backup if available or generic items
  if (SAMPLE_FEEDS_BACKUP[feedUrl]) {
    return SAMPLE_FEEDS_BACKUP[feedUrl];
  }

  return [
    {
      id: 'fallback-1',
      title: `${feedTitle || 'RSS Feed'} – Latest Updates and Trends`,
      link: feedUrl,
      pubDate: new Date().toISOString(),
      contentSnippet: 'Live feed updates will automatically refresh periodically. Click to visit source website.',
      feedTitle: feedTitle || 'Feed',
      thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
    }
  ];
}
