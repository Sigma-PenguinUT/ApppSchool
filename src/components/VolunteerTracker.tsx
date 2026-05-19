import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Plus, Trash2, Calendar, Clock, FileText, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface VolunteerEntry {
  id: string;
  title: string;
  date: string;
  hours: number;
  description: string;
}

export default function VolunteerTracker() {
  const [entries, setEntries] = useState<VolunteerEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: ''
  });

  const GOAL = 40;
  const totalHours = entries.reduce((acc, curr) => acc + curr.hours, 0);
  const percentage = Math.min((totalHours / GOAL) * 100, 100);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.hours) return;

    const newEntry: VolunteerEntry = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      date: formData.date,
      hours: parseFloat(formData.hours),
      description: formData.description
    };

    setEntries([newEntry, ...entries]);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      hours: '',
      description: ''
    });
    setIsAdding(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Summary */}
      <div className="glass-card p-8 bg-white border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[80px] rounded-full -mr-20 -mt-20" />
        
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500 rounded-2xl text-white shadow-lg shadow-rose-500/20">
                <Heart size={24} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Volunteer Impact</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Graduation Requirement Tracker</p>
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-mono font-black text-slate-900">{totalHours}</span>
              <span className="text-xl font-bold text-slate-400">/ {GOAL} hrs</span>
            </div>
          </div>

          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all btn-interactive"
          >
            {isAdding ? <Plus className="rotate-45" size={18} /> : <Plus size={18} />}
            {isAdding ? 'Cancel' : 'Log New Hours'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-slate-400">
            <span>Overall Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className="h-full bg-gradient-to-r from-rose-500 to-rose-400"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Form or Info */}
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="md:col-span-5 glass-card p-6 bg-white sticky top-10"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-rose-500" />
                Add Details
              </h3>
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Event/Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Food Bank Help"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Duration (Hrs)</label>
                    <input
                      required
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.hours}
                      onChange={e => setFormData({...formData, hours: e.target.value})}
                      placeholder="Hours"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Briefly describe your role..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-rose-500 text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all btn-interactive"
                >
                  Save Entry
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="md:col-span-5 space-y-6 md:sticky md:top-10"
            >
              <div className="glass-card p-6 bg-slate-900 text-white">
                <Info className="text-rose-400 mb-4" size={24} />
                <h4 className="text-lg font-bold mb-2">Why track hours?</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Keeping a detailed record of your volunteer work helps with graduation requirements, 
                  college applications, and resumes. It's a testament to your commitment to the community.
                </p>
                <div className="mt-6 p-4 rounded-xl bg-slate-800 border border-slate-700/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Requirement Status</p>
                  {totalHours >= GOAL ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold">Goal Achieved!</span>
                    </div>
                  ) : (
                    <p className="text-xs font-bold">{GOAL - totalHours} hours remaining</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right: Timeline */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Activity Log</h3>
          
          {entries.length === 0 ? (
            <div className="glass-card p-12 bg-white flex flex-col items-center text-center">
              <Clock className="text-slate-100 mb-4" size={48} />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">No entries yet. Start by logging your first task.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={entry.id}
                  className="glass-card p-6 bg-white hover:border-rose-200 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800">{entry.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {entry.date}</span>
                          <span className="flex items-center gap-1 text-rose-500 font-black"><Clock size={10} /> {entry.hours} Hours</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {entry.description && (
                    <p className="text-xs text-slate-500 leading-relaxed pl-14 italic border-l-2 border-slate-100">
                      "{entry.description}"
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
