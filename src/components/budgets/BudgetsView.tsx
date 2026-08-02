import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Wallet, Settings2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const BudgetsView: React.FC = () => {
  const { summaryMetrics, budgetConfig, updateBudgets, settings } = useApp();
  const sym = settings.currency.symbol;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weeklyInput, setWeeklyInput] = useState(budgetConfig.weekly.toString());
  const [monthlyInput, setMonthlyInput] = useState(budgetConfig.monthly.toString());
  const [yearlyInput, setYearlyInput] = useState(budgetConfig.yearly.toString());

  const handleOpenModal = () => {
    setWeeklyInput(budgetConfig.weekly.toString());
    setMonthlyInput(budgetConfig.monthly.toString());
    setYearlyInput(budgetConfig.yearly.toString());
    setIsModalOpen(true);
  };

  const handleSaveBudgets = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBudgets({
      weekly: parseFloat(weeklyInput) || 0,
      monthly: parseFloat(monthlyInput) || 0,
      yearly: parseFloat(yearlyInput) || 0,
    });
    setIsModalOpen(false);
  };

  const budgetCards = [
    {
      period: 'Weekly Budget',
      spent: summaryMetrics.weeklyBudget.spent,
      budget: summaryMetrics.weeklyBudget.budget,
      remaining: summaryMetrics.weeklyBudget.remaining,
      pct: summaryMetrics.weeklyBudget.percentageUsed,
      accentColor: '#3B82F6',
    },
    {
      period: 'Monthly Budget',
      spent: summaryMetrics.monthlyBudget.spent,
      budget: summaryMetrics.monthlyBudget.budget,
      remaining: summaryMetrics.monthlyBudget.remaining,
      pct: summaryMetrics.monthlyBudget.percentageUsed,
      accentColor: '#6366F1',
    },
    {
      period: 'Yearly Budget',
      spent: summaryMetrics.yearlyBudget.spent,
      budget: summaryMetrics.yearlyBudget.budget,
      remaining: summaryMetrics.yearlyBudget.remaining,
      pct: summaryMetrics.yearlyBudget.percentageUsed,
      accentColor: '#8B5CF6',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-400" />
            <span>Budget Control Center</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Set and track your weekly, monthly, and yearly spending limits.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all self-start md:self-auto"
        >
          <Settings2 className="w-4 h-4" />
          <span>Configure Budgets</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {budgetCards.map((b, idx) => {
          const isOver = b.pct > 100;
          const isWarning = b.pct >= 80 && !isOver;

          return (
            <div
              key={idx}
              className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-slate-100">{b.period}</h4>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      isOver
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {b.pct}% Used
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-extrabold text-slate-100">
                    {sym}{b.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Target Limit: <span className="font-semibold text-slate-200">{sym}{b.budget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-6">
                  <div className="w-full h-3 rounded-full bg-slate-900/90 border border-slate-800 p-0.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, b.pct)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isOver
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Remaining Budget</span>
                  <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {sym}{b.remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-xs">
                {isOver ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-rose-300">Target limit exceeded by {sym}{(b.spent - b.budget).toFixed(2)}</span>
                  </>
                ) : isWarning ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-amber-300">Approaching spending limit</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">Healthy spending velocity</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Budget Targets">
        <form onSubmit={handleSaveBudgets} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Weekly Budget ({sym})</label>
            <input
              type="number"
              required
              min="1"
              value={weeklyInput}
              onChange={(e) => setWeeklyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Budget ({sym})</label>
            <input
              type="number"
              required
              min="1"
              value={monthlyInput}
              onChange={(e) => setMonthlyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Yearly Budget ({sym})</label>
            <input
              type="number"
              required
              min="1"
              value={yearlyInput}
              onChange={(e) => setYearlyInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
            >
              Save Targets
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
