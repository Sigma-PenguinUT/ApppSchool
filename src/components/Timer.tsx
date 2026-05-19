import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Task } from '../types';

type TimerMode = 'study' | 'break';

const MODES = {
  study: {
    label: 'Study Time',
    seconds: 25 * 60,
    icon: BookOpen,
    color: 'text-amber-400'
  },
  break: {
    label: 'Rest Time',
    seconds: 5 * 60,
    icon: Coffee,
    color: 'text-emerald-400'
  }
};

interface TimerProps {
  onTick?: () => void;
  activeTask?: Task;
}

export default function Timer({ onTick, activeTask }: TimerProps) {
  const [mode, setMode] = useState<TimerMode>('study');
  const [timeLeft, setTimeLeft] = useState(MODES.study.seconds);
  const [isActive, setIsActive] = useState(false);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(MODES[mode].seconds);
  }, [mode]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].seconds);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (onTick && mode === 'study') onTick();
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const nextMode = mode === 'study' ? 'break' : 'study';
      
      // Update pomodoro count if study session completed
      if (mode === 'study' && onTick) {
        // We'll use a hack to notify the parent or just assume if it was study mode
        window.dispatchEvent(new CustomEvent('pomodoro-complete'));
      }

      setMode(nextMode);
      setTimeLeft(MODES[nextMode].seconds);
      
      // Simple notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("Focus Session Over!", { body: `Time for a ${nextMode}.` });
      } else {
        alert(`${mode.toUpperCase()} session complete!`);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, onTick]);

  // Handle outside task completion (if task finishes before timer)
  useEffect(() => {
    if (activeTask && activeTask.completed && isActive) {
      // In a real app, you might want to show a small toast here
      console.log("Task completed, moving to next...");
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("Task Completed!", { body: `${activeTask.title} is done!` });
      }
    }
  }, [activeTask?.completed]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / MODES[mode].seconds) * 100;
  const ActiveIcon = MODES[mode].icon;

  return (
    <div className="flex flex-col items-center justify-center p-8 glass-card w-full max-w-md mx-auto relative overflow-hidden">
      {/* Active Task Mini Indicator */}
      <AnimatePresence>
        {activeTask && !activeTask.completed && mode === 'study' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-full shadow-lg"
          >
            <Target size={12} className="text-amber-400 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[120px]">
              {activeTask.title}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-4 mt-8 mb-8">
        {(['study', 'break'] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all btn-interactive",
              mode === m 
                ? "bg-slate-800 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Animated Background Pulse */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.1 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={cn("absolute inset-0 rounded-full bg-current", MODES[mode].color)}
            />
          )}
        </AnimatePresence>

        <div className="z-10 flex flex-col items-center">
          <motion.div
            key={mode}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn("flex items-center gap-2 mb-2 uppercase tracking-widest text-[10px] font-bold", MODES[mode].color)}
          >
            <ActiveIcon size={14} />
            {MODES[mode].label}
          </motion.div>
          
          <div className="text-7xl font-mono font-bold tracking-tighter text-slate-800 tabular-nums">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Circular Progress (CSS only) */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="110"
            className="stroke-slate-100 fill-none"
            strokeWidth="8"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="110"
            className={cn("fill-none stroke-current transition-colors duration-500", MODES[mode].color)}
            strokeWidth="8"
            strokeDasharray="691"
            animate={{ strokeDashoffset: 691 - (691 * (100 - progress)) / 100 }}
            transition={{ duration: 0.5, ease: "linear" }}
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex gap-6 mt-12">
        <button
          onClick={resetTimer}
          className="p-4 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all btn-interactive"
          title="Reset"
        >
          <RotateCcw size={24} />
        </button>
        
        <button
          onClick={toggleTimer}
          className={cn(
            "p-6 rounded-3xl transition-all shadow-lg btn-interactive",
            isActive 
              ? "bg-slate-100 text-slate-600" 
              : "bg-slate-900 text-white"
          )}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
        </button>

        <div className="w-14" /> {/* Spacer to balance reset button */}
      </div>
    </div>
  );
}
