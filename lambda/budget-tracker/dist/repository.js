"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetRepository = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_s3_1 = require("@aws-sdk/client-s3");
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new client_s3_1.S3Client({});
const BUDGETS_TABLE = process.env.BUDGETS_TABLE || 'thirdshift-dev-budgets';
const ORDERS_TABLE = process.env.ORDERS_TABLE || 'thirdshift-dev-orders';
const REPORTS_BUCKET = process.env.MEAL_PLANS_BUCKET || 'thirdshift-dev-meal-plans';
class BudgetRepository {
    // Budget Operations
    async saveBudget(budget) {
        await docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: BUDGETS_TABLE,
            Item: budget
        }));
    }
    async getBudget(budgetId) {
        const result = await docClient.send(new lib_dynamodb_1.GetCommand({
            TableName: BUDGETS_TABLE,
            Key: { budgetId }
        }));
        return result.Item || null;
    }
    async getCurrentBudget(period) {
        const now = new Date().toISOString().split('T')[0];
        const result = await docClient.send(new lib_dynamodb_1.QueryCommand({
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
        return result.Items?.[0] || null;
    }
    async updateBudgetSpending(budgetId, amount, orderId) {
        await docClient.send(new lib_dynamodb_1.UpdateCommand({
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
    async addBudgetAlert(budgetId, alert) {
        await docClient.send(new lib_dynamodb_1.UpdateCommand({
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
    async getOrder(orderId) {
        const result = await docClient.send(new lib_dynamodb_1.GetCommand({
            TableName: ORDERS_TABLE,
            Key: { orderId }
        }));
        return result.Item || null;
    }
    async getOrdersByPeriod(startDate, endDate) {
        const result = await docClient.send(new lib_dynamodb_1.QueryCommand({
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
    async saveReport(report) {
        const s3Key = `reports/budget-${report.reportId}.json`;
        await s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: REPORTS_BUCKET,
            Key: s3Key,
            Body: JSON.stringify(report, null, 2),
            ContentType: 'application/json'
        }));
    }
    async getAllBudgets() {
        const result = await docClient.send(new lib_dynamodb_1.ScanCommand({
            TableName: BUDGETS_TABLE
        }));
        return result.Items || [];
    }
}
exports.BudgetRepository = BudgetRepository;
