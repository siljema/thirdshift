# Inventory Usage Feature

## Overview

The Menu Generator now includes a detailed breakdown of what ingredients will be used from your current inventory vs. what needs to be purchased.

## What's New

### 1. Inventory Usage List

Shows exactly what you'll use from your fridge/pantry:

```json
{
  "inventoryUsage": [
    {
      "name": "Milk",
      "quantityUsed": 2,
      "unit": "liters",
      "category": "dairy",
      "fromInventory": 2,
      "expirationDate": "2025-12-04",
      "isExpiring": true
    },
    {
      "name": "Eggs",
      "quantityUsed": 8,
      "unit": "pieces",
      "category": "dairy",
      "fromInventory": 12,
      "expirationDate": "2025-12-10",
      "isExpiring": false
    }
  ]
}
```

### 2. Smart Shopping List

Only shows what you need to buy (after subtracting inventory):

```json
{
  "shoppingList": [
    {
      "name": "Chicken Breast",
      "quantity": 1,
      "unit": "kg",
      "category": "meat",
      "estimatedCost": 90
    }
  ]
}
```

## Benefits

### ✅ Reduce Food Waste
- See exactly what inventory items will be used
- Prioritize expiring items (marked with ⚠️)
- Know what's left after the week

### ✅ Smarter Shopping
- Only buy what you actually need
- Avoid duplicate purchases
- Save money by using what you have

### ✅ Better Planning
- Track inventory depletion
- Plan when to restock
- Understand consumption patterns

## Example Output

### Inventory Usage Section
```
📦 Using from Inventory

✓ Milk - Using 2 liters (have 2) - Expires: Dec 4 ⚠️
✓ Eggs - Using 8 pieces (have 12) - Expires: Dec 10
✓ Chicken Breast - Using 1 kg (have 1) - Expires: Dec 3 ⚠️
```

### Shopping List Section
```
🛒 Shopping List (Need to Buy)

Chicken Breast - 1 kg - 90 NOK
Salmon Fillets - 800 g - 150 NOK
Ground Beef - 500 g - 85 NOK
...
```

## How It Works

1. **Aggregate Ingredients**: Sum all ingredients needed from all meals
2. **Match Inventory**: Check what's available in current inventory
3. **Calculate Usage**: Determine how much of each item will be used
4. **Build Shopping List**: Only include items not fully covered by inventory

### Algorithm

```typescript
For each ingredient needed:
  If ingredient exists in inventory:
    usedFromInventory = min(needed, available)
    Add to inventoryUsage list
    needed -= usedFromInventory
  
  If needed > 0:
    Add remaining to shopping list
```

## Web Demo Display

The web demo now shows two sections:

1. **Using from Inventory** (green border)
   - Items you already have
   - Expiring items highlighted in red ⚠️
   - Shows quantity used vs. quantity available

2. **Shopping List** (blue border)
   - Only items you need to buy
   - Quantities adjusted for what you have
   - Cost estimates

## API Response Structure

```json
{
  "mealPlanId": "uuid",
  "weekStartDate": "2025-12-02",
  "weekEndDate": "2025-12-08",
  "meals": [...],
  "inventoryUsage": [
    {
      "name": "Milk",
      "quantityUsed": 2,
      "unit": "liters",
      "category": "dairy",
      "fromInventory": 2,
      "expirationDate": "2025-12-04",
      "isExpiring": true
    }
  ],
  "shoppingList": [
    {
      "name": "Chicken Breast",
      "quantity": 1,
      "unit": "kg",
      "category": "meat",
      "estimatedCost": 90
    }
  ],
  "totalCost": 850,
  "status": "draft"
}
```

## Visual Indicators

- ✓ **Green checkmark**: Item from inventory
- ⚠️ **Red warning**: Expiring soon (within 3 days)
- 🛒 **Shopping cart**: Need to purchase

## Future Enhancements

- [ ] Show remaining inventory after week
- [ ] Suggest when to restock items
- [ ] Track inventory accuracy over time
- [ ] Predict when items will run out
- [ ] Suggest bulk buying opportunities

## Testing

Test with the web demo:

```bash
cd web-demo
python3 -m http.server 8080
# Open http://localhost:8080
# Click "Generate Weekly Menu"
```

You'll see:
1. Calendar with 17 meals
2. Inventory usage section (what you're using)
3. Shopping list section (what to buy)

---

**Status**: ✅ Implemented  
**Date**: 2025-11-26  
**Impact**: Better inventory management and reduced food waste
