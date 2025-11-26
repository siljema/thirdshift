# Budget Usage Guide

## Quick Start

The Menu Generator automatically considers budget constraints when creating meal plans. Here's how to use it:

## Option 1: Provide Budget in Request

```json
{
  "weekStartDate": "2025-12-02",
  "profiles": [...],
  "inventory": [...],
  "availabilityMatrix": {...},
  "budget": 1200
}
```

The system will use **1200 NOK** as the budget constraint.

## Option 2: Auto-Fetch from Budget Tracker

```json
{
  "weekStartDate": "2025-12-02",
  "profiles": [...],
  "inventory": [...],
  "availabilityMatrix": {...}
}
```

The system will:
1. Query the Budget Tracker
2. Get current budget and spending
3. Calculate remaining budget
4. Use remaining amount as constraint

## Option 3: No Budget Constraint

If no budget is provided and none is configured in the Budget Tracker, the system generates a meal plan without cost constraints.

## Setting Up Budget Tracker

To enable automatic budget fetching, create a budget record in DynamoDB:

### Table: `thirdshift-dev-budgets`

```json
{
  "budgetId": "primary",
  "amount": 1200,
  "spent": 0,
  "period": "weekly",
  "startDate": "2025-12-02",
  "endDate": "2025-12-08"
}
```

### Using AWS CLI

```bash
aws dynamodb put-item \
  --table-name thirdshift-dev-budgets \
  --item '{
    "budgetId": {"S": "primary"},
    "amount": {"N": "1200"},
    "spent": {"N": "0"},
    "period": {"S": "weekly"},
    "startDate": {"S": "2025-12-02"},
    "endDate": {"S": "2025-12-08"}
  }'
```

## Understanding Budget Behavior

### Budget Calculation

```
Remaining Budget = Total Budget - Already Spent
```

**Example**:
- Total Budget: 1200 NOK
- Already Spent: 400 NOK
- **Remaining: 800 NOK** ← This is used as the constraint

### AI Optimization

The AI (Claude) will:
- ✅ Choose cost-effective recipes
- ✅ Prioritize affordable proteins (chicken, eggs, beans)
- ✅ Use seasonal and common ingredients
- ✅ Estimate realistic costs for each meal
- ✅ Keep total cost under the budget

### Cost Estimation

Each meal includes an estimated cost:

```json
{
  "date": "2025-12-02",
  "mealType": "dinner",
  "recipeName": "Chicken Stir-Fry",
  "cost": 120,
  "ingredients": [...]
}
```

Shopping list items also have costs:

```json
{
  "name": "chicken breast",
  "quantity": 1,
  "unit": "kg",
  "estimatedCost": 89
}
```

## Budget Validation

After generating the meal plan, the system validates the total cost:

### Within Budget ✅
```
Budget: 800 NOK remaining of 1200 NOK (weekly)
Meal plan within budget: 750 NOK <= 800 NOK
```

### Over Budget ⚠️
```
Budget: 800 NOK remaining of 1200 NOK (weekly)
Meal plan exceeds budget: 950 NOK > 800 NOK
Shopping Agent will need to optimize the shopping list
```

## Budget-Conscious Tips

### 1. Use Inventory First
Items already in your inventory cost nothing! The AI prioritizes:
- Expiring items (use before they spoil)
- Existing ingredients (reduce shopping cost)

### 2. Adjust Portions
The AI automatically adjusts portions based on who's present:
- Fewer people = smaller portions = lower cost
- Absent family members = reduced ingredients

### 3. Protein Selection
The AI balances protein choices:
- **Budget-Friendly**: Chicken, eggs, beans, lentils
- **Moderate**: Pork, ground beef
- **Splurge**: Steak, seafood (used sparingly)

### 4. Seasonal Ingredients
The AI prefers seasonal vegetables and fruits:
- Lower cost
- Better quality
- More sustainable

## Monitoring Budget

### In Logs

Check CloudWatch logs for budget status:

```
[INFO] Found 4 profiles, 12 inventory items, 3 expiring items
[INFO] Budget: 800 NOK remaining of 1200 NOK (weekly)
[INFO] Generating weekly menu with budget constraint: 800 NOK
[INFO] Meal plan within budget: 750 NOK <= 800 NOK
```

### In Web Demo

The web demo shows:
- 📊 Budget bar (visual progress)
- 💰 Weekly budget limit
- 💸 Already spent this week
- 🛒 This order cost
- 💵 Remaining budget

Color coding:
- 🟢 Green: Within budget (< 80%)
- 🟡 Yellow: Warning (80-100%)
- 🔴 Red: Over budget (> 100%)

## Example Scenarios

### Scenario 1: Tight Budget

**Budget**: 600 NOK/week

**AI Behavior**:
- More chicken and eggs
- Fewer expensive proteins
- Simple, affordable recipes
- Bulk ingredients
- Minimal specialty items

### Scenario 2: Comfortable Budget

**Budget**: 1500 NOK/week

**AI Behavior**:
- Variety of proteins
- Some premium ingredients
- More complex recipes
- Specialty items allowed
- Better quality options

### Scenario 3: Mid-Week Budget Check

**Budget**: 1200 NOK/week
**Already Spent**: 800 NOK

**Remaining**: 400 NOK

**AI Behavior**:
- Very cost-conscious
- Simple meals
- Use inventory heavily
- Minimal new purchases
- Focus on essentials

## Troubleshooting

### Budget Not Being Applied

**Check**:
1. Is budget provided in request?
2. Is budget configured in DynamoDB?
3. Check CloudWatch logs for budget retrieval errors

### Costs Too High

**Solutions**:
1. Reduce budget constraint
2. Add more inventory items
3. Adjust family preferences to include more affordable options
4. Check if all family members are present (reduce portions if not)

### Costs Too Low

**Check**:
1. Are cost estimates realistic?
2. Is inventory being counted correctly?
3. Are all meals being generated?

## API Reference

### Input Schema

```typescript
interface MenuGenerationInput {
  profiles: Profile[];
  inventory: InventoryItem[];
  availabilityMatrix: AvailabilityMatrix;
  budget?: number;  // Optional: NOK amount
  weekStartDate?: string;
}
```

### Budget Info Schema

```typescript
interface BudgetInfo {
  totalBudget: number;    // Total budget for period
  spent: number;          // Already spent
  remaining: number;      // Available for this order
  period: 'weekly' | 'monthly';
}
```

### Output Schema

```typescript
interface MealPlan {
  mealPlanId: string;
  weekStartDate: string;
  weekEndDate: string;
  meals: Meal[];          // Each meal has 'cost' field
  inventoryUsage: InventoryUsage[];
  shoppingList: ShoppingItem[];  // Each item has 'estimatedCost'
  totalCost: number;      // Total shopping cost
  status: 'draft' | 'approved' | 'active';
  createdAt: string;
}
```

## Best Practices

1. **Set Realistic Budgets**: Base on historical spending
2. **Update Regularly**: Keep budget records current
3. **Monitor Trends**: Track spending over time
4. **Adjust Seasonally**: Prices vary by season
5. **Include Buffer**: Add 10-15% buffer for price variations
6. **Review Estimates**: Compare estimated vs actual costs
7. **Optimize Inventory**: Keep inventory updated to maximize savings

## Support

For issues or questions:
- Check CloudWatch logs: `/aws/lambda/thirdshift-dev-menu-generator`
- Review documentation: `BUDGET-INTEGRATION.md`
- Test with: `test-events/generate-menu.json`
