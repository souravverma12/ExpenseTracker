import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';

export const RecentTransactions: React.FC = () => {
  const { 
    transactions, 
    categories, 
    settings, 
    setEditingTransaction, 
    deleteTransaction,
    setActiveTab 
  } = useApp();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sym = settings.currency.symbol;
  const recentList = transactions.slice(0, 6);

  const getCategoryDetails = (catName: string) => {
    return categories.find((c) => c.name === catName) || {
      icon: 'Tag',
      color: '#94A3B8',
    };
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-100">Recent Transactions</h3>
          <p className="text-xs text-slate-400">Latest activity across all accounts</p>
        </div>
        <button
          onClick={() => setActiveTab('transactions')}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentList.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No recent transactions found. Click "+ Add Transaction" to create your first entry.
        </div>
      ) : (
        <div className="space-y-3">
          {recentList.map((tx) => {
            const catInfo = getCategoryDetails(tx.category);
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700/60 transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                    style={{ backgroundColor: `${catInfo.color}15`, border: `1px solid ${catInfo.color}30` }}
                  >
                    <CategoryIcon name={catInfo.icon} color={catInfo.color} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {tx.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/50">
                        {tx.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold flex items-center justify-end gap-1 ${
                        isIncome ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span>
                        {isIncome ? '+' : '-'}{sym}{tx.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{tx.time}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingTransaction(tx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                      title="Edit transaction"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(tx.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteTransaction(deletingId);
        }}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? This action cannot be undone."
      />
    </div>
  );
};
