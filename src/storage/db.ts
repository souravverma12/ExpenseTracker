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

export async function seedInitialDataIfNeeded() {
  try {
    const txCount = await db.transactions.count();
    if (txCount === 0) {
      await db.transactions.bulkPut(INITIAL_TRANSACTIONS);
    }

    const catCount = await db.categories.count();
    if (catCount === 0) {
      await db.categories.bulkPut(DEFAULT_CATEGORIES);
    }

    const budgetCount = await db.budgets.count();
    if (budgetCount === 0) {
      await db.budgets.put({ id: 'main_budget', ...DEFAULT_BUDGETS });
    }

    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.put({ id: 'main_settings', ...DEFAULT_SETTINGS });
    }
  } catch (error) {
    console.error('Error seeding initial database data:', error);
  }
}
