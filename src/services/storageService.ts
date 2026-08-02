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
      // Sort by latest first
      return list.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      return await db.transactions.orderBy('createdAt').reverse().toArray();
    }
  },

  async saveTransaction(tx: Transaction, uid?: string): Promise<void> {
    if (isFirebaseConfigured && uid) {
      const { id, ...data } = tx;
      await setDoc(doc(fdb, 'transactions', id), { ...data, uid });
    } else {
      await db.transactions.put(tx);
    }
  },

  async deleteTransaction(id: string, uid?: string): Promise<void> {
    if (isFirebaseConfigured && uid) {
      await deleteDoc(doc(fdb, 'transactions', id));
    } else {
      await db.transactions.delete(id);
    }
  },

  // --- CATEGORIES ---
  async getCategories(uid?: string): Promise<Category[]> {
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
      return await db.categories.toArray();
    }
  },

  async saveCategory(cat: Category, uid?: string): Promise<void> {
    if (isFirebaseConfigured && uid) {
      const { id, ...data } = cat;
      await setDoc(doc(fdb, 'categories', id), { ...data, uid });
    } else {
      await db.categories.put(cat);
    }
  },

  async deleteCategory(id: string, uid?: string): Promise<void> {
    if (isFirebaseConfigured && uid) {
      await deleteDoc(doc(fdb, 'categories', id));
    } else {
      await db.categories.delete(id);
    }
  },

  // --- BUDGETS ---
  async getBudgets(uid?: string): Promise<BudgetConfig> {
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
        // Pre-create budget on cloud if new
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
  },

  async saveBudgets(budgets: BudgetConfig, uid?: string): Promise<void> {
    if (isFirebaseConfigured && uid) {
      await setDoc(doc(fdb, 'budgets', uid), budgets);
    } else {
      await db.budgets.put({ id: 'main_budget', ...budgets });
    }
  },

  // --- SETTINGS ---
  async getSettings(uid?: string): Promise<AppSettings> {
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
  },

  async saveSettings(settings: AppSettings, uid?: string): Promise<void> {
    if (isFirebaseConfigured && uid) {
      await setDoc(doc(fdb, 'settings', uid), settings);
    } else {
      await db.settings.put({ id: 'main_settings', ...settings });
    }
  },

  // --- BULK MIGRATION ---
  async migrateLocalToCloud(uid: string): Promise<void> {
    if (!isFirebaseConfigured) return;

    const localTxs = await db.transactions.toArray();
    const localCats = await db.categories.toArray();

    // Migrate transactions in batch
    if (localTxs.length > 0) {
      const batch = writeBatch(fdb);
      localTxs.forEach((tx) => {
        const docRef = doc(fdb, 'transactions', tx.id);
        const { id: _id, ...cleanTx } = tx;
        batch.set(docRef, { ...cleanTx, uid });
      });
      await batch.commit();
    }

    // Migrate custom categories in batch
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

    // Migrate budget & settings
    const localBudget = await db.budgets.get('main_budget');
    if (localBudget) {
      const { id: _id, ...cleanBudget } = localBudget;
      await setDoc(doc(fdb, 'budgets', uid), cleanBudget);
    }

    const localSettings = await db.settings.get('main_settings');
    if (localSettings) {
      const { id: _id, ...cleanSettings } = localSettings;
      await setDoc(doc(fdb, 'settings', uid), cleanSettings);
    }

    // Set user migration metadata flag
    await setDoc(doc(fdb, 'users', uid), {
      uid,
      migrated: true,
      migratedAt: new Date().toISOString(),
    }, { merge: true });
  },

  async checkUserMigrationStatus(uid: string): Promise<boolean> {
    if (!isFirebaseConfigured) return true;
    const docRef = doc(fdb, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return !!docSnap.data().migrated;
    }
    return false;
  },

  async skipUserMigration(uid: string): Promise<void> {
    if (!isFirebaseConfigured) return;
    await setDoc(doc(fdb, 'users', uid), {
      uid,
      migrated: true,
      migratedAt: new Date().toISOString(),
    }, { merge: true });
  }
};
