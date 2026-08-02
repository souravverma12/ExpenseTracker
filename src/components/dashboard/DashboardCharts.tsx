import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  getWeeklySpendingData, 
  getIncomeVsExpenseData 
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
import { DollarSign, TrendingUp } from 'lucide-react';

export const DashboardCharts: React.FC = () => {
  const { transactions, settings } = useApp();
  const sym = settings.currency.symbol;

  const weeklyData = getWeeklySpendingData(transactions);
  const incomeVsExpenseData = getIncomeVsExpenseData(transactions);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Weekly Spending Breakdown (Bar Chart) */}
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

      {/* 2. Income vs. Expenses (6 Months) */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-slate-100">Income vs. Expenses (6 Months)</h4>
            <p className="text-xs text-slate-400">Comparative financial flow analysis over time</p>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="h-72 w-full pt-4">
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
  );
};
