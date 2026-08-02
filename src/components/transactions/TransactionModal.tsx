import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { TransactionType, PaymentMethod } from '../../types';
import { Modal } from '../ui/Modal';
import { format } from 'date-fns';
import { CategoryIcon } from '../ui/CategoryIcon';

export const TransactionModal: React.FC = () => {
  const { 
    isAddModalOpen, 
    setIsAddModalOpen, 
    editingTransaction, 
    setEditingTransaction,
    presetDateForAdd,
    setPresetDateForAdd,
    categories, 
    addTransaction, 
    editTransaction 
  } = useApp();

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setDate(presetDateForAdd || format(new Date(), 'yyyy-MM-dd'));
      setTime(format(new Date(), 'HH:mm'));
      setPaymentMethod('Credit Card');
      setNotes('');
      const firstCat = categories.find((c) => c.type === 'expense');
      if (firstCat) setCategory(firstCat.name);
    }
  }, [editingTransaction, presetDateForAdd, isAddModalOpen, categories]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const matchingCat = categories.find((c) => c.type === newType);
    if (matchingCat) {
      setCategory(matchingCat.name);
    }
  };

  const handleClose = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
    setPresetDateForAdd(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || isNaN(Number(amount)) || Number(amount) <= 0 || !category) {
      return;
    }

    const txData = {
      type,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
      time,
      paymentMethod,
      notes: notes.trim() || '',
    };

    if (editingTransaction) {
      await editTransaction(editingTransaction.id, txData);
    } else {
      await addTransaction(txData);
    }

    handleClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const paymentMethods: PaymentMethod[] = [
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'UPI',
    'Cash',
    'PayPal',
    'Other',
  ];

  return (
    <Modal
      isOpen={isAddModalOpen || !!editingTransaction}
      onClose={handleClose}
      title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/60 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💸 EXPENSE
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 rounded-lg text-xs font-bold transition-all ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💰 INCOME
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Title / Description *</label>
          <input
            type="text"
            required
            placeholder="e.g. Organic Supermarket Grocery"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amount *</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-100 font-semibold text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {paymentMethods.map((pm) => (
                <option key={pm} value={pm} className="bg-slate-900 text-slate-100">
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
            {filteredCategories.map((cat) => {
              const isSelected = category === cat.name;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-200'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <CategoryIcon name={cat.icon} color={cat.color} className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (Optional)</label>
          <textarea
            rows={2}
            placeholder="Add any extra notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
          >
            {editingTransaction ? 'Save Changes' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
