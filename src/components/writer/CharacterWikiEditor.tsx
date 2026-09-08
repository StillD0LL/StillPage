import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Sparkles,
  GripVertical,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Heart,
  Shield,
  Zap,
  Quote,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Palette,
  Eye,
  Sliders,
  MoveUp,
  MoveDown,
  Layers,
  FileText,
  Copy,
  Download,
  BookOpen,
  Volume2,
  Hash,
  Smile,
  Tag,
  Share2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import {
  CharacterProfile,
  CharacterSection,
  CharacterRelationship,
  CharacterTimelineEvent,
  CharacterQuote,
  CharacterStat,
  CharacterInfoboxField,
  CharacterGalleryItem,
  WritingDocument,
  WritingSuiteSettings,
  WritingFolder,
} from '../../types';
import {
  CHARACTER_THEME_COLORS,
  PRESET_AVATARS,
  CHARACTER_PRESET_TEMPLATES,
  characterProfileToMarkdown,
} from '../../utils/characterDefaults';
import { optimizeLocalImage } from '../../utils/imageOptimizer';
import { CharacterPortraitModal } from './CharacterPortraitModal';
import { Folder, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface CharacterWikiEditorProps {
  document: WritingDocument;
  settings: WritingSuiteSettings;
  folders?: WritingFolder[];
  onUpdateDocument: (id: string, updates: Partial<WritingDocument>) => void;
}

export const CharacterWikiEditor: React.FC<CharacterWikiEditorProps> = ({
  document,
  settings,
  folders = [],
  onUpdateDocument,
}) => {
  const profile: CharacterProfile = document.characterData || {
    name: document.title.replace(/\.(md|wiki|txt)$/i, '') || 'Character Name',
    summaryLead: '',
    customInfoboxFields: [],
    sections: [],
    relationships: [],
    quotes: [],
    timeline: [],
    stats: [],
    gallery: [],
    trivia: [],
  };

  const [viewMode, setViewMode] = useState<'builder' | 'reader'>('reader');
  const [activeTab, setActiveTab] = useState<'article' | 'infobox' | 'relationships' | 'timeline' | 'stats' | 'gallery'>('article');
  
  // When switching between character documents, default to Wiki (reader) view
  useEffect(() => {
    setViewMode('reader');
  }, [document.id]);

  // Modals & Panels
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPortraitModal, setShowPortraitModal] = useState(false);
  const [showQuickUrlInput, setShowQuickUrlInput] = useState(false);
  const [quickUrlDraft, setQuickUrlDraft] = useState('');
  const [showToc, setShowToc] = useState(true);

  // Drag & Drop State
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [draggedRelId, setDraggedRelId] = useState<string | null>(null);
  const [draggedTlId, setDraggedTlId] = useState<string | null>(null);

  // New item draft inputs
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [newTriviaInput, setNewTriviaInput] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Image Upload Ref
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to commit profile updates
  const updateProfile = (updates: Partial<CharacterProfile>) => {
    const updatedProfile: CharacterProfile = { ...profile, ...updates };
    const mdContent = characterProfileToMarkdown(updatedProfile);
    const words = mdContent.trim() ? mdContent.trim().split(/\s+/).length : 0;
    const chars = mdContent.length;

    onUpdateDocument(document.id, {
      characterData: updatedProfile,
      title: updatedProfile.name || document.title,
      content: mdContent,
      wordCount: words,
      charCount: chars,
      readingTimeMinutes: Math.max(1, Math.ceil(words / 200)),
      updatedAt: Date.now(),
    });
  };

  // Avatar file upload handler
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl } = await optimizeLocalImage(file, 1200, 1600, 0.85);
      updateProfile({ avatarUrl: dataUrl });
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          updateProfile({ avatarUrl: dataUrl });
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Gallery file upload handler
  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl } = await optimizeLocalImage(file, 1600, 1200, 0.85);
      const newItem: CharacterGalleryItem = {
        id: `gal-${Date.now()}`,
        url: dataUrl,
        caption: file.name.replace(/\.[^/.]+$/, ''),
      };
      updateProfile({ gallery: [...(profile.gallery || []), newItem] });
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const newItem: CharacterGalleryItem = {
            id: `gal-${Date.now()}`,
            url: dataUrl,
            caption: file.name.replace(/\.[^/.]+$/, ''),
          };
          updateProfile({ gallery: [...(profile.gallery || []), newItem] });
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Section Drag & Drop Reordering
  const handleSectionDrop = (targetId: string) => {
    if (!draggedSectionId || draggedSectionId === targetId) {
      setDraggedSectionId(null);
      setDragOverSectionId(null);
      return;
    }

    const currentSections = [...(profile.sections || [])];
    const sourceIdx = currentSections.findIndex((s) => s.id === draggedSectionId);
    const targetIdx = currentSections.findIndex((s) => s.id === targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const [moved] = currentSections.splice(sourceIdx, 1);
      currentSections.splice(targetIdx, 0, moved);
      updateProfile({ sections: currentSections });
    }

    setDraggedSectionId(null);
    setDragOverSectionId(null);
  };

  // Move Section Up/Down
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const currentSections = [...(profile.sections || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentSections.length) return;

    const temp = currentSections[index];
    currentSections[index] = currentSections[targetIdx];
    currentSections[targetIdx] = temp;
    updateProfile({ sections: currentSections });
  };

  // Add a new section
  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    const newSec: CharacterSection = {
      id: `sec-${Date.now()}`,
      title: newSectionTitle.trim(),
      content: '',
      type: 'text',
      isCustom: true,
    };
    updateProfile({ sections: [...(profile.sections || []), newSec] });
    setNewSectionTitle('');
  };

  // Add custom infobox field
  const handleAddCustomField = () => {
    if (!newFieldName.trim() || !newFieldValue.trim()) return;
    const newField: CharacterInfoboxField = {
      id: `field-${Date.now()}`,
      label: newFieldName.trim(),
      value: newFieldValue.trim(),
      category: 'general',
    };
    updateProfile({
      customInfoboxFields: [...(profile.customInfoboxFields || []), newField],
    });
    setNewFieldName('');
    setNewFieldValue('');
  };

  // Add relationship card
  const handleAddRelationship = () => {
    const newRel: CharacterRelationship = {
      id: `rel-${Date.now()}`,
      characterName: 'New Character',
      relationType: 'Ally',
      description: 'Describe their connection, shared history, or key interactions.',
      avatarEmoji: '👤',
    };
    updateProfile({ relationships: [...(profile.relationships || []), newRel] });
  };

  // Add quote
  const handleAddQuote = () => {
    const newQ: CharacterQuote = {
      id: `quote-${Date.now()}`,
      quote: 'Write an iconic line or piece of character dialogue here.',
      context: 'Scene or Chapter citation',
    };
    updateProfile({ quotes: [...(profile.quotes || []), newQ] });
  };

  // Add timeline milestone
  const handleAddTimelineEvent = () => {
    const newTl: CharacterTimelineEvent = {
      id: `tl-${Date.now()}`,
      period: 'Era / Age',
      title: 'Milestone Title',
      description: 'Describe the events and consequences of this moment.',
    };
    updateProfile({ timeline: [...(profile.timeline || []), newTl] });
  };

  // Add stat / skill power bar
  const handleAddStat = () => {
    const newSt: CharacterStat = {
      id: `stat-${Date.now()}`,
      label: 'New Ability',
      value: 75,
    };
    updateProfile({ stats: [...(profile.stats || []), newSt] });
  };

  // Add Trivia bullet
  const handleAddTrivia = () => {
    if (!newTriviaInput.trim()) return;
    updateProfile({ trivia: [...(profile.trivia || []), newTriviaInput.trim()] });
    setNewTriviaInput('');
  };

  const activeColorObj =
    CHARACTER_THEME_COLORS.find((c) => c.color === profile.themeColor) ||
    CHARACTER_THEME_COLORS[1];

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-zinc-950 text-zinc-100 select-text">
      {/* Top Wikipedia Character Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 backdrop-blur-md z-10 flex-wrap gap-2">
        {/* Left: Identity Badges */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0 border border-white/20"
            style={{ backgroundColor: profile.themeColor || '#6366f1' }}
          >
            {profile.avatarEmoji || '👤'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white truncate">{profile.name || 'Untitled Character'}</h2>
              <span className="px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold uppercase tracking-wider hidden sm:inline">
                Wiki Profile
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 truncate">
              <span>{profile.titleOrEpithet || profile.japaneseOrAltName || 'Encyclopedia Entry'}</span>
              {document.folderId && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Folder className="w-3 h-3 text-amber-400 shrink-0" />
                    {(() => {
                      const path: string[] = [];
                      let curr = folders.find((f) => f.id === document.folderId);
                      const visited = new Set<string>();
                      while (curr) {
                        if (visited.has(curr.id)) break;
                        visited.add(curr.id);
                        path.unshift(curr.name);
                        curr = curr.parentId ? folders.find((f) => f.id === curr!.parentId) : undefined;
                      }
                      return path.join(' / ');
                    })()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Tools & Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Portrait Photo URL / Image Button */}
          <button
            type="button"
            id="wiki-portrait-btn"
            onClick={() => setShowPortraitModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 border border-zinc-700/60 transition-colors cursor-pointer"
            title="Set Character Portrait Photo / URL"
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="w-3.5 h-3.5 rounded-full object-cover"
              />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span className="hidden sm:inline">Portrait Photo</span>
          </button>

          {/* Theme Color Picker */}
          <div className="relative">
            <button
              type="button"
              id="wiki-theme-picker-btn"
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 border border-zinc-700/60 transition-colors cursor-pointer"
              title="Change Infobox & Badge Theme Accent"
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-inner"
                style={{ backgroundColor: profile.themeColor || '#6366f1' }}
              />
              <span className="hidden md:inline">Theme</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {showThemePicker && (
              <div className="absolute right-0 top-full mt-1.5 w-56 p-2 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95">
                <div className="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1 mb-1">
                  Wiki Theme Accent
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {CHARACTER_THEME_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        updateProfile({ themeColor: c.color });
                        setShowThemePicker(false);
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        profile.themeColor === c.color
                          ? 'border-white bg-white/10 ring-2 ring-indigo-500'
                          : 'border-transparent hover:bg-zinc-800'
                      }`}
                      title={c.name}
                    >
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: c.color }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Templates Chooser Modal Trigger */}
          <button
            type="button"
            id="wiki-templates-btn"
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 border border-zinc-700/60 transition-colors cursor-pointer"
            title="Load Character Archetype Template"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          {/* Mode Switcher: Wiki View (Primary) vs Builder */}
          <div className="flex items-center bg-zinc-950 p-0.5 rounded-xl border border-zinc-800 text-xs font-semibold">
            <button
              type="button"
              id="wiki-reader-mode-btn"
              onClick={() => setViewMode('reader')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'reader'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Wiki View</span>
            </button>
            <button
              type="button"
              id="wiki-builder-mode-btn"
              onClick={() => setViewMode('builder')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'builder'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Builder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Wiki Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* WIKIPEDIA ARTICLE HEADER */}
          <div className="border-b border-zinc-700/80 pb-4 space-y-2">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1 flex-1">
                {/* Title and Alternate Name */}
                {viewMode === 'builder' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      id="character-name-input"
                      value={profile.name}
                      onChange={(e) => updateProfile({ name: e.target.value })}
                      placeholder="Character Full Name..."
                      className="text-2xl sm:text-3xl font-black text-white bg-transparent border-b border-zinc-700/60 focus:border-indigo-500 focus:outline-none w-full pb-1 font-serif tracking-tight"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <input
                        type="text"
                        value={profile.japaneseOrAltName || ''}
                        onChange={(e) => updateProfile({ japaneseOrAltName: e.target.value })}
                        placeholder="Alternate / Japanese Name (e.g. カエレン / The Silver One)..."
                        className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 flex-1 min-w-[200px]"
                      />
                      <input
                        type="text"
                        value={profile.titleOrEpithet || ''}
                        onChange={(e) => updateProfile({ titleOrEpithet: e.target.value })}
                        placeholder="Title / Epithet (e.g. Chief Harmonic Scholar)..."
                        className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 flex-1 min-w-[200px]"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
                      {profile.name || 'Character Name'}
                    </h1>
                    {profile.japaneseOrAltName && (
                      <div className="text-xs text-zinc-400 font-medium mt-0.5">
                        {profile.japaneseOrAltName}
                      </div>
                    )}
                    {profile.titleOrEpithet && (
                      <div className="text-sm font-semibold italic mt-1" style={{ color: profile.themeColor || '#6366f1' }}>
                        {profile.titleOrEpithet}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pronunciation & Status Badge */}
              <div className="flex items-center gap-2">
                {profile.status && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-900 border border-zinc-700/80 flex items-center gap-1.5 text-zinc-200">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        profile.status.toLowerCase().includes('alive')
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : profile.status.toLowerCase().includes('deceased')
                          ? 'bg-rose-500'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span>{profile.status}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 font-sans">
              From the Encyclopedia • Free in-universe lore archive • Last updated {new Date(document.updatedAt).toLocaleDateString()}
            </div>
          </div>

          {/* MAIN ARTICLE BODY WITH FLOATING INFOBOX */}
          <div className="flex flex-col lg:flex-row-reverse gap-8 items-start">
            {/* WIKIPEDIA INFOBOX (CARD) */}
            <div
              id="wiki-infobox-card"
              className="w-full lg:w-80 shrink-0 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl overflow-hidden self-start sticky top-4 select-text animate-in fade-in duration-200"
            >
              {/* Infobox Header Banner */}
              <div
                className="px-4 py-3 text-center border-b border-white/10 text-white font-serif font-black text-sm tracking-wide shadow-inner"
                style={{ backgroundColor: profile.themeColor || '#6366f1' }}
              >
                {profile.name || 'Character'}
                {profile.titleOrEpithet && (
                  <div className="text-[10px] font-sans font-normal opacity-90 tracking-normal mt-0.5">
                    {profile.titleOrEpithet}
                  </div>
                )}
              </div>

              {/* Character Portrait Image Box */}
              <div className="p-3 bg-zinc-950/60 border-b border-zinc-800 text-center relative group/img flex flex-col items-center justify-center">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />

                {profile.avatarUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-zinc-700 shadow-md aspect-3/4 max-h-76 w-full max-w-[260px] mx-auto bg-zinc-900 group flex items-center justify-center">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                    {viewMode === 'builder' && (
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                        <button
                          type="button"
                          id="infobox-change-photo-url-btn"
                          onClick={() => setShowPortraitModal(true)}
                          className="w-full max-w-[170px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Edit Photo / URL</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateProfile({ avatarUrl: '', avatarCaption: '' })}
                          className="w-full max-w-[170px] px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Photo</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 rounded-xl border border-dashed border-zinc-700 flex flex-col items-center justify-center text-center gap-2.5 bg-zinc-900/40 w-full max-w-[260px] mx-auto">
                    <div className="text-4xl select-none">{profile.avatarEmoji || '👤'}</div>
                    <div>
                      <div className="text-xs font-bold text-zinc-200">No Portrait Photo</div>
                      <div className="text-[10px] text-zinc-500">Provide an image URL or upload artwork</div>
                    </div>

                    {viewMode === 'builder' && (
                      <div className="w-full space-y-2 pt-1">
                        {showQuickUrlInput ? (
                          <div className="space-y-1.5 bg-zinc-950 p-2 rounded-xl border border-zinc-700 animate-in fade-in">
                            <input
                              type="url"
                              value={quickUrlDraft}
                              onChange={(e) => setQuickUrlDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && quickUrlDraft.trim()) {
                                  updateProfile({ avatarUrl: quickUrlDraft.trim() });
                                  setShowQuickUrlInput(false);
                                  setQuickUrlDraft('');
                                } else if (e.key === 'Escape') {
                                  setShowQuickUrlInput(false);
                                }
                              }}
                              placeholder="Paste image URL here..."
                              className="w-full px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                              autoFocus
                            />
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setShowQuickUrlInput(false)}
                                className="px-2 py-0.5 text-[10px] text-zinc-400 hover:text-white rounded"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (quickUrlDraft.trim()) {
                                    updateProfile({ avatarUrl: quickUrlDraft.trim() });
                                    setShowQuickUrlInput(false);
                                    setQuickUrlDraft('');
                                  }
                                }}
                                className="px-2.5 py-0.5 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5 w-full">
                            <button
                              type="button"
                              id="infobox-set-photo-url-btn"
                              onClick={() => setShowPortraitModal(true)}
                              className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Set Image URL / Photo</span>
                            </button>

                            <div className="flex gap-1.5 justify-center">
                              <button
                                type="button"
                                onClick={() => setShowQuickUrlInput(true)}
                                className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold border border-zinc-700 cursor-pointer"
                              >
                                Quick Paste URL
                              </button>
                              <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold border border-zinc-700 cursor-pointer"
                              >
                                Upload File
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Portrait Caption */}
                <div className="mt-2 text-center">
                  {viewMode === 'builder' ? (
                    <input
                      type="text"
                      value={profile.avatarCaption || ''}
                      onChange={(e) => updateProfile({ avatarCaption: e.target.value })}
                      placeholder="Photo caption (e.g. Canonical illustration)..."
                      className="text-[10px] text-center text-zinc-400 bg-transparent border-b border-dashed border-zinc-800 hover:border-zinc-600 focus:border-indigo-500 focus:outline-none w-full italic"
                    />
                  ) : (
                    <div className="text-[10px] text-zinc-400 italic">
                      {profile.avatarCaption || 'Canonical profile illustration'}
                    </div>
                  )}
                </div>
              </div>

              {/* Core Infobox Attributes Table */}
              <div className="p-3 text-xs space-y-2 divide-y divide-zinc-800/80">
                {/* General Header */}
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 pt-1">
                  General Information
                </div>

                {/* Core Rows */}
                <div className="space-y-1.5 pt-1.5">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-400 font-medium">Status</span>
                    {viewMode === 'builder' ? (
                      <input
                        type="text"
                        value={profile.status || ''}
                        onChange={(e) => updateProfile({ status: e.target.value })}
                        placeholder="Alive / Deceased..."
                        className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-semibold text-zinc-200">{profile.status || '—'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-400 font-medium">Species / Race</span>
                    {viewMode === 'builder' ? (
                      <input
                        type="text"
                        value={profile.speciesOrRace || ''}
                        onChange={(e) => updateProfile({ speciesOrRace: e.target.value })}
                        placeholder="Human, Elf, Cyborg..."
                        className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-semibold text-zinc-200">{profile.speciesOrRace || '—'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-400 font-medium">Gender</span>
                    {viewMode === 'builder' ? (
                      <input
                        type="text"
                        value={profile.gender || ''}
                        onChange={(e) => updateProfile({ gender: e.target.value })}
                        placeholder="Gender..."
                        className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-semibold text-zinc-200">{profile.gender || '—'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-400 font-medium">Age</span>
                    {viewMode === 'builder' ? (
                      <input
                        type="text"
                        value={profile.age || ''}
                        onChange={(e) => updateProfile({ age: e.target.value })}
                        placeholder="e.g. 27..."
                        className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-semibold text-zinc-200">{profile.age || '—'}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-400 font-medium">Birthday</span>
                    {viewMode === 'builder' ? (
                      <input
                        type="text"
                        value={profile.birthday || ''}
                        onChange={(e) => updateProfile({ birthday: e.target.value })}
                        placeholder="e.g. Nov 14..."
                        className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-semibold text-zinc-200">{profile.birthday || '—'}</span>
                    )}
                  </div>
                </div>

                {/* Physical Header */}
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 pt-2">
                  Physical Characteristics
                </div>
                <div className="space-y-1.5 pt-1.5">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-400 font-medium">Height</span>
                    {viewMode === 'builder' ? (
                      <input
                        type="text"
                        value={profile.height || ''}
                        onChange={(e) => updateProfile({ height: e.target.value })}
                        placeholder="182 cm..."
                        className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-semibold text-zinc-200">{profile.height || '—'}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-400 font-medium">Weight</span>
                    {viewMode === 'builder' ? (
                      <input
                        type="text"
                        value={profile.weight || ''}
                        onChange={(e) => updateProfile({ weight: e.target.value })}
                        placeholder="73 kg..."
                        className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-semibold text-zinc-200">{profile.weight || '—'}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-400 font-medium">Hair Color</span>
                    {viewMode === 'builder' ? (
                      <input
                        type="text"
                        value={profile.hairColor || ''}
                        onChange={(e) => updateProfile({ hairColor: e.target.value })}
                        placeholder="Obsidian Black..."
                        className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-semibold text-zinc-200">{profile.hairColor || '—'}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-400 font-medium">Eye Color</span>
                    {viewMode === 'builder' ? (
                      <input
                        type="text"
                        value={profile.eyeColor || ''}
                        onChange={(e) => updateProfile({ eyeColor: e.target.value })}
                        placeholder="Lapis Blue..."
                        className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-semibold text-zinc-200">{profile.eyeColor || '—'}</span>
                    )}
                  </div>
                </div>

                {/* Affiliations & Role Header */}
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 pt-2">
                  Role & Alignment
                </div>
                <div className="space-y-1.5 pt-1.5">
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-400 font-medium">Occupation</span>
                    {viewMode === 'builder' ? (
                      <input
                        type="text"
                        value={profile.occupation || ''}
                        onChange={(e) => updateProfile({ occupation: e.target.value })}
                        placeholder="Lead Archivist..."
                        className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-semibold text-zinc-200">{profile.occupation || '—'}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-400 font-medium">Affiliation</span>
                    {viewMode === 'builder' ? (
                      <input
                        type="text"
                        value={profile.affiliations || ''}
                        onChange={(e) => updateProfile({ affiliations: e.target.value })}
                        placeholder="Grand Archive..."
                        className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-semibold text-zinc-200">{profile.affiliations || '—'}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-zinc-400 font-medium">Alignment</span>
                    {viewMode === 'builder' ? (
                      <input
                        type="text"
                        value={profile.alignment || ''}
                        onChange={(e) => updateProfile({ alignment: e.target.value })}
                        placeholder="Neutral Good..."
                        className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-32 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="font-semibold text-zinc-200">{profile.alignment || '—'}</span>
                    )}
                  </div>
                </div>

                {/* CUSTOM DYNAMIC INFOBOX FIELDS (DRAG & DROP) */}
                {profile.customInfoboxFields && profile.customInfoboxFields.length > 0 && (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 pt-2 flex items-center justify-between">
                      <span>Custom Attributes</span>
                      <span className="text-[9px] text-zinc-500 lowercase">draggable</span>
                    </div>
                    <div className="space-y-1.5 pt-1.5">
                      {profile.customInfoboxFields.map((field, idx) => (
                        <div
                          key={field.id}
                          draggable={viewMode === 'builder'}
                          onDragStart={() => setDraggedFieldId(field.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (!draggedFieldId || draggedFieldId === field.id) return;
                            const fields = [...profile.customInfoboxFields];
                            const src = fields.findIndex((f) => f.id === draggedFieldId);
                            const tgt = fields.findIndex((f) => f.id === field.id);
                            if (src !== -1 && tgt !== -1) {
                              const [m] = fields.splice(src, 1);
                              fields.splice(tgt, 0, m);
                              updateProfile({ customInfoboxFields: fields });
                            }
                            setDraggedFieldId(null);
                          }}
                          className="flex items-center justify-between gap-1 py-1 group/row"
                        >
                          {viewMode === 'builder' && (
                            <GripVertical className="w-3 h-3 text-zinc-600 group-hover/row:text-zinc-400 cursor-grab shrink-0" />
                          )}
                          <span className="text-zinc-400 font-medium truncate max-w-[90px]">{field.label}</span>
                          {viewMode === 'builder' ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) => {
                                  const fields = profile.customInfoboxFields.map((f) =>
                                    f.id === field.id ? { ...f, value: e.target.value } : f
                                  );
                                  updateProfile({ customInfoboxFields: fields });
                                }}
                                className="text-right bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-200 text-xs w-28 focus:outline-none focus:border-indigo-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const fields = profile.customInfoboxFields.filter((f) => f.id !== field.id);
                                  updateProfile({ customInfoboxFields: fields });
                                }}
                                className="text-zinc-600 hover:text-rose-400 p-0.5"
                                title="Delete attribute"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-semibold text-zinc-200 text-right truncate max-w-[150px]">
                              {field.value}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Quick Add Custom Field Builder */}
                {viewMode === 'builder' && (
                  <div className="pt-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Key (e.g. Weapon)..."
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="w-1/2 px-2 py-1 text-[11px] bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Value..."
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        className="w-1/2 px-2 py-1 text-[11px] bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="w-full mt-1.5 py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-indigo-300 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Infobox Attribute</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* WIKIPEDIA ARTICLE CONTENT AREA */}
            <div className="flex-1 min-w-0 space-y-6 w-full">
              {/* LEAD INTRO PARAGRAPH */}
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Wikipedia Lead Summary</span>
                </div>

                {viewMode === 'builder' ? (
                  <textarea
                    id="character-lead-textarea"
                    rows={4}
                    value={profile.summaryLead}
                    onChange={(e) => updateProfile({ summaryLead: e.target.value })}
                    placeholder="Write the opening Wikipedia summary paragraph introducing the character, their identity, primary role in the story, and major achievements..."
                    className="w-full p-3 text-xs sm:text-sm leading-relaxed bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none font-sans scrollbar-thin"
                  />
                ) : (
                  <p className="text-sm sm:text-base leading-relaxed text-zinc-200 font-sans">
                    <strong className="text-white font-bold">{profile.name}</strong>{' '}
                    {profile.summaryLead ? (
                      profile.summaryLead.startsWith(profile.name)
                        ? profile.summaryLead.slice(profile.name.length).trim()
                        : profile.summaryLead
                    ) : (
                      'is a major character in the lore.'
                    )}
                  </p>
                )}
              </div>

              {/* WIKIPEDIA TABLE OF CONTENTS (TOC) */}
              <div
                id="wiki-toc-box"
                className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 max-w-md select-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-bold text-zinc-200">Contents</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowToc(!showToc)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    [{showToc ? 'hide' : 'show'}]
                  </button>
                </div>

                {showToc && (
                  <ol className="mt-2.5 space-y-1 text-xs text-indigo-300 font-medium pl-4 list-decimal marker:text-zinc-500">
                    <li>
                      <a href="#sec-lead" className="hover:underline hover:text-white">
                        Lead Overview
                      </a>
                    </li>
                    {profile.sections.map((sec, idx) => (
                      <li key={sec.id}>
                        <a href={`#sec-${sec.id}`} className="hover:underline hover:text-white">
                          {sec.title}
                        </a>
                      </li>
                    ))}
                    {profile.relationships.length > 0 && (
                      <li>
                        <a href="#sec-relationships" className="hover:underline hover:text-white">
                          Key Relationships ({profile.relationships.length})
                        </a>
                      </li>
                    )}
                    {profile.timeline.length > 0 && (
                      <li>
                        <a href="#sec-timeline" className="hover:underline hover:text-white">
                          Chronological Timeline ({profile.timeline.length})
                        </a>
                      </li>
                    )}
                    {profile.quotes.length > 0 && (
                      <li>
                        <a href="#sec-quotes" className="hover:underline hover:text-white">
                          Notable Quotes ({profile.quotes.length})
                        </a>
                      </li>
                    )}
                    {profile.trivia.length > 0 && (
                      <li>
                        <a href="#sec-trivia" className="hover:underline hover:text-white">
                          Trivia & Behind the Scenes ({profile.trivia.length})
                        </a>
                      </li>
                    )}
                  </ol>
                )}
              </div>

              {/* DRAGGABLE ARTICLE SECTIONS */}
              <div className="space-y-8 pt-4">
                {profile.sections.map((section, idx) => {
                  const isDragOver = dragOverSectionId === section.id;

                  return (
                    <section
                      key={section.id}
                      id={`sec-${section.id}`}
                      draggable={viewMode === 'builder'}
                      onDragStart={() => setDraggedSectionId(section.id)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverSectionId(section.id);
                      }}
                      onDragLeave={() => setDragOverSectionId(null)}
                      onDrop={() => handleSectionDrop(section.id)}
                      className={`rounded-2xl transition-all ${
                        isDragOver ? 'bg-indigo-600/10 ring-2 ring-indigo-500' : ''
                      } ${viewMode === 'builder' ? 'p-4 bg-zinc-900/30 border border-zinc-800/60' : ''}`}
                    >
                      {/* Section Header */}
                      <div className="flex items-center justify-between border-b border-zinc-700/80 pb-2 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {viewMode === 'builder' && (
                            <span title="Drag to reorder section" className="cursor-grab">
                              <GripVertical className="w-4 h-4 text-zinc-500 hover:text-white shrink-0" />
                            </span>
                          )}
                          <span className="text-xs font-mono text-zinc-500">{idx + 1}</span>
                          {viewMode === 'builder' ? (
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => {
                                const secs = profile.sections.map((s) =>
                                  s.id === section.id ? { ...s, title: e.target.value } : s
                                );
                                updateProfile({ sections: secs });
                              }}
                              className="text-lg font-serif font-bold text-white bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none"
                            />
                          ) : (
                            <h2 className="text-xl font-serif font-bold text-white tracking-tight">
                              {section.title}
                            </h2>
                          )}
                        </div>

                        {/* Section Controls */}
                        {viewMode === 'builder' && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => moveSection(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none"
                              title="Move section up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSection(idx, 'down')}
                              disabled={idx === profile.sections.length - 1}
                              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none"
                              title="Move section down"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const secs = profile.sections.filter((s) => s.id !== section.id);
                                updateProfile({ sections: secs });
                              }}
                              className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                              title="Delete section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Section Content: Text Area */}
                      {viewMode === 'builder' ? (
                        <textarea
                          rows={4}
                          value={section.content}
                          onChange={(e) => {
                            const secs = profile.sections.map((s) =>
                              s.id === section.id ? { ...s, content: e.target.value } : s
                            );
                            updateProfile({ sections: secs });
                          }}
                          placeholder={`Enter narrative information for ${section.title}...`}
                          className="w-full p-3 text-xs sm:text-sm leading-relaxed bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-zinc-200 focus:outline-none focus:border-indigo-500 resize-y font-sans scrollbar-thin"
                        />
                      ) : (
                        <div className="text-sm leading-relaxed text-zinc-300 font-sans space-y-3 whitespace-pre-line">
                          {section.content || <em className="text-zinc-600">No content documented yet.</em>}
                        </div>
                      )}

                      {/* Specialized Section Enhancements: Stats Slider Bars inside Abilities section */}
                      {section.type === 'stats' && profile.stats.length > 0 && (
                        <div className="mt-4 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              <span>Power & Skill Ratings</span>
                            </span>
                            {viewMode === 'builder' && (
                              <button
                                type="button"
                                onClick={handleAddStat}
                                className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-indigo-300 text-[11px] font-semibold flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Skill</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {profile.stats.map((st) => (
                              <div key={st.id} className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                  <span className="text-zinc-300">{st.label}</span>
                                  <span className="font-bold" style={{ color: profile.themeColor || '#6366f1' }}>
                                    {st.value}/100
                                  </span>
                                </div>
                                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden relative">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${st.value}%`,
                                      backgroundColor: profile.themeColor || '#6366f1',
                                    }}
                                  />
                                </div>
                                {viewMode === 'builder' && (
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={st.value}
                                    onChange={(e) => {
                                      const newStats = profile.stats.map((s) =>
                                        s.id === st.id ? { ...s, value: parseInt(e.target.value, 10) } : s
                                      );
                                      updateProfile({ stats: newStats });
                                    }}
                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>

              {/* QUICK BUILDER SHORTCUT: ADD NEW SECTION */}
              {viewMode === 'builder' && (
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-dashed border-zinc-700/80 space-y-3">
                  <div className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-400" />
                    <span>Add New Wiki Section</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Section Title (e.g. Equipment, Magic Spells, Childhood)..."
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddSection();
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Add Section
                    </button>
                  </div>
                </div>
              )}

              {/* RELATIONSHIP CARDS MODULE */}
              <div id="sec-relationships" className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-700/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <h2 className="text-xl font-serif font-bold text-white tracking-tight">Key Relationships</h2>
                  </div>
                  {viewMode === 'builder' && (
                    <button
                      type="button"
                      onClick={handleAddRelationship}
                      className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-indigo-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Character</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.relationships.map((rel) => (
                    <div
                      key={rel.id}
                      className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl shrink-0">{rel.avatarEmoji || '👤'}</span>
                          <div className="min-w-0">
                            {viewMode === 'builder' ? (
                              <input
                                type="text"
                                value={rel.characterName}
                                onChange={(e) => {
                                  const rels = profile.relationships.map((r) =>
                                    r.id === rel.id ? { ...r, characterName: e.target.value } : r
                                  );
                                  updateProfile({ relationships: rels });
                                }}
                                className="text-xs font-bold text-white bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 w-full"
                              />
                            ) : (
                              <strong className="text-xs font-bold text-white truncate block">
                                {rel.characterName}
                              </strong>
                            )}
                          </div>
                        </div>

                        {viewMode === 'builder' ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={rel.relationType}
                              onChange={(e) => {
                                const rels = profile.relationships.map((r) =>
                                  r.id === rel.id ? { ...r, relationType: e.target.value } : r
                                );
                                updateProfile({ relationships: rels });
                              }}
                              placeholder="Relation..."
                              className="text-[10px] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-indigo-300 w-24 text-right"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const rels = profile.relationships.filter((r) => r.id !== rel.id);
                                updateProfile({ relationships: rels });
                              }}
                              className="text-zinc-500 hover:text-rose-400 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold">
                            {rel.relationType}
                          </span>
                        )}
                      </div>

                      {viewMode === 'builder' ? (
                        <textarea
                          rows={2}
                          value={rel.description || ''}
                          onChange={(e) => {
                            const rels = profile.relationships.map((r) =>
                              r.id === rel.id ? { ...r, description: e.target.value } : r
                            );
                            updateProfile({ relationships: rels });
                          }}
                          placeholder="Describe relationship dynamics..."
                          className="w-full p-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 resize-none font-sans"
                        />
                      ) : (
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">{rel.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* TIMELINE MILESTONES MODULE */}
              <div id="sec-timeline" className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-700/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <h2 className="text-xl font-serif font-bold text-white tracking-tight">Story Timeline</h2>
                  </div>
                  {viewMode === 'builder' && (
                    <button
                      type="button"
                      onClick={handleAddTimelineEvent}
                      className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sky-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Milestone</span>
                    </button>
                  )}
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                  {profile.timeline.map((tl, i) => (
                    <div key={tl.id} className="relative group/tl">
                      <span
                        className="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-zinc-900 shadow-sm"
                        style={{ backgroundColor: profile.themeColor || '#6366f1' }}
                      />
                      <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold">
                              {tl.period}
                            </span>
                            {viewMode === 'builder' ? (
                              <input
                                type="text"
                                value={tl.title}
                                onChange={(e) => {
                                  const tls = profile.timeline.map((t) =>
                                    t.id === tl.id ? { ...t, title: e.target.value } : t
                                  );
                                  updateProfile({ timeline: tls });
                                }}
                                className="text-xs font-bold text-white bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800"
                              />
                            ) : (
                              <strong className="text-xs font-bold text-white">{tl.title}</strong>
                            )}
                          </div>

                          {viewMode === 'builder' && (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={tl.period}
                                onChange={(e) => {
                                  const tls = profile.timeline.map((t) =>
                                    t.id === tl.id ? { ...t, period: e.target.value } : t
                                  );
                                  updateProfile({ timeline: tls });
                                }}
                                placeholder="Period / Age..."
                                className="text-[10px] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-300 w-24"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const tls = profile.timeline.filter((t) => t.id !== tl.id);
                                  updateProfile({ timeline: tls });
                                }}
                                className="text-zinc-500 hover:text-rose-400 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {viewMode === 'builder' ? (
                          <textarea
                            rows={2}
                            value={tl.description}
                            onChange={(e) => {
                              const tls = profile.timeline.map((t) =>
                                t.id === tl.id ? { ...t, description: e.target.value } : t
                              );
                              updateProfile({ timeline: tls });
                            }}
                            className="w-full p-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 resize-none font-sans"
                          />
                        ) : (
                          <p className="text-xs text-zinc-400 leading-relaxed font-sans">{tl.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NOTABLE QUOTES MODULE */}
              <div id="sec-quotes" className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-700/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Quote className="w-4 h-4 text-amber-400" />
                    <h2 className="text-xl font-serif font-bold text-white tracking-tight">Notable Quotes</h2>
                  </div>
                  {viewMode === 'builder' && (
                    <button
                      type="button"
                      onClick={handleAddQuote}
                      className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Quote</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {profile.quotes.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-zinc-900/60 border-l-4 border-amber-500 bg-zinc-900/30 space-y-2"
                    >
                      {viewMode === 'builder' ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={q.quote}
                            onChange={(e) => {
                              const qs = profile.quotes.map((item) =>
                                item.id === q.id ? { ...item, quote: e.target.value } : item
                              );
                              updateProfile({ quotes: qs });
                            }}
                            placeholder="Character quote..."
                            className="w-full p-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 italic"
                          />
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={q.context || ''}
                              onChange={(e) => {
                                const qs = profile.quotes.map((item) =>
                                  item.id === q.id ? { ...item, context: e.target.value } : item
                                );
                                updateProfile({ quotes: qs });
                              }}
                              placeholder="Citation context (e.g. Chapter 4)..."
                              className="text-xs bg-zinc-950 px-2 py-1 rounded border border-zinc-800 text-zinc-400 w-64"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const qs = profile.quotes.filter((item) => item.id !== q.id);
                                updateProfile({ quotes: qs });
                              }}
                              className="text-zinc-500 hover:text-rose-400 text-xs"
                            >
                              Delete Quote
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <blockquote className="text-sm italic text-zinc-200 font-serif leading-relaxed">
                            "{q.quote}"
                          </blockquote>
                          {q.context && (
                            <cite className="text-[11px] text-zinc-500 font-sans block mt-1">
                              — {q.context}
                            </cite>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* TRIVIA & BEHIND THE SCENES */}
              <div id="sec-trivia" className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between border-b border-zinc-700/80 pb-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-xl font-serif font-bold text-white tracking-tight">
                      Trivia & Behind the Scenes
                    </h2>
                  </div>
                </div>

                <ul className="space-y-2 list-disc pl-5 text-xs text-zinc-300 font-sans leading-relaxed marker:text-emerald-400">
                  {profile.trivia.map((fact, idx) => (
                    <li key={idx} className="group/fact">
                      <div className="flex items-start justify-between gap-2">
                        <span>{fact}</span>
                        {viewMode === 'builder' && (
                          <button
                            type="button"
                            onClick={() => {
                              const facts = profile.trivia.filter((_, i) => i !== idx);
                              updateProfile({ trivia: facts });
                            }}
                            className="text-zinc-600 hover:text-rose-400 shrink-0"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {viewMode === 'builder' && (
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add fun fact, design trivia, or development note..."
                      value={newTriviaInput}
                      onChange={(e) => setNewTriviaInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTrivia();
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTrivia}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 text-xs font-semibold cursor-pointer"
                    >
                      Add Fact
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHARACTER PORTRAIT & PHOTO MODAL */}
      <CharacterPortraitModal
        isOpen={showPortraitModal}
        onClose={() => setShowPortraitModal(false)}
        currentAvatarUrl={profile.avatarUrl}
        currentAvatarCaption={profile.avatarCaption}
        currentAvatarEmoji={profile.avatarEmoji}
        characterName={profile.name || 'Character'}
        themeColor={profile.themeColor}
        onSave={({ avatarUrl, avatarCaption, avatarEmoji }) => {
          updateProfile({
            avatarUrl,
            avatarCaption,
            avatarEmoji: avatarEmoji || profile.avatarEmoji,
          });
        }}
      />

      {/* TEMPLATES CHOOSER MODAL */}
      {showTemplateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
          onClick={() => setShowTemplateModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl p-6 space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Character Archetype Templates</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Apply a complete ready-made character archetype seed with pre-formatted Wikipedia infobox, power stats, timeline, and relationships.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
              {CHARACTER_PRESET_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 hover:border-indigo-500/60 flex flex-col justify-between space-y-3 group/t cursor-pointer transition-all"
                  onClick={() => {
                    if (
                      confirm(
                        `Apply "${tmpl.name}" template? This will update the character's profile data.`
                      )
                    ) {
                      const newProf = tmpl.createProfile();
                      updateProfile(newProf);
                      setShowTemplateModal(false);
                    }
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white group-hover/t:text-indigo-300 transition-colors">
                        {tmpl.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400">
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{tmpl.description}</p>
                  </div>
                  <button
                    type="button"
                    className="w-full py-1.5 rounded-xl bg-zinc-800 group-hover/t:bg-indigo-600 text-white text-xs font-bold transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
