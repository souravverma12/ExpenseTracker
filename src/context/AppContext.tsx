import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { 
  Transaction, 
  Category, 
  BudgetConfig, 
  AppSettings, 
  ActiveTab, 
  HealthScoreResult 
} from '../types';
import { db } from '../storage/db';
import { calculateSummaryMetrics, type SummaryMetrics } from '../services/budgetService';
import { calculateHealthScore } from '../services/healthService';
import { DEFAULT_BUDGETS, DEFAULT_SETTINGS, DEFAULT_CATEGORIES } from '../storage/defaultData';
import { useToast } from './ToastContext';
import { storageService } from '../services/storageService';
import { auth, isFirebaseConfigured, googleProvider } from '../storage/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  type User 
} from 'firebase/auth';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  transactions: Transaction[];
  categories: Category[];
  budgetConfig: BudgetConfig;
  settings: AppSettings;
  summaryMetrics: SummaryMetrics;
  healthScore: HealthScoreResult;
  isLoading: boolean;
  
  // Auth state
  user: User | null;
  isFirebaseConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Migration state
  showMigrationPrompt: boolean;
  setShowMigrationPrompt: (show: boolean) => void;
  isMigrating: boolean;
  triggerMigration: () => Promise<void>;
  dismissMigration: () => Promise<void>;

  // Quick Add Modal state
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  presetDateForAdd: string | null;
  setPresetDateForAdd: (date: string | null) => void;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  editTransaction: (id: string, tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateBudgets: (newBudgets: BudgetConfig) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  refreshAllData: (userUid?: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // Migration State
  const [showMigrationPrompt, setShowMigrationPrompt] = useState<boolean>(false);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(DEFAULT_BUDGETS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [presetDateForAdd, setPresetDateForAdd] = useState<string | null>(null);

  const refreshAllData = useCallback(async (userUid?: string) => {
    try {
      const activeUid = userUid || auth?.currentUser?.uid;
      const txs = await storageService.getTransactions(activeUid);
      const cats = await storageService.getCategories(activeUid);
      const budgetRecord = await storageService.getBudgets(activeUid);
      const settingsRecord = await storageService.getSettings(activeUid);

      setTransactions(txs);
      if (cats.length > 0) setCategories(cats);
      setBudgetConfig(budgetRecord);
      setSettings(settingsRecord);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      refreshAllData();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(true);
      if (firebaseUser) {
        // Check migration
        const isMigrated = await storageService.checkUserMigrationStatus(firebaseUser.uid);
        const localTxCount = await db.transactions.count();
        if (!isMigrated && localTxCount > 0) {
          setShowMigrationPrompt(true);
        } else if (!isMigrated) {
          await storageService.skipUserMigration(firebaseUser.uid);
        }
      }
      await refreshAllData(firebaseUser?.uid);
    });

    return () => unsubscribe();
  }, [refreshAllData]);

  // theme classes
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [settings.theme]);

  // Derived metrics
  const summaryMetrics = calculateSummaryMetrics(transactions, budgetConfig);
  const healthScore = calculateHealthScore(transactions, budgetConfig);

  // Authentication triggers
  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      showToast('Firebase configuration not found. Setup environment variables.', 'error');
      return;
    }
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Sign-In failed. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured) return;
    try {
      setIsLoading(true);
      await signOut(auth);
      showToast('Logged out.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Sign-Out failed.', 'error');
      setIsLoading(false);
    }
  };

  // Migration flows
  const triggerMigration = async () => {
    if (!user) return;
    try {
      setIsMigrating(true);
      await storageService.migrateLocalToCloud(user.uid);
      await db.transactions.clear(); // Clear local to prevent future prompts
      await refreshAllData(user.uid);
      showToast('Successfully migrated local data to the cloud!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Data migration failed.', 'error');
    } finally {
      setIsMigrating(false);
      setShowMigrationPrompt(false);
    }
  };

  const dismissMigration = async () => {
    if (!user) return;
    try {
      await storageService.skipUserMigration(user.uid);
      showToast('Migration bypassed. Using clean cloud storage.', 'info');
    } catch (err) {
      console.error(err);
    } finally {
      setShowMigrationPrompt(false);
    }
  };

  // CRUD wrappers
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const activeUid = user?.uid;
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
    };
    await storageService.saveTransaction(newTx, activeUid);
    await refreshAllData(activeUid);
    showToast('Saved!', 'success');
  };

  const editTransaction = async (id: string, txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const activeUid = user?.uid;
    const updatedTx: Transaction = {
      ...txData,
      id,
      createdAt: Date.now(), // update timestamp or reuse
    };
    await storageService.saveTransaction(updatedTx, activeUid);
    await refreshAllData(activeUid);
    showToast('Saved!', 'success');
  };

  const deleteTransaction = async (id: string) => {
    const activeUid = user?.uid;
    await storageService.deleteTransaction(id, activeUid);
    await refreshAllData(activeUid);
    showToast('Transaction deleted.', 'info');
  };

  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const activeUid = user?.uid;
    const newCat: Category = {
      ...catData,
      id: 'cat-custom-' + Math.random().toString(36).substring(2, 9),
      isCustom: true,
    };
    await storageService.saveCategory(newCat, activeUid);
    await refreshAllData(activeUid);
    showToast(`Category "${catData.name}" created!`, 'success');
  };

  const deleteCategory = async (id: string) => {
    const activeUid = user?.uid;
    await storageService.deleteCategory(id, activeUid);
    await refreshAllData(activeUid);
    showToast('Category deleted.', 'info');
  };

  const updateBudgets = async (newBudgets: BudgetConfig) => {
    const activeUid = user?.uid;
    setBudgetConfig(newBudgets);
    await storageService.saveBudgets(newBudgets, activeUid);
    showToast('Budgets updated.', 'success');
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const activeUid = user?.uid;
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await storageService.saveSettings(updated, activeUid);
    showToast('Settings saved.', 'success');
  };

  const resetDatabase = async () => {
    const activeUid = user?.uid;
    if (activeUid) {
      // Clear Firestore user documents (except custom category collection could be cleared but keep default system categories)
      const batchTxs = await storageService.getTransactions(activeUid);
      for (const tx of batchTxs) {
        await storageService.deleteTransaction(tx.id, activeUid);
      }
      await storageService.saveBudgets(DEFAULT_BUDGETS, activeUid);
      await storageService.saveSettings(DEFAULT_SETTINGS, activeUid);
    } else {
      await db.transactions.clear();
      await db.categories.clear();
      await db.categories.bulkAdd(DEFAULT_CATEGORIES);
      await db.budgets.clear();
      await db.budgets.put({ id: 'main_budget', ...DEFAULT_BUDGETS });
      await db.settings.clear();
      await db.settings.put({ id: 'main_settings', ...DEFAULT_SETTINGS });
    }
    await refreshAllData(activeUid);
    showToast('Data reset complete.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        transactions,
        categories,
        budgetConfig,
        settings,
        summaryMetrics,
        healthScore,
        isLoading,
        user,
        isFirebaseConfigured,
        signInWithGoogle,
        logout,
        showMigrationPrompt,
        setShowMigrationPrompt,
        isMigrating,
        triggerMigration,
        dismissMigration,
        isAddModalOpen,
        setIsAddModalOpen,
        editingTransaction,
        setEditingTransaction,
        presetDateForAdd,
        setPresetDateForAdd,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addCategory,
        deleteCategory,
        updateBudgets,
        updateSettings,
        refreshAllData,
        resetDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
