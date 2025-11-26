import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { ConsumptionHistory, ConsumptionPattern } from './types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const HISTORY_TABLE = process.env.CONSUMPTION_HISTORY_TABLE || 'thirdshift-dev-consumption-history';
const PATTERNS_TABLE = process.env.CONSUMPTION_PATTERNS_TABLE || 'thirdshift-dev-consumption-patterns';

export class ConsumptionRepository {
  // Consumption History Operations
  async addHistory(history: ConsumptionHistory): Promise<void> {
    await docClient.send(new PutCommand({
      TableName: HISTORY_TABLE,
      Item: history
    }));
  }

  async getHistoryByItem(itemName: string, weeks: number = 12): Promise<ConsumptionHistory[]> {
    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - (weeks * 7));
    const cutoffDate = weeksAgo.toISOString().split('T')[0];

    const result = await docClient.send(new QueryCommand({
      TableName: HISTORY_TABLE,
      IndexName: 'itemName-date-index',
      KeyConditionExpression: 'itemName = :itemName AND #date >= :cutoffDate',
      ExpressionAttributeNames: {
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':itemName': itemName,
        ':cutoffDate': cutoffDate
      }
    }));

    return result.Items as ConsumptionHistory[] || [];
  }

  async getAllHistory(weeks: number = 12): Promise<ConsumptionHistory[]> {
    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - (weeks * 7));
    const cutoffDate = weeksAgo.toISOString().split('T')[0];

    const result = await docClient.send(new ScanCommand({
      TableName: HISTORY_TABLE,
      FilterExpression: '#date >= :cutoffDate',
      ExpressionAttributeNames: {
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':cutoffDate': cutoffDate
      }
    }));

    return result.Items as ConsumptionHistory[] || [];
  }

  // Consumption Pattern Operations
  async savePattern(pattern: ConsumptionPattern): Promise<void> {
    await docClient.send(new PutCommand({
      TableName: PATTERNS_TABLE,
      Item: pattern
    }));
  }

  async getPattern(itemName: string): Promise<ConsumptionPattern | null> {
    const result = await docClient.send(new GetCommand({
      TableName: PATTERNS_TABLE,
      Key: { itemName }
    }));

    return result.Item as ConsumptionPattern || null;
  }

  async getAllPatterns(): Promise<ConsumptionPattern[]> {
    const result = await docClient.send(new ScanCommand({
      TableName: PATTERNS_TABLE
    }));

    return result.Items as ConsumptionPattern[] || [];
  }
}
