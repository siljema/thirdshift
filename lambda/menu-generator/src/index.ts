import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MenuGenerator } from './menu-generator';
import { MenuGenerationInput } from './types';

const menuGenerator = new MenuGenerator();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Menu Generator Lambda invoked:', JSON.stringify(event, null, 2));

  try {
    // Parse input
    let input: MenuGenerationInput;
    
    if (event.body) {
      // API Gateway request
      input = JSON.parse(event.body);
    } else {
      // Direct invocation or Step Functions
      input = event as any;
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
  } catch (error: any) {
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
