import React, { useState } from 'react';
import { Plus, Check, Trash2, Bell, Clock, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Task, Priority } from '../types';

interface TasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
}

export default function Tasks({ tasks, setTasks, activeTaskId, setActiveTaskId }: TasksProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    detail: '',
    priority: Priority.MEDIUM,
    duration: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '23:59'
  });

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.duration) return;
    
    const durationMins = parseInt(formData.duration);
    
    if (editingId) {
      setTasks(tasks.map(t => t.id === editingId ? {
        ...t,
        title: formData.title,
        detail: formData.detail,
        priority: formData.priority,
        duration: durationMins,
        remainingTime: durationMins * 60,
        dueDate: formData.dueDate,
        dueTime: formData.dueTime
      } : t));
      setEditingId(null);
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        detail: formData.detail,
        priority: formData.priority,
        duration: durationMins,
        remainingTime: durationMins * 60,
        dueDate: formData.dueDate,
        dueTime: formData.dueTime,
        completed: false
      };
      setTasks([...tasks, newTask]);
    }
    
    setFormData({
      title: '',
      detail: '',
      priority: Priority.MEDIUM,
      duration: '',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '23:59'
    });
    setIsAdding(false);
  };

  const startEdit = (task: Task) => {
    setFormData({
      title: task.title,
      detail: task.detail,
      priority: task.priority,
      duration: task.duration.toString(),
      dueDate: task.dueDate,
      dueTime: task.dueTime
    });
    setEditingId(task.id);
    setIsAdding(true);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed, remainingTime: !t.completed ? 0 : t.duration * 60 } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.priority - a.priority;
  });

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case Priority.HIGH: return 'text-rose-500 bg-rose-50';
      case Priority.MEDIUM: return 'text-amber-500 bg-amber-50';
      case Priority.LOW: return 'text-blue-500 bg-blue-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Study List
          <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-400 px-2 py-1 rounded-md tracking-widest">
            {tasks.filter(t => t.completed).length}/{tasks.length}
          </span>
        </h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 btn-interactive"
        >
          <Plus size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-x-0 top-0 z-50 glass-card p-6 bg-white border-2 border-slate-900 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg text-slate-900">{editingId ? 'Edit Goal' : 'Add New Goal'}</h3>
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <form onSubmit={addTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Calculus Homework"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 placeholder:text-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none"
                  >
                    <option value={Priority.LOW}>Low</option>
                    <option value={Priority.MEDIUM}>Medium</option>
                    <option value={Priority.HIGH}>High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Duration (Min)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g. 45"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Time</label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={e => setFormData({...formData, dueTime: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Additional Details</label>
                <textarea
                  rows={2}
                  value={formData.detail}
                  onChange={e => setFormData({...formData, detail: e.target.value})}
                  placeholder="Notes, steps, or resources..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 resize-none placeholder:text-slate-300"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all btn-interactive"
              >
                {editingId ? 'Save Changes' : 'Create Task'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        <AnimatePresence mode="popLayout" initial={false}>
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-slate-300 text-center"
            >
              <AlertCircle size={48} className="mb-4 opacity-10" strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-widest">No Active Goals</p>
            </motion.div>
          ) : (
            sortedTasks.map((task) => {
              const progress = Math.max(0, Math.min(100, (1 - task.remainingTime / (task.duration * 60)) * 100));
              const isActive = activeTaskId === task.id;

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => !task.completed && setActiveTaskId(task.id)}
                  className={cn(
                    "group flex flex-col gap-3 p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden",
                    isActive ? "ring-2 ring-slate-900 shadow-xl" : "shadow-sm border-slate-100",
                    task.completed ? "bg-slate-50/50 opacity-60" : "bg-white hover:border-slate-300"
                  )}
                >
                  {/* Progress Header Overlay */}
                  {!task.completed && (
                    <motion.div 
                      className="absolute inset-0 bg-slate-900/5 -z-10 origin-left"
                      style={{ width: `${progress}%` }}
                    />
                  )}

                  <div className="flex items-start gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                      className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        task.completed 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "border-slate-200 hover:border-slate-900"
                      )}
                    >
                      {task.completed && <Check size={14} strokeWidth={4} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.15em]",
                          getPriorityColor(task.priority)
                        )}>
                          {Priority[task.priority]}
                        </span>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[8px] font-black text-slate-900 uppercase tracking-widest animate-pulse">
                            <span className="w-1 h-1 bg-slate-900 rounded-full" />
                            Current Task
                          </span>
                        )}
                      </div>
                      <h4 className={cn(
                        "text-sm font-bold truncate",
                        task.completed ? "line-through text-slate-400" : "text-slate-800"
                      )}>
                        {task.title}
                      </h4>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(task);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-amber-500 transition-all rounded-xl"
                    >
                      <Bell size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {task.dueDate}</span>
                      <span>{Math.round(progress)}% Left</span>
                    </div>
                    
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - progress}%` }} // Showing remaining percentage as bar width
                        className={cn(
                          "h-full transition-colors",
                          task.priority === Priority.HIGH ? "bg-rose-500" : 
                          task.priority === Priority.MEDIUM ? "bg-amber-500" : "bg-blue-500"
                        )}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
