import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Transaction } from '../../types';
import { Modal } from '../ui/Modal';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay 
} from 'date-fns';

export const CalendarView: React.FC = () => {
  const { 
    transactions, 
    categories, 
    settings, 
    setIsAddModalOpen, 
    setPresetDateForAdd, 
    setEditingTransaction,
    deleteTransaction 
  } = useApp();

  const sym = settings.currency.symbol;

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isDayDetailOpen, setIsDayDetailOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const daysGrid = eachDayOfInterval({ start: startDate, end: endDate });

  const txByDateMap = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    transactions.forEach((tx) => {
      if (!map[tx.date]) map[tx.date] = [];
      map[tx.date].push(tx);
    });
    return map;
  }, [transactions]);

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const selectedDayTransactions = transactions.filter((t) => t.date === selectedDateStr);

  const getCategoryDetails = (catName: string) => {
    return categories.find((c) => c.name === catName) || {
      icon: 'Tag',
      color: '#94A3B8',
    };
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDayDetailOpen(true);
  };

  const handleAddForSelectedDay = () => {
    if (selectedDate) {
      setPresetDateForAdd(format(selectedDate, 'yyyy-MM-dd'));
      setEditingTransaction(null);
      setIsDayDetailOpen(false);
      setIsAddModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-100">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              Select any day to inspect or record expenses & income.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-700/50 text-[11px] font-semibold text-slate-200 transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-card p-3 sm:p-6 rounded-2xl border border-slate-800/80 overflow-x-auto">
        <div className="min-w-[320px]">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-2 sm:mb-4 pb-2 border-b border-slate-800/60">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div className="text-indigo-400">Sat</div>
            <div className="text-indigo-400">Sun</div>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {daysGrid.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayTxs = txByDateMap[dateStr] || [];
              const hasExpenses = dayTxs.some((t) => t.type === 'expense');
              const hasIncome = dayTxs.some((t) => t.type === 'income');
              const totalExpense = dayTxs
                .filter((t) => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[55px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden ${
                    !isCurrentMonth
                      ? 'opacity-30 border-transparent bg-slate-900/20'
                      : isToday
                      ? 'bg-indigo-600/15 border-indigo-500/60 shadow-lg shadow-indigo-900/20'
                      : dayTxs.length > 0
                      ? 'bg-slate-900/60 border-slate-700/60 hover:border-indigo-500/40'
                      : 'bg-slate-900/30 border-slate-800/40 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[10px] sm:text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center'
                          : isCurrentMonth
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {hasIncome && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" />}
                      {hasExpenses && <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400" />}
                    </div>
                  </div>

                  {totalExpense > 0 && (
                    <div className="mt-1 sm:mt-2 text-right">
                      <span className="text-[9px] sm:text-[11px] font-bold text-rose-300 block">
                        -{sym}{totalExpense.toFixed(0)}
                      </span>
                      <span className="hidden sm:inline text-[10px] text-slate-500 font-medium">
                        {dayTxs.length} {dayTxs.length === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      <Modal
        isOpen={isDayDetailOpen}
        onClose={() => setIsDayDetailOpen(false)}
        title={selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Day Details'}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-300">
              Transactions for this day ({selectedDayTransactions.length})
            </h4>
            <button
              onClick={handleAddForSelectedDay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
            </button>
          </div>

          {selectedDayTransactions.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">
              No transactions recorded for this day.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {selectedDayTransactions.map((tx) => {
                const catInfo = getCategoryDetails(tx.category);
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${catInfo.color}15`, border: `1px solid ${catInfo.color}30` }}
                      >
                        <CategoryIcon name={catInfo.icon} color={catInfo.color} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-100 truncate max-w-[130px] sm:max-w-none">{tx.title}</div>
                        <div className="text-[10px] sm:text-xs text-slate-400">
                          {tx.category} • {tx.paymentMethod} • {tx.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-right">
                        <div className={`text-xs sm:text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-slate-100'}`}>
                          {isIncome ? '+' : '-'}{sym}{tx.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setIsDayDetailOpen(false);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
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
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteTransaction(deletingId);
        }}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record?"
      />
    </div>
  );
};
