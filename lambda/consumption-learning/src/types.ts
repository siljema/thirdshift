// Consumption Learning Types

export type Trend = 'increasing' | 'decreasing' | 'stable';

export interface ConsumptionHistory {
  historyId: string;
  itemName: string;
  date: string; // YYYY-MM-DD
  quantityUsed: number;
  unit: string;
  mealPlanId?: string;
  wasteAmount?: number;
  actualServings?: number;
}

export interface ConsumptionPattern {
  itemName: string;
  averageWeeklyUsage: number;
  unit: string;
  averageServingSize?: number;
  wastePercentage: number;
  lastUpdated: string;
  confidenceScore: number; // 0-1
  dataPoints: number;
  trend: Trend;
  weeklyHistory: number[]; // Last 12 weeks
}

export interface LearningResult {
  itemName: string;
  previousAverage: number;
  newAverage: number;
  trend: Trend;
  confidenceScore: number;
  recommendation: string;
}

export interface ConsumptionSummary {
  totalItems: number;
  itemsWithHighConfidence: number;
  itemsWithTrend: {
    increasing: number;
    decreasing: number;
    stable: number;
  };
  averageWastePercentage: number;
  recommendations: string[];
}
