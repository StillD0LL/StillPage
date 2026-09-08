import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  Calendar as CalendarIcon,
  Rss,
  Bookmark as BookmarkIcon,
  FileText,
  CheckSquare,
  Clock,
  Images,
  Video,
  Plus,
  SlidersHorizontal,
  LayoutGrid,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import {
  WidgetConfig,
  WidgetSize,
  LayoutPreset,
  Bookmark,
  BookmarkCategory,
  CalendarEvent,
  RSSFeed,
  RSSItem,
  NoteItem,
  TaskItem,
  DashboardTheme,
  GalleryImage,
  PageId,
} from './types';
import { storage } from './services/storage';
import { uiSound } from './services/uiSound';
import { StartPage } from './components/start/StartPage';
import { WritingSuite } from './components/writer/WritingSuite';
import { Header } from './components/Header';
import { WidgetContainer } from './components/widgets/WidgetContainer';
import { WeatherWidget } from './components/widgets/WeatherWidget';
import { CalendarWidget } from './components/widgets/CalendarWidget';
import { RssFeedWidget } from './components/widgets/RssFeedWidget';
import { BookmarksWidget } from './components/widgets/BookmarksWidget';
import { ClockWidget } from './components/widgets/ClockWidget';
import { NotesWidget } from './components/widgets/NotesWidget';
import { TasksWidget } from './components/widgets/TasksWidget';
import { GalleryWidget } from './components/widgets/GalleryWidget';
import { VideoWidget } from './components/widgets/VideoWidget';

import { BookmarkModal } from './components/modals/BookmarkModal';
import { EventModal } from './components/modals/EventModal';
import { WidgetCustomizerModal } from './components/modals/WidgetCustomizerModal';
import { ThemeCustomizerModal } from './components/modals/ThemeCustomizerModal';
import { ArticleReaderModal } from './components/modals/ArticleReaderModal';
import { SettingsModal } from './components/modals/SettingsModal';

export default function App() {
  // Global State with LocalStorage Persistence
  const [theme, setTheme] = useState<DashboardTheme>(() => storage.getTheme());
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => storage.getWidgets());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => storage.getBookmarks());
  const [categories, setCategories] = useState<BookmarkCategory[]>(() => storage.getCategories());
  const [events, setEvents] = useState<CalendarEvent[]>(() => storage.getEvents());
  const [feeds, setFeeds] = useState<RSSFeed[]>(() => storage.getFeeds());
  const [notes, setNotes] = useState<NoteItem[]>(() => storage.getNotes());
  const [tasks, setTasks] = useState<TaskItem[]>(() => storage.getTasks());
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => storage.getGalleryImages());
  const [searchHistory, setSearchHistory] = useState<string[]>(() => storage.getSearchHistory());
  const [defaultEngineId, setDefaultEngineId] = useState<string>(() => storage.getDefaultEngine());

  // UI / Modal States
  const [activePage, setActivePage] = useState<PageId>(() => storage.getActivePage());
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCleanMode, setIsCleanMode] = useState<boolean>(() => storage.getCleanMode());
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [widgetModalTab, setWidgetModalTab] = useState<'widgets' | 'presets'>('widgets');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [readingArticle, setReadingArticle] = useState<RSSItem | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Initialize UI sound engine global interaction listener
  useEffect(() => {
    uiSound.initGlobalListener();
  }, []);

  const toggleCleanMode = () => {
    const next = !isCleanMode;
    setIsCleanMode(next);
    storage.saveCleanMode(next);
    if (next) {
      setIsEditMode(false);
      showToast('Clean Mode enabled — window titles & configurable controls hidden.');
    } else {
      showToast('Clean Mode disabled — standard window controls restored.');
    }
  };

  const showToast = (message: string) => {
    setToastNotification(message);
    setTimeout(() => {
      setToastNotification((curr) => (curr === message ? null : curr));
    }, 3500);
  };

  // Drag-and-drop state for widgets
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

  // Sync to localStorage
  const updateTheme = (newTheme: DashboardTheme) => {
    setTheme(newTheme);
    storage.saveTheme(newTheme);
  };

  const handleSelectPage = (page: PageId) => {
    setActivePage(page);
    storage.saveActivePage(page);
  };

  const updateWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    storage.saveWidgets(newWidgets);
  };

  const updateBookmarks = (newBookmarks: Bookmark[]) => {
    setBookmarks(newBookmarks);
    storage.saveBookmarks(newBookmarks);
  };

  const updateCategories = (newCategories: BookmarkCategory[]) => {
    setCategories(newCategories);
    storage.saveCategories(newCategories);
  };

  const updateEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    storage.saveEvents(newEvents);
  };

  const updateFeeds = (newFeeds: RSSFeed[]) => {
    setFeeds(newFeeds);
    storage.saveFeeds(newFeeds);
  };

  const updateNotes = (newNotes: NoteItem[]) => {
    setNotes(newNotes);
    storage.saveNotes(newNotes);
  };

  const updateTasks = (newTasks: TaskItem[]) => {
    setTasks(newTasks);
    storage.saveTasks(newTasks);
  };

  const updateGalleryImages = (newImages: GalleryImage[]) => {
    setGalleryImages(newImages);
    storage.saveGalleryImages(newImages);
  };

  const handleDataReload = () => {
    setTheme(storage.getTheme());
    setWidgets(storage.getWidgets());
    setBookmarks(storage.getBookmarks());
    setCategories(storage.getCategories());
    setEvents(storage.getEvents());
    setFeeds(storage.getFeeds());
    setNotes(storage.getNotes());
    setTasks(storage.getTasks());
    setGalleryImages(storage.getGalleryImages());
    setSearchHistory(storage.getSearchHistory());
    setDefaultEngineId(storage.getDefaultEngine());
  };

  // Search History Handler
  const handleAddSearchHistory = (query: string) => {
    const updated = [query, ...searchHistory.filter((h) => h.toLowerCase() !== query.toLowerCase())].slice(0, 15);
    setSearchHistory(updated);
    storage.saveSearchHistory(updated);
  };

  const handleClearSearchHistory = () => {
    setSearchHistory([]);
    storage.saveSearchHistory([]);
  };

  const handleRemoveSearchHistory = (queryToRemove: string) => {
    const updated = searchHistory.filter((h) => h !== queryToRemove);
    setSearchHistory(updated);
    storage.saveSearchHistory(updated);
  };

  const handleEngineChange = (engineId: string) => {
    setDefaultEngineId(engineId);
    storage.saveDefaultEngine(engineId);
  };

  // Widget Actions
  const handleResizeWidget = (id: string, size: WidgetSize) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, size } : w));
    updateWidgets(updated);
  };

  const handleToggleWidget = (id: string, enabled: boolean) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, enabled } : w));
    updateWidgets(updated);
  };

  const handleRemoveWidget = (id: string) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, enabled: false } : w));
    updateWidgets(updated);
  };

  const handleUpdateWidgetSettings = (id: string, newSettings: any) => {
    const updated = widgets.map((w) =>
      w.id === id ? { ...w, settings: { ...w.settings, ...newSettings } } : w
    );
    updateWidgets(updated);
  };

  // Widget Reordering Drag and Drop
  const handleWidgetDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleWidgetDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) return;

    const sourceIdx = widgets.findIndex((w) => w.id === draggedWidgetId);
    const targetIdx = widgets.findIndex((w) => w.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const updated = [...widgets];
    const [moved] = updated.splice(sourceIdx, 1);
    updated.splice(targetIdx, 0, moved);

    const reordered = updated.map((w, i) => ({ ...w, order: i }));
    updateWidgets(reordered);
    setDraggedWidgetId(null);
  };

  const handleMoveWidget = (id: string, direction: 'up' | 'down') => {
    const idx = widgets.findIndex((w) => w.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;

    const updated = [...widgets];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);

    const reordered = updated.map((w, i) => ({ ...w, order: i }));
    updateWidgets(reordered);
  };

  // Layout Presets
  const handleApplyLayoutPreset = (presetOrName: LayoutPreset | string) => {
    if (typeof presetOrName === 'object' && presetOrName.widgets) {
      updateWidgets(presetOrName.widgets);
      showToast(`Applied layout preset: "${presetOrName.name}"`);
      return;
    }

    const presets = storage.getLayoutPresets();
    const found = presets.find(
      (p) => p.id === presetOrName || p.name.toLowerCase() === (presetOrName as string).toLowerCase()
    );
    if (found) {
      updateWidgets(found.widgets);
      showToast(`Applied layout preset: "${found.name}"`);
    }
  };

  const handleResetLayout = () => {
    storage.resetToDefaults();
    handleDataReload();
    showToast('Reset dashboard to factory default layout');
    setIsWidgetModalOpen(false);
  };

  // Bookmarks CRUD
  const handleSaveBookmark = (bmData: Omit<Bookmark, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      const updated = bookmarks.map((b) =>
        b.id === existingId ? { ...b, ...bmData } : b
      );
      updateBookmarks(updated);
    } else {
      const newBm: Bookmark = {
        id: `bm-${Date.now()}`,
        createdAt: Date.now(),
        ...bmData,
      };
      updateBookmarks([newBm, ...bookmarks]);
    }
  };

  const handleDeleteBookmark = (id: string) => {
    updateBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  // Events CRUD
  const handleSaveEvent = (evtData: Omit<CalendarEvent, 'id'>, existingId?: string) => {
    if (existingId) {
      const updated = events.map((e) =>
        e.id === existingId ? { ...e, ...evtData } : e
      );
      updateEvents(updated);
    } else {
      const newEvt: CalendarEvent = {
        id: `evt-${Date.now()}`,
        ...evtData,
      };
      updateEvents([...events, newEvt]);
    }
  };

  const handleDeleteEvent = (id: string) => {
    updateEvents(events.filter((e) => e.id !== id));
  };

  // Feeds CRUD
  const handleAddFeed = (feedData: Omit<RSSFeed, 'id'>) => {
    const newFeed: RSSFeed = {
      id: `feed-${Date.now()}`,
      ...feedData,
    };
    updateFeeds([...feeds, newFeed]);
  };

  const handleDeleteFeed = (id: string) => {
    updateFeeds(feeds.filter((f) => f.id !== id));
  };

  // Notes CRUD
  const handleAddNote = (noteData: Omit<NoteItem, 'id' | 'updatedAt'>) => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      updatedAt: Date.now(),
      ...noteData,
    };
    updateNotes([...notes, newNote]);
  };

  const handleUpdateNote = (note: NoteItem) => {
    updateNotes(notes.map((n) => (n.id === note.id ? note : n)));
  };

  const handleDeleteNote = (id: string) => {
    updateNotes(notes.filter((n) => n.id !== id));
  };

  // Tasks CRUD
  const handleAddTask = (taskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      createdAt: Date.now(),
      ...taskData,
    };
    updateTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (task: TaskItem) => {
    updateTasks(tasks.map((t) => (t.id === task.id ? task : t)));
  };

  const handleDeleteTask = (id: string) => {
    updateTasks(tasks.filter((t) => t.id !== id));
  };

  // Gallery CRUD
  const handleAddGalleryImage = (imgData: Omit<GalleryImage, 'id' | 'addedAt'>) => {
    const newImage: GalleryImage = {
      id: `gal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      addedAt: Date.now(),
      ...imgData,
    };
    updateGalleryImages([...galleryImages, newImage]);
  };

  const handleUpdateGalleryImage = (image: GalleryImage) => {
    updateGalleryImages(galleryImages.map((img) => (img.id === image.id ? image : img)));
  };

  const handleDeleteGalleryImage = (id: string) => {
    updateGalleryImages(galleryImages.filter((img) => img.id !== id));
  };

  // Get active enabled widgets in order (strictly valid widgets only)
  const activeWidgets = widgets
    .filter(
      (w) =>
        w &&
        w.enabled &&
        !String(w.type).toLowerCase().includes('character') &&
        !String(w.type).toLowerCase().includes('showcase') &&
        !String(w.type).toLowerCase().includes('banner') &&
        !String(w.id).toLowerCase().includes('character') &&
        !String(w.id).toLowerCase().includes('showcase') &&
        !String(w.id).toLowerCase().includes('banner')
    )
    .sort((a, b) => a.order - b.order);

  // Background styling computation
  const getBackgroundStyle = () => {
    if (theme.mode === 'oled') {
      return { backgroundColor: '#000000' };
    }
    if (theme.backgroundType === 'image') {
      const posX = theme.backgroundPositionX ?? 50;
      const posY = theme.backgroundPositionY ?? 50;
      const zoom = theme.backgroundZoom ?? 100;
      const fit = theme.backgroundFit ?? 'cover';
      const repeat = theme.backgroundRepeat ?? 'no-repeat';

      return {
        backgroundImage: `url(${theme.backgroundValue})`,
        backgroundSize: fit === 'custom' ? `${zoom}% auto` : fit,
        backgroundPosition: `${posX}% ${posY}%`,
        backgroundRepeat: repeat,
        backgroundAttachment: 'fixed',
      };
    }
    if (theme.backgroundType === 'gradient') {
      return { background: theme.backgroundValue };
    }
    return { backgroundColor: theme.backgroundValue || '#0f172a' };
  };

  // Render individual widget component based on type
  const renderWidgetContent = (widget: WidgetConfig) => {
    switch (widget.type) {
      case 'clock':
        return (
          <ClockWidget
            size={widget.size}
            settings={widget.settings}
            onUpdateSettings={(s) => handleUpdateWidgetSettings(widget.id, s)}
          />
        );
      case 'weather':
        return (
          <WeatherWidget
            size={widget.size}
            settings={widget.settings}
            onUpdateSettings={(s) => handleUpdateWidgetSettings(widget.id, s)}
          />
        );
      case 'calendar':
        return (
          <CalendarWidget
            size={widget.size}
            events={events}
            onAddEvent={(e) => handleSaveEvent(e)}
            onUpdateEvent={(e) => handleSaveEvent(e, e.id)}
            onDeleteEvent={handleDeleteEvent}
            onOpenEventModal={() => {
              setEditingEvent(null);
              setIsEventModalOpen(true);
            }}
          />
        );
      case 'rss':
        return (
          <RssFeedWidget
            size={widget.size}
            feeds={feeds}
            isCleanMode={isCleanMode}
            onAddFeed={handleAddFeed}
            onDeleteFeed={handleDeleteFeed}
            onOpenArticleReader={(item) => setReadingArticle(item)}
          />
        );
      case 'bookmarks':
        return (
          <BookmarksWidget
            size={widget.size}
            bookmarks={bookmarks}
            categories={categories}
            isCleanMode={isCleanMode}
            onAddBookmark={(bm) => handleSaveBookmark(bm)}
            onUpdateBookmark={(bm) => handleSaveBookmark(bm, bm.id)}
            onDeleteBookmark={handleDeleteBookmark}
            onReorderBookmarks={updateBookmarks}
            onOpenBookmarkModal={(bm) => {
              setEditingBookmark(bm || null);
              setIsBookmarkModalOpen(true);
            }}
          />
        );
      case 'notes':
        return (
          <NotesWidget
            size={widget.size}
            notes={notes}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        );
      case 'tasks':
        return (
          <TasksWidget
            size={widget.size}
            tasks={tasks}
            isCleanMode={isCleanMode}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'gallery':
        return (
          <GalleryWidget
            size={widget.size}
            images={galleryImages}
            settings={widget.settings}
            isCleanMode={isCleanMode}
            onAddImage={handleAddGalleryImage}
            onUpdateImage={handleUpdateGalleryImage}
            onDeleteImage={handleDeleteGalleryImage}
            onReorderImages={updateGalleryImages}
            onUpdateSettings={(s) => handleUpdateWidgetSettings(widget.id, s)}
          />
        );
      case 'video':
        return (
          <VideoWidget
            size={widget.size}
            settings={widget.settings}
            isCleanMode={isCleanMode}
            onUpdateSettings={(s) => handleUpdateWidgetSettings(widget.id, s)}
          />
        );
      default:
        return <div className="text-xs text-zinc-500">Widget content not found</div>;
    }
  };

  const getWidgetIcon = (type: WidgetConfig['type']) => {
    switch (type) {
      case 'clock':
        return <Clock className="w-4 h-4 text-indigo-400" />;
      case 'weather':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'calendar':
        return <CalendarIcon className="w-4 h-4 text-emerald-400" />;
      case 'rss':
        return <Rss className="w-4 h-4 text-orange-400" />;
      case 'bookmarks':
        return <BookmarkIcon className="w-4 h-4 text-indigo-400" />;
      case 'notes':
        return <FileText className="w-4 h-4 text-sky-400" />;
      case 'tasks':
        return <CheckSquare className="w-4 h-4 text-purple-400" />;
      case 'gallery':
        return <Images className="w-4 h-4 text-pink-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-red-400" />;
      default:
        return <LayoutGrid className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div
      className={`relative min-h-screen font-sans text-zinc-100 flex flex-col transition-colors duration-500 ${
        theme.mode === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-950 text-zinc-100'
      }`}
      style={getBackgroundStyle()}
    >
      {/* Background Dim & Blur Overlay */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-300 z-0"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${theme.backgroundDim / 100})`,
          backdropFilter: theme.backgroundBlur > 0 ? `blur(${theme.backgroundBlur}px)` : 'none',
        }}
      />

      {/* Global Unified Header for All Pages (Navigation + Browser Search + Utilities) */}
      <Header
        activePage={activePage}
        onSelectPage={handleSelectPage}
        isEditMode={isEditMode}
        isCleanMode={isCleanMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onToggleCleanMode={toggleCleanMode}
        onOpenWidgetCustomizer={() => setIsWidgetModalOpen(true)}
        onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        defaultEngineId={defaultEngineId}
        onEngineChange={handleEngineChange}
        bookmarks={bookmarks}
        events={events}
        rssItems={[]}
        searchHistory={searchHistory}
        onAddSearchHistory={handleAddSearchHistory}
        onClearSearchHistory={handleClearSearchHistory}
        onRemoveSearchHistory={handleRemoveSearchHistory}
      />

      {/* Conditional Multi-Page View Layout */}
      {activePage === 'start' ? (
        <div className="relative z-10 flex-1 flex flex-col min-h-[calc(100vh-56px)]">
          <StartPage
            onSelectPage={handleSelectPage}
            bookmarks={bookmarks}
            events={events}
            searchHistory={searchHistory}
            defaultEngineId={defaultEngineId}
            onEngineChange={handleEngineChange}
            onAddSearchHistory={handleAddSearchHistory}
            onClearSearchHistory={handleClearSearchHistory}
            onRemoveSearchHistory={handleRemoveSearchHistory}
            isCleanMode={isCleanMode}
          />
        </div>
      ) : activePage === 'writer' ? (
        <div className="relative z-10 flex-1 flex flex-col h-[calc(100vh-56px)] overflow-hidden">
          <WritingSuite
            activePage={activePage}
            onSelectPage={handleSelectPage}
            onBackToDashboard={() => handleSelectPage('dashboard')}
          />
        </div>
      ) : (
        /* Main Dashboard Container Content */
        <div className="relative z-10 flex-1 flex flex-col max-w-[1600px] w-full mx-auto pb-12 pt-3">
          {/* Layout Editing Mode Notice Banner */}
          {isEditMode && !isCleanMode && (
            <div className="mx-4 sm:mx-6 mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 text-xs backdrop-blur-md">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Customize Mode Active:</strong> Drag widgets to rearrange, adjust card sizes, or save your setup as a preset.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setWidgetModalTab('presets');
                    setIsWidgetModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Layout Presets</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWidgetModalTab('widgets');
                    setIsWidgetModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-100 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  + Widgets
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Toast Notification Banner */}
          {toastNotification && (
            <div className="fixed bottom-6 right-6 z-50 p-3.5 px-4 rounded-2xl bg-zinc-900/95 border border-indigo-500/40 text-indigo-200 text-xs shadow-2xl shadow-black/80 flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="p-1 rounded-lg bg-indigo-600/20 text-indigo-400">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-white">{toastNotification}</span>
            </div>
          )}

          {/* Customizable Grid Canvas */}
          <main className="flex-1 px-4 sm:px-6">
            {activeWidgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl bg-zinc-900/40 border border-dashed border-zinc-800 backdrop-blur-md p-8">
                <LayoutGrid className="w-12 h-12 text-zinc-600 mb-3" />
                <h2 className="text-lg font-bold text-zinc-200">No widgets enabled</h2>
                <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
                  Personalize your homepage by adding weather, calendar events, RSS feeds, bookmark
                  hub, or scratchpad notes.
                </p>
                {!isCleanMode && (
                  <button
                    type="button"
                    onClick={() => setIsWidgetModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    Open Widget Customizer
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
                {activeWidgets.map((widget) => (
                  <WidgetContainer
                    key={widget.id}
                    widget={widget}
                    isEditMode={isEditMode}
                    isCleanMode={isCleanMode}
                    theme={theme}
                    icon={getWidgetIcon(widget.type)}
                    onResize={handleResizeWidget}
                    onRemove={handleRemoveWidget}
                    onMoveUp={(id) => handleMoveWidget(id, 'up')}
                    onMoveDown={(id) => handleMoveWidget(id, 'down')}
                    onDragStart={handleWidgetDragStart}
                    onDrop={handleWidgetDrop}
                  >
                    {renderWidgetContent(widget)}
                  </WidgetContainer>
                ))}
              </div>
            )}
          </main>
        </div>
      )}

      {/* Modals */}
      <BookmarkModal
        isOpen={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
        bookmarkToEdit={editingBookmark}
        categories={categories}
        onSave={handleSaveBookmark}
        onDelete={handleDeleteBookmark}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        eventToEdit={editingEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      <WidgetCustomizerModal
        isOpen={isWidgetModalOpen}
        onClose={() => setIsWidgetModalOpen(false)}
        widgets={widgets}
        initialTab={widgetModalTab}
        onToggleWidget={handleToggleWidget}
        onResizeWidget={handleResizeWidget}
        onApplyLayoutPreset={handleApplyLayoutPreset}
        onResetLayout={handleResetLayout}
      />

      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        theme={theme}
        onUpdateTheme={updateTheme}
      />

      <ArticleReaderModal
        item={readingArticle}
        onClose={() => setReadingArticle(null)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onDataReload={handleDataReload}
      />
    </div>
  );
}
