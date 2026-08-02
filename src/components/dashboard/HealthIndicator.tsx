import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const HealthIndicator: React.FC = () => {
  const { healthScore } = useApp();

  const getEmoji = (status: string) => {
    switch (status) {
      case 'Excellent':
        return '🟢';
      case 'Good':
        return '🟡';
      case 'Warning':
        return '🟠';
      default:
        return '🔴';
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
        {/* Score & Badge */}
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700/60 shadow-xl">
            <span className="text-3xl font-extrabold text-slate-100">{healthScore.score}</span>
            <span className="text-[10px] font-bold text-slate-400 absolute bottom-1.5">/100</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-100">Financial Health Score</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getEmoji(healthScore.status)}</span>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-900 shadow-sm"
                style={{ backgroundColor: healthScore.badgeColor }}
              >
                {healthScore.status}
              </span>
            </div>
          </div>
        </div>

        {/* Score Animated Bar */}
        <div className="flex-1 max-w-md">
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Budget Health Gauge</span>
            <span className="text-indigo-400">{healthScore.score}% Optimal</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-900/80 border border-slate-800 overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${healthScore.score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: healthScore.badgeColor }}
            />
          </div>
        </div>
      </div>

      {/* Smart Insights */}
      <div className="pt-5">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4" />
          <span>Smart Spending Insights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {healthScore.insights.map((insight, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-sm text-slate-300"
            >
              <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
