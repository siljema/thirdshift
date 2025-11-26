"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuRepository = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_s3_1 = require("@aws-sdk/client-s3");
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new client_s3_1.S3Client({});
const MEAL_PLANS_TABLE = process.env.MEAL_PLANS_TABLE || 'thirdshift-dev-meal-plans';
const PROFILES_TABLE = process.env.PROFILES_TABLE || 'thirdshift-dev-profiles';
const INVENTORY_TABLE = process.env.INVENTORY_TABLE || 'thirdshift-dev-inventory';
const MEAL_PLANS_BUCKET = process.env.MEAL_PLANS_BUCKET || 'thirdshift-dev-meal-plans';
class MenuRepository {
    async saveMealPlan(mealPlan) {
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
        await docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: MEAL_PLANS_TABLE,
            Item: summary
        }));
        // Save full meal plan to S3
        const s3Key = `meal-plans/${mealPlan.mealPlanId}.json`;
        await s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: MEAL_PLANS_BUCKET,
            Key: s3Key,
            Body: JSON.stringify(mealPlan, null, 2),
            ContentType: 'application/json'
        }));
    }
    async getAllProfiles() {
        const result = await docClient.send(new lib_dynamodb_1.ScanCommand({
            TableName: PROFILES_TABLE
        }));
        return result.Items || [];
    }
    async getAllInventory() {
        const result = await docClient.send(new lib_dynamodb_1.ScanCommand({
            TableName: INVENTORY_TABLE
        }));
        return result.Items || [];
    }
    async getExpiringInventory(days = 3) {
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
exports.MenuRepository = MenuRepository;
