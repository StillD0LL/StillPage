import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Check, ListTodo, AlertCircle } from 'lucide-react';
import { TaskItem, WidgetSize } from '../../types';

interface TasksWidgetProps {
  size: WidgetSize;
  tasks: TaskItem[];
  isCleanMode?: boolean;
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({
  size,
  tasks,
  isCleanMode = false,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    onAddTask({
      text: newTaskText.trim(),
      completed: false,
      priority,
    });
    setNewTaskText('');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const PRIORITY_BADGES = {
    high: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };

  return (
    <div className="h-full flex flex-col justify-between space-y-2.5 min-h-0">
      {/* Progress Bar & Filter */}
      <div className="shrink-0">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-zinc-300">
            {completedCount}/{tasks.length} Completed
          </span>
          <span className="font-mono text-indigo-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Quick Add Task Input - Hidden in Clean Mode */}
      {!isCleanMode && (
        <form onSubmit={handleCreateTask} className="flex gap-1.5 shrink-0">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new focus task..."
            className="flex-1 bg-zinc-800/80 text-xs text-white rounded-xl px-3 py-1.5 border border-zinc-700/50 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-500"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="bg-zinc-800 text-[11px] text-zinc-300 rounded-xl px-2 py-1.5 border border-zinc-700/50 focus:outline-none"
          >
            <option value="high">High</option>
            <option value="medium">Med</option>
            <option value="low">Low</option>
          </select>
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Tasks List - Strictly internal scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-500">
            {filter === 'completed'
              ? 'No completed tasks.'
              : filter === 'active'
              ? 'All tasks finished! 🎉'
              : 'No tasks yet.'}
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`group flex items-center justify-between p-2 rounded-xl transition-colors border ${
                t.completed
                  ? 'bg-zinc-900/40 border-zinc-800/40 opacity-70'
                  : 'bg-zinc-800/40 hover:bg-zinc-800/70 border-zinc-700/40'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onUpdateTask({ ...t, completed: !t.completed })}
                  className="text-zinc-400 hover:text-emerald-400 shrink-0 transition-colors cursor-pointer"
                >
                  {t.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <span
                  className={`text-xs truncate ${
                    t.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                  }`}
                >
                  {t.text}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span
                  className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md border ${
                    PRIORITY_BADGES[t.priority]
                  }`}
                >
                  {t.priority}
                </span>
                {!isCleanMode && (
                  <button
                    type="button"
                    onClick={() => onDeleteTask(t.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Filter Tabs Footer */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400 border-t border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-2">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`capitalize transition-colors cursor-pointer ${
                filter === f ? 'text-indigo-400 font-semibold' : 'hover:text-zinc-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
