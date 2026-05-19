import React from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { Task, Priority } from '../types';
import { cn } from '../lib/utils';

interface ScheduleViewProps {
  tasks: Task[];
}

export default function ScheduleView({ tasks }: ScheduleViewProps) {
  // Sort tasks by date then time
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(`${a.dueDate}T${a.dueTime}`);
    const dateB = new Date(`${b.dueDate}T${b.dueTime}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Group by date
  const groups = sortedTasks.reduce((acc, task) => {
    if (!acc[task.dueDate]) acc[task.dueDate] = [];
    acc[task.dueDate].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const dates = Object.keys(groups).sort();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Agenda</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Timeline & Deadlines</p>
        </div>
        <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <CalendarIcon className="text-amber-500" size={20} />
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="glass-card p-12 bg-white flex flex-col items-center text-center">
          <AlertCircle className="text-slate-100 mb-4" size={48} />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">No assignments scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100">
          {dates.map((date) => (
            <div key={date} className="relative pl-10">
              <div className="absolute left-0 top-1.5 w-6 h-6 bg-white border-4 border-amber-400 rounded-full z-10" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              
              <div className="grid gap-4">
                {groups[date].map((task) => (
                  <motion.div
                    whileHover={{ x: 4 }}
                    key={task.id}
                    className={cn(
                      "glass-card p-5 bg-white flex items-center justify-between group border-l-4",
                      task.priority === Priority.HIGH ? "border-l-rose-500" :
                      task.priority === Priority.MEDIUM ? "border-l-amber-500" : "border-l-blue-500"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <Clock size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">{task.dueTime}</span>
                          <span className={cn(
                            "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                            task.completed ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                          )}>
                            {task.completed ? 'Done' : 'Pending'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">{task.title}</h4>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-200 group-hover:text-slate-400 transition-colors" size={20} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
