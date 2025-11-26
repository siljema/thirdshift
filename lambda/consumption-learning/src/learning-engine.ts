import { ConsumptionHistory, ConsumptionPattern, Trend, LearningResult } from './types';

export class LearningEngine {
  /**
   * Calculate exponential moving average
   * Recent data is weighted more heavily (60% last 4 weeks, 40% older data)
   */
  calculateEMA(weeklyData: number[]): number {
    if (weeklyData.length === 0) return 0;
    if (weeklyData.length === 1) return weeklyData[0];

    const recentWeeks = weeklyData.slice(-4); // Last 4 weeks
    const olderWeeks = weeklyData.slice(0, -4); // Older data

    const recentAvg = recentWeeks.reduce((sum, val) => sum + val, 0) / recentWeeks.length;
    const olderAvg = olderWeeks.length > 0 
      ? olderWeeks.reduce((sum, val) => sum + val, 0) / olderWeeks.length 
      : recentAvg;

    // Weight recent data 60%, older data 40%
    return (recentAvg * 0.6) + (olderAvg * 0.4);
  }

  /**
   * Detect trend in consumption
   */
  detectTrend(weeklyData: number[]): Trend {
    if (weeklyData.length < 4) return 'stable';

    const recentWeeks = weeklyData.slice(-4);
    const olderWeeks = weeklyData.slice(0, -4);

    if (olderWeeks.length === 0) return 'stable';

    const recentAvg = recentWeeks.reduce((sum, val) => sum + val, 0) / recentWeeks.length;
    const olderAvg = olderWeeks.reduce((sum, val) => sum + val, 0) / olderWeeks.length;

    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (changePercent > 15) return 'increasing';
    if (changePercent < -15) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate confidence score based on data consistency
   * More data points and lower variance = higher confidence
   */
  calculateConfidence(weeklyData: number[]): number {
    if (weeklyData.length < 4) {
      // Not enough data
      return Math.min(weeklyData.length / 4, 0.5);
    }

    // Calculate coefficient of variation (CV)
    const mean = weeklyData.reduce((sum, val) => sum + val, 0) / weeklyData.length;
    const variance = weeklyData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / weeklyData.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 1;

    // Lower CV = higher confidence
    // CV < 0.2 = very consistent (confidence 0.9-1.0)
    // CV > 0.5 = very inconsistent (confidence 0.3-0.5)
    let confidenceFromConsistency = Math.max(0.3, 1 - cv);

    // Boost confidence with more data points
    const dataPointBonus = Math.min(weeklyData.length / 12, 1) * 0.2;

    return Math.min(confidenceFromConsistency + dataPointBonus, 1);
  }

  /**
   * Detect anomalies (e.g., vacation weeks) and exclude them
   */
  detectAnomalies(weeklyData: number[]): number[] {
    if (weeklyData.length < 4) return weeklyData;

    const mean = weeklyData.reduce((sum, val) => sum + val, 0) / weeklyData.length;
    const variance = weeklyData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / weeklyData.length;
    const stdDev = Math.sqrt(variance);

    // Remove values more than 2 standard deviations from mean
    return weeklyData.filter(val => Math.abs(val - mean) <= 2 * stdDev);
  }

  /**
   * Group consumption history by week
   */
  groupByWeek(history: ConsumptionHistory[]): number[] {
    const weeklyTotals = new Map<string, number>();

    for (const record of history) {
      const date = new Date(record.date);
      const weekStart = this.getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];

      const current = weeklyTotals.get(weekKey) || 0;
      weeklyTotals.set(weekKey, current + record.quantityUsed);
    }

    // Sort by date and return values
    const sorted = Array.from(weeklyTotals.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, total]) => total);

    return sorted;
  }

  /**
   * Calculate waste percentage
   */
  calculateWastePercentage(history: ConsumptionHistory[]): number {
    const totalUsed = history.reduce((sum, h) => sum + h.quantityUsed, 0);
    const totalWaste = history.reduce((sum, h) => sum + (h.wasteAmount || 0), 0);

    if (totalUsed === 0) return 0;
    return (totalWaste / (totalUsed + totalWaste)) * 100;
  }

  /**
   * Learn pattern from history
   */
  learnPattern(
    itemName: string,
    history: ConsumptionHistory[],
    existingPattern?: ConsumptionPattern
  ): ConsumptionPattern {
    const weeklyData = this.groupByWeek(history);
    const cleanedData = this.detectAnomalies(weeklyData);

    const averageWeeklyUsage = this.calculateEMA(cleanedData);
    const trend = this.detectTrend(cleanedData);
    const confidenceScore = this.calculateConfidence(cleanedData);
    const wastePercentage = this.calculateWastePercentage(history);

    // Calculate average serving size if data available
    const recordsWithServings = history.filter(h => h.actualServings);
    const averageServingSize = recordsWithServings.length > 0
      ? recordsWithServings.reduce((sum, h) => sum + (h.quantityUsed / (h.actualServings || 1)), 0) / recordsWithServings.length
      : undefined;

    return {
      itemName,
      averageWeeklyUsage,
      unit: history[0]?.unit || 'units',
      averageServingSize,
      wastePercentage,
      lastUpdated: new Date().toISOString(),
      confidenceScore,
      dataPoints: history.length,
      trend,
      weeklyHistory: weeklyData.slice(-12) // Keep last 12 weeks
    };
  }

  /**
   * Generate recommendation based on pattern
   */
  generateRecommendation(pattern: ConsumptionPattern): string {
    const recommendations: string[] = [];

    // Trend-based recommendations
    if (pattern.trend === 'increasing' && pattern.confidenceScore > 0.7) {
      recommendations.push(`Increase weekly order by 15-20% (currently ${pattern.averageWeeklyUsage.toFixed(1)} ${pattern.unit})`);
    } else if (pattern.trend === 'decreasing' && pattern.confidenceScore > 0.7) {
      recommendations.push(`Decrease weekly order by 15-20% (currently ${pattern.averageWeeklyUsage.toFixed(1)} ${pattern.unit})`);
    }

    // Waste-based recommendations
    if (pattern.wastePercentage > 10) {
      recommendations.push(`High waste (${pattern.wastePercentage.toFixed(1)}%) - consider reducing quantity or using sooner`);
    } else if (pattern.wastePercentage < 2) {
      recommendations.push(`Low waste - good quantity management`);
    }

    // Confidence-based recommendations
    if (pattern.confidenceScore < 0.5) {
      recommendations.push(`Low confidence - need more data (${pattern.dataPoints} data points)`);
    }

    return recommendations.length > 0 
      ? recommendations.join('; ') 
      : `Maintain current quantity (${pattern.averageWeeklyUsage.toFixed(1)} ${pattern.unit}/week)`;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(d.setDate(diff));
  }
}
