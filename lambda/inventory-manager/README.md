# Inventory Manager Lambda Function

This Lambda function manages food inventory, tracks expiration dates, syncs with fridge devices, and handles consumption tracking.

## Features

- Add, update, delete inventory items
- Track expiration dates with GSI queries
- Sync with smart fridge devices
- Consume items and update quantities
- Check for expiring items (within 3 days)
- Automatically remove expired items and log waste
- Integration with fridge IoT devices

## Setup

```bash
npm install
npm run build
npm run package
npm run deploy
```

## Actions

The Lambda function is invoked with an event containing an `action` field:

### Add Item

```json
{
  "action": "add",
  "data": {
    "name": "Milk",
    "category": "dairy",
    "quantity": 2,
    "unit": "liters",
    "expirationDate": "2025-12-05",
    "location": "fridge",
    "cost": 45.00
  }
}
```

### Get Item

```json
{
  "action": "get",
  "itemId": "uuid-here"
}
```

### Update Item

```json
{
  "action": "update",
  "itemId": "uuid-here",
  "data": {
    "quantity": 1.5,
    "notes": "Half consumed"
  }
}
```

### Delete Item

```json
{
  "action": "delete",
  "itemId": "uuid-here"
}
```

### List All Items

```json
{
  "action": "list"
}
```

### Sync with Fridge

```json
{
  "action": "sync"
}
```

Syncs inventory with smart fridge device.

### Consume Item

```json
{
  "action": "consume",
  "data": {
    "itemId": "uuid-here",
    "quantityUsed": 0.5,
    "mealPlanId": "optional-meal-plan-id"
  }
}
```

### Check Expiring Items

```json
{
  "action": "check-expiring"
}
```

Returns items expiring within 3 days.

### Remove Expired Items

```json
{
  "action": "remove-expired"
}
```

Removes expired items and logs waste events.

## Categories

- `dairy` - Milk, cheese, yogurt
- `meat` - Meat, chicken, fish
- `produce` - Fruits, vegetables
- `grains` - Bread, rice, pasta
- `pantry` - Canned goods, spices
- `frozen` - Frozen foods
- `beverages` - Drinks
- `other` - Everything else

## Locations

- `fridge` - Refrigerator
- `freezer` - Freezer
- `pantry` - Pantry/cupboard
- `counter` - Counter/room temperature

## Environment Variables

- `INVENTORY_TABLE` - DynamoDB table name (default: `thirdshift-dev-inventory`)
- `FRIDGE_SECRET` - Secrets Manager secret name for fridge credentials
- `ENVIRONMENT` - Environment name (dev, staging, prod)

## Fridge Integration

The function can integrate with smart fridge devices. Configure credentials in Secrets Manager:

```json
{
  "api_key": "your-fridge-api-key",
  "device_id": "your-device-id"
}
```

## Waste Tracking

When items expire, waste events are logged with:
- Item details
- Quantity wasted
- Cost (if available)
- Expiration date
- Reason (expired, spoiled, other)
