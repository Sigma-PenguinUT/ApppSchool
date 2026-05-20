/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import Timer from './components/Timer';
import Tasks from './components/Tasks';
import ProgressTracker from './components/ProgressTracker';
import VolunteerTracker from './components/VolunteerTracker';
import ScheduleView from './components/ScheduleView';
import { Calendar, Music, Sparkles, Coffee, Heart, User, Layout, ListChecks, Trophy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Task, Priority } from './types';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'volunteer'>('dashboard');
  const [tab, setTab] = useState<'timer' | 'schedule'>('timer');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [sessionStats, setSessionStats] = useState({
    sessionTime: 0,
    pomodoros: 0,
    score: 0
  });
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'info' } | null>(null);
  const [priorCompletedIds, setPriorCompletedIds] = useState<string[]>([]);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      
      playTone(523.25, 0, 0.3);      // C5
      playTone(659.25, 0.1, 0.3);    // E5
      playTone(783.99, 0.2, 0.3);    // G5
      playTone(1046.50, 0.3, 0.5);   // C6
    } catch (e) {
      console.warn("Audio Context chime failed", e);
    }
  };

  useEffect(() => {
    const completedIds = tasks.filter(t => t.completed).map(t => t.id);
    const newlyCompleted = tasks.find(t => t.completed && !priorCompletedIds.includes(t.id));
    
    if (newlyCompleted && priorCompletedIds.length > 0) {
      setToast({
        title: "Goal Achieved! 🏆",
        message: `Task "${newlyCompleted.title}" has been successfully completed.`,
        type: "success"
      });
      playChime();
    }
    
    setPriorCompletedIds(completedIds);
  }, [tasks, priorCompletedIds]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const completedCount = tasks.filter(t => t.completed).length;

  // Find active task
  const activeTask = tasks.find(t => t.id === activeTaskId) || 
                   [...tasks].sort((a,b) => b.priority - a.priority).find(t => !t.completed);

  // Sync active task back to state if it was auto-selected
  useEffect(() => {
    if (!activeTaskId && activeTask) {
      setActiveTaskId(activeTask.id);
    }
  }, [activeTaskId, activeTask]);

  useEffect(() => {
    const handlePomodoro = () => {
      setSessionStats(prev => ({ ...prev, pomodoros: prev.pomodoros + 1 }));
    };
    window.addEventListener('pomodoro-complete', handlePomodoro);
    return () => window.removeEventListener('pomodoro-complete', handlePomodoro);
  }, []);

  const onTimerTick = useCallback(() => {
    if (activeTaskId) {
      setTasks(prevTasks => {
        const currentTask = prevTasks.find(t => t.id === activeTaskId);
        if (!currentTask || currentTask.completed) return prevTasks;

        const updatedRemaining = currentTask.remainingTime - 1;
        
        if (updatedRemaining <= 0) {
          // Task completed!
          const nextTasks = prevTasks.map(t => 
            t.id === activeTaskId ? { ...t, remainingTime: 0, completed: true } : t
          );
          
          // Switch to next task strategy:
          // The next highest priority uncompleted task
          const remainingUncompleted = nextTasks.filter(t => !t.completed).sort((a,b) => b.priority - a.priority);
          if (remainingUncompleted.length > 0) {
            setActiveTaskId(remainingUncompleted[0].id);
          } else {
            setActiveTaskId(null);
          }
          
          return nextTasks;
        }

        return prevTasks.map(t => 
          t.id === activeTaskId ? { ...t, remainingTime: updatedRemaining } : t
        );
      });
    }
    
    setSessionStats(prev => ({ ...prev, sessionTime: prev.sessionTime + 1 }));
  }, [activeTaskId]);

  const formatSessionTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    if (tasks.length === 0) return 0;
    const totalWeight = tasks.reduce((acc, t) => acc + t.priority, 0);
    const completedWeight = tasks.filter(t => t.completed).reduce((acc, t) => acc + t.priority, 0);
    const timeBonus = Math.floor(sessionStats.sessionTime / 300); // Bonus for every 5 mins
    return Math.min(100, Math.round((completedWeight / totalWeight) * 100) + timeBonus);
  };

  const getRank = (score: number) => {
    if (score > 90) return { title: 'Grandmaster', color: 'text-rose-500' };
    if (score > 75) return { title: 'Elite Scholar', color: 'text-amber-500' };
    if (score > 50) return { title: 'Focused', color: 'text-blue-500' };
    if (score > 25) return { title: 'Apprentice', color: 'text-slate-500' };
    return { title: 'Novice', color: 'text-slate-400' };
  };

  const currentRank = getRank(calculateScore());

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 md:px-10">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <header className="w-full max-w-7xl flex justify-between items-center mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setView('dashboard')}
        >
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">FocusFlow</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Minimal Study Deck</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 md:gap-4"
        >
          {/* Role Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setRole('student')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all",
                role === 'student' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Matthew (S)
            </button>
            <button 
              onClick={() => setRole('teacher')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all",
                role === 'teacher' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Teacher
            </button>
          </div>

          <div className="glass-card px-4 md:px-6 py-2 flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => setView(view === 'dashboard' ? 'volunteer' : 'dashboard')}
              className={cn(
                "flex items-center gap-2 transition-colors text-[11px] font-bold uppercase tracking-wider btn-interactive",
                view === 'volunteer' ? "text-rose-500" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Heart size={14} className={view === 'volunteer' ? "fill-current" : ""} />
              <span className="hidden sm:inline">Impact</span>
            </button>
            <div className="w-px h-4 bg-slate-200" />
            <div className="hidden md:flex items-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <Calendar size={14} />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="w-full max-w-7xl">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Main Content: 8 Columns */}
              <div className="lg:col-span-8 flex flex-col gap-8 w-full">
                {/* Tab Navigation */}
                <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-sm border border-slate-100 rounded-2xl w-fit">
                  <button 
                    onClick={() => setTab('timer')}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      tab === 'timer' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Layout size={14} />
                    Timer
                  </button>
                  <button 
                    onClick={() => setTab('schedule')}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      tab === 'schedule' ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Calendar size={14} />
                    Schedule
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {tab === 'timer' ? (
                    <motion.div 
                      key="timer-view"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
                    >
                      {/* Left: Timer */}
                      <div className="w-full h-full">
                        <Timer 
                          onTick={onTimerTick} 
                          activeTask={activeTask}
                        />
                      </div>

                      {/* Right: Tracker Stack */}
                      <div className="flex flex-col gap-8 h-full">
                        <div className="glass-card p-8 flex-1 flex flex-col justify-center">
                          <ProgressTracker total={tasks.length} completed={completedCount} />
                        </div>
                        
                        <div 
                          onClick={() => setView('volunteer')}
                          className="glass-card p-6 flex items-center gap-4 cursor-pointer hover:bg-rose-50/50 transition-colors group"
                        >
                          <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 group-hover:scale-110 transition-transform">
                            <Heart size={20} />
                          </div>
                          <div>
                            <h4 className="text-slate-800 text-sm font-bold">Impact Meter</h4>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Volunteer Hours & Metrics</p>
                          </div>
                          <Sparkles className="ml-auto text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="schedule-view"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <ScheduleView tasks={tasks} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom Row Stats */}
                <div className="glass-card p-8 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="flex flex-col">
                      <h3 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-[0.2em]">Session Time</h3>
                      <span className="text-2xl font-mono font-bold text-slate-900">{formatSessionTime(sessionStats.sessionTime)}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-100 sm:pl-8">
                      <h3 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-[0.2em]">Pomodoros</h3>
                      <span className="text-2xl font-mono font-bold text-slate-900">{sessionStats.pomodoros}</span>
                    </div>
                    <div className="flex flex-col border-l border-slate-100 sm:pl-8">
                      <h3 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-[0.2em]">Rank & Mastery</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-mono font-bold text-slate-300">{calculateScore()}%</span>
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", currentRank.color)}>
                          {currentRank.title}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar: 4 Columns */}
              <aside className="lg:col-span-4 glass-card p-8 flex flex-col min-h-[600px] lg:h-[calc(100vh-200px)] lg:sticky lg:top-10">
                {role === 'teacher' ? (
                  <div className="flex flex-col h-full items-center justify-center text-center p-6 bg-slate-900 rounded-3xl text-white">
                    <User className="text-amber-400 mb-4" size={48} />
                    <h3 className="text-lg font-bold mb-2">Teacher Dashboard</h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      Review student progress, manage class assignments, and monitor collective study time.
                    </p>
                    <div className="w-full space-y-3">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between">
                        <span className="text-[10px] font-bold uppercase">Assigned Tasks</span>
                        <span className="text-amber-400 font-mono">{tasks.length}</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between">
                        <span className="text-[10px] font-bold uppercase">Class Score</span>
                        <span className="text-emerald-400 font-mono">{calculateScore()}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Tasks 
                    tasks={tasks} 
                    setTasks={setTasks} 
                    activeTaskId={activeTaskId} 
                    setActiveTaskId={setActiveTaskId} 
                  />
                )}
                
                <div className="mt-8 pt-6 border-t border-slate-100">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Global Sync</span>
                   </div>
                   <p className="text-[11px] text-slate-500 font-medium">Connecting you with a worldwide network of focus.</p>
                </div>
              </aside>
            </motion.div>
          ) : (
            <motion.div
              key="volunteer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VolunteerTracker />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 py-10 w-full max-w-7xl border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          &copy; 2026 FocusFlow &bull; Redefined for Purity
        </p>
        <div className="flex gap-8">
          <button className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Privacy</button>
          <button className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Terms</button>
          <button className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-colors">Support</button>
        </div>
      </footer>

      {/* Custom Celebration Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-slate-800 text-white rounded-3xl p-5 shadow-2xl flex items-start gap-4 backdrop-blur-md"
          >
            <div className="p-3 bg-amber-500/15 rounded-2xl text-amber-400 flex-shrink-0">
              <Trophy size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-white">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
