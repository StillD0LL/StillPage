import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { CalendarEvent, WidgetSize } from '../../types';

interface CalendarWidgetProps {
  size: WidgetSize;
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onOpenEventModal?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  work: '#3b82f6', // blue
  personal: '#10b981', // green
  meeting: '#8b5cf6', // purple
  deadline: '#ef4444', // red
  reminder: '#f59e0b', // amber
};

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  size,
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onOpenEventModal,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTime, setQuickTime] = useState('10:00');
  const [quickCategory, setQuickCategory] = useState<CalendarEvent['category']>('work');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Calendar math
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, d);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    calendarCells.push({
      day: d,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    // Adjust for timezone offset ISO string
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({
      day: i,
      dateStr,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete grid
  const remainingCells = 35 - calendarCells.length;
  if (remainingCells > 0) {
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      const dateStr = nextMonthDate.toISOString().split('T')[0];
      calendarCells.push({
        day: i,
        dateStr,
        isCurrentMonth: false,
      });
    }
  }

  // Filter events by selected category
  const filteredEvents = events.filter((ev) => {
    if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
    return true;
  });

  // Selected date events
  const selectedDateEvents = filteredEvents.filter((ev) => ev.date === selectedDate);

  // Sorted upcoming events
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = [...filteredEvents]
    .filter((ev) => ev.date >= todayStr)
    .sort((a, b) => (a.date + (a.time || '')) > (b.date + (b.time || '')) ? 1 : -1);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    onAddEvent({
      title: quickTitle.trim(),
      date: selectedDate,
      time: quickTime,
      category: quickCategory,
      color: CATEGORY_COLORS[quickCategory] || '#3b82f6',
      completed: false,
    });

    setQuickTitle('');
    setShowQuickAdd(false);
  };

  const isCompact = size === '1x1';

  return (
    <div className="h-full flex flex-col justify-between space-y-3">
      {/* Top Bar: Mode Switch & Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'month'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            Calendar
          </button>
          <button
            type="button"
            onClick={() => setViewMode('agenda')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            Upcoming ({upcomingEvents.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onOpenEventModal) {
              onOpenEventModal();
            } else {
              setShowQuickAdd(!showQuickAdd);
            }
          }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Event</span>
        </button>
      </div>

      {/* Quick Add Form Drawer */}
      {showQuickAdd && (
        <form
          onSubmit={handleQuickAdd}
          className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 space-y-2 animate-in fade-in"
        >
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Event title (e.g. Team Standup)..."
            className="w-full bg-zinc-900 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={quickTime}
              onChange={(e) => setQuickTime(e.target.value)}
              className="bg-zinc-900 text-xs text-white rounded-lg px-2 py-1 focus:outline-none"
            />
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value as any)}
              className="bg-zinc-900 text-xs text-zinc-300 rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="work">Work</option>
              <option value="meeting">Meeting</option>
              <option value="personal">Personal</option>
              <option value="deadline">Deadline</option>
              <option value="reminder">Reminder</option>
            </select>
            <button
              type="submit"
              className="ml-auto px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* View Mode: Month Grid */}
      {viewMode === 'month' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-bold text-zinc-200">{monthName}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-zinc-400 uppercase py-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {calendarCells.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayStr;
              const dayEvents = filteredEvents.filter((e) => e.date === cell.dateStr);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`relative py-1.5 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : isToday
                      ? 'bg-zinc-800 text-indigo-300 font-semibold ring-1 ring-indigo-500/50'
                      : cell.isCurrentMonth
                      ? 'text-zinc-300 hover:bg-zinc-800/60'
                      : 'text-zinc-600 hover:bg-zinc-800/30'
                  }`}
                >
                  <span>{cell.day}</span>
                  {/* Event Indicator Dots */}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((ev, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{
                            backgroundColor: isSelected ? '#ffffff' : ev.color || '#3b82f6',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Events Mini Feed */}
          <div className="mt-3 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              <span>Events for {selectedDate === todayStr ? 'Today' : selectedDate}</span>
              <span>{selectedDateEvents.length} scheduled</span>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {selectedDateEvents.length === 0 ? (
                <div className="text-xs text-zinc-500 py-1 italic">No events for this date.</div>
              ) : (
                selectedDateEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/40 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => onUpdateEvent({ ...evt, completed: !evt.completed })}
                        className="text-zinc-400 hover:text-emerald-400 shrink-0"
                      >
                        {evt.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Circle className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div
                          className={`font-semibold truncate ${
                            evt.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                          }`}
                        >
                          {evt.title}
                        </div>
                        {evt.time && (
                          <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>
                              {evt.time} {evt.endTime ? `- ${evt.endTime}` : ''}
                            </span>
                            {evt.location && <span>• {evt.location}</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteEvent(evt.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Mode: Upcoming Agenda Feed */}
      {viewMode === 'agenda' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Category Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2 scrollbar-none">
            {['all', 'work', 'meeting', 'personal', 'deadline', 'reminder'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wider transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Events List */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">
                No upcoming events matching filter.
              </div>
            ) : (
              upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start justify-between p-2.5 rounded-xl bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-700/40 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: evt.color || '#3b82f6' }}
                    />
                    <div>
                      <div
                        className={`text-xs font-semibold ${
                          evt.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                        }`}
                      >
                        {evt.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {evt.date === todayStr ? 'Today' : evt.date}{' '}
                        {evt.time ? `at ${evt.time}` : ''}
                      </div>
                      {evt.description && (
                        <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                          {evt.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {evt.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteEvent(evt.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
