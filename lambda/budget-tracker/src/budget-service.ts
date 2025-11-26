import { v4 as uuidv4 } from 'uuid';
import { BudgetRepository } from './repository';
import { Budget, BudgetAlert, BudgetReport, BudgetValidationResult, BudgetPeriod } from './types';

export class BudgetService {
  private repository: BudgetRepository;

  constructor() {
    this.repository = new BudgetRepository();
  }

  // Create a new budget
  async createBudget(period: BudgetPeriod, budgetLimit: number, startDate?: string): Promise<Budget> {
    const start = startDate || new Date().toISOString().split('T')[0];
    const end = this.calculateEndDate(start, period);

    const budget: Budget = {
      budgetId: uuidv4(),
      period,
      startDate: start,
      endDate: end,
      budgetLimit,
      spent: 0,
      remaining: budgetLimit,
      orders: [],
      alerts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.repository.saveBudget(budget);
    return budget;
  }

  // Validate if a purchase can be made within budget
  async validatePurchase(estimatedCost: number, period: BudgetPeriod = 'weekly'): Promise<BudgetValidationResult> {
    const budget = await this.repository.getCurrentBudget(period);

    if (!budget) {
      return {
        isValid: false,
        canProceed: true, // No budget set, allow purchase
        estimatedTotal: estimatedCost,
        currentSpent: 0,
        remaining: 0,
        wouldExceed: false,
        warnings: ['No budget configured for this period']
      };
    }

    const newTotal = budget.spent + estimatedCost;
    const wouldExceed = newTotal > budget.budgetLimit;
    const exceedAmount = wouldExceed ? newTotal - budget.budgetLimit : 0;

    const warnings: string[] = [];
    const percentageUsed = (newTotal / budget.budgetLimit) * 100;

    if (percentageUsed >= 100) {
      warnings.push(`This purchase would exceed budget by ${exceedAmount.toFixed(2)} NOK`);
    } else if (percentageUsed >= 80) {
      warnings.push(`This purchase would use ${percentageUsed.toFixed(1)}% of budget`);
    }

    return {
      isValid: !wouldExceed,
      canProceed: !wouldExceed,
      estimatedTotal: newTotal,
      currentSpent: budget.spent,
      remaining: budget.remaining - estimatedCost,
      wouldExceed,
      exceedAmount: wouldExceed ? exceedAmount : undefined,
      warnings
    };
  }

  // Record a purchase
  async recordPurchase(orderId: string, amount: number, period: BudgetPeriod = 'weekly'): Promise<void> {
    const budget = await this.repository.getCurrentBudget(period);

    if (!budget) {
      console.warn('No budget found for period, skipping budget tracking');
      return;
    }

    // Update budget spending
    await this.repository.updateBudgetSpending(budget.budgetId, amount, orderId);

    // Check for alert thresholds
    const newSpent = budget.spent + amount;
    const percentageUsed = (newSpent / budget.budgetLimit) * 100;

    await this.checkAndCreateAlerts(budget.budgetId, percentageUsed, newSpent, budget.budgetLimit);
  }

  // Generate budget report
  async generateReport(budgetId: string): Promise<BudgetReport> {
    const budget = await this.repository.getBudget(budgetId);

    if (!budget) {
      throw new Error(`Budget ${budgetId} not found`);
    }

    // Get all orders for this period
    const orders = await this.repository.getOrdersByPeriod(budget.startDate, budget.endDate);

    // Calculate statistics
    const totalSpent = budget.spent;
    const adherencePercentage = (totalSpent / budget.budgetLimit) * 100;
    const averageOrderCost = orders.length > 0 ? totalSpent / orders.length : 0;

    // Category breakdown (mock for now)
    const categoryBreakdown = [
      { category: 'Groceries', amount: totalSpent * 0.7, percentage: 70 },
      { category: 'Delivery', amount: totalSpent * 0.2, percentage: 20 },
      { category: 'Other', amount: totalSpent * 0.1, percentage: 10 }
    ];

    const report: BudgetReport = {
      reportId: uuidv4(),
      budgetId: budget.budgetId,
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate,
      totalBudget: budget.budgetLimit,
      totalSpent,
      totalRemaining: budget.remaining,
      adherencePercentage,
      orderCount: orders.length,
      averageOrderCost,
      categoryBreakdown,
      generatedAt: new Date().toISOString()
    };

    // Save report to S3
    await this.repository.saveReport(report);

    return report;
  }

  // Get current budget status
  async getBudgetStatus(period: BudgetPeriod = 'weekly'): Promise<Budget | null> {
    return await this.repository.getCurrentBudget(period);
  }

  // Private helper methods
  private calculateEndDate(startDate: string, period: BudgetPeriod): string {
    const date = new Date(startDate);
    
    if (period === 'weekly') {
      date.setDate(date.getDate() + 6); // 7 days total
    } else {
      date.setMonth(date.getMonth() + 1);
      date.setDate(date.getDate() - 1); // Last day of month
    }

    return date.toISOString().split('T')[0];
  }

  private async checkAndCreateAlerts(
    budgetId: string,
    percentageUsed: number,
    spent: number,
    limit: number
  ): Promise<void> {
    const budget = await this.repository.getBudget(budgetId);
    if (!budget) return;

    // Check if we've crossed alert thresholds
    const thresholds = [
      { percentage: 50, level: 'warning' as const, message: '50% of budget used' },
      { percentage: 80, level: 'warning' as const, message: '80% of budget used' },
      { percentage: 100, level: 'critical' as const, message: 'Budget limit reached' }
    ];

    for (const threshold of thresholds) {
      // Check if we just crossed this threshold
      const previousPercentage = ((spent - 100) / limit) * 100; // Approximate
      
      if (percentageUsed >= threshold.percentage && previousPercentage < threshold.percentage) {
        // Check if alert already exists
        const alertExists = budget.alerts.some(a => a.percentage === threshold.percentage);
        
        if (!alertExists) {
          const alert: BudgetAlert = {
            date: new Date().toISOString(),
            level: threshold.level,
            percentage: threshold.percentage,
            message: threshold.message,
            acknowledged: false
          };

          await this.repository.addBudgetAlert(budgetId, alert);
        }
      }
    }
  }
}
