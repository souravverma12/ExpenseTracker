import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sun, 
  Moon, 
  Menu, 
  Calendar as CalendarIcon, 
  Plus, 
  DollarSign 
} from 'lucide-react';
import { format } from 'date-fns';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { activeTab, settings, updateSettings, setIsAddModalOpen, setEditingTransaction } = useApp();

  const titleMap: Record<string, string> = {
    dashboard: 'Financial Overview',
    transactions: 'Expense & Income Ledger',
    budgets: 'Budget Planning',
    calendar: 'Financial Calendar',
    categories: 'Category Management',
    settings: 'App Settings',
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-card border-b border-slate-800/60 px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100 capitalize">
            {titleMap[activeTab] || 'Dashboard'}
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs font-semibold text-slate-300">
          <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
          <span>{settings.currency.code} ({settings.currency.symbol})</span>
        </div>

        <button
          onClick={toggleTheme}
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/40 transition-colors"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-900/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>
    </header>
  );
};
