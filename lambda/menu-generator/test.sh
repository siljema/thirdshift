#!/bin/bash

# Test script for Menu Generator Lambda

echo "Testing Menu Generator Lambda..."
echo "================================"

# Set environment variables for testing
export USE_BEDROCK=false
export MEAL_PLANS_TABLE=thirdshift-dev-meal-plans
export PROFILES_TABLE=thirdshift-dev-profiles
export INVENTORY_TABLE=thirdshift-dev-inventory
export MEAL_PLANS_BUCKET=thirdshift-dev-meal-plans
export AWS_REGION=us-west-2

# Build the Lambda
echo "Building Lambda..."
npm run build

if [ $? -ne 0 ]; then
  echo "Build failed!"
  exit 1
fi

echo "Build successful!"
echo ""

# Test with mock data (no Bedrock)
echo "Test 1: Generate menu with mock data (Bedrock disabled)"
echo "--------------------------------------------------------"
node -e "
const { handler } = require('./dist/index');
const event = require('./test-events/generate-menu.json');

handler(event).then(result => {
  console.log('Response:', JSON.stringify(result, null, 2));
  if (result.statusCode === 200) {
    console.log('✓ Test passed!');
  } else {
    console.log('✗ Test failed!');
    process.exit(1);
  }
}).catch(err => {
  console.error('✗ Test failed with error:', err);
  process.exit(1);
});
"

echo ""
echo "All tests completed!"
