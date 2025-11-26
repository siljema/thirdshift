# Budget Integration in Menu Generator

## Overview

The Menu Generator now integrates with the Budget Tracker to ensure meal plans respect budget constraints. This helps families control food spending while still getting nutritious, varied meals.

## How It Works

### 1. Budget Retrieval

When generating a meal plan, the Menu Generator:
- Checks if a budget was provided in the input
- If not, fetches the current budget from the Budget Tracker via DynamoDB
- Retrieves both the total budget and current spending
- Calculates the remaining budget available for the week

### 2. AI-Powered Budget-Aware Planning

The budget constraint is passed to the AI (AWS Bedrock Claude) with specific instructions:
- Choose cost-effective ingredients and recipes
- Prioritize affordable proteins (chicken, eggs, beans) over expensive ones
- Use seasonal and common ingredients
- Estimate realistic costs for each meal
- Keep total cost under the budget limit

### 3. Budget Validation

After the meal plan is generated:
- The system calculates the total shopping cost
- Compares it against the budget constraint
- Logs warnings if the budget is exceeded
- The Shopping Agent can further optimize if needed

## Budget Information Flow

```
Input (optional budget) 
    ↓
Budget Tracker (fetch current budget if not provided)
    ↓
Calculate remaining budget = total - spent
    ↓
Pass to AI with budget constraint
    ↓
AI generates cost-conscious meal plan
    ↓
Validate total cost vs budget
    ↓
Shopping Agent optimizes if over budget
```

## Example Usage

### With Explicit Budget

```json
{
  "weekStartDate": "2025-12-02",
  "profiles": [...],
  "inventory": [...],
  "availabilityMatrix": {...},
  "budget": 1200
}
```

The system will use 1200 NOK as the budget constraint.

### Without Budget (Auto-Fetch)

```json
{
  "weekStartDate": "2025-12-02",
  "profiles": [...],
  "inventory": [...],
  "availabilityMatrix": {...}
}
```

The system will:
1. Query the Budget Tracker for the current budget
2. Calculate remaining budget (total - spent)
3. Use the remaining amount as the constraint

## Budget-Conscious Recipe Selection

The AI is instructed to:

1. **Prioritize Cost-Effective Proteins**
   - Chicken, eggs, beans, lentils (cheaper)
   - Reduce beef, seafood, specialty meats (expensive)

2. **Use Common Ingredients**
   - Seasonal vegetables
   - Pantry staples
   - Avoid exotic or specialty items

3. **Optimize Portions**
   - Adjust serving sizes based on who's present
   - Reduce portions when family members are absent

4. **Leverage Inventory**
   - Use existing inventory first (zero cost)
   - Prioritize expiring items to reduce waste

## Budget Validation Output

The system logs budget status:

```
Budget: 800 NOK remaining of 1200 NOK (weekly)
Meal plan within budget: 750 NOK <= 800 NOK
```

Or if over budget:

```
Budget: 800 NOK remaining of 1200 NOK (weekly)
Meal plan exceeds budget: 950 NOK > 800 NOK
Shopping Agent will need to optimize the shopping list
```

## Integration with Budget Tracker

The Menu Generator connects to the Budget Tracker through:

### DynamoDB Table: `budgets`

```typescript
{
  budgetId: 'primary',
  amount: 1200,        // Total budget
  spent: 400,          // Already spent this period
  period: 'weekly',    // or 'monthly'
  startDate: '2025-12-02',
  endDate: '2025-12-08'
}
```

### Repository Method

```typescript
async getCurrentBudget(): Promise<any | null> {
  const result = await docClient.send(new GetCommand({
    TableName: BUDGETS_TABLE,
    Key: { budgetId: 'primary' }
  }));
  return result.Item || null;
}
```

## Cost Estimation

Each meal includes an estimated cost:

```typescript
{
  date: "2025-12-02",
  mealType: "dinner",
  recipeName: "Chicken Stir-Fry",
  cost: 120,  // NOK
  ingredients: [...]
}
```

Shopping list items also include costs:

```typescript
{
  name: "chicken breast",
  quantity: 1,
  unit: "kg",
  estimatedCost: 89  // NOK
}
```

## Benefits

1. **Automatic Budget Adherence**: AI generates plans that respect spending limits
2. **Cost Transparency**: See estimated costs for each meal and ingredient
3. **Smart Optimization**: System prioritizes cost-effective options
4. **Waste Reduction**: Using inventory first reduces both waste and cost
5. **Flexible Constraints**: Works with or without explicit budget input

## Future Enhancements

- Real-time price lookups from Oda API
- Historical cost tracking and trends
- Budget alerts and recommendations
- Cost comparison between recipe alternatives
- Seasonal price optimization
