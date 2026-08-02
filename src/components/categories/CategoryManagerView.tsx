import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { TransactionType } from '../../types';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Modal } from '../ui/Modal';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { Tags, Plus, Trash2 } from 'lucide-react';

export const CategoryManagerView: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useApp();

  const [activeTypeTab, setActiveTypeTab] = useState<TransactionType>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#3B82F6');

  const availableIcons = [
    'Utensils',
    'Plane',
    'ShoppingBag',
    'Film',
    'Home',
    'Receipt',
    'Fuel',
    'HeartPulse',
    'TrendingUp',
    'GraduationCap',
    'Tv',
    'Zap',
    'Briefcase',
    'Laptop',
    'PiggyBank',
    'Building2',
    'DollarSign',
    'Car',
    'Coffee',
    'Gift',
    'Smartphone',
    'Tag',
  ];

  const presetColors = [
    '#F59E0B',
    '#3B82F6',
    '#EC4899',
    '#8B5CF6',
    '#10B981',
    '#EF4444',
    '#F97316',
    '#14B8A6',
    '#6366F1',
    '#06B6D4',
    '#A855F7',
    '#EAB308',
  ];

  const handleOpenModal = () => {
    setName('');
    setType(activeTypeTab);
    setIcon('Tag');
    setColor('#3B82F6');
    setIsModalOpen(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addCategory({
      name: name.trim(),
      type,
      icon,
      color,
    });

    setIsModalOpen(false);
  };

  const filteredCategories = categories.filter((c) => c.type === activeTypeTab);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">Category Management</h3>
            <p className="text-xs text-slate-400">
              Customize categories, colors, and icons for organized tracking.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Category</span>
        </button>
      </div>

      <div className="flex items-center gap-2 p-1 bg-slate-900/60 rounded-xl border border-slate-800 max-w-md">
        <button
          onClick={() => setActiveTypeTab('expense')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTypeTab === 'expense'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          💸 EXPENSE CATEGORIES ({categories.filter((c) => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTypeTab('income')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTypeTab === 'income'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          💰 INCOME CATEGORIES ({categories.filter((c) => c.type === 'income').length})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="glass-card glass-card-hover p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
              >
                <CategoryIcon name={cat.icon} color={cat.color} className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{cat.name}</h4>
                <span className="text-[10px] font-semibold text-slate-500">
                  {cat.isCustom ? 'Custom Category' : 'System Default'}
                </span>
              </div>
            </div>

            {cat.isCustom && (
              <button
                onClick={() => setDeletingId(cat.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Delete custom category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Custom Category">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/60 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expense Category
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Income Category
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Freelancing, Pet Care, Gaming"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Choose Icon</label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-800 rounded-xl bg-slate-900/40">
              {availableIcons.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CategoryIcon name={ic} color={icon === ic ? color : undefined} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Accent Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {presetColors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              Create Category
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteCategory(deletingId);
        }}
        title="Delete Category"
        message="Are you sure you want to delete this custom category?"
      />
    </div>
  );
};
