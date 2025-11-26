import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Budget, SpendingRecord, BudgetReport } from './types';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

const BUDGETS_TABLE = process.env.BUDGETS_TABLE || 'thirdshift-dev-budgets';
const ORDERS_TABLE = process.env.ORDERS_TABLE || 'thirdshift-dev-orders';
const REPORTS_BUCKET = process.env.MEAL_PLANS_BUCKET || 'thirdshift-dev-meal-plans';

export class BudgetRepository {
  // Budget Operations
  async saveBudget(budget: Budget): Promise<void> {
    await docClient.send(new PutCommand({
      TableName: BUDGETS_TABLE,
      Item: budget
    }));
  }

  async getBudget(budgetId: string): Promise<Budget | null> {
    const result = await docClient.send(new GetCommand({
      TableName: BUDGETS_TABLE,
      Key: { budgetId }
    }));

    return result.Item as Budget || null;
  }

  async getCurrentBudget(period: 'weekly' | 'monthly'): Promise<Budget | null> {
    const now = new Date().toISOString().split('T')[0];
    
    const result = await docClient.send(new QueryCommand({
      TableName: BUDGETS_TABLE,
      IndexName: 'period-startDate-index',
      KeyConditionExpression: 'period = :period AND startDate <= :now',
      FilterExpression: 'endDate >= :now',
      ExpressionAttributeValues: {
        ':period': period,
        ':now': now
      },
      Limit: 1,
      ScanIndexForward: false
    }));

    return result.Items?.[0] as Budget || null;
  }

  async updateBudgetSpending(budgetId: string, amount: number, orderId: string): Promise<void> {
    await docClient.send(new UpdateCommand({
      TableName: BUDGETS_TABLE,
      Key: { budgetId },
      UpdateExpression: 'SET spent = spent + :amount, remaining = remaining - :amount, orders = list_append(if_not_exists(orders, :empty_list), :order), updatedAt = :now',
      ExpressionAttributeValues: {
        ':amount': amount,
        ':order': [orderId],
        ':empty_list': [],
        ':now': new Date().toISOString()
      }
    }));
  }

  async addBudgetAlert(budgetId: string, alert: any): Promise<void> {
    await docClient.send(new UpdateCommand({
      TableName: BUDGETS_TABLE,
      Key: { budgetId },
      UpdateExpression: 'SET alerts = list_append(if_not_exists(alerts, :empty_list), :alert), updatedAt = :now',
      ExpressionAttributeValues: {
        ':alert': [alert],
        ':empty_list': [],
        ':now': new Date().toISOString()
      }
    }));
  }

  // Order Operations
  async getOrder(orderId: string): Promise<any> {
    const result = await docClient.send(new GetCommand({
      TableName: ORDERS_TABLE,
      Key: { orderId }
    }));

    return result.Item || null;
  }

  async getOrdersByPeriod(startDate: string, endDate: string): Promise<any[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: ORDERS_TABLE,
      IndexName: 'orderDate-index',
      KeyConditionExpression: 'orderDate BETWEEN :start AND :end',
      ExpressionAttributeValues: {
        ':start': startDate,
        ':end': endDate
      }
    }));

    return result.Items || [];
  }

  // Report Operations
  async saveReport(report: BudgetReport): Promise<void> {
    const s3Key = `reports/budget-${report.reportId}.json`;
    await s3Client.send(new PutObjectCommand({
      Bucket: REPORTS_BUCKET,
      Key: s3Key,
      Body: JSON.stringify(report, null, 2),
      ContentType: 'application/json'
    }));
  }

  async getAllBudgets(): Promise<Budget[]> {
    const result = await docClient.send(new ScanCommand({
      TableName: BUDGETS_TABLE
    }));

    return (result.Items as Budget[]) || [];
  }
}
