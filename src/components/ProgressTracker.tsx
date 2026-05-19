import React from 'react';
import { motion } from 'motion/react';
import { Target, Trophy, Flame } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProgressTrackerProps {
  total: number;
  completed: number;
}

export default function ProgressTracker({ total, completed }: ProgressTrackerProps) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  const strokeDasharray = 440; // 2 * PI * r (r=70)
  const offset = strokeDasharray - (strokeDasharray * percentage) / 100;
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3 w-full">
        <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
          <Target size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 leading-none mb-1">Task Mastery</h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{completed} of {total} completed</p>
        </div>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Glow Effect */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-2xl opacity-10 transition-all duration-1000",
          percentage === 100 ? "bg-emerald-500" : "bg-amber-500"
        )} />
        
        <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(245,158,11,0.1)]">
          <circle
            cx="96"
            cy="96"
            r="70"
            className="stroke-slate-100 fill-none"
            strokeWidth="12"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="70"
            className={cn(
              "fill-none stroke-current transition-colors duration-500",
              percentage === 100 ? "text-emerald-500" : "text-amber-500"
            )}
            strokeWidth="12"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: strokeDasharray }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "circOut" }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            key={percentage}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-mono font-black text-slate-900"
          >
            {percentage}%
          </motion.span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Done</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
          <Flame size={16} className="text-orange-500" />
          <span className="text-xs text-slate-400 font-medium">Streak</span>
          <span className="text-lg font-bold text-slate-800">0 Days</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
          <Trophy size={16} className="text-amber-500" />
          <span className="text-xs text-slate-400 font-medium">Rank</span>
          <span className="text-lg font-bold text-slate-800">Novice</span>
        </div>
      </div>
    </div>
  );
}
