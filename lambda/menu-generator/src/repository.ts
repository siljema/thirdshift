import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { MealPlan } from './types';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

const MEAL_PLANS_TABLE = process.env.MEAL_PLANS_TABLE || 'thirdshift-dev-meal-plans';
const PROFILES_TABLE = process.env.PROFILES_TABLE || 'thirdshift-dev-profiles';
const INVENTORY_TABLE = process.env.INVENTORY_TABLE || 'thirdshift-dev-inventory';
const MEAL_PLANS_BUCKET = process.env.MEAL_PLANS_BUCKET || 'thirdshift-dev-meal-plans';

export class MenuRepository {
  async saveMealPlan(mealPlan: MealPlan): Promise<void> {
    // Save summary to DynamoDB
    const summary = {
      mealPlanId: mealPlan.mealPlanId,
      weekStartDate: mealPlan.weekStartDate,
      weekEndDate: mealPlan.weekEndDate,
      totalMeals: mealPlan.meals.length,
      totalCost: mealPlan.totalCost,
      status: mealPlan.status,
      createdAt: mealPlan.createdAt
    };

    await docClient.send(new PutCommand({
      TableName: MEAL_PLANS_TABLE,
      Item: summary
    }));

    // Save full meal plan to S3
    const s3Key = `meal-plans/${mealPlan.mealPlanId}.json`;
    await s3Client.send(new PutObjectCommand({
      Bucket: MEAL_PLANS_BUCKET,
      Key: s3Key,
      Body: JSON.stringify(mealPlan, null, 2),
      ContentType: 'application/json'
    }));
  }

  async getAllProfiles(): Promise<any[]> {
    const result = await docClient.send(new ScanCommand({
      TableName: PROFILES_TABLE
    }));

    return result.Items || [];
  }

  async getAllInventory(): Promise<any[]> {
    const result = await docClient.send(new ScanCommand({
      TableName: INVENTORY_TABLE
    }));

    return result.Items || [];
  }

  async getExpiringInventory(days: number = 3): Promise<any[]> {
    const today = new Date();
    const thresholdDate = new Date(today);
    thresholdDate.setDate(today.getDate() + days);

    const allInventory = await this.getAllInventory();
    
    return allInventory.filter(item => {
      const expDate = new Date(item.expirationDate);
      return expDate <= thresholdDate && expDate >= today;
    });
  }
}
