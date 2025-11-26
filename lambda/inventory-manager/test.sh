#!/bin/bash

echo "=== Testing Inventory Manager Lambda ==="
echo ""

# Test 1: Add an item
echo "Test 1: Adding milk to inventory..."
aws lambda invoke \
  --function-name thirdshift-dev-inventory-manager \
  --payload file://test-events/add-item.json \
  --region us-west-2 \
  response.json

echo "Response:"
cat response.json | jq '.'
echo ""

# Test 2: List items
echo "Test 2: Listing all inventory items..."
aws lambda invoke \
  --function-name thirdshift-dev-inventory-manager \
  --payload file://test-events/list-items.json \
  --region us-west-2 \
  response.json

echo "Response:"
cat response.json | jq '.'
echo ""

# Test 3: Check expiring items
echo "Test 3: Checking for expiring items..."
aws lambda invoke \
  --function-name thirdshift-dev-inventory-manager \
  --payload file://test-events/check-expiring.json \
  --region us-west-2 \
  response.json

echo "Response:"
cat response.json | jq '.'
echo ""

# Test 4: Sync with fridge
echo "Test 4: Syncing with fridge device..."
aws lambda invoke \
  --function-name thirdshift-dev-inventory-manager \
  --payload file://test-events/sync-fridge.json \
  --region us-west-2 \
  response.json

echo "Response:"
cat response.json | jq '.'
echo ""

# Test 5: Check DynamoDB
echo "Test 5: Checking DynamoDB table..."
aws dynamodb scan \
  --table-name thirdshift-dev-inventory \
  --region us-west-2 \
  --max-items 5

echo ""
echo "=== All tests complete ==="
