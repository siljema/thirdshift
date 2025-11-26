import { v4 as uuidv4 } from 'uuid';
import { ConsumptionRepository } from './repository';
import { LearningEngine } from './learning-engine';
import { ConsumptionHistory, LearningResult, ConsumptionSummary } from './types';

interface LambdaEvent {
  action: 'learn-all' | 'learn-item' | 'add-history' | 'get-pattern' | 'get-summary';
  itemName?: string;
  historyData?: {
    itemName: string;
    quantityUsed: number;
    unit: string;
    date?: string;
    mealPlanId?: string;
    wasteAmount?: number;
    actualServings?: number;
  };
}

interface LambdaResult {
  statusCode: number;
  body: any;
}

const repository = new ConsumptionRepository();
const learningEngine = new LearningEngine();

export const handler = async (event: LambdaEvent): Promise<LambdaResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    switch (event.action) {
      case 'add-history':
        return await addHistory(event.historyData!);
      case 'learn-item':
        return await learnItem(event.itemName!);
      case 'learn-all':
        return await learnAll();
      case 'get-pattern':
        return await getPattern(event.itemName!);
      case 'get-summary':
        return await getSummary();
      default:
        return {
          statusCode: 400,
          body: { error: 'Invalid action' }
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: { error: 'Internal server error', details: (error as Error).message }
    };
  }
};

async function addHistory(data: any): Promise<LambdaResult> {
  const history: ConsumptionHistory = {
    historyId: uuidv4(),
    itemName: data.itemName,
    date: data.date || new Date().toISOString().split('T')[0],
    quantityUsed: data.quantityUsed,
    unit: data.unit,
    mealPlanId: data.mealPlanId,
    wasteAmount: data.wasteAmount,
    actualServings: data.actualServings
  };

  await repository.addHistory(history);

  return {
    statusCode: 201,
    body: {
      message: 'Consumption history added',
      history
    }
  };
}

async function learnItem(itemName: string): Promise<LambdaResult> {
  // Get historical data for this item
  const history = await repository.getHistoryByItem(itemName, 12);

  if (history.length < 2) {
    return {
      statusCode: 200,
      body: {
        message: 'Not enough data to learn pattern',
        itemName,
        dataPoints: history.length,
        minimumRequired: 2
      }
    };
  }

  // Get existing pattern if any
  const existingPattern = await repository.getPattern(itemName);

  // Learn new pattern
  const newPattern = learningEngine.learnPattern(itemName, history, existingPattern || undefined);

  // Save pattern
  await repository.savePattern(newPattern);

  // Generate recommendation
  const recommendation = learningEngine.generateRecommendation(newPattern);

  const result: LearningResult = {
    itemName,
    previousAverage: existingPattern?.averageWeeklyUsage || 0,
    newAverage: newPattern.averageWeeklyUsage,
    trend: newPattern.trend,
    confidenceScore: newPattern.confidenceScore,
    recommendation
  };

  return {
    statusCode: 200,
    body: {
      message: 'Pattern learned successfully',
      result,
      pattern: newPattern
    }
  };
}

async function learnAll(): Promise<LambdaResult> {
  // Get all consumption history
  const allHistory = await repository.getAllHistory(12);

  if (allHistory.length === 0) {
    return {
      statusCode: 200,
      body: {
        message: 'No consumption history found',
        itemsLearned: 0
      }
    };
  }

  // Group by item name
  const itemGroups = new Map<string, ConsumptionHistory[]>();
  for (const record of allHistory) {
    const existing = itemGroups.get(record.itemName) || [];
    existing.push(record);
    itemGroups.set(record.itemName, existing);
  }

  // Learn pattern for each item
  const results: LearningResult[] = [];

  for (const [itemName, history] of itemGroups.entries()) {
    if (history.length < 2) continue;

    const existingPattern = await repository.getPattern(itemName);
    const newPattern = learningEngine.learnPattern(itemName, history, existingPattern || undefined);
    await repository.savePattern(newPattern);

    const recommendation = learningEngine.generateRecommendation(newPattern);

    results.push({
      itemName,
      previousAverage: existingPattern?.averageWeeklyUsage || 0,
      newAverage: newPattern.averageWeeklyUsage,
      trend: newPattern.trend,
      confidenceScore: newPattern.confidenceScore,
      recommendation
    });
  }

  return {
    statusCode: 200,
    body: {
      message: 'Learning complete',
      itemsLearned: results.length,
      results
    }
  };
}

async function getPattern(itemName: string): Promise<LambdaResult> {
  const pattern = await repository.getPattern(itemName);

  if (!pattern) {
    return {
      statusCode: 404,
      body: { error: 'Pattern not found for item' }
    };
  }

  const recommendation = learningEngine.generateRecommendation(pattern);

  return {
    statusCode: 200,
    body: {
      pattern,
      recommendation
    }
  };
}

async function getSummary(): Promise<LambdaResult> {
  const patterns = await repository.getAllPatterns();

  if (patterns.length === 0) {
    return {
      statusCode: 200,
      body: {
        message: 'No patterns learned yet',
        summary: {
          totalItems: 0,
          itemsWithHighConfidence: 0,
          itemsWithTrend: { increasing: 0, decreasing: 0, stable: 0 },
          averageWastePercentage: 0,
          recommendations: []
        }
      }
    };
  }

  const summary: ConsumptionSummary = {
    totalItems: patterns.length,
    itemsWithHighConfidence: patterns.filter(p => p.confidenceScore > 0.7).length,
    itemsWithTrend: {
      increasing: patterns.filter(p => p.trend === 'increasing').length,
      decreasing: patterns.filter(p => p.trend === 'decreasing').length,
      stable: patterns.filter(p => p.trend === 'stable').length
    },
    averageWastePercentage: patterns.reduce((sum, p) => sum + p.wastePercentage, 0) / patterns.length,
    recommendations: patterns
      .filter(p => p.confidenceScore > 0.7)
      .map(p => learningEngine.generateRecommendation(p))
      .slice(0, 5) // Top 5 recommendations
  };

  return {
    statusCode: 200,
    body: {
      summary,
      patterns: patterns.slice(0, 10) // Return top 10 patterns
    }
  };
}
