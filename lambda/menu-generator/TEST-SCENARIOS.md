# Menu Generator Test Scenarios

## Overview

The test event includes realistic calendar scenarios to verify the AI adapts meal planning based on who's present.

## Test Scenarios

### Scenario 1: Monday Dinner - Child Away 🏃
**Date**: December 2, 2025

**Calendar Event**: Child 1 at sleepover

**Expected Behavior**:
- Only 3 people for dinner (Mom, Dad, Child 2)
- Reduce portion sizes from 4 to 3 servings
- Adjust ingredient quantities accordingly
- Lower cost estimate

**AI Prompt Context**:
```
Monday, Dec 2:
  DINNER: 3 people present (Mom, Dad, Child 2)
    Cook: Mom (intermediate level)
    Absent: Child 1
    Special: Child 1 at sleepover - only 3 people for dinner
```

**Expected Output**:
```json
{
  "date": "2025-12-02",
  "mealType": "dinner",
  "recipeName": "Gluten-Free Chicken Stir-Fry",
  "servings": 3,
  "cookingTime": 25,
  "difficulty": "intermediate",
  "estimatedCost": 90
}
```

---

### Scenario 2: Wednesday Dinner - Extra Guest 👥
**Date**: December 4, 2025

**Calendar Event**: Guest visiting for dinner

**Guest Profile**:
- Name: Guest
- Type: Adult
- Dietary: Vegetarian
- Preferences: Mediterranean

**Expected Behavior**:
- 5 people for dinner (Mom, Dad, Child 1, Child 2, Guest)
- Increase portion sizes from 4 to 5 servings
- **MUST be vegetarian** (guest's dietary restriction)
- Consider guest's Mediterranean preference
- Higher cost estimate

**AI Prompt Context**:
```
Wednesday, Dec 4:
  DINNER: 5 people present (Mom, Dad, Child 1, Child 2, Guest)
    Cook: Mom (intermediate level)
    Special: Extra guest for dinner - 5 people total

FAMILY PROFILE:
- Guest: adult, age 35
  Dietary restrictions: vegetarian
  Preferences: mediterranean
```

**Expected Output**:
```json
{
  "date": "2025-12-04",
  "mealType": "dinner",
  "recipeName": "Mediterranean Vegetable Pasta",
  "servings": 5,
  "cookingTime": 30,
  "difficulty": "intermediate",
  "estimatedCost": 130,
  "specialNotes": "Vegetarian for guest"
}
```

---

### Scenario 3: Friday Lunch - Field Trip 🚌
**Date**: December 6, 2025

**Calendar Event**: Child 1 on field trip (lunch provided by school)

**Expected Behavior**:
- Only pack 1 school lunch (for Child 2)
- Child 1 doesn't need lunch packed
- Reduce school lunch count from 2 to 1
- Lower lunch prep cost

**AI Prompt Context**:
```
Friday, Dec 6:
  LUNCH: 4 people present (Mom, Dad, Child 1, Child 2)
    Cook: Dad
    Special: Child 1 on field trip - lunch provided by school, 
             only pack lunch for Child 2
```

**Expected Output**:
```json
{
  "date": "2025-12-06",
  "mealType": "school_lunch",
  "recipeName": "Sandwich and Fruit (Child 2 only)",
  "servings": 1,
  "cookingTime": 10,
  "difficulty": "beginner",
  "estimatedCost": 42,
  "specialNotes": "Child 1 on field trip - no lunch needed"
}
```

---

### Scenario 4: Regular Days - Full Family 👨‍👩‍👧‍👦
**Dates**: Dec 3, 5, 7, 8

**Expected Behavior**:
- 4 people for all meals
- Standard portion sizes
- Vary cooking difficulty based on assigned cook
- No special dietary considerations beyond family allergies

---

## Full Week Calendar

| Day | Date | Dinner Attendees | Cook | Special Notes |
|-----|------|------------------|------|---------------|
| Mon | Dec 2 | 3 (Child 1 away) | Mom | Sleepover |
| Tue | Dec 3 | 4 (all family) | Dad | Normal |
| Wed | Dec 4 | 5 (+ Guest) | Mom | Vegetarian guest |
| Thu | Dec 5 | 4 (all family) | Dad | Normal |
| Fri | Dec 6 | 4 (all family) | Mom | Child 1 field trip - only 1 school lunch |
| Sat | Dec 7 | 4 (all family) | Dad | Normal |
| Sun | Dec 8 | 4 (all family) | Mom | Normal |

## Testing the Scenarios

### Option 1: Local Test (Mock Mode)

```bash
cd lambda/menu-generator
npm run build
USE_BEDROCK=false node -e "
const { handler } = require('./dist/index');
const event = require('./test-events/generate-menu.json');
handler(event).then(r => {
  const body = JSON.parse(r.body);
  const meals = body.mealPlan.meals.filter(m => m.mealType === 'dinner');
  
  console.log('Monday (3 people):', meals[0].servings, 'servings');
  console.log('Wednesday (5 people):', meals[2].servings, 'servings');
}).catch(console.error);
"
```

### Option 2: With Bedrock AI

```bash
cd lambda/menu-generator
npm run build
npm run package

# Deploy
aws lambda update-function-code \
  --function-name thirdshift-dev-menu-generator \
  --zip-file fileb://menu-generator.zip \
  --region us-west-2

# Enable Bedrock
aws lambda update-function-configuration \
  --function-name thirdshift-dev-menu-generator \
  --environment "Variables={USE_BEDROCK=true,...}" \
  --region us-west-2

# Test
aws lambda invoke \
  --function-name thirdshift-dev-menu-generator \
  --payload file://test-events/generate-menu.json \
  --region us-west-2 \
  response.json

# Check results
cat response.json | jq '.body | fromjson | .mealPlan.meals[] | select(.mealType=="dinner") | {date, recipeName, servings}'
```

### Option 3: Web Demo

```bash
cd web-demo
python3 -m http.server 8080
# Open http://localhost:8080
# Click "Generate Weekly Menu"
```

Look for:
- **Monday**: 3 servings, lower cost
- **Wednesday**: 5 servings, vegetarian recipe, higher cost

## Expected AI Behavior

### Smart Portion Adjustment

The AI should:
1. ✅ Reduce portions when people are absent
2. ✅ Increase portions when guests are present
3. ✅ Adjust ingredient quantities proportionally
4. ✅ Update cost estimates accordingly

### Dietary Adaptation

The AI should:
1. ✅ Make Wednesday's meal vegetarian (guest requirement)
2. ✅ Still respect family allergies (peanuts for children)
3. ✅ Consider guest's Mediterranean preference
4. ✅ Ensure meal works for everyone present

### Cost Optimization

Expected costs:
- **Monday (3 people)**: ~90 NOK (25% less than normal)
- **Normal days (4 people)**: ~120 NOK
- **Wednesday (5 people)**: ~130 NOK (25% more than normal)

## Validation Checklist

After running the test, verify:

- [ ] Monday dinner has 3 servings (not 4)
- [ ] Wednesday dinner has 5 servings (not 4)
- [ ] Wednesday dinner is vegetarian
- [ ] Friday has only 1 school lunch (not 2)
- [ ] Total school lunches = 9 (not 10)
- [ ] Costs are adjusted proportionally
- [ ] Shopping list reflects correct quantities
- [ ] Inventory usage is calculated correctly
- [ ] All meals respect family allergies (peanuts)
- [ ] Cooking difficulty matches assigned cook

## Mock Data Results

The web demo shows:
```
Monday, Dec 2:
  Gluten-Free Chicken Stir-Fry (3 servings) - 90 NOK
  
Wednesday, Dec 4:
  Mediterranean Vegetable Pasta (Guest-Friendly) (5 servings) - 130 NOK
  
Friday, Dec 6:
  Only 1 school lunch (Child 2) - Child 1 on field trip
```

## Real Bedrock AI Results

When Bedrock is enabled, expect creative variations like:
- Monday: "Quick Chicken Tacos for Three"
- Wednesday: "Mediterranean Mezze Platter for Five"

The AI will generate unique recipes while respecting all constraints!

---

**Status**: ✅ Test scenarios configured  
**Date**: 2025-11-26  
**Purpose**: Verify AI adapts to calendar changes
