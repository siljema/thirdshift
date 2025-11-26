"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const menu_generator_1 = require("./menu-generator");
const menuGenerator = new menu_generator_1.MenuGenerator();
const handler = async (event) => {
    console.log('Menu Generator Lambda invoked:', JSON.stringify(event, null, 2));
    try {
        // Parse input
        let input;
        if (event.body) {
            // API Gateway request
            input = JSON.parse(event.body);
        }
        else {
            // Direct invocation or Step Functions
            input = event;
        }
        // Generate meal plan
        const mealPlan = await menuGenerator.generateWeeklyMenu(input);
        // Return response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                mealPlan
            })
        };
    }
    catch (error) {
        console.error('Error generating menu:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message || 'Failed to generate menu'
            })
        };
    }
};
exports.handler = handler;
