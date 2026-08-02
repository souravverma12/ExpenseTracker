import type { Transaction, BudgetConfig } from '../types';
import { 
  isSameDay, 
  isSameWeek, 
  isSameMonth, 
  isSameYear, 
  parseISO 
} from 'date-fns';

export interface BudgetMetrics {
  spent: number;
  budget: number;
  remaining: number;
  percentageUsed: number;
}

export interface SummaryMetrics {
  todayExpenses: number;
  weeklyExpenses: number;
  monthlyExpenses: number;
  yearlyExpenses: number;
  monthlyIncome: number;
  currentBalance: number;
  monthlySavings: number;
  weeklyBudget: BudgetMetrics;
  monthlyBudget: BudgetMetrics;
  yearlyBudget: BudgetMetrics;
}

export function calculateSummaryMetrics(
  transactions: Transaction[],
  budgetConfig: BudgetConfig,
  referenceDate: Date = new Date()
): SummaryMetrics {
  let todayExpenses = 0;
  let weeklyExpenses = 0;
  let monthlyExpenses = 0;
  let yearlyExpenses = 0;

  let totalIncome = 0;
  let totalExpenses = 0;
  let monthlyIncome = 0;

  transactions.forEach((tx) => {
    const txDate = parseISO(tx.date);

    if (tx.type === 'income') {
      totalIncome += tx.amount;
      if (isSameMonth(txDate, referenceDate) && isSameYear(txDate, referenceDate)) {
        monthlyIncome += tx.amount;
      }
    } else {
      totalExpenses += tx.amount;

      if (isSameDay(txDate, referenceDate)) {
        todayExpenses += tx.amount;
      }

      if (isSameWeek(txDate, referenceDate, { weekStartsOn: 1 })) {
        weeklyExpenses += tx.amount;
      }

      if (isSameMonth(txDate, referenceDate) && isSameYear(txDate, referenceDate)) {
        monthlyExpenses += tx.amount;
      }

      if (isSameYear(txDate, referenceDate)) {
        yearlyExpenses += tx.amount;
      }
    }
  });

  const currentBalance = totalIncome - totalExpenses;
  const monthlySavings = monthlyIncome - monthlyExpenses;

  const weeklyRemaining = Math.max(0, budgetConfig.weekly - weeklyExpenses);
  const weeklyPct = budgetConfig.weekly > 0 
    ? Math.min(100, Math.round((weeklyExpenses / budgetConfig.weekly) * 100))
    : 0;

  const monthlyRemaining = Math.max(0, budgetConfig.monthly - monthlyExpenses);
  const monthlyPct = budgetConfig.monthly > 0 
    ? Math.min(100, Math.round((monthlyExpenses / budgetConfig.monthly) * 100))
    : 0;

  const yearlyRemaining = Math.max(0, budgetConfig.yearly - yearlyExpenses);
  const yearlyPct = budgetConfig.yearly > 0 
    ? Math.min(100, Math.round((yearlyExpenses / budgetConfig.yearly) * 100))
    : 0;

  return {
    todayExpenses,
    weeklyExpenses,
    monthlyExpenses,
    yearlyExpenses,
    monthlyIncome,
    currentBalance,
    monthlySavings,
    weeklyBudget: {
      spent: weeklyExpenses,
      budget: budgetConfig.weekly,
      remaining: weeklyRemaining,
      percentageUsed: weeklyPct,
    },
    monthlyBudget: {
      spent: monthlyExpenses,
      budget: budgetConfig.monthly,
      remaining: monthlyRemaining,
      percentageUsed: monthlyPct,
    },
    yearlyBudget: {
      spent: yearlyExpenses,
      budget: budgetConfig.yearly,
      remaining: yearlyRemaining,
      percentageUsed: yearlyPct,
    },
  };
}
