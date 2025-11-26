"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const budget_service_1 = require("./budget-service");
const budgetService = new budget_service_1.BudgetService();
const handler = async (event) => {
    console.log('Budget Tracker Lambda invoked:', JSON.stringify(event, null, 2));
    try {
        // Support both API Gateway and direct invocation
        const action = event.action || event.queryStringParameters?.action || 'get-status';
        const body = event.body ? (typeof event.body === 'string' ? JSON.parse(event.body) : event.body) : event;
        let result;
        switch (action) {
            case 'create-budget':
                result = await budgetService.createBudget(body.period || 'weekly', body.budgetLimit, body.startDate);
                break;
            case 'validate-purchase':
                result = await budgetService.validatePurchase(body.estimatedCost, body.period || 'weekly');
                break;
            case 'record-purchase':
                await budgetService.recordPurchase(body.orderId, body.amount, body.period || 'weekly');
                result = { success: true, message: 'Purchase recorded' };
                break;
            case 'generate-report':
                result = await budgetService.generateReport(body.budgetId);
                break;
            case 'get-status':
                result = await budgetService.getBudgetStatus(body.period || 'weekly');
                break;
            default:
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        success: false,
                        error: `Unknown action: ${action}`
                    })
                };
        }
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                data: result
            })
        };
    }
    catch (error) {
        console.error('Error in Budget Tracker:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message || 'Internal server error'
            })
        };
    }
};
exports.handler = handler;
