import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { PaymentMethod } from '../../types';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download 
} from 'lucide-react';
import { exportToCsv } from '../../services/exportImportService';

export const TransactionListView: React.FC = () => {
  const { 
    transactions, 
    categories, 
    settings, 
    setIsAddModalOpen, 
    setEditingTransaction, 
    deleteTransaction 
  } = useApp();

  const sym = settings.currency.symbol;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'highest' | 'lowest'>('latest');

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const paymentMethodsList: PaymentMethod[] = [
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'UPI',
    'Cash',
    'PayPal',
    'Other',
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        !searchTerm ||
        tx.title.toLowerCase().includes(searchLower) ||
        tx.category.toLowerCase().includes(searchLower) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchLower));

      const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
      const matchesPayment = selectedPaymentMethod === 'all' || tx.paymentMethod === selectedPaymentMethod;
      const matchesType = selectedType === 'all' || tx.type === selectedType;
      const matchesStartDate = !startDate || tx.date >= startDate;
      const matchesEndDate = !endDate || tx.date <= endDate;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPayment &&
        matchesType &&
        matchesStartDate &&
        matchesEndDate
      );
    }).sort((a, b) => {
      if (sortBy === 'latest') return b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, searchTerm, selectedCategory, selectedPaymentMethod, selectedType, startDate, endDate, sortBy]);

  const getCategoryDetails = (catName: string) => {
    return categories.find((c) => c.name === catName) || {
      icon: 'Tag',
      color: '#94A3B8',
    };
  };

  const handleExportCsv = () => {
    exportToCsv(filteredTransactions);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, category, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 text-xs font-semibold transition-all"
              title="Export displayed transactions to CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-800/60 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Payment Method</label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Payment Methods</option>
              {paymentMethodsList.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Date Range</label>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 px-2 py-2 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-200 focus:outline-none text-[11px]"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-1/2 px-2 py-2 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-200 focus:outline-none text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-300">
            Showing <span className="text-indigo-400">{filteredTransactions.length}</span> records
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No transactions match your search or filter parameters.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTransactions.map((tx) => {
              const catInfo = getCategoryDetails(tx.category);
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 transition-all gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                      style={{ backgroundColor: `${catInfo.color}15`, border: `1px solid ${catInfo.color}30` }}
                    >
                      <CategoryIcon name={catInfo.icon} color={catInfo.color} className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-200 transition-colors">
                          {tx.title}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                          {tx.paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="font-medium text-slate-300">{tx.category}</span>
                        <span>•</span>
                        <span>{tx.date} at {tx.time}</span>
                        {tx.notes && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-xs text-slate-400">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div className="text-right">
                      <div
                        className={`text-base font-bold flex items-center justify-end gap-1 ${
                          isIncome ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                        )}
                        <span>
                          {isIncome ? '+' : '-'}{sym}{tx.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">{tx.type}</div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTransaction(tx)}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                        title="Edit entry"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(tx.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteTransaction(deletingId);
        }}
        title="Delete Transaction"
        message="Are you sure you want to remove this transaction? Your total balance and budget metrics will update automatically."
      />
    </div>
  );
};
