import type { Transaction, Category, BudgetConfig, AppSettings } from '../types';
import { db } from '../storage/db';
import { DEFAULT_CATEGORIES, DEFAULT_BUDGETS, DEFAULT_SETTINGS } from '../storage/defaultData';

export interface BackupData {
  version: number;
  exportedAt: string;
  transactions: Transaction[];
  categories: Category[];
  budgets: BudgetConfig;
  settings: AppSettings;
}

export function exportToJson(
  transactions: Transaction[],
  categories: Category[],
  budgets: BudgetConfig,
  settings: AppSettings
) {
  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    categories,
    budgets,
    settings,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `ExpenseTracker_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportToCsv(transactions: Transaction[]) {
  const headers = ['ID', 'Type', 'Title', 'Amount', 'Category', 'Date', 'Time', 'Payment Method', 'Notes'];
  const rows = transactions.map((t) => [
    t.id,
    t.type,
    `"${t.title.replace(/"/g, '""')}"`,
    t.amount,
    `"${t.category.replace(/"/g, '""')}"`,
    t.date,
    t.time,
    `"${t.paymentMethod}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ExpenseTracker_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function importFromJson(jsonString: string): Promise<boolean> {
  try {
    const data: BackupData = JSON.parse(jsonString);
    if (!data.transactions || !Array.isArray(data.transactions)) {
      throw new Error('Invalid JSON format: missing transactions array');
    }

    await db.transaction('rw', [db.transactions, db.categories, db.budgets, db.settings], async () => {
      await db.transactions.clear();
      await db.transactions.bulkAdd(data.transactions);

      if (data.categories && Array.isArray(data.categories)) {
        await db.categories.clear();
        await db.categories.bulkAdd(data.categories);
      }

      if (data.budgets) {
        await db.budgets.clear();
        await db.budgets.put({ id: 'main_budget', ...data.budgets });
      }

      if (data.settings) {
        await db.settings.clear();
        await db.settings.put({ id: 'main_settings', ...data.settings });
      }
    });

    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
}

export async function resetAllData(): Promise<void> {
  await db.transaction('rw', [db.transactions, db.categories, db.budgets, db.settings], async () => {
    await db.transactions.clear();
    await db.categories.clear();
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
    await db.budgets.clear();
    await db.budgets.put({ id: 'main_budget', ...DEFAULT_BUDGETS });
    await db.settings.clear();
    await db.settings.put({ id: 'main_settings', ...DEFAULT_SETTINGS });
  });
}
