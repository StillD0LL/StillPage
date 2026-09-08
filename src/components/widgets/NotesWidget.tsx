import React, { useState } from 'react';
import { FileText, Plus, Trash2, Pin, Check } from 'lucide-react';
import { NoteItem, WidgetSize } from '../../types';

interface NotesWidgetProps {
  size: WidgetSize;
  notes: NoteItem[];
  onAddNote: (note: Omit<NoteItem, 'id' | 'updatedAt'>) => void;
  onUpdateNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesWidget: React.FC<NotesWidgetProps> = ({
  size,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleCreateNote = () => {
    const newNote = {
      title: `Note ${notes.length + 1}`,
      content: '',
      color: '#6366f1',
      pinned: false,
    };
    onAddNote(newNote);
  };

  const handleContentChange = (content: string) => {
    if (!activeNote) return;
    onUpdateNote({
      ...activeNote,
      content,
      updatedAt: Date.now(),
    });
  };

  const handleTitleChange = (title: string) => {
    if (!activeNote) return;
    onUpdateNote({
      ...activeNote,
      title,
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="h-full flex flex-col justify-between space-y-2">
      {/* Note Tabs & Add */}
      <div className="flex items-center justify-between gap-1 pb-1 border-b border-zinc-800/80">
        <div className="flex items-center gap-1 overflow-x-auto max-w-[calc(100%-35px)] scrollbar-none">
          {notes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setActiveNoteId(note.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg truncate max-w-[120px] transition-all cursor-pointer ${
                (activeNote?.id === note.id)
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {note.title || 'Untitled'}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCreateNote}
          className="p-1 text-zinc-400 hover:text-indigo-300 rounded hover:bg-zinc-800 transition-colors shrink-0"
          title="New Note"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active Note Editor */}
      {activeNote ? (
        <div className="flex-1 flex flex-col justify-between space-y-2 min-h-0">
          <input
            type="text"
            value={activeNote.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="w-full bg-transparent text-xs font-bold text-zinc-200 focus:outline-none border-b border-transparent focus:border-indigo-500/40 pb-1"
          />

          <textarea
            value={activeNote.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Type notes, markdown, ideas, or to-dos here (auto-saved)..."
            className="w-full flex-1 bg-zinc-900/40 text-xs text-zinc-300 placeholder-zinc-500 p-2.5 rounded-xl border border-zinc-800/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none font-sans leading-relaxed"
          />

          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
            <span>
              Updated {new Date(activeNote.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {notes.length > 1 && (
              <button
                type="button"
                onClick={() => onDeleteNote(activeNote.id)}
                className="text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete note</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs text-zinc-500 mb-2">No notes available.</p>
          <button
            type="button"
            onClick={handleCreateNote}
            className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
          >
            Create Note
          </button>
        </div>
      )}
    </div>
  );
};
