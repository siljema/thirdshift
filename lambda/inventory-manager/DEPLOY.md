# Inventory Manager Deployment Guide

## Step 1: Install Dependencies

```bash
cd lambda/inventory-manager
npm install
```

## Step 2: Build

```bash
npm run build
```

## Step 3: Package

```bash
npm run package
```

## Step 4: Deploy

```bash
npm run deploy
```

Or manually:

```bash
aws lambda update-function-code \
  --function-name thirdshift-dev-inventory-manager \
  --zip-file fileb://inventory-manager.zip \
  --region us-west-2
```

## Testing

### Test with AWS CLI

```bash
# Add an item
aws lambda invoke \
  --function-name thirdshift-dev-inventory-manager \
  --payload '{"action":"add","data":{"name":"Milk","category":"dairy","quantity":2,"unit":"liters","expirationDate":"2025-12-05","location":"fridge","cost":45}}' \
  --region us-west-2 \
  response.json && cat response.json | jq '.'

# List items
aws lambda invoke \
  --function-name thirdshift-dev-inventory-manager \
  --payload '{"action":"list"}' \
  --region us-west-2 \
  response.json && cat response.json | jq '.'

# Check expiring items
aws lambda invoke \
  --function-name thirdshift-dev-inventory-manager \
  --payload '{"action":"check-expiring"}' \
  --region us-west-2 \
  response.json && cat response.json | jq '.'

# Sync with fridge
aws lambda invoke \
  --function-name thirdshift-dev-inventory-manager \
  --payload '{"action":"sync"}' \
  --region us-west-2 \
  response.json && cat response.json | jq '.'
```

### Check DynamoDB

```bash
aws dynamodb scan \
  --table-name thirdshift-dev-inventory \
  --region us-west-2
```

### View Logs

```bash
aws logs tail /aws/lambda/thirdshift-dev-inventory-manager --follow --region us-west-2
```

## Integration with Step Functions

This Lambda is called by the Step Functions workflow during the weekly planning cycle:

1. **Check Inventory** - Lists current inventory
2. **Identify Expiring Items** - Finds items expiring soon
3. **Sync with Fridge** - Updates from smart fridge device
4. **Remove Expired** - Cleans up expired items

## Next Steps

After deploying:
1. Test basic operations (add, list, update, delete)
2. Test expiration tracking
3. Configure fridge device credentials (optional)
4. Test sync functionality
5. Move on to Task 4: Calendar Analyzer
