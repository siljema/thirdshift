// Budget Tracker Types

export type BudgetPeriod = 'weekly' | 'monthly';
export type AlertLevel = 'warning' | 'critical';

export interface Budget {
  budgetId: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  budgetLimit: number;
  spent: number;
  remaining: number;
  orders: string[]; // Order IDs
  alerts: BudgetAlert[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAlert {
  date: string;
  level: AlertLevel;
  percentage: number;
  message: string;
  acknowledged: boolean;
}

export interface SpendingRecord {
  recordId: string;
  budgetId: string;
  orderId: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

export interface BudgetReport {
  reportId: string;
  budgetId: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  adherencePercentage: number;
  orderCount: number;
  averageOrderCost: number;
  categoryBreakdown: CategorySpending[];
  comparisonToPrevious?: PeriodComparison;
  generatedAt: string;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

export interface PeriodComparison {
  previousPeriod: string;
  previousSpent: number;
  change: number;
  changePercentage: number;
}

export interface BudgetValidationResult {
  isValid: boolean;
  canProceed: boolean;
  estimatedTotal: number;
  currentSpent: number;
  remaining: number;
  wouldExceed: boolean;
  exceedAmount?: number;
  warnings: string[];
}
