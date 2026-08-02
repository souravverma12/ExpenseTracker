import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  CalendarDays, 
  CalendarRange, 
  TrendingUp, 
  Wallet, 
  PiggyBank, 
  Clock, 
  Percent 
} from 'lucide-react';

export const MetricsGrid: React.FC = () => {
  const { summaryMetrics, settings } = useApp();
  const sym = settings.currency.symbol;

  const cards = [
    {
      title: "Today's Expenses",
      value: `${sym}${summaryMetrics.todayExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Weekly Expenses',
      value: `${sym}${summaryMetrics.weeklyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CalendarDays,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Monthly Expenses',
      value: `${sym}${summaryMetrics.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Calendar,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Yearly Expenses',
      value: `${sym}${summaryMetrics.yearlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CalendarRange,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Monthly Income',
      value: `${sym}${summaryMetrics.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Current Balance',
      value: `${sym}${summaryMetrics.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Wallet,
      color: summaryMetrics.currentBalance >= 0 ? 'text-teal-400' : 'text-rose-400',
      bgColor: 'bg-teal-500/10 border-teal-500/20',
    },
    {
      title: 'Monthly Savings',
      value: `${sym}${summaryMetrics.monthlySavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: PiggyBank,
      color: summaryMetrics.monthlySavings >= 0 ? 'text-cyan-400' : 'text-rose-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Weekly Budget Remaining',
      value: `${sym}${summaryMetrics.weeklyBudget.remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${summaryMetrics.weeklyBudget.percentageUsed}% used of ${sym}${summaryMetrics.weeklyBudget.budget}`,
      icon: Percent,
      color: summaryMetrics.weeklyBudget.percentageUsed > 90 ? 'text-rose-400' : 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Monthly Budget Remaining',
      value: `${sym}${summaryMetrics.monthlyBudget.remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${summaryMetrics.monthlyBudget.percentageUsed}% used of ${sym}${summaryMetrics.monthlyBudget.budget}`,
      icon: Percent,
      color: summaryMetrics.monthlyBudget.percentageUsed > 90 ? 'text-rose-400' : 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Yearly Budget Remaining',
      value: `${sym}${summaryMetrics.yearlyBudget.remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${summaryMetrics.yearlyBudget.percentageUsed}% used of ${sym}${summaryMetrics.yearlyBudget.budget}`,
      icon: Percent,
      color: summaryMetrics.yearlyBudget.percentageUsed > 90 ? 'text-rose-400' : 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 tracking-tight">{card.title}</span>
              <div className={`p-2 rounded-xl border ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-100 tracking-tight">{card.value}</div>
              {card.subtitle && (
                <div className="text-[11px] text-slate-400 mt-1 font-medium">{card.subtitle}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
