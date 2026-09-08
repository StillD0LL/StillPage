import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Tag, Trash2 } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: CalendarEvent | null;
  onSave: (event: Omit<CalendarEvent, 'id'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
}

const CATEGORY_COLORS: Record<CalendarEvent['category'], string> = {
  work: '#3b82f6',
  personal: '#10b981',
  meeting: '#8b5cf6',
  deadline: '#ef4444',
  reminder: '#f59e0b',
};

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  eventToEdit,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState<CalendarEvent['category']>('work');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDate(eventToEdit.date);
      setTime(eventToEdit.time || '10:00');
      setEndTime(eventToEdit.endTime || '');
      setCategory(eventToEdit.category || 'work');
      setLocation(eventToEdit.location || '');
      setDescription(eventToEdit.description || '');
    } else {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('10:00');
      setEndTime('11:00');
      setCategory('work');
      setLocation('');
      setDescription('');
    }
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onSave(
      {
        title: title.trim(),
        date,
        time: time || undefined,
        endTime: endTime || undefined,
        category,
        color: CATEGORY_COLORS[category] || '#3b82f6',
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        completed: eventToEdit?.completed || false,
      },
      eventToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              {eventToEdit ? 'Edit Event' : 'Create New Event'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Review, Team Lunch..."
              className="w-full bg-zinc-800 border border-zinc-700 text-sm text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                <option value="work">Work</option>
                <option value="meeting">Meeting</option>
                <option value="personal">Personal</option>
                <option value="deadline">Deadline</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Location / Video Link (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Google Meet, Room 402, Cafe..."
              className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes or agenda..."
              className="w-full bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            {eventToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(eventToEdit.id);
                  onClose();
                }}
                className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 p-2"
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
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                {eventToEdit ? 'Save Changes' : 'Add Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
