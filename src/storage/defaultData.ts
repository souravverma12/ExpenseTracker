import type { Category, BudgetConfig, AppSettings, Transaction } from '../types';

export const DEFAULT_CURRENCIES = [
  { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)' },
  { symbol: '€', code: 'EUR', name: 'Euro (€)' },
  { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar (A$)' },
  { symbol: 'CA$', code: 'CAD', name: 'Canadian Dollar (CA$)' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen (¥)' },
  { symbol: 'CHF', code: 'CHF', name: 'Swiss Franc (CHF)' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  currency: DEFAULT_CURRENCIES[0],
};

export const DEFAULT_BUDGETS: BudgetConfig = {
  weekly: 500,
  monthly: 2000,
  yearly: 24000,
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  { id: 'cat-food', name: 'Food', icon: 'Utensils', color: '#F59E0B', type: 'expense' },
  { id: 'cat-travel', name: 'Travel', icon: 'Plane', color: '#3B82F6', type: 'expense' },
  { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#EC4899', type: 'expense' },
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'Film', color: '#8B5CF6', type: 'expense' },
  { id: 'cat-rent', name: 'Rent', icon: 'Home', color: '#10B981', type: 'expense' },
  { id: 'cat-bills', name: 'Bills', icon: 'Receipt', color: '#EF4444', type: 'expense' },
  { id: 'cat-fuel', name: 'Fuel', icon: 'Fuel', color: '#F97316', type: 'expense' },
  { id: 'cat-medical', name: 'Medical', icon: 'HeartPulse', color: '#14B8A6', type: 'expense' },
  { id: 'cat-investment', name: 'Investment', icon: 'TrendingUp', color: '#6366F1', type: 'expense' },
  { id: 'cat-education', name: 'Education', icon: 'GraduationCap', color: '#06B6D4', type: 'expense' },
  { id: 'cat-subscription', name: 'Subscription', icon: 'Tv', color: '#A855F7', type: 'expense' },
  { id: 'cat-utilities', name: 'Utilities', icon: 'Zap', color: '#EAB308', type: 'expense' },
  { id: 'cat-other-exp', name: 'Other Expense', icon: 'MoreHorizontal', color: '#64748B', type: 'expense' },

  // Income Categories
  { id: 'cat-salary', name: 'Salary', icon: 'Briefcase', color: '#10B981', type: 'income' },
  { id: 'cat-freelancing', name: 'Freelancing', icon: 'Laptop', color: '#3B82F6', type: 'income' },
  { id: 'cat-investment-inc', name: 'Investment Return', icon: 'PiggyBank', color: '#8B5CF6', type: 'income' },
  { id: 'cat-business', name: 'Business', icon: 'Building2', color: '#F59E0B', type: 'income' },
  { id: 'cat-other-inc', name: 'Other Income', icon: 'DollarSign', color: '#06B6D4', type: 'income' },
];

const getPastDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    title: 'Monthly Tech Corp Salary',
    amount: 4500,
    category: 'Salary',
    date: getPastDateStr(1),
    time: '09:00',
    paymentMethod: 'Bank Transfer',
    notes: 'Base salary for the month',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'tx-2',
    type: 'income',
    title: 'UI Design Freelance Project',
    amount: 1200,
    category: 'Freelancing',
    date: getPastDateStr(3),
    time: '14:30',
    paymentMethod: 'Bank Transfer',
    notes: 'Client payment for landing page design',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'tx-3',
    type: 'expense',
    title: 'Apartment Monthly Rent',
    amount: 1200,
    category: 'Rent',
    date: getPastDateStr(2),
    time: '10:00',
    paymentMethod: 'Bank Transfer',
    notes: 'Paid via online banking',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'tx-4',
    type: 'expense',
    title: 'Grocery Supermarket Restock',
    amount: 142.50,
    category: 'Food',
    date: getPastDateStr(0),
    time: '18:15',
    paymentMethod: 'Credit Card',
    notes: 'Organic vegetables & essentials',
    createdAt: Date.now(),
  },
  {
    id: 'tx-5',
    type: 'expense',
    title: 'Gas Station Refill',
    amount: 55.00,
    category: 'Fuel',
    date: getPastDateStr(0),
    time: '08:45',
    paymentMethod: 'UPI',
    notes: 'Full tank refill',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'tx-6',
    type: 'expense',
    title: 'Netflix & Spotify Subscriptions',
    amount: 28.99,
    category: 'Subscription',
    date: getPastDateStr(5),
    time: '12:00',
    paymentMethod: 'Credit Card',
    notes: 'Autopay monthly plans',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'tx-7',
    type: 'expense',
    title: 'Dinner at Steakhouse',
    amount: 95.40,
    category: 'Food',
    date: getPastDateStr(4),
    time: '20:30',
    paymentMethod: 'Debit Card',
    notes: 'Weekend dinner with friends',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'tx-8',
    type: 'expense',
    title: 'Electricity & Fiber Internet',
    amount: 135.00,
    category: 'Utilities',
    date: getPastDateStr(6),
    time: '11:20',
    paymentMethod: 'Bank Transfer',
    notes: 'Monthly utility bills',
    createdAt: Date.now() - 86400000 * 6,
  },
  {
    id: 'tx-9',
    type: 'expense',
    title: 'Index Fund Investment',
    amount: 300.00,
    category: 'Investment',
    date: getPastDateStr(7),
    time: '09:15',
    paymentMethod: 'Bank Transfer',
    notes: 'S&P 500 monthly SIP',
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'tx-10',
    type: 'expense',
    title: 'New Wireless Headphones',
    amount: 199.99,
    category: 'Shopping',
    date: getPastDateStr(10),
    time: '16:45',
    paymentMethod: 'Credit Card',
    notes: 'Noise cancelling headphones',
    createdAt: Date.now() - 86400000 * 10,
  },
];
