import type { Transaction, HealthScoreResult, HealthStatus, BudgetConfig } from '../types';
import { calculateSummaryMetrics } from './budgetService';
import { 
  subWeeks, 
  isSameWeek, 
  isSameMonth, 
  isSameYear, 
  parseISO 
} from 'date-fns';

export function calculateHealthScore(
  transactions: Transaction[],
  budgetConfig: BudgetConfig,
  referenceDate: Date = new Date()
): HealthScoreResult {
  const metrics = calculateSummaryMetrics(transactions, budgetConfig, referenceDate);
  const insights: string[] = [];

  const monthlyPct = metrics.monthlyBudget.percentageUsed;
  const weeklyPct = metrics.weeklyBudget.percentageUsed;

  let monthlyScore = 40;
  if (monthlyPct > 100) {
    monthlyScore = 0;
  } else {
    monthlyScore = Math.round(40 * (1 - monthlyPct / 100));
  }

  let weeklyScore = 30;
  if (weeklyPct > 100) {
    weeklyScore = 0;
  } else {
    weeklyScore = Math.round(30 * (1 - weeklyPct / 100));
  }

  let savingsScore = 15;
  if (metrics.monthlyIncome > 0) {
    const savingsRatio = metrics.monthlySavings / metrics.monthlyIncome;
    if (savingsRatio >= 0.2) {
      savingsScore = 30;
    } else if (savingsRatio > 0) {
      savingsScore = Math.round(30 * (savingsRatio / 0.2));
    } else {
      savingsScore = 0;
    }
  }

  const score = Math.max(0, Math.min(100, monthlyScore + weeklyScore + savingsScore));

  let status: HealthStatus = 'Excellent';
  let badgeColor = '#10B981';

  if (monthlyPct > 100 || weeklyPct > 100 || score < 40) {
    status = 'Budget Exceeded';
    badgeColor = '#EF4444';
  } else if (score < 60) {
    status = 'Warning';
    badgeColor = '#F97316';
  } else if (score < 80) {
    status = 'Good';
    badgeColor = '#EAB308';
  }

  if (monthlyPct > 100) {
    insights.push(`You have exceeded your monthly budget by $${(metrics.monthlyExpenses - budgetConfig.monthly).toFixed(2)}.`);
  } else if (monthlyPct >= 80) {
    insights.push(`You have already used ${monthlyPct}% of this month's budget.`);
  } else {
    insights.push(`You are well within your monthly budget (${monthlyPct}% used).`);
  }

  const prevWeekDate = subWeeks(referenceDate, 1);
  let prevWeekExpenses = 0;
  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      const txDate = parseISO(tx.date);
      if (isSameWeek(txDate, prevWeekDate, { weekStartsOn: 1 })) {
        prevWeekExpenses += tx.amount;
      }
    }
  });

  if (metrics.weeklyExpenses > prevWeekExpenses && prevWeekExpenses > 0) {
    const increasePct = Math.round(((metrics.weeklyExpenses - prevWeekExpenses) / prevWeekExpenses) * 100);
    insights.push(`You spent ${increasePct}% more than last week.`);
  } else if (metrics.weeklyExpenses < prevWeekExpenses && prevWeekExpenses > 0) {
    const decreasePct = Math.round(((prevWeekExpenses - metrics.weeklyExpenses) / prevWeekExpenses) * 100);
    insights.push(`Great job! You spent ${decreasePct}% less than last week.`);
  }

  const categoryTotals: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      const txDate = parseISO(tx.date);
      if (isSameMonth(txDate, referenceDate) && isSameYear(txDate, referenceDate)) {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      }
    }
  });

  let highestCat = '';
  let highestCatAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > highestCatAmount) {
      highestCatAmount = amt;
      highestCat = cat;
    }
  });

  if (highestCat) {
    insights.push(`${highestCat} is your highest spending category this month ($${highestCatAmount.toFixed(2)}).`);
  }

  if (metrics.monthlySavings > 0) {
    insights.push(`You have saved $${metrics.monthlySavings.toFixed(2)} this month.`);
  } else if (metrics.monthlySavings < 0) {
    insights.push(`Your expenses exceeded income by $${Math.abs(metrics.monthlySavings).toFixed(2)} this month.`);
  }

  return {
    score,
    status,
    badgeColor,
    insights,
  };
}
