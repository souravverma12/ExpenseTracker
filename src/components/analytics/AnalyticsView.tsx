import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  getWeeklySpendingData, 
  getIncomeVsExpenseData, 
  getBudgetVsActualData 
} from '../../services/analyticsService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Wallet } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { transactions, budgetConfig, summaryMetrics, settings } = useApp();
  const sym = settings.currency.symbol;

  const weeklyData = getWeeklySpendingData(transactions);
  const incomeVsExpenseData = getIncomeVsExpenseData(transactions);
  const budgetVsActualData = getBudgetVsActualData(
    transactions,
    budgetConfig,
    summaryMetrics.weeklyExpenses,
    summaryMetrics.monthlyExpenses,
    summaryMetrics.yearlyExpenses
  );

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-100">Financial Visual Analytics</h3>
          <p className="text-xs text-slate-400">
            Interactive charts analyzing weekly spending, income vs. expenses, and budget velocity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Weekly Spending (Bar Chart) */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-100">Weekly Spending Breakdown</h4>
              <p className="text-xs text-slate-400">Daily expenses for the current week</p>
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${sym}${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`${sym}${Number(val || 0).toFixed(2)}`, 'Spent']}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Budget vs Actual (Bar Chart) */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-100">Budget vs. Actual Spending</h4>
              <p className="text-xs text-slate-400">Comparing spending limits against actuals</p>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${sym}${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`${sym}${Number(val || 0).toFixed(2)}`]}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                <Bar dataKey="budget" name="Budget Limit" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="actual" name="Actual Spent" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Income vs Expenses */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/80 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-100">Income vs. Expenses (6 Months)</h4>
              <p className="text-xs text-slate-400">Comparative financial flow analysis over time</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${sym}${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`${sym}${Number(val || 0).toFixed(2)}`]}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                <Bar dataKey="income" name="Total Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Total Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="savings" name="Net Savings" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
