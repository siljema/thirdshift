# Menu Generator Lambda

AI-powered menu generation service for ThirdShift meal planning system.

## Features

- **AI-Powered Generation**: Uses AWS Bedrock (Claude 3) to create intelligent, personalized meal plans
- **Dietary Constraints**: Respects allergies, dietary restrictions, and preferences
- **Expiring Ingredients**: Prioritizes ingredients approaching expiration
- **Cooking Expertise**: Matches recipe difficulty to cook's skill level
- **Budget Awareness**: Generates meals within budget constraints
- **Shopping List**: Automatically creates shopping list from meal plan

## Architecture

```
┌─────────────────┐
│  API Gateway    │
│  or Step Fns    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Menu Generator │
│     Lambda      │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│Bedrock │ │ DynamoDB │
│Claude 3│ │ Tables   │
└────────┘ └──────────┘
```

## Environment Variables

- `USE_BEDROCK` - Enable/disable Bedrock AI (default: false)
- `BEDROCK_REGION` - AWS region for Bedrock (default: us-east-1)
- `BEDROCK_MODEL_ID` - Bedrock model ID (default: anthropic.claude-3-sonnet-20240229-v1:0)
- `MEAL_PLANS_TABLE` - DynamoDB table for meal plans
- `PROFILES_TABLE` - DynamoDB table for profiles
- `INVENTORY_TABLE` - DynamoDB table for inventory
- `MEAL_PLANS_BUCKET` - S3 bucket for detailed meal plans

## Input Format

```json
{
  "weekStartDate": "2025-12-02",
  "profiles": [...],
  "inventory": [...],
  "availabilityMatrix": {...},
  "budget": 1200
}
```

## Output Format

```json
{
  "success": true,
  "mealPlan": {
    "mealPlanId": "uuid",
    "weekStartDate": "2025-12-02",
    "weekEndDate": "2025-12-08",
    "meals": [...],
    "shoppingList": [...],
    "totalCost": 850,
    "status": "draft"
  }
}
```

## Development

### Install Dependencies
```bash
npm install
```

### Build
```bash
npm run build
```

### Test Locally
```bash
./test.sh
```

### Deploy
```bash
npm run deploy
```

## Testing

The Lambda includes mock data generation when Bedrock is disabled, allowing for testing without AI costs.

Test with:
```bash
USE_BEDROCK=false ./test.sh
```

## AI Integration

When `USE_BEDROCK=true`, the Lambda uses AWS Bedrock with Claude 3 Sonnet to:

1. Analyze family profiles and constraints
2. Identify expiring ingredients to prioritize
3. Generate creative, varied meal suggestions
4. Adapt recipes for dietary restrictions
5. Match cooking difficulty to assigned cook
6. Ensure nutritional balance

The AI prompt includes:
- Family member profiles with ages and roles
- Dietary restrictions and allergies (critical constraints)
- Current inventory and expiring items
- Budget constraints
- Cooking expertise levels

## Error Handling

- Falls back to mock data if Bedrock fails
- Validates all dietary constraints
- Handles missing data gracefully
- Logs all errors to CloudWatch

## Cost Optimization

- Mock mode for development (no AI costs)
- Efficient DynamoDB queries
- S3 storage for detailed plans
- Bedrock only when needed

## Requirements

Implements requirements:
- 1.3: AI-powered menu generation
- 1.4: Recipe integration
- 2.2: Prioritize expiring ingredients
- 7.4: Respect dietary restrictions
- 9.2: Match cooking expertise
- 10.1-10.3: School lunch planning
