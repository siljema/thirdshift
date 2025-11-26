# Enhanced AI Prompt Example

## What Changed

The Menu Generator now uses **ALL** inventory and calendar data to make smarter meal suggestions!

### Before (Limited Context)
```
EXPIRING INGREDIENTS (PRIORITIZE THESE):
- Milk: 2 liters (expires 2025-12-04)
- Chicken Breast: 1 kg (expires 2025-12-03)

BUDGET: 1200 NOK for the week
```

### After (Full Context)
```
CURRENT INVENTORY:

DAIRY:
  - Milk: 2 liters ⚠️ EXPIRES 2025-12-04
  - Eggs: 12 pieces

MEAT:
  - Chicken Breast: 1 kg ⚠️ EXPIRES 2025-12-03

⚠️ PRIORITY: These items are expiring soon - USE FIRST:
  - Chicken Breast (1 kg) - expires 2025-12-03
  - Milk (2 liters) - expires 2025-12-04

WEEKLY SCHEDULE (who is home and who is cooking):

Monday, Dec 2:
  DINNER: 4 people present (Mom, Dad, Child 1, Child 2)
    Cook: Mom (intermediate level)

Tuesday, Dec 3:
  DINNER: 4 people present (Mom, Dad, Child 1, Child 2)
    Cook: Dad (beginner level)

[... continues for full week ...]

BUDGET: 1200 NOK for the week
```

## How This Improves AI Suggestions

### 1. Inventory Awareness
**Before**: AI only knew about expiring items  
**After**: AI sees ALL inventory organized by category

**Result**: 
- Won't suggest buying eggs when you have 12
- Will use existing ingredients first
- Smarter shopping lists (only what's needed)

### 2. Calendar Integration
**Before**: No calendar data used  
**After**: AI knows who's cooking and their skill level for each day

**Result**:
- Monday (Mom cooking, intermediate): Can suggest complex recipes
- Tuesday (Dad cooking, beginner): Will suggest simple 20-30 min recipes
- Matches difficulty to cook's expertise automatically

### 3. Portion Adjustments
**Before**: Always assumed 4 people  
**After**: Knows exactly who's present each meal

**Result**:
- If only 2 people for dinner: Smaller portions, simpler meals
- If guests present: Larger portions, special considerations
- Reduces food waste from over-cooking

### 4. Smarter Requirements
**Before**: Generic "use expiring ingredients"  
**After**: Specific instructions with context

**New Requirements**:
```
5. USE INVENTORY WISELY:
   - Prioritize expiring ingredients (marked with ⚠️) in the next 1-2 days
   - Use available inventory items before suggesting new purchases
   - Only suggest buying items not in inventory or running low

6. MATCH COOKING TO SCHEDULE:
   - Match recipe difficulty to the assigned cook's expertise level
   - Adjust portion sizes based on who's present (see schedule)
   - If someone is absent, reduce portions or skip their dietary preferences

9. SMART PLANNING:
   - If fewer people for dinner, suggest simpler/smaller meals
   - If beginner cooking, keep it simple (<30 min, <10 steps)
   - If advanced cook, can do complex recipes
   - Use what's in the fridge before it expires!
```

## Example AI Decision Making

### Scenario: Tuesday Dinner
**Context**:
- Dad is cooking (beginner level)
- Chicken breast expires tomorrow
- All 4 family members present
- Child 2 dislikes fish

**AI Will**:
✓ Suggest simple chicken recipe (beginner-friendly)  
✓ Use the expiring chicken breast  
✓ Keep cooking time under 30 minutes  
✓ Avoid fish (Child 2's dislike)  
✓ Make portions for 4 people  

**AI Won't**:
✗ Suggest complex French cuisine  
✗ Ignore the expiring chicken  
✗ Suggest 60-minute recipes  
✗ Include fish dishes  

## Real-World Impact

### Food Waste Reduction
- **Before**: Might suggest buying chicken when you have some expiring
- **After**: Uses expiring chicken first, prevents waste

### Better Cooking Experience
- **Before**: Might suggest complex recipe for beginner cook
- **After**: Matches difficulty to skill level, reduces frustration

### Smarter Shopping
- **Before**: Shopping list might include items you already have
- **After**: Only buys what's actually needed

### Budget Optimization
- **Before**: Might exceed budget with unnecessary purchases
- **After**: Uses existing inventory, stays within budget

## Testing the Enhancement

Run with full context:
```bash
npm run build
USE_BEDROCK=false ./test.sh
```

The AI prompt now includes:
- ✓ Full inventory by category
- ✓ Expiring items highlighted
- ✓ Daily schedule with cook assignments
- ✓ Cooking expertise levels
- ✓ Who's present for each meal
- ✓ Dietary restrictions per person
- ✓ Budget constraints

This makes the AI **significantly smarter** at meal planning!
