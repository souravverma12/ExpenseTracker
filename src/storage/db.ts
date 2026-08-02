import Dexie, { type Table } from 'dexie';
import type { Transaction, Category, BudgetConfig, AppSettings } from '../types';
import { 
  DEFAULT_CATEGORIES, 
  DEFAULT_BUDGETS, 
  DEFAULT_SETTINGS, 
  INITIAL_TRANSACTIONS 
} from './defaultData';

export class ExpenseTrackerDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  budgets!: Table<BudgetConfig & { id: string }, string>;
  settings!: Table<AppSettings & { id: string }, string>;

  constructor() {
    super('ExpenseTrackerDB');
    this.version(1).stores({
      transactions: 'id, type, category, date, paymentMethod, createdAt',
      categories: 'id, name, type',
      budgets: 'id',
      settings: 'id',
    });
  }
}

export const db = new ExpenseTrackerDatabase();

// Handle database open failures gracefully (common in private/incognito tabs on mobile)
db.open().catch((err) => {
  console.error('Failed to open local IndexedDB:', err);
});

export async function seedInitialDataIfNeeded() {
  try {
    const txCount = await db.transactions.count().catch(() => 0);
    if (txCount === 0) {
      await db.transactions.bulkPut(INITIAL_TRANSACTIONS).catch(() => {});
    }

    const catCount = await db.categories.count().catch(() => 0);
    if (catCount === 0) {
      await db.categories.bulkPut(DEFAULT_CATEGORIES).catch(() => {});
    }

    const budgetCount = await db.budgets.count().catch(() => 0);
    if (budgetCount === 0) {
      await db.budgets.put({ id: 'main_budget', ...DEFAULT_BUDGETS }).catch(() => {});
    }

    const settingsCount = await db.settings.count().catch(() => 0);
    if (settingsCount === 0) {
      await db.settings.put({ id: 'main_settings', ...DEFAULT_SETTINGS }).catch(() => {});
    }
  } catch (error) {
    console.error('Error seeding initial database data:', error);
  }
}
