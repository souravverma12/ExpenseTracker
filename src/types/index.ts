export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 
  | 'Cash' 
  | 'Credit Card' 
  | 'Debit Card' 
  | 'UPI' 
  | 'Bank Transfer' 
  | 'PayPal' 
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface BudgetConfig {
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isCustom?: boolean;
}

export type HealthStatus = 'Excellent' | 'Good' | 'Warning' | 'Budget Exceeded';

export interface HealthScoreResult {
  score: number;
  status: HealthStatus;
  badgeColor: string;
  insights: string[];
}

export interface CurrencyOption {
  symbol: string;
  code: string;
  name: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  currency: CurrencyOption;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'budgets' | 'calendar' | 'categories' | 'settings';
