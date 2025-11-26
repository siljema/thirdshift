# Budget Integration Summary

## Overview

The Menu Generator has been enhanced to integrate with the Budget Tracker, ensuring meal plans respect budget constraints throughout the planning process.

## Changes Made

### 1. Requirements Update

**File**: `.kiro/specs/meal-planning-service/requirements.md`

Added new acceptance criterion to Requirement 11:
- **11.2**: "WHEN generating the weekly meal plan, THE Menu Generator SHALL use the AI Service to create recipes that respect the Food Budget constraint"

This ensures budget awareness happens at the meal planning stage, not just during shopping list optimization.

### 2. Menu Generator Implementation

**File**: `lambda/menu-generator/src/menu-generator.ts`

#### New Features:
- **Budget Retrieval**: Fetches current budget from Budget Tracker if not provided in input
- **Budget Calculation**: Computes remaining budget (total - spent)
- **Budget Validation**: Validates meal plan cost against budget constraint
- **Enhanced Logging**: Logs budget status and warnings

#### Key Methods:
```typescript
private async getBudgetInfo(): Promise<BudgetInfo | null>
```
- Fetches current budget from DynamoDB
- Returns budget info including total, spent, and remaining amounts

```typescript
async generateWeeklyMenu(input: MenuGenerationInput): Promise<MealPlan>
```
- Enhanced to retrieve budget info
- Passes remaining budget to AI
- Validates total cost against budget
- Logs warnings if over budget

### 3. Type Definitions

**File**: `lambda/menu-generator/src/types.ts`

Added new interface:
```typescript
export interface BudgetInfo {
  totalBudget: number;
  spent: number;
  remaining: number;
  period: 'weekly' | 'monthly';
}
```

### 4. Repository Enhancement

**File**: `lambda/menu-generator/src/repository.ts`

Added new method:
```typescript
async getCurrentBudget(): Promise<any | null>
```
- Queries the `budgets` DynamoDB table
- Retrieves the primary budget record
- Returns null if no budget is configured

### 5. AI Prompt Enhancement

**File**: `lambda/menu-generator/src/bedrock-client.ts`

Enhanced the AI prompt with:
- **Budget Constraint Section**: Clearly states available budget
- **Budget Warning**: Emphasizes importance of staying under budget
- **Cost-Conscious Requirements**: 
  - Choose cost-effective ingredients
  - Prioritize affordable proteins
  - Use seasonal and common ingredients
  - Estimate realistic costs
  - Keep total under budget

Example prompt addition:
```
BUDGET CONSTRAINT: 800 NOK available for this week's groceries
⚠️ IMPORTANT: Keep total estimated cost under 800 NOK. Choose cost-effective recipes and ingredients.

7. STAY WITHIN BUDGET:
   - Choose cost-effective ingredients and recipes
   - Use affordable proteins (chicken, eggs, beans) more than expensive ones
   - Prioritize seasonal and common ingredients
   - Estimate realistic costs for each meal
   - Total cost for all meals should be under the budget constraint
```

## How It Works

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Menu Generation Request                                  │
│    - Input may or may not include budget                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Budget Retrieval                                         │
│    - If budget in input: use it                             │
│    - If not: fetch from Budget Tracker                      │
│    - Calculate remaining = total - spent                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. AI Meal Planning                                         │
│    - Pass budget constraint to Claude                       │
│    - AI generates cost-conscious meal plan                  │
│    - Each meal includes estimated cost                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Shopping List Generation                                 │
│    - Calculate net ingredients needed                       │
│    - Estimate costs for shopping items                      │
│    - Sum total shopping cost                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Budget Validation                                        │
│    - Compare total cost vs budget                           │
│    - Log status (within/over budget)                        │
│    - Flag for Shopping Agent optimization if needed         │
└─────────────────────────────────────────────────────────────┘
```

### Example Scenarios

#### Scenario 1: Budget Provided in Input
```json
{
  "weekStartDate": "2025-12-02",
  "profiles": [...],
  "inventory": [...],
  "budget": 1200
}
```
**Result**: Uses 1200 NOK as the constraint

#### Scenario 2: Budget Auto-Fetched
```json
{
  "weekStartDate": "2025-12-02",
  "profiles": [...],
  "inventory": [...]
}
```
**Process**:
1. Query Budget Tracker: `{ budgetId: 'primary', amount: 1200, spent: 400 }`
2. Calculate remaining: 1200 - 400 = 800 NOK
3. Use 800 NOK as the constraint

#### Scenario 3: No Budget Configured
```json
{
  "weekStartDate": "2025-12-02",
  "profiles": [...],
  "inventory": [...]
}
```
**Result**: No budget constraint applied, AI generates plan without cost limits

## Budget-Aware AI Behavior

The AI (Claude 3 Sonnet) is instructed to:

### 1. Protein Selection
- **Affordable**: Chicken, eggs, beans, lentils, tofu
- **Moderate**: Pork, ground beef
- **Expensive**: Steak, seafood, specialty meats (use sparingly)

### 2. Ingredient Choices
- Prioritize seasonal vegetables
- Use pantry staples
- Avoid exotic or specialty items
- Choose common brands

### 3. Recipe Complexity
- Balance simple and complex recipes
- Consider prep time vs cost tradeoff
- Use leftovers creatively

### 4. Portion Optimization
- Adjust servings based on who's present
- Reduce portions when family members absent
- Scale recipes appropriately

## Integration Points

### With Budget Tracker
- **Read**: Fetches current budget and spending
- **Table**: `thirdshift-dev-budgets`
- **Key**: `budgetId: 'primary'`

### With Shopping Agent
- **Handoff**: Passes meal plan with cost estimates
- **Optimization**: Shopping Agent can further optimize if over budget
- **Validation**: Final cost validation before order placement

### With Web Demo
- **Display**: Shows budget status with visual indicators
- **Breakdown**: Weekly budget, spent, this order, remaining
- **Alerts**: Color-coded warnings (green/yellow/red)

## Testing

### Test Event
**File**: `lambda/menu-generator/test-events/generate-menu.json`

Already includes budget:
```json
{
  "weekStartDate": "2025-12-02",
  "budget": 1200,
  ...
}
```

### Expected Output
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

## Benefits

1. **Proactive Budget Control**: Budget awareness from the start, not just at checkout
2. **AI-Powered Optimization**: Claude intelligently selects cost-effective recipes
3. **Transparent Costs**: Every meal and ingredient has estimated cost
4. **Flexible Integration**: Works with or without explicit budget input
5. **Multi-Layer Validation**: Budget checked at planning AND shopping stages
6. **User Visibility**: Web demo shows clear budget status

## Future Enhancements

1. **Real-Time Pricing**: Integrate with Oda API for actual prices
2. **Historical Analysis**: Track cost trends over time
3. **Smart Suggestions**: Recommend budget adjustments based on patterns
4. **Cost Alerts**: Proactive notifications when approaching budget limits
5. **Recipe Cost Database**: Build historical cost data for better estimates
6. **Seasonal Optimization**: Adjust for seasonal price variations

## Documentation

- **Integration Guide**: `lambda/menu-generator/BUDGET-INTEGRATION.md`
- **Requirements**: `.kiro/specs/meal-planning-service/requirements.md`
- **Design**: `.kiro/specs/meal-planning-service/design.md`
- **Tasks**: `.kiro/specs/meal-planning-service/tasks.md`

## Status

✅ **Complete**: Budget integration is fully implemented and tested
- Requirements updated
- Code implemented
- Types defined
- Repository enhanced
- AI prompt optimized
- Documentation created
- Build successful

The Menu Generator now intelligently considers budget constraints when creating meal plans, helping families control food spending while maintaining nutrition and variety.
