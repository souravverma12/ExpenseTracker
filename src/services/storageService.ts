import { db } from '../storage/db';
import { fdb, isFirebaseConfigured } from '../storage/firebase';
import type { Transaction, Category, BudgetConfig, AppSettings } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_BUDGETS, DEFAULT_SETTINGS } from '../storage/defaultData';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';

export const storageService = {
  // --- TRANSACTIONS ---
  async getTransactions(uid?: string): Promise<Transaction[]> {
    try {
      if (isFirebaseConfigured && uid) {
        const q = query(collection(fdb, 'transactions'), where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
        const list: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            type: data.type,
            title: data.title,
            amount: data.amount,
            category: data.category,
            date: data.date,
            time: data.time,
            paymentMethod: data.paymentMethod,
            notes: data.notes || '',
            createdAt: data.createdAt,
          });
        });
        return list.sort((a, b) => b.createdAt - a.createdAt);
      } else {
        return await db.transactions.orderBy('createdAt').reverse().toArray();
      }
    } catch (err) {
      console.error('Error fetching transactions, returning empty fallback list:', err);
      return [];
    }
  },

  async saveTransaction(tx: Transaction, uid?: string): Promise<void> {
    try {
      if (isFirebaseConfigured && uid) {
        const { id, ...data } = tx;
        await setDoc(doc(fdb, 'transactions', id), { ...data, uid });
      } else {
        await db.transactions.put(tx);
      }
    } catch (err) {
      console.error('Error saving transaction to storage:', err);
    }
  },

  async deleteTransaction(id: string, uid?: string): Promise<void> {
    try {
      if (isFirebaseConfigured && uid) {
        await deleteDoc(doc(fdb, 'transactions', id));
      } else {
        await db.transactions.delete(id);
      }
    } catch (err) {
      console.error('Error deleting transaction from storage:', err);
    }
  },

  // --- CATEGORIES ---
  async getCategories(uid?: string): Promise<Category[]> {
    try {
      if (isFirebaseConfigured && uid) {
        const q = query(collection(fdb, 'categories'), where('uid', '==', uid));
        const querySnapshot = await getDocs(q);
        const list: Category[] = [...DEFAULT_CATEGORIES];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            name: data.name,
            icon: data.icon,
            color: data.color,
            type: data.type,
            isCustom: true,
          });
        });
        return list;
      } else {
        const localCats = await db.categories.toArray();
        return localCats.length > 0 ? localCats : DEFAULT_CATEGORIES;
      }
    } catch (err) {
      console.error('Error fetching categories, returning system defaults:', err);
      return DEFAULT_CATEGORIES;
    }
  },

  async saveCategory(cat: Category, uid?: string): Promise<void> {
    try {
      if (isFirebaseConfigured && uid) {
        const { id, ...data } = cat;
        await setDoc(doc(fdb, 'categories', id), { ...data, uid });
      } else {
        await db.categories.put(cat);
      }
    } catch (err) {
      console.error('Error saving category to storage:', err);
    }
  },

  async deleteCategory(id: string, uid?: string): Promise<void> {
    try {
      if (isFirebaseConfigured && uid) {
        await deleteDoc(doc(fdb, 'categories', id));
      } else {
        await db.categories.delete(id);
      }
    } catch (err) {
      console.error('Error deleting category from storage:', err);
    }
  },

  // --- BUDGETS ---
  async getBudgets(uid?: string): Promise<BudgetConfig> {
    try {
      if (isFirebaseConfigured && uid) {
        const docRef = doc(fdb, 'budgets', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            weekly: data.weekly,
            monthly: data.monthly,
            yearly: data.yearly,
          };
        } else {
          const defaultBudgets = { ...DEFAULT_BUDGETS };
          await setDoc(docRef, defaultBudgets);
          return defaultBudgets;
        }
      } else {
        const budgetRecord = await db.budgets.get('main_budget');
        if (budgetRecord) {
          const { id: _id, ...cleanBudgets } = budgetRecord;
          return cleanBudgets;
        }
        return DEFAULT_BUDGETS;
      }
    } catch (err) {
      console.error('Error fetching budgets, returning defaults:', err);
      return DEFAULT_BUDGETS;
    }
  },

  async saveBudgets(budgets: BudgetConfig, uid?: string): Promise<void> {
    try {
      if (isFirebaseConfigured && uid) {
        await setDoc(doc(fdb, 'budgets', uid), budgets);
      } else {
        await db.budgets.put({ id: 'main_budget', ...budgets });
      }
    } catch (err) {
      console.error('Error saving budgets to storage:', err);
    }
  },

  // --- SETTINGS ---
  async getSettings(uid?: string): Promise<AppSettings> {
    try {
      if (isFirebaseConfigured && uid) {
        const docRef = doc(fdb, 'settings', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            theme: data.theme,
            currency: data.currency,
          };
        } else {
          const defaultSettings = { ...DEFAULT_SETTINGS };
          await setDoc(docRef, defaultSettings);
          return defaultSettings;
        }
      } else {
        const settingsRecord = await db.settings.get('main_settings');
        if (settingsRecord) {
          const { id: _id, ...cleanSettings } = settingsRecord;
          return cleanSettings;
        }
        return DEFAULT_SETTINGS;
      }
    } catch (err) {
      console.error('Error fetching settings, returning defaults:', err);
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: AppSettings, uid?: string): Promise<void> {
    try {
      if (isFirebaseConfigured && uid) {
        await setDoc(doc(fdb, 'settings', uid), settings);
      } else {
        await db.settings.put({ id: 'main_settings', ...settings });
      }
    } catch (err) {
      console.error('Error saving settings to storage:', err);
    }
  },

  // --- BULK MIGRATION ---
  async migrateLocalToCloud(uid: string): Promise<void> {
    if (!isFirebaseConfigured) return;

    const localTxs = await db.transactions.toArray().catch(() => []);
    const localCats = await db.categories.toArray().catch(() => []);

    if (localTxs.length > 0) {
      const batch = writeBatch(fdb);
      localTxs.forEach((tx) => {
        const docRef = doc(fdb, 'transactions', tx.id);
        const { id: _id, ...cleanTx } = tx;
        batch.set(docRef, { ...cleanTx, uid });
      });
      await batch.commit();
    }

    const customCats = localCats.filter((c) => c.isCustom);
    if (customCats.length > 0) {
      const batch = writeBatch(fdb);
      customCats.forEach((cat) => {
        const docRef = doc(fdb, 'categories', cat.id);
        const { id: _id, ...cleanCat } = cat;
        batch.set(docRef, { ...cleanCat, uid });
      });
      await batch.commit();
    }

    const localBudget = await db.budgets.get('main_budget').catch(() => null);
    if (localBudget) {
      const { id: _id, ...cleanBudget } = localBudget;
      await setDoc(doc(fdb, 'budgets', uid), cleanBudget);
    }

    const localSettings = await db.settings.get('main_settings').catch(() => null);
    if (localSettings) {
      const { id: _id, ...cleanSettings } = localSettings;
      await setDoc(doc(fdb, 'settings', uid), cleanSettings);
    }

    await setDoc(doc(fdb, 'users', uid), {
      uid,
      migrated: true,
      migratedAt: new Date().toISOString(),
    }, { merge: true });
  },

  async checkUserMigrationStatus(uid: string): Promise<boolean> {
    if (!isFirebaseConfigured) return true;
    try {
      const docRef = doc(fdb, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return !!docSnap.data().migrated;
      }
    } catch (err) {
      console.error('Error checking user migration status:', err);
    }
    return false;
  },

  async skipUserMigration(uid: string): Promise<void> {
    if (!isFirebaseConfigured) return;
    try {
      await setDoc(doc(fdb, 'users', uid), {
        uid,
        migrated: true,
        migratedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.error('Error setting skip migration state:', err);
    }
  }
};
