import type { Transaction, BudgetConfig } from '../types';
import { 
  startOfWeek, 
  addDays, 
  format, 
  isSameDay, 
  parseISO, 
  subMonths, 
  startOfMonth, 
  endOfMonth,
  isWithinInterval 
} from 'date-fns';

export interface WeeklySpendingPoint {
  day: string;
  date: string;
  amount: number;
}

export interface IncomeVsExpensePoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface BudgetVsActualPoint {
  period: 'Weekly' | 'Monthly' | 'Yearly';
  budget: number;
  actual: number;
}

export function getWeeklySpendingData(
  transactions: Transaction[],
  referenceDate: Date = new Date()
): WeeklySpendingPoint[] {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const result: WeeklySpendingPoint[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDay = addDays(weekStart, i);
    const dateStr = format(currentDay, 'yyyy-MM-dd');
    const dayLabel = format(currentDay, 'EEE');

    let total = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'expense' && isSameDay(parseISO(tx.date), currentDay)) {
        total += tx.amount;
      }
    });

    result.push({
      day: dayLabel,
      date: dateStr,
      amount: total,
    });
  }

  return result;
}

export function getIncomeVsExpenseData(
  transactions: Transaction[],
  referenceDate: Date = new Date()
): IncomeVsExpensePoint[] {
  const result: IncomeVsExpensePoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const targetMonth = subMonths(referenceDate, i);
    const monthLabel = format(targetMonth, 'MMM yyyy');
    const monthStart = startOfMonth(targetMonth);
    const monthEnd = endOfMonth(targetMonth);

    let income = 0;
    let expenses = 0;

    transactions.forEach((tx) => {
      const txDate = parseISO(tx.date);
      if (isWithinInterval(txDate, { start: monthStart, end: monthEnd })) {
        if (tx.type === 'income') {
          income += tx.amount;
        } else {
          expenses += tx.amount;
        }
      }
    });

    result.push({
      month: monthLabel,
      income,
      expenses,
      savings: Math.max(0, income - expenses),
    });
  }

  return result;
}

export function getBudgetVsActualData(
  _transactions: Transaction[],
  budgetConfig: BudgetConfig,
  weeklySpent: number,
  monthlySpent: number,
  yearlySpent: number
): BudgetVsActualPoint[] {
  return [
    { period: 'Weekly', budget: budgetConfig.weekly, actual: weeklySpent },
    { period: 'Monthly', budget: budgetConfig.monthly, actual: monthlySpent },
    { period: 'Yearly', budget: budgetConfig.yearly, actual: yearlySpent },
  ];
}
