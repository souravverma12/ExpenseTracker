import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_CURRENCIES } from '../../storage/defaultData';
import { exportToJson, exportToCsv, importFromJson } from '../../services/exportImportService';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { useToast } from '../../context/ToastContext';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  DollarSign, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldAlert 
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    transactions, 
    categories, 
    budgetConfig, 
    refreshAllData, 
    resetDatabase 
  } = useApp();

  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const handleCurrencyChange = (code: string) => {
    const matched = DEFAULT_CURRENCIES.find((c) => c.code === code);
    if (matched) {
      updateSettings({ currency: matched });
    }
  };

  const handleExportJson = () => {
    exportToJson(transactions, categories, budgetConfig, settings);
    showToast('JSON backup downloaded successfully!', 'success');
  };

  const handleExportCsv = () => {
    exportToCsv(transactions);
    showToast('CSV export downloaded successfully!', 'success');
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await importFromJson(content);
      if (success) {
        await refreshAllData();
        showToast('Data imported successfully!', 'success');
      } else {
        showToast('Failed to import file. Please check file format.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-100">Application Settings</h3>
          <p className="text-xs text-slate-400">
            Configure currency preference, appearance themes, and backup options.
          </p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
        <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
          {settings.theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          <span>Appearance & Theme</span>
        </h4>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
              settings.theme === 'dark'
                ? 'bg-indigo-600/20 border-indigo-500 text-slate-100 shadow-lg'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-950 text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">Dark Mode</div>
              <div className="text-xs text-slate-400">Sleek dark theme</div>
            </div>
          </button>

          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
              settings.theme === 'light'
                ? 'bg-indigo-600/20 border-indigo-500 text-slate-100 shadow-lg'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">Light Mode</div>
              <div className="text-xs text-slate-400">Clean bright theme</div>
            </div>
          </button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
        <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Currency Unit</span>
        </h4>

        <div className="max-w-md">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select Primary Currency</label>
          <select
            value={settings.currency.code}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700/60 text-slate-100 text-sm font-semibold focus:outline-none focus:border-indigo-500"
          >
            {DEFAULT_CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code} className="bg-slate-900 text-slate-100">
                {curr.name} ({curr.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-4">
        <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-400" />
          <span>Data Portability & Backup</span>
        </h4>
        <p className="text-xs text-slate-400">
          Export your complete database for safekeeping or import a backup file to restore records.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Backup</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Ledger</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-xs font-semibold transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Import Data File</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-4">
        <h4 className="text-base font-bold text-rose-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Danger Zone: Reset Database</span>
        </h4>
        <p className="text-xs text-slate-400">
          Permanently clear all custom transactions and custom categories, and restore default initial state.
        </p>

        <button
          onClick={() => setIsResetDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Data</span>
        </button>
      </div>

      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={resetDatabase}
        title="Reset All Personal Data?"
        message="This action will delete all your recorded expenses, income, custom categories, and restore initial default data. Make sure you have exported a JSON backup first if needed!"
        confirmLabel="Reset Everything"
      />
    </div>
  );
};
